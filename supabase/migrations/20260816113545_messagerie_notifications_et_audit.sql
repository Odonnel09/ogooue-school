-- =============================================================================
-- 011 · MESSAGERIE, NOTIFICATIONS ET JOURNAL D'AUDIT
--
-- Deux propriétés seulement, mais tenues sans exception :
--
--   1. **On ne lit que les fils auxquels on participe.** C'est la correction
--      apportée côté interface en B6, ici rendue opposable.
--   2. **Le journal d'audit ne se réécrit pas.** Ni par politique, ni par le
--      rôle de service : un déclencheur `security invoker` refuse toute
--      modification et toute suppression, pour tout le monde.
--
-- Ce que la base ne tient pas : la matrice « qui peut écrire à qui ». Elle vit
-- dans `tenants.settings` et sera appliquée par la Server Action qui ouvre une
-- conversation. La base garantit la participation et l'authorship — le reste
-- est une règle d'établissement, configurable, pas un invariant.
-- =============================================================================

create table public.conversations (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references public.tenants(id) on delete cascade,
  subject            text not null check (length(trim(subject)) > 0),
  kind               text not null default 'direct'
                     check (kind in ('direct','groupe','diffusion')),
  related_student_id uuid references public.students(id) on delete set null,
  status             text not null default 'active' check (status in ('active','archivee')),
  created_by         uuid references auth.users(id) on delete set null,
  created_at         timestamptz not null default now(),
  last_message_at    timestamptz not null default now()
);

create index conversations_tenant_idx on public.conversations (tenant_id);
create index conversations_recent_idx on public.conversations (tenant_id, last_message_at desc);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  -- L'épinglage est personnel : chacun range sa boîte comme il l'entend.
  -- (Le modèle TypeScript le portait sur la conversation ; c'était une
  -- approximation acceptable pour une démonstration mono-utilisateur.)
  pinned          boolean not null default false,
  joined_at       timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index conversation_participants_user_idx
  on public.conversation_participants (user_id);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  author_id       uuid not null references auth.users(id) on delete cascade,
  body            text not null check (length(trim(body)) > 0),
  attachments     jsonb not null default '[]'::jsonb,
  sent_at         timestamptz not null default now()
);

create index messages_conversation_idx on public.messages (conversation_id, sent_at);

-- Accusés de lecture : une ligne plutôt qu'un tableau, pour pouvoir compter
-- les non-lus sans désérialiser.
create table public.message_reads (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  read_at    timestamptz not null default now(),
  primary key (message_id, user_id)
);

create index message_reads_user_idx on public.message_reads (user_id);

-- Un message remonte son fil : le tri de la boîte reste exact sans calcul.
create or replace function app.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
  set last_message_at = new.sent_at
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function app.touch_conversation();

create or replace function app.is_participant(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = p_conversation_id
      and cp.user_id = (select auth.uid())
  );
$$;

revoke all on function app.is_participant(uuid) from public, anon;
grant execute on function app.is_participant(uuid) to authenticated;

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null check (kind in (
               'message','impaye','dossier_incomplet','notes_a_valider',
               'echeance','absence')),
  title      text not null check (length(trim(title)) > 0),
  body       text not null default '',
  href       text not null default '',
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.notifications is
  'Notifications persistées, produites côté serveur. L''interface sait aussi les déduire de l''état réel.';

create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- =============================================================================
-- Journal d'audit — append-only, sans exception
-- =============================================================================

create table public.audit_logs (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  actor_id      uuid references auth.users(id) on delete set null,
  -- Nom et rôle figés au moment du fait : une trace doit rester lisible même
  -- après le départ de la personne ou la refonte des rôles.
  actor_name    text not null default '',
  actor_role    text not null default '',
  action        text not null check (length(trim(action)) > 0),
  domain        text not null default '',
  severity      text not null default 'info' check (severity in ('info','sensitive')),
  resource_type text not null default '',
  resource_id   text not null default '',
  resource_label text not null default '',
  detail        text not null default '',
  at            timestamptz not null default now()
);

create index audit_logs_tenant_idx   on public.audit_logs (tenant_id, at desc);
create index audit_logs_severity_idx on public.audit_logs (tenant_id, severity, at desc);

create or replace function app.audit_is_append_only()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'Le journal d''audit ne se modifie ni ne se supprime.'
    using errcode = 'check_violation';
end;
$$;

create trigger audit_logs_append_only
  before update or delete on public.audit_logs
  for each row execute function app.audit_is_append_only();

-- =============================================================================
-- Sécurité au niveau des lignes
-- =============================================================================

alter table public.conversations              enable row level security;
alter table public.conversation_participants  enable row level security;
alter table public.messages                   enable row level security;
alter table public.message_reads              enable row level security;
alter table public.notifications              enable row level security;
alter table public.audit_logs                 enable row level security;

revoke all on public.conversations, public.conversation_participants,
              public.messages, public.message_reads, public.notifications,
              public.audit_logs
  from anon;

grant select, insert, update, delete on
  public.conversations, public.conversation_participants, public.messages,
  public.message_reads, public.notifications
  to authenticated;

-- ATTENTION : ce `grant` n'a pas la portée qu'il semble avoir. Les privilèges
-- par défaut de Supabase ont déjà tout accordé sur les tables de `public` ;
-- accorder n'ôte rien. C'est la migration 012 qui révoque réellement UPDATE,
-- DELETE et TRUNCATE.
grant select, insert on public.audit_logs to authenticated;

create policy "on ne voit que les fils auxquels on participe" on public.conversations
  for select to authenticated using (app.is_participant(id));

create policy "ouvrir un fil dans son etablissement" on public.conversations
  for insert to authenticated
  with check (
    tenant_id in (select app.current_tenant_ids())
    and app.has_permission(tenant_id, 'messages.send')
  );

create policy "modifier un fil auquel on participe" on public.conversations
  for update to authenticated
  using (app.is_participant(id))
  with check (app.is_participant(id));

create policy "participants visibles dans ses propres fils" on public.conversation_participants
  for select to authenticated using (app.is_participant(conversation_id));

create policy "ajouter un participant a son fil" on public.conversation_participants
  for insert to authenticated
  with check (
    app.is_participant(conversation_id)
    or not exists (select 1 from public.conversation_participants cp
                   where cp.conversation_id = conversation_participants.conversation_id)
  );

create policy "regler son propre epinglage" on public.conversation_participants
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "quitter un fil" on public.conversation_participants
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "messages lisibles dans ses fils" on public.messages
  for select to authenticated using (app.is_participant(conversation_id));

-- On écrit en son nom, dans un fil dont on fait partie. Les deux conditions.
create policy "ecrire en son nom dans son fil" on public.messages
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and app.is_participant(conversation_id)
  );

-- Un message envoyé ne se réécrit pas : aucune politique `update`.
create policy "retirer son propre message" on public.messages
  for delete to authenticated
  using (author_id = (select auth.uid()));

create policy "ses propres accuses de lecture" on public.message_reads
  for select to authenticated using (user_id = (select auth.uid()));

create policy "marquer lu pour soi" on public.message_reads
  for insert to authenticated
  with check (user_id = (select auth.uid()) and app.is_participant(
    (select m.conversation_id from public.messages m where m.id = message_id)));

create policy "ses propres notifications" on public.notifications
  for select to authenticated using (user_id = (select auth.uid()));

create policy "marquer ses notifications comme lues" on public.notifications
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "ecarter ses notifications" on public.notifications
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- La création de notifications appartient au serveur : aucune politique
-- `insert` pour les clients.

create policy "journal lisible avec audit read" on public.audit_logs
  for select to authenticated using (app.has_permission(tenant_id, 'audit.read'));

create policy "journaliser dans son etablissement" on public.audit_logs
  for insert to authenticated
  with check (tenant_id in (select app.current_tenant_ids()));
