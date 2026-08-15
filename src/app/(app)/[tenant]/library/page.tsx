'use client';

import { FileText, Library } from 'lucide-react';
import { useHref } from '@/lib/hooks';
import {
  Card,
  EmptyState,
  LinkButton,
  PageContainer,
  PageHeader,
} from '@/components/ui';

/**
 * Module Bibliothèque — présent dans la navigation de référence.
 * Le contenu (documents, circulaires, manuels) sera branché avec le stockage
 * Supabase lors d'une étape ultérieure.
 */
export default function LibraryPage() {
  const href = useHref();

  return (
    <PageContainer>
      <PageHeader
        title="Bibliothèque"
        description="Documents administratifs et ressources pédagogiques de l’établissement."
      />

      <Card>
        <EmptyState
          title="Module en préparation"
          message="La bibliothèque de documents sera activée avec le stockage de fichiers. Les documents des élèves restent consultables depuis leur fiche."
          icon={<Library size={24} />}
          action={
            <LinkButton href={href('/students')} variant="outline">
              <FileText size={16} /> Voir les dossiers élèves
            </LinkButton>
          }
        />
      </Card>
    </PageContainer>
  );
}
