import { getAuditLog } from '@/features/audit/queries.server';
import { AuditView } from '@/features/audit/components/AuditView';

/**
 * Journal d'audit — composant serveur.
 *
 * Aucune permission n'est vérifiée ici : la politique RLS s'en charge, et un
 * utilisateur sans `audit.read` reçoit simplement zéro ligne. Doubler le
 * contrôle donnerait l'illusion que c'est cette page qui protège.
 */
export default async function AuditPage() {
  const auditLog = await getAuditLog();
  return <AuditView auditLog={auditLog} />;
}
