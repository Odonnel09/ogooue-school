'use client';

import { useHref } from '@/lib/hooks';
import { PageContainer, PageHeader } from '@/components/ui';
import { SubjectForm } from '@/features/subjects/components/SubjectForm';

export default function NewSubjectPage() {
  const href = useHref();

  return (
    <PageContainer>
      <PageHeader
        title="Nouvelle matière"
        description="Ajoutez une matière au catalogue et définissez son coefficient et son volume horaire."
        breadcrumb={[
          { label: 'Matières', href: href('/subjects') },
          { label: 'Nouvelle matière' },
        ]}
      />
      <SubjectForm />
    </PageContainer>
  );
}
