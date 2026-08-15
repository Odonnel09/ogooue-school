'use client';

import { useHref } from '@/lib/hooks';
import { PageContainer, PageHeader } from '@/components/ui';
import { EvaluationForm } from '@/features/evaluations/components/EvaluationForm';

export default function NewEvaluationPage() {
  const href = useHref();

  return (
    <PageContainer>
      <PageHeader
        title="Nouvelle évaluation"
        description="Créez un devoir, un contrôle ou un examen. La grille de saisie des notes sera générée automatiquement."
        breadcrumb={[
          { label: 'Évaluations', href: href('/evaluations') },
          { label: 'Nouvelle évaluation' },
        ]}
      />
      <EvaluationForm />
    </PageContainer>
  );
}
