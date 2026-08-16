'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  FileText,
  Pencil,
  Send,
  Sigma,
  Unlock,
  Users,
} from 'lucide-react';

import type { EvaluationStatus } from '@/types';
import { evaluationTypeLabels, gradingScaleLabels } from '@/i18n/fr';
import { evaluationStatusMeta } from '@/lib/status';
import { useSchoolData } from '@/lib/store/school-data';
import { useAudit } from '@/lib/audit/use-audit';
import { useHref } from '@/lib/hooks';
import {
  classLabel,
  periodLabel,
  studentName,
  subjectLabel,
  teacherLabel,
} from '@/lib/selectors';
import { evaluationStats } from '@/features/evaluations/queries';
import { useCapabilities } from '@/lib/school-levels/use-capabilities';
import { cn, formatDate, formatScore } from '@/lib/utils';
import {
  Avatar,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DataRow,
  EmptyState,
  Field,
  Input,
  LinkButton,
  Modal,
  PageContainer,
  StatCard,
  StatusBadge,
  Textarea,
  useToast,
} from '@/components/ui';

export default function EvaluationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const href = useHref();
  const toast = useToast();
  const { evaluations, classes, subjects, teachers, students, config, actions } =
    useSchoolData();
  const capabilities = useCapabilities();
  const audit = useAudit();

  const evaluation = evaluations.find((item) => item.id === id);

  /** Saisie brute : permet d'afficher une valeur invalide avant correction. */
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmPublish, setConfirmPublish] = useState(false);

  /**
   * Correction après verrouillage. `GEMINI.md` interdit de rouvrir une note
   * validée sans trace : le motif est obligatoire et part au journal d'audit.
   */
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');
  const [correcting, setCorrecting] = useState(false);

  const roster = useMemo(() => {
    if (!evaluation) return [];
    return evaluation.grades
      .map((grade) => ({
        grade,
        student: students.find((item) => item.id === grade.studentId),
      }))
      .filter(
        (entry): entry is { grade: typeof entry.grade; student: NonNullable<typeof entry.student> } =>
          entry.student !== undefined,
      )
      .sort((a, b) =>
        studentName(a.student).localeCompare(studentName(b.student), 'fr'),
      );
  }, [evaluation, students]);

  if (!evaluation) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title="Évaluation introuvable"
            message="Cette évaluation n’existe pas ou a été supprimée."
            icon={<FileText size={24} />}
            action={
              <LinkButton href={href('/evaluations')} variant="outline">
                Retour à la liste
              </LinkButton>
            }
          />
        </Card>
      </PageContainer>
    );
  }

  const evaluationClass = classes.find(
    (item) => item.id === evaluation.classId,
  );
  const gradingConfig = evaluationClass
    ? capabilities.gradingConfigForClass(evaluationClass)
    : capabilities.gradingConfigForCycle(config.activeCycles[0]);
  const stats = evaluationStats(evaluation, gradingConfig);
  const maxScore = evaluation.maxScore;
  const isPublished = evaluation.status === 'published';
  /** Le verrou tombe dès la validation, pas seulement à la publication. */
  const isLocked = isPublished || evaluation.status === 'validated';
  const readOnly = isLocked && !correcting;

  function handleScoreChange(studentId: string, raw: string) {
    setDrafts((previous) => ({ ...previous, [studentId]: raw }));

    if (raw.trim() === '') {
      setErrors((previous) => ({ ...previous, [studentId]: '' }));
      actions.setGrade(evaluation!.id, studentId, { score: null });
      return;
    }

    const value = Number(raw.replace(',', '.'));

    if (Number.isNaN(value)) {
      setErrors((previous) => ({
        ...previous,
        [studentId]: 'Valeur non numérique.',
      }));
      return;
    }
    if (value < 0) {
      setErrors((previous) => ({
        ...previous,
        [studentId]: 'La note ne peut pas être négative.',
      }));
      return;
    }
    if (value > maxScore) {
      setErrors((previous) => ({
        ...previous,
        [studentId]: `La note ne peut pas dépasser ${maxScore}.`,
      }));
      return;
    }

    setErrors((previous) => ({ ...previous, [studentId]: '' }));
    actions.setGrade(evaluation!.id, studentId, { score: value });
  }

  function handleCommentChange(studentId: string, comment: string) {
    actions.setGrade(evaluation!.id, studentId, { comment });
  }

  /**
   * Un changement de statut engage la note : il est journalisé avec l'action
   * correspondante, jamais avec un libellé générique.
   */
  function setStatus(
    status: EvaluationStatus,
    message: string,
    action: 'grades.validate' | 'grades.publish' | 'grades.reopen',
  ) {
    actions.evaluations.update(evaluation!.id, { status });
    audit({
      action,
      resourceType: 'Évaluation',
      resourceId: evaluation!.id,
      resourceLabel: `${evaluation!.name} — ${classLabel(classes, evaluation!.classId)}`,
      detail: `${stats.filled} note(s) sur ${stats.total}, moyenne ${stats.average ?? '—'}.`,
    });
    toast.success(message);
  }

  /** Déverrouille la saisie après avoir consigné le motif. */
  function openCorrection() {
    const reason = correctionReason.trim();
    if (reason.length < 10) {
      toast.error('Le motif doit comporter au moins 10 caractères.');
      return;
    }

    audit({
      action: 'grades.correct',
      resourceType: 'Évaluation',
      resourceId: evaluation!.id,
      resourceLabel: `${evaluation!.name} — ${classLabel(classes, evaluation!.classId)}`,
      detail: `Saisie rouverte après validation. Motif : ${reason}`,
    });

    setCorrectionReason(reason);
    setCorrecting(true);
    setCorrectionOpen(false);
    toast.success('Saisie déverrouillée. La correction est journalisée.');
  }

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <PageContainer>
      <Card className="p-4 sm:p-6">
        <nav aria-label="Fil d'Ariane" className="mb-4">
          <Link
            href={href('/evaluations')}
            className="text-xs text-slate-500 hover:text-brand-600 transition-colors"
          >
            ← Retour aux évaluations
          </Link>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {evaluation.name}
              </h1>
              <StatusBadge meta={evaluationStatusMeta(evaluation.status)} />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {evaluation.description || 'Aucune description renseignée.'}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge tone="brand">
                {subjectLabel(subjects, evaluation.subjectId)}
              </Badge>
              <Badge tone="blue">{classLabel(classes, evaluation.classId)}</Badge>
              <Badge tone="slate">
                {evaluationTypeLabels[evaluation.type]}
              </Badge>
              <Badge tone="orange">{formatDate(evaluation.date)}</Badge>
              <Badge tone="yellow">coef. {evaluation.coefficient}</Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <LinkButton
              href={href(`/evaluations/${evaluation.id}/edit`)}
              variant="outline"
            >
              <Pencil size={16} /> Modifier
            </LinkButton>
            {evaluation.status !== 'validated' && !isPublished && (
              <Button
                variant="secondary"
                disabled={hasErrors || stats.filled === 0}
                onClick={() =>
                  setStatus(
                    'validated',
                    'Les notes ont été validées.',
                    'grades.validate',
                  )
                }
              >
                <CheckCircle2 size={16} /> Valider les notes
              </Button>
            )}
            {!isPublished && (
              <Button
                disabled={hasErrors || stats.filled === 0}
                onClick={() => setConfirmPublish(true)}
              >
                <Send size={16} /> Publier
              </Button>
            )}
            {isLocked && !correcting && (
              <Button variant="outline" onClick={() => setCorrectionOpen(true)}>
                <Unlock size={16} aria-hidden="true" /> Corriger une note
              </Button>
            )}
            {isPublished && (
              <Button
                variant="outline"
                onClick={() =>
                  setStatus(
                    'in_progress',
                    'L’évaluation est repassée en saisie.',
                    'grades.reopen',
                  )
                }
              >
                Rouvrir la saisie
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Moyenne de la classe"
          value={
            stats.average === null ? '—' : formatScore(stats.average, maxScore)
          }
          icon={<Sigma size={22} />}
          tone="brand"
        />
        <StatCard
          label="Meilleure note"
          value={stats.best === null ? '—' : formatScore(stats.best, maxScore)}
          icon={<ArrowUp size={22} />}
          tone="green"
        />
        <StatCard
          label="Note la plus basse"
          value={stats.lowest === null ? '—' : formatScore(stats.lowest, maxScore)}
          icon={<ArrowDown size={22} />}
          tone="red"
        />
        <StatCard
          label="Saisie"
          value={`${stats.filled}/${stats.total}`}
          icon={<Users size={22} />}
          tone="orange"
          hint={
            stats.total === 0
              ? 'Aucun élève concerné'
              : `${Math.round((stats.filled / stats.total) * 100)}% complété`
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
            Informations
          </h2>
          <dl>
            <DataRow
              label="Matière"
              value={subjectLabel(subjects, evaluation.subjectId)}
            />
            <DataRow
              label="Classe"
              value={
                <Link
                  href={href(`/classes/${evaluation.classId}`)}
                  className="text-brand-600 hover:underline"
                >
                  {classLabel(classes, evaluation.classId)}
                </Link>
              }
            />
            <DataRow
              label="Enseignant"
              value={
                <Link
                  href={href(`/teachers/${evaluation.teacherId}`)}
                  className="text-brand-600 hover:underline"
                >
                  {teacherLabel(teachers, evaluation.teacherId)}
                </Link>
              }
            />
            <DataRow label="Année scolaire" value={evaluation.academicYear} />
            <DataRow label="Période" value={periodLabel(config.periods, evaluation.periodId)} />
            <DataRow label="Date" value={formatDate(evaluation.date)} />
            <DataRow
              label="Barème"
              value={`${gradingScaleLabels[evaluation.scale]} (sur ${maxScore})`}
            />
            <DataRow label="Coefficient" value={evaluation.coefficient} />
          </dl>
        </Card>

        <Card className="p-4 sm:p-6 lg:col-span-2">
          <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Saisie des notes
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Notes comprises entre 0 et {maxScore}. La moyenne est recalculée
                automatiquement.
              </p>
            </div>
            {hasErrors && (
              <Badge tone="red" dot>
                Champs invalides
              </Badge>
            )}
          </div>

          {roster.length === 0 ? (
            <EmptyState
              title="Aucun élève concerné"
              message="Aucun élève actif n’est affecté à la classe de cette évaluation."
              icon={<Users size={24} />}
              action={
                <LinkButton
                  href={href(`/classes/${evaluation.classId}`)}
                  variant="outline"
                >
                  Voir la classe
                </LinkButton>
              }
            />
          ) : (
            <ul className="space-y-3">
              {roster.map(({ grade, student }) => {
                const draft =
                  drafts[student.id] ??
                  (grade.score === null ? '' : String(grade.score));
                const error = errors[student.id];

                return (
                  <li
                    key={student.id}
                    className="border border-slate-100 rounded-xl p-3 sm:p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar
                          name={studentName(student)}
                          src={student.photoUrl}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <Link
                            href={href(`/students/${student.id}`)}
                            className="text-sm font-medium text-slate-900 hover:text-brand-600 transition-colors block truncate"
                          >
                            {studentName(student)}
                          </Link>
                          <p className="text-xs text-slate-500 font-mono">
                            {student.matricule}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          max={maxScore}
                          step={0.5}
                          value={draft}
                          disabled={readOnly}
                          invalid={Boolean(error)}
                          onChange={(event) =>
                            handleScoreChange(student.id, event.target.value)
                          }
                          aria-label={`Note de ${studentName(student)}`}
                          className="w-24 py-2.5 text-center"
                        />
                        <span className="text-sm text-slate-400 w-10">
                          / {maxScore}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Input
                        value={grade.comment}
                        disabled={readOnly}
                        onChange={(event) =>
                          handleCommentChange(student.id, event.target.value)
                        }
                        placeholder="Appréciation (facultatif)"
                        aria-label={`Appréciation pour ${studentName(student)}`}
                        className="py-2.5 text-xs"
                      />
                    </div>

                    {error && (
                      <p
                        className={cn(
                          'mt-2 text-xs text-red-500 flex items-center gap-1',
                        )}
                      >
                        <AlertCircle size={13} /> {error}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {correcting && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 flex items-start gap-3">
          <Unlock
            size={18}
            className="text-yellow-600 mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <p className="text-xs text-yellow-800 leading-relaxed">
            Correction autorisée pour cette session. Le motif « {correctionReason}{' '}
            » est inscrit au journal d’audit, avec votre nom et l’heure.
          </p>
        </div>
      )}

      <Modal
        open={correctionOpen}
        onClose={() => setCorrectionOpen(false)}
        title="Corriger une note verrouillée"
        description="Ces notes sont validées. Toute correction est journalisée et le motif reste consultable."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setCorrectionOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={openCorrection}>Déverrouiller la saisie</Button>
          </>
        }
      >
        <Field
          label="Motif de la correction"
          htmlFor="correction-reason"
          hint="Dix caractères au minimum. Ce texte figurera dans le journal d’audit."
        >
          <Textarea
            id="correction-reason"
            rows={3}
            value={correctionReason}
            onChange={(event) => setCorrectionReason(event.target.value)}
            placeholder="Erreur de report sur la copie n° 12…"
          />
        </Field>
      </Modal>

      <ConfirmDialog
        open={confirmPublish}
        title="Publier les résultats ?"
        message={`Les ${stats.filled} note(s) saisies seront visibles par les élèves et les parents. La saisie sera verrouillée, mais vous pourrez la rouvrir.`}
        destructive={false}
        confirmLabel="Publier"
        onCancel={() => setConfirmPublish(false)}
        onConfirm={() => {
          setConfirmPublish(false);
          setStatus(
            'published',
            'Les résultats ont été publiés.',
            'grades.publish',
          );
        }}
      />
    </PageContainer>
  );
}
