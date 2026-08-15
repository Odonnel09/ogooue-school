'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Archive,
  BookOpen,
  Eye,
  Mail,
  Pencil,
  Phone,
  Plus,
  UserCheck,
  Users,
} from 'lucide-react';

import type { Teacher } from '@/types';
import { teacherStatusLabels } from '@/i18n/fr';
import { labelOptions, teacherStatusMeta } from '@/lib/status';
import { useSchoolData } from '@/lib/store/school-data';
import { useHref, useSimulatedLoading } from '@/lib/hooks';
import { classLabel, teacherName } from '@/lib/selectors';
import {
  classOptions,
  subjectOptions,
} from '@/lib/options';
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

export default function TeachersPage() {
  const href = useHref();
  const router = useRouter();
  const toast = useToast();
  const ready = useSimulatedLoading();
  const { teachers, subjects, classes, actions } = useSchoolData();

  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toArchive, setToArchive] = useState<Teacher | null>(null);

  const subjectName = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject.name])),
    [subjects],
  );

  const visible = useMemo(
    () =>
      teachers
        .filter((teacher) => {
          const haystack = `${teacher.firstName} ${teacher.lastName} ${teacher.matricule} ${teacher.email}`;
          if (!matches(haystack, search)) return false;
          if (subjectFilter && !teacher.subjectIds.includes(subjectFilter)) {
            return false;
          }
          if (classFilter && !teacher.classIds.includes(classFilter)) return false;
          if (statusFilter && teacher.status !== statusFilter) return false;
          return true;
        })
        .sort((a, b) => teacherName(a).localeCompare(teacherName(b), 'fr')),
    [teachers, search, subjectFilter, classFilter, statusFilter],
  );

  const counts = useMemo(
    () => ({
      total: teachers.length,
      actif: teachers.filter((item) => item.status === 'actif').length,
      subjects: new Set(teachers.flatMap((item) => item.subjectIds)).size,
    }),
    [teachers],
  );

  const activeFilters =
    (subjectFilter ? 1 : 0) + (classFilter ? 1 : 0) + (statusFilter ? 1 : 0);

  function resetFilters() {
    setSubjectFilter('');
    setClassFilter('');
    setStatusFilter('');
  }

  function archiveTeacher(teacher: Teacher) {
    actions.teachers.update(teacher.id, { status: 'archive' });
    setToArchive(null);
    toast.success(`${teacherName(teacher)} a été archivé.`);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Enseignants"
        description="Gérez le corps enseignant, les matières couvertes et les classes affectées."
        actions={
          <LinkButton href={href('/teachers/new')}>
            <Plus size={16} /> Ajouter un enseignant
          </LinkButton>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          label="Total enseignants"
          value={counts.total}
          icon={<Users size={22} />}
          tone="blue"
        />
        <StatCard
          label="En activité"
          value={counts.actif}
          icon={<UserCheck size={22} />}
          tone="green"
        />
        <StatCard
          label="Matières couvertes"
          value={counts.subjects}
          icon={<BookOpen size={22} />}
          tone="brand"
        />
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un enseignant..."
        activeCount={activeFilters}
        onReset={resetFilters}
      >
        <FilterSelect
          value={subjectFilter}
          onChange={setSubjectFilter}
          options={subjectOptions(subjects)}
          placeholder="Toutes les matières"
          label="Filtrer par matière"
        />
        <FilterSelect
          value={classFilter}
          onChange={setClassFilter}
          options={classOptions(classes)}
          placeholder="Toutes les classes"
          label="Filtrer par classe"
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={labelOptions(teacherStatusLabels)}
          placeholder="Tous les statuts"
          label="Filtrer par statut"
        />
      </FilterBar>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Liste des enseignants
          </h2>
          <Badge tone="brand">
            {visible.length} résultat{visible.length > 1 ? 's' : ''}
          </Badge>
        </div>

        {!ready ? (
          <TableSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            title="Aucun enseignant trouvé"
            message="Aucun enseignant ne correspond à votre recherche ou à vos filtres."
            icon={<Users size={24} />}
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
                    <TH>Enseignant</TH>
                    <TH>Identifiant</TH>
                    <TH>Matières</TH>
                    <TH>Classes</TH>
                    <TH>Téléphone</TH>
                    <TH>Email</TH>
                    <TH>Statut</TH>
                    <TH className="text-right">Actions</TH>
                  </tr>
                </THead>
                <tbody>
                  {visible.map((teacher) => (
                    <TRow key={teacher.id}>
                      <TD>
                        <Link
                          href={href(`/teachers/${teacher.id}`)}
                          className="flex items-center gap-3 group"
                        >
                          <Avatar
                            name={teacherName(teacher)}
                            src={teacher.photoUrl}
                            size="sm"
                          />
                          <span className="font-medium text-slate-900 group-hover:text-brand-600 transition-colors">
                            {teacherName(teacher)}
                          </span>
                        </Link>
                      </TD>
                      <TD className="font-mono text-xs">{teacher.matricule}</TD>
                      <TD>
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjectIds.length === 0 ? (
                            <span className="text-slate-400">—</span>
                          ) : (
                            teacher.subjectIds.map((subjectId) => (
                              <Badge key={subjectId} tone="brand">
                                {subjectName.get(subjectId) ?? subjectId}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TD>
                      <TD>
                        <span className="text-xs">
                          {teacher.classIds.length === 0
                            ? '—'
                            : teacher.classIds
                                .map((classId) => classLabel(classes, classId))
                                .join(', ')}
                        </span>
                      </TD>
                      <TD className="whitespace-nowrap">{teacher.phone}</TD>
                      <TD className="text-xs">{teacher.email}</TD>
                      <TD>
                        <StatusBadge meta={teacherStatusMeta(teacher.status)} />
                      </TD>
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={href(`/teachers/${teacher.id}`)}
                            aria-label={`Voir la fiche de ${teacherName(teacher)}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          >
                            <Eye size={16} />
                          </Link>
                          <ActionMenu
                            label={`Actions pour ${teacherName(teacher)}`}
                            actions={[
                              {
                                label: 'Modifier la fiche',
                                icon: <Pencil size={16} />,
                                onSelect: () =>
                                  router.push(href(`/teachers/${teacher.id}/edit`)),
                              },
                              {
                                label: 'Archiver l’enseignant',
                                icon: <Archive size={16} />,
                                destructive: true,
                                disabled: teacher.status === 'archive',
                                onSelect: () => setToArchive(teacher),
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

            <ul className="md:hidden space-y-3">
              {visible.map((teacher) => (
                <li
                  key={teacher.id}
                  className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={teacherName(teacher)}
                      src={teacher.photoUrl}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={href(`/teachers/${teacher.id}`)}
                        className="font-medium text-slate-900 hover:text-brand-600 transition-colors block truncate"
                      >
                        {teacherName(teacher)}
                      </Link>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {teacher.matricule}
                      </p>
                    </div>
                    <StatusBadge meta={teacherStatusMeta(teacher.status)} />
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {teacher.subjectIds.map((subjectId) => (
                      <Badge key={subjectId} tone="brand">
                        {subjectName.get(subjectId) ?? subjectId}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    <p className="flex items-center gap-2">
                      <Phone size={13} /> {teacher.phone}
                    </p>
                    <p className="flex items-center gap-2 truncate">
                      <Mail size={13} /> {teacher.email}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <LinkButton
                      href={href(`/teachers/${teacher.id}`)}
                      variant="outline"
                      size="sm"
                      fullWidth
                    >
                      <Eye size={15} /> Voir
                    </LinkButton>
                    <LinkButton
                      href={href(`/teachers/${teacher.id}/edit`)}
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
        title="Archiver cet enseignant ?"
        message={
          toArchive
            ? `${teacherName(toArchive)} n’apparaîtra plus dans les listes d’affectation. Ses évaluations passées restent conservées.`
            : ''
        }
        confirmLabel="Archiver"
        onCancel={() => setToArchive(null)}
        onConfirm={() => toArchive && archiveTeacher(toArchive)}
      />
    </PageContainer>
  );
}
