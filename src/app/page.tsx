import { redirect } from 'next/navigation';
import { getMemberships, getUser } from '@/lib/auth/server';

/**
 * Racine de l'application.
 *
 * Rien à afficher ici : tout écran appartient à un établissement. On oriente
 * selon ce que la session permet — sans session, la connexion ; avec une
 * seule appartenance, l'établissement directement, choisir n'aurait aucun
 * sens ; au-delà, le sélecteur.
 */
export default async function RootPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const memberships = (await getMemberships()).filter(
    (item) => item.status === 'active',
  );

  if (memberships.length === 1) redirect(`/${memberships[0].slug}/dashboard`);
  redirect('/select-tenant');
}
