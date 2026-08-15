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
import { EvaluationForm } from '@/features/evaluations/components/EvaluationForm';

export default function EditEvaluationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const href = useHref();
  const { evaluations } = useSchoolData();
  const evaluation = evaluations.find((item) => item.id === id);

  if (!evaluation) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title="Évaluation introuvable"
            message="Cette évaluation n’existe pas ou a été supprimée."
            action={
              <LinkButton href={href('/evaluations')} variant="outline">
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
        title={`Modifier « ${evaluation.name} »`}
        description="Les notes déjà saisies sont conservées lors de la modification."
        breadcrumb={[
          { label: 'Évaluations', href: href('/evaluations') },
          { label: evaluation.name, href: href(`/evaluations/${evaluation.id}`) },
          { label: 'Modifier' },
        ]}
      />
      <EvaluationForm evaluation={evaluation} />
    </PageContainer>
  );
}
