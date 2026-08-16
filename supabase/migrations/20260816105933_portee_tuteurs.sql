-- =============================================================================
-- 006 · PORTÉE DES TUTEURS
--
-- Correctif de la 005, trouvé à l'épreuve : la visibilité des tuteurs était
-- accordée sur la seule détention de `students.read`. Or un enseignant la
-- détient, et voyait donc les familles d'élèves qu'il n'a pas en classe.
--
-- La règle appliquée aux élèves n'avait pas été appliquée à ce qui gravite
-- autour d'eux. Un tuteur est une donnée personnelle de plus, pas de moins.
-- =============================================================================

-- Élèves relevant du périmètre d'enseignement de l'utilisateur.
create or replace function app.teacher_student_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select s.id
  from public.students s
  where s.class_id in (select app.teacher_class_ids());
$$;

comment on function app.teacher_student_ids is
  'Élèves des classes auxquelles l''utilisateur est affecté.';

revoke all on function app.teacher_student_ids() from public, anon;
grant execute on function app.teacher_student_ids() to authenticated;

-- --- Tuteurs
drop policy "tuteurs lisibles avec students read" on public.guardians;

create policy "tuteurs visibles dans tout l etablissement" on public.guardians
  for select to authenticated
  using (
    app.has_permission(tenant_id, 'students.read')
    and app.sees_whole_tenant(tenant_id)
  );

-- ATTENTION : cette version comporte un défaut de résolution de nom, corrigé
-- en 007. `id` non qualifié y désigne `guardian_links.id`, pas `guardians.id`.
create policy "un enseignant voit les tuteurs de ses eleves" on public.guardians
  for select to authenticated
  using (
    app.has_permission(tenant_id, 'students.read')
    and exists (
      select 1 from public.guardian_links gl
      where gl.guardian_id = id
        and gl.student_id in (select app.teacher_student_ids())
    )
  );

-- --- Rattachements tuteur/élève
drop policy "rattachements lisibles avec students read" on public.guardian_links;

create policy "rattachements visibles dans tout l etablissement" on public.guardian_links
  for select to authenticated
  using (
    app.has_permission(tenant_id, 'students.read')
    and app.sees_whole_tenant(tenant_id)
  );

create policy "un enseignant voit les rattachements de ses eleves" on public.guardian_links
  for select to authenticated
  using (
    app.has_permission(tenant_id, 'students.read')
    and student_id in (select app.teacher_student_ids())
  );
