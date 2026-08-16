import type { Permission } from '@/lib/auth/permissions';
import { settingsMessages as m } from './messages';

/**
 * Registre des sections de Paramètres.
 *
 * `GEMINI.md` exige que la configuration soit intégralement recensée ici ;
 * les sections dont l'écran arrive plus tard sont donc listées, avec une
 * explication honnête plutôt qu'un lien mort.
 */
export type SettingsGroup =
  | 'establishment'
  | 'year'
  | 'evaluation'
  | 'enrollment'
  | 'access'
  | 'finance'
  | 'communication';

export interface SettingsSectionEntry {
  key: string;
  label: string;
  group: SettingsGroup;
  permission: Permission;
  /** Écran opérationnel, ou message d'attente. */
  ready: boolean;
  /** Message affiché lorsque `ready` vaut faux. */
  pending?: string;
  title: string;
  description: string;
}

export const SETTINGS_SECTIONS: SettingsSectionEntry[] = [
  {
    key: 'general',
    label: m.general.title,
    group: 'establishment',
    permission: 'settings.manage',
    ready: true,
    title: m.general.title,
    description: m.general.description,
  },
  {
    key: 'levels',
    label: m.levels.title,
    group: 'establishment',
    permission: 'settings.manage',
    ready: true,
    title: m.levels.title,
    description: m.levels.description,
  },
  {
    key: 'structure',
    label: m.structure.title,
    group: 'establishment',
    permission: 'settings.manage',
    ready: true,
    title: m.structure.title,
    description: m.structure.description,
  },
  {
    key: 'years',
    label: m.years.title,
    group: 'year',
    permission: 'settings.manage',
    ready: true,
    title: m.years.title,
    description: m.years.description,
  },
  {
    key: 'periods',
    label: m.periods.title,
    group: 'year',
    permission: 'settings.manage',
    ready: true,
    title: m.periods.title,
    description: m.periods.description,
  },
  {
    key: 'grading',
    label: m.grading.title,
    group: 'evaluation',
    permission: 'settings.manage',
    ready: true,
    title: m.grading.title,
    description: m.grading.description,
  },
  {
    key: 'report-templates',
    label: m.templates.reportTitle,
    group: 'evaluation',
    permission: 'settings.manage',
    ready: true,
    title: m.templates.reportTitle,
    description: m.templates.reportDescription,
  },
  {
    key: 'enrollment',
    label: m.enrollment.title,
    group: 'enrollment',
    permission: 'settings.manage',
    ready: true,
    title: m.enrollment.title,
    description: m.enrollment.description,
  },
  {
    key: 'cards',
    label: m.templates.cardTitle,
    group: 'enrollment',
    permission: 'settings.manage',
    ready: true,
    title: m.templates.cardTitle,
    description: m.templates.cardDescription,
  },
  {
    key: 'roles',
    label: m.roles.title,
    group: 'access',
    permission: 'settings.manage',
    ready: true,
    title: m.roles.title,
    description: m.roles.description,
  },
  {
    key: 'users',
    label: 'Utilisateurs',
    group: 'access',
    permission: 'users.manage',
    ready: false,
    pending: m.comingSoon.sections.users,
    title: 'Utilisateurs',
    description: 'Comptes, invitations et appartenances à l’établissement.',
  },
  {
    key: 'audit',
    label: 'Journal d’audit',
    group: 'access',
    permission: 'audit.read',
    ready: true,
    title: 'Journal d’audit',
    description: 'Trace des opérations sensibles réalisées dans l’établissement.',
  },
  {
    key: 'fees',
    label: m.fees.title,
    group: 'finance',
    permission: 'settings.manage',
    ready: true,
    title: m.fees.title,
    description: m.fees.description,
  },
  {
    key: 'integrations',
    label: 'Intégrations',
    group: 'finance',
    permission: 'settings.manage',
    ready: false,
    pending: m.comingSoon.sections.integrations,
    title: 'Intégrations',
    description: 'Encaissement Mobile Money et services externes.',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    group: 'communication',
    permission: 'settings.manage',
    ready: false,
    pending: m.comingSoon.sections.notifications,
    title: 'Notifications',
    description: 'Événements notifiés aux familles et aux enseignants.',
  },
  {
    key: 'messaging',
    label: m.messaging.title,
    group: 'communication',
    permission: 'settings.manage',
    ready: true,
    title: m.messaging.title,
    description: m.messaging.description,
  },
];

export function findSection(key: string): SettingsSectionEntry | undefined {
  return SETTINGS_SECTIONS.find((section) => section.key === key);
}

export const SETTINGS_GROUP_ORDER: SettingsGroup[] = [
  'establishment',
  'year',
  'evaluation',
  'enrollment',
  'access',
  'finance',
  'communication',
];
