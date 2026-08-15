import type { Invoice, InvoiceStatus, Payment } from '@/types';
import { collectionRate, sumAmounts } from '@/lib/money';

/**
 * Agrégats financiers.
 *
 * Seuls les paiements **confirmés** entrent dans les encaissements : un
 * règlement Mobile Money en attente de webhook ne réduit pas la dette de la
 * famille tant qu'il n'est pas confirmé côté serveur.
 */

export function invoiceTotal(invoice: Invoice): number {
  return sumAmounts(invoice.lines.map((line) => line.amount));
}

export function paymentsOfInvoice(
  payments: Payment[],
  invoiceId: string,
): Payment[] {
  return payments.filter((payment) => payment.invoiceId === invoiceId);
}

/** Montant réellement encaissé sur une facture. */
export function paidAmount(payments: Payment[], invoiceId: string): number {
  return sumAmounts(
    paymentsOfInvoice(payments, invoiceId)
      .filter((payment) => payment.status === 'confirme')
      .map((payment) => payment.amount),
  );
}

/** Montant en attente de confirmation par le prestataire. */
export function pendingAmount(payments: Payment[], invoiceId: string): number {
  return sumAmounts(
    paymentsOfInvoice(payments, invoiceId)
      .filter((payment) => payment.status === 'en_attente')
      .map((payment) => payment.amount),
  );
}

export function balanceOf(invoice: Invoice, payments: Payment[]): number {
  return Math.max(0, invoiceTotal(invoice) - paidAmount(payments, invoice.id));
}

/** Statut recalculé depuis les encaissements et l'échéance. */
export function resolveInvoiceStatus(
  invoice: Invoice,
  payments: Payment[],
  today: string,
): InvoiceStatus {
  if (invoice.status === 'annulee' || invoice.status === 'brouillon') {
    return invoice.status;
  }

  const total = invoiceTotal(invoice);
  const paid = paidAmount(payments, invoice.id);

  if (paid >= total) return 'payee';
  if (invoice.dueDate && invoice.dueDate < today) return 'en_retard';
  if (paid > 0) return 'partielle';
  return 'emise';
}

export interface TreasurySummary {
  expected: number;
  collected: number;
  pending: number;
  outstanding: number;
  rate: number;
  overdueCount: number;
  overdueAmount: number;
}

/** Vue de trésorerie sur un jeu de factures. */
export function treasurySummary(
  invoices: Invoice[],
  payments: Payment[],
  today: string,
): TreasurySummary {
  const active = invoices.filter((invoice) => invoice.status !== 'annulee');

  const expected = sumAmounts(active.map(invoiceTotal));
  const collected = sumAmounts(
    active.map((invoice) => paidAmount(payments, invoice.id)),
  );
  const pending = sumAmounts(
    active.map((invoice) => pendingAmount(payments, invoice.id)),
  );

  const overdue = active.filter(
    (invoice) => resolveInvoiceStatus(invoice, payments, today) === 'en_retard',
  );

  return {
    expected,
    collected,
    pending,
    outstanding: Math.max(0, expected - collected),
    rate: collectionRate(collected, expected),
    overdueCount: overdue.length,
    overdueAmount: sumAmounts(
      overdue.map((invoice) => balanceOf(invoice, payments)),
    ),
  };
}

/** Répartition des encaissements confirmés par moyen de paiement. */
export function collectedByMethod(
  payments: Payment[],
): Array<{ method: Payment['method']; amount: number; count: number }> {
  const map = new Map<Payment['method'], { amount: number; count: number }>();

  payments
    .filter((payment) => payment.status === 'confirme')
    .forEach((payment) => {
      const current = map.get(payment.method) ?? { amount: 0, count: 0 };
      map.set(payment.method, {
        amount: current.amount + payment.amount,
        count: current.count + 1,
      });
    });

  return Array.from(map.entries())
    .map(([method, value]) => ({ method, ...value }))
    .sort((a, b) => b.amount - a.amount);
}
