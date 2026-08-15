/**
 * Permissions granulaires de la plateforme (`GEMINI.md`, l. 242-264).
 *
 * ⚠️ Le contrôle réalisé côté interface est **cosmétique** : il masque ce que
 * l'utilisateur ne peut pas faire pour ne pas divulguer la structure
 * fonctionnelle. La sécurité réelle sera portée par les Server Actions, les
 * Route Handlers et les politiques RLS Supabase.
 */
export const PERMISSIONS = [
  'students.read',
  'students.create',
  'students.update',
  'students.delete',
  'students.export',
  'teachers.manage',
  'classes.manage',
  'subjects.manage',
  'attendance.read',
  'attendance.manage',
  'grades.read',
  'grades.enter',
  'grades.update',
  'grades.validate',
  'grades.publish',
  'reports.generate',
  'reports.download',
  'payments.read',
  'payments.create',
  'payments.refund',
  'users.manage',
  'settings.manage',
  'audit.read',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  /** Un rôle système ne peut pas être supprimé depuis Paramètres. */
  isSystem: boolean;
}

export function hasPermission(
  granted: Permission[],
  required: Permission | Permission[],
): boolean {
  const list = Array.isArray(required) ? required : [required];
  return list.every((permission) => granted.includes(permission));
}

export function hasAnyPermission(
  granted: Permission[],
  required: Permission[],
): boolean {
  return required.some((permission) => granted.includes(permission));
}
