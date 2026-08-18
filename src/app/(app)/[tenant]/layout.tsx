import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { TenantDenied } from '@/components/layout/TenantDenied';
import { getSessionContext } from '@/lib/auth/server';
import { SchoolDataProvider } from '@/lib/store/school-data';
import { SessionProvider } from '@/lib/auth/session';
import { ToastProvider } from '@/components/ui/Toast';

/**
 * Racine de l'espace établissement.
 *
 * Trois vérifications, dans cet ordre, **avant tout rendu de données** :
 *
 *   1. Une session existe-t-elle ? Sinon, retour à la connexion.
 *   2. L'utilisateur appartient-il à l'établissement demandé ? Le slug de
 *      l'URL est une demande, jamais une autorisation (`GEMINI.md` l. 404).
 *   3. Quelles permissions y détient-il ? Résolues côté serveur, transmises
 *      à l'interface qui se contente de les afficher.
 *
 * Aucun provider de données n'est monté tant que ces trois réponses ne sont
 * pas obtenues : il n'y a rien à intercepter dans le HTML envoyé.
 */
export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  const session = await getSessionContext(tenant);

  if (!session) {
    redirect(`/login?suite=/${tenant}/dashboard`);
  }

  if (!session.membership) {
    const invitation =
      session.memberships.find((item) => item.slug === tenant) ?? null;
    return (
      <TenantDenied
        slug={tenant}
        pending={invitation}
        available={session.memberships}
      />
    );
  }

  return (
    <SchoolDataProvider>
      <SessionProvider
        membership={session.membership}
        memberships={session.memberships}
        permissions={session.permissions}
        email={session.email}
      >
        <ToastProvider>
          <AppShell tenantSlug={tenant}>{children}</AppShell>
        </ToastProvider>
      </SessionProvider>
    </SchoolDataProvider>
  );
}
