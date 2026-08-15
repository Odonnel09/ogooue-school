import { normalize } from '../scales';
import { applyRounding, weightedAverage } from '../rounding';
import type { GradingStrategy } from '../types';

/**
 * Garderie et pré-primaire : appréciations « Acquis / En cours d'acquisition /
 * Non acquis » et observations libres. **Aucune moyenne n'est publiée** — le
 * carnet de suivi restitue la dernière appréciation par domaine.
 *
 * La moyenne interne calculée ici sert uniquement au pilotage administratif
 * (repérer un domaine en difficulté) et n'apparaît pas sur le carnet.
 */
export const qualitativeStrategy: GradingStrategy = {
  kind: 'qualitative',

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
      // Pas de coefficient à ce niveau : toutes les activités pèsent pareil.
      coefficient: 1,
      credits: 0,
      validated: null,
      gradeCount: entries.length,
    };
  },

  computePeriodAverage(studentId, subjects) {
    return {
      studentId,
      subjects,
      // Volontairement `null` : on ne publie pas de moyenne en maternelle.
      average: null,
      totalCoefficient: 0,
      earnedCredits: 0,
      totalCredits: 0,
    };
  },

  computeDecision() {
    // Pas de redoublement décidé sur des appréciations à ce niveau.
    return { kind: 'admis', mention: null, average: null };
  },
};
