'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CalendarCheck,
  CalendarDays,
  FileText,
  Pencil,
  Users,
} from 'lucide-react';
import {
  WEEKDAYS,
} from '@/types';
import { cycleLabels, weekdayLabels } from '@/i18n/fr';
import { classStatusMeta, evaluationStatusMeta, studentStatusMeta } from '@/lib/status';
import { useSchoolData } from '@/lib/store/school-data';
import { useHref } from '@/lib/hooks';
import {
  attendanceStats,
  classHeadcount,
  levelLabel,
  occupancyRate,
  sortSlots,
  studentName,
  guardianLabel,
  subjectLabel,
  subjectsOfClass,
  teacherLabel,
} from '@/lib/selectors';
import { classAverage } from '@/features/evaluations/queries';
import { useCapabilities } from '@/lib/school-levels/use-capabilities';
import { formatDate } from '@/lib/utils';
import {
  Avatar,
  Badge,
  Card,
  DataRow,
  EmptyState,
  InnerCard,
  LinkButton,
  PageContainer,
  StatCard,
  StatusBadge,
  TD,
  TH,
  THead,
  TRow,
  Table,
  TableWrapper,
  Tabs,
} from '@/components/ui';

const TABS = [
  { id: 'overview', label: 'Aperçu' },
  { id: 'students', label: 'Élèves' },
  { id: 'timetable', label: 'Emploi du temps' },
  { id: 'evaluations', label: 'Évaluations' },
  { id: 'attendance', label: 'Présences' },
];

export default function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const href = useHref();
  const {
    classes,
    classSubjects,
    students,
    guardians,
    guardianLinks,
    teachers,
    subjects,
    slots,
    sheets,
    evaluations,
  } = useSchoolData();
  const capabilities = useCapabilities();

  const [tab, setTab] = useState('overview');

  /** Matières rattachées à cette classe, avec leur coefficient propre. */
  const links = useMemo(
    () => subjectsOfClass(classSubjects, id),
    [classSubjects, id],
  );

  const schoolClass = classes.find((item) => item.id === id);

  const roster = useMemo(
    () =>
      students
        .filter((student) => student.classId === id)
        .sort((a, b) => studentName(a).localeCompare(studentName(b), 'fr')),
    [students, id],
  );

  const classSlots = useMemo(
    () => sortSlots(slots.filter((slot) => slot.classId === id)),
    [slots, id],
  );

  const classEvaluations = useMemo(
    () =>
      evaluations
        .filter((evaluation) => evaluation.classId === id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [evaluations, id],
  );

  const classSheets = useMemo(
    () =>
      sheets
        .filter((sheet) => sheet.classId === id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [sheets, id],
  );

  if (!schoolClass) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title="Classe introuvable"
            message="Cette classe n’existe pas ou a été supprimée."
            icon={<BookOpen size={24} />}
            action={
              <LinkButton href={href('/classes')} variant="outline">
                Retour à la liste
              </LinkButton>
            }
          />
        </Card>
      </PageContainer>
    );
  }

  const headcount = classHeadcount(students, schoolClass.id);
  const average = classAverage(
    evaluations,
    classSubjects,
    schoolClass.id,
    roster.map((student) => student.id),
    capabilities.gradingConfigForClass(schoolClass),
  );
  const rate = occupancyRate(headcount, schoolClass.capacity);

  return (
    <PageContainer>
      <Card className="p-4 sm:p-6">
        <nav aria-label="Fil d'Ariane" className="mb-4">
          <Link
            href={href('/classes')}
            className="text-xs text-slate-500 hover:text-brand-600 transition-colors"
          >
            ← Retour aux classes
          </Link>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {schoolClass.name}
              </h1>
              <StatusBadge meta={classStatusMeta(schoolClass.status)} />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {schoolClass.description || 'Aucune description renseignée.'}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge tone="brand">{levelLabel(schoolClass.levelId)}</Badge>
              <Badge tone="blue">{cycleLabels[schoolClass.cycle]}</Badge>
              <Badge tone="slate">{schoolClass.academicYear}</Badge>
              {schoolClass.room && (
                <Badge tone="orange">{schoolClass.room}</Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <LinkButton href={href(`/classes/${schoolClass.id}/edit`)}>
              <Pencil size={16} /> Modifier
            </LinkButton>
            <LinkButton
              href={href(`/attendance/${schoolClass.id}`)}
              variant="outline"
            >
              <CalendarCheck size={16} /> Faire l’appel
            </LinkButton>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Effectif"
          value={`${headcount}/${schoolClass.capacity}`}
          icon={<Users size={22} />}
          tone="brand"
          hint={`${rate}% de la capacité`}
        />
        <StatCard
          label="Moyenne de classe"
          value={average === null ? '—' : `${average.toFixed(2)}/20`}
          icon={<FileText size={22} />}
          tone="green"
          hint="Évaluations validées et publiées"
        />
        <StatCard
          label="Matières"
          value={links.length}
          icon={<BookOpen size={22} />}
          tone="blue"
        />
        <StatCard
          label="Créneaux / semaine"
          value={classSlots.length}
          icon={<CalendarDays size={22} />}
          tone="orange"
        />
      </div>

      <Tabs items={TABS} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              Informations générales
            </h2>
            <dl>
              <DataRow label="Nom de la classe" value={schoolClass.name} />
              <DataRow label="Niveau" value={levelLabel(schoolClass.levelId)} />
              <DataRow label="Cycle" value={cycleLabels[schoolClass.cycle]} />
              <DataRow label="Année scolaire" value={schoolClass.academicYear} />
              <DataRow label="Capacité" value={`${schoolClass.capacity} places`} />
              <DataRow label="Salle" value={schoolClass.room} />
              <DataRow
                label="Professeur principal"
                value={
                  schoolClass.mainTeacherId ? (
                    <Link
                      href={href(`/teachers/${schoolClass.mainTeacherId}`)}
                      className="text-brand-600 hover:underline"
                    >
                      {teacherLabel(teachers, schoolClass.mainTeacherId)}
                    </Link>
                  ) : (
                    'Non désigné'
                  )
                }
              />
            </dl>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              Matières de la classe
            </h2>
            {links.length === 0 ? (
              <EmptyState
                title="Aucune matière"
                message="Aucune matière n’est encore associée à cette classe."
                icon={<BookOpen size={24} />}
                action={
                  <LinkButton
                    href={href(`/classes/${schoolClass.id}/edit`)}
                    variant="outline"
                  >
                    <Pencil size={16} /> Associer des matières
                  </LinkButton>
                }
              />
            ) : (
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={href(`/subjects/${link.subjectId}`)}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-900 truncate">
                        {subjectLabel(subjects, link.subjectId)}
                      </span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        {capabilities.forClass(schoolClass).hasCoefficients && (
                          <Badge tone="slate">coef. {link.coefficient}</Badge>
                        )}
                        <Badge tone="orange">{link.weeklyHours} h</Badge>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {tab === 'students' && (
        <Card className="p-4 sm:p-6">
          <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Élèves de la classe
            </h2>
            <Badge tone="brand">{roster.length} inscrits</Badge>
          </div>

          {roster.length === 0 ? (
            <EmptyState
              title="Aucun élève"
              message="Aucun élève n’est encore affecté à cette classe."
              icon={<Users size={24} />}
              action={
                <LinkButton href={href('/students/new')} variant="outline">
                  Ajouter un élève
                </LinkButton>
              }
            />
          ) : (
            <TableWrapper>
              <Table>
                <THead>
                  <tr>
                    <TH>Élève</TH>
                    <TH>Matricule</TH>
                    <TH>Parent / tuteur</TH>
                    <TH>Statut</TH>
                  </tr>
                </THead>
                <tbody>
                  {roster.map((student) => (
                    <TRow key={student.id}>
                      <TD>
                        <Link
                          href={href(`/students/${student.id}`)}
                          className="flex items-center gap-3 group"
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
                      <TD>{guardianLabel(guardians, guardianLinks, student.id)}</TD>
                      <TD>
                        <StatusBadge meta={studentStatusMeta(student.status)} />
                      </TD>
                    </TRow>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          )}
        </Card>
      )}

      {tab === 'timetable' && (
        <Card className="p-4 sm:p-6">
          <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Emploi du temps hebdomadaire
            </h2>
            <LinkButton href={href('/timetable')} variant="soft" size="sm">
              <CalendarDays size={15} /> Gérer l’emploi du temps
            </LinkButton>
          </div>

          {classSlots.length === 0 ? (
            <EmptyState
              title="Aucun créneau"
              message="Aucun cours n’est encore programmé pour cette classe."
              icon={<CalendarDays size={24} />}
              action={
                <LinkButton href={href('/timetable')} variant="outline">
                  Créer un créneau
                </LinkButton>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {WEEKDAYS.filter((day) =>
                classSlots.some((slot) => slot.day === day),
              ).map((day) => (
                <InnerCard key={day}>
                  <h3 className="text-sm font-bold text-slate-900 mb-3">
                    {weekdayLabels[day]}
                  </h3>
                  <ul className="space-y-2">
                    {classSlots
                      .filter((slot) => slot.day === day)
                      .map((slot) => (
                        <li
                          key={slot.id}
                          className="bg-white rounded-lg p-3 border border-slate-100"
                        >
                          <p className="text-xs font-medium text-brand-600">
                            {slot.startTime} – {slot.endTime}
                          </p>
                          <p className="text-sm font-medium text-slate-900 mt-0.5">
                            {subjectLabel(subjects, slot.subjectId)}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {teacherLabel(teachers, slot.teacherId)} · {slot.room}
                          </p>
                        </li>
                      ))}
                  </ul>
                </InnerCard>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 'evaluations' && (
        <Card className="p-4 sm:p-6">
          <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Évaluations de la classe
            </h2>
            <LinkButton href={href('/evaluations/new')} variant="soft" size="sm">
              Nouvelle évaluation
            </LinkButton>
          </div>

          {classEvaluations.length === 0 ? (
            <EmptyState
              title="Aucune évaluation"
              message="Aucune évaluation n’a encore été créée pour cette classe."
              icon={<FileText size={24} />}
            />
          ) : (
            <ul className="space-y-2">
              {classEvaluations.map((evaluation) => (
                <li key={evaluation.id}>
                  <Link
                    href={href(`/evaluations/${evaluation.id}`)}
                    className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {evaluation.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {subjectLabel(subjects, evaluation.subjectId)} ·{' '}
                        {formatDate(evaluation.date)} · coef.{' '}
                        {evaluation.coefficient}
                      </p>
                    </div>
                    <StatusBadge meta={evaluationStatusMeta(evaluation.status)} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'attendance' && (
        <Card className="p-4 sm:p-6">
          <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Feuilles de présence
            </h2>
            <LinkButton
              href={href(`/attendance/${schoolClass.id}`)}
              variant="soft"
              size="sm"
            >
              <CalendarCheck size={15} /> Faire l’appel
            </LinkButton>
          </div>

          {classSheets.length === 0 ? (
            <EmptyState
              title="Aucune feuille de présence"
              message="Aucun appel n’a encore été enregistré pour cette classe."
              icon={<CalendarCheck size={24} />}
            />
          ) : (
            <ul className="space-y-2">
              {classSheets.map((sheet) => {
                const stats = attendanceStats(sheet.records);
                return (
                  <li
                    key={sheet.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {formatDate(sheet.date)}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Saisie par {sheet.takenBy}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="green">{stats.present} présents</Badge>
                      <Badge tone="red">{stats.absent} absents</Badge>
                      <Badge tone="orange">{stats.retard} retards</Badge>
                      <Badge tone="brand">{stats.rate}%</Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}
    </PageContainer>
  );
}
