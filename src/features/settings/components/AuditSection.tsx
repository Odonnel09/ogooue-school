'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Info, ShieldAlert } from 'lucide-react';
import { auditActionLabels } from '@/i18n/fr';
import { useHref } from '@/lib/hooks';
import { useSchoolData } from '@/lib/store/school-data';
import { auditSeverityMeta } from '@/lib/status';
import { Badge, Card, EmptyState, StatusBadge } from '@/components/ui';
import { auditMessages as a } from '@/features/audit/messages';
import { SettingsSection } from './SettingsSection';

const DATE_TIME = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/**
 * Le journal se consulte depuis `/audit`. Cette section n'en affiche qu'un
 * extrait : le dupliquer entièrement créerait une seconde source de vérité.
 */
export function AuditSection() {
  const href = useHref();
  const { auditLog } = useSchoolData();

  const recent = useMemo(
    () =>
      auditLog
        .filter((entry) => entry.severity === 'sensitive')
        .slice()
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, 6),
    [auditLog],
  );

  return (
    <SettingsSection
      title={a.settings.title}
      description={a.settings.description}
      actions={
        <Link
          href={href('/audit')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
        >
          {a.settings.open}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      }
    >
      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
          <h2 className="text-base font-bold text-slate-900">
            {a.settings.recentTitle}
          </h2>
          <Badge tone="orange">{recent.length}</Badge>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            title={a.emptyTitle}
            message={a.emptyInitial}
            icon={<ShieldAlert size={24} aria-hidden="true" />}
          />
        ) : (
          <ul className="space-y-2">
            {recent.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-start justify-between gap-3 p-3 rounded-xl border border-slate-100"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {auditActionLabels[entry.action]}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {entry.resourceLabel} · {entry.actorName}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400">
                    {DATE_TIME.format(new Date(entry.at))}
                  </span>
                  <StatusBadge meta={auditSeverityMeta(entry.severity)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
        <Info
          size={18}
          className="text-slate-400 mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <p className="text-xs text-slate-600 leading-relaxed">
          {a.settings.retention}
        </p>
      </div>
    </SettingsSection>
  );
}
