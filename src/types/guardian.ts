import type { BadgeTone } from './common';

/**
 * Un parent ou tuteur est une **personne à part entière**, pas un champ du
 * dossier élève : `GEMINI.md` exige qu'il puisse être rattaché à plusieurs
 * enfants, éventuellement dans des classes différentes (l. 119, 128).
 *
 * Le lien porte la relation, car un même adulte peut être père d'un élève et
 * tuteur légal d'un autre.
 */
export type GuardianRelation =
  | 'pere'
  | 'mere'
  | 'tuteur'
  | 'oncle'
  | 'tante'
  | 'grand_parent'
  | 'autre';

export type GuardianStatus = 'actif' | 'archive';

export const GUARDIAN_STATUS_TONES: Record<GuardianStatus, BadgeTone> = {
  actif: 'green',
  archive: 'slate',
};

export interface Guardian {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  /** Second numéro, souvent celui du lieu de travail. */
  altPhone: string;
  email: string;
  address: string;
  profession: string;
  /** Pièce d'identité présentée lors de l'inscription. */
  idDocument: string;
  notes: string;
  status: GuardianStatus;
}

/** Rattachement d'un tuteur à un élève. */
export interface GuardianLink {
  id: string;
  guardianId: string;
  studentId: string;
  relation: GuardianRelation;
  /** Contact principal de l'établissement pour cet élève. */
  isPrimary: boolean;
  /** Autorisé à récupérer l'élève à la sortie des cours. */
  canPickUp: boolean;
}

export type GuardianDraft = Omit<Guardian, 'id'>;
