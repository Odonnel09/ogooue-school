import { UserRound } from 'lucide-react';
import { getStudentDetail } from '@/features/students/queries.server';
import { StudentDetailView } from '@/features/students/components/StudentDetailView';
import { Card, EmptyState, LinkButton, PageContainer } from '@/components/ui';

/**
 * Fiche d'un élève — composant serveur.
 *
 * « Introuvable » recouvre deux situations que l'utilisateur n'a pas à
 * distinguer : l'élève n'existe pas, ou les politiques RLS ne le lui
 * accordent pas. Les différencier renseignerait sur l'existence de dossiers
 * d'un autre établissement.
 */
export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>;
}) {
  const { tenant, id } = await params;
  const data = await getStudentDetail(id);

  if (!data) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title="Élève introuvable"
            message="Cette fiche n’existe pas, ou vous n’y avez pas accès."
            icon={<UserRound size={24} aria-hidden="true" />}
            action={
              <LinkButton href={`/${tenant}/students`} variant="outline">
                Retour à la liste
              </LinkButton>
            }
          />
        </Card>
      </PageContainer>
    );
  }

  return <StudentDetailView tenantSlug={tenant} {...data} />;
}
