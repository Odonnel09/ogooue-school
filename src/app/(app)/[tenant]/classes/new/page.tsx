'use client';

import { useHref } from '@/lib/hooks';
import { PageContainer, PageHeader } from '@/components/ui';
import { ClassForm } from '@/features/classes/components/ClassForm';

export default function NewClassPage() {
  const href = useHref();

  return (
    <PageContainer>
      <PageHeader
        title="Nouvelle classe"
        description="Créez une classe et définissez sa capacité, sa salle et son encadrement."
        breadcrumb={[
          { label: 'Classes', href: href('/classes') },
          { label: 'Nouvelle classe' },
        ]}
      />
      <ClassForm />
    </PageContainer>
  );
}
