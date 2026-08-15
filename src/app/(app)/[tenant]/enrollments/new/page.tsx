'use client';

import { useHref } from '@/lib/hooks';
import { PageContainer, PageHeader } from '@/components/ui';
import { EnrollmentForm } from '@/features/enrollments/components/EnrollmentForm';
import { enrollmentMessages as m } from '@/features/enrollments/messages';

export default function NewEnrollmentPage() {
  const href = useHref();

  return (
    <PageContainer>
      <PageHeader
        title={m.form.createTitle}
        description={m.form.createDescription}
        breadcrumb={[
          { label: m.list.title, href: href('/enrollments') },
          { label: m.form.createTitle },
        ]}
      />
      <EnrollmentForm />
    </PageContainer>
  );
}
