'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ClipboardList,
  FileWarning,
  Info,
  RotateCcw,
  Send,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { isFileComplete, missingDocuments } from '@/types';
import type {
  EnrollmentApplication,
  EnrollmentStatus,
  GuardianLink,
  Student,
} from '@/types';
import { CURRENT_USER } from '@/data/academic';
import { genderLabels, guardianRelationLabels, ui } from '@/i18n/fr';
import { Can, useSession } from '@/lib/auth/session';
import { useHref } from '@/lib/hooks';
import { useSchoolData } from '@/lib/store/school-data';
import { classLabel, guardianName, levelLabel } from '@/lib/selectors';
import { classOptions } from '@/lib/options';
import { enrollmentStatusMeta } from '@/lib/status';
import { createId, formatDate, todayIso } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  ConfirmDialog,
  DataRow,
  EmptyState,
  Field,
  LinkButton,
  Modal,
  PageContainer,
  Select,
  StatusBadge,
  Textarea,
  useToast,
} from '@/components/ui';
import { enrollmentMessages as m } from '@/features/enrollments/messages';

export default function EnrollmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const href = useHref();
  const toast = useToast();
  const { enrollments, guardians, students, classes, config, actions } =
    useSchoolData();
  const { isYearWritable } = useSession();

  const [decision, setDecision] = useState<'validate' | 'reject' | null>(null);
  const [note, setNote] = useState('');
  const [assignedClassId, setAssignedClassId] = useState('');
  const [confirmEnroll, setConfirmEnroll] = useState(false);

  const application = enrollments.find((item) => item.id === id);

  if (!application) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title={m.detail.notFoundTitle}
            message={m.detail.notFoundMessage}
            icon={<ClipboardList size={24} aria-hidden="true" />}
            action={
              <LinkButton href={href('/enrollments')} variant="outline">
                {m.detail.backToList}
              </LinkButton>
            }
          />
        </Card>
      </PageContainer>
    );
  }

  const guardian = guardians.find((item) => item.id === application.guardianId);
  const candidate = `${application.firstName} ${application.lastName}`;
  const complete = isFileComplete(application);
  const missing = missingDocuments(application);
  const requiresApproval = config.enrollment.requiresApproval;

  /**
   * L'inscription n'est ouverte que si le dossier est complet et, lorsque
   * l'établissement l'exige, validé au préalable.
   */
  const canEnroll =
    complete &&
    application.status !== 'inscrite' &&
    application.status !== 'refusee' &&
    (!requiresApproval || application.status === 'validee');

  function patch(changes: Partial<EnrollmentApplication>, message: string) {
    actions.enrollments.update(application!.id, changes);
    toast.success(message);
  }

  function toggleDocument(name: string, provided: boolean) {
    patch(
      {
        documents: application!.documents.map((document) =>
          document.name === name
            ? { ...document, provided, receivedAt: provided ? todayIso() : '' }
            : document,
        ),
      },
      m.detail.toasts.documentToggled,
    );
  }

  function setStatus(status: EnrollmentStatus, message: string) {
    patch({ status }, message);
  }

  function submitDecision() {
    if (note.trim().length < 10) {
      toast.error('Le motif doit comporter au moins 10 caractères.');
      return;
    }

    patch(
      {
        status: decision === 'validate' ? 'validee' : 'refusee',
        requestedClassId:
          decision === 'validate' ? assignedClassId : application!.requestedClassId,
        decidedAt: todayIso(),
        decidedBy: CURRENT_USER.fullName,
        decisionNote: note.trim(),
      },
      decision === 'validate'
        ? m.detail.toasts.validated
        : m.detail.toasts.rejected,
    );

    setDecision(null);
    setNote('');
  }

  /** Génère le prochain matricule libre de la série. */
  function nextMatricule(): string {
    const numbers = students
      .map((student) => Number(student.matricule.replace(/\D/g, '')))
      .filter((value) => Number.isFinite(value) && value > 0);
    const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 3000;
    return `MAT-${next}`;
  }

  /** Transforme le dossier en élève et rattache le tuteur. */
  function enroll() {
    const studentId = createId('std');
    const targetClassId = application!.requestedClassId;
    const targetClass = classes.find((item) => item.id === targetClassId);

    const student: Student = {
      id: studentId,
      firstName: application!.firstName,
      lastName: application!.lastName,
      matricule: nextMatricule(),
      birthDate: application!.birthDate,
      birthPlace: application!.birthPlace,
      gender: application!.gender,
      nationality: application!.nationality,
      address: application!.address,
      classId: targetClassId,
      levelId: targetClass?.levelId ?? application!.requestedLevelId,
      academicYear: application!.academicYear,
      status: 'actif',
      medicalInfo: '',
      previousSchool: application!.previousSchool,
      filiere: '',
      parcours: '',
      documents: application!.documents
        .filter((document) => document.provided)
        .map((document) => ({
          id: createId('doc'),
          name: document.name,
          type: 'Pièce d’inscription',
          size: '—',
          uploadedAt: document.receivedAt || todayIso(),
        })),
      enrollment: [
        {
          id: createId('enr-entry'),
          academicYear: application!.academicYear,
          className: targetClass?.name ?? 'Non affecté',
          date: todayIso(),
          label: `Inscription issue du dossier ${application!.reference}`,
        },
      ],
      createdAt: todayIso(),
      isDraft: false,
    };

    const link: GuardianLink = {
      id: `gl-${application!.guardianId}-${studentId}`,
      guardianId: application!.guardianId,
      studentId,
      relation: application!.guardianRelation,
      isPrimary: true,
      canPickUp: true,
    };

    actions.students.create(student);
    if (application!.guardianId) actions.guardianLinks.create(link);
    actions.enrollments.update(application!.id, {
      status: 'inscrite',
      createdStudentId: studentId,
    });

    setConfirmEnroll(false);
    toast.success(m.detail.toasts.enrolled(candidate));
  }

  return (
    <PageContainer>
      <Card className="p-4 sm:p-6">
        <nav aria-label={ui.breadcrumb} className="mb-4">
          <Link
            href={href('/enrollments')}
            className="text-xs text-slate-500 hover:text-brand-600 transition-colors rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            {m.detail.back}
          </Link>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {candidate}
              </h1>
              <StatusBadge meta={enrollmentStatusMeta(application.status)} />
            </div>
            <p className="text-sm text-slate-500 mt-1 font-mono">
              {application.reference}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge tone="brand">
                {levelLabel(application.requestedLevelId)}
              </Badge>
              <Badge tone="slate">{application.academicYear}</Badge>
              <Badge tone={complete ? 'green' : 'orange'}>
                {complete ? m.detail.complete : m.detail.incomplete(missing.length)}
              </Badge>
              {application.requestedClassId && (
                <Badge tone="blue">
                  {classLabel(classes, application.requestedClassId)}
                </Badge>
              )}
            </div>
          </div>

          {isYearWritable && application.status !== 'inscrite' && (
            <Can permission="students.create">
              <div className="flex flex-wrap gap-2">
                {application.status === 'brouillon' && (
                  <Button
                    onClick={() =>
                      patch(
                        { status: 'soumise', submittedAt: todayIso() },
                        m.detail.toasts.submitted,
                      )
                    }
                  >
                    <Send size={16} aria-hidden="true" />
                    {m.detail.actions.submit}
                  </Button>
                )}

                {application.status === 'soumise' && !complete && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setStatus('incomplete', m.detail.toasts.incomplete)
                    }
                  >
                    <FileWarning size={16} aria-hidden="true" />
                    {m.detail.actions.markIncomplete}
                  </Button>
                )}

                {(application.status === 'soumise' ||
                  application.status === 'incomplete') && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setDecision('validate');
                        setNote('');
                        setAssignedClassId(application.requestedClassId);
                      }}
                    >
                      <CheckCircle2 size={16} aria-hidden="true" />
                      {m.detail.actions.validate}
                    </Button>
                    <Button
                      variant="dangerSoft"
                      onClick={() => {
                        setDecision('reject');
                        setNote('');
                      }}
                    >
                      <XCircle size={16} aria-hidden="true" />
                      {m.detail.actions.reject}
                    </Button>
                  </>
                )}

                {application.status === 'refusee' && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setStatus('soumise', m.detail.toasts.reopened)
                    }
                  >
                    <RotateCcw size={16} aria-hidden="true" />
                    {m.detail.actions.reopen}
                  </Button>
                )}

                <Button
                  onClick={() => setConfirmEnroll(true)}
                  disabled={!canEnroll}
                  title={canEnroll ? undefined : m.detail.enrollBlocked}
                >
                  <UserPlus size={16} aria-hidden="true" />
                  {m.detail.actions.enroll}
                </Button>
              </div>
            </Can>
          )}

          {application.status === 'inscrite' && application.createdStudentId && (
            <LinkButton
              href={href(`/students/${application.createdStudentId}`)}
              variant="outline"
            >
              {m.detail.openStudent}
            </LinkButton>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div className="space-y-5 sm:space-y-6">
          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              {m.detail.candidate}
            </h2>
            <dl>
              <DataRow label="Nom complet" value={candidate} />
              <DataRow
                label={m.form.fields.birthDate}
                value={formatDate(application.birthDate)}
              />
              <DataRow
                label={m.form.fields.birthPlace}
                value={application.birthPlace}
              />
              <DataRow
                label={m.form.fields.gender}
                value={genderLabels[application.gender]}
              />
              <DataRow
                label={m.form.fields.nationality}
                value={application.nationality}
              />
              <DataRow label={m.form.fields.address} value={application.address} />
              <DataRow
                label={m.form.fields.previousSchool}
                value={application.previousSchool}
              />
            </dl>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              {m.detail.guardian}
            </h2>
            {guardian ? (
              <dl>
                <DataRow
                  label="Nom"
                  value={
                    <Link
                      href={href(`/guardians/${guardian.id}`)}
                      className="text-brand-600 hover:underline"
                    >
                      {guardianName(guardian)}
                    </Link>
                  }
                />
                <DataRow
                  label="Relation"
                  value={guardianRelationLabels[application.guardianRelation]}
                />
                <DataRow label="Téléphone" value={guardian.phone} />
                <DataRow label="Email" value={guardian.email} />
              </dl>
            ) : (
              <p className="text-sm text-slate-500">
                Aucun tuteur rattaché à ce dossier.
              </p>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          <Card className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-3 justify-between items-start mb-4">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {m.detail.documentsTitle}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {m.detail.documentsHint}
                </p>
              </div>
              <Badge tone={complete ? 'green' : 'orange'}>
                {m.list.documentsCount(
                  application.documents.length - missing.length,
                  application.documents.length,
                )}
              </Badge>
            </div>

            {application.documents.length === 0 ? (
              <EmptyState
                title="Aucune pièce exigée"
                message="L’établissement n’a défini aucune pièce justificative dans Paramètres."
                icon={<FileWarning size={24} aria-hidden="true" />}
                action={
                  <LinkButton
                    href={href('/settings/enrollment')}
                    variant="outline"
                  >
                    Régler les pièces exigées
                  </LinkButton>
                }
              />
            ) : (
              <ul className="space-y-2">
                {application.documents.map((document) => (
                  <li key={document.name}>
                    <Checkbox
                      label={document.name}
                      description={
                        document.provided && document.receivedAt
                          ? m.detail.received(formatDate(document.receivedAt))
                          : undefined
                      }
                      checked={document.provided}
                      disabled={
                        !isYearWritable || application.status === 'inscrite'
                      }
                      onChange={(event) =>
                        toggleDocument(document.name, event.target.checked)
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              {m.detail.decisionTitle}
            </h2>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-2.5 mb-4">
              <Info
                size={16}
                className="text-slate-400 mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <p className="text-xs text-slate-600 leading-relaxed">
                {requiresApproval
                  ? m.detail.approvalRequired
                  : m.detail.approvalNotRequired}
              </p>
            </div>

            <dl>
              <DataRow
                label="Déposé le"
                value={
                  application.submittedAt
                    ? formatDate(application.submittedAt)
                    : 'Non déposé'
                }
              />
              <DataRow
                label="Décision"
                value={
                  application.decidedAt
                    ? `${formatDate(application.decidedAt)} par ${application.decidedBy}`
                    : 'En attente'
                }
              />
              <DataRow
                label={m.detail.decisionNote}
                value={application.decisionNote}
              />
              {application.createdStudentId && (
                <DataRow
                  label={m.detail.createdStudent}
                  value={
                    <Link
                      href={href(`/students/${application.createdStudentId}`)}
                      className="text-brand-600 hover:underline"
                    >
                      {candidate}
                    </Link>
                  }
                />
              )}
            </dl>
          </Card>
        </div>
      </div>

      {/* Décision motivée */}
      <Modal
        open={decision !== null}
        onClose={() => setDecision(null)}
        title={
          decision === 'validate' ? m.detail.validateTitle : m.detail.rejectTitle
        }
        description={
          decision === 'validate'
            ? m.detail.validatePrompt
            : m.detail.rejectPrompt
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setDecision(null)}>
              {ui.cancel}
            </Button>
            <Button
              variant={decision === 'validate' ? 'primary' : 'danger'}
              onClick={submitDecision}
            >
              {decision === 'validate'
                ? m.detail.actions.validate
                : m.detail.actions.reject}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {decision === 'validate' && (
            <Field label={m.detail.assignClass} htmlFor="assigned-class">
              <Select
                id="assigned-class"
                value={assignedClassId}
                options={classOptions(classes)}
                placeholder="Affecter plus tard"
                onChange={(event) => setAssignedClassId(event.target.value)}
              />
            </Field>
          )}

          <Field label={m.detail.decisionNote} htmlFor="decision-note" required>
            <Textarea
              id="decision-note"
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmEnroll}
        title={m.detail.enrollTitle}
        message={m.detail.enrollMessage(candidate)}
        destructive={false}
        confirmLabel={m.detail.actions.enroll}
        onCancel={() => setConfirmEnroll(false)}
        onConfirm={enroll}
      />
    </PageContainer>
  );
}
