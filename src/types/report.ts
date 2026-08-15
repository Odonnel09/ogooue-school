import type { BadgeTone } from './common';
import type { DecisionKind } from '@/lib/grading/types';
import type { ReportTemplateKey } from '@/lib/school-levels/capabilities';
import type { AppliedSignature, DocumentTemplate } from './template';

export type ReportCardStatus = 'brouillon' | 'genere' | 'publie';

export const REPORT_STATUS_TONES: Record<ReportCardStatus, BadgeTone> = {
  brouillon: 'slate',
  genere: 'blue',
  publie: 'green',
};

/** Une ligne de matière du bulletin. */
export interface ReportSubjectLine {
  subjectId: string;
  subjectLabel: string;
  teacherName: string;
  coefficient: number;
  credits: number;
  /** Moyenne de l'élève, sur l'échelle normalisée /20. */
  average: number | null;
  classAverage: number | null;
  best: number | null;
  lowest: number | null;
  /** Unité validée (LMD) — `null` hors LMD. */
  validated: boolean | null;
  gradeCount: number;
  comment: string;
}

/**
 * INSTANTANÉ D'UN BULLETIN.
 *
 * À la publication, le bulletin est **figé** : identité, notes, moyennes, rang,
 * coefficients et configuration de notation sont recopiés ici. Rééditer en 2030
 * un bulletin publié en 2026 régénère exactement le même document, quelles que
 * soient les évolutions de la grille de notation entre-temps.
 *
 * REMPLACEMENT SUPABASE : colonne `report_cards.snapshot` (JSONB), accompagnée
 * du PDF archivé dans le Storage.
 */
export interface ReportSnapshot {
  student: {
    id: string;
    fullName: string;
    matricule: string;
    birthDate: string;
    className: string;
    levelLabel: string;
  };
  school: {
    name: string;
    city: string;
    director: string;
    logo: string;
  };
  academicYear: string;
  periodLabel: string;
  template: ReportTemplateKey;
  /**
   * Gabarit **recopié** au moment de la génération. Modifier le modèle dans
   * Paramètres ne change donc pas un bulletin déjà publié.
   */
  style: DocumentTemplate;
  /** Signature apposée, figée elle aussi. `null` si le document n'est pas signé. */
  signature: AppliedSignature | null;
  lines: ReportSubjectLine[];
  average: number | null;
  rank: number | null;
  headcount: number;
  totalCoefficient: number;
  earnedCredits: number;
  totalCredits: number;
  decision: {
    kind: DecisionKind;
    mention: string | null;
    average: number | null;
  };
  attendance: {
    present: number;
    absent: number;
    retard: number;
    rate: number;
  };
  councilComment: string;
  generatedAt: string;
  /** Trace de la configuration appliquée, pour la défendabilité du document. */
  configSummary: string;
}

export interface ReportCard {
  id: string;
  studentId: string;
  classId: string;
  academicYear: string;
  periodId: string;
  status: ReportCardStatus;
  /** `null` tant que le bulletin n'a pas été généré. */
  snapshot: ReportSnapshot | null;
  generatedAt: string;
  publishedAt: string;
  councilComment: string;
  /** Signature choisie pour ce bulletin, si elle diffère de celle par défaut. */
  signatureOverride: AppliedSignature | null;
}

/** Un bulletin publié ne se recalcule plus. */
export function isReportFrozen(report: ReportCard): boolean {
  return report.status === 'publie';
}
