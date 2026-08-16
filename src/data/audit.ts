import type { AuditAction, AuditEntry } from '@/types';
import { AUDIT_ACTION_META } from '@/types';

/**
 * Historique d'audit de démonstration.
 *
 * Il donne au journal une profondeur crédible dès le premier affichage ; les
 * opérations réalisées depuis l'interface viennent s'y ajouter en tête.
 *
 * REMPLACEMENT SUPABASE : table `audit_logs`.
 */
type AuditSeed = readonly [
  at: string,
  actorName: string,
  actorRole: string,
  action: AuditAction,
  resourceType: string,
  resourceId: string,
  resourceLabel: string,
  detail: string,
];

const SEEDS: AuditSeed[] = [
  [
    '2026-11-14T16:42:00', 'Serge Ndong', 'Administrateur',
    'grades.publish', 'Évaluation', 'eva-001', 'Devoir n°1 — Suites numériques',
    'Résultats publiés pour la Terminale C : 6 notes visibles par les familles.',
  ],
  [
    '2026-11-14T15:20:00', 'Sylvie Moussavou', 'Enseignant',
    'grades.validate', 'Évaluation', 'eva-002', 'Contrôle — Mécanique du point',
    'Notes validées : la saisie est désormais verrouillée.',
  ],
  [
    '2026-11-13T11:05:00', 'Serge Ndong', 'Administrateur',
    'finance.payment.record', 'Facture', 'inv-0004', 'FAC-2026-0004',
    'Règlement de 210 000 FCFA encaissé en espèces au guichet.',
  ],
  [
    '2026-11-12T09:38:00', 'Service comptabilité', 'Secrétaire',
    'finance.invoice.cancel', 'Facture', 'inv-0021', 'FAC-2026-0021',
    'Facture annulée : élève transféré vers un autre établissement.',
  ],
  [
    '2026-11-10T14:15:00', 'Serge Ndong', 'Administrateur',
    'settings.grading.update', 'Configuration', 'grading-lycee', 'Notation — Lycée',
    'Seuil de réussite porté de 9,5 à 10 sur 20.',
  ],
  [
    '2026-11-08T10:02:00', 'Serge Ndong', 'Administrateur',
    'settings.fees.update', 'Configuration', 'fee-lycee', 'Grille tarifaire — Lycée',
    'Frais de laboratoire ajoutés : 35 000 FCFA.',
  ],
  [
    '2026-11-06T17:30:00', 'Michel Bekale', 'Censeur',
    'enrollments.validate', 'Dossier', 'enr-003', 'PRE-2026-0003',
    'Dossier accepté en 3ème A sous réserve du paiement de la première tranche.',
  ],
  [
    '2026-11-06T17:12:00', 'Michel Bekale', 'Censeur',
    'enrollments.reject', 'Dossier', 'enr-006', 'PRE-2026-0006',
    'Dossier refusé : effectif maximal atteint sur le niveau demandé.',
  ],
  [
    '2026-11-05T08:45:00', 'Clarisse Nzue', 'Enseignant',
    'attendance.save', 'Feuille de présence', 'att-003', 'Première S — 12 oct. 2026',
    'Appel enregistré : 14 présents, 1 absent, 0 retard.',
  ],
  [
    '2026-11-04T13:20:00', 'Serge Ndong', 'Administrateur',
    'students.archive', 'Élève', 'std-020', 'Kevin Boussougou',
    'Fiche archivée à la demande de la famille — déménagement hors province.',
  ],
  [
    '2026-11-03T09:00:00', 'Serge Ndong', 'Administrateur',
    'settings.levels.toggle', 'Configuration', 'cycle-superieur', 'Cycle Supérieur',
    'Cycle désactivé : l’établissement ne reconduit pas les parcours LMD cette année.',
  ],
  [
    '2026-10-30T16:55:00', 'Serge Ndong', 'Administrateur',
    'reports.publish', 'Bulletin', 'rep-cls-tc-t1-std-001', 'Jean Ndong — 1er trimestre',
    'Bulletin figé et publié : notes, moyennes et rang recopiés dans le document.',
  ],
  [
    '2026-10-28T11:40:00', 'Sylvie Moussavou', 'Enseignant',
    'grades.correct', 'Évaluation', 'eva-002', 'Contrôle — Mécanique du point',
    'Correction après verrouillage — motif : erreur de report de la copie n°14.',
  ],
  [
    '2026-10-25T15:10:00', 'Serge Ndong', 'Administrateur',
    'guardians.unlink', 'Tuteur', 'grd-004', 'Célestin Ovono',
    'Rattachement retiré : le tuteur légal a changé par décision de justice.',
  ],
];

export const AUDIT_ENTRIES: AuditEntry[] = SEEDS.map(
  (
    [at, actorName, actorRole, action, resourceType, resourceId, resourceLabel, detail],
    index,
  ): AuditEntry => ({
    id: `aud-${`${index + 1}`.padStart(4, '0')}`,
    at,
    actorName,
    actorRole,
    action,
    domain: AUDIT_ACTION_META[action].domain,
    severity: AUDIT_ACTION_META[action].severity,
    resourceType,
    resourceId,
    resourceLabel,
    detail,
  }),
);
