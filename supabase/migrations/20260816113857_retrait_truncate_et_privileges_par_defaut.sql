-- =============================================================================
-- 012 · RETRAIT DE TRUNCATE — CORRECTIF DE SÉCURITÉ
--
-- Trouvé à l'épreuve, et sans rapport avec une politique mal écrite : un
-- utilisateur authentifié quelconque pouvait exécuter
--
--     truncate table public.audit_logs;
--
-- et effacer le journal d'audit entier. Vérifié : la table est passée de 1 à
-- 0 ligne sous l'identité d'un simple enseignant.
--
-- POURQUOI. `TRUNCATE` n'est pas un `DELETE` en plus rapide : il **ignore la
-- RLS** et ne déclenche **aucun garde-fou de ligne**. Toutes les protections
-- écrites depuis la migration 001 — politiques, verrou des notes, gel des
-- bulletins, immuabilité de l'audit — le supposaient impossible.
--
-- D'OÙ VENAIT LE DROIT. Supabase accorde par défaut l'ensemble des privilèges
-- sur les tables du schéma `public` aux rôles `anon` et `authenticated`. Un
-- `grant select, insert` n'y retranche rien : il n'ajoute qu'à ce qui est déjà
-- accordé. Il fallait révoquer.
--
-- Portée du défaut : 40 tables sur 40 étaient concernées.
--
-- Ce correctif retire le droit sur l'existant ET modifie les privilèges par
-- défaut, pour que les tables des migrations suivantes ne le reçoivent pas.
-- =============================================================================

-- =============================================================================
-- L'existant
-- =============================================================================

do $$
declare r record;
begin
  for r in
    select tablename from pg_tables where schemaname = 'public'
  loop
    execute format(
      'revoke truncate, references, trigger on public.%I from anon, authenticated',
      r.tablename);
  end loop;
end $$;

-- Tables strictement append-only : le droit d'écrire ne doit pas emporter
-- celui de réécrire.
revoke update, delete on public.audit_logs    from anon, authenticated;
revoke update, delete on public.grade_history from anon, authenticated;

-- `permissions` est un catalogue de référence : lecture seule pour les clients.
revoke insert, update, delete on public.permissions from anon, authenticated;

-- =============================================================================
-- L'avenir
--
-- Sans cela, la prochaine table créée hériterait à nouveau de TRUNCATE.
-- =============================================================================

alter default privileges in schema public
  revoke truncate, references, trigger on tables from anon, authenticated;

-- Le schéma `app` n'expose que des fonctions ; aucune table ne doit y naître
-- avec des droits clients.
alter default privileges in schema app
  revoke all on tables from anon, authenticated;
