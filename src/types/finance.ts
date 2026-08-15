import type { BadgeTone } from './common';

/* -------------------------------------------------------------------------- */
/* Grille tarifaire — configuration, réglée dans Paramètres                    */
/* -------------------------------------------------------------------------- */

export interface FeeItem {
  id: string;
  label: string;
  /** Montant en francs CFA, entier. */
  amount: number;
  /** Un frais facultatif n'entre pas dans la facture par défaut. */
  mandatory: boolean;
}

export interface FeeInstallment {
  id: string;
  label: string;
  /** Part du total, en pourcentage entier. */
  percent: number;
  dueDate: string;
}

export interface FeeSchedule {
  id: string;
  label: string;
  /** Niveaux auxquels la grille s'applique. */
  levelIds: string[];
  academicYear: string;
  items: FeeItem[];
  installments: FeeInstallment[];
}

/* -------------------------------------------------------------------------- */
/* Factures                                                                    */
/* -------------------------------------------------------------------------- */

export type InvoiceStatus =
  | 'brouillon'
  | 'emise'
  | 'partielle'
  | 'payee'
  | 'en_retard'
  | 'annulee';

export const INVOICE_STATUS_TONES: Record<InvoiceStatus, BadgeTone> = {
  brouillon: 'slate',
  emise: 'blue',
  partielle: 'yellow',
  payee: 'green',
  en_retard: 'red',
  annulee: 'slate',
};

export interface InvoiceLine {
  id: string;
  label: string;
  amount: number;
}

export interface Invoice {
  id: string;
  /** Numéro communiqué à la famille (ex. « FAC-2026-0042 »). */
  number: string;
  studentId: string;
  academicYear: string;
  /** Échéance rattachée, quand la facture correspond à une tranche. */
  installmentLabel: string;
  issuedAt: string;
  dueDate: string;
  lines: InvoiceLine[];
  status: InvoiceStatus;
  note: string;
}

/* -------------------------------------------------------------------------- */
/* Paiements                                                                   */
/* -------------------------------------------------------------------------- */

export type PaymentMethod =
  | 'especes'
  | 'mobile_money'
  | 'virement'
  | 'cheque';

export type PaymentStatus =
  | 'en_attente'
  | 'confirme'
  | 'echoue'
  | 'rembourse';

export const PAYMENT_STATUS_TONES: Record<PaymentStatus, BadgeTone> = {
  en_attente: 'yellow',
  confirme: 'green',
  echoue: 'red',
  rembourse: 'orange',
};

/**
 * Un encaissement.
 *
 * Règle non négociable (`GEMINI.md` l. 407) : **un paiement passé par un
 * prestataire externe n'est jamais confirmé depuis le frontend**. Il reste
 * `en_attente` jusqu'à ce qu'un webhook signé ou une vérification
 * serveur-à-serveur le confirme. Seuls les encaissements constatés au guichet
 * (espèces, chèque, virement pointé) peuvent être marqués confirmés par un
 * agent.
 */
export interface Payment {
  id: string;
  reference: string;
  invoiceId: string;
  studentId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  receivedAt: string;
  recordedBy: string;
  /** Référence de la transaction chez le prestataire, quand elle existe. */
  providerReference: string;
  note: string;
}

/** Les encaissements par prestataire ne peuvent pas être confirmés côté client. */
export function requiresProviderConfirmation(method: PaymentMethod): boolean {
  return method === 'mobile_money';
}
