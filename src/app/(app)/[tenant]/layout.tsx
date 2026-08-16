import { AppShell } from '@/components/layout/AppShell';
import { TenantDenied } from '@/components/layout/TenantDenied';
import { pendingMembership, resolveMembership } from '@/lib/tenant/membership';
import { SchoolDataProvider } from '@/lib/store/school-data';
import { SessionProvider } from '@/lib/auth/session';
import { ToastProvider } from '@/components/ui/Toast';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  // NOTE: En mode développement sans Supabase initialisé, on passe outre l'authentification.
  // Décommentez ces lignes une fois le projet Supabase lié.
  /*
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }
  */

  /**
   * VÉRIFICATION DE L'APPARTENANCE — avant tout rendu de données.
   *
   * Le slug de l'URL est une demande, pas une autorisation. Tant que
   * l'appartenance n'est pas établie, aucun provider de données n'est monté :
   * il n'y a rien à intercepter dans le HTML envoyé.
   *
   * REMPLACEMENT SUPABASE : cette lecture deviendra une requête sur
   * `memberships` filtrée par l'utilisateur de la session serveur, doublée de
   * politiques RLS. Le `tenant_id` ne sera jamais lu depuis le navigateur.
   */
  const membership = resolveMembership(tenant);

  if (!membership) {
    return <TenantDenied slug={tenant} pending={pendingMembership(tenant)} />;
  }

  return (
    <SchoolDataProvider>
      <SessionProvider tenantSlug={tenant}>
        <ToastProvider>
          <AppShell tenantSlug={tenant}>{children}</AppShell>
        </ToastProvider>
      </SessionProvider>
    </SchoolDataProvider>
  );
}
