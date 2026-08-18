import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Building2, MailQuestion } from 'lucide-react';
import { getMemberships, getUser } from '@/lib/auth/server';
import { signOut } from '@/features/auth/actions';
import { Badge, Card } from '@/components/ui';
import { authMessages as m } from '@/features/auth/messages';

/**
 * Choix de l'établissement après connexion.
 *
 * Composant **serveur** : la liste vient de la base, filtrée par les
 * politiques RLS pour l'utilisateur de la session. C'est le pendant de la
 * vérification faite dans le layout de l'espace établissement — ici on
 * propose, là on vérifie, et la seconde ne fait jamais confiance à la
 * première.
 */
export default async function SelectTenantPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const memberships = await getMemberships();
  const active = memberships.filter((item) => item.status === 'active');
  const pending = memberships.filter((item) => item.status !== 'active');

  // Une seule appartenance : choisir n'aurait aucun sens.
  if (active.length === 1 && pending.length === 0) {
    redirect(`/${active[0].slug}/dashboard`);
  }

  return (
    <Card className="p-6 sm:p-8">
      <h1 className="text-xl font-bold text-slate-900">{m.select.title}</h1>
      <p className="text-sm text-slate-500 mt-1 leading-relaxed">
        {active.length > 1 ? m.select.description : m.select.single}
      </p>
      <p className="text-xs text-slate-400 mt-2">{user.email}</p>

      {active.length === 0 ? (
        <div className="mt-6 text-center py-8">
          <span className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Building2 size={24} aria-hidden="true" />
          </span>
          <p className="text-sm font-medium text-slate-700">
            {m.select.emptyTitle}
          </p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xs mx-auto">
            {m.select.emptyMessage}
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {active.map((membership) => (
            <li key={membership.tenantId}>
              <Link
                href={`/${membership.slug}/dashboard`}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/40 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
              >
                <span
                  aria-hidden="true"
                  className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-xl shrink-0"
                >
                  {membership.logo}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900 truncate">
                    {membership.name}
                  </span>
                  <span className="block text-xs text-slate-500 truncate">
                    {membership.city} · {membership.type}
                  </span>
                  <span className="inline-flex mt-1.5">
                    <Badge tone="slate">{membership.roleName}</Badge>
                  </span>
                </span>

                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="text-slate-300 shrink-0"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {pending.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
            {m.select.pending}
          </h2>
          <ul className="space-y-2">
            {pending.map((membership) => (
              <li key={membership.tenantId}>
                <Link
                  href={`/accept-invite?etablissement=${membership.slug}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-200 hover:bg-slate-50 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                >
                  <span
                    aria-hidden="true"
                    className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-xl shrink-0"
                  >
                    {membership.logo}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-slate-900 truncate">
                      {membership.name}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {m.select.review}
                    </span>
                  </span>

                  <MailQuestion
                    size={16}
                    aria-hidden="true"
                    className="text-yellow-500 shrink-0"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form action={signOut} className="mt-6 pt-5 border-t border-slate-100 text-center">
        <button
          type="submit"
          className="text-sm text-slate-500 hover:text-slate-900 transition-colors rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
        >
          {m.select.logout}
        </button>
      </form>
    </Card>
  );
}
