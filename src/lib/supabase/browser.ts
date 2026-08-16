import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

/**
 * Client Supabase du navigateur.
 *
 * Typé par le schéma généré : une colonne mal orthographiée ou une table
 * inexistante devient une erreur de compilation, pas une erreur au clic.
 *
 * La clé publiable n'est pas un secret — elle est faite pour être envoyée au
 * navigateur. Ce qui protège les données, ce sont les politiques RLS, et rien
 * d'autre. La clé de service, elle, ne doit jamais franchir cette frontière.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
