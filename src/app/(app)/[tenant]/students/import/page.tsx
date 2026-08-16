'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  FileSpreadsheet,
  Info,
  ShieldAlert,
  Upload,
} from 'lucide-react';
import { CURRENT_ACADEMIC_YEAR } from '@/data/academic';
import { ui } from '@/i18n/fr';
import { useAudit } from '@/lib/audit/use-audit';
import { Can, useSession } from '@/lib/auth/session';
import { useHref } from '@/lib/hooks';
import { useCapabilities } from '@/lib/school-levels/use-capabilities';
import { useSchoolData } from '@/lib/store/school-data';
import { downloadCsv } from '@/lib/export';
import {
  CsvError,
  isAcceptedFile,
  isWorkbook,
  parseDelimited,
  type ParsedSheet,
} from '@/lib/import/csv';
import { cn, createId, todayIso } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  ConfirmDialog,
  EmptyState,
  LinkButton,
  PageContainer,
  PageHeader,
  Select,
  StatCard,
  TD,
  TH,
  THead,
  TRow,
  Table,
  TableWrapper,
  useToast,
} from '@/components/ui';
import { DropZone } from '@/features/import/components/DropZone';
import { columnsFor, guessColumn } from '@/features/import/columns';
import {
  checkRows,
  summarize,
  type CheckedRow,
  type RowStatus,
} from '@/features/import/validate';
import { importMessages as m } from '@/features/import/messages';

type Step = 'upload' | 'mapping' | 'preview' | 'done';

const STEPS: Step[] = ['upload', 'mapping', 'preview', 'done'];

const STATUS_TONES: Record<RowStatus, 'green' | 'red' | 'orange'> = {
  valide: 'green',
  erreur: 'red',
  doublon: 'orange',
};

export default function StudentImportPage() {
  const href = useHref();
  const toast = useToast();
  const audit = useAudit();
  const capabilities = useCapabilities();
  const { students, classes, actions } = useSchoolData();
  const { can, isYearWritable } = useSession();

  const today = todayIso();
  const columns = useMemo(
    () => columnsFor(capabilities.studentFields),
    [capabilities.studentFields],
  );

  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [sheet, setSheet] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<Record<string, number>>({});
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(
    null,
  );
  const [onlyProblems, setOnlyProblems] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [imported, setImported] = useState(0);
  const [rejected, setRejected] = useState(0);

  /* ---------------------------------------------------------------- Étape 1 */

  async function accept(file: File) {
    setNotice(null);

    if (isWorkbook(file.name)) {
      setNotice({
        title: m.upload.workbookTitle,
        message: m.upload.workbookMessage,
      });
      return;
    }
    if (!isAcceptedFile(file.name)) {
      setNotice({
        title: m.upload.rejectedTitle,
        message: m.upload.rejectedMessage,
      });
      return;
    }

    try {
      const parsed = parseDelimited(await file.text());
      // Pré-mappage : ce qui est reconnu est proposé, jamais imposé.
      const guessed: Record<string, number> = {};
      columns.forEach((column) => {
        guessed[column.key] = parsed.headers.findIndex(
          (header) => guessColumn(header, columns) === column.key,
        );
      });

      setSheet(parsed);
      setFileName(file.name);
      setMapping(guessed);
      setStep('mapping');
    } catch (error) {
      setNotice({
        title: m.upload.readError,
        message:
          error instanceof CsvError
            ? error.message
            : 'Vérifiez que le fichier est bien un texte délimité.',
      });
    }
  }

  function downloadTemplate() {
    downloadCsv(
      'modele-import-eleves.csv',
      columns.map((column) => column.label),
      [
        columns.map((column) => column.sample),
        columns.map((column) =>
          column.key === 'matricule'
            ? 'MAT-3002'
            : column.key === 'lastName'
              ? 'Mintsa'
              : column.key === 'firstName'
                ? 'Sarah'
                : column.key === 'gender'
                  ? 'F'
                  : column.sample,
        ),
      ],
    );
    toast.success('Modèle téléchargé.');
  }

  /* ---------------------------------------------------------------- Étape 3 */

  const checked = useMemo<CheckedRow[]>(() => {
    if (!sheet) return [];
    return checkRows({
      rows: sheet.rows,
      mapping,
      columns,
      classes,
      existingMatricules: students.map((student) => student.matricule),
      academicYear: CURRENT_ACADEMIC_YEAR,
      today,
    });
  }, [sheet, mapping, columns, classes, students, today]);

  const summary = useMemo(() => summarize(checked), [checked]);

  const missingRequired = columns.filter(
    (column) => column.required && (mapping[column.key] ?? -1) < 0,
  );

  const visibleRows = onlyProblems
    ? checked.filter((row) => row.status !== 'valide')
    : checked;

  function exportReport() {
    downloadCsv(
      'rapport-import-eleves.csv',
      [
        m.preview.columns.line,
        m.preview.columns.status,
        m.preview.columns.student,
        m.preview.columns.matricule,
        m.preview.columns.className,
        m.preview.columns.issues,
      ],
      checked.map((row) => [
        `${row.line}`,
        m.status[row.status],
        `${row.values.lastName ?? ''} ${row.values.firstName ?? ''}`.trim(),
        row.values.matricule ?? '',
        row.values.className ?? '',
        row.issues.map((issue) => issue.message).join(' | '),
      ]),
    );
    toast.success('Rapport exporté.');
  }

  /* ---------------------------------------------------------------- Étape 4 */

  function runImport() {
    const ready = checked.filter((row) => row.student);

    ready.forEach((row) => {
      if (!row.student) return;
      actions.students.create({ ...row.student, id: createId('std') });
    });

    audit({
      action: 'students.import',
      resourceType: 'Import d’élèves',
      resourceId: fileName,
      resourceLabel: fileName,
      detail: `${ready.length} fiche(s) créée(s) depuis « ${fileName} » ; ${
        summary.errors + summary.duplicates
      } ligne(s) écartée(s).`,
    });

    setImported(ready.length);
    setRejected(summary.errors + summary.duplicates);
    setConfirmOpen(false);
    setStep('done');
    toast.success(m.done.message(ready.length));
  }

  function restart() {
    setSheet(null);
    setFileName('');
    setMapping({});
    setNotice(null);
    setOnlyProblems(false);
    setImported(0);
    setRejected(0);
    setStep('upload');
  }

  /* ---------------------------------------------------------------- Rendu   */

  if (!can('students.create')) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title="Accès non autorisé"
            message="Votre rôle ne permet pas de créer des élèves, et donc pas d’en importer."
            icon={<ShieldAlert size={24} aria-hidden="true" />}
            action={
              <LinkButton href={href('/students')} variant="outline">
                Retour aux élèves
              </LinkButton>
            }
          />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card className="p-4 sm:p-6">
        <nav aria-label={ui.breadcrumb} className="mb-4">
          <Link
            href={href('/students')}
            className="text-xs text-slate-500 hover:text-brand-600 transition-colors rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            {m.back}
          </Link>
        </nav>

        <PageHeader title={m.title} description={m.description} />

        <ol className="flex flex-wrap items-center gap-2 mt-5">
          {STEPS.map((key, index) => {
            const position = STEPS.indexOf(step);
            const done = index < position;
            const current = index === position;

            return (
              <li key={key} className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
                    current
                      ? 'bg-brand-600 text-white'
                      : done
                        ? 'bg-brand-50 text-brand-600'
                        : 'bg-slate-50 text-slate-400',
                  )}
                >
                  <span
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-[11px]',
                      current
                        ? 'bg-white/20'
                        : done
                          ? 'bg-brand-100'
                          : 'bg-slate-200/70',
                    )}
                  >
                    {done ? (
                      <CheckCircle2 size={12} aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  {m.steps[key]}
                </span>
                {index < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="w-4 h-px bg-slate-200 hidden sm:block"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </Card>

      {!isYearWritable && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle
            size={18}
            className="text-yellow-600 mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <p className="text-xs text-yellow-800 leading-relaxed">
            L’année sélectionnée est clôturée : l’import est désactivé.
          </p>
        </div>
      )}

      {/* ------------------------------------------------------- Étape 1 */}
      {step === 'upload' && (
        <Card className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900">
                {m.upload.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                {m.upload.templateHint}
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download size={16} aria-hidden="true" /> {m.upload.template}
            </Button>
          </div>

          <DropZone onFile={accept} accept=".csv,.tsv,.txt" />

          {notice && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle
                size={18}
                className="text-yellow-600 mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-yellow-900">
                  {notice.title}
                </p>
                <p className="text-xs text-yellow-800 mt-1 leading-relaxed">
                  {notice.message}
                </p>
              </div>
            </div>
          )}

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {columns.map((column) => (
              <li
                key={column.key}
                className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-100"
              >
                <FileSpreadsheet
                  size={15}
                  aria-hidden="true"
                  className="text-slate-300 mt-0.5 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800">
                    {column.label}
                    {column.required && (
                      <span className="text-red-500 ml-0.5" aria-hidden="true">
                        *
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    {column.hint}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ------------------------------------------------------- Étape 2 */}
      {step === 'mapping' && sheet && (
        <Card className="p-4 sm:p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {m.mapping.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">{m.mapping.hint}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge tone="brand">{fileName}</Badge>
              <Badge tone="slate">
                {m.mapping.detected(sheet.headers.length)}
              </Badge>
              <Badge tone="slate">{ui.results(sheet.rows.length)}</Badge>
            </div>
          </div>

          {missingRequired.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle
                size={18}
                className="text-red-500 mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <p className="text-xs text-red-700 leading-relaxed">
                {m.mapping.missingRequired(
                  missingRequired.map((column) => column.label),
                )}
              </p>
            </div>
          )}

          <ul className="space-y-3">
            {columns.map((column) => {
              const position = mapping[column.key] ?? -1;
              const sample =
                position >= 0 ? (sheet.rows[0]?.[position] ?? '') : '';

              return (
                <li
                  key={column.key}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-3 items-center p-3 rounded-xl border border-slate-100"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {column.label}
                      {column.required && (
                        <Badge tone="red" className="ml-2">
                          {m.mapping.required}
                        </Badge>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {column.hint}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <Select
                      aria-label={`${m.mapping.targetColumn} — ${column.label}`}
                      value={`${position}`}
                      invalid={column.required && position < 0}
                      onChange={(event) =>
                        setMapping((previous) => ({
                          ...previous,
                          [column.key]: Number(event.target.value),
                        }))
                      }
                      options={[
                        { value: '-1', label: m.mapping.ignore },
                        ...sheet.headers.map((header, index) => ({
                          value: `${index}`,
                          label: header || `Colonne ${index + 1}`,
                        })),
                      ]}
                    />
                    {sample && (
                      <p className="text-[11px] text-slate-400 mt-1 truncate">
                        {m.mapping.sample} : « {sample} »
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button variant="outline" onClick={restart}>
              {m.actions.previous}
            </Button>
            <Button
              onClick={() => setStep('preview')}
              disabled={missingRequired.length > 0}
            >
              {m.actions.next}
            </Button>
          </div>
        </Card>
      )}

      {/* ------------------------------------------------------- Étape 3 */}
      {step === 'preview' && sheet && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              label={m.stats.total}
              value={summary.total}
              icon={<FileSpreadsheet size={22} aria-hidden="true" />}
              tone="brand"
            />
            <StatCard
              label={m.stats.valid}
              value={summary.valid}
              icon={<CheckCircle2 size={22} aria-hidden="true" />}
              tone="green"
            />
            <StatCard
              label={m.stats.errors}
              value={summary.errors}
              icon={<AlertTriangle size={22} aria-hidden="true" />}
              tone="red"
            />
            <StatCard
              label={m.stats.duplicates}
              value={summary.duplicates}
              icon={<Copy size={22} aria-hidden="true" />}
              tone="orange"
            />
          </div>

          <Card className="p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900">
                  {m.preview.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                  {m.preview.hint}
                </p>
              </div>
              <Button variant="outline" onClick={exportReport}>
                <Download size={16} aria-hidden="true" />{' '}
                {m.preview.exportReport}
              </Button>
            </div>

            <div className="mb-4">
              <Checkbox
                label={m.preview.onlyProblems}
                checked={onlyProblems}
                onChange={(event) => setOnlyProblems(event.target.checked)}
              />
            </div>

            {visibleRows.length === 0 ? (
              <EmptyState
                title={m.preview.noProblem}
                message="Toutes les lignes du fichier ont passé les contrôles."
                icon={<CheckCircle2 size={24} aria-hidden="true" />}
              />
            ) : (
              <>
                <TableWrapper className="hidden lg:block">
                  <Table>
                    <THead>
                      <tr>
                        <TH scope="col">{m.preview.columns.line}</TH>
                        <TH scope="col">{m.preview.columns.status}</TH>
                        <TH scope="col">{m.preview.columns.student}</TH>
                        <TH scope="col">{m.preview.columns.matricule}</TH>
                        <TH scope="col">{m.preview.columns.className}</TH>
                        <TH scope="col">{m.preview.columns.issues}</TH>
                      </tr>
                    </THead>
                    <tbody>
                      {visibleRows.map((row) => (
                        <TRow key={row.line}>
                          <TD className="font-mono text-xs">{row.line}</TD>
                          <TD>
                            <Badge tone={STATUS_TONES[row.status]}>
                              {m.status[row.status]}
                            </Badge>
                          </TD>
                          <TD>
                            {`${row.values.lastName ?? ''} ${row.values.firstName ?? ''}`.trim() ||
                              '—'}
                          </TD>
                          <TD className="font-mono text-xs">
                            {row.values.matricule || '—'}
                          </TD>
                          <TD>{row.values.className || '—'}</TD>
                          <TD className="text-xs text-slate-500 max-w-md">
                            {row.issues.length === 0
                              ? '—'
                              : row.issues
                                  .map((issue) => issue.message)
                                  .join(' · ')}
                          </TD>
                        </TRow>
                      ))}
                    </tbody>
                  </Table>
                </TableWrapper>

                <ul className="lg:hidden space-y-3">
                  {visibleRows.map((row) => (
                    <li
                      key={row.line}
                      className="border border-slate-100 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900">
                            {`${row.values.lastName ?? ''} ${row.values.firstName ?? ''}`.trim() ||
                              `Ligne ${row.line}`}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {row.values.matricule || '—'} ·{' '}
                            {row.values.className || '—'}
                          </p>
                        </div>
                        <Badge tone={STATUS_TONES[row.status]}>
                          {m.status[row.status]}
                        </Badge>
                      </div>
                      {row.issues.length > 0 && (
                        <ul className="mt-3 space-y-1">
                          {row.issues.map((issue) => (
                            <li
                              key={`${row.line}-${issue.column}`}
                              className="text-xs text-red-600 leading-relaxed"
                            >
                              {issue.message}
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="text-[11px] text-slate-400 mt-3">
                        Ligne {row.line} du fichier
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="flex flex-wrap justify-end gap-2 mt-5 pt-5 border-t border-slate-100">
              <Button variant="outline" onClick={() => setStep('mapping')}>
                {m.actions.previous}
              </Button>
              <Can permission="students.create" requiresWritableYear>
                <Button
                  onClick={() => setConfirmOpen(true)}
                  disabled={summary.valid === 0}
                >
                  <Upload size={16} aria-hidden="true" />{' '}
                  {m.actions.confirm(summary.valid)}
                </Button>
              </Can>
            </div>
          </Card>
        </>
      )}

      {/* ------------------------------------------------------- Étape 4 */}
      {step === 'done' && (
        <Card className="p-6 sm:p-10 text-center">
          <span className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={26} aria-hidden="true" />
          </span>
          <h2 className="text-lg font-bold text-slate-900">{m.done.title}</h2>
          <p className="text-sm text-slate-600 mt-2">
            {m.done.message(imported)}
          </p>
          {rejected > 0 && (
            <p className="text-xs text-orange-600 mt-2">
              {m.done.rejected(rejected)}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Button variant="outline" onClick={restart}>
              {m.actions.restart}
            </Button>
            <LinkButton href={href('/students')}>
              Voir la liste des élèves
            </LinkButton>
          </div>
        </Card>
      )}

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
        <Info
          size={18}
          aria-hidden="true"
          className="text-slate-400 mt-0.5 shrink-0"
        />
        <p className="text-xs text-slate-600 leading-relaxed">
          {m.serverNotice}
        </p>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={m.confirm.title}
        message={m.confirm.message(summary.valid)}
        destructive={false}
        confirmLabel={m.actions.confirm(summary.valid)}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={runImport}
      />
    </PageContainer>
  );
}
