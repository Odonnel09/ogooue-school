import { normalize, NORMALIZED_MAX } from '../scales';
import { applyRounding, weightedAverage } from '../rounding';
import type {
  Decision,
  GradingConfig,
  GradeInput,
  GradingStrategy,
  PeriodResult,
  SubjectResult,
} from '../types';

/**
 * Collège et lycée : notes sur une échelle configurable, coefficients par
 * matière, moyennes pondérées, mention et décision de passage.
 * C'est la stratégie complète de la v1.
 */
export const numericWeightedStrategy: GradingStrategy = {
  kind: 'numeric_weighted',

  computeSubjectAverage(grades, weight, config): SubjectResult {
    const entries = grades
      .map((grade) => ({
        grade,
        normalized: resolveScore(grade, config),
      }))
      .filter(
        (entry): entry is { grade: GradeInput; normalized: number } =>
          entry.normalized !== null,
      )
      .map((entry) => ({
        value: entry.normalized,
        weight:
          entry.grade.coefficient *
          (config.weights[entry.grade.evaluationType] ?? 1),
      }));

    const raw = weightedAverage(entries);

    return {
      subjectId: weight.subjectId,
      average: raw === null ? null : applyRounding(raw, config.rounding),
      coefficient: weight.coefficient,
      credits: weight.credits,
      validated: null,
      gradeCount: entries.length,
    };
  },

  computePeriodAverage(studentId, subjects, config): PeriodResult {
    const entries = subjects
      .filter((subject) => subject.average !== null)
      .map((subject) => ({
        value: subject.average as number,
        weight: subject.coefficient,
      }));

    const raw = weightedAverage(entries);

    return {
      studentId,
      subjects,
      average: raw === null ? null : applyRounding(raw, config.rounding),
      totalCoefficient: entries.reduce((total, entry) => total + entry.weight, 0),
      earnedCredits: 0,
      totalCredits: 0,
    };
  },

  computeDecision(result, config): Decision {
    if (result.average === null) {
      return { kind: 'non_evalue', mention: null, average: null };
    }

    const mention =
      config.mentions.find((item) => result.average! >= item.min)?.label ?? null;

    return {
      kind: result.average >= config.passMark ? 'admis' : 'redouble',
      mention,
      average: result.average,
    };
  },
};

/** Note normalisée, en appliquant la politique d'absence. */
function resolveScore(grade: GradeInput, config: GradingConfig): number | null {
  const normalized = normalize(
    grade.scale,
    grade.score,
    grade.value,
    grade.maxScore,
  );

  if (normalized !== null && !grade.absent) return normalized;
  if (config.absencePolicy === 'count_as_zero') return 0;
  return null;
}

export { NORMALIZED_MAX };
