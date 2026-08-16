-- =============================================================================
-- 005 · PERSONNES, ET RESSERREMENT DE LA PORTÉE
--
-- Élèves, tuteurs, enseignants, et le rattachement des enseignants aux classes.
--
-- C'est ici qu'est honorée la dette de la 004 : `GEMINI.md` (l. 96) limite un
-- enseignant aux classes et matières auxquelles il est affecté, et (l. 117) un
-- parent aux informations de ses propres enfants.
--
-- Le lien avec un compte est **facultatif** : un élève de primaire n'a pas de
-- compte, une fiche enseignant existe avant que l'invitation soit acceptée.
-- =============================================================================

-- =============================================================================
-- Enseignants
-- =============================================================================

create table public.teachers (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  -- Renseigné quand la personne a un compte sur la plateforme.
  user_id       uuid references auth.users(id) on delete set null,
  matricule     text not null check (length(trim(matricule)) > 0),
  first_name    text not null check (length(trim(first_name)) > 0),
  last_name     text not null check (length(trim(last_name)) > 0),
  email         text not null default '',
  phone         text not null default '',
  address       text not null default '',
  contract_type text not null default 'contractuel'
                check (contract_type in ('permanent','contractuel','vacataire','stagiaire')),
  status        text not null default 'actif'
                check (status in ('actif','conge','suspendu','archive')),
  start_date    date,
  notes         text not null default '',
  photo_url     text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (tenant_id, matricule),
  unique (tenant_id, user_id)
);

create index teachers_tenant_idx on public.teachers (tenant_id);
create index teachers_user_idx   on public.teachers (user_id) where user_id is not null;

create trigger teachers_updated_at before update on public.teachers
  for each row execute function extensions.moddatetime(updated_at);

-- =============================================================================
-- Affectations : la 004 avait laissé ces colonnes en attente de `teachers`
-- =============================================================================

alter table public.classes
  add column main_teacher_id uuid references public.teachers(id) on delete set null;

alter table public.class_subjects
  add column teacher_id uuid references public.teachers(id) on delete set null;

create index classes_main_teacher_idx  on public.classes (main_teacher_id)
  where main_teacher_id is not null;
create index class_subjects_teacher_idx on public.class_subjects (teacher_id)
  where teacher_id is not null;

-- =============================================================================
-- Tuteurs
-- =============================================================================

create table public.guardians (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  first_name  text not null check (length(trim(first_name)) > 0),
  last_name   text not null check (length(trim(last_name)) > 0),
  phone       text not null default '',
  alt_phone   text not null default '',
  email       text not null default '',
  address     text not null default '',
  profession  text not null default '',
  id_document text not null default '',
  notes       text not null default '',
  status      text not null default 'actif' check (status in ('actif','archive')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create index guardians_tenant_idx on public.guardians (tenant_id);
create index guardians_user_idx   on public.guardians (user_id) where user_id is not null;

create trigger guardians_updated_at before update on public.guardians
  for each row execute function extensions.moddatetime(updated_at);

-- =============================================================================
-- Élèves
-- =============================================================================

create table public.students (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references public.tenants(id) on delete cascade,
  user_id          uuid references auth.users(id) on delete set null,
  matricule        text not null check (length(trim(matricule)) > 0),
  first_name       text not null check (length(trim(first_name)) > 0),
  last_name        text not null check (length(trim(last_name)) > 0),
  birth_date       date,
  birth_place      text not null default '',
  gender           text not null check (gender in ('M','F')),
  nationality      text not null default 'Gabonaise',
  address          text not null default '',
  class_id         uuid references public.classes(id) on delete set null,
  level_id         uuid references public.levels(id) on delete set null,
  academic_year_id uuid references public.academic_years(id) on delete set null,
  status           text not null default 'en_attente'
                   check (status in ('actif','en_attente','transfere','archive')),
  photo_url        text not null default '',
  medical_info     text not null default '',
  previous_school  text not null default '',
  filiere          text not null default '',
  parcours         text not null default '',
  is_draft         boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (tenant_id, matricule),
  unique (tenant_id, user_id)
);

comment on column public.students.medical_info is
  'Donnée de santé. Bloc affiché selon la capacité du cycle, jamais selon un test de cycle.';

create index students_tenant_idx on public.students (tenant_id);
create index students_class_idx  on public.students (class_id) where class_id is not null;
create index students_user_idx   on public.students (user_id)  where user_id is not null;

create trigger students_updated_at before update on public.students
  for each row execute function extensions.moddatetime(updated_at);

-- La classe d'un élève doit appartenir au même établissement que lui.
create or replace function app.check_student_class_tenant()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.class_id is not null and not exists (
    select 1 from public.classes c where c.id = new.class_id and c.tenant_id = new.tenant_id
  ) then
    raise exception 'La classe % n''appartient pas à l''établissement %',
      new.class_id, new.tenant_id;
  end if;
  return new;
end;
$$;

create trigger students_class_tenant_guard
  before insert or update of class_id, tenant_id on public.students
  for each row execute function app.check_student_class_tenant();

-- =============================================================================
-- Rattachement tuteur ↔ élève
-- =============================================================================

create table public.guardian_links (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  guardian_id uuid not null references public.guardians(id) on delete cascade,
  student_id  uuid not null references public.students(id) on delete cascade,
  relation    text not null default 'tuteur'
              check (relation in ('pere','mere','tuteur','oncle','tante','grand_parent','autre')),
  is_primary  boolean not null default false,
  can_pick_up boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (guardian_id, student_id)
);

create index guardian_links_tenant_idx   on public.guardian_links (tenant_id);
create index guardian_links_student_idx  on public.guardian_links (student_id);
create index guardian_links_guardian_idx on public.guardian_links (guardian_id);

-- Un seul contact principal par élève.
create unique index guardian_links_un_seul_principal
  on public.guardian_links (student_id) where is_primary;

create trigger guardian_links_updated_at before update on public.guardian_links
  for each row execute function extensions.moddatetime(updated_at);

-- =============================================================================
-- Portée d'un enseignant et d'un parent
-- =============================================================================

create or replace function app.my_teacher_id(p_tenant_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select t.id from public.teachers t
  where t.tenant_id = p_tenant_id
    and t.user_id = (select auth.uid())
    and t.status <> 'archive'
  limit 1;
$$;

-- Classes dont l'utilisateur est titulaire ou dans lesquelles il enseigne.
create or replace function app.teacher_class_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select c.id
  from public.classes c
  join public.teachers t on t.id = c.main_teacher_id
  where t.user_id = (select auth.uid())
  union
  select cs.class_id
  from public.class_subjects cs
  join public.teachers t on t.id = cs.teacher_id
  where t.user_id = (select auth.uid());
$$;

comment on function app.teacher_class_ids is
  'Classes auxquelles l''utilisateur est affecté (GEMINI.md l. 96).';

-- Enfants d'un parent, tous établissements confondus.
create or replace function app.guardian_student_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select gl.student_id
  from public.guardian_links gl
  join public.guardians g on g.id = gl.guardian_id
  where g.user_id = (select auth.uid())
    and g.status = 'actif';
$$;

-- Voit-on tout l'établissement, ou seulement son périmètre ?
--
-- Le critère n'est pas le nom du rôle — ce serait coder une règle métier en
-- dur — mais la détention de `classes.manage` : administrer les classes
-- suppose de toutes les voir. Un enseignant ne l'a pas, un secrétaire si.
create or replace function app.sees_whole_tenant(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app.has_permission(p_tenant_id, 'classes.manage');
$$;

revoke all on function app.my_teacher_id(uuid)        from public, anon;
revoke all on function app.teacher_class_ids()        from public, anon;
revoke all on function app.guardian_student_ids()     from public, anon;
revoke all on function app.sees_whole_tenant(uuid)    from public, anon;

grant execute on function app.my_teacher_id(uuid)     to authenticated;
grant execute on function app.teacher_class_ids()     to authenticated;
grant execute on function app.guardian_student_ids()  to authenticated;
grant execute on function app.sees_whole_tenant(uuid) to authenticated;

-- =============================================================================
-- Sécurité au niveau des lignes
-- =============================================================================

alter table public.teachers       enable row level security;
alter table public.guardians      enable row level security;
alter table public.students       enable row level security;
alter table public.guardian_links enable row level security;

revoke all on public.teachers, public.guardians, public.students, public.guardian_links from anon;

grant select, insert, update, delete on
  public.teachers, public.guardians, public.students, public.guardian_links
  to authenticated;

-- --- Enseignants
create policy "enseignants lisibles par les membres" on public.teachers
  for select to authenticated using (tenant_id in (select app.current_tenant_ids()));

create policy "ecrire un enseignant exige teachers manage" on public.teachers
  for all to authenticated
  using (app.has_permission(tenant_id, 'teachers.manage'))
  with check (app.has_permission(tenant_id, 'teachers.manage'));

-- --- Tuteurs : réservés à ceux qui gèrent les dossiers, plus le tuteur lui-même
-- NOTE : cette politique est remplacée dès la 006 — elle laissait un enseignant
-- voir les familles d'élèves qu'il n'a pas en classe.
create policy "tuteurs lisibles avec students read" on public.guardians
  for select to authenticated
  using (app.has_permission(tenant_id, 'students.read'));

create policy "chaque tuteur voit sa propre fiche" on public.guardians
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "ecrire un tuteur exige students update" on public.guardians
  for all to authenticated
  using (app.has_permission(tenant_id, 'students.update'))
  with check (app.has_permission(tenant_id, 'students.update'));

-- --- Élèves : quatre portées distinctes, jamais cumulées par hasard
create policy "eleves visibles dans tout l etablissement" on public.students
  for select to authenticated
  using (
    app.has_permission(tenant_id, 'students.read')
    and app.sees_whole_tenant(tenant_id)
  );

create policy "un enseignant voit les eleves de ses classes" on public.students
  for select to authenticated
  using (
    app.has_permission(tenant_id, 'students.read')
    and class_id in (select app.teacher_class_ids())
  );

create policy "un parent voit ses enfants" on public.students
  for select to authenticated
  using (id in (select app.guardian_student_ids()));

create policy "un eleve voit son propre dossier" on public.students
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "creer un eleve exige students create" on public.students
  for insert to authenticated
  with check (app.has_permission(tenant_id, 'students.create'));

create policy "modifier un eleve exige students update" on public.students
  for update to authenticated
  using (app.has_permission(tenant_id, 'students.update'))
  with check (app.has_permission(tenant_id, 'students.update'));

create policy "supprimer un eleve exige students delete" on public.students
  for delete to authenticated
  using (app.has_permission(tenant_id, 'students.delete'));

-- --- Rattachements tuteur/élève
-- NOTE : remplacée dès la 006, pour la même raison que la politique tuteurs.
create policy "rattachements lisibles avec students read" on public.guardian_links
  for select to authenticated
  using (app.has_permission(tenant_id, 'students.read'));

create policy "un parent voit ses propres rattachements" on public.guardian_links
  for select to authenticated
  using (student_id in (select app.guardian_student_ids()));

create policy "ecrire un rattachement exige students update" on public.guardian_links
  for all to authenticated
  using (app.has_permission(tenant_id, 'students.update'))
  with check (app.has_permission(tenant_id, 'students.update'));

-- =============================================================================
-- Resserrement des politiques de la 004
--
-- La lecture du référentiel était ouverte à tout membre. Elle se limite
-- désormais au périmètre : tout l'établissement pour qui administre les
-- classes, ses seules classes pour un enseignant.
-- =============================================================================

drop policy "classes lisibles par les membres" on public.classes;
create policy "classes lisibles selon la portee" on public.classes
  for select to authenticated
  using (
    tenant_id in (select app.current_tenant_ids())
    and (
      app.sees_whole_tenant(tenant_id)
      or id in (select app.teacher_class_ids())
    )
  );

drop policy "rattachements lisibles par les membres" on public.class_subjects;
create policy "rattachements lisibles selon la portee" on public.class_subjects
  for select to authenticated
  using (
    tenant_id in (select app.current_tenant_ids())
    and (
      app.sees_whole_tenant(tenant_id)
      or class_id in (select app.teacher_class_ids())
    )
  );
