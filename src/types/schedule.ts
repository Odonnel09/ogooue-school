import type { BadgeTone } from './common';

export type Weekday =
  | 'lundi'
  | 'mardi'
  | 'mercredi'
  | 'jeudi'
  | 'vendredi'
  | 'samedi';

export const WEEKDAYS: Weekday[] = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
];

export type ScheduleStatus = 'brouillon' | 'valide';

export const SCHEDULE_STATUS_TONES: Record<ScheduleStatus, BadgeTone> = {
  brouillon: 'yellow',
  valide: 'green',
};

/** Un créneau de cours dans l'emploi du temps hebdomadaire d'une classe. */
export interface ScheduleSlot {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  room: string;
  day: Weekday;
  /** Format « HH:MM ». */
  startTime: string;
  endTime: string;
  academicYear: string;
  status: ScheduleStatus;
}

export type ScheduleSlotDraft = Omit<ScheduleSlot, 'id'>;

/** Conflit détecté entre deux créneaux (salle, enseignant ou chevauchement). */
export interface ScheduleConflict {
  slotId: string;
  otherSlotId: string;
  type: 'salle' | 'enseignant' | 'classe';
  message: string;
}
