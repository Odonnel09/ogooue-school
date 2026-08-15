'use client';

import { use } from 'react';
import { useHref } from '@/lib/hooks';
import { useSchoolData } from '@/lib/store/school-data';
import { teacherName } from '@/lib/selectors';
import {
  Card,
  EmptyState,
  LinkButton,
  PageContainer,
  PageHeader,
} from '@/components/ui';
import { TeacherForm } from '@/features/teachers/components/TeacherForm';

export default function EditTeacherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const href = useHref();
  const { teachers } = useSchoolData();
  const teacher = teachers.find((item) => item.id === id);

  if (!teacher) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title="Enseignant introuvable"
            message="Cette fiche n’existe pas ou a été supprimée."
            action={
              <LinkButton href={href('/teachers')} variant="outline">
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
        title={`Modifier ${teacherName(teacher)}`}
        description="Les modifications sont appliquées immédiatement à la fiche et à la liste."
        breadcrumb={[
          { label: 'Enseignants', href: href('/teachers') },
          { label: teacherName(teacher), href: href(`/teachers/${teacher.id}`) },
          { label: 'Modifier' },
        ]}
      />
      <TeacherForm teacher={teacher} />
    </PageContainer>
  );
}
