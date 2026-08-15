import { z } from 'zod';

export const announcementSchema = z
  .object({
    title: z.string().trim().min(1, 'Le titre est obligatoire.'),
    content: z.string().trim().min(1, 'Le contenu est obligatoire.'),
    authorName: z.string().trim().min(1, 'L’auteur est obligatoire.'),
    audience: z.enum([
      'tous',
      'parents',
      'eleves',
      'etudiants',
      'enseignants',
      'administration',
      'classe',
    ]),
    targetClassId: z.string(),
    targetLevelId: z.string(),
    publishedAt: z.string(),
    expiresAt: z.string(),
    status: z.enum(['brouillon', 'programmee', 'publiee', 'archivee']),
    pinned: z.boolean(),
  })
  .superRefine((values, context) => {
    if (values.audience === 'classe' && !values.targetClassId) {
      context.addIssue({
        code: 'custom',
        path: ['targetClassId'],
        message: 'Sélectionnez la classe concernée.',
      });
    }
    if (
      values.publishedAt &&
      values.expiresAt &&
      values.expiresAt < values.publishedAt
    ) {
      context.addIssue({
        code: 'custom',
        path: ['expiresAt'],
        message:
          'La date d’expiration doit être postérieure à la date de publication.',
      });
    }
    if (values.status !== 'brouillon' && !values.publishedAt) {
      context.addIssue({
        code: 'custom',
        path: ['publishedAt'],
        message: 'Une annonce publiée doit avoir une date de publication.',
      });
    }
  });

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;
