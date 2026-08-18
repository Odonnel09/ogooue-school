'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Archive,
  Download,
  Eye,
  GraduationCap,
  Pencil,
  Plus,
  UserCheck,
  UserRoundX,
  Users,
  Upload,
} from 'lucide-react';
import type {
  Guardian,
  GuardianLink,
  Level,
  SchoolClass,
  Student,
} from '@/types';
import { studentStatusLabels, ui } from '@/i18n/fr';
import { Can, useSession } from '@/lib/auth/session';
import { useHref } from '@/lib/hooks';
import {
  classLabel,
  guardianLabel,
  guardianPhone,
  studentName,
} from '@/lib/selectors';
import { classOptions } from '@/lib/options';
import { labelOptions, studentStatusMeta } from '@/lib/status';
import { downloadCsv } from '@/lib/export';
import { matches } from '@/lib/utils';
import {
  archiveStudent as archiveStudentAction,
  archiveStudents,
  logStudentExport,
} from '../actions';
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
import { studentMessages as m } from '@/features/students/messages';

type SortKey = 'name-asc' | 'name-desc' | 'matricule' | 'class' | 'recent';

const SORT_OPTIONS = [
  { value: 'name-asc', label: m.list.sort.nameAsc },
  { value: 'name-desc', label: m.list.sort.nameDesc },
  { value: 'matricule', label: m.list.sort.matricule },
  { value: 'class', label: m.list.sort.classroom },
  { value: 'recent', label: m.list.sort.recent },
];

/**
 * Liste des élèves.
 *
 * Les données arrivent **du serveur**, déjà filtrées par les politiques RLS :
 * ce composant ne sait pas interroger la base et n'a pas à le savoir. Il
 * filtre, trie et met en forme ; les écritures repartent en Server Actions.
 *
 * La différence avec la version de démonstration n'est pas visible à l'écran,
 * et c'est le but : seules les sources ont changé.
 */
export function StudentsView({
  tenantSlug,
  students,
  classes,
  levels,
  guardians,
  guardianLinks,
}: {
  tenantSlug: string;
  students: Student[];
  classes: SchoolClass[];
  levels: Level[];
  guardians: Guardian[];
  guardianLinks: GuardianLink[];
}) {
  const href = useHref();
  const router = useRouter();

  /** Libellé d'un niveau, résolu depuis la liste reçue du serveur. */
  const levelLabel = (id: string) =>
    levels.find((level) => level.id === id)?.label ?? '—';

  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const { can, isYearWritable } = useSession();

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [sort, setSort] = useState<SortKey>('name-asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [toArchive, setToArchive] = useState<Student | null>(null);
  const [bulkArchive, setBulkArchive] = useState(false);

  const canWrite = isYearWritable && can('students.update');

  const visible = useMemo(() => {
    const filtered = students.filter((student) => {
      const haystack = `${student.firstName} ${student.lastName} ${student.matricule}`;
      if (!matches(haystack, search)) return false;
      if (classFilter && student.classId !== classFilter) return false;
      if (statusFilter && student.status !== statusFilter) return false;
      if (levelFilter && student.levelId !== levelFilter) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      switch (sort) {
        case 'name-desc':
          return studentName(b).localeCompare(studentName(a), 'fr');
        case 'matricule':
          return a.matricule.localeCompare(b.matricule, 'fr');
        case 'class':
          return classLabel(classes, a.classId).localeCompare(
            classLabel(classes, b.classId),
            'fr',
          );
        case 'recent':
          return b.createdAt.localeCompare(a.createdAt);
        default:
          return studentName(a).localeCompare(studentName(b), 'fr');
      }
    });
  }, [students, search, classFilter, statusFilter, levelFilter, sort, classes]);

  const counts = useMemo(
    () => ({
      total: students.length,
      actif: students.filter((item) => item.status === 'actif').length,
      attente: students.filter((item) => item.status === 'en_attente').length,
      archive: students.filter((item) => item.status === 'archive').length,
    }),
    [students],
  );

  const activeFilters =
    (classFilter ? 1 : 0) + (statusFilter ? 1 : 0) + (levelFilter ? 1 : 0);

  function resetFilters() {
    setClassFilter('');
    setStatusFilter('');
    setLevelFilter('');
  }

  function toggleSelection(id: string) {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  }

  function toggleAll() {
    setSelected((previous) =>
      previous.length === visible.length ? [] : visible.map((item) => item.id),
    );
  }

  function archiveStudent(student: Student) {
    setToArchive(null);
    startTransition(async () => {
      const result = await archiveStudentAction(tenantSlug, student.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setSelected((previous) => previous.filter((id) => id !== student.id));
      toast.success(m.detail.archived(studentName(student)));
      // La revalidation a lieu côté serveur ; on rafraîchit la vue.
      router.refresh();
    });
  }

  function archiveSelection() {
    const ids = selected;
    setBulkArchive(false);
    startTransition(async () => {
      const result = await archiveStudents(tenantSlug, ids);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setSelected([]);
      toast.success(result.success ?? '');
      router.refresh();
    });
  }

  function exportCsv() {
    downloadCsv(
      'eleves-ogooue-school.csv',
      [
        m.list.columns.matricule,
        'Nom',
        'Prénom',
        m.list.columns.classroom,
        m.list.columns.level,
        m.list.columns.guardian,
        m.list.columns.phone,
        m.list.columns.status,
      ],
      visible.map((student) => [
        student.matricule,
        student.lastName,
        student.firstName,
        classLabel(classes, student.classId),
        levelLabel(student.levelId),
        guardianLabel(guardians, guardianLinks, student.id),
        guardianPhone(guardians, guardianLinks, student.id),
        studentStatusLabels[student.status],
      ]),
    );
    // Le fichier est produit dans le navigateur, la trace est écrite par le
    // serveur : lui seul peut garantir qu'elle part.
    void logStudentExport(tenantSlug, visible.length);
    toast.success(`Export de ${visible.length} élèves généré.`);
  }

  return (
    <PageContainer>
      <PageHeader
        title={m.list.title}
        description={m.list.description}
        actions={
          <>
            <Can permission="students.export">
              <Button
                variant="outline"
                onClick={exportCsv}
                disabled={visible.length === 0}
              >
                <Download size={16} aria-hidden="true" /> {m.list.export}
              </Button>
            </Can>
            <Can permission="students.create" requiresWritableYear>
              <LinkButton href={href('/students/import')} variant="outline">
                <Upload size={16} aria-hidden="true" /> {m.list.import}
              </LinkButton>
            </Can>
            <Can permission="students.create" requiresWritableYear>
              <LinkButton href={href('/students/new')}>
                <Plus size={16} aria-hidden="true" /> {m.list.add}
              </LinkButton>
            </Can>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label={m.list.stats.total}
          value={counts.total}
          icon={<Users size={22} aria-hidden="true" />}
          tone="brand"
        />
        <StatCard
          label={m.list.stats.active}
          value={counts.actif}
          icon={<UserCheck size={22} aria-hidden="true" />}
          tone="green"
        />
        <StatCard
          label={m.list.stats.pending}
          value={counts.attente}
          icon={<GraduationCap size={22} aria-hidden="true" />}
          tone="yellow"
        />
        <StatCard
          label={m.list.stats.archived}
          value={counts.archive}
          icon={<UserRoundX size={22} aria-hidden="true" />}
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
          value={classFilter}
          onChange={setClassFilter}
          options={classOptions(classes)}
          placeholder={m.list.filters.allClasses}
        />
        <FilterSelect
          value={levelFilter}
          onChange={setLevelFilter}
          options={levels.map((level) => ({ value: level.id, label: level.label }))}
          placeholder={m.list.filters.allLevels}
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={labelOptions(studentStatusLabels)}
          placeholder={m.list.filters.allStatuses}
        />
        <FilterSelect
          value={sort}
          onChange={(value) => setSort((value || 'name-asc') as SortKey)}
          options={SORT_OPTIONS}
          placeholder={m.list.filters.sort}
        />
      </FilterBar>

      {selected.length > 0 && canWrite && (
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-brand-700 font-medium">
            {m.list.bulk.selected(selected.length)}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
              {m.list.bulk.clear}
            </Button>
            <Button
              variant="dangerSoft"
              size="sm"
              onClick={() => setBulkArchive(true)}
            >
              <Archive size={15} aria-hidden="true" /> {m.list.bulk.archive}
            </Button>
          </div>
        </div>
      )}

      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {m.list.tableTitle}
          </h2>
          <Badge tone="brand">{ui.results(visible.length)}</Badge>
        </div>

        {pending ? (
          <TableSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            title={m.list.emptyTitle}
            message={
              students.length === 0 ? m.list.emptyInitial : m.list.emptyFiltered
            }
            icon={<Users size={24} aria-hidden="true" />}
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
                  <LinkButton href={href('/students/new')}>
                    <Plus size={16} aria-hidden="true" /> {m.list.add}
                  </LinkButton>
                </Can>
              )
            }
          />
        ) : (
          <>
            {/* Tableau — à partir de la tablette */}
            <TableWrapper className="hidden md:block">
              <Table>
                <THead>
                  <tr>
                    {canWrite && (
                      <TH scope="col" className="w-10">
                        <input
                          type="checkbox"
                          aria-label={ui.selectAll}
                          checked={selected.length === visible.length}
                          onChange={toggleAll}
                          className="h-4 w-4 rounded border-slate-300 accent-brand-600 cursor-pointer"
                        />
                      </TH>
                    )}
                    <TH scope="col">{m.list.columns.student}</TH>
                    <TH scope="col">{m.list.columns.matricule}</TH>
                    <TH scope="col">{m.list.columns.classroom}</TH>
                    <TH scope="col">{m.list.columns.level}</TH>
                    <TH scope="col">{m.list.columns.guardian}</TH>
                    <TH scope="col">{m.list.columns.phone}</TH>
                    <TH scope="col">{m.list.columns.status}</TH>
                    <TH scope="col" className="text-right">
                      {m.list.columns.actions}
                    </TH>
                  </tr>
                </THead>
                <tbody>
                  {visible.map((student) => (
                    <TRow
                      key={student.id}
                      highlighted={selected.includes(student.id)}
                    >
                      {canWrite && (
                        <TD>
                          <input
                            type="checkbox"
                            aria-label={`Sélectionner ${studentName(student)}`}
                            checked={selected.includes(student.id)}
                            onChange={() => toggleSelection(student.id)}
                            className="h-4 w-4 rounded border-slate-300 accent-brand-600 cursor-pointer"
                          />
                        </TD>
                      )}
                      <TD>
                        <Link
                          href={href(`/students/${student.id}`)}
                          className="flex items-center gap-3 group rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                        >
                          <Avatar
                            name={studentName(student)}
                            src={student.photoUrl}
                            size="sm"
                          />
                          <span className="font-medium text-slate-900 group-hover:text-brand-600 transition-colors">
                            {studentName(student)}
                          </span>
                        </Link>
                      </TD>
                      <TD className="font-mono text-xs">{student.matricule}</TD>
                      <TD>{classLabel(classes, student.classId)}</TD>
                      <TD>{levelLabel(student.levelId)}</TD>
                      <TD>{guardianLabel(guardians, guardianLinks, student.id)}</TD>
                      <TD className="whitespace-nowrap">
                        {guardianPhone(guardians, guardianLinks, student.id)}
                      </TD>
                      <TD>
                        <StatusBadge meta={studentStatusMeta(student.status)} />
                      </TD>
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={href(`/students/${student.id}`)}
                            aria-label={`Voir la fiche de ${studentName(student)}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                          >
                            <Eye size={16} aria-hidden="true" />
                          </Link>
                          <Can permission="students.update" requiresWritableYear>
                            <Link
                              href={href(`/students/${student.id}/edit`)}
                              aria-label={`Modifier ${studentName(student)}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                            >
                              <Pencil size={16} aria-hidden="true" />
                            </Link>
                          </Can>
                          <Can permission="students.delete" requiresWritableYear>
                            <ActionMenu
                              label={`Actions pour ${studentName(student)}`}
                              actions={[
                                {
                                  label: m.detail.tabs.infos,
                                  icon: <Eye size={16} aria-hidden="true" />,
                                  onSelect: () =>
                                    router.push(href(`/students/${student.id}`)),
                                },
                                {
                                  label: 'Archiver l’élève',
                                  icon: <Archive size={16} aria-hidden="true" />,
                                  destructive: true,
                                  disabled: student.status === 'archive',
                                  onSelect: () => setToArchive(student),
                                },
                              ]}
                            />
                          </Can>
                        </div>
                      </TD>
                    </TRow>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>

            {/* Cartes — téléphone */}
            <ul className="md:hidden space-y-3">
              {visible.map((student) => (
                <li
                  key={student.id}
                  className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={studentName(student)}
                      src={student.photoUrl}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={href(`/students/${student.id}`)}
                        className="font-medium text-slate-900 hover:text-brand-600 transition-colors block truncate"
                      >
                        {studentName(student)}
                      </Link>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {student.matricule}
                      </p>
                    </div>
                    <StatusBadge meta={studentStatusMeta(student.status)} />
                  </div>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-xs">
                    <div>
                      <dt className="text-slate-400">{m.list.columns.classroom}</dt>
                      <dd className="text-slate-900 mt-0.5">
                        {classLabel(classes, student.classId)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">{m.list.columns.level}</dt>
                      <dd className="text-slate-900 mt-0.5">
                        {levelLabel(student.levelId)}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-slate-400">{m.list.columns.guardian}</dt>
                      <dd className="text-slate-900 mt-0.5">
                        {guardianLabel(guardians, guardianLinks, student.id)}
                        <span className="text-slate-500">
                          {' '}
                          · {guardianPhone(guardians, guardianLinks, student.id)}
                        </span>
                      </dd>
                    </div>
                  </dl>

                  <div className="flex gap-2 mt-4">
                    <LinkButton
                      href={href(`/students/${student.id}`)}
                      variant="outline"
                      size="sm"
                      fullWidth
                    >
                      <Eye size={15} aria-hidden="true" /> {ui.view}
                    </LinkButton>
                    <Can permission="students.update" requiresWritableYear>
                      <LinkButton
                        href={href(`/students/${student.id}/edit`)}
                        variant="soft"
                        size="sm"
                        fullWidth
                      >
                        <Pencil size={15} aria-hidden="true" /> {ui.edit}
                      </LinkButton>
                    </Can>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={toArchive !== null}
        title={m.list.archiveTitle}
        message={toArchive ? m.list.archiveMessage(studentName(toArchive)) : ''}
        confirmLabel={ui.archive}
        onCancel={() => setToArchive(null)}
        onConfirm={() => toArchive && archiveStudent(toArchive)}
      />

      <ConfirmDialog
        open={bulkArchive}
        title={m.list.bulk.confirmTitle}
        message={m.list.bulk.confirmMessage(selected.length)}
        confirmLabel={m.list.bulk.archive}
        onCancel={() => setBulkArchive(false)}
        onConfirm={archiveSelection}
      />
    </PageContainer>
  );
}
