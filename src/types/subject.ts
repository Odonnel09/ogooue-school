import type { BadgeTone, Cycle } from './common';

export type SubjectStatus = 'active' | 'archivee';

export const SUBJECT_STATUS_TONES: Record<SubjectStatus, BadgeTone> = {
  active: 'green',
  archivee: 'slate',
};

/**
 * Une matière du catalogue de l'établissement.
 *
 * Le coefficient et le volume horaire ne sont **pas** portés ici : ils varient
 * selon la classe (les maths n'ont pas le même poids en 2nde et en Terminale C)
 * et vivent donc sur `ClassSubject`.
 *
 * Les champs LMD (`ue`, `ecue`, `ectsCredits`, `semester`, `filiere`) sont
 * toujours présents dans la donnée. Leur affichage est décidé par
 * `LevelCapabilities.hasCredits` — jamais par un test de cycle dans un composant.
 */
export interface Subject {
  id: string;
  /** Code court affiché dans les tableaux et l'emploi du temps (ex: « MATH »). */
  code: string;
  name: string;
  /** Références vers `Level.id` — une matière peut couvrir plusieurs niveaux. */
  levelIds: string[];
  cycle: Cycle;
  /** Référence vers `Teacher.id` (enseignant responsable). */
  teacherId: string;
  status: SubjectStatus;
  description: string;
  /** Unité d'enseignement (LMD). */
  ue: string;
  /** Élément constitutif d'une UE (LMD). */
  ecue: string;
  ectsCredits: number;
  semester: string;
  filiere: string;
}

export type SubjectDraft = Omit<Subject, 'id'>;
