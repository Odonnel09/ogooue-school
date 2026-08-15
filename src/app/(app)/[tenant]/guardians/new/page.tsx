'use client';

import { useHref } from '@/lib/hooks';
import { PageContainer, PageHeader } from '@/components/ui';
import { GuardianForm } from '@/features/guardians/components/GuardianForm';
import { guardianMessages as m } from '@/features/guardians/messages';

export default function NewGuardianPage() {
  const href = useHref();

  return (
    <PageContainer>
      <PageHeader
        title={m.form.createTitle}
        description={m.form.createDescription}
        breadcrumb={[
          { label: m.list.title, href: href('/guardians') },
          { label: m.form.createTitle },
        ]}
      />
      <GuardianForm />
    </PageContainer>
  );
}
