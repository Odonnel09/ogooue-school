'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Archive,
  BookOpen,
  DoorOpen,
  Eye,
  Pencil,
  Plus,
  Users,
} from 'lucide-react';

import type { SchoolClass } from '@/types';
import { classStatusLabels, cycleLabels } from '@/i18n/fr';
import { classStatusMeta, labelOptions } from '@/lib/status';
import { useSchoolData } from '@/lib/store/school-data';
import { useAudit } from '@/lib/audit/use-audit';
import { useHref, useSimulatedLoading } from '@/lib/hooks';
import {
  classHeadcount,
  levelLabel,
  occupancyRate,
  teacherLabel,
} from '@/lib/selectors';
import {
  cycleOptions,
  levelOptions,
  yearOptions,
} from '@/lib/options';
import { matches } from '@/lib/utils';
import {
  ActionMenu,
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

export default function ClassesPage() {
  const href = useHref();
  const router = useRouter();
  const toast = useToast();
  const ready = useSimulatedLoading();
  const { classes, students, teachers, actions, config } = useSchoolData();
  const audit = useAudit();

  const [search, setSearch] = useState('');
  const [cycleFilter, setCycleFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toArchive, setToArchive] = useState<SchoolClass | null>(null);

  const visible = useMemo(
    () =>
      classes
        .filter((item) => {
          if (!matches(`${item.name} ${item.room}`, search)) return false;
          if (cycleFilter && item.cycle !== cycleFilter) return false;
          if (levelFilter && item.levelId !== levelFilter) return false;
          if (yearFilter && item.academicYear !== yearFilter) return false;
          if (statusFilter && item.status !== statusFilter) return false;
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'fr')),
    [classes, search, cycleFilter, levelFilter, yearFilter, statusFilter],
  );

  const counts = useMemo(() => {
    const active = classes.filter((item) => item.status === 'active');
    return {
      total: classes.length,
      active: active.length,
      capacity: active.reduce((total, item) => total + item.capacity, 0),
      enrolled: active.reduce(
        (total, item) => total + classHeadcount(students, item.id),
        0,
      ),
    };
  }, [classes, students]);

  const activeFilters =
    (cycleFilter ? 1 : 0) +
    (levelFilter ? 1 : 0) +
    (yearFilter ? 1 : 0) +
    (statusFilter ? 1 : 0);

  function resetFilters() {
    setCycleFilter('');
    setLevelFilter('');
    setYearFilter('');
    setStatusFilter('');
  }

  function archiveClass(schoolClass: SchoolClass) {
    actions.classes.update(schoolClass.id, { status: 'archivee' });
    audit({
      action: 'classes.archive',
      resourceType: 'Classe',
      resourceId: schoolClass.id,
      resourceLabel: schoolClass.name,
      detail: 'Classe archivée : elle disparaît des affectations sans perdre son historique.',
    });
    setToArchive(null);
    toast.success(`La classe ${schoolClass.name} a été archivée.`);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Classes"
        description="Suivez les effectifs, les capacités et l’encadrement de chaque classe."
        actions={
          <LinkButton href={href('/classes/new')}>
            <Plus size={16} /> Créer une classe
          </LinkButton>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Classes"
          value={counts.total}
          icon={<BookOpen size={22} />}
          tone="brand"
        />
        <StatCard
          label="Classes actives"
          value={counts.active}
          icon={<DoorOpen size={22} />}
          tone="green"
        />
        <StatCard
          label="Élèves inscrits"
          value={counts.enrolled}
          icon={<Users size={22} />}
          tone="blue"
        />
        <StatCard
          label="Places totales"
          value={counts.capacity}
          icon={<Users size={22} />}
          tone="orange"
          hint={`${counts.capacity - counts.enrolled} places disponibles`}
        />
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher une classe ou une salle..."
        activeCount={activeFilters}
        onReset={resetFilters}
      >
        <FilterSelect
          value={cycleFilter}
          onChange={setCycleFilter}
          options={cycleOptions()}
          placeholder="Tous les cycles"
          label="Filtrer par cycle"
        />
        <FilterSelect
          value={levelFilter}
          onChange={setLevelFilter}
          options={levelOptions(config.activeCycles)}
          placeholder="Tous les niveaux"
          label="Filtrer par niveau"
        />
        <FilterSelect
          value={yearFilter}
          onChange={setYearFilter}
          options={yearOptions()}
          placeholder="Toutes les années"
          label="Filtrer par année scolaire"
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={labelOptions(classStatusLabels)}
          placeholder="Tous les statuts"
          label="Filtrer par statut"
        />
      </FilterBar>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Liste des classes
          </h2>
          <Badge tone="brand">
            {visible.length} résultat{visible.length > 1 ? 's' : ''}
          </Badge>
        </div>

        {!ready ? (
          <TableSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            title="Aucune classe trouvée"
            message="Aucune classe ne correspond à votre recherche ou à vos filtres."
            icon={<BookOpen size={24} />}
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  resetFilters();
                }}
              >
                Réinitialiser les filtres
              </Button>
            }
          />
        ) : (
          <>
            <TableWrapper className="hidden md:block">
              <Table>
                <THead>
                  <tr>
                    <TH>Classe</TH>
                    <TH>Niveau</TH>
                    <TH>Cycle</TH>
                    <TH>Année</TH>
                    <TH>Effectif</TH>
                    <TH>Professeur principal</TH>
                    <TH>Salle</TH>
                    <TH>Statut</TH>
                    <TH className="text-right">Actions</TH>
                  </tr>
                </THead>
                <tbody>
                  {visible.map((item) => {
                    const headcount = classHeadcount(students, item.id);
                    const rate = occupancyRate(headcount, item.capacity);
                    return (
                      <TRow key={item.id}>
                        <TD>
                          <Link
                            href={href(`/classes/${item.id}`)}
                            className="font-medium text-slate-900 hover:text-brand-600 transition-colors"
                          >
                            {item.name}
                          </Link>
                        </TD>
                        <TD>{levelLabel(item.levelId)}</TD>
                        <TD>{cycleLabels[item.cycle]}</TD>
                        <TD>{item.academicYear}</TD>
                        <TD>
                          <div className="min-w-28">
                            <p className="text-xs text-slate-900 font-medium">
                              {headcount} / {item.capacity}
                            </p>
                            <div className="h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                              <div
                                className={
                                  rate >= 95
                                    ? 'h-full bg-red-500 rounded-full'
                                    : rate >= 80
                                      ? 'h-full bg-orange-500 rounded-full'
                                      : 'h-full bg-brand-500 rounded-full'
                                }
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                          </div>
                        </TD>
                        <TD>{teacherLabel(teachers, item.mainTeacherId)}</TD>
                        <TD>{item.room || '—'}</TD>
                        <TD>
                          <StatusBadge meta={classStatusMeta(item.status)} />
                        </TD>
                        <TD className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={href(`/classes/${item.id}`)}
                              aria-label={`Voir la classe ${item.name}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            >
                              <Eye size={16} />
                            </Link>
                            <ActionMenu
                              label={`Actions pour ${item.name}`}
                              actions={[
                                {
                                  label: 'Modifier la classe',
                                  icon: <Pencil size={16} />,
                                  onSelect: () =>
                                    router.push(href(`/classes/${item.id}/edit`)),
                                },
                                {
                                  label: 'Archiver la classe',
                                  icon: <Archive size={16} />,
                                  destructive: true,
                                  disabled: item.status === 'archivee',
                                  onSelect: () => setToArchive(item),
                                },
                              ]}
                            />
                          </div>
                        </TD>
                      </TRow>
                    );
                  })}
                </tbody>
              </Table>
            </TableWrapper>

            <ul className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visible.map((item) => {
                const headcount = classHeadcount(students, item.id);
                const rate = occupancyRate(headcount, item.capacity);
                return (
                  <li
                    key={item.id}
                    className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={href(`/classes/${item.id}`)}
                          className="font-medium text-slate-900 hover:text-brand-600 transition-colors block truncate"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {levelLabel(item.levelId)} · {cycleLabels[item.cycle]}
                        </p>
                      </div>
                      <StatusBadge meta={classStatusMeta(item.status)} />
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Effectif</span>
                        <span className="text-slate-900 font-medium">
                          {headcount} / {item.capacity}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={
                            rate >= 95
                              ? 'h-full bg-red-500 rounded-full'
                              : rate >= 80
                                ? 'h-full bg-orange-500 rounded-full'
                                : 'h-full bg-brand-500 rounded-full'
                          }
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-xs">
                      <div>
                        <dt className="text-slate-400">Professeur principal</dt>
                        <dd className="text-slate-900 mt-0.5">
                          {teacherLabel(teachers, item.mainTeacherId)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">Salle</dt>
                        <dd className="text-slate-900 mt-0.5">
                          {item.room || '—'}
                        </dd>
                      </div>
                    </dl>

                    <div className="flex gap-2 mt-4">
                      <LinkButton
                        href={href(`/classes/${item.id}`)}
                        variant="outline"
                        size="sm"
                        fullWidth
                      >
                        <Eye size={15} /> Voir
                      </LinkButton>
                      <LinkButton
                        href={href(`/classes/${item.id}/edit`)}
                        variant="soft"
                        size="sm"
                        fullWidth
                      >
                        <Pencil size={15} /> Modifier
                      </LinkButton>
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
        title="Archiver cette classe ?"
        message={
          toArchive
            ? `La classe ${toArchive.name} passera au statut « Archivée ». Elle ne sera plus proposée lors des affectations d’élèves.`
            : ''
        }
        confirmLabel="Archiver"
        onCancel={() => setToArchive(null)}
        onConfirm={() => toArchive && archiveClass(toArchive)}
      />
    </PageContainer>
  );
}
