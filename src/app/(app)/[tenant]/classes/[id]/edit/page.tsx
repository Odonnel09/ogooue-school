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
import { ClassForm } from '@/features/classes/components/ClassForm';

export default function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const href = useHref();
  const { classes } = useSchoolData();
  const schoolClass = classes.find((item) => item.id === id);

  if (!schoolClass) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title="Classe introuvable"
            message="Cette classe n’existe pas ou a été supprimée."
            action={
              <LinkButton href={href('/classes')} variant="outline">
                Retour à la liste
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
        title={`Modifier ${schoolClass.name}`}
        description="Les modifications sont appliquées immédiatement à la fiche et à la liste."
        breadcrumb={[
          { label: 'Classes', href: href('/classes') },
          { label: schoolClass.name, href: href(`/classes/${schoolClass.id}`) },
          { label: 'Modifier' },
        ]}
      />
      <ClassForm schoolClass={schoolClass} />
    </PageContainer>
  );
}
