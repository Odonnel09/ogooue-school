'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, Info, LogIn } from 'lucide-react';
import { ui } from '@/i18n/fr';
import { Button, Card, Checkbox, Field, Input } from '@/components/ui';
import { loginSchema, type LoginValues } from '@/features/auth/schemas';
import { authMessages as m } from '@/features/auth/messages';

/**
 * Connexion.
 *
 * ⚠️ Maquette : aucun appel au service d'authentification. Deux principes sont
 * néanmoins déjà tenus, parce qu'ils tiennent à l'interface et non au serveur :
 *
 * 1. **Aucune énumération de comptes.** L'échec est toujours le même message,
 *    que l'adresse existe ou non. Distinguer les deux cas donnerait à un tiers
 *    la liste des adresses rattachées à l'établissement.
 * 2. **Rien n'est conservé.** Le mot de passe vit dans l'état du formulaire et
 *    disparaît avec lui : pas de journalisation, pas de stockage local.
 *
 * REMPLACEMENT SUPABASE : `supabase.auth.signInWithPassword()` dans une Server
 * Action, avec limitation du nombre de tentatives côté serveur — une protection
 * qu'un navigateur ne peut pas assurer.
 */
export default function LoginPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    defaultValues: { email: '', password: '', rememberMe: false },
    resolver: zodResolver(loginSchema),
  });

  function submit(values: LoginValues) {
    setFailed(false);
    setPending(true);

    // Latence simulée : le temps réel viendra du service d'authentification.
    setTimeout(() => {
      setPending(false);

      /**
       * Règle de la maquette : tout mot de passe d'au moins 8 caractères
       * « passe ». Un identifiant plus court illustre le message d'échec sans
       * révéler quoi que ce soit sur l'existence du compte.
       */
      if (values.password.length < 8) {
        setFailed(true);
        return;
      }

      router.push('/select-tenant');
    }, 600);
  }

  return (
    <Card className="p-6 sm:p-8">
      <h1 className="text-xl font-bold text-slate-900">{m.login.title}</h1>
      <p className="text-sm text-slate-500 mt-1">{m.login.description}</p>

      <form
        noValidate
        onSubmit={handleSubmit(submit)}
        className="mt-6 space-y-4"
      >
        {failed && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100"
          >
            <AlertCircle
              size={16}
              aria-hidden="true"
              className="text-red-500 mt-0.5 shrink-0"
            />
            <p className="text-xs text-red-700 leading-relaxed">
              {m.login.failed}
            </p>
          </div>
        )}

        <Field
          label={m.login.fields.email}
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

        <Field
          label={m.login.fields.password}
          htmlFor="password"
          required
          error={errors.password?.message}
        >
          <div className="relative">
            <Input
              id="password"
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              className="pr-12"
              invalid={Boolean(errors.password)}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setVisible((previous) => !previous)}
              aria-label={
                visible ? m.login.hidePassword : m.login.showPassword
              }
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

        <Checkbox
          label={m.login.fields.remember}
          description={m.login.fields.rememberHint}
          {...register('rememberMe')}
        />

        <Button type="submit" loading={pending} className="w-full justify-center">
          <LogIn size={16} aria-hidden="true" /> {m.login.submit}
        </Button>

        <div className="text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-brand-600 hover:underline rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            {m.login.forgot}
          </Link>
        </div>
      </form>

      <p className="mt-6 pt-5 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
        <Info size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
        {m.login.noEnumerationNotice}
      </p>

      <p className="sr-only">{ui.brand}</p>
    </Card>
  );
}
