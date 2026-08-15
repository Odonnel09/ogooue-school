'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  FileWarning,
  Plus,
  UserPlus,
} from 'lucide-react';
import { isFileComplete, missingDocuments } from '@/types';
import { enrollmentStatusLabels, ui } from '@/i18n/fr';
import { Can } from '@/lib/auth/session';
import { useSchoolData } from '@/lib/store/school-data';
import { useHref, useSimulatedLoading } from '@/lib/hooks';
import { guardianName, levelLabel } from '@/lib/selectors';
import { levelOptions } from '@/lib/options';
import { enrollmentStatusMeta, labelOptions } from '@/lib/status';
import { formatDate, matches } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FilterBar,
  FilterSelect,
  LinkButton,
  PageContainer,
  PageHeader,
  StatCard,
  StatusBadge,
  TD,
  TH,
  THead,
  TRow,
  Table,
  TableSkeleton,
  TableWrapper,
} from '@/components/ui';
import { enrollmentMessages as m } from '@/features/enrollments/messages';

const COMPLETENESS_OPTIONS = [
  { value: 'complete', label: m.list.filters.complete },
  { value: 'incomplete', label: m.list.filters.incomplete },
];

export default function EnrollmentsPage() {
  const href = useHref();
  const ready = useSimulatedLoading();
  const { enrollments, guardians, config } = useSchoolData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [completeness, setCompleteness] = useState('');

  const visible = useMemo(
    () =>
      enrollments
        .filter((application) => {
          const haystack = `${application.firstName} ${application.lastName} ${application.reference}`;
          if (!matches(haystack, search)) return false;
          if (statusFilter && application.status !== statusFilter) return false;
          if (levelFilter && application.requestedLevelId !== levelFilter) {
            return false;
          }
          if (completeness === 'complete' && !isFileComplete(application)) {
            return false;
          }
          if (completeness === 'incomplete' && isFileComplete(application)) {
            return false;
          }
          return true;
        })
        .sort((a, b) => b.reference.localeCompare(a.reference)),
    [enrollments, search, statusFilter, levelFilter, completeness],
  );

  const counts = useMemo(
    () => ({
      total: enrollments.length,
      pending: enrollments.filter(
        (item) => item.status === 'soumise' || item.status === 'validee',
      ).length,
      incomplete: enrollments.filter((item) => !isFileComplete(item)).length,
      enrolled: enrollments.filter((item) => item.status === 'inscrite').length,
    }),
    [enrollments],
  );

  const activeFilters =
    (statusFilter ? 1 : 0) + (levelFilter ? 1 : 0) + (completeness ? 1 : 0);

  function resetFilters() {
    setStatusFilter('');
    setLevelFilter('');
    setCompleteness('');
  }

  return (
    <PageContainer>
      <PageHeader
        title={m.list.title}
        description={m.list.description}
        actions={
          <Can permission="students.create" requiresWritableYear>
            <LinkButton href={href('/enrollments/new')}>
              <Plus size={16} aria-hidden="true" /> {m.list.add}
            </LinkButton>
          </Can>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label={m.list.stats.total}
          value={counts.total}
          icon={<ClipboardList size={22} aria-hidden="true" />}
          tone="brand"
        />
        <StatCard
          label={m.list.stats.pending}
          value={counts.pending}
          icon={<CheckCircle2 size={22} aria-hidden="true" />}
          tone="yellow"
        />
        <StatCard
          label={m.list.stats.incomplete}
          value={counts.incomplete}
          icon={<FileWarning size={22} aria-hidden="true" />}
          tone="orange"
        />
        <StatCard
          label={m.list.stats.enrolled}
          value={counts.enrolled}
          icon={<UserPlus size={22} aria-hidden="true" />}
          tone="green"
        />
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={m.list.searchPlaceholder}
        activeCount={activeFilters}
        onReset={resetFilters}
      >
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={labelOptions(enrollmentStatusLabels)}
          placeholder={m.list.filters.allStatuses}
        />
        <FilterSelect
          value={levelFilter}
          onChange={setLevelFilter}
          options={levelOptions(config.activeCycles)}
          placeholder={m.list.filters.allLevels}
        />
        <FilterSelect
          value={completeness}
          onChange={setCompleteness}
          options={COMPLETENESS_OPTIONS}
          placeholder={m.list.filters.completeness}
        />
      </FilterBar>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {m.list.tableTitle}
          </h2>
          <Badge tone="brand">{ui.results(visible.length)}</Badge>
        </div>

        {!ready ? (
          <TableSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            title={m.list.emptyTitle}
            message={
              enrollments.length === 0
                ? m.list.emptyInitial
                : m.list.emptyFiltered
            }
            icon={<ClipboardList size={24} aria-hidden="true" />}
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
              ) : (
                <Can permission="students.create" requiresWritableYear>
                  <LinkButton href={href('/enrollments/new')}>
                    <Plus size={16} aria-hidden="true" /> {m.list.add}
                  </LinkButton>
                </Can>
              )
            }
          />
        ) : (
          <>
            <TableWrapper className="hidden lg:block">
              <Table>
                <THead>
                  <tr>
                    <TH scope="col">{m.list.columns.reference}</TH>
                    <TH scope="col">{m.list.columns.candidate}</TH>
                    <TH scope="col">{m.list.columns.level}</TH>
                    <TH scope="col">{m.list.columns.guardian}</TH>
                    <TH scope="col">{m.list.columns.documents}</TH>
                    <TH scope="col">{m.list.columns.submitted}</TH>
                    <TH scope="col">{m.list.columns.status}</TH>
                    <TH scope="col" className="text-right">
                      {m.list.columns.actions}
                    </TH>
                  </tr>
                </THead>
                <tbody>
                  {visible.map((application) => {
                    const guardian = guardians.find(
                      (item) => item.id === application.guardianId,
                    );
                    const provided = application.documents.filter(
                      (document) => document.provided,
                    ).length;
                    const complete = isFileComplete(application);

                    return (
                      <TRow key={application.id}>
                        <TD className="font-mono text-xs text-slate-900">
                          {application.reference}
                        </TD>
                        <TD>
                          <Link
                            href={href(`/enrollments/${application.id}`)}
                            className="font-medium text-slate-900 hover:text-brand-600 transition-colors rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                          >
                            {application.firstName} {application.lastName}
                          </Link>
                        </TD>
                        <TD>{levelLabel(application.requestedLevelId)}</TD>
                        <TD>{guardian ? guardianName(guardian) : '—'}</TD>
                        <TD>
                          <Badge tone={complete ? 'green' : 'orange'}>
                            {m.list.documentsCount(
                              provided,
                              application.documents.length,
                            )}
                          </Badge>
                        </TD>
                        <TD className="whitespace-nowrap">
                          {application.submittedAt
                            ? formatDate(application.submittedAt)
                            : '—'}
                        </TD>
                        <TD>
                          <StatusBadge
                            meta={enrollmentStatusMeta(application.status)}
                          />
                        </TD>
                        <TD className="text-right">
                          <Link
                            href={href(`/enrollments/${application.id}`)}
                            aria-label={`Ouvrir le dossier ${application.reference}`}
                            className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                          >
                            <Eye size={16} aria-hidden="true" />
                          </Link>
                        </TD>
                      </TRow>
                    );
                  })}
                </tbody>
              </Table>
            </TableWrapper>

            <ul className="lg:hidden space-y-3">
              {visible.map((application) => {
                const guardian = guardians.find(
                  (item) => item.id === application.guardianId,
                );
                const provided = application.documents.filter(
                  (document) => document.provided,
                ).length;
                const complete = isFileComplete(application);

                return (
                  <li
                    key={application.id}
                    className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={href(`/enrollments/${application.id}`)}
                          className="font-medium text-slate-900 hover:text-brand-600 transition-colors block truncate"
                        >
                          {application.firstName} {application.lastName}
                        </Link>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {application.reference}
                        </p>
                      </div>
                      <StatusBadge
                        meta={enrollmentStatusMeta(application.status)}
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <Badge tone="brand">
                        {levelLabel(application.requestedLevelId)}
                      </Badge>
                      <Badge tone={complete ? 'green' : 'orange'}>
                        {m.list.documentsCount(
                          provided,
                          application.documents.length,
                        )}
                      </Badge>
                      {!complete && (
                        <Badge tone="orange">
                          {m.detail.incomplete(
                            missingDocuments(application).length,
                          )}
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-3">
                      {guardian ? guardianName(guardian) : '—'}
                      {application.submittedAt && (
                        <span className="text-slate-400">
                          {' '}
                          · déposé le {formatDate(application.submittedAt)}
                        </span>
                      )}
                    </p>

                    <LinkButton
                      href={href(`/enrollments/${application.id}`)}
                      variant="outline"
                      size="sm"
                      fullWidth
                      className="mt-4"
                    >
                      <Eye size={15} aria-hidden="true" /> Ouvrir le dossier
                    </LinkButton>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Card>
    </PageContainer>
  );
}
