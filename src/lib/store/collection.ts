import type { Dispatch, SetStateAction } from 'react';

/** Contrat CRUD minimal exposé par le store pour chaque collection. */
export interface Crud<T extends { id: string }> {
  create: (item: T) => void;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
  replaceAll: (items: T[]) => void;
}

/**
 * Fabrique les opérations CRUD locales d'une collection.
 *
 * REMPLACEMENT SUPABASE : ces implémentations deviendront des appels
 * `supabase.from(...)` — la signature exposée aux composants ne changera pas.
 */
export function createCrud<T extends { id: string }>(
  setItems: Dispatch<SetStateAction<T[]>>,
): Crud<T> {
  return {
    create: (item) => setItems((previous) => [item, ...previous]),
    update: (id, patch) =>
      setItems((previous) =>
        previous.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      ),
    remove: (id) =>
      setItems((previous) => previous.filter((item) => item.id !== id)),
    replaceAll: (items) => setItems(items),
  };
}
