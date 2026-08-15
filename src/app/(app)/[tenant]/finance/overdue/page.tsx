'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Download, Users, Wallet } from 'lucide-react';
import { REFERENCE_DATE } from '@/data/academic';
import { ui } from '@/i18n/fr';
import { Can } from '@/lib/auth/session';
import { useHref, useSimulatedLoading } from '@/lib/hooks';
import { useSession } from '@/lib/auth/session';
import { useSchoolData } from '@/lib/store/school-data';
import { classLabel, primaryGuardian, studentName } from '@/lib/selectors';
import { formatMoney } from '@/lib/money';
import { downloadCsv } from '@/lib/export';
import { formatDate } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  StatCard,
  TD,
  TH,
  THead,
  TRow,
  Table,
  TableSkeleton,
  TableWrapper,
  useToast,
} from '@/components/ui';
import { balanceOf, resolveInvoiceStatus } from '@/features/finance/queries';
import { financeMessages as m } from '@/features/finance/messages';

/** Nombre de jours entre l'échéance et la date de référence. */
function daysLate(dueDate: string): number {
  const due = new Date(`${dueDate}T00:00:00`).getTime();
  const now = new Date(`${REFERENCE_DATE}T00:00:00`).getTime();
  return Math.max(0, Math.round((now - due) / 86_400_000));
}

export default function OverduePage() {
  const href = useHref();
  const toast = useToast();
  const ready = useSimulatedLoading();
  const { invoices, payments, students, classes, guardians, guardianLinks } =
    useSchoolData();
  const { academicYear } = useSession();

  const rows = useMemo(
    () =>
      invoices
        .filter(
          (invoice) =>
            invoice.academicYear === academicYear.id &&
            resolveInvoiceStatus(invoice, payments, REFERENCE_DATE) ===
              'en_retard',
        )
        .map((invoice) => {
          const student = students.find(
            (item) => item.id === invoice.studentId,
          );
          return {
            invoice,
            student,
            guardian: student
              ? primaryGuardian(guardians, guardianLinks, student.id)
              : undefined,
            balance: balanceOf(invoice, payments),
            late: daysLate(invoice.dueDate),
          };
        })
        .filter((row) => row.student !== undefined)
        .sort((a, b) => b.late - a.late),
    [invoices, payments, students, guardians, guardianLinks, academicYear.id],
  );

  const stats = useMemo(
    () => ({
      count: rows.length,
      amount: rows.reduce((total, row) => total + row.balance, 0),
      families: new Set(rows.map((row) => row.guardian?.id).filter(Boolean))
        .size,
    }),
    [rows],
  );

  function exportCsv() {
    downloadCsv(
      'impayes-ogooue-school.csv',
      [
        m.overdue.columns.number,
        m.overdue.columns.student,
        'Classe',
        m.overdue.columns.guardian,
        m.overdue.columns.phone,
        m.overdue.columns.balance,
        m.overdue.columns.dueDate,
        m.overdue.columns.lateBy,
      ],
      rows.map((row) => [
        row.invoice.number,
        studentName(row.student!),
        classLabel(classes, row.student!.classId),
        row.guardian
          ? `${row.guardian.firstName} ${row.guardian.lastName}`
          : '',
        row.guardian?.phone ?? '',
        String(row.balance),
        row.invoice.dueDate,
        String(row.late),
      ]),
    );
    toast.success(m.overdue.exported(rows.length));
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          label={m.overdue.stats.count}
          value={stats.count}
          icon={<AlertTriangle size={22} aria-hidden="true" />}
          tone="red"
        />
        <StatCard
          label={m.overdue.stats.amount}
          value={formatMoney(stats.amount)}
          icon={<Wallet size={22} aria-hidden="true" />}
          tone="orange"
        />
        <StatCard
          label={m.overdue.stats.families}
          value={stats.families}
          icon={<Users size={22} aria-hidden="true" />}
          tone="brand"
        />
      </div>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {m.overdue.tableTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-1">{m.overdue.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="brand">{ui.results(rows.length)}</Badge>
            <Can permission="payments.read">
              <Button
                variant="outline"
                size="sm"
                onClick={exportCsv}
                disabled={rows.length === 0}
              >
                <Download size={15} aria-hidden="true" /> {m.overdue.export}
              </Button>
            </Can>
          </div>
        </div>

        {!ready ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            title={m.overdue.emptyTitle}
            message={m.overdue.emptyMessage}
            icon={<CheckCircle2 size={24} aria-hidden="true" />}
          />
        ) : (
          <>
            <TableWrapper className="hidden lg:block">
              <Table>
                <THead>
                  <tr>
                    <TH scope="col">{m.overdue.columns.number}</TH>
                    <TH scope="col">{m.overdue.columns.student}</TH>
                    <TH scope="col">{m.overdue.columns.guardian}</TH>
                    <TH scope="col">{m.overdue.columns.phone}</TH>
                    <TH scope="col" className="text-right">
                      {m.overdue.columns.balance}
                    </TH>
                    <TH scope="col">{m.overdue.columns.dueDate}</TH>
                    <TH scope="col">{m.overdue.columns.lateBy}</TH>
                  </tr>
                </THead>
                <tbody>
                  {rows.map((row) => (
                    <TRow key={row.invoice.id}>
                      <TD>
                        <Link
                          href={href(`/finance/invoices/${row.invoice.id}`)}
                          className="font-mono text-xs text-brand-600 hover:underline rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                        >
                          {row.invoice.number}
                        </Link>
                      </TD>
                      <TD>
                        <Link
                          href={href(`/students/${row.student!.id}`)}
                          className="font-medium text-slate-900 hover:text-brand-600 transition-colors rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                        >
                          {studentName(row.student!)}
                        </Link>
                        <span className="block text-xs text-slate-400">
                          {classLabel(classes, row.student!.classId)}
                        </span>
                      </TD>
                      <TD>
                        {row.guardian ? (
                          <Link
                            href={href(`/guardians/${row.guardian.id}`)}
                            className="text-slate-900 hover:text-brand-600 transition-colors rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                          >
                            {row.guardian.firstName} {row.guardian.lastName}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </TD>
                      <TD className="whitespace-nowrap">
                        {row.guardian?.phone ?? '—'}
                      </TD>
                      <TD className="text-right whitespace-nowrap font-medium text-slate-900">
                        {formatMoney(row.balance)}
                      </TD>
                      <TD className="whitespace-nowrap">
                        {formatDate(row.invoice.dueDate)}
                      </TD>
                      <TD>
                        <Badge tone={row.late > 45 ? 'red' : 'orange'}>
                          {m.overdue.lateBy(row.late)}
                        </Badge>
                      </TD>
                    </TRow>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>

            <ul className="lg:hidden space-y-3">
              {rows.map((row) => (
                <li
                  key={row.invoice.id}
                  className="border border-slate-100 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={href(`/students/${row.student!.id}`)}
                        className="font-medium text-slate-900 hover:text-brand-600 transition-colors block truncate"
                      >
                        {studentName(row.student!)}
                      </Link>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {row.invoice.number}
                      </p>
                    </div>
                    <Badge tone={row.late > 45 ? 'red' : 'orange'}>
                      {m.overdue.lateBy(row.late)}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 mt-3">
                    {row.guardian
                      ? `${row.guardian.firstName} ${row.guardian.lastName} · ${row.guardian.phone}`
                      : 'Aucun tuteur rattaché'}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-3">
                    <span className="text-xs text-slate-400">
                      Échéance {formatDate(row.invoice.dueDate)}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {formatMoney(row.balance)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </>
  );
}
