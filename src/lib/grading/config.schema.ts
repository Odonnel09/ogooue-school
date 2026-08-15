import { z } from 'zod';

/**
 * Schéma Zod de la configuration de notation.
 * Il sera réutilisé tel quel côté serveur lors du branchement Supabase :
 * la validation ne doit jamais exister uniquement dans le navigateur.
 */
export const gradingConfigSchema = z.object({
  kind: z.enum(['qualitative', 'competency', 'numeric_weighted', 'lmd']),
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
    .int('Le barème doit être un nombre entier.')
    .min(1, 'Le barème doit être supérieur à zéro.')
    .max(1000, 'Le barème ne peut pas dépasser 1000.'),
  rounding: z.enum(['round_half_up', 'truncate', 'nearest_quarter']),
  absencePolicy: z.enum(['exclude', 'count_as_zero']),
  passMark: z
    .number()
    .min(0, 'Le seuil de réussite ne peut pas être négatif.')
    .max(20, 'Le seuil de réussite s’exprime sur 20.'),
  weights: z.record(z.string(), z.number().min(0).max(10)),
  mentions: z.array(
    z.object({
      label: z.string().min(1, 'Le libellé est obligatoire.'),
      min: z.number().min(0).max(20),
    }),
  ),
  compensation: z.boolean(),
  sessions: z.boolean(),
  resitThreshold: z.number().min(0).max(20),
});

export type GradingConfigInput = z.infer<typeof gradingConfigSchema>;
