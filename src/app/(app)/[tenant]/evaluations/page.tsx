'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Eye,
  FileText,
  Pencil,
  Plus,
  Send,
  Trash2,
  Users,
} from 'lucide-react';

import type { Evaluation } from '@/types';
import { evaluationStatusLabels, evaluationTypeLabels } from '@/i18n/fr';
import { evaluationStatusMeta, labelOptions } from '@/lib/status';
import { useSchoolData } from '@/lib/store/school-data';
import { useHref, useSimulatedLoading } from '@/lib/hooks';
import {
  classLabel,
  periodLabel,
  subjectLabel,
  teacherLabel,
} from '@/lib/selectors';
import { evaluationStats } from '@/features/evaluations/queries';
import { useCapabilities } from '@/lib/school-levels/use-capabilities';
import {
  classOptions,
  periodOptions,
  subjectOptions,
} from '@/lib/options';
import { formatDate, matches } from '@/lib/utils';
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

export default function EvaluationsPage() {
  const href = useHref();
  const router = useRouter();
  const toast = useToast();
  const ready = useSimulatedLoading();
  const { evaluations, classes, subjects, teachers, actions, config } =
    useSchoolData();
  const capabilities = useCapabilities();

  /** Configuration de notation applicable à l'évaluation, via sa classe. */
  const configOf = (classId: string) => {
    const target = classes.find((item) => item.id === classId);
    return target
      ? capabilities.gradingConfigForClass(target)
      : capabilities.gradingConfigForCycle(config.activeCycles[0]);
  };

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [toDelete, setToDelete] = useState<Evaluation | null>(null);

  const visible = useMemo(
    () =>
      evaluations
        .filter((evaluation) => {
          if (!matches(evaluation.name, search)) return false;
          if (statusFilter && evaluation.status !== statusFilter) return false;
          if (classFilter && evaluation.classId !== classFilter) return false;
          if (subjectFilter && evaluation.subjectId !== subjectFilter) return false;
          if (periodFilter && evaluation.periodId !== periodFilter) return false;
          return true;
        })
        .sort((a, b) => b.date.localeCompare(a.date)),
    [evaluations, search, statusFilter, classFilter, subjectFilter, periodFilter],
  );

  const counts = useMemo(
    () => ({
      total: evaluations.length,
      pending: evaluations.filter(
        (item) =>
          item.status === 'in_progress' ||
          item.status === 'submitted',
      ).length,
      published: evaluations.filter((item) => item.status === 'published').length,
    }),
    [evaluations],
  );

  const activeFilters =
    (statusFilter ? 1 : 0) +
    (classFilter ? 1 : 0) +
    (subjectFilter ? 1 : 0) +
    (periodFilter ? 1 : 0);

  function resetFilters() {
    setStatusFilter('');
    setClassFilter('');
    setSubjectFilter('');
    setPeriodFilter('');
  }

  function publish(evaluation: Evaluation) {
    actions.evaluations.update(evaluation.id, { status: 'published' });
    toast.success(`« ${evaluation.name} » a été publiée.`);
  }

  function removeEvaluation(evaluation: Evaluation) {
    actions.evaluations.remove(evaluation.id);
    setToDelete(null);
    toast.success(`L’évaluation « ${evaluation.name} » a été supprimée.`);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Évaluations"
        description="Créez les devoirs et contrôles, suivez la saisie des notes et publiez les résultats."
        actions={
          <LinkButton href={href('/evaluations/new')}>
            <Plus size={16} /> Nouvelle évaluation
          </LinkButton>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          label="Évaluations"
          value={counts.total}
          icon={<FileText size={22} />}
          tone="brand"
        />
        <StatCard
          label="Saisie en cours"
          value={counts.pending}
          icon={<Pencil size={22} />}
          tone="red"
        />
        <StatCard
          label="Publiées"
          value={counts.published}
          icon={<CheckCircle2 size={22} />}
          tone="green"
        />
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher une évaluation..."
        activeCount={activeFilters}
        onReset={resetFilters}
      >
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={labelOptions(evaluationStatusLabels)}
          placeholder="Tous les statuts"
          label="Filtrer par statut"
        />
        <FilterSelect
          value={classFilter}
          onChange={setClassFilter}
          options={classOptions(classes)}
          placeholder="Toutes les classes"
          label="Filtrer par classe"
        />
        <FilterSelect
          value={subjectFilter}
          onChange={setSubjectFilter}
          options={subjectOptions(subjects)}
          placeholder="Toutes les matières"
          label="Filtrer par matière"
        />
        <FilterSelect
          value={periodFilter}
          onChange={setPeriodFilter}
          options={periodOptions(config.periods, config.activeCycles)}
          placeholder="Toutes les périodes"
          label="Filtrer par période"
        />
      </FilterBar>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Liste des évaluations
          </h2>
          <Badge tone="brand">
            {visible.length} résultat{visible.length > 1 ? 's' : ''}
          </Badge>
        </div>

        {!ready ? (
          <TableSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            title="Aucune évaluation trouvée"
            message={
              evaluations.length === 0
                ? 'Aucune évaluation n’a encore été créée. Commencez par en créer une.'
                : 'Aucune évaluation ne correspond à votre recherche ou à vos filtres.'
            }
            icon={<FileText size={24} />}
            action={
              activeFilters > 0 || search ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    resetFilters();
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              ) : (
                <LinkButton href={href('/evaluations/new')}>
                  <Plus size={16} /> Nouvelle évaluation
                </LinkButton>
              )
            }
          />
        ) : (
          <>
            <TableWrapper className="hidden lg:block">
              <Table>
                <THead>
                  <tr>
                    <TH>Évaluation</TH>
                    <TH>Matière</TH>
                    <TH>Classe</TH>
                    <TH>Enseignant</TH>
                    <TH>Période</TH>
                    <TH>Date</TH>
                    <TH>Type</TH>
                    <TH>Élèves</TH>
                    <TH>Statut</TH>
                    <TH className="text-right">Actions</TH>
                  </tr>
                </THead>
                <tbody>
                  {visible.map((evaluation) => {
                    const stats = evaluationStats(evaluation, configOf(evaluation.classId));
                    return (
                      <TRow key={evaluation.id}>
                        <TD>
                          <Link
                            href={href(`/evaluations/${evaluation.id}`)}
                            className="font-medium text-slate-900 hover:text-brand-600 transition-colors"
                          >
                            {evaluation.name}
                          </Link>
                        </TD>
                        <TD>{subjectLabel(subjects, evaluation.subjectId)}</TD>
                        <TD>{classLabel(classes, evaluation.classId)}</TD>
                        <TD>{teacherLabel(teachers, evaluation.teacherId)}</TD>
                        <TD>{periodLabel(config.periods, evaluation.periodId)}</TD>
                        <TD className="whitespace-nowrap">
                          {formatDate(evaluation.date)}
                        </TD>
                        <TD>{evaluationTypeLabels[evaluation.type]}</TD>
                        <TD className="whitespace-nowrap">
                          {stats.filled}/{stats.total}
                        </TD>
                        <TD>
                          <StatusBadge
                            meta={evaluationStatusMeta(evaluation.status)}
                          />
                        </TD>
                        <TD className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={href(`/evaluations/${evaluation.id}`)}
                              aria-label={`Ouvrir ${evaluation.name}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            >
                              <Eye size={16} />
                            </Link>
                            <ActionMenu
                              label={`Actions pour ${evaluation.name}`}
                              actions={[
                                {
                                  label: 'Modifier l’évaluation',
                                  icon: <Pencil size={16} />,
                                  onSelect: () =>
                                    router.push(
                                      href(`/evaluations/${evaluation.id}/edit`),
                                    ),
                                },
                                {
                                  label: 'Publier les résultats',
                                  icon: <Send size={16} />,
                                  disabled: evaluation.status === 'published',
                                  onSelect: () => publish(evaluation),
                                },
                                {
                                  label: 'Supprimer l’évaluation',
                                  icon: <Trash2 size={16} />,
                                  destructive: true,
                                  onSelect: () => setToDelete(evaluation),
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

            <ul className="lg:hidden space-y-3">
              {visible.map((evaluation) => {
                const stats = evaluationStats(evaluation, configOf(evaluation.classId));
                return (
                  <li
                    key={evaluation.id}
                    className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={href(`/evaluations/${evaluation.id}`)}
                          className="font-medium text-slate-900 hover:text-brand-600 transition-colors block"
                        >
                          {evaluation.name}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {subjectLabel(subjects, evaluation.subjectId)} ·{' '}
                          {classLabel(classes, evaluation.classId)}
                        </p>
                      </div>
                      <StatusBadge
                        meta={evaluationStatusMeta(evaluation.status)}
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <Badge tone="blue">
                        {evaluationTypeLabels[evaluation.type]}
                      </Badge>
                      <Badge tone="slate">{periodLabel(config.periods, evaluation.periodId)}</Badge>
                      <Badge tone="orange">{formatDate(evaluation.date)}</Badge>
                      <Badge tone="brand">
                        {stats.filled}/{stats.total} notes
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
                      <Users size={13} />{' '}
                      {teacherLabel(teachers, evaluation.teacherId)}
                    </p>

                    <div className="flex gap-2 mt-4">
                      <LinkButton
                        href={href(`/evaluations/${evaluation.id}`)}
                        variant="outline"
                        size="sm"
                        fullWidth
                      >
                        <Eye size={15} /> Ouvrir
                      </LinkButton>
                      <LinkButton
                        href={href(`/evaluations/${evaluation.id}/edit`)}
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
        open={toDelete !== null}
        title="Supprimer cette évaluation ?"
        message={
          toDelete
            ? `L’évaluation « ${toDelete.name} » et les ${toDelete.grades.length} notes associées seront définitivement supprimées.`
            : ''
        }
        confirmLabel="Supprimer"
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && removeEvaluation(toDelete)}
      />
    </PageContainer>
  );
}
