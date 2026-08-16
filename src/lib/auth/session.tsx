'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ACADEMIC_YEARS, CURRENT_ACADEMIC_YEAR } from '@/data/academic';
import { DEFAULT_ROLE_ID, ROLES, permissionsOfRole } from '@/data/roles';
import { resolveMembership } from '@/lib/tenant/membership';
import type { AcademicYear, TenantMembership } from '@/types';
import { hasAnyPermission, hasPermission, type Permission } from './permissions';

/**
 * Session simulée : rôle actif et année scolaire sélectionnée.
 *
 * ⚠️ À cette étape il n'y a **aucune authentification réelle**. Le sélecteur de
 * rôle sert à éprouver l'interface. Lors du branchement Supabase, les
 * permissions seront résolues côté serveur et injectées ici — l'API consommée
 * par les composants (`can`, `canAny`) ne changera pas.
 */
interface SessionContextValue {
  /** Établissement actif et rôle qui y est détenu. */
  membership: TenantMembership | null;
  roleId: string;
  setRoleId: (roleId: string) => void;
  permissions: Permission[];
  can: (required: Permission | Permission[]) => boolean;
  canAny: (required: Permission[]) => boolean;
  academicYear: AcademicYear;
  setAcademicYearId: (id: string) => void;
  /** Une année clôturée ou archivée est en lecture seule. */
  isYearWritable: boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  tenantSlug,
  children,
}: {
  /** Slug déjà vérifié par le layout : le provider ne le remet pas en cause. */
  tenantSlug: string;
  children: ReactNode;
}) {
  const membership = resolveMembership(tenantSlug);

  const [roleId, setRoleId] = useState(
    () => membership?.roleId ?? DEFAULT_ROLE_ID,
  );
  const [academicYearId, setAcademicYearId] = useState(CURRENT_ACADEMIC_YEAR);

  /**
   * Le rôle suit l'établissement : on n'est pas administrateur partout.
   * Ajustement pendant le rendu plutôt qu'effet — le sélecteur de rôle de
   * démonstration reste libre ensuite, pour éprouver l'interface.
   */
  const [lastSlug, setLastSlug] = useState(tenantSlug);
  if (lastSlug !== tenantSlug) {
    setLastSlug(tenantSlug);
    setRoleId(membership?.roleId ?? DEFAULT_ROLE_ID);
  }

  const permissions = useMemo(() => permissionsOfRole(roleId), [roleId]);

  const academicYear = useMemo(
    () =>
      ACADEMIC_YEARS.find((year) => year.id === academicYearId) ??
      ACADEMIC_YEARS[0],
    [academicYearId],
  );

  const can = useCallback(
    (required: Permission | Permission[]) =>
      hasPermission(permissions, required),
    [permissions],
  );

  const canAny = useCallback(
    (required: Permission[]) => hasAnyPermission(permissions, required),
    [permissions],
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      membership,
      roleId,
      setRoleId,
      permissions,
      can,
      canAny,
      academicYear,
      setAcademicYearId,
      isYearWritable: academicYear.status === 'active' || academicYear.status === 'draft',
    }),
    [membership, roleId, permissions, can, canAny, academicYear],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession doit être utilisé à l’intérieur de <SessionProvider>.');
  }
  return context;
}

/** Raccourci de lecture des permissions. */
export function usePermissions() {
  const { permissions, can, canAny } = useSession();
  return { permissions, can, canAny };
}

/**
 * Masque son contenu si la permission n'est pas accordée.
 * On **masque** plutôt qu'on ne désactive, pour ne pas divulguer la structure
 * fonctionnelle à un utilisateur qui n'y a pas droit.
 */
export function Can({
  permission,
  /** Exige aussi que l'année scolaire sélectionnée soit modifiable. */
  requiresWritableYear = false,
  fallback = null,
  children,
}: {
  permission: Permission | Permission[];
  requiresWritableYear?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const { can, isYearWritable } = useSession();

  if (!can(permission)) return <>{fallback}</>;
  if (requiresWritableYear && !isYearWritable) return <>{fallback}</>;

  return <>{children}</>;
}

export { ROLES };
