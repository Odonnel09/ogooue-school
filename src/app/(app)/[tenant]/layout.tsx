import { AppShell } from '@/components/layout/AppShell';
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

  // TODO: Validate tenant membership against the database
  // e.g., const { data: membership } = await supabase.rpc('app.is_member_of', { tenant_slug: tenant });
  // if (!membership) notFound();

  return (
    <SchoolDataProvider>
      <SessionProvider>
        <ToastProvider>
          <AppShell tenantSlug={tenant}>{children}</AppShell>
        </ToastProvider>
      </SessionProvider>
    </SchoolDataProvider>
  );
}
