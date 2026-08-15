'use client';

import { useHref } from '@/lib/hooks';
import { PageContainer, PageHeader } from '@/components/ui';
import { StudentForm } from '@/features/students/components/StudentForm';

export default function NewStudentPage() {
  const href = useHref();

  return (
    <PageContainer>
      <PageHeader
        title="Nouvel élève"
        description="Renseignez le dossier d’inscription. Les champs marqués d’un astérisque sont obligatoires."
        breadcrumb={[
          { label: 'Élèves', href: href('/students') },
          { label: 'Nouvel élève' },
        ]}
      />
      <StudentForm />
    </PageContainer>
  );
}
