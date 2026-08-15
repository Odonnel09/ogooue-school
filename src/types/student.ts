import type { Attachment, BadgeTone, Gender } from './common';

export type StudentStatus = 'actif' | 'en_attente' | 'transfere' | 'archive';

/** Couleur du badge. Le libellé vit dans `i18n/fr.ts`. */
export const STUDENT_STATUS_TONES: Record<StudentStatus, BadgeTone> = {
  actif: 'green',
  en_attente: 'yellow',
  transfere: 'blue',
  archive: 'slate',
};

/** Une ligne de l'historique d'inscription d'un élève. */
export interface EnrollmentEntry {
  id: string;
  academicYear: string;
  className: string;
  date: string;
  label: string;
}

/**
 * Dossier élève.
 *
 * Les tuteurs ne sont **pas** imbriqués ici : ils vivent dans `Guardian` et
 * sont rattachés par `GuardianLink`, un même adulte pouvant suivre plusieurs
 * enfants.
 */
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  matricule: string;
  birthDate: string;
  birthPlace: string;
  gender: Gender;
  nationality: string;
  address: string;
  /** Référence vers `SchoolClass.id`. Vide si l'élève n'est pas encore affecté. */
  classId: string;
  levelId: string;
  academicYear: string;
  status: StudentStatus;
  photoUrl?: string;
  /** Bloc affiché uniquement si le cycle déclare la capacité `medicalInfo`. */
  medicalInfo: string;
  /** Bloc affiché uniquement si le cycle déclare la capacité `previousSchool`. */
  previousSchool: string;
  /** Bloc affiché uniquement si le cycle déclare la capacité `academicTrack`. */
  filiere: string;
  parcours: string;
  documents: Attachment[];
  enrollment: EnrollmentEntry[];
  createdAt: string;
  /** Fiche enregistrée comme brouillon (non soumise à l'administration). */
  isDraft: boolean;
}

export type StudentDraft = Omit<
  Student,
  'id' | 'documents' | 'enrollment' | 'createdAt'
>;
