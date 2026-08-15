'use client';

import { useHref } from '@/lib/hooks';
import { PageContainer, PageHeader } from '@/components/ui';
import { TeacherForm } from '@/features/teachers/components/TeacherForm';

export default function NewTeacherPage() {
  const href = useHref();

  return (
    <PageContainer>
      <PageHeader
        title="Nouvel enseignant"
        description="Créez la fiche d’un enseignant et affectez-lui ses matières et ses classes."
        breadcrumb={[
          { label: 'Enseignants', href: href('/teachers') },
          { label: 'Nouvel enseignant' },
        ]}
      />
      <TeacherForm />
    </PageContainer>
  );
}
