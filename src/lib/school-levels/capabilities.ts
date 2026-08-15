import type {
  Cycle,
  EvaluationType,
  GradingKind,
  GradingScale,
  PeriodKind,
} from '@/types';

/**
 * MATRICE DE CAPACITÉS — source unique de vérité des règles par niveau scolaire.
 *
 * Elle n'a que **trois consommateurs autorisés** :
 *   1. la navigation (`components/layout/Sidebar`),
 *   2. la génération des formulaires (`features/*`),
 *   3. le moteur de notation (`lib/grading`).
 *
 * Aucun autre fichier n'a le droit de tester un cycle ou un type de notation.
 * Cette interdiction est outillée : voir la règle `no-restricted-syntax` dans
 * `eslint.config.mjs`, qui rejette toute comparaison littérale à un cycle
 * en dehors de `lib/school-levels/` et `lib/grading/`.
 */

/** Entrées de navigation possibles de l'espace établissement. */
export type MenuKey =
  | 'dashboard'
  | 'students'
  | 'enrollments'
  | 'guardians'
  | 'teachers'
  | 'classes'
  | 'subjects'
  | 'timetable'
  | 'attendance'
  | 'evaluations'
  | 'reports'
  | 'finance'
  | 'documents'
  | 'library'
  | 'announcements'
  | 'messages'
  | 'audit'
  | 'settings'
  | 'account';

/** Blocs optionnels du dossier élève, activés selon le cycle. */
export type StudentFieldKey =
  | 'birthPlace'
  | 'nationality'
  | 'address'
  | 'guardian'
  | 'authorizedPickup'
  | 'medicalInfo'
  | 'previousSchool'
  | 'academicTrack';

export type ReportTemplateKey =
  | 'carnet_suivi'
  | 'bulletin_competences'
  | 'bulletin_trimestriel'
  | 'releve_notes';

export type PortalSectionKey =
  | 'grades'
  | 'observations'
  | 'attendance'
  | 'timetable'
  | 'invoices'
  | 'documents';

/** Comment on nomme un regroupement d'élèves à ce niveau. */
export type ClassTaxonomy = 'classe' | 'groupe' | 'promotion';

export interface LevelCapabilities {
  menus: MenuKey[];
  gradingKind: GradingKind;
  /** Barèmes proposés à la création d'une évaluation. Le premier est le défaut. */
  gradingScales: GradingScale[];
  evaluationKinds: EvaluationType[];
  periodKinds: PeriodKind[];
  hasCoefficients: boolean;
  hasCredits: boolean;
  hasCompensation: boolean;
  /** Sessions normale et de rattrapage. */
  hasSessions: boolean;
  classTaxonomy: ClassTaxonomy;
  studentFields: StudentFieldKey[];
  reportTemplate: ReportTemplateKey;
  portalSections: PortalSectionKey[];
}

const COMMON_MENUS: MenuKey[] = [
  'dashboard',
  'students',
  'enrollments',
  'guardians',
  'teachers',
  'classes',
  'timetable',
  'attendance',
  'evaluations',
  'reports',
  'finance',
  'documents',
  'library',
  'announcements',
  'messages',
  'audit',
  'settings',
  'account',
];

/** Menus des cycles disposant d'un catalogue de matières. */
const MENUS_WITH_SUBJECTS: MenuKey[] = [...COMMON_MENUS, 'subjects'];

export const LEVEL_CAPABILITIES: Record<Cycle, LevelCapabilities> = {
  garderie: {
    menus: COMMON_MENUS,
    gradingKind: 'qualitative',
    gradingScales: ['acquis'],
    evaluationKinds: ['observation', 'bilan_periodique'],
    periodKinds: ['trimestre', 'personnalise'],
    hasCoefficients: false,
    hasCredits: false,
    hasCompensation: false,
    hasSessions: false,
    classTaxonomy: 'groupe',
    studentFields: [
      'birthPlace',
      'nationality',
      'address',
      'guardian',
      'authorizedPickup',
      'medicalInfo',
    ],
    reportTemplate: 'carnet_suivi',
    portalSections: ['observations', 'attendance', 'invoices', 'documents'],
  },

  prescolaire: {
    menus: COMMON_MENUS,
    gradingKind: 'qualitative',
    gradingScales: ['acquis'],
    evaluationKinds: ['observation', 'bilan_periodique'],
    periodKinds: ['trimestre', 'personnalise'],
    hasCoefficients: false,
    hasCredits: false,
    hasCompensation: false,
    hasSessions: false,
    classTaxonomy: 'groupe',
    studentFields: [
      'birthPlace',
      'nationality',
      'address',
      'guardian',
      'authorizedPickup',
      'medicalInfo',
    ],
    reportTemplate: 'carnet_suivi',
    portalSections: ['observations', 'attendance', 'invoices', 'documents'],
  },

  primaire: {
    menus: MENUS_WITH_SUBJECTS,
    gradingKind: 'competency',
    gradingScales: ['competence', 'sur_10'],
    evaluationKinds: ['evaluation_competence', 'devoir', 'bilan_periodique'],
    periodKinds: ['trimestre', 'personnalise'],
    hasCoefficients: false,
    hasCredits: false,
    hasCompensation: false,
    hasSessions: false,
    classTaxonomy: 'classe',
    studentFields: [
      'birthPlace',
      'nationality',
      'address',
      'guardian',
      'authorizedPickup',
      'medicalInfo',
    ],
    reportTemplate: 'bulletin_competences',
    portalSections: [
      'grades',
      'attendance',
      'timetable',
      'invoices',
      'documents',
    ],
  },

  college: {
    menus: MENUS_WITH_SUBJECTS,
    gradingKind: 'numeric_weighted',
    gradingScales: ['sur_20', 'sur_10', 'pourcentage', 'personnalise'],
    evaluationKinds: [
      'devoir',
      'controle',
      'composition',
      'examen',
      'oral',
      'autre',
    ],
    periodKinds: ['trimestre', 'sequence'],
    hasCoefficients: true,
    hasCredits: false,
    hasCompensation: false,
    hasSessions: false,
    classTaxonomy: 'classe',
    studentFields: [
      'birthPlace',
      'nationality',
      'address',
      'guardian',
      'previousSchool',
    ],
    reportTemplate: 'bulletin_trimestriel',
    portalSections: [
      'grades',
      'attendance',
      'timetable',
      'invoices',
      'documents',
    ],
  },

  lycee: {
    menus: MENUS_WITH_SUBJECTS,
    gradingKind: 'numeric_weighted',
    gradingScales: ['sur_20', 'sur_10', 'pourcentage', 'personnalise'],
    evaluationKinds: [
      'devoir',
      'controle',
      'composition',
      'examen',
      'oral',
      'autre',
    ],
    periodKinds: ['trimestre', 'sequence'],
    hasCoefficients: true,
    hasCredits: false,
    hasCompensation: false,
    hasSessions: false,
    classTaxonomy: 'classe',
    studentFields: [
      'birthPlace',
      'nationality',
      'address',
      'guardian',
      'previousSchool',
    ],
    reportTemplate: 'bulletin_trimestriel',
    portalSections: [
      'grades',
      'attendance',
      'timetable',
      'invoices',
      'documents',
    ],
  },

  superieur: {
    menus: MENUS_WITH_SUBJECTS,
    gradingKind: 'lmd',
    gradingScales: ['sur_20', 'ects'],
    evaluationKinds: [
      'controle_continu',
      'examen',
      'tp',
      'projet',
      'rattrapage',
      'autre',
    ],
    periodKinds: ['semestre'],
    hasCoefficients: true,
    hasCredits: true,
    hasCompensation: true,
    hasSessions: true,
    classTaxonomy: 'promotion',
    studentFields: [
      'birthPlace',
      'nationality',
      'address',
      'previousSchool',
      'academicTrack',
    ],
    reportTemplate: 'releve_notes',
    portalSections: [
      'grades',
      'attendance',
      'timetable',
      'invoices',
      'documents',
    ],
  },
};

export function capabilitiesOf(cycle: Cycle): LevelCapabilities {
  return LEVEL_CAPABILITIES[cycle];
}

/* -------------------------------------------------------------------------- */
/* Agrégation sur les cycles actifs de l'établissement                        */
/* -------------------------------------------------------------------------- */

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

/** Menus visibles = union des capacités des cycles actifs. */
export function menusFor(activeCycles: Cycle[]): MenuKey[] {
  return unique(activeCycles.flatMap((cycle) => LEVEL_CAPABILITIES[cycle].menus));
}

/** Types d'évaluation proposés sur l'ensemble des cycles actifs. */
export function evaluationKindsFor(activeCycles: Cycle[]): EvaluationType[] {
  return unique(
    activeCycles.flatMap((cycle) => LEVEL_CAPABILITIES[cycle].evaluationKinds),
  );
}

/** Barèmes proposés sur l'ensemble des cycles actifs. */
export function gradingScalesFor(activeCycles: Cycle[]): GradingScale[] {
  return unique(
    activeCycles.flatMap((cycle) => LEVEL_CAPABILITIES[cycle].gradingScales),
  );
}

/** Découpages de période proposés sur l'ensemble des cycles actifs. */
export function periodKindsFor(activeCycles: Cycle[]): PeriodKind[] {
  return unique(
    activeCycles.flatMap((cycle) => LEVEL_CAPABILITIES[cycle].periodKinds),
  );
}

/** Blocs de dossier élève à afficher sur l'ensemble des cycles actifs. */
export function studentFieldsFor(activeCycles: Cycle[]): StudentFieldKey[] {
  return unique(
    activeCycles.flatMap((cycle) => LEVEL_CAPABILITIES[cycle].studentFields),
  );
}

/** Vrai si au moins un cycle actif utilise la capacité demandée. */
export function anyCycleHas(
  activeCycles: Cycle[],
  capability: 'hasCoefficients' | 'hasCredits' | 'hasCompensation' | 'hasSessions',
): boolean {
  return activeCycles.some((cycle) => LEVEL_CAPABILITIES[cycle][capability]);
}
