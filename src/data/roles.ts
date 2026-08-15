import { PERMISSIONS, type Permission, type Role } from '@/lib/auth/permissions';

/**
 * Rôles de l'établissement de démonstration.
 * REMPLACEMENT SUPABASE : tables `roles` et `role_permissions`, résolues
 * côté serveur — jamais lues depuis un JWT potentiellement périmé.
 */
export const ROLES: Role[] = [
  {
    id: 'role-admin',
    name: 'Administrateur',
    description:
      'Accès complet à l’établissement : configuration, finances, validation et publication des notes.',
    permissions: [...PERMISSIONS],
    isSystem: true,
  },
  {
    id: 'role-secretary',
    name: 'Secrétaire',
    description:
      'Gestion des dossiers, des inscriptions et des documents. Consulte les paiements sans pouvoir les rembourser.',
    permissions: [
      'students.read',
      'students.create',
      'students.update',
      'students.export',
      'classes.manage',
      'attendance.read',
      'attendance.manage',
      'grades.read',
      'reports.generate',
      'reports.download',
      'payments.read',
      'payments.create',
    ],
    isSystem: true,
  },
  {
    id: 'role-teacher',
    name: 'Enseignant',
    description:
      'Consulte ses classes, fait l’appel et saisit les notes de ses évaluations.',
    permissions: [
      'students.read',
      'attendance.read',
      'attendance.manage',
      'grades.read',
      'grades.enter',
      'reports.download',
    ],
    isSystem: true,
  },
  {
    id: 'role-censor',
    name: 'Censeur',
    description:
      'Rôle personnalisé : supervise la vie scolaire et valide les notes sans accès aux finances.',
    permissions: [
      'students.read',
      'students.update',
      'teachers.manage',
      'classes.manage',
      'subjects.manage',
      'attendance.read',
      'attendance.manage',
      'grades.read',
      'grades.update',
      'grades.validate',
      'grades.publish',
      'reports.generate',
      'reports.download',
      'audit.read',
    ],
    isSystem: false,
  },
];

export const DEFAULT_ROLE_ID = 'role-admin';

export function permissionsOfRole(roleId: string): Permission[] {
  return ROLES.find((role) => role.id === roleId)?.permissions ?? [];
}
