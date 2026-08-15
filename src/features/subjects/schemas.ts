import { z } from 'zod';

export const subjectBaseSchema = z.object({
  code: z.string().trim().min(1, 'Le code est obligatoire.'),
  name: z.string().trim().min(1, 'Le nom de la matière est obligatoire.'),
  levelIds: z.array(z.string()).min(1, 'Sélectionnez au moins un niveau.'),
  cycle: z.enum([
    'garderie',
    'prescolaire',
    'primaire',
    'college',
    'lycee',
    'superieur',
  ]),
  teacherId: z.string(),
  status: z.enum(['active', 'archivee']),
  description: z.string().trim(),
  ue: z.string().trim(),
  ecue: z.string().trim(),
  ectsCredits: z
    .number()
    .min(0, 'Les crédits ECTS doivent être positifs.')
    .max(60, 'Les crédits ECTS ne peuvent pas dépasser 60.'),
  semester: z.string().trim(),
  filiere: z.string().trim(),
});

export type SubjectFormValues = z.infer<typeof subjectBaseSchema>;

/** Ajoute l'unicité du code matière. */
export function subjectSchema(takenCodes: string[]) {
  const taken = new Set(takenCodes.map((code) => code.toLowerCase()));
  return subjectBaseSchema.extend({
    code: subjectBaseSchema.shape.code.refine(
      (value) => !taken.has(value.toLowerCase()),
      'Ce code est déjà utilisé par une autre matière.',
    ),
  });
}
