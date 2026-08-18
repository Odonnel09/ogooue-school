import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { toAuditEntry } from '@/lib/supabase/mappers';
import type { AuditEntry } from '@/types';

/**
 * Lecture du journal d'audit.
 *
 * La politique « journal lisible avec audit.read » filtre déjà : un rôle sans
 * cette permission obtient une liste vide, pas une erreur. C'est voulu — un
 * refus explicite renseignerait sur l'existence de traces.
 *
 * La limite est haute mais réelle : un journal se consulte, il ne se déverse
 * pas. La pagination viendra quand le volume l'exigera.
 */
export async function getAuditLog(limit = 500): Promise<AuditEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[audit] lecture', error.message);
    return [];
  }

  return (data ?? []).map(toAuditEntry);
}
