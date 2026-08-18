'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { Button, Checkbox, Field, Input } from '@/components/ui';
import { signIn, type ActionState } from '../actions';
import { authMessages as m } from '../messages';

/**
 * Formulaire de connexion.
 *
 * Seule cette partie est cliente : la page qui l'entoure est rendue par le
 * serveur, sans frontière Suspense. La porte d'entrée du produit ne doit pas
 * afficher un squelette le temps de l'hydratation.
 *
 * Le mot de passe part dans une Server Action et rien d'autre. Aucun jeton
 * n'est manipulé ici, aucune session n'est posée depuis le navigateur.
 */
export function LoginForm({
  suite,
  motif,
}: {
  suite?: string;
  motif?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signIn,
    {},
  );

  const erreur = state.error ?? motif;

  return (
    <>
      <form action={formAction} className="mt-7 space-y-4">
        {suite && <input type="hidden" name="suite" value={suite} />}

        {erreur && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100"
          >
            <AlertCircle
              size={16}
              aria-hidden="true"
              className="text-red-500 mt-0.5 shrink-0"
            />
            <p className="text-xs text-red-700 leading-relaxed">{erreur}</p>
          </div>
        )}

        <Field label={m.login.fields.email} htmlFor="email" required>
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

        <Field label={m.login.fields.password} htmlFor="password" required>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setVisible((previous) => !previous)}
              aria-label={visible ? m.login.hidePassword : m.login.showPassword}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
            >
              {visible ? (
                <EyeOff size={16} aria-hidden="true" />
              ) : (
                <Eye size={16} aria-hidden="true" />
              )}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between gap-3 pt-1">
          <Checkbox
            name="rememberMe"
            label={m.login.fields.remember}
            className="border-0 p-0 hover:bg-transparent"
          />
          <Link
            href="/forgot-password"
            className="text-sm text-brand-600 hover:text-brand-700 hover:underline rounded shrink-0 outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            {m.login.forgot}
          </Link>
        </div>

        <Button
          type="submit"
          loading={pending}
          className="w-full justify-center h-12"
        >
          {m.login.submit}
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 flex items-start gap-2">
        <ShieldCheck
          size={14}
          aria-hidden="true"
          className="text-slate-300 mt-0.5 shrink-0"
        />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {m.login.noEnumerationNotice}
        </p>
      </div>
    </>
  );
}
