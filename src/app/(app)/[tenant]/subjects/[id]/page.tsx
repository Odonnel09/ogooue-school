'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { Archive, BookOpen, FileText, Pencil, RotateCcw } from 'lucide-react';

import { cycleLabels } from '@/i18n/fr';
import { evaluationStatusMeta, subjectStatusMeta } from '@/lib/status';
import { useSchoolData } from '@/lib/store/school-data';
import { useHref } from '@/lib/hooks';
import {
  classLabel,
  classesOfSubject,
  levelLabel,
  teacherLabel,
} from '@/lib/selectors';
import { useCapabilities } from '@/lib/school-levels/use-capabilities';
import { formatDate } from '@/lib/utils';
import {
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

export default function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const href = useHref();
  const toast = useToast();
  const { subjects, teachers, classes, classSubjects, evaluations, actions } =
    useSchoolData();
  const capabilities = useCapabilities();

  const [confirmArchive, setConfirmArchive] = useState(false);

  const subject = subjects.find((item) => item.id === id);

  /** Rattachements de la matière : chacun porte son propre coefficient. */
  const relatedLinks = useMemo(
    () => classesOfSubject(classSubjects, id),
    [classSubjects, id],
  );

  const relatedEvaluations = useMemo(
    () =>
      evaluations
        .filter((evaluation) => evaluation.subjectId === id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [evaluations, id],
  );

  if (!subject) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title="Matière introuvable"
            message="Cette matière n’existe pas ou a été supprimée."
            icon={<BookOpen size={24} />}
            action={
              <LinkButton href={href('/subjects')} variant="outline">
                Retour au catalogue
              </LinkButton>
            }
          />
        </Card>
      </PageContainer>
    );
  }

  const isArchived = subject.status === 'archivee';

  function toggleArchive() {
    if (!subject) return;
    actions.subjects.update(subject.id, {
      status: isArchived ? 'active' : 'archivee',
    });
    setConfirmArchive(false);
    toast.success(
      isArchived
        ? `La matière ${subject.name} a été réactivée.`
        : `La matière ${subject.name} a été archivée.`,
    );
  }

  return (
    <PageContainer>
      <Card className="p-4 sm:p-6">
        <nav aria-label="Fil d'Ariane" className="mb-4">
          <Link
            href={href('/subjects')}
            className="text-xs text-slate-500 hover:text-brand-600 transition-colors"
          >
            ← Retour aux matières
          </Link>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <BookOpen size={26} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {subject.name}
              </h1>
              <StatusBadge meta={subjectStatusMeta(subject.status)} />
            </div>
            <p className="text-sm text-slate-500 mt-1 font-mono">{subject.code}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge tone="blue">{cycleLabels[subject.cycle]}</Badge>
              <Badge tone="slate">{relatedLinks.length} classes</Badge>
              {capabilities.hasAny('hasCredits') && subject.ectsCredits > 0 && (
                <Badge tone="brand">{subject.ectsCredits} crédits ECTS</Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <LinkButton href={href(`/subjects/${subject.id}/edit`)}>
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
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
            Informations
          </h2>
          <dl>
            <DataRow label="Code" value={subject.code} />
            <DataRow
              label="Niveaux concernés"
              value={subject.levelIds.map((levelId) => levelLabel(levelId)).join(', ')}
            />
            <DataRow label="Cycle" value={cycleLabels[subject.cycle]} />
            <DataRow
              label="Enseignant responsable"
              value={
                subject.teacherId ? (
                  <Link
                    href={href(`/teachers/${subject.teacherId}`)}
                    className="text-brand-600 hover:underline"
                  >
                    {teacherLabel(teachers, subject.teacherId)}
                  </Link>
                ) : (
                  'Non désigné'
                )
              }
            />
            <DataRow label="Description" value={subject.description} />
          </dl>
        </Card>

        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          {capabilities.hasAny('hasCredits') && (
            <Card className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
                Enseignement supérieur (LMD)
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <DataRow label="Unité d’enseignement" value={subject.ue} />
                <DataRow label="Élément constitutif" value={subject.ecue} />
                <DataRow
                  label="Crédits ECTS"
                  value={`${subject.ectsCredits} crédits`}
                />
                <DataRow label="Semestre" value={subject.semester} />
                <DataRow label="Filière" value={subject.filiere} />
              </dl>
            </Card>
          )}

          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              Classes concernées
            </h2>
            {relatedLinks.length === 0 ? (
              <EmptyState
                title="Aucune classe"
                message="Cette matière n’est encore associée à aucune classe."
                icon={<BookOpen size={24} />}
              />
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedLinks.map((link) => {
                  const target = classes.find(
                    (item) => item.id === link.classId,
                  );
                  return (
                    <li key={link.id}>
                      <Link
                        href={href(`/classes/${link.classId}`)}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-brand-100 transition-colors"
                      >
                        <span className="text-sm font-medium text-slate-900 truncate">
                          {classLabel(classes, link.classId)}
                        </span>
                        <span className="flex items-center gap-1.5 shrink-0">
                          {target &&
                            capabilities.forClass(target).hasCoefficients && (
                              <Badge tone="slate">coef. {link.coefficient}</Badge>
                            )}
                          <Badge tone="orange">{link.weeklyHours} h</Badge>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              Évaluations liées
            </h2>
            {relatedEvaluations.length === 0 ? (
              <EmptyState
                title="Aucune évaluation"
                message="Aucune évaluation n’a encore été créée pour cette matière."
                icon={<FileText size={24} />}
              />
            ) : (
              <ul className="space-y-2">
                {relatedEvaluations.map((evaluation) => (
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
                          {formatDate(evaluation.date)}
                        </p>
                      </div>
                      <StatusBadge meta={evaluationStatusMeta(evaluation.status)} />
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
        title={isArchived ? 'Réactiver cette matière ?' : 'Archiver cette matière ?'}
        message={
          isArchived
            ? `La matière ${subject.name} redeviendra disponible pour les emplois du temps et les évaluations.`
            : `La matière ${subject.name} ne sera plus proposée lors de la création d’évaluations ou de créneaux.`
        }
        destructive={!isArchived}
        confirmLabel={isArchived ? 'Réactiver' : 'Archiver'}
        onCancel={() => setConfirmArchive(false)}
        onConfirm={toggleArchive}
      />
    </PageContainer>
  );
}
