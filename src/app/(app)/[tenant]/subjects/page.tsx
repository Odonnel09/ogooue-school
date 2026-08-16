'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Archive, BookOpen, Clock, Eye, Layers, Pencil, Plus } from 'lucide-react';

import type { Subject } from '@/types';
import { cycleLabels, subjectStatusLabels } from '@/i18n/fr';
import { labelOptions, subjectStatusMeta } from '@/lib/status';
import { useSchoolData } from '@/lib/store/school-data';
import { useAudit } from '@/lib/audit/use-audit';
import { useHref, useSimulatedLoading } from '@/lib/hooks';
import { classesOfSubject, levelLabel, teacherLabel } from '@/lib/selectors';
import { useCapabilities } from '@/lib/school-levels/use-capabilities';
import {
  cycleOptions,
  levelOptions,
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

export default function SubjectsPage() {
  const href = useHref();
  const router = useRouter();
  const toast = useToast();
  const ready = useSimulatedLoading();
  const { subjects, teachers, classSubjects, actions, config } = useSchoolData();
  const audit = useAudit();
  const capabilities = useCapabilities();

  const [search, setSearch] = useState('');
  const [cycleFilter, setCycleFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toArchive, setToArchive] = useState<Subject | null>(null);

  const visible = useMemo(
    () =>
      subjects
        .filter((subject) => {
          if (!matches(`${subject.code} ${subject.name}`, search)) return false;
          if (cycleFilter && subject.cycle !== cycleFilter) return false;
          if (levelFilter && !subject.levelIds.includes(levelFilter)) return false;
          if (statusFilter && subject.status !== statusFilter) return false;
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'fr')),
    [subjects, search, cycleFilter, levelFilter, statusFilter],
  );

  /**
   * La colonne ECTS n'est pas affichée « si le cycle vaut supérieur » : elle
   * l'est si un cycle ouvert dans l'établissement déclare porter des crédits.
   */
  const showEcts = capabilities.hasAny('hasCredits');

  const counts = useMemo(
    () => ({
      total: subjects.length,
      active: subjects.filter((item) => item.status === 'active').length,
      links: classSubjects.length,
    }),
    [subjects, classSubjects],
  );

  const activeFilters =
    (cycleFilter ? 1 : 0) + (levelFilter ? 1 : 0) + (statusFilter ? 1 : 0);

  function resetFilters() {
    setCycleFilter('');
    setLevelFilter('');
    setStatusFilter('');
  }

  function archiveSubject(subject: Subject) {
    actions.subjects.update(subject.id, { status: 'archivee' });
    audit({
      action: 'subjects.archive',
      resourceType: 'Matière',
      resourceId: subject.id,
      resourceLabel: subject.name,
      detail: 'Matière archivée : elle n’est plus proposée aux nouvelles évaluations.',
    });
    setToArchive(null);
    toast.success(`La matière ${subject.name} a été archivée.`);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Matières"
        description="Catalogue des matières, coefficients et volumes horaires par cycle."
        actions={
          <LinkButton href={href('/subjects/new')}>
            <Plus size={16} /> Ajouter une matière
          </LinkButton>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          label="Matières"
          value={counts.total}
          icon={<BookOpen size={22} />}
          tone="brand"
        />
        <StatCard
          label="Actives"
          value={counts.active}
          icon={<Layers size={22} />}
          tone="green"
        />
        <StatCard
          label="Rattachements aux classes"
          value={counts.links}
          icon={<Clock size={22} />}
          tone="orange"
        />
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher une matière ou un code..."
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
          value={statusFilter}
          onChange={setStatusFilter}
          options={labelOptions(subjectStatusLabels)}
          placeholder="Tous les statuts"
          label="Filtrer par statut"
        />
      </FilterBar>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Catalogue des matières
          </h2>
          <Badge tone="brand">
            {visible.length} résultat{visible.length > 1 ? 's' : ''}
          </Badge>
        </div>

        {!ready ? (
          <TableSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            title="Aucune matière trouvée"
            message="Aucune matière ne correspond à votre recherche ou à vos filtres."
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
                    <TH>Code</TH>
                    <TH>Nom</TH>
                    <TH>Niveaux</TH>
                    <TH>Cycle</TH>
                    <TH>Enseignant responsable</TH>
                    <TH>Classes</TH>
                    {showEcts && <TH>ECTS</TH>}
                    <TH>Statut</TH>
                    <TH className="text-right">Actions</TH>
                  </tr>
                </THead>
                <tbody>
                  {visible.map((subject) => (
                    <TRow key={subject.id}>
                      <TD className="font-mono text-xs text-slate-900">
                        {subject.code}
                      </TD>
                      <TD>
                        <Link
                          href={href(`/subjects/${subject.id}`)}
                          className="font-medium text-slate-900 hover:text-brand-600 transition-colors"
                        >
                          {subject.name}
                        </Link>
                      </TD>
                      <TD className="text-xs max-w-48 truncate">
                        {subject.levelIds
                          .map((levelId) => levelLabel(levelId))
                          .join(', ')}
                      </TD>
                      <TD>{cycleLabels[subject.cycle]}</TD>
                      <TD>{teacherLabel(teachers, subject.teacherId)}</TD>
                      <TD className="whitespace-nowrap">
                        {classesOfSubject(classSubjects, subject.id).length}
                      </TD>
                      {showEcts && (
                        <TD>
                          {subject.ectsCredits > 0
                            ? `${subject.ectsCredits} crédits`
                            : '—'}
                        </TD>
                      )}
                      <TD>
                        <StatusBadge meta={subjectStatusMeta(subject.status)} />
                      </TD>
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={href(`/subjects/${subject.id}`)}
                            aria-label={`Voir la matière ${subject.name}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          >
                            <Eye size={16} />
                          </Link>
                          <ActionMenu
                            label={`Actions pour ${subject.name}`}
                            actions={[
                              {
                                label: 'Modifier la matière',
                                icon: <Pencil size={16} />,
                                onSelect: () =>
                                  router.push(href(`/subjects/${subject.id}/edit`)),
                              },
                              {
                                label: 'Archiver la matière',
                                icon: <Archive size={16} />,
                                destructive: true,
                                disabled: subject.status === 'archivee',
                                onSelect: () => setToArchive(subject),
                              },
                            ]}
                          />
                        </div>
                      </TD>
                    </TRow>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>

            <ul className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visible.map((subject) => (
                <li
                  key={subject.id}
                  className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={href(`/subjects/${subject.id}`)}
                        className="font-medium text-slate-900 hover:text-brand-600 transition-colors block truncate"
                      >
                        {subject.name}
                      </Link>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {subject.code}
                      </p>
                    </div>
                    <StatusBadge meta={subjectStatusMeta(subject.status)} />
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <Badge tone="blue">{cycleLabels[subject.cycle]}</Badge>
                    <Badge tone="slate">
                      {classesOfSubject(classSubjects, subject.id).length} classes
                    </Badge>
                    {showEcts && subject.ectsCredits > 0 && (
                      <Badge tone="brand">{subject.ectsCredits} ECTS</Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-3">
                    {teacherLabel(teachers, subject.teacherId)}
                  </p>

                  <div className="flex gap-2 mt-4">
                    <LinkButton
                      href={href(`/subjects/${subject.id}`)}
                      variant="outline"
                      size="sm"
                      fullWidth
                    >
                      <Eye size={15} /> Voir
                    </LinkButton>
                    <LinkButton
                      href={href(`/subjects/${subject.id}/edit`)}
                      variant="soft"
                      size="sm"
                      fullWidth
                    >
                      <Pencil size={15} /> Modifier
                    </LinkButton>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={toArchive !== null}
        title="Archiver cette matière ?"
        message={
          toArchive
            ? `La matière ${toArchive.name} ne sera plus proposée lors de la création d’évaluations ou de créneaux. Les données passées sont conservées.`
            : ''
        }
        confirmLabel="Archiver"
        onCancel={() => setToArchive(null)}
        onConfirm={() => toArchive && archiveSubject(toArchive)}
      />
    </PageContainer>
  );
}
