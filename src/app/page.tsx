import { redirect } from 'next/navigation';
import { activeMemberships } from '@/lib/tenant/membership';

/**
 * Racine de l'application.
 *
 * Il n'y a rien à afficher ici : tout écran appartient à un établissement.
 * Avec une seule appartenance, choisir n'aurait aucun sens — on ouvre
 * directement. Au-delà, on passe par le sélecteur.
 *
 * REMPLACEMENT SUPABASE : la redirection ira vers `/login` en l'absence de
 * session, et les appartenances seront lues côté serveur depuis celle-ci.
 */
export default function RootPage() {
  const memberships = activeMemberships();

  if (memberships.length === 1) {
    redirect(`/${memberships[0].slug}/dashboard`);
  }

  redirect('/select-tenant');
}
