import { z } from 'zod';

const PHONE = /^\+?[0-9\s().-]{6,20}$/;

export const guardianSchema = z.object({
  firstName: z.string().trim().min(1, 'Le prénom est obligatoire.'),
  lastName: z.string().trim().min(1, 'Le nom est obligatoire.'),
  phone: z
    .string()
    .trim()
    .min(1, 'Le téléphone est obligatoire.')
    .regex(PHONE, 'Numéro de téléphone invalide (format attendu : +241 ...).'),
  altPhone: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || PHONE.test(value),
      'Numéro de téléphone invalide.',
    ),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || z.email().safeParse(value).success,
      'Adresse e-mail invalide.',
    ),
  address: z.string().trim(),
  profession: z.string().trim(),
  idDocument: z.string().trim(),
  notes: z.string().trim(),
  status: z.enum(['actif', 'archive']),
});

export type GuardianFormValues = z.infer<typeof guardianSchema>;
