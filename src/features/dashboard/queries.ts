import type {
  Attachment,
  ClassSubject,
  Evaluation,
  SchoolClass,
  ScheduleSlot,
  Student,
} from '@/types';
import type { GradingConfig } from '@/lib/grading/types';
import { studentAverage } from '@/features/evaluations/queries';

/**
 * Agrégats du tableau de bord.
 *
 * Aucun chiffre affiché sur cet écran n'est saisi en dur : tout est recalculé
 * depuis les collections du store, pour que le tableau de bord ne puisse pas
 * mentir sur l'état réel de l'établissement.
 */

export interface TopStudent {
  student: Student;
  average: number;
}

/**
 * Meilleures moyennes de l'établissement, calculées par le moteur de notation
 * avec la configuration propre au cycle de chaque classe.
 */
export function topStudents(
  students: Student[],
  classes: SchoolClass[],
  classSubjects: ClassSubject[],
  evaluations: Evaluation[],
  gradingConfigForClass: (schoolClass: SchoolClass) => GradingConfig,
  limit = 3,
): TopStudent[] {
  return students
    .filter((student) => student.status === 'actif' && student.classId)
    .map((student) => {
      const schoolClass = classes.find((item) => item.id === student.classId);
      if (!schoolClass) return null;

      const average = studentAverage(
        evaluations,
        classSubjects,
        student.classId,
        student.id,
        gradingConfigForClass(schoolClass),
      );
      return average === null ? null : { student, average };
    })
    .filter((entry): entry is TopStudent => entry !== null)
    .sort((a, b) => b.average - a.average)
    .slice(0, limit);
}

export interface DocumentCategory {
  type: string;
  count: number;
}

/** Répartition réelle des pièces déposées dans les dossiers élèves. */
export function documentCategories(
  students: Student[],
  limit = 4,
): DocumentCategory[] {
  const counts = new Map<string, number>();

  students.forEach((student) => {
    student.documents.forEach((document: Attachment) => {
      counts.set(document.type, (counts.get(document.type) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export interface TimetableSummary {
  schoolClass: SchoolClass;
  slotCount: number;
  isDraft: boolean;
}

/** Emplois du temps les plus fournis, avec leur état réel. */
export function timetableSummaries(
  classes: SchoolClass[],
  slots: ScheduleSlot[],
  academicYear: string,
  limit = 2,
): TimetableSummary[] {
  return classes
    .filter((item) => item.status === 'active')
    .map((schoolClass) => {
      const classSlots = slots.filter(
        (slot) =>
          slot.classId === schoolClass.id && slot.academicYear === academicYear,
      );
      return {
        schoolClass,
        slotCount: classSlots.length,
        isDraft: classSlots.some((slot) => slot.status === 'brouillon'),
      };
    })
    .filter((entry) => entry.slotCount > 0)
    .sort((a, b) => b.slotCount - a.slotCount)
    .slice(0, limit);
}

export interface EvaluationSummary {
  total: number;
  inProgress: number;
}

/** Évaluations de l'année scolaire sélectionnée. */
export function evaluationSummary(
  evaluations: Evaluation[],
  academicYear: string,
): EvaluationSummary {
  const scoped = evaluations.filter(
    (evaluation) => evaluation.academicYear === academicYear,
  );
  return {
    total: scoped.length,
    inProgress: scoped.filter(
      (evaluation) =>
        evaluation.status === 'in_progress' || evaluation.status === 'submitted',
    ).length,
  };
}
