'use client';

import { useMemo } from 'react';
import {
  AlertTriangle,
  Banknote,
  Clock,
  Info,
  Receipt,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { REFERENCE_DATE } from '@/data/academic';
import { paymentMethodLabels } from '@/i18n/fr';
import { useSession } from '@/lib/auth/session';
import { useSchoolData } from '@/lib/store/school-data';
import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/utils';
import { Badge, Card, EmptyState, StatCard } from '@/components/ui';
import {
  collectedByMethod,
  treasurySummary,
} from '@/features/finance/queries';
import { financeMessages as m } from '@/features/finance/messages';

export default function TreasuryPage() {
  const { invoices, payments } = useSchoolData();
  const { academicYear } = useSession();

  const scoped = useMemo(
    () =>
      invoices.filter((invoice) => invoice.academicYear === academicYear.id),
    [invoices, academicYear.id],
  );

  const summary = useMemo(
    () => treasurySummary(scoped, payments, REFERENCE_DATE),
    [scoped, payments],
  );

  const byMethod = useMemo(() => collectedByMethod(payments), [payments]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label={m.treasury.stats.expected}
          value={formatMoney(summary.expected)}
          icon={<Receipt size={22} aria-hidden="true" />}
          tone="brand"
        />
        <StatCard
          label={m.treasury.stats.collected}
          value={formatMoney(summary.collected)}
          icon={<Banknote size={22} aria-hidden="true" />}
          tone="green"
          hint={`${summary.rate}% ${m.treasury.stats.rate.toLowerCase()}`}
        />
        <StatCard
          label={m.treasury.stats.outstanding}
          value={formatMoney(summary.outstanding)}
          icon={<Wallet size={22} aria-hidden="true" />}
          tone="orange"
        />
        <StatCard
          label={m.treasury.stats.overdue}
          value={summary.overdueCount}
          icon={<AlertTriangle size={22} aria-hidden="true" />}
          tone="red"
          hint={formatMoney(summary.overdueAmount)}
        />
      </div>

      <Card className="p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          {m.treasury.title}
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          {m.treasury.description}
        </p>

        {/* Progression du recouvrement */}
        <div className="flex items-end justify-between gap-3 mb-2">
          <span className="text-sm font-medium text-slate-700">
            {m.treasury.stats.rate}
          </span>
          <span className="text-2xl font-bold text-slate-900">
            {summary.rate}%
          </span>
        </div>
        <div
          className="h-2 bg-slate-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={summary.rate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={m.treasury.stats.rate}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all',
              summary.rate >= 80
                ? 'bg-green-500'
                : summary.rate >= 50
                  ? 'bg-brand-500'
                  : 'bg-orange-500',
            )}
            style={{ width: `${summary.rate}%` }}
          />
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <dt className="text-xs text-slate-500">
              {m.treasury.stats.expected}
            </dt>
            <dd className="text-lg font-bold text-slate-900 mt-1">
              {formatMoney(summary.expected)}
            </dd>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <dt className="text-xs text-slate-500">
              {m.treasury.stats.collected}
            </dt>
            <dd className="text-lg font-bold text-green-600 mt-1">
              {formatMoney(summary.collected)}
            </dd>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <dt className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock size={13} aria-hidden="true" />
              {m.treasury.stats.pending}
            </dt>
            <dd className="text-lg font-bold text-yellow-600 mt-1">
              {formatMoney(summary.pending)}
            </dd>
          </div>
        </dl>

        <div className="mt-5 bg-yellow-50 border border-yellow-100 rounded-xl p-3 flex items-start gap-2.5">
          <Info
            size={16}
            className="text-yellow-600 mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <p className="text-xs text-yellow-800 leading-relaxed">
            {m.treasury.pendingNotice}
          </p>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-5">
          {m.treasury.byMethod}
        </h2>

        {byMethod.length === 0 ? (
          <EmptyState
            title={m.treasury.noPayment}
            message={m.treasury.noPaymentMessage}
            icon={<TrendingUp size={24} aria-hidden="true" />}
          />
        ) : (
          <ul className="space-y-3">
            {byMethod.map((entry) => {
              const percent =
                summary.collected > 0
                  ? Math.round((entry.amount / summary.collected) * 100)
                  : 0;

              return (
                <li key={entry.method}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <span className="text-sm font-medium text-slate-900">
                      {paymentMethodLabels[entry.method]}
                    </span>
                    <span className="flex items-center gap-2">
                      <Badge tone="slate">{entry.count} règlements</Badge>
                      <span className="text-sm font-bold text-slate-900">
                        {formatMoney(entry.amount)}
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
