import { z } from 'zod';

export const evaluationSchema = z.object({
  name: z.string().trim().min(1, 'Le nom de l’évaluation est obligatoire.'),
  type: z.enum([
    'observation',
    'bilan_periodique',
    'evaluation_competence',
    'devoir',
    'controle',
    'composition',
    'examen',
    'oral',
    'tp',
    'projet',
    'controle_continu',
    'rattrapage',
    'autre',
  ]),
  subjectId: z.string().min(1, 'Sélectionnez une matière.'),
  classId: z.string().min(1, 'Sélectionnez une classe.'),
  teacherId: z.string().min(1, 'Sélectionnez un enseignant.'),
  academicYear: z.string(),
  periodId: z.string().min(1, 'Sélectionnez une période.'),
  date: z.string().min(1, 'La date est obligatoire.'),
  scale: z.enum([
    'sur_20',
    'sur_10',
    'pourcentage',
    'acquis',
    'competence',
    'personnalise',
    'ects',
  ]),
  maxScore: z
    .number()
    .min(1, 'Le barème doit être supérieur à zéro.')
    .max(1000, 'Le barème ne peut pas dépasser 1000.'),
  coefficient: z
    .number()
    .min(0.5, 'Le coefficient minimal est 0,5.')
    .max(20, 'Le coefficient ne peut pas dépasser 20.'),
  description: z.string().trim(),
  status: z.enum(['draft', 'in_progress', 'submitted', 'validated', 'published']),
});

export type EvaluationFormValues = z.infer<typeof evaluationSchema>;

/** Correction d'une note après verrouillage : le motif est obligatoire. */
export const gradeCorrectionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, 'Le motif doit comporter au moins 10 caractères.'),
});

export type GradeCorrectionValues = z.infer<typeof gradeCorrectionSchema>;
