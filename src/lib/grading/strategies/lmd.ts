import { normalize } from '../scales';
import { applyRounding, weightedAverage } from '../rounding';
import type { GradingStrategy } from '../types';

/**
 * Enseignement supérieur (LMD) : unités d'enseignement créditées en ECTS,
 * validation par UE, compensation entre UE et session de rattrapage.
 *
 * Portée v1 : le calcul des moyennes, la validation par UE, la compensation
 * et l'orientation vers le rattrapage sont opérationnels. Les règles fines
 * (capitalisation des UE acquises d'une année sur l'autre, jurys, dettes)
 * viendront compléter ce fichier — sans modifier aucun appelant.
 */
export const lmdStrategy: GradingStrategy = {
  kind: 'lmd',

  computeSubjectAverage(grades, weight, config) {
    const entries = grades
      .map((grade) => ({
        value: normalize(grade.scale, grade.score, grade.value, grade.maxScore),
        weight: grade.coefficient * (config.weights[grade.evaluationType] ?? 1),
      }))
      .filter(
        (entry): entry is { value: number; weight: number } =>
          entry.value !== null,
      );

    const raw = weightedAverage(entries);
    const average = raw === null ? null : applyRounding(raw, config.rounding);

    return {
      subjectId: weight.subjectId,
      average,
      coefficient: weight.coefficient,
      credits: weight.credits,
      // Une UE est validée dès que sa moyenne atteint le seuil de réussite.
      validated: average === null ? null : average >= config.passMark,
      gradeCount: entries.length,
    };
  },

  computePeriodAverage(studentId, subjects, config) {
    const entries = subjects
      .filter((subject) => subject.average !== null)
      .map((subject) => ({
        value: subject.average as number,
        weight: subject.credits > 0 ? subject.credits : subject.coefficient,
      }));

    const raw = weightedAverage(entries);
    const average = raw === null ? null : applyRounding(raw, config.rounding);

    const totalCredits = subjects.reduce(
      (total, subject) => total + subject.credits,
      0,
    );

    // Sans compensation, seules les UE validées rapportent leurs crédits.
    // Avec compensation, une moyenne générale suffisante valide le semestre.
    const compensated =
      config.compensation && average !== null && average >= config.passMark;

    const earnedCredits = compensated
      ? totalCredits
      : subjects.reduce(
          (total, subject) => total + (subject.validated ? subject.credits : 0),
          0,
        );

    return {
      studentId,
      subjects,
      average,
      totalCoefficient: entries.reduce((total, entry) => total + entry.weight, 0),
      earnedCredits,
      totalCredits,
    };
  },

  computeDecision(result, config) {
    if (result.average === null) {
      return { kind: 'non_evalue', mention: null, average: null };
    }

    const mention =
      config.mentions.find((item) => result.average! >= item.min)?.label ?? null;

    const allValidated = result.subjects.every(
      (subject) => subject.validated !== false,
    );

    if (allValidated) {
      return { kind: 'admis', mention, average: result.average };
    }

    if (config.compensation && result.average >= config.passMark) {
      return {
        kind: 'admis_par_compensation',
        mention,
        average: result.average,
      };
    }

    if (config.sessions && result.average >= config.resitThreshold) {
      return { kind: 'rattrapage', mention, average: result.average };
    }

    return { kind: 'redouble', mention, average: result.average };
  },
};
