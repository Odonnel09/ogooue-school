import type { GradingKind } from '@/types';
import { competencyStrategy } from './strategies/competency';
import { lmdStrategy } from './strategies/lmd';
import { numericWeightedStrategy } from './strategies/numeric-weighted';
import { qualitativeStrategy } from './strategies/qualitative';
import { applyRounding } from './rounding';
import type {
  Decision,
  GradeInput,
  GradingConfig,
  GradingStrategy,
  PeriodResult,
  RankedResult,
  SubjectResult,
  SubjectWeight,
} from './types';

/**
 * MOTEUR DE NOTATION — TypeScript pur, zéro I/O, zéro import du store.
 *
 * Ajouter un nouveau système de notation consiste à écrire une stratégie et à
 * l'enregistrer ici. Aucun appelant n'est modifié.
 */
const STRATEGIES: Record<GradingKind, GradingStrategy> = {
  qualitative: qualitativeStrategy,
  competency: competencyStrategy,
  numeric_weighted: numericWeightedStrategy,
  lmd: lmdStrategy,
};

export function strategyFor(kind: GradingKind): GradingStrategy {
  return STRATEGIES[kind];
}

export function computeSubjectAverage(
  grades: GradeInput[],
  weight: SubjectWeight,
  config: GradingConfig,
): SubjectResult {
  return strategyFor(config.kind).computeSubjectAverage(grades, weight, config);
}

export function computePeriodAverage(
  studentId: string,
  subjects: SubjectResult[],
  config: GradingConfig,
): PeriodResult {
  return strategyFor(config.kind).computePeriodAverage(
    studentId,
    subjects,
    config,
  );
}

export function computeDecision(
  result: PeriodResult,
  config: GradingConfig,
): Decision {
  return strategyFor(config.kind).computeDecision(result, config);
}

/**
 * Classement d'une promotion. Les élèves non évalués sont placés en fin de
 * liste sans rang. Les ex æquo partagent le même rang (1, 2, 2, 4).
 */
export function computeRanking(results: PeriodResult[]): RankedResult[] {
  const evaluated = results
    .filter((result) => result.average !== null)
    .sort((a, b) => (b.average as number) - (a.average as number));

  const ranked: RankedResult[] = [];
  let previousAverage: number | null = null;
  let previousRank = 0;

  evaluated.forEach((result, index) => {
    const rank =
      previousAverage !== null && result.average === previousAverage
        ? previousRank
        : index + 1;
    previousAverage = result.average;
    previousRank = rank;
    ranked.push({ ...result, rank });
  });

  const unevaluated = results
    .filter((result) => result.average === null)
    .map((result): RankedResult => ({ ...result, rank: null }));

  return [...ranked, ...unevaluated];
}

/**
 * Statistiques d'une évaluation : moyenne, extrêmes, avancement de la saisie.
 * Calculées sur le barème de l'évaluation (et non sur l'échelle normalisée),
 * car elles sont affichées telles quelles dans la grille de saisie.
 */
export function computeEvaluationStats(
  grades: GradeInput[],
  config: GradingConfig,
): {
  average: number | null;
  best: number | null;
  lowest: number | null;
  filled: number;
  total: number;
} {
  const scores = grades
    .filter((grade) => grade.score !== null || grade.value !== null)
    .map((grade) => grade.score)
    .filter((score): score is number => score !== null);

  if (scores.length === 0) {
    return {
      average: null,
      best: null,
      lowest: null,
      filled: 0,
      total: grades.length,
    };
  }

  const sum = scores.reduce((total, score) => total + score, 0);

  return {
    average: applyRounding(sum / scores.length, config.rounding),
    best: Math.max(...scores),
    lowest: Math.min(...scores),
    filled: scores.length,
    total: grades.length,
  };
}

export * from './types';
export * from './scales';
