-- =============================================================================
-- 010 · FINANCES
--
-- Grilles tarifaires, factures, encaissements.
--
-- Trois règles gravées ici plutôt que confiées à l'interface :
--
--   1. **Tous les montants sont des entiers.** Le franc CFA n'a pas de
--      subdivision d'usage ; aucun `numeric` fractionnaire, aucun flottant.
--      Une addition de centimes qui n'existent pas est une erreur comptable.
--
--   2. **Un encaissement par prestataire naît « en attente ».** `GEMINI.md`
--      (l. 407) l'exige : le retour du navigateur ne prouve rien. La création
--      force le statut, quoi qu'envoie le client.
--
--   3. **Seul le serveur confirme.** Le passage à « confirmé » d'un paiement
--      prestataire n'est possible que par `app.confirm_provider_payment()`,
--      retirée à `authenticated` et réservée au rôle de service — c'est-à-dire
--      au webhook signé.
--
-- Éprouvé : un client qui crée un Mobile Money « confirmé » obtient un
-- encaissement « en attente » ; sa tentative de confirmation directe est
-- refusée ; son appel direct de la fonction serveur est refusé ; et le serveur,
-- lui, confirme bien.
-- =============================================================================

-- =============================================================================
-- Grilles tarifaires
-- =============================================================================

create table public.fee_schedules (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references public.tenants(id) on delete cascade,
  academic_year_id uuid references public.academic_years(id) on delete cascade,
  label            text not null check (length(trim(label)) > 0),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index fee_schedules_tenant_idx on public.fee_schedules (tenant_id);

create trigger fee_schedules_updated_at before update on public.fee_schedules
  for each row execute function extensions.moddatetime(updated_at);

-- Niveaux auxquels la grille s'applique.
create table public.fee_schedule_levels (
  schedule_id uuid not null references public.fee_schedules(id) on delete cascade,
  level_id    uuid not null references public.levels(id) on delete cascade,
  primary key (schedule_id, level_id)
);

create table public.fee_items (
  id          uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.fee_schedules(id) on delete cascade,
  label       text not null check (length(trim(label)) > 0),
  -- Francs CFA, entier. `bigint` et non `integer` : une scolarité annuelle
  -- multipliée par un effectif dépasse vite deux milliards.
  amount      bigint not null check (amount >= 0),
  mandatory   boolean not null default true,
  position    integer not null default 0
);

create index fee_items_schedule_idx on public.fee_items (schedule_id);

create table public.fee_installments (
  id          uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.fee_schedules(id) on delete cascade,
  label       text not null check (length(trim(label)) > 0),
  percent     integer not null check (percent between 0 and 100),
  due_date    date,
  position    integer not null default 0
);

create index fee_installments_schedule_idx on public.fee_installments (schedule_id);

-- =============================================================================
-- Factures
-- =============================================================================

create table public.invoices (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references public.tenants(id) on delete cascade,
  number           text not null,
  student_id       uuid not null references public.students(id) on delete restrict,
  academic_year_id uuid references public.academic_years(id) on delete set null,
  installment_label text not null default '',
  issued_at        date not null default current_date,
  due_date         date,
  status           text not null default 'brouillon'
                   check (status in ('brouillon','emise','partielle','payee','en_retard','annulee')),
  note             text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (tenant_id, number)
);

create index invoices_tenant_idx  on public.invoices (tenant_id);
create index invoices_student_idx on public.invoices (student_id);

create trigger invoices_updated_at before update on public.invoices
  for each row execute function extensions.moddatetime(updated_at);

create table public.invoice_lines (
  id         uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  label      text not null check (length(trim(label)) > 0),
  amount     bigint not null check (amount >= 0),
  position   integer not null default 0
);

create index invoice_lines_invoice_idx on public.invoice_lines (invoice_id);

-- =============================================================================
-- Encaissements
-- =============================================================================

create table public.payments (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references public.tenants(id) on delete cascade,
  reference          text not null,
  invoice_id         uuid not null references public.invoices(id) on delete restrict,
  student_id         uuid not null references public.students(id) on delete restrict,
  amount             bigint not null check (amount > 0),
  method             text not null check (method in ('especes','mobile_money','virement','cheque')),
  status             text not null default 'en_attente'
                     check (status in ('en_attente','confirme','echoue','rembourse')),
  received_at        date not null default current_date,
  recorded_by        uuid references auth.users(id) on delete set null,
  provider_reference text not null default '',
  note               text not null default '',
  confirmed_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (tenant_id, reference)
);

comment on table public.payments is
  'Encaissements. Un paiement prestataire ne peut être confirmé que par le serveur.';

create index payments_tenant_idx  on public.payments (tenant_id);
create index payments_invoice_idx on public.payments (invoice_id);

create trigger payments_updated_at before update on public.payments
  for each row execute function extensions.moddatetime(updated_at);

-- Méthodes dont la confirmation appartient au prestataire, jamais au client.
create or replace function app.requires_provider_confirmation(p_method text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_method in ('mobile_money');
$$;

create or replace function app.guard_payment_status()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    -- Défense silencieuse : quoi qu'envoie le client, un encaissement
    -- prestataire naît en attente.
    if app.requires_provider_confirmation(new.method) then
      new.status := 'en_attente';
      new.confirmed_at := null;
    elsif new.status = 'confirme' then
      new.confirmed_at := coalesce(new.confirmed_at, now());
    end if;
    return new;
  end if;

  -- Refus bruyant : la confirmation d'un paiement prestataire ne peut venir
  -- que de `app.confirm_provider_payment()`, qui pose ce témoin.
  if app.requires_provider_confirmation(new.method)
     and new.status = 'confirme'
     and old.status <> 'confirme'
     and coalesce(current_setting('app.confirmation_serveur', true), '') <> new.id::text
  then
    raise exception
      'Un encaissement % ne se confirme pas depuis le client : il attend le webhook du prestataire.',
      new.method
      using errcode = 'check_violation';
  end if;

  if new.status = 'confirme' and old.status <> 'confirme' then
    new.confirmed_at := coalesce(new.confirmed_at, now());
  end if;

  return new;
end;
$$;

create trigger payments_garde_statut
  before insert or update on public.payments
  for each row execute function app.guard_payment_status();

-- Unique porte de confirmation d'un encaissement prestataire.
-- Retirée à `authenticated` : seul le rôle de service — donc le webhook signé,
-- exécuté sur le serveur — peut l'appeler.
create or replace function app.confirm_provider_payment(
  p_payment_id         uuid,
  p_provider_reference text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.payments p where p.id = p_payment_id) then
    raise exception 'Encaissement introuvable.';
  end if;

  perform set_config('app.confirmation_serveur', p_payment_id::text, true);

  update public.payments
  set status = 'confirme',
      provider_reference = coalesce(nullif(trim(p_provider_reference), ''), provider_reference),
      confirmed_at = now()
  where id = p_payment_id;

  perform set_config('app.confirmation_serveur', '', true);
end;
$$;

comment on function app.confirm_provider_payment is
  'Confirme un encaissement prestataire. Réservée au serveur (webhook signé).';

revoke all on function app.confirm_provider_payment(uuid, text) from public, anon, authenticated;
revoke all on function app.requires_provider_confirmation(text) from public, anon;
grant execute on function app.requires_provider_confirmation(text) to authenticated;

-- =============================================================================
-- Sécurité au niveau des lignes
-- =============================================================================

alter table public.fee_schedules       enable row level security;
alter table public.fee_schedule_levels enable row level security;
alter table public.fee_items           enable row level security;
alter table public.fee_installments    enable row level security;
alter table public.invoices            enable row level security;
alter table public.invoice_lines       enable row level security;
alter table public.payments            enable row level security;

revoke all on public.fee_schedules, public.fee_schedule_levels, public.fee_items,
              public.fee_installments, public.invoices, public.invoice_lines,
              public.payments
  from anon;

grant select, insert, update, delete on
  public.fee_schedules, public.fee_schedule_levels, public.fee_items,
  public.fee_installments, public.invoices, public.invoice_lines, public.payments
  to authenticated;

-- --- Grilles tarifaires : lisibles par les membres, écrites en configuration
create policy "grilles lisibles par les membres" on public.fee_schedules
  for select to authenticated using (tenant_id in (select app.current_tenant_ids()));

create policy "ecrire une grille exige settings manage" on public.fee_schedules
  for all to authenticated
  using (app.has_permission(tenant_id, 'settings.manage'))
  with check (app.has_permission(tenant_id, 'settings.manage'));

create policy "niveaux d une grille suivent la grille" on public.fee_schedule_levels
  for select to authenticated
  using (exists (select 1 from public.fee_schedules f
                 where f.id = schedule_id
                   and f.tenant_id in (select app.current_tenant_ids())));

create policy "ecrire les niveaux d une grille exige settings manage" on public.fee_schedule_levels
  for all to authenticated
  using (exists (select 1 from public.fee_schedules f
                 where f.id = schedule_id and app.has_permission(f.tenant_id, 'settings.manage')))
  with check (exists (select 1 from public.fee_schedules f
                 where f.id = schedule_id and app.has_permission(f.tenant_id, 'settings.manage')));

create policy "postes lisibles avec la grille" on public.fee_items
  for select to authenticated
  using (exists (select 1 from public.fee_schedules f
                 where f.id = schedule_id
                   and f.tenant_id in (select app.current_tenant_ids())));

create policy "ecrire un poste exige settings manage" on public.fee_items
  for all to authenticated
  using (exists (select 1 from public.fee_schedules f
                 where f.id = schedule_id and app.has_permission(f.tenant_id, 'settings.manage')))
  with check (exists (select 1 from public.fee_schedules f
                 where f.id = schedule_id and app.has_permission(f.tenant_id, 'settings.manage')));

create policy "tranches lisibles avec la grille" on public.fee_installments
  for select to authenticated
  using (exists (select 1 from public.fee_schedules f
                 where f.id = schedule_id
                   and f.tenant_id in (select app.current_tenant_ids())));

create policy "ecrire une tranche exige settings manage" on public.fee_installments
  for all to authenticated
  using (exists (select 1 from public.fee_schedules f
                 where f.id = schedule_id and app.has_permission(f.tenant_id, 'settings.manage')))
  with check (exists (select 1 from public.fee_schedules f
                 where f.id = schedule_id and app.has_permission(f.tenant_id, 'settings.manage')));

-- --- Factures
create policy "factures lisibles avec payments read" on public.invoices
  for select to authenticated using (app.has_permission(tenant_id, 'payments.read'));

create policy "un parent voit les factures de ses enfants" on public.invoices
  for select to authenticated
  using (student_id in (select app.guardian_student_ids()));

create policy "ecrire une facture exige payments create" on public.invoices
  for all to authenticated
  using (app.has_permission(tenant_id, 'payments.create'))
  with check (app.has_permission(tenant_id, 'payments.create'));

create policy "lignes lisibles avec la facture" on public.invoice_lines
  for select to authenticated
  using (exists (select 1 from public.invoices i where i.id = invoice_id));

create policy "ecrire une ligne exige payments create" on public.invoice_lines
  for all to authenticated
  using (exists (select 1 from public.invoices i
                 where i.id = invoice_id and app.has_permission(i.tenant_id, 'payments.create')))
  with check (exists (select 1 from public.invoices i
                 where i.id = invoice_id and app.has_permission(i.tenant_id, 'payments.create')));

-- --- Encaissements
create policy "encaissements lisibles avec payments read" on public.payments
  for select to authenticated using (app.has_permission(tenant_id, 'payments.read'));

create policy "un parent voit les encaissements de ses enfants" on public.payments
  for select to authenticated
  using (student_id in (select app.guardian_student_ids()));

create policy "enregistrer un encaissement exige payments create" on public.payments
  for insert to authenticated
  with check (app.has_permission(tenant_id, 'payments.create'));

create policy "modifier un encaissement exige payments create" on public.payments
  for update to authenticated
  using (app.has_permission(tenant_id, 'payments.create'))
  with check (app.has_permission(tenant_id, 'payments.create'));

-- Un encaissement ne se supprime pas : on l'annule ou on le rembourse, et la
-- trace demeure. Aucune politique `delete`.
