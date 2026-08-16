import type { BadgeTone } from './common';

/**
 * JOURNAL D'AUDIT.
 *
 * `GEMINI.md` (l. 410) exige de journaliser les opérations sensibles. Une
 * entrée d'audit est **immuable** : on n'en modifie ni n'en supprime jamais.
 * Elle répond à quatre questions — qui, quoi, sur quelle ressource, quand.
 *
 * REMPLACEMENT SUPABASE : table `audit_logs`, alimentée par le wrapper
 * `defineAction()` côté serveur. L'enregistrement ne dépendra plus du client,
 * qui ne peut pas être considéré comme une source fiable.
 */
export type AuditDomain =
  | 'settings'
  | 'students'
  | 'guardians'
  | 'enrollments'
  | 'classes'
  | 'subjects'
  | 'teachers'
  | 'attendance'
  | 'grades'
  | 'reports'
  | 'finance'
  | 'announcements';

export type AuditAction =
  // Configuration de l'établissement
  | 'settings.profile.update'
  | 'settings.levels.toggle'
  | 'settings.grading.update'
  | 'settings.periods.update'
  | 'settings.enrollment.update'
  | 'settings.fees.update'
  | 'settings.template.update'
  | 'settings.signature.update'
  | 'settings.messaging.update'
  // Personnes
  | 'students.create'
  | 'students.update'
  | 'students.archive'
  | 'students.import'
  | 'students.export'
  | 'guardians.create'
  | 'guardians.update'
  | 'guardians.archive'
  | 'guardians.unlink'
  // Inscriptions
  | 'enrollments.submit'
  | 'enrollments.validate'
  | 'enrollments.reject'
  | 'enrollments.enroll'
  // Vie scolaire
  | 'attendance.save'
  | 'classes.archive'
  | 'subjects.archive'
  | 'teachers.archive'
  // Notes
  | 'grades.validate'
  | 'grades.publish'
  | 'grades.reopen'
  | 'grades.correct'
  // Documents
  | 'reports.generate'
  | 'reports.publish'
  | 'reports.sign'
  // Finances
  | 'finance.payment.record'
  | 'finance.invoice.cancel';

/**
 * Gravité de l'opération.
 * `sensitive` désigne ce qui touche à l'argent, aux notes verrouillées ou à la
 * configuration : ce sont les lignes qu'un inspecteur viendra lire.
 */
export type AuditSeverity = 'info' | 'sensitive';

export const AUDIT_SEVERITY_TONES: Record<AuditSeverity, BadgeTone> = {
  info: 'slate',
  sensitive: 'orange',
};

export interface AuditEntry {
  id: string;
  /** Horodatage ISO complet — l'heure compte autant que le jour. */
  at: string;
  actorName: string;
  actorRole: string;
  action: AuditAction;
  domain: AuditDomain;
  severity: AuditSeverity;
  /** Type de ressource concernée, en clair (« Élève », « Facture »...). */
  resourceType: string;
  resourceId: string;
  /** Libellé lisible de la ressource, figé au moment de l'événement. */
  resourceLabel: string;
  /** Ce qui a changé, en une phrase. */
  detail: string;
}

/** Domaine et gravité déduits de l'action — une seule source de vérité. */
export const AUDIT_ACTION_META: Record<
  AuditAction,
  { domain: AuditDomain; severity: AuditSeverity }
> = {
  'settings.profile.update': { domain: 'settings', severity: 'sensitive' },
  'settings.levels.toggle': { domain: 'settings', severity: 'sensitive' },
  'settings.grading.update': { domain: 'settings', severity: 'sensitive' },
  'settings.periods.update': { domain: 'settings', severity: 'info' },
  'settings.enrollment.update': { domain: 'settings', severity: 'info' },
  'settings.fees.update': { domain: 'settings', severity: 'sensitive' },
  'settings.template.update': { domain: 'settings', severity: 'info' },
  'settings.signature.update': { domain: 'settings', severity: 'sensitive' },
  'settings.messaging.update': { domain: 'settings', severity: 'sensitive' },

  'students.create': { domain: 'students', severity: 'info' },
  'students.update': { domain: 'students', severity: 'info' },
  'students.archive': { domain: 'students', severity: 'sensitive' },
  'students.import': { domain: 'students', severity: 'sensitive' },
  'students.export': { domain: 'students', severity: 'sensitive' },
  'guardians.create': { domain: 'guardians', severity: 'info' },
  'guardians.update': { domain: 'guardians', severity: 'info' },
  'guardians.archive': { domain: 'guardians', severity: 'sensitive' },
  'guardians.unlink': { domain: 'guardians', severity: 'sensitive' },

  'enrollments.submit': { domain: 'enrollments', severity: 'info' },
  'enrollments.validate': { domain: 'enrollments', severity: 'sensitive' },
  'enrollments.reject': { domain: 'enrollments', severity: 'sensitive' },
  'enrollments.enroll': { domain: 'enrollments', severity: 'sensitive' },

  'attendance.save': { domain: 'attendance', severity: 'info' },
  'classes.archive': { domain: 'classes', severity: 'sensitive' },
  'subjects.archive': { domain: 'subjects', severity: 'info' },
  'teachers.archive': { domain: 'teachers', severity: 'sensitive' },

  'grades.validate': { domain: 'grades', severity: 'sensitive' },
  'grades.publish': { domain: 'grades', severity: 'sensitive' },
  'grades.reopen': { domain: 'grades', severity: 'sensitive' },
  'grades.correct': { domain: 'grades', severity: 'sensitive' },

  'reports.generate': { domain: 'reports', severity: 'info' },
  'reports.publish': { domain: 'reports', severity: 'sensitive' },
  'reports.sign': { domain: 'reports', severity: 'sensitive' },

  'finance.payment.record': { domain: 'finance', severity: 'sensitive' },
  'finance.invoice.cancel': { domain: 'finance', severity: 'sensitive' },
};

/** Ce qu'un appelant fournit ; domaine et gravité sont déduits. */
export interface AuditDraft {
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  resourceLabel: string;
  detail: string;
}
