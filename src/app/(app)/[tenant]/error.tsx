'use client';

import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button, Card, ErrorState, PageContainer } from '@/components/ui';

/**
 * État d'erreur commun à toutes les pages de l'espace d'administration.
 * Next.js monte ce composant si le rendu d'une page échoue.
 */
export default function TenantError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // REMPLACEMENT SUPABASE : brancher ici la remontée d'erreurs (Sentry, logs).
    console.error(error);
  }, [error]);

  return (
    <PageContainer>
      <Card>
        <ErrorState
          title="Une erreur est survenue"
          message="La page n’a pas pu être affichée. Réessayez ; si le problème persiste, contactez l’administrateur de la plateforme."
          action={
            <Button onClick={reset}>
              <RotateCcw size={16} /> Réessayer
            </Button>
          }
        />
      </Card>
    </PageContainer>
  );
}
