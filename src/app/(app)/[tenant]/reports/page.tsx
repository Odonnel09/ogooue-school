'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Eye, FileText, Sigma, Users } from 'lucide-react';
import type { ReportCard } from '@/types';
import { REFERENCE_DATE } from '@/data/academic';
import { decisionLabels, ui } from '@/i18n/fr';
import { Can, useSession } from '@/lib/auth/session';
import { useHref } from '@/lib/hooks';
import { useSchoolData } from '@/lib/store/school-data';
import { studentName } from '@/lib/selectors';
import { classOptions, periodOptions } from '@/lib/options';
import { reportStatusMeta } from '@/lib/status';
import { average as mean } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  LinkButton,
  Select,
  StatCard,
  StatusBadge,
  TD,
  TH,
  THead,
  TRow,
  Table,
  TableWrapper,
  useToast,
} from '@/components/ui';
import { buildSnapshot, rankingOf } from '@/features/reports/queries';
import {
  reportIdFor,
  useReportContext,
} from '@/features/reports/use-report-context';
import { reportMessages as m } from '@/features/reports/messages';

export default function ReportsPage() {
  const href = useHref();
  const toast = useToast();
  const { classes, config, reports, actions } = useSchoolData();
  const { isYearWritable } = useSession();

  const activeClasses = useMemo(
    () => classes.filter((item) => item.status === 'active'),
    [classes],
  );

  const [classId, setClassId] = useState('');
  const [periodId, setPeriodId] = useState('');
  const [confirmPublish, setConfirmPublish] = useState(false);

  const context = useReportContext(classId, periodId);
  const ranking = useMemo(() => (context ? rankingOf(context) : []), [context]);

  const rows = useMemo(() => {
    if (!context) return [];
    return context.roster
      .map((student) => {
        const result = ranking.find(
          (entry) => entry.studentId === student.id,
        );
        const report = reports.find(
          (item) => item.id === reportIdFor(classId, periodId, student.id),
        );
        return {
          student,
          // Un bulletin publié affiche sa valeur figée, pas le calcul du jour.
          average: report?.snapshot?.average ?? result?.average ?? null,
          rank: report?.snapshot?.rank ?? result?.rank ?? null,
          report,
        };
      })
      .sort((a, b) => {
        if (a.rank === null) return 1;
        if (b.rank === null) return -1;
        return a.rank - b.rank;
      });
  }, [context, ranking, reports, classId, periodId]);

  const hasGrades = ranking.some((entry) => entry.average !== null);

  const stats = useMemo(
    () => ({
      students: rows.length,
      classAverage: mean(
        rows
          .map((row) => row.average)
          .filter((value): value is number => value !== null),
      ),
      generated: rows.filter((row) => row.report).length,
      published: rows.filter((row) => row.report?.status === 'publie').length,
    }),
    [rows],
  );

  function generateAll() {
    if (!context) return;

    let count = 0;
    context.roster.forEach((student) => {
      const id = reportIdFor(classId, periodId, student.id);
      const existing = reports.find((item) => item.id === id);

      // Un bulletin publié ne se recalcule pas.
      if (existing?.status === 'publie') return;

      const snapshot = buildSnapshot(
        student,
        context,
        existing?.councilComment ?? '',
        REFERENCE_DATE,
        existing?.signatureOverride ?? null,
      );

      const card: ReportCard = {
        id,
        studentId: student.id,
        classId,
        academicYear: context.schoolClass.academicYear,
        periodId,
        status: 'genere',
        snapshot,
        generatedAt: REFERENCE_DATE,
        publishedAt: '',
        councilComment: existing?.councilComment ?? '',
        signatureOverride: existing?.signatureOverride ?? null,
      };

      if (existing) actions.reports.update(id, card);
      else actions.reports.create(card);
      count += 1;
    });

    toast.success(m.list.toasts.generated(count));
  }

  function publishAll() {
    let count = 0;
    rows.forEach((row) => {
      if (!row.report || row.report.status === 'publie') return;
      actions.reports.update(row.report.id, {
        status: 'publie',
        publishedAt: REFERENCE_DATE,
      });
      count += 1;
    });
    setConfirmPublish(false);
    toast.success(m.list.toasts.published(count));
  }

  return (
    <>
      <Card className="p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <Field label={m.list.selectClass} htmlFor="report-class">
            <Select
              id="report-class"
              value={classId}
              options={classOptions(activeClasses)}
              placeholder="Sélectionner une classe"
              onChange={(event) => setClassId(event.target.value)}
            />
          </Field>

          <Field label={m.list.selectPeriod} htmlFor="report-period">
            <Select
              id="report-period"
              value={periodId}
              options={periodOptions(config.periods, config.activeCycles)}
              placeholder="Sélectionner une période"
              onChange={(event) => setPeriodId(event.target.value)}
            />
          </Field>

          {context && hasGrades && isYearWritable && (
            <div className="sm:col-span-2 flex flex-wrap gap-2 justify-end">
              <Can permission="reports.generate">
                <Button variant="outline" onClick={generateAll}>
                  <FileText size={16} aria-hidden="true" /> {m.list.generateAll}
                </Button>
              </Can>
              <Can permission="grades.publish">
                <Button
                  onClick={() => setConfirmPublish(true)}
                  disabled={stats.generated === 0}
                >
                  <CheckCircle2 size={16} aria-hidden="true" />{' '}
                  {m.list.publishAll}
                </Button>
              </Can>
            </div>
          )}
        </div>
      </Card>

      {!context ? (
        <Card>
          <EmptyState
            title={m.list.selectPrompt}
            message={m.list.selectPromptMessage}
            icon={<FileText size={24} aria-hidden="true" />}
          />
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            title={m.list.emptyTitle}
            message={m.list.emptyMessage}
            icon={<Users size={24} aria-hidden="true" />}
          />
        </Card>
      ) : !hasGrades ? (
        <Card>
          <EmptyState
            title={m.list.noEvaluationTitle}
            message={m.list.noEvaluationMessage}
            icon={<Sigma size={24} aria-hidden="true" />}
            action={
              <LinkButton href={href('/evaluations')} variant="outline">
                {m.list.goToEvaluations}
              </LinkButton>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              label={m.list.stats.students}
              value={stats.students}
              icon={<Users size={22} aria-hidden="true" />}
              tone="brand"
            />
            <StatCard
              label={m.list.stats.classAverage}
              value={
                stats.classAverage === null
                  ? '—'
                  : `${stats.classAverage.toFixed(2).replace('.', ',')}/20`
              }
              icon={<Sigma size={22} aria-hidden="true" />}
              tone="blue"
            />
            <StatCard
              label={m.list.stats.generated}
              value={stats.generated}
              icon={<FileText size={22} aria-hidden="true" />}
              tone="orange"
            />
            <StatCard
              label={m.list.stats.published}
              value={stats.published}
              icon={<CheckCircle2 size={22} aria-hidden="true" />}
              tone="green"
            />
          </div>

          <Card className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {m.list.tableTitle}
              </h2>
              <Badge tone="brand">{ui.results(rows.length)}</Badge>
            </div>

            <TableWrapper>
              <Table>
                <THead>
                  <tr>
                    <TH scope="col" className="w-16">
                      {m.list.columns.rank}
                    </TH>
                    <TH scope="col">{m.list.columns.student}</TH>
                    <TH scope="col">{m.list.columns.matricule}</TH>
                    <TH scope="col" className="text-center">
                      {m.list.columns.average}
                    </TH>
                    <TH scope="col">{m.list.columns.decision}</TH>
                    <TH scope="col">{m.list.columns.status}</TH>
                    <TH scope="col" className="text-right">
                      {m.list.columns.actions}
                    </TH>
                  </tr>
                </THead>
                <tbody>
                  {rows.map((row) => (
                    <TRow key={row.student.id} highlighted={row.rank === 1}>
                      <TD className="font-medium text-slate-900">
                        {row.rank ?? '—'}
                      </TD>
                      <TD>
                        <Link
                          href={href(`/students/${row.student.id}`)}
                          className="font-medium text-slate-900 hover:text-brand-600 transition-colors rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                        >
                          {studentName(row.student)}
                        </Link>
                      </TD>
                      <TD className="font-mono text-xs">
                        {row.student.matricule}
                      </TD>
                      <TD className="text-center font-medium text-slate-900">
                        {row.average === null
                          ? '—'
                          : `${row.average.toFixed(2).replace('.', ',')}/20`}
                      </TD>
                      <TD>
                        {row.report?.snapshot
                          ? decisionLabels[row.report.snapshot.decision.kind]
                          : '—'}
                      </TD>
                      <TD>
                        <StatusBadge
                          meta={reportStatusMeta(row.report?.status ?? 'brouillon')}
                        />
                      </TD>
                      <TD className="text-right">
                        {row.report ? (
                          <Link
                            href={href(`/reports/${row.report.id}`)}
                            aria-label={`Ouvrir le bulletin de ${studentName(row.student)}`}
                            className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                          >
                            <Eye size={16} aria-hidden="true" />
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Non généré
                          </span>
                        )}
                      </TD>
                    </TRow>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          </Card>
        </>
      )}

      <ConfirmDialog
        open={confirmPublish}
        title={m.list.publishTitle}
        message={m.list.publishMessage(stats.generated - stats.published)}
        destructive={false}
        confirmLabel={m.list.publishAll}
        onCancel={() => setConfirmPublish(false)}
        onConfirm={publishAll}
      />
    </>
  );
}
