'use client';

import { use } from 'react';
import { useHref } from '@/lib/hooks';
import { useSchoolData } from '@/lib/store/school-data';
import { studentName } from '@/lib/selectors';
import {
  EmptyState,
  LinkButton,
  PageContainer,
  PageHeader,
  Card,
} from '@/components/ui';
import { StudentForm } from '@/features/students/components/StudentForm';

export default function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const href = useHref();
  const { students } = useSchoolData();
  const student = students.find((item) => item.id === id);

  if (!student) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title="Élève introuvable"
            message="Cette fiche n’existe pas ou a été supprimée."
            action={
              <LinkButton href={href('/students')} variant="outline">
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
        title={`Modifier ${studentName(student)}`}
        description="Les modifications sont appliquées immédiatement à la fiche et à la liste."
        breadcrumb={[
          { label: 'Élèves', href: href('/students') },
          { label: studentName(student), href: href(`/students/${student.id}`) },
          { label: 'Modifier' },
        ]}
      />
      <StudentForm student={student} />
    </PageContainer>
  );
}
