import { Info, LogIn } from 'lucide-react';
import { Card } from '@/components/ui';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { authMessages as m } from '@/features/auth/messages';

/**
 * Connexion — rendue par le serveur.
 *
 * Les paramètres d'adresse sont lus ici, en composant serveur, plutôt que par
 * `useSearchParams()` dans un composant client : cela évite la frontière
 * Suspense et donc le squelette qui clignotait sur la page d'entrée du
 * produit. Seul le formulaire est client, parce qu'il a un état.
 */
const MOTIFS: Record<string, string> = {
  lien_invalide: 'Ce lien n’est pas valable. Demandez-en un nouveau.',
  lien_expire: 'Ce lien a expiré. Demandez-en un nouveau.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string; erreur?: string }>;
}) {
  const { suite, erreur } = await searchParams;

  return (
    <>
      <Card className="p-6 sm:p-8">
        <span className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
          <LogIn size={24} aria-hidden="true" />
        </span>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {m.login.title}
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">{m.login.description}</p>

        <LoginForm
          suite={suite}
          motif={erreur ? MOTIFS[erreur] : undefined}
        />
      </Card>

      <p className="mt-5 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
        <Info size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
        {m.login.inviteOnlyNotice}
      </p>
    </>
  );
}
