import { z } from 'zod';
import type { StudentFieldKey } from '@/lib/school-levels/capabilities';

/**
 * Schémas de validation du dossier élève.
 *
 * Le schéma est **construit à partir des capacités du cycle** : le bloc tuteur
 * n'est exigé que si `guardian` fait partie des champs actifs. Aucune règle de
 * niveau scolaire n'est écrite dans le composant de formulaire.
 *
 * Ces schémas seront réutilisés tels quels côté serveur : la validation ne doit
 * jamais exister uniquement dans le navigateur.
 */

export const studentBaseSchema = z.object({
  firstName: z.string().trim().min(1, 'Le prénom est obligatoire.'),
  lastName: z.string().trim().min(1, 'Le nom est obligatoire.'),
  matricule: z.string().trim(),
  birthDate: z.string(),
  birthPlace: z.string().trim(),
  gender: z.enum(['M', 'F']),
  nationality: z.string().trim(),
  address: z.string().trim(),
  photoUrl: z.string().trim(),
  classId: z.string(),
  levelId: z.string(),
  academicYear: z.string(),
  status: z.enum(['actif', 'en_attente', 'transfere', 'archive']),
  /** Référence vers `Guardian.id` — le tuteur est une personne, pas un champ. */
  guardianId: z.string(),
  guardianRelation: z.enum([
    'pere',
    'mere',
    'tuteur',
    'oncle',
    'tante',
    'grand_parent',
    'autre',
  ]),
  canPickUp: z.boolean(),
  medicalInfo: z.string().trim(),
  previousSchool: z.string().trim(),
  filiere: z.string().trim(),
  parcours: z.string().trim(),
});

export type StudentFormValues = z.infer<typeof studentBaseSchema>;

/** Brouillon : seule l'identité est exigée, le dossier reste modifiable. */
export const studentDraftSchema = studentBaseSchema;

interface FinalSchemaOptions {
  /** Blocs actifs, issus de la matrice de capacités. */
  fields: StudentFieldKey[];
  /** Matricules déjà attribués, hors élève en cours d'édition. */
  takenMatricules: string[];
}

/** Schéma complet, exigé à l'enregistrement définitif de la fiche. */
export function studentFinalSchema({
  fields,
  takenMatricules,
}: FinalSchemaOptions) {
  const taken = new Set(
    takenMatricules.map((matricule) => matricule.toLowerCase()),
  );

  return studentBaseSchema
    .extend({
      matricule: z
        .string()
        .trim()
        .min(1, 'Le matricule est obligatoire.')
        .refine(
          (value) => !taken.has(value.toLowerCase()),
          'Ce matricule est déjà attribué à un autre élève.',
        ),
      birthDate: z.string().min(1, 'La date de naissance est obligatoire.'),
      classId: z.string().min(1, 'Sélectionnez une classe.'),
      levelId: z.string().min(1, 'Sélectionnez un niveau scolaire.'),
    })
    .superRefine((values, context) => {
      // Le tuteur n'est exigé que pour les cycles qui déclarent ce bloc.
      if (!fields.includes('guardian')) return;

      if (!values.guardianId) {
        context.addIssue({
          code: 'custom',
          path: ['guardianId'],
          message:
            'Rattachez un parent ou tuteur. Créez-le depuis « Parents & tuteurs » s’il n’existe pas encore.',
        });
      }
    });
}
