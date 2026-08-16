'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { Ban, Info, Plus, Printer, Receipt } from 'lucide-react';
import { requiresProviderConfirmation } from '@/types';
import type { Payment, PaymentMethod } from '@/types';
import { CURRENT_USER, REFERENCE_DATE } from '@/data/academic';
import { paymentMethodLabels, ui } from '@/i18n/fr';
import { Can } from '@/lib/auth/session';
import { useHref } from '@/lib/hooks';
import { useSchoolData } from '@/lib/store/school-data';
import { useAudit } from '@/lib/audit/use-audit';
import { classLabel, studentName } from '@/lib/selectors';
import { invoiceStatusMeta, labelOptions, paymentStatusMeta } from '@/lib/status';
import { formatMoney } from '@/lib/money';
import { createId, formatDate } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  LinkButton,
  Modal,
  Select,
  StatusBadge,
  Textarea,
  useToast,
  DatePicker,
} from '@/components/ui';
import {
  balanceOf,
  invoiceTotal,
  paidAmount,
  paymentsOfInvoice,
  pendingAmount,
  resolveInvoiceStatus,
} from '@/features/finance/queries';
import { financeMessages as m } from '@/features/finance/messages';

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const href = useHref();
  const toast = useToast();
  const { invoices, payments, students, classes, actions } = useSchoolData();
  const audit = useAudit();

  const [formOpen, setFormOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('especes');
  const [receivedAt, setReceivedAt] = useState(REFERENCE_DATE);
  const [providerReference, setProviderReference] = useState('');
  const [note, setNote] = useState('');

  const invoice = invoices.find((item) => item.id === id);

  if (!invoice) {
    return (
      <Card>
        <EmptyState
          title={m.invoice.notFoundTitle}
          message={m.invoice.notFoundMessage}
          icon={<Receipt size={24} aria-hidden="true" />}
          action={
            <LinkButton href={href('/finance/invoices')} variant="outline">
              {m.invoice.backToList}
            </LinkButton>
          }
        />
      </Card>
    );
  }

  const student = students.find((item) => item.id === invoice.studentId);
  const total = invoiceTotal(invoice);
  const paid = paidAmount(payments, invoice.id);
  const pending = pendingAmount(payments, invoice.id);
  const balance = balanceOf(invoice, payments);
  const status = resolveInvoiceStatus(invoice, payments, REFERENCE_DATE);
  const linked = paymentsOfInvoice(payments, invoice.id);
  const byProvider = requiresProviderConfirmation(method);

  function recordPayment() {
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Le montant doit être un nombre supérieur à zéro.');
      return;
    }
    if (value > balance) {
      toast.error(
        `Le montant dépasse le solde restant (${formatMoney(balance)}).`,
      );
      return;
    }

    const payment: Payment = {
      id: createId('pay'),
      reference: `REG-${new Date().getFullYear()}-${`${payments.length + 1}`.padStart(4, '0')}`,
      invoiceId: invoice!.id,
      studentId: invoice!.studentId,
      // Montant entier : le franc CFA n'a pas de subdivision d'usage.
      amount: Math.round(value),
      method,
      /**
       * Règle non négociable : un règlement passé par un prestataire externe
       * n'est jamais confirmé depuis cet écran. Seul un webhook signé pourra
       * le faire.
       */
      status: byProvider ? 'en_attente' : 'confirme',
      receivedAt,
      recordedBy: CURRENT_USER.fullName,
      providerReference: byProvider ? providerReference.trim() : '',
      note: note.trim(),
    };

    actions.payments.create(payment);
    audit({
      action: 'finance.payment.record',
      resourceType: 'Règlement',
      resourceId: payment.id,
      resourceLabel: `${payment.reference} — ${invoice!.number}`,
      detail: `${formatMoney(payment.amount)} par ${paymentMethodLabels[method]}, statut ${
        byProvider ? 'en attente de confirmation du prestataire' : 'confirmé'
      }.`,
    });
    setFormOpen(false);
    setAmount('');
    setProviderReference('');
    setNote('');
    toast.success(
      byProvider ? m.invoice.toasts.recordedPending : m.invoice.toasts.recorded,
    );
  }

  function cancelInvoice() {
    actions.invoices.update(invoice!.id, { status: 'annulee' });
    audit({
      action: 'finance.invoice.cancel',
      resourceType: 'Facture',
      resourceId: invoice!.id,
      resourceLabel: `${invoice!.number} — ${student ? studentName(student) : 'élève inconnu'}`,
      detail: `Facture annulée alors qu'il restait ${formatMoney(balance)} à régler.`,
    });
    setConfirmCancel(false);
    toast.success(m.invoice.toasts.cancelled);
  }

  return (
    <>
      <Card className="p-4 sm:p-6 print-area">
        <nav aria-label={ui.breadcrumb} className="mb-4 print-hidden">
          <Link
            href={href('/finance/invoices')}
            className="text-xs text-slate-500 hover:text-brand-600 transition-colors rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            {m.invoice.back}
          </Link>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
                {invoice.number}
              </h1>
              <StatusBadge meta={invoiceStatusMeta(status)} />
            </div>
            {student && (
              <p className="text-sm text-slate-500 mt-1">
                {studentName(student)} · {classLabel(classes, student.classId)}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge tone="brand">{invoice.installmentLabel}</Badge>
              <Badge tone="slate">
                Échéance {formatDate(invoice.dueDate)}
              </Badge>
              <Badge tone="slate">{invoice.academicYear}</Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 print-hidden">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer size={16} aria-hidden="true" /> {m.invoice.print}
            </Button>
            <Can permission="payments.create">
              <Button
                onClick={() => setFormOpen(true)}
                disabled={balance === 0 || invoice.status === 'annulee'}
              >
                <Plus size={16} aria-hidden="true" /> {m.invoice.recordPayment}
              </Button>
            </Can>
            <Can permission="payments.refund">
              <Button
                variant="dangerSoft"
                onClick={() => setConfirmCancel(true)}
                disabled={invoice.status === 'annulee'}
              >
                <Ban size={16} aria-hidden="true" /> Annuler
              </Button>
            </Can>
          </div>
        </div>

        {/* Détail des lignes */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h2 className="text-base font-bold text-slate-900 mb-3">
            {m.invoice.linesTitle}
          </h2>
          <ul className="divide-y divide-slate-100">
            {invoice.lines.map((line) => (
              <li
                key={line.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <span className="text-sm text-slate-700">{line.label}</span>
                <span className="text-sm text-slate-900 whitespace-nowrap">
                  {formatMoney(line.amount)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-sm text-slate-500">{m.invoice.total}</dt>
              <dd className="text-sm font-bold text-slate-900">
                {formatMoney(total)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-sm text-slate-500">{m.invoice.paid}</dt>
              <dd className="text-sm font-medium text-green-600">
                {formatMoney(paid)}
              </dd>
            </div>
            {pending > 0 && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-sm text-slate-500">{m.invoice.pending}</dt>
                <dd className="text-sm font-medium text-yellow-600">
                  {formatMoney(pending)}
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <dt className="text-sm font-medium text-slate-900">
                {m.invoice.balance}
              </dt>
              <dd className="text-lg font-bold text-slate-900">
                {formatMoney(balance)}
              </dd>
            </div>
          </dl>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
          {m.invoice.paymentsTitle}
        </h2>

        {linked.length === 0 ? (
          <EmptyState
            title={m.invoice.noPayment}
            message={m.invoice.noPaymentMessage}
            icon={<Receipt size={24} aria-hidden="true" />}
          />
        ) : (
          <ul className="space-y-2">
            {linked.map((payment) => (
              <li
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-100"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 font-mono">
                    {payment.reference}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {paymentMethodLabels[payment.method]} ·{' '}
                    {formatDate(payment.receivedAt)} · saisi par{' '}
                    {payment.recordedBy}
                    {payment.providerReference && (
                      <span className="font-mono">
                        {' '}
                        · {payment.providerReference}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge meta={paymentStatusMeta(payment.status)} />
                  <span className="text-sm font-bold text-slate-900">
                    {formatMoney(payment.amount)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Enregistrement d'un règlement */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={m.invoice.recordPayment}
        description={`Solde restant : ${formatMoney(balance)}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              {ui.cancel}
            </Button>
            <Button onClick={recordPayment}>{ui.save}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label={m.invoice.fields.amount}
            htmlFor="payment-amount"
            required
            hint={m.invoice.fields.amountHint}
          >
            <Input
              id="payment-amount"
              type="number"
              min={1}
              step={1}
              max={balance}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </Field>

          <Field label={m.invoice.fields.method} htmlFor="payment-method">
            <Select
              id="payment-method"
              value={method}
              options={labelOptions(paymentMethodLabels)}
              onChange={(event) =>
                setMethod(event.target.value as PaymentMethod)
              }
            />
          </Field>

          <Field label={m.invoice.fields.receivedAt} htmlFor="payment-date">
            <DatePicker
              id="payment-date"
              value={receivedAt}
              onChange={(event) => setReceivedAt(event.target.value)}
            />
          </Field>

          {byProvider && (
            <Field
              label={m.invoice.fields.providerReference}
              htmlFor="payment-provider"
              hint={m.invoice.fields.providerReferenceHint}
            >
              <Input
                id="payment-provider"
                value={providerReference}
                onChange={(event) => setProviderReference(event.target.value)}
              />
            </Field>
          )}

          <Field
            label={m.invoice.fields.note}
            htmlFor="payment-note"
            className="sm:col-span-2"
          >
            <Textarea
              id="payment-note"
              rows={2}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>

          <div
            className={
              byProvider
                ? 'sm:col-span-2 bg-yellow-50 border border-yellow-100 rounded-xl p-3 flex items-start gap-2.5'
                : 'sm:col-span-2 bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-2.5'
            }
          >
            <Info
              size={16}
              className={
                byProvider
                  ? 'text-yellow-600 mt-0.5 shrink-0'
                  : 'text-slate-400 mt-0.5 shrink-0'
              }
              aria-hidden="true"
            />
            <p
              className={
                byProvider
                  ? 'text-xs text-yellow-800 leading-relaxed'
                  : 'text-xs text-slate-600 leading-relaxed'
              }
            >
              {byProvider ? m.invoice.providerNotice : m.invoice.deskNotice}
            </p>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmCancel}
        title={m.invoice.cancelTitle}
        message={m.invoice.cancelMessage(invoice.number)}
        confirmLabel="Annuler la facture"
        cancelLabel="Revenir"
        onCancel={() => setConfirmCancel(false)}
        onConfirm={cancelInvoice}
      />
    </>
  );
}
