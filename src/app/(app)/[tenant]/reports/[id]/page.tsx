'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  FileText,
  Info,
  Lock,
  PenLine,
  Printer,
  RefreshCw,
} from 'lucide-react';
import { isReportFrozen } from '@/types';
import type { AppliedSignature } from '@/types';
import { REFERENCE_DATE } from '@/data/academic';
import { ui } from '@/i18n/fr';
import { Can, useSession } from '@/lib/auth/session';
import { useHref } from '@/lib/hooks';
import { useSchoolData } from '@/lib/store/school-data';
import { useAudit } from '@/lib/audit/use-audit';
import { studentName } from '@/lib/selectors';
import { reportStatusMeta } from '@/lib/status';
import { formatDate } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  LinkButton,
  Modal,
  SignaturePad,
  StatusBadge,
  Textarea,
  useToast,
} from '@/components/ui';
import { ReportCardView } from '@/features/reports/components/ReportCardView';
import { buildSnapshot } from '@/features/reports/queries';
import { useReportContext } from '@/features/reports/use-report-context';
import { reportMessages as m } from '@/features/reports/messages';

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const href = useHref();
  const toast = useToast();
  const { reports, students, config, actions } = useSchoolData();
  const { isYearWritable } = useSession();
  const audit = useAudit();

  const report = reports.find((item) => item.id === id);
  const [comment, setComment] = useState(report?.councilComment ?? '');
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [signDataUrl, setSignDataUrl] = useState('');
  const [signerName, setSignerName] = useState(config.signature.signerName);
  const [signerRole, setSignerRole] = useState(config.signature.signerRole);

  const context = useReportContext(
    report?.classId ?? '',
    report?.periodId ?? '',
  );

  if (!report || !report.snapshot) {
    return (
      <Card>
        <EmptyState
          title={m.detail.notFoundTitle}
          message={m.detail.notFoundMessage}
          icon={<FileText size={24} aria-hidden="true" />}
          action={
            <LinkButton href={href('/reports')} variant="outline">
              {m.detail.backToList}
            </LinkButton>
          }
        />
      </Card>
    );
  }

  const frozen = isReportFrozen(report);
  const student = students.find((item) => item.id === report.studentId);

  function regenerate() {
    if (!context || !student) return;
    actions.reports.update(report!.id, {
      snapshot: buildSnapshot(student, context, comment, REFERENCE_DATE),
      generatedAt: REFERENCE_DATE,
      councilComment: comment,
    });
    toast.success(m.detail.toasts.regenerated);
  }

  function saveComment() {
    if (!context || !student) return;
    actions.reports.update(report!.id, {
      councilComment: comment,
      // L'appréciation fait partie du document : elle entre dans l'instantané.
      snapshot: buildSnapshot(student, context, comment, REFERENCE_DATE),
    });
    toast.success(m.detail.toasts.commentSaved);
  }

  /** Signature apposée sur ce bulletin précis, en lieu et place de celle par défaut. */
  function applySignature() {
    if (!context || !student) return;
    if (!signDataUrl) {
      toast.error(m.detail.toasts.signatureMissing);
      return;
    }

    const applied: AppliedSignature = {
      dataUrl: signDataUrl,
      signerName: signerName.trim() || config.signature.signerName,
      signerRole: signerRole.trim() || config.signature.signerRole,
      signedAt: REFERENCE_DATE,
    };

    actions.reports.update(report!.id, {
      signatureOverride: applied,
      snapshot: buildSnapshot(
        student,
        context,
        comment,
        REFERENCE_DATE,
        applied,
      ),
    });
    audit({
      action: 'reports.sign',
      resourceType: 'Bulletin',
      resourceId: report!.id,
      resourceLabel: student ? studentName(student) : report!.studentId,
      detail: `Signé par ${applied.signerName} (${applied.signerRole}), en remplacement de la signature d'établissement.`,
    });
    setSignOpen(false);
    toast.success(m.detail.toasts.signed);
  }

  /** Revient à la signature d'établissement. */
  function resetSignature() {
    if (!context || !student) return;
    actions.reports.update(report!.id, {
      signatureOverride: null,
      snapshot: buildSnapshot(student, context, comment, REFERENCE_DATE, null),
    });
    audit({
      action: 'reports.sign',
      resourceType: 'Bulletin',
      resourceId: report!.id,
      resourceLabel: student ? studentName(student) : report!.studentId,
      detail: 'Signature propre au bulletin retirée : la signature d’établissement s’applique de nouveau.',
    });
    setSignOpen(false);
    setSignDataUrl('');
    toast.success(m.detail.toasts.signatureReset);
  }

  function publish() {
    actions.reports.update(report!.id, {
      status: 'publie',
      publishedAt: REFERENCE_DATE,
    });
    audit({
      action: 'reports.publish',
      resourceType: 'Bulletin',
      resourceId: report!.id,
      resourceLabel: student ? studentName(student) : report!.studentId,
      detail: 'Bulletin publié : contenu, modèle et signature sont figés et visibles par la famille.',
    });
    setConfirmPublish(false);
    toast.success(m.detail.toasts.published);
  }

  return (
    <>
      <Card className="p-4 sm:p-6 print-hidden">
        <nav aria-label={ui.breadcrumb} className="mb-4">
          <Link
            href={href('/reports')}
            className="text-xs text-slate-500 hover:text-brand-600 transition-colors rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            {m.detail.back}
          </Link>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {report.snapshot.student.fullName}
              </h1>
              <StatusBadge meta={reportStatusMeta(report.status)} />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {report.snapshot.student.className} ·{' '}
              {report.snapshot.periodLabel} · {report.snapshot.academicYear}
            </p>
            <div className="mt-2">
              {report.snapshot.signature ? (
                <Badge tone="green" dot>
                  {m.detail.signedBy(report.snapshot.signature.signerName)}
                </Badge>
              ) : (
                <Badge tone="yellow" dot>
                  {m.detail.notSigned}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Can permission="reports.download">
              <Button variant="outline" onClick={() => window.print()}>
                <Printer size={16} aria-hidden="true" /> {m.detail.print}
              </Button>
            </Can>
            {!frozen && isYearWritable && (
              <>
                <Can permission="reports.generate">
                  <Button variant="outline" onClick={regenerate}>
                    <RefreshCw size={16} aria-hidden="true" />{' '}
                    {m.detail.regenerate}
                  </Button>
                </Can>
                <Can permission="reports.generate">
                  <Button variant="outline" onClick={() => setSignOpen(true)}>
                    <PenLine size={16} aria-hidden="true" /> {m.detail.sign}
                  </Button>
                </Can>
                <Can permission="grades.publish">
                  <Button onClick={() => setConfirmPublish(true)}>
                    <CheckCircle2 size={16} aria-hidden="true" />{' '}
                    {m.detail.publish}
                  </Button>
                </Can>
              </>
            )}
          </div>
        </div>

        {/* Statut d'immuabilité */}
        <div
          className={
            frozen
              ? 'mt-5 bg-green-50 border border-green-100 rounded-xl p-3 flex items-start gap-2.5'
              : 'mt-5 bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-2.5'
          }
        >
          {frozen ? (
            <Lock
              size={16}
              className="text-green-600 mt-0.5 shrink-0"
              aria-hidden="true"
            />
          ) : (
            <Info
              size={16}
              className="text-slate-400 mt-0.5 shrink-0"
              aria-hidden="true"
            />
          )}
          <p
            className={
              frozen
                ? 'text-xs text-green-800 leading-relaxed'
                : 'text-xs text-slate-600 leading-relaxed'
            }
          >
            {frozen
              ? m.detail.frozenNotice(formatDate(report.publishedAt))
              : m.detail.draftNotice}
          </p>
        </div>
      </Card>

      {/* Appréciation du conseil */}
      {!frozen && isYearWritable && (
        <Can permission="reports.generate">
          <Card className="p-4 sm:p-6 print-hidden">
            <Field label={m.detail.councilComment} htmlFor="council-comment">
              <Textarea
                id="council-comment"
                rows={3}
                value={comment}
                placeholder={m.detail.councilPlaceholder}
                onChange={(event) => setComment(event.target.value)}
              />
            </Field>
            <div className="flex justify-end mt-3">
              <Button variant="outline" size="sm" onClick={saveComment}>
                {m.detail.saveComment}
              </Button>
            </div>
          </Card>
        </Can>
      )}

      <ReportCardView snapshot={report.snapshot} />

      {/* Signature à la demande */}
      <Modal
        open={signOpen}
        onClose={() => setSignOpen(false)}
        title={m.detail.signTitle}
        description={m.detail.signDescription}
        footer={
          <>
            <Button variant="outline" onClick={resetSignature}>
              {m.detail.signDefault}
            </Button>
            <Button onClick={applySignature}>{m.detail.sign}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <SignaturePad
            label="Signature"
            hint="Tracez dans le cadre, ou importez une image."
            value={signDataUrl}
            onChange={setSignDataUrl}
            onError={toast.error}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nom du signataire" htmlFor="report-signer-name">
              <Input
                id="report-signer-name"
                value={signerName}
                onChange={(event) => setSignerName(event.target.value)}
              />
            </Field>
            <Field label="Qualité" htmlFor="report-signer-role">
              <Input
                id="report-signer-role"
                value={signerRole}
                onChange={(event) => setSignerRole(event.target.value)}
              />
            </Field>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmPublish}
        title={m.detail.publishTitle}
        message={m.detail.publishMessage(report.snapshot.student.fullName)}
        destructive={false}
        confirmLabel={m.detail.publish}
        onCancel={() => setConfirmPublish(false)}
        onConfirm={publish}
      />
    </>
  );
}
