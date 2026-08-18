import { getStudentFormData } from '@/features/students/queries.server';
import { StudentForm } from '@/features/students/components/StudentForm';
import { studentName } from '@/lib/selectors';
import {
  Card,
  EmptyState,
  LinkButton,
  PageContainer,
  PageHeader,
} from '@/components/ui';

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>;
}) {
  const { tenant, id } = await params;
  const data = await getStudentFormData(id);

  if (!data.student) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title="Élève introuvable"
            message="Cette fiche n’existe pas, ou vous n’y avez pas accès."
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

  const nom = studentName(data.student);

  return (
    <PageContainer>
      <PageHeader
        title={`Modifier ${nom}`}
        description="Les modifications sont enregistrées en base et visibles immédiatement."
        breadcrumb={[
          { label: 'Élèves', href: `/${tenant}/students` },
          { label: nom, href: `/${tenant}/students/${id}` },
          { label: 'Modifier' },
        ]}
      />
      <StudentForm tenantSlug={tenant} {...data} />
    </PageContainer>
  );
}
