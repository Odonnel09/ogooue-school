import Link from 'next/link';
import { Building2, ShieldAlert } from 'lucide-react';
import type { TenantMembership } from '@/types';
import { activeMemberships } from '@/lib/tenant/membership';

/**
 * Écran rendu quand le slug de l'URL ne correspond à aucune appartenance
 * ouverte. Composant **serveur** : la décision est prise avant tout rendu de
 * données, jamais après coup dans le navigateur.
 */
export function TenantDenied({
  slug,
  pending,
}: {
  slug: string;
  pending: TenantMembership | null;
}) {
  const available = activeMemberships();

  return (
    <main className="min-h-dvh flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <span className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-5">
          <ShieldAlert size={26} aria-hidden="true" />
        </span>

        <h1 className="text-lg font-bold text-slate-900">
          {pending
            ? 'Accès pas encore ouvert'
            : 'Établissement inaccessible'}
        </h1>

        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {pending ? (
            <>
              Vous avez été invité à rejoindre{' '}
              <strong className="text-slate-900">{pending.name}</strong>, mais
              l’invitation n’a pas encore été acceptée. L’accès s’ouvrira une
              fois celle-ci confirmée.
            </>
          ) : (
            <>
              Aucun établissement ouvert ne correspond à{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">
                {slug}
              </code>
              . Vous n’en êtes pas membre, ou il n’existe pas.
            </>
          )}
        </p>

        <p className="text-xs text-slate-500 mt-4 leading-relaxed border-l-2 border-slate-200 pl-3">
          L’adresse d’une page n’ouvre aucun droit : l’appartenance est vérifiée
          hors du navigateur, et aucune donnée d’un autre établissement n’est
          chargée avant cette vérification.
        </p>

        {available.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
              Vos établissements
            </h2>
            <ul className="space-y-2">
              {available.map((membership) => (
                <li key={membership.tenantId}>
                  <Link
                    href={`/${membership.slug}/dashboard`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                  >
                    <span
                      aria-hidden="true"
                      className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-lg shrink-0"
                    >
                      {membership.logo}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-900 truncate">
                        {membership.name}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {membership.city}
                      </span>
                    </span>
                    <Building2
                      size={16}
                      aria-hidden="true"
                      className="ml-auto text-slate-300 shrink-0"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
