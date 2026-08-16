-- =============================================================================
-- 004 · RÉFÉRENTIEL SCOLAIRE
--
-- Années, périodes, niveaux, matières, classes et rattachements matière↔classe.
--
-- Deux décisions structurantes, reprises du modèle TypeScript :
--   1. Le coefficient et le volume horaire vivent sur `class_subjects`, pas
--      sur `subjects` : les maths n'ont pas le même poids en 2nde et en
--      Terminale C.
--   2. Le cycle est stocké, jamais interprété par la base. Les règles qui en
--      découlent appartiennent à la matrice de capacités applicative.
-- =============================================================================

create domain app.cycle as text
  check (value in ('garderie','prescolaire','primaire','college','lycee','superieur'));

comment on domain app.cycle is
  'Cycle scolaire. La base le stocke ; la matrice de capacités l''interprète.';

-- =============================================================================
-- Années scolaires
-- =============================================================================

create table public.academic_years (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  label      text not null check (label ~ '^\d{4}-\d{4}$'),
  start_date date not null,
  end_date   date not null,
  status     text not null default 'draft'
             check (status in ('draft','active','closed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, label),
  check (end_date > start_date)
);

comment on table public.academic_years is
  'Années scolaires. Une année close est en lecture seule (GEMINI.md l. 232).';

-- Une seule année en cours par établissement : l'invariant est trop important
-- pour dépendre de la discipline de l'interface.
create unique index academic_years_une_seule_active
  on public.academic_years (tenant_id) where status = 'active';

create index academic_years_tenant_idx on public.academic_years (tenant_id);

create trigger academic_years_updated_at before update on public.academic_years
  for each row execute function extensions.moddatetime(updated_at);

-- =============================================================================
-- Niveaux scolaires
-- =============================================================================

create table public.levels (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  code       text not null check (code ~ '^[a-z0-9_]+$'),
  label      text not null check (length(trim(label)) > 0),
  cycle      app.cycle not null,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, code)
);

create index levels_tenant_idx on public.levels (tenant_id);

create trigger levels_updated_at before update on public.levels
  for each row execute function extensions.moddatetime(updated_at);

-- =============================================================================
-- Périodes d'évaluation
-- =============================================================================

create table public.periods (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references public.tenants(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  label            text not null check (length(trim(label)) > 0),
  kind             text not null
                   check (kind in ('trimestre','semestre','sequence','personnalise')),
  -- Une période peut valoir pour plusieurs cycles : le collège et le lycée
  -- partagent souvent le même découpage trimestriel.
  cycles           app.cycle[] not null default '{}',
  start_date       date,
  end_date         date,
  position         integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date > start_date)
);

create index periods_tenant_idx on public.periods (tenant_id);
create index periods_year_idx   on public.periods (academic_year_id);

create trigger periods_updated_at before update on public.periods
  for each row execute function extensions.moddatetime(updated_at);

-- =============================================================================
-- Matières
-- =============================================================================

create table public.subjects (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  code         text not null check (length(trim(code)) > 0),
  name         text not null check (length(trim(name)) > 0),
  cycle        app.cycle not null,
  description  text not null default '',
  status       text not null default 'active' check (status in ('active','archivee')),
  -- Champs LMD : toujours stockés, affichés selon `LevelCapabilities.hasCredits`.
  ue           text not null default '',
  ecue         text not null default '',
  ects_credits integer not null default 0 check (ects_credits >= 0),
  semester     text not null default '',
  filiere      text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (tenant_id, code)
);

comment on table public.subjects is
  'Catalogue des matières. Ni coefficient ni volume horaire ici : voir class_subjects.';

create index subjects_tenant_idx on public.subjects (tenant_id);

create trigger subjects_updated_at before update on public.subjects
  for each row execute function extensions.moddatetime(updated_at);

-- Niveaux couverts par une matière : une matière peut valoir pour plusieurs.
create table public.subject_levels (
  subject_id uuid not null references public.subjects(id) on delete cascade,
  level_id   uuid not null references public.levels(id) on delete cascade,
  primary key (subject_id, level_id)
);

create index subject_levels_level_idx on public.subject_levels (level_id);

-- =============================================================================
-- Classes
-- =============================================================================

create table public.classes (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references public.tenants(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete restrict,
  level_id         uuid not null references public.levels(id) on delete restrict,
  name             text not null check (length(trim(name)) > 0),
  cycle            app.cycle not null,
  capacity         integer not null default 0 check (capacity >= 0),
  room             text not null default '',
  description      text not null default '',
  status           text not null default 'en_preparation'
                   check (status in ('active','en_preparation','archivee')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (tenant_id, academic_year_id, name)
);

comment on column public.classes.cycle is
  'Dupliqué depuis le niveau pour éviter une jointure sur chaque lecture. Tenu par déclencheur.';

create index classes_tenant_idx on public.classes (tenant_id);
create index classes_year_idx   on public.classes (academic_year_id);
create index classes_level_idx  on public.classes (level_id);

create trigger classes_updated_at before update on public.classes
  for each row execute function extensions.moddatetime(updated_at);

-- Le cycle d'une classe est celui de son niveau : le laisser saisir librement
-- ouvrirait la porte à une classe de collège rattachée à un niveau de lycée.
create or replace function app.sync_class_cycle()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_cycle text;
  v_tenant uuid;
begin
  select l.cycle, l.tenant_id into v_cycle, v_tenant
  from public.levels l where l.id = new.level_id;

  if v_tenant is distinct from new.tenant_id then
    raise exception 'Le niveau % n''appartient pas à l''établissement %',
      new.level_id, new.tenant_id;
  end if;

  new.cycle := v_cycle;
  return new;
end;
$$;

create trigger classes_sync_cycle
  before insert or update of level_id, tenant_id on public.classes
  for each row execute function app.sync_class_cycle();

-- =============================================================================
-- Rattachement matière ↔ classe
--
-- Le poids d'une matière dépend de la classe. C'est la correction apportée en
-- phase A côté TypeScript, ici gravée dans le schéma.
-- =============================================================================

create table public.class_subjects (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  class_id     uuid not null references public.classes(id) on delete cascade,
  subject_id   uuid not null references public.subjects(id) on delete restrict,
  coefficient  numeric(4,2) not null default 1 check (coefficient > 0),
  weekly_hours numeric(4,1) not null default 0 check (weekly_hours >= 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (class_id, subject_id)
);

comment on table public.class_subjects is
  'Coefficient et volume horaire d''une matière DANS une classe donnée.';

create index class_subjects_tenant_idx  on public.class_subjects (tenant_id);
create index class_subjects_class_idx   on public.class_subjects (class_id);
create index class_subjects_subject_idx on public.class_subjects (subject_id);

create trigger class_subjects_updated_at before update on public.class_subjects
  for each row execute function extensions.moddatetime(updated_at);

-- Classe et matière doivent appartenir au même établissement que la ligne.
create or replace function app.check_class_subject_tenant()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (select 1 from public.classes c
                 where c.id = new.class_id and c.tenant_id = new.tenant_id) then
    raise exception 'La classe % n''appartient pas à l''établissement %',
      new.class_id, new.tenant_id;
  end if;
  if not exists (select 1 from public.subjects s
                 where s.id = new.subject_id and s.tenant_id = new.tenant_id) then
    raise exception 'La matière % n''appartient pas à l''établissement %',
      new.subject_id, new.tenant_id;
  end if;
  return new;
end;
$$;

create trigger class_subjects_tenant_guard
  before insert or update on public.class_subjects
  for each row execute function app.check_class_subject_tenant();

-- =============================================================================
-- Sécurité au niveau des lignes
-- =============================================================================

alter table public.academic_years  enable row level security;
alter table public.levels          enable row level security;
alter table public.periods         enable row level security;
alter table public.subjects        enable row level security;
alter table public.subject_levels  enable row level security;
alter table public.classes         enable row level security;
alter table public.class_subjects  enable row level security;

revoke all on public.academic_years, public.levels, public.periods,
              public.subjects, public.subject_levels, public.classes,
              public.class_subjects
  from anon;

grant select, insert, update, delete on
  public.academic_years, public.levels, public.periods, public.subjects,
  public.subject_levels, public.classes, public.class_subjects
  to authenticated;

-- Lecture : réservée aux membres de l'établissement.
--
-- RESTE À FAIRE : `GEMINI.md` (l. 96) limite un enseignant aux classes et
-- matières auxquelles il est affecté. Cette restriction suppose la table
-- `teachers` et ses affectations, qui arrivent en 005 ; elle sera ajoutée là.
create policy "annees lisibles par les membres" on public.academic_years
  for select to authenticated using (tenant_id in (select app.current_tenant_ids()));
create policy "niveaux lisibles par les membres" on public.levels
  for select to authenticated using (tenant_id in (select app.current_tenant_ids()));
create policy "periodes lisibles par les membres" on public.periods
  for select to authenticated using (tenant_id in (select app.current_tenant_ids()));
create policy "matieres lisibles par les membres" on public.subjects
  for select to authenticated using (tenant_id in (select app.current_tenant_ids()));
create policy "classes lisibles par les membres" on public.classes
  for select to authenticated using (tenant_id in (select app.current_tenant_ids()));
create policy "rattachements lisibles par les membres" on public.class_subjects
  for select to authenticated using (tenant_id in (select app.current_tenant_ids()));
create policy "niveaux d une matiere lisibles par les membres" on public.subject_levels
  for select to authenticated using (
    exists (select 1 from public.subjects s
            where s.id = subject_id and s.tenant_id in (select app.current_tenant_ids())));

-- Écriture : années, niveaux et périodes relèvent de la configuration.
create policy "ecrire une annee exige settings manage" on public.academic_years
  for all to authenticated
  using (app.has_permission(tenant_id, 'settings.manage'))
  with check (app.has_permission(tenant_id, 'settings.manage'));

create policy "ecrire un niveau exige settings manage" on public.levels
  for all to authenticated
  using (app.has_permission(tenant_id, 'settings.manage'))
  with check (app.has_permission(tenant_id, 'settings.manage'));

create policy "ecrire une periode exige settings manage" on public.periods
  for all to authenticated
  using (app.has_permission(tenant_id, 'settings.manage'))
  with check (app.has_permission(tenant_id, 'settings.manage'));

create policy "ecrire une matiere exige subjects manage" on public.subjects
  for all to authenticated
  using (app.has_permission(tenant_id, 'subjects.manage'))
  with check (app.has_permission(tenant_id, 'subjects.manage'));

create policy "ecrire les niveaux d une matiere exige subjects manage" on public.subject_levels
  for all to authenticated
  using (exists (select 1 from public.subjects s
                 where s.id = subject_id and app.has_permission(s.tenant_id, 'subjects.manage')))
  with check (exists (select 1 from public.subjects s
                 where s.id = subject_id and app.has_permission(s.tenant_id, 'subjects.manage')));

create policy "ecrire une classe exige classes manage" on public.classes
  for all to authenticated
  using (app.has_permission(tenant_id, 'classes.manage'))
  with check (app.has_permission(tenant_id, 'classes.manage'));

create policy "ecrire un rattachement exige classes manage" on public.class_subjects
  for all to authenticated
  using (app.has_permission(tenant_id, 'classes.manage'))
  with check (app.has_permission(tenant_id, 'classes.manage'));
