import { z } from 'zod';

const PHONE = /^\+?[0-9\s().-]{6,20}$/;

/** Profil de l'établissement — onglet « Informations générales ». */
export const tenantProfileSchema = z.object({
  name: z.string().trim().min(1, 'Le nom de l’établissement est obligatoire.'),
  shortName: z.string().trim().max(24, 'Le nom court doit rester bref (24 caractères).'),
  type: z.string().trim(),
  director: z.string().trim(),
  address: z.string().trim(),
  city: z.string().trim().min(1, 'La ville est obligatoire.'),
  country: z.string().trim().min(1, 'Le pays est obligatoire.'),
  email: z
    .string()
    .trim()
    .min(1, 'L’adresse e-mail est obligatoire.')
    .refine(
      (value) => z.email().safeParse(value).success,
      'Adresse e-mail invalide.',
    ),
  phone: z
    .string()
    .trim()
    .min(1, 'Le téléphone est obligatoire.')
    .regex(PHONE, 'Numéro de téléphone invalide (format attendu : +241 ...).'),
  logo: z.string().trim().max(4, 'Un seul emoji est attendu.'),
  currency: z.literal('XAF'),
  timezone: z.string().trim(),
});

export type TenantProfileValues = z.infer<typeof tenantProfileSchema>;

/** Période scolaire — onglet « Périodes ». */
export const periodSchema = z.object({
  label: z.string().trim().min(1, 'Le libellé est obligatoire.'),
  kind: z.enum(['trimestre', 'semestre', 'sequence', 'personnalise']),
  cycles: z
    .array(
      z.enum([
        'garderie',
        'prescolaire',
        'primaire',
        'college',
        'lycee',
        'superieur',
      ]),
    )
    .min(1, 'Sélectionnez au moins un cycle.'),
});

export type PeriodValues = z.infer<typeof periodSchema>;
