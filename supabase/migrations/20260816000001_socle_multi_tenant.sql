-- =============================================================================
-- 001 · SOCLE MULTI-TENANT
--
-- Rien d'autre ne peut être posé avant ceci. Toutes les politiques RLS des
-- migrations suivantes s'appuieront sur les deux fonctions définies ici.
--
-- Principe directeur, tiré de `.agents/GEMINI.md` (l. 404) : le `tenant_id`
-- fourni par le navigateur n'est jamais une autorisation. L'appartenance se
-- déduit de `auth.uid()`, côté serveur, et d'elle seule.
-- =============================================================================

create schema if not exists app;
comment on schema app is
  'Fonctions internes de sécurité. Non exposé par l''API : seul `public` l''est.';

-- `moddatetime` tient les colonnes `updated_at` à jour sans code applicatif.
create extension if not exists moddatetime with schema extensions;

-- =============================================================================
-- Établissements
-- =============================================================================

create table public.tenants (
  id           uuid primary key default gen_random_uuid(),
  -- Segment d'URL : `/mon-ecole/dashboard`.
  slug         text not null unique
               check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name         text not null check (length(trim(name)) > 0),
  short_name   text not null default '',
  type         text not null default '',
  city         text not null default '',
  country      text not null default 'Gabon',
  logo         text not null default '',
  -- Le franc CFA n'a pas de subdivision d'usage : tous les montants de la base
  -- sont des entiers. La contrainte interdit d'introduire une autre devise
  -- sans revoir cette décision.
  currency     text not null default 'XAF' check (currency = 'XAF'),
  timezone     text not null default 'Africa/Libreville',
  status       text not null default 'active'
               check (status in ('active', 'suspendu', 'archive')),
  -- Configuration éditée depuis Paramètres : cycles actifs, systèmes de
  -- notation, périodes, gabarits, règles de messagerie.
  settings     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.tenants is
  'Établissements scolaires. Racine du cloisonnement des données.';
comment on column public.tenants.settings is
  'TenantConfig applicatif. Aucune règle métier ne doit être codée en dur ailleurs.';

create trigger tenants_updated_at
  before update on public.tenants
  for each row execute function extensions.moddatetime(updated_at);

-- =============================================================================
-- Catalogue des permissions
--
-- Table de référence plutôt qu'un type énuméré : une permission s'ajoute par
-- un `insert`, là où un enum imposerait une migration de type. La clé est
-- identique à l'union TypeScript de `src/lib/auth/permissions.ts`.
-- =============================================================================

create table public.permissions (
  key         text primary key check (key ~ '^[a-z]+\.[a-z]+$'),
  label       text not null,
  domain      text not null
);

comment on table public.permissions is
  'Permissions granulaires (GEMINI.md l. 242-264). Lecture seule pour les clients.';

insert into public.permissions (key, label, domain) values
  ('students.read',      'Consulter les élèves',              'students'),
  ('students.create',    'Créer un élève',                    'students'),
  ('students.update',    'Modifier un élève',                 'students'),
  ('students.delete',    'Supprimer un élève',                'students'),
  ('students.export',    'Exporter les élèves',               'students'),
  ('teachers.manage',    'Gérer les enseignants',             'teachers'),
  ('classes.manage',     'Gérer les classes',                 'classes'),
  ('subjects.manage',    'Gérer les matières',                'subjects'),
  ('attendance.read',    'Consulter les présences',           'attendance'),
  ('attendance.manage',  'Saisir les présences',              'attendance'),
  ('grades.read',        'Consulter les notes',               'grades'),
  ('grades.enter',       'Saisir les notes',                  'grades'),
  ('grades.update',      'Corriger une note validée',         'grades'),
  ('grades.validate',    'Valider les notes',                 'grades'),
  ('grades.publish',     'Publier les résultats',             'grades'),
  ('reports.generate',   'Générer les bulletins',             'reports'),
  ('reports.download',   'Télécharger les bulletins',         'reports'),
  ('payments.read',      'Consulter les paiements',           'finance'),
  ('payments.create',    'Enregistrer un paiement',           'finance'),
  ('payments.refund',    'Rembourser un paiement',            'finance'),
  ('users.manage',       'Gérer les utilisateurs',            'access'),
  ('settings.manage',    'Administrer les paramètres',        'settings'),
  ('audit.read',         'Consulter le journal d''audit',     'audit'),
  ('messages.read',      'Consulter la messagerie',           'messages'),
  ('messages.send',      'Envoyer des messages',              'messages');

-- =============================================================================
-- Rôles, propres à chaque établissement
--
-- `GEMINI.md` (l. 236) interdit de réduire les droits à un champ `role` sur
-- l'utilisateur : les rôles sont personnalisables par établissement.
-- =============================================================================

create table public.roles (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  name        text not null check (length(trim(name)) > 0),
  description text not null default '',
  -- Un rôle système ne peut pas être supprimé : aucune politique `delete` ne
  -- l'autorise. L'interdiction tient à l'absence de politique, pas à un usage.
  is_system   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tenant_id, name)
);

create index roles_tenant_idx on public.roles (tenant_id);

create trigger roles_updated_at
  before update on public.roles
  for each row execute function extensions.moddatetime(updated_at);

create table public.role_permissions (
  role_id        uuid not null references public.roles(id) on delete cascade,
  permission_key text not null references public.permissions(key),
  primary key (role_id, permission_key)
);

create index role_permissions_role_idx on public.role_permissions (role_id);

-- =============================================================================
-- Appartenances
--
-- Une relation à trois termes : un utilisateur, un établissement, et le rôle
-- qu'il y détient. Le même compte peut être directeur ici et secrétaire
-- ailleurs — le rôle n'est pas une propriété de la personne.
-- =============================================================================

create table public.memberships (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  role_id     uuid not null references public.roles(id) on delete restrict,
  status      text not null default 'invitation'
              check (status in ('active', 'invitation', 'suspendue')),
  invited_by  uuid references auth.users(id) on delete set null,
  invited_at  timestamptz not null default now(),
  accepted_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, tenant_id)
);

comment on table public.memberships is
  'Appartenance (utilisateur × établissement × rôle). Source unique des droits.';

create index memberships_user_idx   on public.memberships (user_id);
create index memberships_tenant_idx on public.memberships (tenant_id);

create trigger memberships_updated_at
  before update on public.memberships
  for each row execute function extensions.moddatetime(updated_at);

-- Le rôle doit appartenir au même établissement que l'appartenance : sans
-- cela, un rôle d'un autre établissement pourrait être rattaché ici.
create or replace function app.check_role_tenant()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.roles r
    where r.id = new.role_id and r.tenant_id = new.tenant_id
  ) then
    raise exception 'Le rôle % n''appartient pas à l''établissement %',
      new.role_id, new.tenant_id;
  end if;
  return new;
end;
$$;

create trigger memberships_role_tenant
  before insert or update on public.memberships
  for each row execute function app.check_role_tenant();

-- =============================================================================
-- Fonctions de sécurité
--
-- `security definer` est indispensable : ces fonctions lisent `memberships`,
-- table elle-même protégée par RLS. Sans cela, une politique sur `memberships`
-- qui appellerait ces fonctions provoquerait une récursion infinie.
--
-- `search_path = ''` empêche qu'un schéma placé en tête du chemin détourne un
-- appel vers une table homonyme — le risque classique des fonctions élevées.
--
-- `auth.uid()` est enveloppé dans un `select` : PostgreSQL l'évalue alors une
-- fois par requête et non une fois par ligne.
-- =============================================================================

create or replace function app.current_tenant_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select m.tenant_id
  from public.memberships m
  where m.user_id = (select auth.uid())
    and m.status = 'active';
$$;

comment on function app.current_tenant_ids is
  'Établissements où l''utilisateur courant a une appartenance ouverte.';

create or replace function app.is_member(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    where m.user_id = (select auth.uid())
      and m.tenant_id = p_tenant_id
      and m.status = 'active'
  );
$$;

create or replace function app.has_permission(p_tenant_id uuid, p_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    join public.role_permissions rp on rp.role_id = m.role_id
    where m.user_id = (select auth.uid())
      and m.tenant_id = p_tenant_id
      and m.status = 'active'
      and rp.permission_key = p_permission
  );
$$;

comment on function app.has_permission is
  'Vrai si l''utilisateur détient cette permission DANS cet établissement.';

revoke all on function app.current_tenant_ids()          from public, anon;
revoke all on function app.is_member(uuid)               from public, anon;
revoke all on function app.has_permission(uuid, text)    from public, anon;

grant execute on function app.current_tenant_ids()       to authenticated;
grant execute on function app.is_member(uuid)            to authenticated;
grant execute on function app.has_permission(uuid, text) to authenticated;

-- =============================================================================
-- Sécurité au niveau des lignes
--
-- Activée sur toutes les tables, sans exception : sous Supabase, une table
-- sans RLS est lisible par quiconque détient la clé publique.
-- =============================================================================

alter table public.tenants          enable row level security;
alter table public.roles            enable row level security;
alter table public.role_permissions enable row level security;
alter table public.memberships      enable row level security;
alter table public.permissions      enable row level security;

-- Aucune donnée de cette application n'est publique : `anon` n'a rien.
revoke all on public.tenants, public.roles, public.role_permissions,
              public.memberships, public.permissions
  from anon;

grant select on public.permissions to authenticated;
grant select, update on public.tenants to authenticated;
grant select, insert, update, delete on public.roles to authenticated;
grant select, insert, delete on public.role_permissions to authenticated;
grant select, insert, update, delete on public.memberships to authenticated;

-- --- Catalogue des permissions : référence, en lecture pour tous les connectés
create policy "permissions lisibles par les utilisateurs connectés"
  on public.permissions for select
  to authenticated
  using (true);

-- --- Établissements
create policy "un établissement n'est visible que par ses membres"
  on public.tenants for select
  to authenticated
  using (id in (select app.current_tenant_ids()));

create policy "configurer son établissement exige settings.manage"
  on public.tenants for update
  to authenticated
  using (app.has_permission(id, 'settings.manage'))
  with check (app.has_permission(id, 'settings.manage'));

-- La création et la suppression d'un établissement relèvent de l'espace
-- plateforme, pas d'un client authentifié : aucune politique ici.

-- --- Rôles
create policy "les rôles sont visibles par les membres de l'établissement"
  on public.roles for select
  to authenticated
  using (tenant_id in (select app.current_tenant_ids()));

create policy "créer un rôle exige settings.manage"
  on public.roles for insert
  to authenticated
  with check (app.has_permission(tenant_id, 'settings.manage'));

create policy "modifier un rôle exige settings.manage"
  on public.roles for update
  to authenticated
  using (app.has_permission(tenant_id, 'settings.manage'))
  with check (app.has_permission(tenant_id, 'settings.manage'));

create policy "un rôle système ne se supprime pas"
  on public.roles for delete
  to authenticated
  using (app.has_permission(tenant_id, 'settings.manage') and is_system = false);

-- --- Permissions attachées aux rôles
create policy "les droits d'un rôle suivent la visibilité du rôle"
  on public.role_permissions for select
  to authenticated
  using (
    exists (
      select 1 from public.roles r
      where r.id = role_id
        and r.tenant_id in (select app.current_tenant_ids())
    )
  );

create policy "accorder un droit exige settings.manage"
  on public.role_permissions for insert
  to authenticated
  with check (
    exists (
      select 1 from public.roles r
      where r.id = role_id and app.has_permission(r.tenant_id, 'settings.manage')
    )
  );

create policy "retirer un droit exige settings.manage"
  on public.role_permissions for delete
  to authenticated
  using (
    exists (
      select 1 from public.roles r
      where r.id = role_id and app.has_permission(r.tenant_id, 'settings.manage')
    )
  );

-- --- Appartenances
create policy "chacun voit ses propres appartenances"
  on public.memberships for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "gérer les comptes permet de voir les appartenances"
  on public.memberships for select
  to authenticated
  using (app.has_permission(tenant_id, 'users.manage'));

create policy "inviter quelqu'un exige users.manage"
  on public.memberships for insert
  to authenticated
  with check (app.has_permission(tenant_id, 'users.manage'));

-- Accepter ou refuser son invitation reste possible sans droit particulier :
-- c'est sa propre appartenance, et elle n'existe que parce qu'on l'a invité.
create policy "chacun répond à sa propre invitation"
  on public.memberships for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "administrer une appartenance exige users.manage"
  on public.memberships for update
  to authenticated
  using (app.has_permission(tenant_id, 'users.manage'))
  with check (app.has_permission(tenant_id, 'users.manage'));

create policy "retirer quelqu'un exige users.manage"
  on public.memberships for delete
  to authenticated
  using (app.has_permission(tenant_id, 'users.manage'));
