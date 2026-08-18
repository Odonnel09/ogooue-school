'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Check, CheckCircle2, Info, KeyRound, X } from 'lucide-react';
import { passwordStrength } from '@/lib/auth/password';
import { cn } from '@/lib/utils';
import { Button, Card, Field, Input } from '@/components/ui';
import { updatePassword, type ActionState } from '@/features/auth/actions';
import { authMessages as m } from '@/features/auth/messages';

/**
 * Définition d'un nouveau mot de passe.
 *
 * Le jeton n'apparaît plus dans cette page : il a été échangé contre une
 * session par `/auth/callback` avant d'y arriver. C'est volontaire — un jeton
 * vaut preuve d'identité à lui seul, il ne doit pas séjourner dans une URL
 * lisible par un historique de navigateur ou un journal de serveur.
 *
 * La conséquence : sans session, l'action refuse. Un lien expiré ne peut donc
 * rien modifier, même en atteignant cette page.
 */
const BARRES: Record<string, string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
};

const TEXTES: Record<string, string> = {
  red: 'text-red-500',
  orange: 'text-orange-500',
  yellow: 'text-yellow-600',
  green: 'text-green-600',
};

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updatePassword,
    {},
  );

  const strength = passwordStrength(password);

  if (state.success) {
    return (
      <Card className="p-6 sm:p-8">
        <span className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-5">
          <CheckCircle2 size={24} aria-hidden="true" />
        </span>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {m.reset.doneTitle}
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {state.success}
        </p>

        <div className="mt-7">
          <Link
            href="/select-tenant"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            Continuer
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
        {m.reset.title}
      </h1>
      <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
        {m.reset.description}
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

        <Field label={m.reset.fields.password} htmlFor="password" required>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            autoFocus
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>

        {password.length > 0 && (
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs text-slate-500">{m.reset.strength}</span>
              <span className={cn('text-xs font-medium', TEXTES[strength.tone])}>
                {strength.label}
              </span>
            </div>

            <div
              className="flex gap-1"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={4}
              aria-valuenow={strength.score}
              aria-label={`${m.reset.strength} : ${strength.label}`}
            >
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors',
                    index < strength.score ? BARRES[strength.tone] : 'bg-slate-100',
                  )}
                />
              ))}
            </div>

            <ul className="mt-3 space-y-1.5">
              {strength.rules.map((rule) => (
                <li
                  key={rule.id}
                  className={cn(
                    'flex items-center gap-2 text-xs',
                    rule.met ? 'text-green-600' : 'text-slate-400',
                  )}
                >
                  {rule.met ? (
                    <Check size={13} aria-hidden="true" />
                  ) : (
                    <X size={13} aria-hidden="true" />
                  )}
                  {rule.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Field
          label={m.reset.fields.confirmation}
          htmlFor="confirmation"
          required
        >
          <Input
            id="confirmation"
            name="confirmation"
            type="password"
            autoComplete="new-password"
            required
          />
        </Field>

        <Button
          type="submit"
          loading={pending}
          className="w-full justify-center h-12"
        >
          <KeyRound size={16} aria-hidden="true" /> {m.reset.submit}
        </Button>
      </form>

      <p className="mt-6 pt-5 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
        <Info size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
        {m.reset.tokenNotice}
      </p>
    </Card>
  );
}
