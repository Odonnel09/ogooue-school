'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck, Send } from 'lucide-react';
import { Button, Card, Field, Input } from '@/components/ui';
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from '@/features/auth/schemas';
import { authMessages as m } from '@/features/auth/messages';

/**
 * Demande de réinitialisation.
 *
 * Le point qui compte : **la réponse est la même dans tous les cas**. Qu'un
 * compte existe ou non pour l'adresse saisie, l'écran affiche la même
 * confirmation. Répondre « adresse inconnue » transformerait ce formulaire en
 * outil de reconnaissance des comptes de l'établissement.
 *
 * REMPLACEMENT SUPABASE : `supabase.auth.resetPasswordForEmail()`, appelé
 * depuis une Server Action et limité en fréquence côté serveur.
 */
export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    defaultValues: { email: '' },
    resolver: zodResolver(forgotPasswordSchema),
  });

  function submit() {
    setPending(true);
    setTimeout(() => {
      setPending(false);
      setSent(true);
    }, 600);
  }

  if (sent) {
    return (
      <Card className="p-6 sm:p-8">
        <span className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-5">
          <MailCheck size={24} aria-hidden="true" />
        </span>

        <h1 className="text-xl font-bold text-slate-900">
          {m.forgot.sentTitle}
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {m.forgot.sentMessage}
        </p>
        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
          {m.forgot.spamHint}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setSent(false)}>
            {m.forgot.resend}
          </Button>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            {m.forgot.back}
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <h1 className="text-xl font-bold text-slate-900">{m.forgot.title}</h1>
      <p className="text-sm text-slate-500 mt-1 leading-relaxed">
        {m.forgot.description}
      </p>

      <form
        noValidate
        onSubmit={handleSubmit(submit)}
        className="mt-6 space-y-4"
      >
        <Field
          label={m.forgot.fields.email}
          htmlFor="email"
          required
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="prenom.nom@etablissement.ga"
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </Field>

        <Button type="submit" loading={pending} className="w-full justify-center">
          <Send size={16} aria-hidden="true" /> {m.forgot.submit}
        </Button>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-brand-600 hover:underline rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            {m.forgot.back}
          </Link>
        </div>
      </form>
    </Card>
  );
}
