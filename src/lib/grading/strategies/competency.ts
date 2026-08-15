import { normalize } from '../scales';
import { applyRounding, weightedAverage } from '../rounding';
import type { GradingStrategy } from '../types';

/**
 * Primaire : évaluation par compétences (Maîtrise / Partiel / Fragile /
 * Insuffisant), complétée de notes classiques et d'appréciations.
 * Pas de coefficient : chaque compétence pèse le même poids.
 */
export const competencyStrategy: GradingStrategy = {
  kind: 'competency',

  computeSubjectAverage(grades, weight, config) {
    const entries = grades
      .map((grade) =>
        normalize(grade.scale, grade.score, grade.value, grade.maxScore),
      )
      .filter((value): value is number => value !== null)
      .map((value) => ({ value, weight: 1 }));

    const raw = weightedAverage(entries);

    return {
      subjectId: weight.subjectId,
      average: raw === null ? null : applyRounding(raw, config.rounding),
      coefficient: 1,
      credits: 0,
      validated: null,
      gradeCount: entries.length,
    };
  },

  computePeriodAverage(studentId, subjects, config) {
    const entries = subjects
      .filter((subject) => subject.average !== null)
      .map((subject) => ({ value: subject.average as number, weight: 1 }));

    const raw = weightedAverage(entries);

    return {
      studentId,
      subjects,
      average: raw === null ? null : applyRounding(raw, config.rounding),
      totalCoefficient: entries.length,
      earnedCredits: 0,
      totalCredits: 0,
    };
  },

  computeDecision(result, config) {
    if (result.average === null) {
      return { kind: 'non_evalue', mention: null, average: null };
    }
    return {
      kind: result.average >= config.passMark ? 'admis' : 'redouble',
      mention: null,
      average: result.average,
    };
  },
};
