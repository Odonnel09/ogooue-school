import { LEVELS } from '@/data/academic';
import type {
  AttendanceRecord,
  ClassSubject,
  Guardian,
  GuardianLink,
  Level,
  Period,
  SchoolClass,
  ScheduleConflict,
  ScheduleSlot,
  Student,
  Subject,
  Teacher,
} from '@/types';
import { timeToMinutes } from './utils';

/* -------------------------------------------------------------------------- */
/* Libellés et résolution d'entités                                            */
/* -------------------------------------------------------------------------- */

const LEVELS_BY_ID = new Map(LEVELS.map((level) => [level.id, level]));

export function getLevel(levelId: string): Level | undefined {
  return LEVELS_BY_ID.get(levelId);
}

export function levelLabel(levelId: string): string {
  return LEVELS_BY_ID.get(levelId)?.label ?? '—';
}

export function periodLabel(periods: Period[], periodId: string): string {
  return periods.find((period) => period.id === periodId)?.label ?? '—';
}

export function studentName(student: Student): string {
  return `${student.firstName} ${student.lastName}`;
}

export function teacherName(teacher: Teacher): string {
  return `${teacher.firstName} ${teacher.lastName}`;
}

export function findById<T extends { id: string }>(
  items: T[],
  id: string,
): T | undefined {
  return items.find((item) => item.id === id);
}

export function classLabel(classes: SchoolClass[], classId: string): string {
  return findById(classes, classId)?.name ?? 'Non affecté';
}

export function subjectLabel(subjects: Subject[], subjectId: string): string {
  return findById(subjects, subjectId)?.name ?? '—';
}

export function teacherLabel(teachers: Teacher[], teacherId: string): string {
  const teacher = findById(teachers, teacherId);
  return teacher ? teacherName(teacher) : 'Non désigné';
}

/* -------------------------------------------------------------------------- */
/* Classes, matières et effectifs                                              */
/* -------------------------------------------------------------------------- */

export function studentsOfClass(
  students: Student[],
  classId: string,
): Student[] {
  return students.filter((student) => student.classId === classId);
}

/** Effectif retenu pour les tableaux : élèves actifs ou en attente. */
export function classHeadcount(students: Student[], classId: string): number {
  return students.filter(
    (student) =>
      student.classId === classId &&
      (student.status === 'actif' || student.status === 'en_attente'),
  ).length;
}

/** Taux d'occupation d'une classe, en pourcentage entier. */
export function occupancyRate(headcount: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.min(100, Math.round((headcount / capacity) * 100));
}

/** Rattachements matière ↔ classe pour une classe donnée. */
export function subjectsOfClass(
  classSubjects: ClassSubject[],
  classId: string,
): ClassSubject[] {
  return classSubjects.filter((item) => item.classId === classId);
}

/** Classes dans lesquelles une matière est enseignée. */
export function classesOfSubject(
  classSubjects: ClassSubject[],
  subjectId: string,
): ClassSubject[] {
  return classSubjects.filter((item) => item.subjectId === subjectId);
}

/** Rattachement précis d'une matière dans une classe. */
export function classSubjectOf(
  classSubjects: ClassSubject[],
  classId: string,
  subjectId: string,
): ClassSubject | undefined {
  return classSubjects.find(
    (item) => item.classId === classId && item.subjectId === subjectId,
  );
}

/* -------------------------------------------------------------------------- */
/* Présences                                                                   */
/* -------------------------------------------------------------------------- */

export interface AttendanceSummary {
  present: number;
  absent: number;
  retard: number;
  total: number;
  rate: number;
}

export function attendanceStats(
  records: AttendanceRecord[],
): AttendanceSummary {
  const total = records.length;
  const present = records.filter((item) => item.status === 'present').length;
  const absent = records.filter((item) => item.status === 'absent').length;
  const retard = records.filter((item) => item.status === 'retard').length;
  const rate =
    total === 0 ? 0 : Math.round(((present + retard) / total) * 1000) / 10;
  return { present, absent, retard, total, rate };
}

/* -------------------------------------------------------------------------- */
/* Emploi du temps                                                             */
/* -------------------------------------------------------------------------- */

function overlaps(a: ScheduleSlot, b: ScheduleSlot): boolean {
  if (a.day !== b.day) return false;
  return (
    timeToMinutes(a.startTime) < timeToMinutes(b.endTime) &&
    timeToMinutes(b.startTime) < timeToMinutes(a.endTime)
  );
}

/**
 * Détecte les conflits d'emploi du temps : un même enseignant, une même salle
 * ou une même classe positionnés sur deux créneaux qui se chevauchent.
 */
export function detectConflicts(slots: ScheduleSlot[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  for (let i = 0; i < slots.length; i += 1) {
    for (let j = i + 1; j < slots.length; j += 1) {
      const a = slots[i];
      const b = slots[j];
      if (!overlaps(a, b)) continue;

      if (a.teacherId && a.teacherId === b.teacherId) {
        conflicts.push({
          slotId: a.id,
          otherSlotId: b.id,
          type: 'enseignant',
          message: 'Le même enseignant est affecté à deux cours simultanés.',
        });
      }
      if (a.room && a.room === b.room) {
        conflicts.push({
          slotId: a.id,
          otherSlotId: b.id,
          type: 'salle',
          message: 'La même salle est occupée par deux cours simultanés.',
        });
      }
      if (a.classId === b.classId) {
        conflicts.push({
          slotId: a.id,
          otherSlotId: b.id,
          type: 'classe',
          message: 'La classe a deux cours qui se chevauchent.',
        });
      }
    }
  }

  return conflicts;
}

/** Identifiants des créneaux impliqués dans au moins un conflit. */
export function conflictingSlotIds(conflicts: ScheduleConflict[]): Set<string> {
  const ids = new Set<string>();
  conflicts.forEach((conflict) => {
    ids.add(conflict.slotId);
    ids.add(conflict.otherSlotId);
  });
  return ids;
}

/** Trie les créneaux par heure de début. */
export function sortSlots(slots: ScheduleSlot[]): ScheduleSlot[] {
  return slots
    .slice()
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
}

/* -------------------------------------------------------------------------- */
/* Parents et tuteurs                                                          */
/* -------------------------------------------------------------------------- */

export function guardianName(guardian: Guardian): string {
  return `${guardian.firstName} ${guardian.lastName}`.trim();
}

/** Rattachements d'un élève, contact principal en tête. */
export function linksOfStudent(
  links: GuardianLink[],
  studentId: string,
): GuardianLink[] {
  return links
    .filter((link) => link.studentId === studentId)
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
}

/** Enfants suivis par un tuteur. */
export function linksOfGuardian(
  links: GuardianLink[],
  guardianId: string,
): GuardianLink[] {
  return links.filter((link) => link.guardianId === guardianId);
}

/** Contact principal d'un élève, s'il en a un. */
export function primaryGuardian(
  guardians: Guardian[],
  links: GuardianLink[],
  studentId: string,
): Guardian | undefined {
  const link = linksOfStudent(links, studentId)[0];
  if (!link) return undefined;
  return findById(guardians, link.guardianId);
}

export function guardianLabel(
  guardians: Guardian[],
  links: GuardianLink[],
  studentId: string,
): string {
  const guardian = primaryGuardian(guardians, links, studentId);
  return guardian ? guardianName(guardian) : '—';
}

export function guardianPhone(
  guardians: Guardian[],
  links: GuardianLink[],
  studentId: string,
): string {
  return primaryGuardian(guardians, links, studentId)?.phone ?? '—';
}
