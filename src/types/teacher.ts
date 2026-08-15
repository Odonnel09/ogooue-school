import type { BadgeTone } from './common';

export type TeacherStatus = 'actif' | 'conge' | 'suspendu' | 'archive';

export const TEACHER_STATUS_TONES: Record<TeacherStatus, BadgeTone> = {
  actif: 'green',
  conge: 'yellow',
  suspendu: 'orange',
  archive: 'slate',
};

/** Types de contrat fictifs (v1 : purement déclaratif, aucun impact RH). */
export type ContractType =
  | 'permanent'
  | 'contractuel'
  | 'vacataire'
  | 'stagiaire';

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  matricule: string;
  email: string;
  phone: string;
  address: string;
  /** Références vers `Subject.id`. */
  subjectIds: string[];
  /** Références vers `SchoolClass.id`. */
  classIds: string[];
  contractType: ContractType;
  status: TeacherStatus;
  startDate: string;
  notes: string;
  photoUrl?: string;
}

export type TeacherDraft = Omit<Teacher, 'id'>;
