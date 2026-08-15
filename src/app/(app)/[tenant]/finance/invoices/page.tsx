'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, Receipt } from 'lucide-react';
import { REFERENCE_DATE } from '@/data/academic';
import { invoiceStatusLabels, ui } from '@/i18n/fr';
import { useSession } from '@/lib/auth/session';
import { useHref, useSimulatedLoading } from '@/lib/hooks';
import { useSchoolData } from '@/lib/store/school-data';
import { classLabel, studentName } from '@/lib/selectors';
import { classOptions } from '@/lib/options';
import { invoiceStatusMeta, labelOptions } from '@/lib/status';
import { formatMoney } from '@/lib/money';
import { formatDate, matches } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FilterBar,
  FilterSelect,
  StatusBadge,
  TD,
  TH,
  THead,
  TRow,
  Table,
  TableSkeleton,
  TableWrapper,
} from '@/components/ui';
import {
  balanceOf,
  invoiceTotal,
  paidAmount,
  resolveInvoiceStatus,
} from '@/features/finance/queries';
import { financeMessages as m } from '@/features/finance/messages';

export default function InvoicesPage() {
  const href = useHref();
  const ready = useSimulatedLoading();
  const { invoices, payments, students, classes } = useSchoolData();
  const { academicYear } = useSession();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const rows = useMemo(
    () =>
      invoices
        .filter((invoice) => invoice.academicYear === academicYear.id)
        .map((invoice) => {
          const student = students.find(
            (item) => item.id === invoice.studentId,
          );
          return {
            invoice,
            student,
            status: resolveInvoiceStatus(invoice, payments, REFERENCE_DATE),
            total: invoiceTotal(invoice),
            paid: paidAmount(payments, invoice.id),
            balance: balanceOf(invoice, payments),
          };
        })
        .filter((row) => {
          if (!row.student) return false;
          const haystack = `${row.invoice.number} ${studentName(row.student)} ${row.student.matricule}`;
          if (!matches(haystack, search)) return false;
          if (statusFilter && row.status !== statusFilter) return false;
          if (classFilter && row.student.classId !== classFilter) return false;
          return true;
        })
        .sort((a, b) => b.invoice.number.localeCompare(a.invoice.number)),
    [invoices, payments, students, academicYear.id, search, statusFilter, classFilter],
  );

  const activeFilters = (statusFilter ? 1 : 0) + (classFilter ? 1 : 0);

  return (
    <>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={m.invoices.searchPlaceholder}
        activeCount={activeFilters}
        onReset={() => {
          setStatusFilter('');
          setClassFilter('');
        }}
      >
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={labelOptions(invoiceStatusLabels)}
          placeholder={m.invoices.filters.allStatuses}
        />
        <FilterSelect
          value={classFilter}
          onChange={setClassFilter}
          options={classOptions(classes)}
          placeholder={m.invoices.filters.allClasses}
        />
      </FilterBar>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {m.invoices.tableTitle}
          </h2>
          <Badge tone="brand">{ui.results(rows.length)}</Badge>
        </div>

        {!ready ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            title={m.invoices.emptyTitle}
            message={
              activeFilters > 0 || search
                ? m.invoices.emptyFiltered
                : m.invoices.emptyInitial
            }
            icon={<Receipt size={24} aria-hidden="true" />}
            action={
              activeFilters > 0 || search ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('');
                    setClassFilter('');
                  }}
                >
                  {ui.resetFilters}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <TableWrapper className="hidden lg:block">
              <Table>
                <THead>
                  <tr>
                    <TH scope="col">{m.invoices.columns.number}</TH>
                    <TH scope="col">{m.invoices.columns.student}</TH>
                    <TH scope="col">{m.invoices.columns.classroom}</TH>
                    <TH scope="col">{m.invoices.columns.installment}</TH>
                    <TH scope="col" className="text-right">
                      {m.invoices.columns.total}
                    </TH>
                    <TH scope="col" className="text-right">
                      {m.invoices.columns.paid}
                    </TH>
                    <TH scope="col" className="text-right">
                      {m.invoices.columns.balance}
                    </TH>
                    <TH scope="col">{m.invoices.columns.dueDate}</TH>
                    <TH scope="col">{m.invoices.columns.status}</TH>
                    <TH scope="col" className="text-right">
                      {m.invoices.columns.actions}
                    </TH>
                  </tr>
                </THead>
                <tbody>
                  {rows.map((row) => (
                    <TRow key={row.invoice.id}>
                      <TD className="font-mono text-xs text-slate-900">
                        {row.invoice.number}
                      </TD>
                      <TD>
                        <Link
                          href={href(`/students/${row.student!.id}`)}
                          className="font-medium text-slate-900 hover:text-brand-600 transition-colors rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                        >
                          {studentName(row.student!)}
                        </Link>
                      </TD>
                      <TD>{classLabel(classes, row.student!.classId)}</TD>
                      <TD>{row.invoice.installmentLabel}</TD>
                      <TD className="text-right whitespace-nowrap text-slate-900">
                        {formatMoney(row.total)}
                      </TD>
                      <TD className="text-right whitespace-nowrap text-green-600">
                        {formatMoney(row.paid)}
                      </TD>
                      <TD className="text-right whitespace-nowrap font-medium text-slate-900">
                        {formatMoney(row.balance)}
                      </TD>
                      <TD className="whitespace-nowrap">
                        {formatDate(row.invoice.dueDate)}
                      </TD>
                      <TD>
                        <StatusBadge meta={invoiceStatusMeta(row.status)} />
                      </TD>
                      <TD className="text-right">
                        <Link
                          href={href(`/finance/invoices/${row.invoice.id}`)}
                          aria-label={`Ouvrir la facture ${row.invoice.number}`}
                          className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                        >
                          <Eye size={16} aria-hidden="true" />
                        </Link>
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
                        href={href(`/finance/invoices/${row.invoice.id}`)}
                        className="font-medium text-slate-900 hover:text-brand-600 transition-colors block truncate"
                      >
                        {studentName(row.student!)}
                      </Link>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {row.invoice.number} · {row.invoice.installmentLabel}
                      </p>
                    </div>
                    <StatusBadge meta={invoiceStatusMeta(row.status)} />
                  </div>

                  <dl className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    <div>
                      <dt className="text-slate-400">
                        {m.invoices.columns.total}
                      </dt>
                      <dd className="text-slate-900 mt-0.5">
                        {formatMoney(row.total)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">
                        {m.invoices.columns.paid}
                      </dt>
                      <dd className="text-green-600 mt-0.5">
                        {formatMoney(row.paid)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">
                        {m.invoices.columns.balance}
                      </dt>
                      <dd className="text-slate-900 font-medium mt-0.5">
                        {formatMoney(row.balance)}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </>
  );
}
