import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckSquare,
  ClipboardCheck,
  ClipboardList,
  FileBadge,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Library,
  Settings,
  UserCircle,
  Users,
  UsersRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { MenuKey } from '@/lib/school-levels/capabilities';
import type { Permission } from '@/lib/auth/permissions';

/**
 * Registre de navigation.
 *
 * Une entrée s'affiche si, et seulement si :
 *   1. un cycle actif de l'établissement la déclare (matrice de capacités),
 *   2. l'utilisateur détient au moins une des permissions requises,
 *   3. la route existe (`implemented`) — on ne crée jamais de lien mort.
 */
export interface NavEntry {
  key: MenuKey;
  icon: LucideIcon;
  href: string;
  /** Une seule de ces permissions suffit. Vide = toujours visible. */
  permissions: Permission[];
  implemented: boolean;
}

export const NAV_ENTRIES: NavEntry[] = [
  {
    key: 'dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    permissions: [],
    implemented: true,
  },
  {
    key: 'students',
    icon: GraduationCap,
    href: '/students',
    permissions: ['students.read'],
    implemented: true,
  },
  {
    key: 'teachers',
    icon: Users,
    href: '/teachers',
    permissions: ['teachers.manage', 'students.read'],
    implemented: true,
  },
  {
    key: 'enrollments',
    icon: ClipboardCheck,
    href: '/enrollments',
    permissions: ['students.read'],
    implemented: true,
  },
  {
    key: 'guardians',
    icon: UsersRound,
    href: '/guardians',
    permissions: ['students.read'],
    implemented: true,
  },
  {
    key: 'library',
    icon: Library,
    href: '/library',
    permissions: [],
    implemented: true,
  },
  {
    key: 'account',
    icon: UserCircle,
    href: '/account',
    permissions: [],
    implemented: true,
  },
  {
    key: 'classes',
    icon: BookOpen,
    href: '/classes',
    permissions: ['classes.manage', 'students.read'],
    implemented: true,
  },
  {
    key: 'subjects',
    icon: ClipboardList,
    href: '/subjects',
    permissions: ['subjects.manage', 'students.read'],
    implemented: true,
  },
  {
    key: 'timetable',
    icon: CalendarDays,
    href: '/timetable',
    permissions: ['classes.manage', 'attendance.read'],
    implemented: true,
  },
  {
    key: 'attendance',
    icon: CheckSquare,
    href: '/attendance',
    permissions: ['attendance.read'],
    implemented: true,
  },
  {
    key: 'evaluations',
    icon: FileText,
    href: '/evaluations',
    permissions: ['grades.read'],
    implemented: true,
  },
  {
    key: 'announcements',
    icon: Bell,
    href: '/announcements',
    permissions: [],
    implemented: true,
  },

  // Modules déclarés par la matrice, écrans à construire en phase B.

  { key: 'documents', icon: FileText, href: '/documents', permissions: [], implemented: false },
  { key: 'messages', icon: Bell, href: '/messages', permissions: [], implemented: false },
  { key: 'audit', icon: FileText, href: '/audit', permissions: ['audit.read'], implemented: false },
  {
    key: 'reports',
    icon: FileBadge,
    href: '/reports',
    permissions: ['reports.generate', 'reports.download'],
    implemented: true,
  },
  {
    key: 'finance',
    icon: Wallet,
    href: '/finance',
    permissions: ['payments.read'],
    implemented: true,
  },
  {
    key: 'settings',
    icon: Settings,
    href: '/settings',
    permissions: ['settings.manage'],
    implemented: true,
  },
];
