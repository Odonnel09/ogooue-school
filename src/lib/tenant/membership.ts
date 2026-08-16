import type { TenantMembership } from '@/types';
import { MEMBERSHIPS } from '@/data/memberships';

/**
 * RÉSOLUTION DE L'ÉTABLISSEMENT DEMANDÉ.
 *
 * Le segment `[tenant]` de l'URL exprime une **demande**. La seule question qui
 * vaille est : l'utilisateur appartient-il à cet établissement ? Tant que la
 * réponse n'est pas oui, aucune donnée ne doit être rendue.
 *
 * Ces fonctions sont pures et sans « use client » : elles s'exécutent aussi
 * bien dans le layout serveur — c'est d'ailleurs là qu'elles comptent.
 *
 * REMPLACEMENT SUPABASE : `resolveMembership()` deviendra une requête sur
 * `memberships` filtrée par l'utilisateur de la session serveur, doublée de
 * politiques RLS sur chaque table. Le contrôle réalisé ici ne protège rien
 * par lui-même : il évite d'afficher une coquille vide, rien de plus.
 */

/** Appartenances ouvertes : une invitation en attente n'ouvre aucun accès. */
export function activeMemberships(): TenantMembership[] {
  return MEMBERSHIPS.filter((membership) => membership.status === 'active');
}

/** Appartenance correspondant au slug demandé, `null` si l'accès n'est pas ouvert. */
export function resolveMembership(slug: string): TenantMembership | null {
  return (
    activeMemberships().find((membership) => membership.slug === slug) ?? null
  );
}

/**
 * Appartenance connue mais non ouverte (invitation, suspension).
 * Sert à distinguer « établissement inconnu » de « accès pas encore ouvert » :
 * le message d'erreur n'est pas le même, et l'utilisateur n'y peut pas la même
 * chose.
 */
export function pendingMembership(slug: string): TenantMembership | null {
  return (
    MEMBERSHIPS.find(
      (membership) =>
        membership.slug === slug && membership.status !== 'active',
    ) ?? null
  );
}
