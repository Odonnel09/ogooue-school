import type { BadgeTone, Cycle } from './common';

export type ClassStatus = 'active' | 'en_preparation' | 'archivee';

export const CLASS_STATUS_TONES: Record<ClassStatus, BadgeTone> = {
  active: 'green',
  en_preparation: 'yellow',
  archivee: 'slate',
};

export interface SchoolClass {
  id: string;
  name: string;
  /** Référence vers `Level.id`. */
  levelId: string;
  cycle: Cycle;
  academicYear: string;
  capacity: number;
  room: string;
  /** Référence vers `Teacher.id`. Vide si non désigné. */
  mainTeacherId: string;
  description: string;
  status: ClassStatus;
}

export type SchoolClassDraft = Omit<SchoolClass, 'id'>;

/**
 * Rattachement d'une matière à une classe.
 *
 * C'est ici que vivent le coefficient et le volume horaire : le poids d'une
 * matière dépend de la classe, pas de la matière seule.
 */
export interface ClassSubject {
  id: string;
  classId: string;
  subjectId: string;
  /** Enseignant en charge de cette matière dans cette classe. */
  teacherId: string;
  coefficient: number;
  /** Volume horaire hebdomadaire, en heures. */
  weeklyHours: number;
}

export type ClassSubjectDraft = Omit<ClassSubject, 'id'>;
