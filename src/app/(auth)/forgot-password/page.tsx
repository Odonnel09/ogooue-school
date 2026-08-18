'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { AlertCircle, KeyRound, Mail, MailCheck, Send } from 'lucide-react';
import { Button, Card, Field, Input } from '@/components/ui';
import { requestPasswordReset, type ActionState } from '@/features/auth/actions';
import { authMessages as m } from '@/features/auth/messages';

/**
 * Demande de réinitialisation.
 *
 * Le point qui compte : **la réponse est la même dans tous les cas**. Compte
 * existant, inexistant, ou envoi en échec — l'écran affiche la même
 * confirmation. Répondre « adresse inconnue » transformerait ce formulaire en
 * outil de reconnaissance des comptes de l'établissement.
 */
export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    requestPasswordReset,
    {},
  );

  if (state.success) {
    return (
      <Card className="p-6 sm:p-8">
        <span className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-5">
          <MailCheck size={24} aria-hidden="true" />
        </span>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {m.forgot.sentTitle}
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {state.success}
        </p>
        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
          {m.forgot.spamHint}
        </p>

        <div className="mt-7">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            {m.forgot.back}
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <span className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
        <KeyRound size={24} aria-hidden="true" />
      </span>

      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        {m.forgot.title}
      </h1>
      <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
        {m.forgot.description}
      </p>

      <form action={formAction} className="mt-7 space-y-4">
        {state.error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100"
          >
            <AlertCircle
              size={16}
              aria-hidden="true"
              className="text-red-500 mt-0.5 shrink-0"
            />
            <p className="text-xs text-red-700 leading-relaxed">{state.error}</p>
          </div>
        )}

        <Field label={m.forgot.fields.email} htmlFor="email" required>
          <div className="relative">
            <Mail
              size={16}
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              placeholder="prenom.nom@etablissement.ga"
              className="pl-11"
            />
          </div>
        </Field>

        <Button
          type="submit"
          loading={pending}
          className="w-full justify-center h-12"
        >
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
