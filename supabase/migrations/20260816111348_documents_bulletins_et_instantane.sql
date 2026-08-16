-- =============================================================================
-- 009 · DOCUMENTS ET BULLETINS
--
-- Gabarits, signature d'établissement, bulletins et pièces jointes des élèves.
--
-- La règle centrale : un bulletin publié est **figé**. Son contenu, son
-- gabarit et sa signature sont recopiés dans un instantané au moment de la
-- publication. Rééditer en 2030 un bulletin publié en 2026 doit produire
-- exactement le même document, quelles qu'aient été les évolutions de la
-- grille de notation ou du modèle entre-temps.
--
-- C'est l'immuabilité par instantané posée en phase A, ici tenue par la base.
-- Vérifié : après refonte complète du gabarit d'établissement (couleur, titre,
-- signataire), le bulletin publié conserve sa couleur d'origine et le nom du
-- signataire d'alors.
-- =============================================================================

-- =============================================================================
-- Gabarits de documents
-- =============================================================================

create table public.document_templates (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references public.tenants(id) on delete cascade,
  variant            text not null check (variant in ('report','card')),
  kind               text not null default 'composed' check (kind in ('composed','overlay')),
  document_title     text not null default '',
  footer_text        text not null default '',
  accent_color       text not null default '#7c3aed' check (accent_color ~ '^#[0-9a-fA-F]{6}$'),
  background_opacity integer not null default 100
                     check (background_opacity between 0 and 100),
  -- Colonnes visibles du tableau de notes.
  columns            text[] not null default '{}',
  -- Images : `{name, path, size}`. Le contenu ira dans Supabase Storage ;
  -- la base ne conserve que la référence, jamais l'octet.
  background         jsonb not null default '{}'::jsonb,
  logo               jsonb not null default '{}'::jsonb,
  stamp              jsonb not null default '{}'::jsonb,
  reference_file     jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (tenant_id, variant)
);

comment on table public.document_templates is
  'Configuration structurée d''un document. Jamais une mise en page déduite d''un fichier.';

create index document_templates_tenant_idx on public.document_templates (tenant_id);

create trigger document_templates_updated_at before update on public.document_templates
  for each row execute function extensions.moddatetime(updated_at);

-- =============================================================================
-- Signature d'établissement
-- =============================================================================

create table public.signatures (
  tenant_id   uuid primary key references public.tenants(id) on delete cascade,
  signer_name text not null default '',
  signer_role text not null default 'Chef d''établissement',
  image       jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.signatures is
  'Signature par défaut du chef d''établissement. Une par établissement.';

create trigger signatures_updated_at before update on public.signatures
  for each row execute function extensions.moddatetime(updated_at);

-- =============================================================================
-- Bulletins
-- =============================================================================

create table public.report_cards (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references public.tenants(id) on delete cascade,
  student_id         uuid not null references public.students(id) on delete cascade,
  class_id           uuid not null references public.classes(id) on delete cascade,
  period_id          uuid references public.periods(id) on delete set null,
  academic_year_id   uuid references public.academic_years(id) on delete set null,
  status             text not null default 'brouillon'
                     check (status in ('brouillon','genere','publie')),
  -- Instantané complet : identité, notes, moyennes, rang, gabarit, signature.
  snapshot           jsonb,
  council_comment    text not null default '',
  signature_override jsonb,
  generated_at       timestamptz,
  published_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (student_id, period_id),
  -- Un bulletin publié sans instantané n'aurait rien figé du tout.
  check (status <> 'publie' or snapshot is not null)
);

comment on column public.report_cards.snapshot is
  'Contenu figé : notes, moyennes, gabarit ET signature. Jamais recalculé après publication.';

create index report_cards_tenant_idx  on public.report_cards (tenant_id);
create index report_cards_student_idx on public.report_cards (student_id);
create index report_cards_class_idx   on public.report_cards (class_id, period_id);

create trigger report_cards_updated_at before update on public.report_cards
  for each row execute function extensions.moddatetime(updated_at);

-- Le gel. Une fois publié, un bulletin ne bouge plus — ni son instantané, ni
-- son statut, ni son appréciation. La seule sortie est la suppression, refusée
-- par la politique RLS tant que le bulletin est publié.
--
-- Portée du gel : `security invoker`, donc opposable y compris au rôle de
-- service. La suppression, elle, n'est bloquée qu'au niveau RLS — le rôle de
-- service la contourne, comme toute opération d'exploitation.
create or replace function app.freeze_published_report()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.status = 'publie' then
    raise exception
      'Bulletin publié : son contenu est figé et ne peut plus être modifié.'
      using errcode = 'check_violation';
  end if;

  -- Au moment de la publication, l'instantané doit être présent et daté.
  if new.status = 'publie' and old.status <> 'publie' then
    if new.snapshot is null then
      raise exception 'Publier un bulletin exige un instantané.';
    end if;
    new.published_at := coalesce(new.published_at, now());
  end if;

  return new;
end;
$$;

create trigger report_cards_gel
  before update on public.report_cards
  for each row execute function app.freeze_published_report();

-- =============================================================================
-- Pièces jointes des élèves
-- =============================================================================

create table public.student_documents (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  student_id  uuid not null references public.students(id) on delete cascade,
  name        text not null check (length(trim(name)) > 0),
  type        text not null default '',
  -- Chemin dans Supabase Storage. La base ne stocke pas le fichier.
  storage_path text not null default '',
  size_bytes  bigint not null default 0 check (size_bytes >= 0),
  uploaded_at timestamptz not null default now(),
  uploaded_by uuid references auth.users(id) on delete set null
);

create index student_documents_student_idx on public.student_documents (student_id);
create index student_documents_tenant_idx  on public.student_documents (tenant_id);

-- =============================================================================
-- Sécurité au niveau des lignes
-- =============================================================================

alter table public.document_templates enable row level security;
alter table public.signatures         enable row level security;
alter table public.report_cards       enable row level security;
alter table public.student_documents  enable row level security;

revoke all on public.document_templates, public.signatures,
              public.report_cards, public.student_documents
  from anon;

grant select, insert, update, delete on
  public.document_templates, public.signatures,
  public.report_cards, public.student_documents
  to authenticated;

-- --- Gabarits
create policy "gabarits lisibles par les membres" on public.document_templates
  for select to authenticated using (tenant_id in (select app.current_tenant_ids()));

create policy "ecrire un gabarit exige settings manage" on public.document_templates
  for all to authenticated
  using (app.has_permission(tenant_id, 'settings.manage'))
  with check (app.has_permission(tenant_id, 'settings.manage'));

-- --- Signature
create policy "signature lisible par les membres" on public.signatures
  for select to authenticated using (tenant_id in (select app.current_tenant_ids()));

create policy "ecrire la signature exige settings manage" on public.signatures
  for all to authenticated
  using (app.has_permission(tenant_id, 'settings.manage'))
  with check (app.has_permission(tenant_id, 'settings.manage'));

-- --- Bulletins
create policy "bulletins visibles dans tout l etablissement" on public.report_cards
  for select to authenticated
  using (app.has_permission(tenant_id, 'reports.download')
         and app.sees_whole_tenant(tenant_id));

create policy "un enseignant voit les bulletins de ses classes" on public.report_cards
  for select to authenticated
  using (app.has_permission(tenant_id, 'reports.download')
         and class_id in (select app.teacher_class_ids()));

-- Les familles et l'élève ne voient que les bulletins publiés.
create policy "familles et eleves voient les bulletins publies" on public.report_cards
  for select to authenticated
  using (
    status = 'publie'
    and (
      student_id in (select app.guardian_student_ids())
      or exists (select 1 from public.students s
                 where s.id = report_cards.student_id
                   and s.user_id = (select auth.uid()))
    )
  );

create policy "generer un bulletin exige reports generate" on public.report_cards
  for insert to authenticated
  with check (app.has_permission(tenant_id, 'reports.generate'));

create policy "modifier un bulletin exige reports generate" on public.report_cards
  for update to authenticated
  using (app.has_permission(tenant_id, 'reports.generate'))
  with check (app.has_permission(tenant_id, 'reports.generate'));

-- Un bulletin publié ne se supprime pas : aucune politique ne le couvre.
create policy "supprimer un bulletin non publie" on public.report_cards
  for delete to authenticated
  using (app.has_permission(tenant_id, 'reports.generate') and status <> 'publie');

-- --- Pièces jointes des élèves : même portée que l'élève lui-même
create policy "pieces visibles dans tout l etablissement" on public.student_documents
  for select to authenticated
  using (app.has_permission(tenant_id, 'students.read')
         and app.sees_whole_tenant(tenant_id));

create policy "un enseignant voit les pieces de ses eleves" on public.student_documents
  for select to authenticated
  using (app.has_permission(tenant_id, 'students.read')
         and student_id in (select app.teacher_student_ids()));

create policy "un parent voit les pieces de ses enfants" on public.student_documents
  for select to authenticated
  using (student_id in (select app.guardian_student_ids()));

create policy "ecrire une piece exige students update" on public.student_documents
  for all to authenticated
  using (app.has_permission(tenant_id, 'students.update'))
  with check (app.has_permission(tenant_id, 'students.update'));
