-- =============================================================================
-- 003 · ACCÈS AU SCHÉMA `app`
--
-- Correctif de la 001 : `grant execute` sur une fonction reste sans effet si
-- l'appelant n'a pas `usage` sur le schéma qui la contient. Les politiques RLS
-- n'étaient pas concernées — PostgreSQL évalue leurs expressions pour le
-- compte du propriétaire de la table — mais tout appel direct depuis le client
-- échouait avec « permission denied for schema app ».
--
-- Découvert en éprouvant le cloisonnement, pas en relisant le code : d'où
-- l'intérêt de faire parler la base avec de vrais jetons.
-- =============================================================================

grant usage on schema app to authenticated;

-- `anon` reste exclu : aucune donnée de cette application n'est publique.
revoke usage on schema app from anon, public;
