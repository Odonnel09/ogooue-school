'use client';

import { useCallback } from 'react';
import { AUDIT_ACTION_META } from '@/types';
import type { AuditDraft, AuditEntry } from '@/types';
import { useSession } from '@/lib/auth/session';
import { useSchoolData } from '@/lib/store/school-data';
import { createId } from '@/lib/utils';

/**
 * Enregistrement d'une opération sensible au journal d'audit.
 *
 * ⚠️ À cette étape, la trace est produite **par le client**, ce qui n'offre
 * aucune garantie : un utilisateur malveillant pourrait s'en abstenir. Elle
 * documente l'usage normal, pas la fraude.
 *
 * REMPLACEMENT SUPABASE : l'écriture migrera dans le wrapper `defineAction()`,
 * côté serveur, où elle deviendra inévitable — la Server Action journalisera
 * avant de rendre la main, dans la même transaction que la mutation.
 */
export function useAudit(): (draft: AuditDraft) => void {
  const { actions } = useSchoolData();
  const { email, roleName } = useSession();

  return useCallback(
    (draft: AuditDraft) => {
      const meta = AUDIT_ACTION_META[draft.action];

      const entry: AuditEntry = {
        id: createId('aud'),
        at: new Date().toISOString(),
        actorName: email,
        actorRole: roleName,
        action: draft.action,
        domain: meta.domain,
        severity: meta.severity,
        resourceType: draft.resourceType,
        resourceId: draft.resourceId,
        resourceLabel: draft.resourceLabel,
        detail: draft.detail,
      };

      actions.recordAudit(entry);
    },
    [actions, email, roleName],
  );
}
