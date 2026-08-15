'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Archive,
  CalendarCheck,
  FileText,
  History,
  Pencil,
  RotateCcw,
  UserRound,
} from 'lucide-react';

import { genderLabels, guardianRelationLabels } from '@/i18n/fr';
import { attendanceStatusMeta, evaluationStatusMeta, studentStatusMeta } from '@/lib/status';
import { useSchoolData } from '@/lib/store/school-data';
import { useHref } from '@/lib/hooks';
import {
  classLabel,
  guardianName,
  levelLabel,
  linksOfStudent,
  studentName,
  subjectLabel,
} from '@/lib/selectors';
import {
  evaluationsOfStudent,
  studentAverage,
} from '@/features/evaluations/queries';
import { useCapabilities } from '@/lib/school-levels/use-capabilities';
import { ageFromBirthDate, formatDate, formatScore } from '@/lib/utils';
import {
  Avatar,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DataRow,
  EmptyState,
  LinkButton,
  PageContainer,
  StatusBadge,
  Tabs,
  useToast,
} from '@/components/ui';

const TABS = [
  { id: 'infos', label: 'Informations' },
  { id: 'attendance', label: 'Présences' },
  { id: 'grades', label: 'Notes' },
  { id: 'documents', label: 'Documents' },
  { id: 'history', label: 'Historique' },
];

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const href = useHref();
  const toast = useToast();
  const {
    students,
    classes,
    classSubjects,
    subjects,
    guardians,
    guardianLinks,
    sheets,
    evaluations,
    actions,
  } = useSchoolData();
  const capabilities = useCapabilities();

  const [tab, setTab] = useState('infos');

  /** Tuteurs rattachés, contact principal en tête. */
  const studentLinks = useMemo(
    () => linksOfStudent(guardianLinks, id),
    [guardianLinks, id],
  );
  const [confirmArchive, setConfirmArchive] = useState(false);

  const student = students.find((item) => item.id === id);

  const attendance = useMemo(() => {
    if (!student) return [];
    return sheets
      .filter((sheet) => sheet.classId === student.classId)
      .map((sheet) => ({
        date: sheet.date,
        record: sheet.records.find((item) => item.studentId === student.id),
      }))
      .filter((entry) => entry.record !== undefined)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [sheets, student]);

  const grades = useMemo(() => {
    if (!student) return [];
    return evaluationsOfStudent(evaluations, student.classId)
      .map((evaluation) => ({
        evaluation,
        grade: evaluation.grades.find((item) => item.studentId === student.id),
      }))
      .filter((entry) => entry.grade !== undefined);
  }, [evaluations, student]);

  if (!student) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title="Élève introuvable"
            message="Cette fiche n’existe pas ou a été supprimée."
            icon={<UserRound size={24} />}
            action={
              <LinkButton href={href('/students')} variant="outline">
                Retour à la liste
              </LinkButton>
            }
          />
        </Card>
      </PageContainer>
    );
  }

  const fullName = studentName(student);
  const schoolClass = classes.find((item) => item.id === student.classId);
  const average = schoolClass
    ? studentAverage(
        evaluations,
        classSubjects,
        student.classId,
        student.id,
        capabilities.gradingConfigForClass(schoolClass),
      )
    : null;
  const isArchived = student.status === 'archive';

  function toggleArchive() {
    if (!student) return;
    actions.students.update(student.id, {
      status: isArchived ? 'actif' : 'archive',
    });
    setConfirmArchive(false);
    toast.success(
      isArchived
        ? `${fullName} a été réactivé.`
        : `${fullName} a été archivé.`,
    );
  }

  return (
    <PageContainer>
      {/* En-tête de fiche */}
      <Card className="p-4 sm:p-6">
        <nav aria-label="Fil d'Ariane" className="mb-4">
          <Link
            href={href('/students')}
            className="text-xs text-slate-500 hover:text-brand-600 transition-colors"
          >
            ← Retour aux élèves
          </Link>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <Avatar name={fullName} src={student.photoUrl} size="xl" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {fullName}
              </h1>
              <StatusBadge meta={studentStatusMeta(student.status)} />
              {student.isDraft && <Badge tone="yellow">Brouillon</Badge>}
            </div>
            <p className="text-sm text-slate-500 mt-1 font-mono">
              {student.matricule}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge tone="brand">{classLabel(classes, student.classId)}</Badge>
              <Badge tone="blue">{levelLabel(student.levelId)}</Badge>
              <Badge tone="slate">{student.academicYear}</Badge>
              {average !== null && (
                <Badge tone="green">Moyenne {average.toFixed(2)}/20</Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-col lg:flex-row">
            <LinkButton href={href(`/students/${student.id}/edit`)} variant="primary">
              <Pencil size={16} /> Modifier
            </LinkButton>
            <Button
              variant={isArchived ? 'outline' : 'dangerSoft'}
              onClick={() => setConfirmArchive(true)}
            >
              {isArchived ? <RotateCcw size={16} /> : <Archive size={16} />}
              {isArchived ? 'Réactiver' : 'Archiver'}
            </Button>
          </div>
        </div>
      </Card>

      <Tabs items={TABS} active={tab} onChange={setTab} />

      {tab === 'infos' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              Informations personnelles
            </h2>
            <dl>
              <DataRow label="Nom complet" value={fullName} />
              <DataRow
                label="Date de naissance"
                value={
                  student.birthDate
                    ? `${formatDate(student.birthDate)} (${ageFromBirthDate(student.birthDate)} ans)`
                    : ''
                }
              />
              <DataRow label="Lieu de naissance" value={student.birthPlace} />
              <DataRow label="Sexe" value={genderLabels[student.gender]} />
              <DataRow label="Nationalité" value={student.nationality} />
              <DataRow label="Adresse" value={student.address} />
            </dl>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              Parents et tuteurs
            </h2>

            {studentLinks.length === 0 ? (
              <EmptyState
                title="Aucun tuteur rattaché"
                message="Rattachez un parent ou tuteur depuis le formulaire de modification."
                icon={<UserRound size={24} aria-hidden="true" />}
                action={
                  <LinkButton
                    href={href(`/students/${student.id}/edit`)}
                    variant="outline"
                  >
                    <Pencil size={16} aria-hidden="true" /> Rattacher un tuteur
                  </LinkButton>
                }
              />
            ) : (
              <ul className="space-y-3">
                {studentLinks.map((link) => {
                  const guardian = guardians.find(
                    (item) => item.id === link.guardianId,
                  );
                  if (!guardian) return null;

                  return (
                    <li
                      key={link.id}
                      className="border border-slate-100 rounded-xl p-3 sm:p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <Link
                          href={href(`/guardians/${guardian.id}`)}
                          className="text-sm font-medium text-slate-900 hover:text-brand-600 transition-colors"
                        >
                          {guardianName(guardian)}
                        </Link>
                        <span className="flex flex-wrap gap-1.5">
                          <Badge tone="brand">
                            {guardianRelationLabels[link.relation]}
                          </Badge>
                          {link.isPrimary && (
                            <Badge tone="blue">Contact principal</Badge>
                          )}
                          {link.canPickUp && (
                            <Badge tone="green">Autorisé à récupérer</Badge>
                          )}
                        </span>
                      </div>
                      <dl className="mt-2">
                        <DataRow label="Téléphone" value={guardian.phone} />
                        <DataRow label="Email" value={guardian.email} />
                        <DataRow label="Profession" value={guardian.profession} />
                      </dl>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      )}

      {tab === 'attendance' && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
            Présences récentes
          </h2>
          {attendance.length === 0 ? (
            <EmptyState
              title="Aucune présence enregistrée"
              message="Aucune feuille de présence n’a encore été saisie pour la classe de cet élève."
              icon={<CalendarCheck size={24} />}
              action={
                <LinkButton href={href('/attendance')} variant="outline">
                  Aller aux présences
                </LinkButton>
              }
            />
          ) : (
            <ul className="space-y-2">
              {attendance.map((entry) => (
                <li
                  key={entry.date}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {formatDate(entry.date)}
                    </p>
                    {entry.record?.note && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {entry.record.note}
                      </p>
                    )}
                  </div>
                  {entry.record && (
                    <StatusBadge
                      meta={attendanceStatusMeta(entry.record.status)}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'grades' && (
        <Card className="p-4 sm:p-6">
          <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Notes récentes
            </h2>
            {average !== null && (
              <Badge tone="brand">Moyenne générale {average.toFixed(2)}/20</Badge>
            )}
          </div>

          {grades.length === 0 ? (
            <EmptyState
              title="Aucune note"
              message="Aucune évaluation n’a encore été saisie pour la classe de cet élève."
              icon={<FileText size={24} />}
            />
          ) : (
            <ul className="space-y-2">
              {grades.map(({ evaluation, grade }) => (
                <li
                  key={evaluation.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <Link
                      href={href(`/evaluations/${evaluation.id}`)}
                      className="text-sm font-medium text-slate-900 hover:text-brand-600 transition-colors"
                    >
                      {evaluation.name}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {subjectLabel(subjects, evaluation.subjectId)} ·{' '}
                      {formatDate(evaluation.date)} · coef. {evaluation.coefficient}
                    </p>
                    {grade?.comment && (
                      <p className="text-xs text-slate-400 mt-1 italic">
                        « {grade.comment} »
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge
                      meta={evaluationStatusMeta(evaluation.status)}
                    />
                    <span className="text-sm font-bold text-slate-900">
                      {formatScore(grade?.score ?? null, evaluation.maxScore)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'documents' && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
            Documents du dossier
          </h2>
          {student.documents.length === 0 ? (
            <EmptyState
              title="Aucun document"
              message="Aucune pièce n’a été jointe à ce dossier. Ajoutez-en depuis le formulaire de modification."
              icon={<FileText size={24} />}
              action={
                <LinkButton
                  href={href(`/students/${student.id}/edit`)}
                  variant="outline"
                >
                  <Pencil size={16} /> Modifier la fiche
                </LinkButton>
              }
            />
          ) : (
            <ul className="space-y-2">
              {student.documents.map((document) => (
                <li
                  key={document.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {document.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {document.type} · {document.size} · ajouté le{' '}
                        {formatDate(document.uploadedAt)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'history' && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
            Historique d’inscription
          </h2>
          {student.enrollment.length === 0 ? (
            <EmptyState
              title="Aucun historique"
              message="Aucun mouvement d’inscription n’est enregistré pour cet élève."
              icon={<History size={24} />}
            />
          ) : (
            <ol className="relative border-l border-slate-100 ml-3 space-y-5">
              {student.enrollment.map((entry) => (
                <li key={entry.id} className="pl-6">
                  <span className="absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full bg-brand-500" />
                  <p className="text-sm font-medium text-slate-900">
                    {entry.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {entry.academicYear} · {entry.className} ·{' '}
                    {formatDate(entry.date)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </Card>
      )}

      <ConfirmDialog
        open={confirmArchive}
        title={isArchived ? 'Réactiver cet élève ?' : 'Archiver cet élève ?'}
        message={
          isArchived
            ? `${fullName} redeviendra actif et réapparaîtra dans les listes de sa classe.`
            : `La fiche de ${fullName} sera archivée. Elle restera consultable et pourra être réactivée à tout moment.`
        }
        destructive={!isArchived}
        confirmLabel={isArchived ? 'Réactiver' : 'Archiver'}
        onCancel={() => setConfirmArchive(false)}
        onConfirm={toggleArchive}
      />
    </PageContainer>
  );
}
