import type { BadgeTone } from './common';

export type AttendanceStatus = 'present' | 'absent' | 'retard';

export const ATTENDANCE_STATUS_TONES: Record<AttendanceStatus, BadgeTone> = {
  present: 'green',
  absent: 'red',
  retard: 'orange',
};

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  /** Observation libre saisie par le surveillant. */
  note: string;
}

/** Feuille de présence d'une classe pour une date donnée. */
export interface AttendanceSheet {
  id: string;
  classId: string;
  /** Format « YYYY-MM-DD ». */
  date: string;
  records: AttendanceRecord[];
  takenBy: string;
  savedAt: string;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  retard: number;
  total: number;
  /** Taux de présence en pourcentage, arrondi à une décimale. */
  rate: number;
}
