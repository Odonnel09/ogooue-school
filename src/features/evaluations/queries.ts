import {
  computePeriodAverage,
  computeSubjectAverage,
  computeEvaluationStats,
} from '@/lib/grading/engine';
import type { GradeInput, GradingConfig, SubjectWeight } from '@/lib/grading/types';
import { classSubjectOf } from '@/lib/selectors';
import type { ClassSubject, Evaluation, EvaluationStats } from '@/types';

/**
 * Adaptateurs entre les entités applicatives et le moteur de notation.
 * Le moteur reste pur : c'est ici qu'on lui fournit des entrées normalisées.
 */

/** Convertit les notes d'une évaluation en entrées de moteur. */
export function toGradeInputs(evaluation: Evaluation): GradeInput[] {
  return evaluation.grades.map((grade) => ({
    studentId: grade.studentId,
    score: grade.score,
    value: grade.value,
    scale: evaluation.scale,
    maxScore: evaluation.maxScore,
    evaluationType: evaluation.type,
    coefficient: evaluation.coefficient,
  }));
}

export function evaluationStats(
  evaluation: Evaluation,
  config: GradingConfig,
): EvaluationStats {
  return computeEvaluationStats(toGradeInputs(evaluation), config);
}

/** Évaluations prises en compte dans une moyenne : validées ou publiées. */
function countedEvaluations(evaluations: Evaluation[]): Evaluation[] {
  return evaluations.filter(
    (evaluation) =>
      evaluation.status === 'validated' || evaluation.status === 'published',
  );
}

/**
 * Moyenne d'un élève sur une classe, matière par matière puis pondérée par les
 * coefficients de `class_subjects`.
 */
export function studentAverage(
  evaluations: Evaluation[],
  classSubjects: ClassSubject[],
  classId: string,
  studentId: string,
  config: GradingConfig,
): number | null {
  const relevant = countedEvaluations(evaluations).filter(
    (evaluation) => evaluation.classId === classId,
  );

  const bySubject = new Map<string, GradeInput[]>();

  relevant.forEach((evaluation) => {
    const grade = evaluation.grades.find(
      (item) => item.studentId === studentId,
    );
    if (!grade) return;
    if (grade.score === null && grade.value === null) return;

    const inputs = bySubject.get(evaluation.subjectId) ?? [];
    inputs.push({
      studentId,
      score: grade.score,
      value: grade.value,
      scale: evaluation.scale,
      maxScore: evaluation.maxScore,
      evaluationType: evaluation.type,
      coefficient: evaluation.coefficient,
    });
    bySubject.set(evaluation.subjectId, inputs);
  });

  const subjectResults = Array.from(bySubject.entries()).map(
    ([subjectId, inputs]) => {
      const link = classSubjectOf(classSubjects, classId, subjectId);
      const weight: SubjectWeight = {
        subjectId,
        coefficient: link?.coefficient ?? 1,
        credits: 0,
      };
      return computeSubjectAverage(inputs, weight, config);
    },
  );

  return computePeriodAverage(studentId, subjectResults, config).average;
}

/** Moyenne générale de la classe : moyenne des moyennes des élèves évalués. */
export function classAverage(
  evaluations: Evaluation[],
  classSubjects: ClassSubject[],
  classId: string,
  studentIds: string[],
  config: GradingConfig,
): number | null {
  const averages = studentIds
    .map((studentId) =>
      studentAverage(evaluations, classSubjects, classId, studentId, config),
    )
    .filter((value): value is number => value !== null);

  if (averages.length === 0) return null;
  const sum = averages.reduce((total, value) => total + value, 0);
  return Math.round((sum / averages.length) * 100) / 100;
}

/** Évaluations concernant un élève, de la plus récente à la plus ancienne. */
export function evaluationsOfStudent(
  evaluations: Evaluation[],
  classId: string,
): Evaluation[] {
  return evaluations
    .filter((evaluation) => evaluation.classId === classId)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
}
