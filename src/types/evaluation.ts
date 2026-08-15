import type { BadgeTone, GradingScale } from './common';

/**
 * Catalogue complet des types d'évaluation de la plateforme.
 * Les types réellement proposés pour un cycle donné sont déclarés par
 * `LevelCapabilities.evaluationKinds` — un composant ne filtre jamais cette
 * liste lui-même.
 */
export type EvaluationType =
  | 'observation'
  | 'bilan_periodique'
  | 'evaluation_competence'
  | 'devoir'
  | 'controle'
  | 'composition'
  | 'examen'
  | 'oral'
  | 'tp'
  | 'projet'
  | 'controle_continu'
  | 'rattrapage'
  | 'autre';

/**
 * Cycle de vie d'une évaluation.
 *
 * `draft → in_progress → submitted → validated → published`
 *
 * Règle métier centrale : le passage à `validated` **verrouille** la saisie.
 * Toute correction ultérieure exige la permission `grades.update`, un motif
 * obligatoire, et produit une entrée dans `gradeHistory`.
 */
export type EvaluationStatus =
  | 'draft'
  | 'in_progress'
  | 'submitted'
  | 'validated'
  | 'published';

export const EVALUATION_STATUS_TONES: Record<EvaluationStatus, BadgeTone> = {
  draft: 'slate',
  in_progress: 'red',
  submitted: 'yellow',
  validated: 'blue',
  published: 'green',
};

/** Ordre du workflow — sert à savoir ce qui est atteignable depuis un état. */
export const EVALUATION_STATUS_ORDER: EvaluationStatus[] = [
  'draft',
  'in_progress',
  'submitted',
  'validated',
  'published',
];

/** À partir de `validated`, la grille est verrouillée. */
export function isGradeEntryLocked(status: EvaluationStatus): boolean {
  return status === 'validated' || status === 'published';
}

/**
 * Note d'un élève pour une évaluation.
 * `score` à `null` = non saisie. `value` porte les notations non numériques
 * (acquis / en cours d'acquisition / non acquis, niveau de compétence).
 */
export interface Grade {
  studentId: string;
  score: number | null;
  /** Valeur symbolique pour les barèmes non numériques. */
  value: string | null;
  comment: string;
}

/** Trace d'une correction apportée après verrouillage. */
export interface GradeHistoryEntry {
  id: string;
  studentId: string;
  previousScore: number | null;
  previousValue: string | null;
  newScore: number | null;
  newValue: string | null;
  /** Motif obligatoire de la correction. */
  reason: string;
  author: string;
  changedAt: string;
}

export interface Evaluation {
  id: string;
  name: string;
  type: EvaluationType;
  subjectId: string;
  classId: string;
  teacherId: string;
  academicYear: string;
  /** Référence vers `Period.id`. */
  periodId: string;
  /** Format « YYYY-MM-DD ». */
  date: string;
  scale: GradingScale;
  /** Barème : note maximale atteignable. Ignoré par les barèmes symboliques. */
  maxScore: number;
  coefficient: number;
  description: string;
  status: EvaluationStatus;
  grades: Grade[];
  gradeHistory: GradeHistoryEntry[];
}

export type EvaluationDraft = Omit<Evaluation, 'id' | 'grades' | 'gradeHistory'>;

/** Statistiques recalculées à chaque saisie de note. */
export interface EvaluationStats {
  average: number | null;
  best: number | null;
  lowest: number | null;
  filled: number;
  total: number;
}
