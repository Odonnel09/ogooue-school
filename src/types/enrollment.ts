import type { BadgeTone, Gender } from './common';
import type { GuardianRelation } from './guardian';

/**
 * Circuit d'inscription.
 *
 * `brouillon → soumise → (incomplete) → validee → inscrite`
 *
 * `inscrite` est l'état terminal : le dossier a produit un élève et un
 * rattachement au tuteur. `refusee` clôt le dossier sans création.
 *
 * L'étape `validee` n'est exigée que si l'établissement a activé la validation
 * des préinscriptions dans Paramètres — sinon un dossier complet passe
 * directement de `soumise` à `inscrite`.
 */
export type EnrollmentStatus =
  | 'brouillon'
  | 'soumise'
  | 'incomplete'
  | 'validee'
  | 'refusee'
  | 'inscrite';

export const ENROLLMENT_STATUS_TONES: Record<EnrollmentStatus, BadgeTone> = {
  brouillon: 'slate',
  soumise: 'yellow',
  incomplete: 'orange',
  validee: 'blue',
  refusee: 'red',
  inscrite: 'green',
};

/** Pièce du dossier, déduite des exigences réglées dans Paramètres. */
export interface EnrollmentDocument {
  name: string;
  provided: boolean;
  receivedAt: string;
}

export interface EnrollmentApplication {
  id: string;
  /** Référence communiquée à la famille (ex. « PRE-2026-0007 »). */
  reference: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  gender: Gender;
  nationality: string;
  address: string;
  previousSchool: string;
  /** Niveau demandé par la famille. */
  requestedLevelId: string;
  /** Classe pressentie, renseignée à la validation. */
  requestedClassId: string;
  academicYear: string;
  /** Référence vers `Guardian.id` — le tuteur doit exister au dépôt. */
  guardianId: string;
  guardianRelation: GuardianRelation;
  documents: EnrollmentDocument[];
  status: EnrollmentStatus;
  submittedAt: string;
  decidedAt: string;
  decidedBy: string;
  decisionNote: string;
  /** Renseigné une fois le dossier transformé en élève. */
  createdStudentId: string;
}

export type EnrollmentDraft = Omit<
  EnrollmentApplication,
  'id' | 'reference' | 'createdStudentId'
>;

/** Un dossier est complet quand toutes ses pièces ont été reçues. */
export function isFileComplete(application: EnrollmentApplication): boolean {
  return application.documents.every((document) => document.provided);
}

/** Pièces encore attendues. */
export function missingDocuments(
  application: EnrollmentApplication,
): EnrollmentDocument[] {
  return application.documents.filter((document) => !document.provided);
}
