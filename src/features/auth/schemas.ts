import { z } from 'zod';

/**
 * Schémas des écrans d'authentification.
 *
 * Ils seront réutilisés tels quels par les Server Actions : la validation ne
 * doit jamais exister uniquement dans le navigateur. Ce qui est refusé ici est
 * refusé côté serveur, avec les mêmes messages.
 */

export const loginSchema = z.object({
  email: z.email('Adresse électronique invalide.'),
  password: z.string().min(1, 'Le mot de passe est obligatoire.'),
  rememberMe: z.boolean(),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email('Adresse électronique invalide.'),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

/**
 * Le minimum retenu est de 10 caractères — au-delà de la longueur, la
 * politique qui fait foi reste celle du service d'authentification.
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, 'Le mot de passe doit comporter au moins 10 caractères.'),
    confirmation: z.string(),
  })
  .superRefine((values, context) => {
    if (values.password !== values.confirmation) {
      context.addIssue({
        code: 'custom',
        path: ['confirmation'],
        message: 'Les deux mots de passe ne correspondent pas.',
      });
    }
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
