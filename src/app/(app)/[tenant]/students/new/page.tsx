import { getStudentFormData } from '@/features/students/queries.server';
import { StudentForm } from '@/features/students/components/StudentForm';
import { PageContainer, PageHeader } from '@/components/ui';

export default async function NewStudentPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const data = await getStudentFormData();

  return (
    <PageContainer>
      <PageHeader
        title="Nouvel élève"
        description="Renseignez le dossier d’inscription. Les champs marqués d’un astérisque sont obligatoires."
        breadcrumb={[
          { label: 'Élèves', href: `/${tenant}/students` },
          { label: 'Nouvel élève' },
        ]}
      />
      <StudentForm tenantSlug={tenant} {...data} />
    </PageContainer>
  );
}
