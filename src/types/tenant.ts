import type { BadgeTone } from './common';

/**
 * APPARTENANCE À UN ÉTABLISSEMENT.
 *
 * Le multi-tenant de `GEMINI.md` (l. 283-284) n'est pas « un utilisateur, un
 * établissement » : c'est une relation à trois termes — un utilisateur, un
 * établissement, et le rôle qu'il y détient. Le même directeur peut être
 * secrétaire ailleurs. Le rôle n'est donc pas une propriété de la personne.
 *
 * ⚠️ Règle capitale : **ne jamais faire confiance au `tenant_id` fourni par le
 * navigateur** (l. 404). Le segment `[tenant]` de l'URL est une demande, pas
 * une autorisation ; l'appartenance se vérifie hors du navigateur.
 *
 * REMPLACEMENT SUPABASE : table `memberships (user_id, tenant_id, role_id)`,
 * lue côté serveur depuis la session, et politiques RLS s'appuyant dessus.
 */
export type MembershipStatus = 'active' | 'invitation' | 'suspendue';

export const MEMBERSHIP_STATUS_TONES: Record<MembershipStatus, BadgeTone> = {
  active: 'green',
  invitation: 'yellow',
  suspendue: 'slate',
};

export interface TenantMembership {
  tenantId: string;
  /** Segment d'URL de l'établissement. */
  slug: string;
  name: string;
  shortName: string;
  city: string;
  type: string;
  /** Emoji tenant lieu de logo tant que le stockage n'est pas branché. */
  logo: string;
  /** Rôle détenu **dans cet établissement**, pas dans la plateforme. */
  roleId: string;
  /** Libellé du rôle, résolu côté serveur — l'interface ne le recalcule pas. */
  roleName: string;
  status: MembershipStatus;
}
