'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, CheckCircle2, Info, KeyRound, LinkIcon, X } from 'lucide-react';
import { passwordStrength } from '@/lib/auth/password';
import { cn } from '@/lib/utils';
import { Button, Card, Field, Input } from '@/components/ui';
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from '@/features/auth/schemas';
import { authMessages as m } from '@/features/auth/messages';
import { AuthCardSkeleton } from '@/features/auth/components/AuthCardSkeleton';

/**
 * Définition d'un nouveau mot de passe.
 *
 * Le jeton présent dans l'adresse **vaut preuve d'identité à lui seul** :
 * quiconque l'obtient peut changer le mot de passe. D'où trois exigences, dont
 * une seule relève de cet écran :
 *   — usage unique et expiration courte (serveur) ;
 *   — vérification à chaque emploi (serveur) ;
 *   — ne jamais le recopier ailleurs que dans l'appel qui l'échange (ici).
 *
 * REMPLACEMENT SUPABASE : `supabase.auth.updateUser({ password })` après
 * échange du jeton contre une session, dans une Server Action.
 */
const TONE_BARS: Record<string, string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
};

const TONE_TEXT: Record<string, string> = {
  red: 'text-red-500',
  orange: 'text-orange-500',
  yellow: 'text-yellow-600',
  green: 'text-green-600',
};

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    defaultValues: { password: '', confirmation: '' },
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = useWatch({ control, name: 'password' }) ?? '';
  const strength = passwordStrength(password);

  function submit() {
    setPending(true);
    setTimeout(() => {
      setPending(false);
      setDone(true);
    }, 600);
  }

  /* ------------------------------------------------ Lien absent ou expiré */
  if (!token) {
    return (
      <Card className="p-6 sm:p-8">
        <span className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-5">
          <LinkIcon size={24} aria-hidden="true" />
        </span>

        <h1 className="text-xl font-bold text-slate-900">
          {m.reset.invalidTitle}
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {m.reset.invalidMessage}
        </p>

        <div className="mt-6">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            {m.reset.request}
          </Link>
        </div>
      </Card>
    );
  }

  /* --------------------------------------------------------- Confirmation */
  if (done) {
    return (
      <Card className="p-6 sm:p-8">
        <span className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-5">
          <CheckCircle2 size={24} aria-hidden="true" />
        </span>

        <h1 className="text-xl font-bold text-slate-900">
          {m.reset.doneTitle}
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {m.reset.doneMessage}
        </p>

        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            {m.reset.toLogin}
          </Link>
        </div>
      </Card>
    );
  }

  /* ------------------------------------------------------------ Formulaire */
  return (
    <Card className="p-6 sm:p-8">
      <h1 className="text-xl font-bold text-slate-900">{m.reset.title}</h1>
      <p className="text-sm text-slate-500 mt-1 leading-relaxed">
        {m.reset.description}
      </p>

      <form
        noValidate
        onSubmit={handleSubmit(submit)}
        className="mt-6 space-y-4"
      >
        <Field
          label={m.reset.fields.password}
          htmlFor="password"
          required
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            autoFocus
            invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </Field>

        {password.length > 0 && (
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs text-slate-500">{m.reset.strength}</span>
              <span
                className={cn(
                  'text-xs font-medium',
                  TONE_TEXT[strength.tone],
                )}
              >
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
                    index < strength.score
                      ? TONE_BARS[strength.tone]
                      : 'bg-slate-100',
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
          error={errors.confirmation?.message}
        >
          <Input
            id="confirmation"
            type="password"
            autoComplete="new-password"
            invalid={Boolean(errors.confirmation)}
            {...register('confirmation')}
          />
        </Field>

        <Button type="submit" loading={pending} className="w-full justify-center">
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

/**
 * La lecture des paramètres d'adresse n'a lieu qu'à la requête : la frontière
 * Suspense est ce qui permet à Next de prérendre la page malgré tout.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
