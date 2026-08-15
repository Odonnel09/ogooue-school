import type {
  AttendanceRecord,
  AttendanceSheet,
  AttendanceStatus,
} from '@/types';
import { STUDENTS } from './students';

/**
 * Feuilles de présence déjà saisies.
 * REMPLACEMENT SUPABASE : tables `attendance_sheets` et `attendance_records`.
 */

/** Hash déterministe : évite tout `Math.random()` (écarts d'hydratation). */
function seededRatio(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function statusFor(studentId: string, date: string): AttendanceStatus {
  const ratio = seededRatio(`${studentId}|${date}`);
  if (ratio > 0.92) return 'absent';
  if (ratio > 0.84) return 'retard';
  return 'present';
}

const ABSENCE_NOTES = [
  'Absence justifiée par le parent (certificat médical).',
  'Absence non justifiée à ce jour.',
  'Rendez-vous médical signalé la veille.',
];

const LATE_NOTES = [
  'Arrivé avec 15 minutes de retard (embouteillages).',
  'Retard signalé par le surveillant général.',
];

function buildRecords(classId: string, date: string): AttendanceRecord[] {
  return STUDENTS.filter(
    (student) => student.classId === classId && student.status === 'actif',
  ).map((student) => {
    const status = statusFor(student.id, date);
    const ratio = seededRatio(`${student.id}|${date}|note`);
    let note = '';
    if (status === 'absent') {
      note = ABSENCE_NOTES[Math.floor(ratio * ABSENCE_NOTES.length)];
    } else if (status === 'retard') {
      note = LATE_NOTES[Math.floor(ratio * LATE_NOTES.length)];
    }
    return { studentId: student.id, status, note };
  });
}

const SHEET_SEEDS: Array<[classId: string, date: string, takenBy: string]> = [
  ['cls-tc', '2026-10-12', 'Sylvie Moussavou'],
  ['cls-tc', '2026-10-13', 'Sylvie Moussavou'],
  ['cls-1s', '2026-10-12', 'Sylvie Moussavou'],
  ['cls-1s', '2026-10-13', 'Clarisse Nzue'],
  ['cls-seconde', '2026-10-12', 'Georgette Mintsa'],
  ['cls-3a', '2026-10-12', 'Clarisse Nzue'],
  ['cls-3a', '2026-10-14', 'Michel Bekale'],
  ['cls-6a', '2026-10-12', 'Alain Koumba'],
  ['cls-6a', '2026-10-13', 'Alain Koumba'],
];

export const ATTENDANCE_SHEETS: AttendanceSheet[] = SHEET_SEEDS.map(
  ([classId, date, takenBy], index) => ({
    id: `att-${`${index + 1}`.padStart(3, '0')}`,
    classId,
    date,
    records: buildRecords(classId, date),
    takenBy,
    savedAt: `${date}T08:15:00`,
  }),
);
