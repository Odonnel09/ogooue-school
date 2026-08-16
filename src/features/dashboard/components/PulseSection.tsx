'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  ClipboardCheck,
  Receipt,
  ScrollText,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { NOTIFICATION_TONES } from '@/types';
import { REFERENCE_DATE } from '@/data/academic';
import { auditActionLabels, enrollmentStatusLabels } from '@/i18n/fr';
import { Can, useSession } from '@/lib/auth/session';
import { useHref } from '@/lib/hooks';
import { useSchoolData } from '@/lib/store/school-data';
import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/utils';
import { treasurySummary } from '@/features/finance/queries';
import { useNotifications } from '@/features/notifications/queries';
import { enrollmentPipeline, recentActivity } from '../queries';

/**
 * SECOND NIVEAU DU TABLEAU DE BORD.
 *
 * `GEMINI.md` attend, en plus des effectifs : les inscriptions en cours, les
 * paiements reçus et les impayés, les alertes et les activités récentes
 * (l. 51-55). Ces blocs sont ajoutés **sous** ceux déjà validés visuellement,
 * dont aucun n'est modifié.
 *
 * Rien n'est recalculé ici de façon parallèle : les alertes viennent du même
 * `useNotifications()` que la cloche, les activités du journal d'audit, la
 * trésorerie de `treasurySummary()`. Deux sources donneraient deux vérités.
 *
 * Chaque bloc est masqué si la permission manque — un secrétaire ne voit pas
 * le journal d'audit, ici pas davantage qu'ailleurs.
 */

const DATE_TIME = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const TONE_CLASSES: Record<string, string> = {
  brand: 'bg-brand-50 text-brand-600',
  red: 'bg-red-50 text-red-500',
  orange: 'bg-orange-50 text-orange-500',
  blue: 'bg-blue-50 text-blue-500',
  yellow: 'bg-yellow-50 text-yellow-600',
  green: 'bg-green-50 text-green-600',
  slate: 'bg-slate-100 text-slate-500',
};

export function PulseSection() {
  const href = useHref();
  const { can } = useSession();
  const { enrollments, invoices, payments, auditLog } = useSchoolData();
  const { notifications } = useNotifications();

  const pipeline = useMemo(
    () => enrollmentPipeline(enrollments),
    [enrollments],
  );

  const treasury = useMemo(
    () => treasurySummary(invoices, payments, REFERENCE_DATE),
    [invoices, payments],
  );

  const activity = useMemo(() => recentActivity(auditLog, 6), [auditLog]);
  const alerts = notifications.slice(0, 5);

  const canSeeMoney = can('payments.read');

  return (
    <>
      {/* Chiffres du second niveau */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MiniStat
          label="Inscriptions en cours"
          value={`${pipeline.inProgress}`}
          hint={`${pipeline.incompleteFiles} dossier(s) incomplet(s)`}
          icon={<ClipboardCheck size={20} aria-hidden="true" />}
          tone="brand"
          href={href('/enrollments')}
        />

        {canSeeMoney ? (
          <>
            <MiniStat
              label="Paiements reçus"
              value={formatMoney(treasury.collected)}
              hint={`${treasury.rate}% du montant attendu`}
              icon={<Wallet size={20} aria-hidden="true" />}
              tone="green"
              href={href('/finance/payments')}
            />
            <MiniStat
              label="Impayés"
              value={formatMoney(treasury.overdueAmount)}
              hint={`${treasury.overdueCount} facture(s) en retard`}
              icon={<Receipt size={20} aria-hidden="true" />}
              tone="red"
              href={href('/finance/overdue')}
            />
          </>
        ) : null}

        <MiniStat
          label="Alertes"
          value={`${notifications.length}`}
          hint={
            notifications.length === 0
              ? 'Rien à signaler'
              : 'Situations à traiter'
          }
          icon={<BellRing size={20} aria-hidden="true" />}
          tone="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Inscriptions en cours */}
        <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
          <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Inscriptions en cours
            </h2>
            <Link
              href={href('/enrollments')}
              className="text-sm text-brand-600 hover:underline rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
            >
              Voir tout
            </Link>
          </div>

          {pipeline.inProgress === 0 ? (
            <EmptyLine
              icon={<CheckCircle2 size={20} aria-hidden="true" />}
              message="Aucun dossier en attente de traitement."
            />
          ) : (
            <ul className="space-y-3">
              {pipeline.byStatus.map((entry) => (
                <li key={entry.status}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-600">
                      {enrollmentStatusLabels[entry.status]}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {entry.count}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all duration-500"
                      style={{
                        width: `${pipeline.inProgress === 0 ? 0 : Math.round((entry.count / pipeline.inProgress) * 100)}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {pipeline.awaitingEnrollment > 0 && (
            <p className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-900">
                {pipeline.awaitingEnrollment}
              </strong>{' '}
              dossier(s) validé(s) attendent la création de la fiche élève.
            </p>
          )}
        </section>

        {/* Recouvrement */}
        <Can permission="payments.read">
          <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
            <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Recouvrement
              </h2>
              <Link
                href={href('/finance')}
                className="text-sm text-brand-600 hover:underline rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
              >
                Voir tout
              </Link>
            </div>

            <div className="flex items-end justify-between gap-3 mb-2">
              <span className="text-2xl font-bold text-slate-900">
                {treasury.rate}%
              </span>
              <span className="text-xs text-slate-500 text-right">
                {formatMoney(treasury.collected)} sur{' '}
                {formatMoney(treasury.expected)}
              </span>
            </div>

            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{ width: `${Math.min(100, treasury.rate)}%` }}
              />
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <Row
                label="Reste à recouvrer"
                value={formatMoney(treasury.outstanding)}
              />
              <Row
                label="En attente de confirmation"
                value={formatMoney(treasury.pending)}
                hint="Règlements par prestataire, non confirmés"
              />
              <Row
                label="Dont en retard"
                value={formatMoney(treasury.overdueAmount)}
                tone="red"
              />
            </dl>
          </section>
        </Can>

        {/* Alertes */}
        <section
          className={cn(
            'bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100',
            !canSeeMoney && 'lg:col-span-2',
          )}
        >
          <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Alertes
            </h2>
            {notifications.length > 0 && (
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                {notifications.length}
              </span>
            )}
          </div>

          {alerts.length === 0 ? (
            <EmptyLine
              icon={<CheckCircle2 size={20} aria-hidden="true" />}
              message="Aucune facture en retard, aucun dossier incomplet, aucune note en attente."
            />
          ) : (
            <ul className="space-y-2">
              {alerts.map((alert) => (
                <li key={alert.id}>
                  <Link
                    href={href(alert.href)}
                    className="flex items-start gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-slate-50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                  >
                    <span
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                        TONE_CLASSES[NOTIFICATION_TONES[alert.kind]] ??
                          TONE_CLASSES.slate,
                      )}
                    >
                      <AlertTriangle size={15} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm text-slate-900 truncate">
                        {alert.title}
                      </span>
                      <span className="block text-xs text-slate-500 line-clamp-2 leading-relaxed mt-0.5">
                        {alert.body}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Activités récentes */}
      <Can permission="audit.read">
        <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
          <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Activités récentes
            </h2>
            <Link
              href={href('/audit')}
              className="text-sm text-brand-600 hover:underline rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
            >
              Voir le journal
            </Link>
          </div>

          {activity.length === 0 ? (
            <EmptyLine
              icon={<Activity size={20} aria-hidden="true" />}
              message="Aucune opération enregistrée pour le moment."
            />
          ) : (
            <ul className="space-y-1">
              {activity.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0"
                >
                  <span
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      entry.severity === 'sensitive'
                        ? 'bg-orange-50 text-orange-500'
                        : 'bg-slate-100 text-slate-400',
                    )}
                  >
                    <ScrollText size={15} aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-900">
                      {auditActionLabels[entry.action]}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {entry.resourceLabel} · {entry.actorName}
                    </p>
                  </div>

                  <span className="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">
                    {DATE_TIME.format(new Date(entry.at))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Can>
    </>
  );
}

/* -------------------------------------------------------------------------- */

function MiniStat({
  label,
  value,
  hint,
  icon,
  tone,
  href,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: 'brand' | 'green' | 'red' | 'orange';
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            TONE_CLASSES[tone],
          )}
        >
          {icon}
        </span>
        {href && (
          <TrendingUp
            size={14}
            aria-hidden="true"
            className="text-slate-300 mt-1"
          />
        )}
      </div>

      <p className="text-xs text-slate-500 mt-3">{label}</p>
      {/* Un montant en francs CFA est long : il doit rétrécir, pas déborder. */}
      <p
        className={cn(
          'font-bold text-slate-900 leading-tight mt-0.5 break-words',
          value.length > 12 ? 'text-base' : 'text-xl',
        )}
      >
        {value}
      </p>
      <p className="text-[11px] text-slate-400 mt-1">{hint}</p>
    </>
  );

  const className =
    'bg-white rounded-2xl p-4 shadow-sm border border-slate-100 block transition-colors';

  return href ? (
    <Link
      href={href}
      className={cn(
        className,
        'hover:border-brand-100 outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20',
      )}
    >
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

function Row({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'red';
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-500 min-w-0">
        {label}
        {hint && (
          <span className="block text-[11px] text-slate-400 mt-0.5">
            {hint}
          </span>
        )}
      </dt>
      <dd
        className={cn(
          'font-semibold shrink-0 text-right',
          tone === 'red' ? 'text-red-500' : 'text-slate-900',
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function EmptyLine({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) {
  return (
    <div className="flex items-start gap-3 py-4">
      <span className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
        {icon}
      </span>
      <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
    </div>
  );
}
