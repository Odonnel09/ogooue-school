-- =============================================================================
-- 008 · VIE SCOLAIRE
--
-- Inscriptions, présences, évaluations, notes et historique des corrections.
--
-- La règle centrale : une note **validée** est verrouillée. La corriger exige
-- un motif, et cette exigence est tenue par la base — pas par la discipline de
-- l'interface. C'est la traduction en SQL du verrou posé en phase A.
--
-- Comportement éprouvé du verrou :
--   · modifier une note verrouillée .......... refusé
--   · supprimer une note verrouillée ......... refusé
--   · `app.correct_grade()` sans motif ....... refusé
--   · `app.correct_grade()` avec motif ....... accepté, historique écrit
--   · supprimer l'évaluation entière ......... accepté (cascade)
-- Effacer une note en silence est impossible ; retirer une évaluation, acte
-- visible exigeant `grades.update`, reste possible.
-- =============================================================================

-- =============================================================================
-- Inscriptions
-- =============================================================================

create table public.enrollments (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references public.tenants(id) on delete cascade,
  reference          text not null,
  first_name         text not null check (length(trim(first_name)) > 0),
  last_name          text not null check (length(trim(last_name)) > 0),
  birth_date         date,
  birth_place        text not null default '',
  gender             text not null check (gender in ('M','F')),
  nationality        text not null default 'Gabonaise',
  address            text not null default '',
  previous_school    text not null default '',
  requested_level_id uuid references public.levels(id) on delete set null,
  requested_class_id uuid references public.classes(id) on delete set null,
  academic_year_id   uuid references public.academic_years(id) on delete set null,
  guardian_id        uuid references public.guardians(id) on delete set null,
  guardian_relation  text not null default 'tuteur'
                     check (guardian_relation in ('pere','mere','tuteur','oncle','tante','grand_parent','autre')),
  status             text not null default 'brouillon'
                     check (status in ('brouillon','soumise','incomplete','validee','refusee','inscrite')),
  submitted_at       timestamptz,
  decided_at         timestamptz,
  decided_by         uuid references auth.users(id) on delete set null,
  decision_note      text not null default '',
  created_student_id uuid references public.students(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (tenant_id, reference)
);

create index enrollments_tenant_idx on public.enrollments (tenant_id);
create index enrollments_status_idx on public.enrollments (tenant_id, status);

create trigger enrollments_updated_at before update on public.enrollments
  for each row execute function extensions.moddatetime(updated_at);

-- Pièces attendues : une ligne par pièce, plutôt qu'un tableau JSON — on veut
-- pouvoir compter les dossiers incomplets sans désérialiser.
create table public.enrollment_documents (
  id            uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  name          text not null check (length(trim(name)) > 0),
  provided      boolean not null default false,
  received_at   date,
  unique (enrollment_id, name)
);

create index enrollment_documents_enrollment_idx
  on public.enrollment_documents (enrollment_id);

-- =============================================================================
-- Présences
-- =============================================================================

create table public.attendance_sheets (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  class_id   uuid not null references public.classes(id) on delete cascade,
  date       date not null,
  taken_by   uuid references auth.users(id) on delete set null,
  saved_at   timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Une seule feuille par classe et par jour : l'appel n'est pas un journal.
  unique (class_id, date)
);

create index attendance_sheets_tenant_idx on public.attendance_sheets (tenant_id);
create index attendance_sheets_class_idx  on public.attendance_sheets (class_id, date);

create trigger attendance_sheets_updated_at before update on public.attendance_sheets
  for each row execute function extensions.moddatetime(updated_at);

create table public.attendance_records (
  sheet_id   uuid not null references public.attendance_sheets(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status     text not null check (status in ('present','absent','retard')),
  note       text not null default '',
  primary key (sheet_id, student_id)
);

create index attendance_records_student_idx on public.attendance_records (student_id);

-- =============================================================================
-- Évaluations
-- =============================================================================

create table public.evaluations (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  name        text not null check (length(trim(name)) > 0),
  type        text not null check (type in (
                'observation','bilan_periodique','evaluation_competence','devoir',
                'controle','composition','examen','oral','tp','projet',
                'controle_continu','rattrapage','autre')),
  subject_id  uuid not null references public.subjects(id) on delete restrict,
  class_id    uuid not null references public.classes(id) on delete cascade,
  teacher_id  uuid references public.teachers(id) on delete set null,
  period_id   uuid references public.periods(id) on delete set null,
  date        date not null,
  scale       text not null default 'sur_20' check (scale in (
                'sur_20','sur_10','pourcentage','acquis','competence',
                'personnalise','ects')),
  max_score   numeric(6,2) not null default 20 check (max_score > 0),
  coefficient numeric(4,2) not null default 1 check (coefficient > 0),
  description text not null default '',
  status      text not null default 'draft'
              check (status in ('draft','in_progress','submitted','validated','published')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on column public.evaluations.status is
  'Le verrou tombe dès `validated`, pas à la publication (règle de la phase A).';

create index evaluations_tenant_idx  on public.evaluations (tenant_id);
create index evaluations_class_idx   on public.evaluations (class_id);
create index evaluations_subject_idx on public.evaluations (subject_id);

create trigger evaluations_updated_at before update on public.evaluations
  for each row execute function extensions.moddatetime(updated_at);

-- =============================================================================
-- Notes
-- =============================================================================

create table public.grades (
  evaluation_id uuid not null references public.evaluations(id) on delete cascade,
  student_id    uuid not null references public.students(id) on delete cascade,
  score         numeric(6,2),
  -- Valeur symbolique pour les barèmes non numériques (« acquis », « A »...).
  value         text,
  comment       text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (evaluation_id, student_id),
  -- Une note est chiffrée ou symbolique, jamais les deux à la fois.
  check (score is null or value is null)
);

create index grades_student_idx on public.grades (student_id);

create trigger grades_updated_at before update on public.grades
  for each row execute function extensions.moddatetime(updated_at);

-- =============================================================================
-- Historique des corrections
--
-- Immuable, comme le journal d'audit : aucune politique `update` ni `delete`
-- n'est créée. L'interdiction tient à l'absence de politique.
-- =============================================================================

create table public.grade_history (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  evaluation_id  uuid not null references public.evaluations(id) on delete cascade,
  student_id     uuid not null references public.students(id) on delete cascade,
  previous_score numeric(6,2),
  previous_value text,
  new_score      numeric(6,2),
  new_value      text,
  reason         text not null check (length(trim(reason)) >= 10),
  author_id      uuid references auth.users(id) on delete set null,
  changed_at     timestamptz not null default now()
);

comment on table public.grade_history is
  'Trace des corrections après verrouillage. Motif obligatoire, jamais modifiable.';

create index grade_history_evaluation_idx on public.grade_history (evaluation_id);

-- =============================================================================
-- Le verrou
-- =============================================================================

create or replace function app.evaluation_is_locked(p_evaluation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.evaluations e
    where e.id = p_evaluation_id
      and e.status in ('validated','published')
  );
$$;

-- Toute écriture directe sur une note verrouillée est refusée. Le seul chemin
-- restant est `app.correct_grade()`, qui exige un motif.
--
-- Note de conception : lors de la suppression en cascade d'une évaluation, la
-- ligne parente a déjà disparu quand ce déclencheur s'exécute ; l'évaluation
-- n'est donc plus « verrouillée » et la cascade passe. C'est voulu — retirer
-- une évaluation entière est un acte visible, effacer une note ne l'est pas.
create or replace function app.block_locked_grade()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_evaluation uuid;
begin
  v_evaluation := coalesce(new.evaluation_id, old.evaluation_id);

  if app.evaluation_is_locked(v_evaluation)
     and coalesce(current_setting('app.correction_en_cours', true), '') <> v_evaluation::text
  then
    raise exception 'Notes verrouillées : passez par app.correct_grade() avec un motif.'
      using errcode = 'check_violation';
  end if;

  return coalesce(new, old);
end;
$$;

create trigger grades_verrou
  before insert or update or delete on public.grades
  for each row execute function app.block_locked_grade();

-- Unique porte de sortie du verrou : elle écrit l'historique **avant** la note,
-- dans la même transaction. Pas de correction sans trace, par construction.
create or replace function app.correct_grade(
  p_evaluation_id uuid,
  p_student_id    uuid,
  p_score         numeric,
  p_value         text,
  p_reason        text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_tenant uuid;
  v_old_score numeric;
  v_old_value text;
begin
  if length(trim(coalesce(p_reason, ''))) < 10 then
    raise exception 'Le motif de correction doit comporter au moins 10 caractères.';
  end if;

  select e.tenant_id into v_tenant
  from public.evaluations e where e.id = p_evaluation_id;

  if v_tenant is null then
    raise exception 'Évaluation introuvable.';
  end if;

  if not app.has_permission(v_tenant, 'grades.update') then
    raise exception 'Corriger une note validée exige la permission grades.update.';
  end if;

  select g.score, g.value into v_old_score, v_old_value
  from public.grades g
  where g.evaluation_id = p_evaluation_id and g.student_id = p_student_id;

  insert into public.grade_history (
    tenant_id, evaluation_id, student_id,
    previous_score, previous_value, new_score, new_value,
    reason, author_id
  )
  values (v_tenant, p_evaluation_id, p_student_id,
          v_old_score, v_old_value, p_score, p_value,
          trim(p_reason), (select auth.uid()));

  -- Le déclencheur laisse passer tant que ce réglage désigne l'évaluation.
  perform set_config('app.correction_en_cours', p_evaluation_id::text, true);

  insert into public.grades (evaluation_id, student_id, score, value)
  values (p_evaluation_id, p_student_id, p_score, p_value)
  on conflict (evaluation_id, student_id) do update
    set score = excluded.score, value = excluded.value;

  perform set_config('app.correction_en_cours', '', true);
end;
$$;

comment on function app.correct_grade is
  'Corrige une note verrouillée. Écrit l''historique avant la note, motif obligatoire.';

revoke all on function app.correct_grade(uuid, uuid, numeric, text, text) from public, anon;
grant execute on function app.correct_grade(uuid, uuid, numeric, text, text) to authenticated;
revoke all on function app.evaluation_is_locked(uuid) from public, anon;
grant execute on function app.evaluation_is_locked(uuid) to authenticated;

-- =============================================================================
-- Sécurité au niveau des lignes
-- =============================================================================

alter table public.enrollments          enable row level security;
alter table public.enrollment_documents enable row level security;
alter table public.attendance_sheets    enable row level security;
alter table public.attendance_records   enable row level security;
alter table public.evaluations          enable row level security;
alter table public.grades               enable row level security;
alter table public.grade_history        enable row level security;

revoke all on public.enrollments, public.enrollment_documents,
              public.attendance_sheets, public.attendance_records,
              public.evaluations, public.grades, public.grade_history
  from anon;

grant select, insert, update, delete on
  public.enrollments, public.enrollment_documents,
  public.attendance_sheets, public.attendance_records,
  public.evaluations, public.grades
  to authenticated;

-- L'historique s'écrit, ne se réécrit jamais.
grant select, insert on public.grade_history to authenticated;

-- --- Inscriptions
create policy "inscriptions lisibles avec students read" on public.enrollments
  for select to authenticated using (app.has_permission(tenant_id, 'students.read'));

create policy "ecrire une inscription exige students create" on public.enrollments
  for all to authenticated
  using (app.has_permission(tenant_id, 'students.create'))
  with check (app.has_permission(tenant_id, 'students.create'));

create policy "pieces lisibles avec le dossier" on public.enrollment_documents
  for select to authenticated
  using (exists (select 1 from public.enrollments e
                 where e.id = enrollment_id
                   and app.has_permission(e.tenant_id, 'students.read')));

create policy "ecrire une piece exige students create" on public.enrollment_documents
  for all to authenticated
  using (exists (select 1 from public.enrollments e
                 where e.id = enrollment_id
                   and app.has_permission(e.tenant_id, 'students.create')))
  with check (exists (select 1 from public.enrollments e
                 where e.id = enrollment_id
                   and app.has_permission(e.tenant_id, 'students.create')));

-- --- Présences
create policy "feuilles visibles dans tout l etablissement" on public.attendance_sheets
  for select to authenticated
  using (app.has_permission(tenant_id, 'attendance.read')
         and app.sees_whole_tenant(tenant_id));

create policy "un enseignant voit les feuilles de ses classes" on public.attendance_sheets
  for select to authenticated
  using (app.has_permission(tenant_id, 'attendance.read')
         and class_id in (select app.teacher_class_ids()));

create policy "ecrire une feuille exige attendance manage" on public.attendance_sheets
  for all to authenticated
  using (app.has_permission(tenant_id, 'attendance.manage'))
  with check (app.has_permission(tenant_id, 'attendance.manage'));

create policy "lignes de presence suivent la feuille" on public.attendance_records
  for select to authenticated
  using (exists (select 1 from public.attendance_sheets s where s.id = sheet_id));

create policy "un parent voit les presences de ses enfants" on public.attendance_records
  for select to authenticated
  using (student_id in (select app.guardian_student_ids()));

create policy "ecrire une ligne de presence exige attendance manage" on public.attendance_records
  for all to authenticated
  using (exists (select 1 from public.attendance_sheets s
                 where s.id = sheet_id
                   and app.has_permission(s.tenant_id, 'attendance.manage')))
  with check (exists (select 1 from public.attendance_sheets s
                 where s.id = sheet_id
                   and app.has_permission(s.tenant_id, 'attendance.manage')));

-- --- Évaluations
create policy "evaluations visibles dans tout l etablissement" on public.evaluations
  for select to authenticated
  using (app.has_permission(tenant_id, 'grades.read')
         and app.sees_whole_tenant(tenant_id));

create policy "un enseignant voit les evaluations de ses classes" on public.evaluations
  for select to authenticated
  using (app.has_permission(tenant_id, 'grades.read')
         and class_id in (select app.teacher_class_ids()));

-- Les familles ne voient que ce qui est publié (GEMINI.md l. 108, 121).
create policy "familles et eleves voient les evaluations publiees" on public.evaluations
  for select to authenticated
  using (
    status = 'published'
    and exists (
      select 1 from public.students s
      where s.class_id = evaluations.class_id
        and (s.id in (select app.guardian_student_ids())
             or s.user_id = (select auth.uid()))
    )
  );

create policy "creer une evaluation exige grades enter" on public.evaluations
  for insert to authenticated
  with check (app.has_permission(tenant_id, 'grades.enter'));

create policy "modifier une evaluation exige grades enter" on public.evaluations
  for update to authenticated
  using (app.has_permission(tenant_id, 'grades.enter')
         or app.has_permission(tenant_id, 'grades.validate'))
  with check (app.has_permission(tenant_id, 'grades.enter')
         or app.has_permission(tenant_id, 'grades.validate'));

create policy "supprimer une evaluation exige grades update" on public.evaluations
  for delete to authenticated
  using (app.has_permission(tenant_id, 'grades.update'));

-- --- Notes
create policy "notes lisibles avec l evaluation" on public.grades
  for select to authenticated
  using (exists (select 1 from public.evaluations e where e.id = evaluation_id));

create policy "un parent voit les notes publiees de ses enfants" on public.grades
  for select to authenticated
  using (
    student_id in (select app.guardian_student_ids())
    and exists (select 1 from public.evaluations e
                where e.id = evaluation_id and e.status = 'published')
  );

create policy "saisir une note exige grades enter" on public.grades
  for all to authenticated
  using (exists (select 1 from public.evaluations e
                 where e.id = evaluation_id
                   and app.has_permission(e.tenant_id, 'grades.enter')))
  with check (exists (select 1 from public.evaluations e
                 where e.id = evaluation_id
                   and app.has_permission(e.tenant_id, 'grades.enter')));

-- --- Historique
create policy "historique lisible avec grades read" on public.grade_history
  for select to authenticated using (app.has_permission(tenant_id, 'grades.read'));

create policy "ecrire l historique exige grades update" on public.grade_history
  for insert to authenticated
  with check (app.has_permission(tenant_id, 'grades.update'));
