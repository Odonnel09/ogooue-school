-- =============================================================================
-- 014 · `my_permissions` REPASSE EN `security invoker`
--
-- Signalé par l'analyseur de sécurité de Supabase : une fonction
-- `security definer` joignable par tout utilisateur connecté mérite d'être
-- justifiée. Ici, elle ne l'était pas.
--
-- `my_permissions` ne lit que `memberships` et `role_permissions`, deux tables
-- dont les politiques restreignent déjà l'utilisateur à ses propres lignes.
-- L'élévation de privilège n'apportait rien et retirait une protection : en
-- `security invoker`, la RLS s'applique en plus du filtre `auth.uid()`.
--
-- Règle retenue : `security definer` seulement quand la RLS empêcherait la
-- fonction de faire son travail — typiquement pour rompre une récursion.
-- =============================================================================

create or replace function public.my_permissions(p_tenant_id uuid)
returns setof text
language sql
stable
security invoker
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
  'Permissions de l''utilisateur courant dans cet établissement. RLS appliquée.';
