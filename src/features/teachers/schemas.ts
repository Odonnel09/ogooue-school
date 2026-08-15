import { z } from 'zod';

const PHONE = /^\+?[0-9\s().-]{6,20}$/;

export const teacherBaseSchema = z.object({
  firstName: z.string().trim().min(1, 'Le prénom est obligatoire.'),
  lastName: z.string().trim().min(1, 'Le nom est obligatoire.'),
  matricule: z.string().trim().min(1, 'L’identifiant enseignant est obligatoire.'),
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
    .regex(PHONE, 'Numéro de téléphone invalide.'),
  address: z.string().trim(),
  photoUrl: z.string().trim(),
  subjectIds: z.array(z.string()).min(1, 'Sélectionnez au moins une matière.'),
  classIds: z.array(z.string()),
  contractType: z.enum(['permanent', 'contractuel', 'vacataire', 'stagiaire']),
  status: z.enum(['actif', 'conge', 'suspendu', 'archive']),
  startDate: z.string().min(1, 'La date de début est obligatoire.'),
  notes: z.string().trim(),
});

export type TeacherFormValues = z.infer<typeof teacherBaseSchema>;

/** Ajoute le contrôle d'unicité de l'identifiant enseignant. */
export function teacherSchema(takenMatricules: string[]) {
  const taken = new Set(
    takenMatricules.map((matricule) => matricule.toLowerCase()),
  );
  return teacherBaseSchema.extend({
    matricule: teacherBaseSchema.shape.matricule.refine(
      (value) => !taken.has(value.toLowerCase()),
      'Cet identifiant est déjà utilisé.',
    ),
  });
}
