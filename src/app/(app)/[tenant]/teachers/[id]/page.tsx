'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Archive,
  BookOpen,
  FileText,
  Pencil,
  RotateCcw,
  UserRound,
  Users,
} from 'lucide-react';

import { contractTypeLabels } from '@/i18n/fr';
import { evaluationStatusMeta, teacherStatusMeta } from '@/lib/status';
import { useSchoolData } from '@/lib/store/school-data';
import { useHref } from '@/lib/hooks';
import {
  classHeadcount,
  classLabel,
  subjectLabel,
  teacherName,
} from '@/lib/selectors';
import { formatDate } from '@/lib/utils';
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
  useToast,
} from '@/components/ui';

export default function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const href = useHref();
  const toast = useToast();
  const { teachers, subjects, classes, students, evaluations, actions } =
    useSchoolData();

  const [confirmArchive, setConfirmArchive] = useState(false);

  const teacher = teachers.find((item) => item.id === id);

  const teacherEvaluations = useMemo(
    () =>
      evaluations
        .filter((evaluation) => evaluation.teacherId === id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [evaluations, id],
  );

  if (!teacher) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title="Enseignant introuvable"
            message="Cette fiche n’existe pas ou a été supprimée."
            icon={<UserRound size={24} />}
            action={
              <LinkButton href={href('/teachers')} variant="outline">
                Retour à la liste
              </LinkButton>
            }
          />
        </Card>
      </PageContainer>
    );
  }

  const fullName = teacherName(teacher);
  const isArchived = teacher.status === 'archive';

  function toggleArchive() {
    if (!teacher) return;
    actions.teachers.update(teacher.id, {
      status: isArchived ? 'actif' : 'archive',
    });
    setConfirmArchive(false);
    toast.success(
      isArchived ? `${fullName} a été réactivé.` : `${fullName} a été archivé.`,
    );
  }

  return (
    <PageContainer>
      <Card className="p-4 sm:p-6">
        <nav aria-label="Fil d'Ariane" className="mb-4">
          <Link
            href={href('/teachers')}
            className="text-xs text-slate-500 hover:text-brand-600 transition-colors"
          >
            ← Retour aux enseignants
          </Link>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <Avatar name={fullName} src={teacher.photoUrl} size="xl" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {fullName}
              </h1>
              <StatusBadge meta={teacherStatusMeta(teacher.status)} />
            </div>
            <p className="text-sm text-slate-500 mt-1 font-mono">
              {teacher.matricule}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge tone="blue">
                {contractTypeLabels[teacher.contractType]}
              </Badge>
              <Badge tone="slate">
                En poste depuis le {formatDate(teacher.startDate)}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-col lg:flex-row">
            <LinkButton href={href(`/teachers/${teacher.id}/edit`)}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <Card className="p-4 sm:p-6 lg:col-span-1">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
            Coordonnées
          </h2>
          <dl>
            <DataRow label="Email" value={teacher.email} />
            <DataRow label="Téléphone" value={teacher.phone} />
            <DataRow label="Adresse" value={teacher.address} />
            <DataRow
              label="Type de contrat"
              value={contractTypeLabels[teacher.contractType]}
            />
            <DataRow label="Date de début" value={formatDate(teacher.startDate)} />
            <DataRow label="Notes administratives" value={teacher.notes} />
          </dl>
        </Card>

        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              Matières enseignées
            </h2>
            {teacher.subjectIds.length === 0 ? (
              <EmptyState
                title="Aucune matière"
                message="Aucune matière n’est encore associée à cet enseignant."
                icon={<BookOpen size={24} />}
              />
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teacher.subjectIds.map((subjectId) => (
                  <li key={subjectId}>
                    <Link
                      href={href(`/subjects/${subjectId}`)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-brand-100 transition-colors"
                    >
                      <span className="w-10 h-10 rounded-lg bg-white shadow-sm text-brand-500 flex items-center justify-center shrink-0">
                        <BookOpen size={18} />
                      </span>
                      <span className="text-sm font-medium text-slate-900 truncate">
                        {subjectLabel(subjects, subjectId)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              Classes affectées
            </h2>
            {teacher.classIds.length === 0 ? (
              <EmptyState
                title="Aucune classe"
                message="Aucune classe n’est encore affectée à cet enseignant."
                icon={<Users size={24} />}
              />
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teacher.classIds.map((classId) => (
                  <li key={classId}>
                    <Link
                      href={href(`/classes/${classId}`)}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-brand-100 transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-900 truncate">
                        {classLabel(classes, classId)}
                      </span>
                      <Badge tone="slate">
                        {classHeadcount(students, classId)} élèves
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              Évaluations créées
            </h2>
            {teacherEvaluations.length === 0 ? (
              <EmptyState
                title="Aucune évaluation"
                message="Cet enseignant n’a pas encore créé d’évaluation cette année."
                icon={<FileText size={24} />}
              />
            ) : (
              <ul className="space-y-2">
                {teacherEvaluations.map((evaluation) => (
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
                          {classLabel(classes, evaluation.classId)} ·{' '}
                          {subjectLabel(subjects, evaluation.subjectId)} ·{' '}
                          {formatDate(evaluation.date)}
                        </p>
                      </div>
                      <StatusBadge
                        meta={evaluationStatusMeta(evaluation.status)}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmArchive}
        title={
          isArchived ? 'Réactiver cet enseignant ?' : 'Archiver cet enseignant ?'
        }
        message={
          isArchived
            ? `${fullName} redeviendra disponible pour les affectations de classes et de matières.`
            : `${fullName} n’apparaîtra plus dans les listes d’affectation. Ses évaluations passées restent conservées.`
        }
        destructive={!isArchived}
        confirmLabel={isArchived ? 'Réactiver' : 'Archiver'}
        onCancel={() => setConfirmArchive(false)}
        onConfirm={toggleArchive}
      />
    </PageContainer>
  );
}
