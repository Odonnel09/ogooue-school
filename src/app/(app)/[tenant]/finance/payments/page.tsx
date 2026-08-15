'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Banknote } from 'lucide-react';
import { paymentMethodLabels, paymentStatusLabels, ui } from '@/i18n/fr';
import { useHref, useSimulatedLoading } from '@/lib/hooks';
import { useSchoolData } from '@/lib/store/school-data';
import { studentName } from '@/lib/selectors';
import { labelOptions, paymentStatusMeta } from '@/lib/status';
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
import { financeMessages as m } from '@/features/finance/messages';

export default function PaymentsPage() {
  const href = useHref();
  const ready = useSimulatedLoading();
  const { payments, invoices, students } = useSchoolData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  const rows = useMemo(
    () =>
      payments
        .map((payment) => ({
          payment,
          student: students.find((item) => item.id === payment.studentId),
          invoice: invoices.find((item) => item.id === payment.invoiceId),
        }))
        .filter((row) => {
          if (!row.student) return false;
          const haystack = `${row.payment.reference} ${studentName(row.student)} ${row.payment.providerReference} ${row.invoice?.number ?? ''}`;
          if (!matches(haystack, search)) return false;
          if (statusFilter && row.payment.status !== statusFilter) return false;
          if (methodFilter && row.payment.method !== methodFilter) return false;
          return true;
        })
        .sort((a, b) =>
          b.payment.receivedAt.localeCompare(a.payment.receivedAt),
        ),
    [payments, invoices, students, search, statusFilter, methodFilter],
  );

  const activeFilters = (statusFilter ? 1 : 0) + (methodFilter ? 1 : 0);

  return (
    <>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={m.payments.searchPlaceholder}
        activeCount={activeFilters}
        onReset={() => {
          setStatusFilter('');
          setMethodFilter('');
        }}
      >
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={labelOptions(paymentStatusLabels)}
          placeholder={m.payments.filters.allStatuses}
        />
        <FilterSelect
          value={methodFilter}
          onChange={setMethodFilter}
          options={labelOptions(paymentMethodLabels)}
          placeholder={m.payments.filters.allMethods}
        />
      </FilterBar>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {m.payments.tableTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-1">{m.payments.description}</p>
          </div>
          <Badge tone="brand">{ui.results(rows.length)}</Badge>
        </div>

        {!ready ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            title={m.payments.emptyTitle}
            message={
              activeFilters > 0 || search
                ? m.payments.emptyFiltered
                : m.payments.emptyInitial
            }
            icon={<Banknote size={24} aria-hidden="true" />}
            action={
              activeFilters > 0 || search ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('');
                    setMethodFilter('');
                  }}
                >
                  {ui.resetFilters}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <TableWrapper className="hidden md:block">
              <Table>
                <THead>
                  <tr>
                    <TH scope="col">{m.payments.columns.reference}</TH>
                    <TH scope="col">{m.payments.columns.student}</TH>
                    <TH scope="col">{m.payments.columns.invoice}</TH>
                    <TH scope="col" className="text-right">
                      {m.payments.columns.amount}
                    </TH>
                    <TH scope="col">{m.payments.columns.method}</TH>
                    <TH scope="col">{m.payments.columns.receivedAt}</TH>
                    <TH scope="col">{m.payments.columns.status}</TH>
                  </tr>
                </THead>
                <tbody>
                  {rows.map((row) => (
                    <TRow key={row.payment.id}>
                      <TD className="font-mono text-xs text-slate-900">
                        {row.payment.reference}
                      </TD>
                      <TD>
                        <Link
                          href={href(`/students/${row.student!.id}`)}
                          className="font-medium text-slate-900 hover:text-brand-600 transition-colors rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                        >
                          {studentName(row.student!)}
                        </Link>
                      </TD>
                      <TD>
                        {row.invoice ? (
                          <Link
                            href={href(`/finance/invoices/${row.invoice.id}`)}
                            className="font-mono text-xs text-brand-600 hover:underline rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                          >
                            {row.invoice.number}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </TD>
                      <TD className="text-right whitespace-nowrap font-medium text-slate-900">
                        {formatMoney(row.payment.amount)}
                      </TD>
                      <TD>{paymentMethodLabels[row.payment.method]}</TD>
                      <TD className="whitespace-nowrap">
                        {formatDate(row.payment.receivedAt)}
                      </TD>
                      <TD>
                        <StatusBadge
                          meta={paymentStatusMeta(row.payment.status)}
                        />
                      </TD>
                    </TRow>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>

            <ul className="md:hidden space-y-3">
              {rows.map((row) => (
                <li
                  key={row.payment.id}
                  className="border border-slate-100 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {studentName(row.student!)}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {row.payment.reference}
                      </p>
                    </div>
                    <StatusBadge meta={paymentStatusMeta(row.payment.status)} />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                    <span className="text-xs text-slate-500">
                      {paymentMethodLabels[row.payment.method]} ·{' '}
                      {formatDate(row.payment.receivedAt)}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {formatMoney(row.payment.amount)}
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
