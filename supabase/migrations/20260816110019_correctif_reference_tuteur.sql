-- =============================================================================
-- 007 · CORRECTIF DE RÉFÉRENCE DANS LA POLITIQUE « TUTEURS »
--
-- Dans la 006, la sous-requête écrivait `gl.guardian_id = id`. PostgreSQL
-- résout un nom non qualifié sur la table la plus interne : `id` désignait
-- donc `guardian_links.id`, et la condition comparait un rattachement à
-- lui-même. Résultat : aucun tuteur n'était visible pour un enseignant.
--
-- Le défaut ne se voyait pas sur l'épreuve négative — « 0 tuteur visible »
-- ressemblait au correctif attendu. Seule la contre-épreuve, en rattachant un
-- tuteur à un élève de sa classe, l'a mis au jour.
--
-- Leçon retenue pour les migrations suivantes : dans une politique, toujours
-- qualifier la colonne de la table protégée par son nom de table.
-- =============================================================================

drop policy "un enseignant voit les tuteurs de ses eleves" on public.guardians;

create policy "un enseignant voit les tuteurs de ses eleves" on public.guardians
  for select to authenticated
  using (
    app.has_permission(guardians.tenant_id, 'students.read')
    and exists (
      select 1 from public.guardian_links gl
      where gl.guardian_id = guardians.id
        and gl.student_id in (select app.teacher_student_ids())
    )
  );
