import type { TenantMembership } from '@/types';

/**
 * Établissements auxquels l'utilisateur de démonstration appartient.
 *
 * Trois appartenances, trois rôles différents : c'est ce qui rend le
 * multi-tenant visible. Le même compte est administrateur ici, secrétaire là,
 * censeur ailleurs.
 *
 * REMPLACEMENT SUPABASE : `select ... from memberships join tenants` filtré
 * par l'utilisateur de la session serveur. Cette liste ne transitera jamais
 * depuis le navigateur.
 */
export const MEMBERSHIPS: TenantMembership[] = [
  {
    tenantId: 'tnt-001',
    slug: 'demo',
    name: 'Complexe scolaire Ogooué',
    shortName: 'Ogooué',
    city: 'Libreville',
    type: 'Établissement privé laïc',
    logo: '🎓',
    roleId: 'role-admin',
    status: 'active',
  },
  {
    tenantId: 'tnt-002',
    slug: 'sainte-marie',
    name: 'Institution Sainte-Marie',
    shortName: 'Sainte-Marie',
    city: 'Port-Gentil',
    type: 'Établissement privé confessionnel',
    logo: '⛪',
    roleId: 'role-secretary',
    status: 'active',
  },
  {
    tenantId: 'tnt-003',
    slug: 'lekedi',
    name: 'Lycée technique de la Lékédi',
    shortName: 'Lékédi',
    city: 'Bakoumba',
    type: 'Établissement public technique',
    logo: '🔧',
    roleId: 'role-censor',
    status: 'active',
  },
  {
    tenantId: 'tnt-004',
    slug: 'nkembo',
    name: 'Groupe scolaire de Nkembo',
    shortName: 'Nkembo',
    city: 'Libreville',
    type: 'Établissement privé laïc',
    logo: '📚',
    roleId: 'role-teacher',
    // Invitation en attente : l'accès n'est pas encore ouvert.
    status: 'invitation',
  },
];

/** Établissement ouvert par défaut, quand aucun n'est demandé. */
export const DEFAULT_TENANT_SLUG = 'demo';
