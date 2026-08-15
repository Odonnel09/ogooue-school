'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

/** Slug de l'établissement courant, lu depuis le segment `[tenant]`. */
export function useTenant(): string {
  const params = useParams<{ tenant: string }>();
  return params?.tenant ?? '';
}

/**
 * Construit une URL préfixée par le slug de l'établissement.
 * `href('/students')` → `/mon-ecole/students`.
 */
export function useHref(): (path: string) => string {
  const tenant = useTenant();
  return useCallback((path: string) => `/${tenant}${path}`, [tenant]);
}

/**
 * Simule le temps de chargement d'une requête réseau.
 * Renvoie `false` pendant `duration` ms après le montage, puis `true`.
 * REMPLACEMENT SUPABASE : sera remplacé par l'état `isLoading` de React Query.
 */
export function useSimulatedLoading(duration = 450): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return ready;
}
