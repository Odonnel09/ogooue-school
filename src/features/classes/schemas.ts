import { z } from 'zod';

export const classSubjectRowSchema = z.object({
  subjectId: z.string().min(1),
  teacherId: z.string(),
  coefficient: z
    .number()
    .min(0.5, 'Le coefficient minimal est 0,5.')
    .max(10, 'Le coefficient ne peut pas dépasser 10.'),
  weeklyHours: z
    .number()
    .min(0, 'Le volume horaire doit être positif.')
    .max(40, 'Le volume horaire hebdomadaire ne peut pas dépasser 40 h.'),
});

export type ClassSubjectRow = z.infer<typeof classSubjectRowSchema>;

export const classBaseSchema = z.object({
  name: z.string().trim().min(1, 'Le nom de la classe est obligatoire.'),
  levelId: z.string().min(1, 'Sélectionnez un niveau.'),
  cycle: z.enum([
    'garderie',
    'prescolaire',
    'primaire',
    'college',
    'lycee',
    'superieur',
  ]),
  academicYear: z.string(),
  capacity: z
    .number()
    .int('La capacité doit être un nombre entier.')
    .min(1, 'La capacité doit être supérieure à zéro.')
    .max(300, 'La capacité ne peut pas dépasser 300 places.'),
  room: z.string(),
  mainTeacherId: z.string(),
  description: z.string().trim(),
  status: z.enum(['active', 'en_preparation', 'archivee']),
  subjects: z.array(classSubjectRowSchema),
});

export type ClassFormValues = z.infer<typeof classBaseSchema>;

/** Ajoute l'unicité du nom de classe pour une même année scolaire. */
export function classSchema(taken: Array<{ name: string; year: string }>) {
  return classBaseSchema.superRefine((values, context) => {
    const duplicate = taken.some(
      (item) =>
        item.year === values.academicYear &&
        item.name.toLowerCase() === values.name.trim().toLowerCase(),
    );
    if (duplicate) {
      context.addIssue({
        code: 'custom',
        path: ['name'],
        message: 'Une classe porte déjà ce nom pour cette année scolaire.',
      });
    }
  });
}
