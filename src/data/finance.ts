import type { Invoice, InvoiceStatus, Payment, PaymentMethod } from '@/types';
import { share, sumAmounts } from '@/lib/money';
import { STUDENTS } from './students';
import { CLASSES } from './classes';
import { DEFAULT_TENANT_CONFIG } from './tenant-config';

/**
 * Facturation de l'année 2026-2027.
 * REMPLACEMENT SUPABASE : tables `invoices`, `invoice_lines`, `payments`.
 *
 * Les factures sont générées depuis la grille tarifaire réglée en Paramètres :
 * changer un montant là-bas change ce qui sera facturé aux prochains élèves.
 */

/** Hash déterministe : mêmes données au rendu serveur et client. */
function seededRatio(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

const LEVEL_BY_CLASS = new Map(CLASSES.map((item) => [item.id, item.levelId]));
const SCHEDULES = DEFAULT_TENANT_CONFIG.feeSchedules;

const METHODS: PaymentMethod[] = [
  'especes',
  'mobile_money',
  'virement',
  'cheque',
];

const invoices: Invoice[] = [];
const payments: Payment[] = [];

/** Élèves facturables : inscrits et affectés à une classe. */
const billable = STUDENTS.filter(
  (student) =>
    student.classId &&
    (student.status === 'actif' || student.status === 'en_attente'),
);

billable.forEach((student, studentIndex) => {
  const levelId = LEVEL_BY_CLASS.get(student.classId) ?? '';
  const schedule = SCHEDULES.find((item) => item.levelIds.includes(levelId));
  if (!schedule) return;

  const annualTotal = sumAmounts(
    schedule.items.filter((item) => item.mandatory).map((item) => item.amount),
  );

  schedule.installments.forEach((installment, installmentIndex) => {
    const amount = share(annualTotal, installment.percent);
    const invoiceNumber = `FAC-2026-${`${invoices.length + 1}`.padStart(4, '0')}`;
    const seed = `${student.id}|${installment.id}`;
    const ratio = seededRatio(seed);

    /**
     * Répartition volontairement contrastée : la première tranche est
     * majoritairement réglée, la dernière très peu — de quoi éprouver la vue
     * des impayés.
     */
    const paidProbability = installmentIndex === 0 ? 0.85 : installmentIndex === 1 ? 0.55 : 0.2;
    const isPaid = ratio < paidProbability;
    const isPartial = !isPaid && ratio < paidProbability + 0.12;
    const isLate = !isPaid && !isPartial && installment.dueDate < '2026-11-30';

    let status: InvoiceStatus = 'emise';
    if (isPaid) status = 'payee';
    else if (isPartial) status = 'partielle';
    else if (isLate) status = 'en_retard';

    const invoiceId = `inv-${`${invoices.length + 1}`.padStart(4, '0')}`;

    invoices.push({
      id: invoiceId,
      number: invoiceNumber,
      studentId: student.id,
      academicYear: '2026-2027',
      installmentLabel: installment.label,
      issuedAt: '2026-09-14',
      dueDate: installment.dueDate,
      lines: schedule.items
        .filter((item) => item.mandatory)
        .map((item) => ({
          id: `${invoiceId}-${item.id}`,
          label: `${item.label} — ${installment.label}`,
          amount: share(item.amount, installment.percent),
        })),
      status,
      note: '',
    });

    if (!isPaid && !isPartial) return;

    const method = METHODS[(studentIndex + installmentIndex) % METHODS.length];
    const paidAmount = isPaid ? amount : share(amount, 50);

    payments.push({
      id: `pay-${`${payments.length + 1}`.padStart(4, '0')}`,
      reference: `REG-2026-${`${payments.length + 1}`.padStart(4, '0')}`,
      invoiceId,
      studentId: student.id,
      amount: paidAmount,
      method,
      // Un encaissement Mobile Money reste en attente tant qu'aucun webhook
      // signé ne l'a confirmé : le frontend ne décide jamais de son sort.
      status: method === 'mobile_money' && ratio > 0.5 ? 'en_attente' : 'confirme',
      receivedAt: installment.dueDate,
      recordedBy: 'Service comptabilité',
      providerReference:
        method === 'mobile_money'
          ? `MNR-${Math.round(ratio * 1_000_000)
              .toString()
              .padStart(6, '0')}`
          : '',
      note: '',
    });
  });
});

export const INVOICES: Invoice[] = invoices;
export const PAYMENTS: Payment[] = payments;
