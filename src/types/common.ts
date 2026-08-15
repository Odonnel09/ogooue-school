/**
 * Types transverses partagés par tous les modules métier.
 *
 * NOTE MIGRATION : ces types décrivent la forme des données attendue par l'UI.
 * Lors du branchement Supabase, seuls les modules `src/data/*` et `src/lib/store/*`
 * devront changer — les composants continueront de consommer ces types.
 */

/** Cycles d'enseignement couverts par la plateforme. */
export type Cycle =
  | 'garderie'
  | 'prescolaire'
  | 'primaire'
  | 'college'
  | 'lycee'
  | 'superieur';

export const CYCLES: Cycle[] = [
  'garderie',
  'prescolaire',
  'primaire',
  'college',
  'lycee',
  'superieur',
];

/** Un niveau scolaire concret (6ème, Terminale, Licence 1...). */
export interface Level {
  id: string;
  label: string;
  cycle: Cycle;
  /** Ordre d'affichage dans les listes déroulantes. */
  order: number;
}

/**
 * Moteur de notation applicable à un cycle.
 * La stratégie de calcul correspondante vit dans `src/lib/grading/strategies/`.
 */
export type GradingKind =
  | 'qualitative'
  | 'competency'
  | 'numeric_weighted'
  | 'lmd';

/** Découpage temporel de l'année, propre à chaque cycle. */
export type PeriodKind = 'trimestre' | 'semestre' | 'sequence' | 'personnalise';

/** États d'une année scolaire. Une année close est en lecture seule. */
export type AcademicYearStatus = 'draft' | 'active' | 'closed' | 'archived';

/** Année scolaire, identifiée par son libellé (ex: « 2026-2027 »). */
export interface AcademicYear {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  status: AcademicYearStatus;
}

/** Période d'évaluation (trimestre ou semestre selon le cycle). */
export interface Period {
  id: string;
  label: string;
  kind: PeriodKind;
  /** Cycles auxquels la période s'applique. */
  cycles: Cycle[];
}

/**
 * Échelles de saisie disponibles.
 * Le choix réellement proposé à l'utilisateur dépend du `GradingKind` du cycle :
 * aucun composant ne doit filtrer cette liste lui-même.
 */
export type GradingScale =
  | 'sur_20'
  | 'sur_10'
  | 'pourcentage'
  | 'acquis'
  | 'competence'
  | 'personnalise'
  | 'ects';

/** Palette des badges de statut, alignée sur les accents du tableau de bord. */
export type BadgeTone =
  | 'brand'
  | 'green'
  | 'orange'
  | 'blue'
  | 'yellow'
  | 'red'
  | 'slate';

/** Description d'un statut affichable (libellé + couleur). */
export interface StatusMeta {
  label: string;
  tone: BadgeTone;
}

export type Gender = 'M' | 'F';

/** Option générique pour les `<select>` et filtres. */
export interface SelectOption {
  value: string;
  label: string;
}

/** Document attaché à une fiche (élève, enseignant, annonce...). */
export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
}
