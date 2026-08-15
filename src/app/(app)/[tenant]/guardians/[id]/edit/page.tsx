'use client';

import { use } from 'react';
import { useHref } from '@/lib/hooks';
import { useSchoolData } from '@/lib/store/school-data';
import { guardianName } from '@/lib/selectors';
import {
  Card,
  EmptyState,
  LinkButton,
  PageContainer,
  PageHeader,
} from '@/components/ui';
import { GuardianForm } from '@/features/guardians/components/GuardianForm';
import { guardianMessages as m } from '@/features/guardians/messages';

export default function EditGuardianPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const href = useHref();
  const { guardians } = useSchoolData();
  const guardian = guardians.find((item) => item.id === id);

  if (!guardian) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title={m.detail.notFoundTitle}
            message={m.detail.notFoundMessage}
            action={
              <LinkButton href={href('/guardians')} variant="outline">
                {m.detail.backToList}
              </LinkButton>
            }
          />
        </Card>
      </PageContainer>
    );
  }

  const fullName = guardianName(guardian);

  return (
    <PageContainer>
      <PageHeader
        title={m.form.editTitle(fullName)}
        description={m.form.editDescription}
        breadcrumb={[
          { label: m.list.title, href: href('/guardians') },
          { label: fullName, href: href(`/guardians/${guardian.id}`) },
          { label: 'Modifier' },
        ]}
      />
      <GuardianForm guardian={guardian} />
    </PageContainer>
  );
}
