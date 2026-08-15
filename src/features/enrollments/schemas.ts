import { z } from 'zod';

/**
 * Dépôt d'une préinscription.
 *
 * Le tuteur doit exister au moment du dépôt : c'est lui qui sera rattaché à
 * l'élève une fois le dossier transformé.
 */
export const enrollmentSchema = z.object({
  firstName: z.string().trim().min(1, 'Le prénom est obligatoire.'),
  lastName: z.string().trim().min(1, 'Le nom est obligatoire.'),
  birthDate: z.string().min(1, 'La date de naissance est obligatoire.'),
  birthPlace: z.string().trim(),
  gender: z.enum(['M', 'F']),
  nationality: z.string().trim(),
  address: z.string().trim(),
  previousSchool: z.string().trim(),
  requestedLevelId: z.string().min(1, 'Sélectionnez le niveau demandé.'),
  academicYear: z.string(),
  guardianId: z
    .string()
    .min(
      1,
      'Rattachez un parent ou tuteur. Créez-le depuis « Parents & tuteurs » s’il n’existe pas encore.',
    ),
  guardianRelation: z.enum([
    'pere',
    'mere',
    'tuteur',
    'oncle',
    'tante',
    'grand_parent',
    'autre',
  ]),
});

export type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

/** Décision motivée sur un dossier (validation, refus). */
export const decisionSchema = z.object({
  note: z
    .string()
    .trim()
    .min(10, 'Le motif doit comporter au moins 10 caractères.'),
});

export type DecisionValues = z.infer<typeof decisionSchema>;
