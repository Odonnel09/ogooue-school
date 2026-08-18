'use client';

import { useMemo, useState } from 'react';
import { Activity, Download, Info, ShieldAlert, Users } from 'lucide-react';
import { auditActionLabels, auditDomainLabels, auditSeverityLabels, ui } from '@/i18n/fr';
import { Can, useSession } from '@/lib/auth/session';
import type { AuditEntry } from '@/types';
import { auditSeverityMeta, labelOptions } from '@/lib/status';
import { downloadCsv } from '@/lib/export';
import { matches } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FilterBar,
  FilterSelect,
  PageContainer,
  PageHeader,
  StatCard,
  StatusBadge,
  TD,
  TH,
  THead,
  TRow,
  Table,
  TableWrapper,
  useToast,
} from '@/components/ui';
import { auditMessages as m } from '@/features/audit/messages';

const DATE_TIME = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatMoment(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : DATE_TIME.format(date);
}

/**
 * Journal d'audit.
 *
 * Les traces viennent de la table `audit_logs`, filtrées par la politique
 * « journal lisible avec audit.read ». Un rôle sans cette permission reçoit
 * une liste vide — le contrôle d'affichage ci-dessous est une courtoisie, pas
 * une protection.
 */
export function AuditView({ auditLog }: { auditLog: AuditEntry[] }) {
  const toast = useToast();
  const { can } = useSession();

  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');

  const actors = useMemo(
    () =>
      Array.from(new Set(auditLog.map((entry) => entry.actorName)))
        .sort((a, b) => a.localeCompare(b, 'fr'))
        .map((name) => ({ value: name, label: name })),
    [auditLog],
  );

  const visible = useMemo(
    () =>
      auditLog
        .filter((entry) => {
          const haystack = `${entry.actorName} ${entry.resourceLabel} ${entry.detail} ${auditActionLabels[entry.action]}`;
          if (!matches(haystack, search)) return false;
          if (domainFilter && entry.domain !== domainFilter) return false;
          if (severityFilter && entry.severity !== severityFilter) return false;
          if (actorFilter && entry.actorName !== actorFilter) return false;
          return true;
        })
        .sort((a, b) => b.at.localeCompare(a.at)),
    [auditLog, search, domainFilter, severityFilter, actorFilter],
  );

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: auditLog.length,
      sensitive: auditLog.filter((entry) => entry.severity === 'sensitive')
        .length,
      actors: new Set(auditLog.map((entry) => entry.actorName)).size,
      today: auditLog.filter((entry) => entry.at.startsWith(today)).length,
    };
  }, [auditLog]);

  const activeFilters =
    (domainFilter ? 1 : 0) + (severityFilter ? 1 : 0) + (actorFilter ? 1 : 0);

  function resetFilters() {
    setDomainFilter('');
    setSeverityFilter('');
    setActorFilter('');
  }

  function exportCsv() {
    downloadCsv(
      'journal-audit-ogooue-school.csv',
      [
        m.columns.at,
        m.columns.actor,
        'Rôle',
        m.columns.action,
        'Domaine',
        m.columns.severity,
        'Type de ressource',
        m.columns.resource,
        m.columns.detail,
      ],
      visible.map((entry) => [
        entry.at,
        entry.actorName,
        entry.actorRole,
        auditActionLabels[entry.action],
        auditDomainLabels[entry.domain],
        auditSeverityLabels[entry.severity],
        entry.resourceType,
        entry.resourceLabel,
        entry.detail,
      ]),
    );
    toast.success(m.exported(visible.length));
  }

  if (!can('audit.read')) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title="Accès non autorisé"
            message="Votre rôle ne donne pas accès au journal d’audit de l’établissement."
            icon={<ShieldAlert size={24} aria-hidden="true" />}
          />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={m.title}
        description={m.description}
        actions={
          <Can permission="audit.read">
            <Button
              variant="outline"
              onClick={exportCsv}
              disabled={visible.length === 0}
            >
              <Download size={16} aria-hidden="true" /> {m.export}
            </Button>
          </Can>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label={m.stats.total}
          value={stats.total}
          icon={<Activity size={22} aria-hidden="true" />}
          tone="brand"
        />
        <StatCard
          label={m.stats.sensitive}
          value={stats.sensitive}
          icon={<ShieldAlert size={22} aria-hidden="true" />}
          tone="orange"
        />
        <StatCard
          label={m.stats.actors}
          value={stats.actors}
          icon={<Users size={22} aria-hidden="true" />}
          tone="blue"
        />
        <StatCard
          label={m.stats.today}
          value={stats.today}
          icon={<Activity size={22} aria-hidden="true" />}
          tone="green"
        />
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={m.searchPlaceholder}
        activeCount={activeFilters}
        onReset={resetFilters}
      >
        <FilterSelect
          value={domainFilter}
          onChange={setDomainFilter}
          options={labelOptions(auditDomainLabels)}
          placeholder={m.filters.allDomains}
        />
        <FilterSelect
          value={severityFilter}
          onChange={setSeverityFilter}
          options={labelOptions(auditSeverityLabels)}
          placeholder={m.filters.allSeverities}
        />
        <FilterSelect
          value={actorFilter}
          onChange={setActorFilter}
          options={actors}
          placeholder={m.filters.allActors}
        />
      </FilterBar>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {m.tableTitle}
          </h2>
          <Badge tone="brand">{ui.results(visible.length)}</Badge>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            title={m.emptyTitle}
            message={
              auditLog.length === 0 ? m.emptyInitial : m.emptyFiltered
            }
            icon={<Activity size={24} aria-hidden="true" />}
            action={
              activeFilters > 0 || search ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    resetFilters();
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
                    <TH scope="col">{m.columns.at}</TH>
                    <TH scope="col">{m.columns.actor}</TH>
                    <TH scope="col">{m.columns.action}</TH>
                    <TH scope="col">{m.columns.resource}</TH>
                    <TH scope="col">{m.columns.detail}</TH>
                    <TH scope="col">{m.columns.severity}</TH>
                  </tr>
                </THead>
                <tbody>
                  {visible.map((entry) => (
                    <TRow key={entry.id}>
                      <TD className="whitespace-nowrap text-xs">
                        {formatMoment(entry.at)}
                      </TD>
                      <TD>
                        <span className="text-slate-900">{entry.actorName}</span>
                        <span className="block text-[11px] text-slate-400">
                          {entry.actorRole}
                        </span>
                      </TD>
                      <TD>
                        <span className="text-slate-900">
                          {auditActionLabels[entry.action]}
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          {auditDomainLabels[entry.domain]}
                        </span>
                      </TD>
                      <TD>
                        <span className="text-slate-900">
                          {entry.resourceLabel}
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          {entry.resourceType}
                        </span>
                      </TD>
                      <TD className="max-w-md text-xs">{entry.detail}</TD>
                      <TD>
                        <StatusBadge meta={auditSeverityMeta(entry.severity)} />
                      </TD>
                    </TRow>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>

            <ul className="lg:hidden space-y-3">
              {visible.map((entry) => (
                <li
                  key={entry.id}
                  className="border border-slate-100 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {auditActionLabels[entry.action]}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {entry.resourceType} · {entry.resourceLabel}
                      </p>
                    </div>
                    <StatusBadge meta={auditSeverityMeta(entry.severity)} />
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {entry.detail}
                  </p>

                  <p className="text-[11px] text-slate-400 mt-3">
                    {entry.actorName} · {entry.actorRole} ·{' '}
                    {formatMoment(entry.at)}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
        <p className="text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
          <Info
            size={16}
            className="text-slate-400 mt-0.5 shrink-0"
            aria-hidden="true"
          />
          {m.immutableNotice}
        </p>
        <p className="text-xs text-slate-500 leading-relaxed pl-[26px]">
          {m.clientNotice}
        </p>
      </div>
    </PageContainer>
  );
}
