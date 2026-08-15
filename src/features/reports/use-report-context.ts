'use client';

import { useMemo } from 'react';
import { useCapabilities } from '@/lib/school-levels/use-capabilities';
import { useSchoolData } from '@/lib/store/school-data';
import { studentName } from '@/lib/selectors';
import type { ReportContext } from './queries';

/**
 * Rassemble tout ce dont le calcul d'un bulletin a besoin pour une classe et
 * une période données. Renvoie `null` si l'une des deux n'est pas choisie.
 */
export function useReportContext(
  classId: string,
  periodId: string,
): ReportContext | null {
  const {
    config,
    classes,
    classSubjects,
    subjects,
    teachers,
    students,
    evaluations,
    sheets,
  } = useSchoolData();
  const capabilities = useCapabilities();

  return useMemo(() => {
    const schoolClass = classes.find((item) => item.id === classId);
    const period = config.periods.find((item) => item.id === periodId);
    if (!schoolClass || !period) return null;

    return {
      schoolClass,
      period,
      capabilities: capabilities.forClass(schoolClass),
      gradingConfig: capabilities.gradingConfigForClass(schoolClass),
      profile: config.profile,
      template: config.templates.report,
      signature: config.signature,
      roster: students
        .filter(
          (student) =>
            student.classId === schoolClass.id && student.status === 'actif',
        )
        .sort((a, b) => studentName(a).localeCompare(studentName(b), 'fr')),
      classSubjects,
      subjects,
      teachers,
      evaluations,
      sheets,
    } satisfies ReportContext;
  }, [
    classes,
    classId,
    config,
    periodId,
    capabilities,
    students,
    classSubjects,
    subjects,
    teachers,
    evaluations,
    sheets,
  ]);
}

/** Identifiant déterministe d'un bulletin. */
export function reportIdFor(
  classId: string,
  periodId: string,
  studentId: string,
): string {
  return `rep-${classId}-${periodId}-${studentId}`;
}
