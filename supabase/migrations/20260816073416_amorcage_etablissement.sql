-- =============================================================================
-- 002 · AMORÇAGE D'UN ÉTABLISSEMENT
--
-- Créer un établissement n'est pas une opération de client : c'est un acte de
-- la plateforme (GEMINI.md l. 38-40). Ces fonctions sont donc `security
-- definer` et retirées de `anon` comme de `authenticated` — seul le rôle de
-- service peut les appeler.
--
-- Les jeux de permissions reproduisent exactement `src/data/roles.ts`.
-- =============================================================================

create or replace function app.bootstrap_tenant(
  p_slug       text,
  p_name       text,
  p_short_name text default '',
  p_city       text default '',
  p_type       text default '',
  p_logo       text default ''
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tenant_id uuid;
  v_role_id   uuid;
begin
  insert into public.tenants (slug, name, short_name, city, type, logo)
  values (p_slug, p_name, coalesce(nullif(p_short_name, ''), p_name), p_city, p_type, p_logo)
  on conflict (slug) do nothing
  returning id into v_tenant_id;

  -- Amorçage idempotent : rejouer la fonction ne duplique rien.
  if v_tenant_id is null then
    select id into v_tenant_id from public.tenants where slug = p_slug;
    return v_tenant_id;
  end if;

  -- Administrateur : toutes les permissions du catalogue.
  insert into public.roles (tenant_id, name, description, is_system)
  values (v_tenant_id, 'Administrateur',
          'Accès complet à l''établissement : configuration, finances, validation et publication des notes.',
          true)
  returning id into v_role_id;
  insert into public.role_permissions (role_id, permission_key)
  select v_role_id, key from public.permissions;

  insert into public.roles (tenant_id, name, description, is_system)
  values (v_tenant_id, 'Secrétaire',
          'Gestion des dossiers, des inscriptions et des documents. Consulte les paiements sans pouvoir les rembourser.',
          true)
  returning id into v_role_id;
  insert into public.role_permissions (role_id, permission_key)
  select v_role_id, unnest(array[
    'students.read','students.create','students.update','students.export',
    'classes.manage','attendance.read','attendance.manage','grades.read',
    'reports.generate','reports.download','payments.read','payments.create',
    'messages.read','messages.send']);

  insert into public.roles (tenant_id, name, description, is_system)
  values (v_tenant_id, 'Enseignant',
          'Consulte ses classes, fait l''appel et saisit les notes de ses évaluations.',
          true)
  returning id into v_role_id;
  insert into public.role_permissions (role_id, permission_key)
  select v_role_id, unnest(array[
    'students.read','attendance.read','attendance.manage','grades.read',
    'grades.enter','reports.download','messages.read','messages.send']);

  -- Censeur : rôle personnalisé de démonstration. Supprimable, lui.
  insert into public.roles (tenant_id, name, description, is_system)
  values (v_tenant_id, 'Censeur',
          'Supervise la vie scolaire et valide les notes sans accès aux finances.',
          false)
  returning id into v_role_id;
  insert into public.role_permissions (role_id, permission_key)
  select v_role_id, unnest(array[
    'students.read','students.update','teachers.manage','classes.manage',
    'subjects.manage','attendance.read','attendance.manage','grades.read',
    'grades.update','grades.validate','grades.publish','reports.generate',
    'reports.download','audit.read','messages.read','messages.send']);

  return v_tenant_id;
end;
$$;

comment on function app.bootstrap_tenant is
  'Crée un établissement et ses rôles système. Idempotent sur le slug.';

-- Rattache un compte existant à un établissement, dans un rôle donné.
create or replace function app.grant_membership(
  p_email       text,
  p_slug        text,
  p_role_name   text,
  p_status      text default 'active'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id   uuid;
  v_tenant_id uuid;
  v_role_id   uuid;
  v_id        uuid;
begin
  select id into v_user_id from auth.users where email = lower(p_email);
  if v_user_id is null then
    raise exception 'Aucun compte pour %', p_email;
  end if;

  select id into v_tenant_id from public.tenants where slug = p_slug;
  if v_tenant_id is null then
    raise exception 'Aucun établissement pour le slug %', p_slug;
  end if;

  select id into v_role_id
  from public.roles
  where tenant_id = v_tenant_id and name = p_role_name;
  if v_role_id is null then
    raise exception 'Aucun rôle % dans l''établissement %', p_role_name, p_slug;
  end if;

  insert into public.memberships (user_id, tenant_id, role_id, status, accepted_at)
  values (v_user_id, v_tenant_id, v_role_id, p_status,
          case when p_status = 'active' then now() else null end)
  on conflict (user_id, tenant_id) do update
    set role_id = excluded.role_id,
        status  = excluded.status,
        accepted_at = excluded.accepted_at
  returning id into v_id;

  return v_id;
end;
$$;

comment on function app.grant_membership is
  'Rattache un compte à un établissement. Réservée à la plateforme.';

-- Ces fonctions créent des droits : aucun client ne les appelle.
revoke all on function app.bootstrap_tenant(text, text, text, text, text, text) from public, anon, authenticated;
revoke all on function app.grant_membership(text, text, text, text) from public, anon, authenticated;

-- Établissements de démonstration, en miroir de `src/data/memberships.ts`.
select app.bootstrap_tenant('demo',         'Complexe scolaire Ogooué',      'Ogooué',       'Libreville',  'Établissement privé laïc',            '🎓');
select app.bootstrap_tenant('sainte-marie', 'Institution Sainte-Marie',      'Sainte-Marie', 'Port-Gentil', 'Établissement privé confessionnel',   '⛪');
select app.bootstrap_tenant('lekedi',       'Lycée technique de la Lékédi',  'Lékédi',       'Bakoumba',    'Établissement public technique',      '🔧');
select app.bootstrap_tenant('nkembo',       'Groupe scolaire de Nkembo',     'Nkembo',       'Libreville',  'Établissement privé laïc',            '📚');
