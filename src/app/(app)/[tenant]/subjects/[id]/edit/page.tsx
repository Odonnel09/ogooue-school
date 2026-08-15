'use client';

import { use } from 'react';
import { useHref } from '@/lib/hooks';
import { useSchoolData } from '@/lib/store/school-data';
import {
  Card,
  EmptyState,
  LinkButton,
  PageContainer,
  PageHeader,
} from '@/components/ui';
import { SubjectForm } from '@/features/subjects/components/SubjectForm';

export default function EditSubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const href = useHref();
  const { subjects } = useSchoolData();
  const subject = subjects.find((item) => item.id === id);

  if (!subject) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title="Matière introuvable"
            message="Cette matière n’existe pas ou a été supprimée."
            action={
              <LinkButton href={href('/subjects')} variant="outline">
                Retour au catalogue
              </LinkButton>
            }
          />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Modifier ${subject.name}`}
        description="Les modifications sont appliquées immédiatement au catalogue."
        breadcrumb={[
          { label: 'Matières', href: href('/subjects') },
          { label: subject.name, href: href(`/subjects/${subject.id}`) },
          { label: 'Modifier' },
        ]}
      />
      <SubjectForm subject={subject} />
    </PageContainer>
  );
}
