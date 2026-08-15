import type { EvaluationType, GradingKind, GradingScale } from '@/types';

/**
 * Configuration de notation d'un cycle. Elle vit dans la configuration de
 * l'établissement (`tenant-config`) et est éditable depuis Paramètres.
 * Aucune de ces valeurs n'est codée dans un composant.
 */
export interface GradingConfig {
  kind: GradingKind;
  scale: GradingScale;
  maxScore: number;
  rounding: 'round_half_up' | 'truncate' | 'nearest_quarter';
  /** Traitement des évaluations non saisies ou de l'élève absent. */
  absencePolicy: 'exclude' | 'count_as_zero';
  /** Seuil de réussite, exprimé sur l'échelle normalisée /20. */
  passMark: number;
  /** Poids additionnel par type d'évaluation (1 si absent). */
  weights: Partial<Record<EvaluationType, number>>;
  /** Mentions, de la plus haute à la plus basse, seuil sur /20. */
  mentions: Array<{ label: string; min: number }>;
  /** Compensation entre unités d'enseignement (LMD). */
  compensation: boolean;
  /** Session de rattrapage (LMD). */
  sessions: boolean;
  /** Note minimale ouvrant droit au rattrapage, sur /20. */
  resitThreshold: number;
}

/** Une note, normalisée pour le moteur : aucun type applicatif ici. */
export interface GradeInput {
  studentId: string;
  score: number | null;
  value: string | null;
  scale: GradingScale;
  maxScore: number;
  evaluationType: EvaluationType;
  /** Coefficient propre à l'évaluation. */
  coefficient: number;
  absent?: boolean;
}

/** Poids de la matière dans la classe (porté par `ClassSubject`). */
export interface SubjectWeight {
  subjectId: string;
  coefficient: number;
  credits: number;
}

export interface SubjectResult {
  subjectId: string;
  /** Moyenne sur l'échelle normalisée /20, `null` si rien de saisi. */
  average: number | null;
  coefficient: number;
  credits: number;
  /** Unité validée (LMD) — `null` hors LMD. */
  validated: boolean | null;
  gradeCount: number;
}

export interface PeriodResult {
  studentId: string;
  subjects: SubjectResult[];
  average: number | null;
  totalCoefficient: number;
  earnedCredits: number;
  totalCredits: number;
}

export interface RankedResult extends PeriodResult {
  rank: number | null;
}

export type DecisionKind =
  | 'admis'
  | 'admis_par_compensation'
  | 'rattrapage'
  | 'redouble'
  | 'non_evalue';

export interface Decision {
  kind: DecisionKind;
  mention: string | null;
  average: number | null;
}

/** Contrat que chaque stratégie de notation doit remplir. */
export interface GradingStrategy {
  kind: GradingKind;
  computeSubjectAverage(
    grades: GradeInput[],
    weight: SubjectWeight,
    config: GradingConfig,
  ): SubjectResult;
  computePeriodAverage(
    studentId: string,
    subjects: SubjectResult[],
    config: GradingConfig,
  ): PeriodResult;
  computeDecision(result: PeriodResult, config: GradingConfig): Decision;
}
