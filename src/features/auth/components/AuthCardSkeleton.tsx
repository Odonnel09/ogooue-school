import { Card, Skeleton } from '@/components/ui';

/**
 * Attente d'une page d'authentification.
 *
 * Nécessaire, pas décoratif : les écrans qui lisent un paramètre d'adresse
 * (`?token=`, `?etablissement=`) sont prérendus, et Next exige alors une
 * frontière Suspense — le paramètre n'existe qu'à la requête. Ce squelette
 * reprend la silhouette de la carte pour éviter un saut de mise en page.
 */
export function AuthCardSkeleton() {
  return (
    <Card className="p-6 sm:p-8">
      <Skeleton className="w-12 h-12 rounded-2xl mb-5" />
      <Skeleton className="h-6 w-2/3 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-4/5 mb-6" />
      <Skeleton className="h-11 w-full rounded-xl mb-3" />
      <Skeleton className="h-11 w-full rounded-xl" />
    </Card>
  );
}
