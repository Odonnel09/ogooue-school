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
import type { AcademicYear, TenantMembership } from '@/types';
import { hasAnyPermission, hasPermission, type Permission } from './permissions';

/**
 * Session de l'interface.
 *
 * Ce fournisseur ne **calcule** plus rien : il transporte ce que le layout
 * serveur a resolu. C'est la difference essentielle avec la version de
 * demonstration — les permissions ne se deduisent plus d'un fichier local mais
 * de la base, et le selecteur de role a disparu avec elle.
 *
 * Le controle realise ici reste **cosmetique** : il masque ce que
 * l'utilisateur ne peut pas faire, pour ne pas divulguer la structure
 * fonctionnelle. Ce qui refuse reellement, ce sont les politiques RLS.
 */
interface SessionContextValue {
  email: string;
  membership: TenantMembership;
  memberships: TenantMembership[];
  roleName: string;
  permissions: Permission[];
  can: (required: Permission | Permission[]) => boolean;
  canAny: (required: Permission[]) => boolean;
  academicYear: AcademicYear;
  setAcademicYearId: (id: string) => void;
  /** Une annee cloturee ou archivee est en lecture seule. */
  isYearWritable: boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  membership,
  memberships,
  permissions,
  email,
  children,
}: {
  membership: TenantMembership;
  memberships: TenantMembership[];
  /** Resolues cote serveur par `my_permissions()`. */
  permissions: string[];
  email: string;
  children: ReactNode;
}) {
  const [academicYearId, setAcademicYearId] = useState(CURRENT_ACADEMIC_YEAR);

  const granted = useMemo(() => permissions as Permission[], [permissions]);

  const academicYear = useMemo(
    () =>
      ACADEMIC_YEARS.find((year) => year.id === academicYearId) ??
      ACADEMIC_YEARS[0],
    [academicYearId],
  );

  const can = useCallback(
    (required: Permission | Permission[]) => hasPermission(granted, required),
    [granted],
  );

  const canAny = useCallback(
    (required: Permission[]) => hasAnyPermission(granted, required),
    [granted],
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      email,
      membership,
      memberships,
      roleName: membership.roleName,
      permissions: granted,
      can,
      canAny,
      academicYear,
      setAcademicYearId,
      isYearWritable:
        academicYear.status === 'active' || academicYear.status === 'draft',
    }),
    [email, membership, memberships, granted, can, canAny, academicYear],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error(
      'useSession doit etre utilise a l\u2019interieur de <SessionProvider>.',
    );
  }
  return context;
}

/** Raccourci de lecture des permissions. */
export function usePermissions() {
  const { permissions, can, canAny } = useSession();
  return { permissions, can, canAny };
}

/**
 * Masque son contenu si la permission n'est pas accordee.
 * On **masque** plutot qu'on ne desactive, pour ne pas divulguer la structure
 * fonctionnelle a un utilisateur qui n'y a pas droit.
 */
export function Can({
  permission,
  /** Exige aussi que l'annee scolaire selectionnee soit modifiable. */
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
