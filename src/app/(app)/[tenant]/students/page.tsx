import { getStudentsPageData } from '@/features/students/queries.server';
import { StudentsView } from '@/features/students/components/StudentsView';

/**
 * Liste des élèves — composant serveur.
 *
 * La page ne fait que charger et transmettre. Toute la logique d'affichage
 * vit dans `StudentsView`, et toutes les écritures dans les Server Actions du
 * module : cette séparation est ce qui permet à la vue de rester interactive
 * sans jamais toucher à la base.
 *
 * Les données passent par les politiques RLS avant d'arriver ici. Un
 * secrétaire de Sainte-Marie qui ouvrirait cette adresse n'obtiendrait pas
 * une liste vide par filtrage applicatif, mais parce que la base ne lui aura
 * rien renvoyé.
 */
export default async function StudentsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const data = await getStudentsPageData();

  return <StudentsView tenantSlug={tenant} {...data} />;
}
