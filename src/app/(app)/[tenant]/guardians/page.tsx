'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Archive,
  Eye,
  Pencil,
  Plus,
  UserRound,
  Users,
  UsersRound,
} from 'lucide-react';
import type { Guardian } from '@/types';
import { guardianStatusLabels, ui } from '@/i18n/fr';
import { Can, useSession } from '@/lib/auth/session';
import { useSchoolData } from '@/lib/store/school-data';
import { useAudit } from '@/lib/audit/use-audit';
import { useHref, useSimulatedLoading } from '@/lib/hooks';
import {
  classLabel,
  guardianName,
  linksOfGuardian,
  studentName,
} from '@/lib/selectors';
import { classOptions } from '@/lib/options';
import { guardianStatusMeta, labelOptions } from '@/lib/status';
import { matches } from '@/lib/utils';
import {
  ActionMenu,
  Avatar,
  Badge,
  Button,
  Card,
  ConfirmDialog,
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
  useToast,
} from '@/components/ui';
import { guardianMessages as m } from '@/features/guardians/messages';

const LINKAGE_OPTIONS = [
  { value: 'with', label: m.list.filters.withChildren },
  { value: 'without', label: m.list.filters.withoutChildren },
  { value: 'multi', label: m.list.filters.multiChild },
];

export default function GuardiansPage() {
  const href = useHref();
  const router = useRouter();
  const toast = useToast();
  const ready = useSimulatedLoading();
  const { guardians, guardianLinks, students, classes, actions } =
    useSchoolData();
  const audit = useAudit();
  const { isYearWritable } = useSession();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [linkageFilter, setLinkageFilter] = useState('');
  const [toArchive, setToArchive] = useState<Guardian | null>(null);

  /** Enfants suivis par tuteur, résolus une fois pour toute la page. */
  const childrenOf = useMemo(() => {
    const map = new Map<string, typeof students>();
    guardians.forEach((guardian) => {
      const linked = linksOfGuardian(guardianLinks, guardian.id)
        .map((link) => students.find((student) => student.id === link.studentId))
        .filter((student): student is (typeof students)[number] =>
          student !== undefined,
        );
      map.set(guardian.id, linked);
    });
    return map;
  }, [guardians, guardianLinks, students]);

  const visible = useMemo(
    () =>
      guardians
        .filter((guardian) => {
          const haystack = `${guardianName(guardian)} ${guardian.phone} ${guardian.email}`;
          if (!matches(haystack, search)) return false;
          if (statusFilter && guardian.status !== statusFilter) return false;

          const children = childrenOf.get(guardian.id) ?? [];

          if (classFilter && !children.some((c) => c.classId === classFilter)) {
            return false;
          }
          if (linkageFilter === 'with' && children.length === 0) return false;
          if (linkageFilter === 'without' && children.length > 0) return false;
          if (linkageFilter === 'multi' && children.length < 2) return false;

          return true;
        })
        .sort((a, b) => guardianName(a).localeCompare(guardianName(b), 'fr')),
    [guardians, search, statusFilter, classFilter, linkageFilter, childrenOf],
  );

  const counts = useMemo(() => {
    const withChildren = guardians.filter(
      (guardian) => (childrenOf.get(guardian.id) ?? []).length > 0,
    );
    return {
      total: guardians.length,
      active: guardians.filter((item) => item.status === 'actif').length,
      multi: guardians.filter(
        (guardian) => (childrenOf.get(guardian.id) ?? []).length > 1,
      ).length,
      unlinked: guardians.length - withChildren.length,
    };
  }, [guardians, childrenOf]);

  const activeFilters =
    (statusFilter ? 1 : 0) + (classFilter ? 1 : 0) + (linkageFilter ? 1 : 0);

  function resetFilters() {
    setStatusFilter('');
    setClassFilter('');
    setLinkageFilter('');
  }

  function archive(guardian: Guardian) {
    actions.guardians.update(guardian.id, { status: 'archive' });
    audit({
      action: 'guardians.archive',
      resourceType: 'Tuteur',
      resourceId: guardian.id,
      resourceLabel: guardianName(guardian),
      detail: 'Tuteur archivé : son accès au portail famille est suspendu.',
    });
    setToArchive(null);
    toast.success(m.detail.archived(guardianName(guardian)));
  }

  return (
    <PageContainer>
      <PageHeader
        title={m.list.title}
        description={m.list.description}
        actions={
          <Can permission="students.create" requiresWritableYear>
            <LinkButton href={href('/guardians/new')}>
              <Plus size={16} aria-hidden="true" /> {m.list.add}
            </LinkButton>
          </Can>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label={m.list.stats.total}
          value={counts.total}
          icon={<UsersRound size={22} aria-hidden="true" />}
          tone="brand"
        />
        <StatCard
          label={m.list.stats.active}
          value={counts.active}
          icon={<UserRound size={22} aria-hidden="true" />}
          tone="green"
        />
        <StatCard
          label={m.list.stats.multiChild}
          value={counts.multi}
          icon={<Users size={22} aria-hidden="true" />}
          tone="blue"
        />
        <StatCard
          label={m.list.stats.unlinked}
          value={counts.unlinked}
          icon={<UserRound size={22} aria-hidden="true" />}
          tone="orange"
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
          options={labelOptions(guardianStatusLabels)}
          placeholder={m.list.filters.allStatuses}
        />
        <FilterSelect
          value={classFilter}
          onChange={setClassFilter}
          options={classOptions(classes)}
          placeholder={m.list.filters.allClasses}
        />
        <FilterSelect
          value={linkageFilter}
          onChange={setLinkageFilter}
          options={LINKAGE_OPTIONS}
          placeholder={m.list.filters.linkage}
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
              guardians.length === 0 ? m.list.emptyInitial : m.list.emptyFiltered
            }
            icon={<UsersRound size={24} aria-hidden="true" />}
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
                  <LinkButton href={href('/guardians/new')}>
                    <Plus size={16} aria-hidden="true" /> {m.list.add}
                  </LinkButton>
                </Can>
              )
            }
          />
        ) : (
          <>
            <TableWrapper className="hidden md:block">
              <Table>
                <THead>
                  <tr>
                    <TH scope="col">{m.list.columns.guardian}</TH>
                    <TH scope="col">{m.list.columns.phone}</TH>
                    <TH scope="col">{m.list.columns.email}</TH>
                    <TH scope="col">{m.list.columns.children}</TH>
                    <TH scope="col">{m.list.columns.profession}</TH>
                    <TH scope="col">{m.list.columns.status}</TH>
                    <TH scope="col" className="text-right">
                      {m.list.columns.actions}
                    </TH>
                  </tr>
                </THead>
                <tbody>
                  {visible.map((guardian) => {
                    const children = childrenOf.get(guardian.id) ?? [];
                    return (
                      <TRow key={guardian.id}>
                        <TD>
                          <Link
                            href={href(`/guardians/${guardian.id}`)}
                            className="flex items-center gap-3 group rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                          >
                            <Avatar name={guardianName(guardian)} size="sm" />
                            <span className="font-medium text-slate-900 group-hover:text-brand-600 transition-colors">
                              {guardianName(guardian)}
                            </span>
                          </Link>
                        </TD>
                        <TD className="whitespace-nowrap">{guardian.phone}</TD>
                        <TD className="text-xs">{guardian.email || '—'}</TD>
                        <TD>
                          {children.length === 0 ? (
                            <span className="text-slate-400">—</span>
                          ) : (
                            <span className="flex flex-wrap gap-1">
                              {children.map((child) => (
                                <Badge key={child.id} tone="brand">
                                  {studentName(child)} ·{' '}
                                  {classLabel(classes, child.classId)}
                                </Badge>
                              ))}
                            </span>
                          )}
                        </TD>
                        <TD>{guardian.profession || '—'}</TD>
                        <TD>
                          <StatusBadge meta={guardianStatusMeta(guardian.status)} />
                        </TD>
                        <TD className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={href(`/guardians/${guardian.id}`)}
                              aria-label={`Voir la fiche de ${guardianName(guardian)}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                            >
                              <Eye size={16} aria-hidden="true" />
                            </Link>
                            {isYearWritable && (
                              <ActionMenu
                                label={`Actions pour ${guardianName(guardian)}`}
                                actions={[
                                  {
                                    label: 'Modifier la fiche',
                                    icon: <Pencil size={16} aria-hidden="true" />,
                                    onSelect: () =>
                                      router.push(
                                        href(`/guardians/${guardian.id}/edit`),
                                      ),
                                  },
                                  {
                                    label: 'Archiver le tuteur',
                                    icon: <Archive size={16} aria-hidden="true" />,
                                    destructive: true,
                                    disabled: guardian.status === 'archive',
                                    onSelect: () => setToArchive(guardian),
                                  },
                                ]}
                              />
                            )}
                          </div>
                        </TD>
                      </TRow>
                    );
                  })}
                </tbody>
              </Table>
            </TableWrapper>

            <ul className="md:hidden space-y-3">
              {visible.map((guardian) => {
                const children = childrenOf.get(guardian.id) ?? [];
                return (
                  <li
                    key={guardian.id}
                    className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={guardianName(guardian)} size="md" />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={href(`/guardians/${guardian.id}`)}
                          className="font-medium text-slate-900 hover:text-brand-600 transition-colors block truncate"
                        >
                          {guardianName(guardian)}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {guardian.phone}
                        </p>
                      </div>
                      <StatusBadge meta={guardianStatusMeta(guardian.status)} />
                    </div>

                    <p className="text-xs text-slate-400 mt-3">
                      {m.list.children(children.length)}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {children.map((child) => (
                        <Badge key={child.id} tone="brand">
                          {studentName(child)}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <LinkButton
                        href={href(`/guardians/${guardian.id}`)}
                        variant="outline"
                        size="sm"
                        fullWidth
                      >
                        <Eye size={15} aria-hidden="true" /> {ui.view}
                      </LinkButton>
                      <Can permission="students.update" requiresWritableYear>
                        <LinkButton
                          href={href(`/guardians/${guardian.id}/edit`)}
                          variant="soft"
                          size="sm"
                          fullWidth
                        >
                          <Pencil size={15} aria-hidden="true" /> {ui.edit}
                        </LinkButton>
                      </Can>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={toArchive !== null}
        title={m.list.archiveTitle}
        message={toArchive ? m.list.archiveMessage(guardianName(toArchive)) : ''}
        confirmLabel={ui.archive}
        onCancel={() => setToArchive(null)}
        onConfirm={() => toArchive && archive(toArchive)}
      />
    </PageContainer>
  );
}
