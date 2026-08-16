-- =============================================================================
-- 013 · FAÇADES RPC PUBLIQUES
--
-- Le schéma `app` n'est pas exposé par l'API, et c'est voulu : il contient les
-- fonctions de sécurité, dont `bootstrap_tenant()` et
-- `confirm_provider_payment()` qui ne doivent jamais être joignables depuis un
-- navigateur.
--
-- L'interface a pourtant besoin de deux choses. On expose donc deux façades
-- dans `public` — exactement deux — plutôt que d'ouvrir le schéma entier.
-- =============================================================================

-- Corriger une note verrouillée. Délègue à `app.correct_grade()`, qui exige le
-- motif et écrit l'historique avant la note.
create or replace function public.correct_grade(
  p_evaluation_id uuid,
  p_student_id    uuid,
  p_score         numeric,
  p_value         text,
  p_reason        text
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select app.correct_grade(p_evaluation_id, p_student_id, p_score, p_value, p_reason);
$$;

comment on function public.correct_grade is
  'Façade RPC. Les contrôles réels sont dans app.correct_grade().';

-- Permissions détenues dans un établissement. Évite à l'interface de
-- reconstituer la jointure memberships × role_permissions à chaque écran.
--
-- NOTE : créée ici en `security definer`, ce qui n'était pas justifié.
-- La migration 014 la repasse en `security invoker`.
create or replace function public.my_permissions(p_tenant_id uuid)
returns setof text
language sql
stable
security definer
set search_path = ''
as $$
  select rp.permission_key
  from public.memberships m
  join public.role_permissions rp on rp.role_id = m.role_id
  where m.user_id = (select auth.uid())
    and m.tenant_id = p_tenant_id
    and m.status = 'active';
$$;

comment on function public.my_permissions is
  'Permissions de l''utilisateur courant dans cet établissement. Lecture seule.';

revoke all on function public.correct_grade(uuid, uuid, numeric, text, text) from public, anon;
revoke all on function public.my_permissions(uuid) from public, anon;

grant execute on function public.correct_grade(uuid, uuid, numeric, text, text) to authenticated;
grant execute on function public.my_permissions(uuid) to authenticated;
