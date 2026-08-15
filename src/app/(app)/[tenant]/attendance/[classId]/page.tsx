'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Save,
  UserRoundX,
  Users,
} from 'lucide-react';
import { CURRENT_USER } from '@/data/academic';

import type { AttendanceRecord, AttendanceStatus } from '@/types';
import { attendanceStatusMeta } from '@/lib/status';
import { useSchoolData } from '@/lib/store/school-data';
import { useHref } from '@/lib/hooks';
import { attendanceStats, classLabel, studentName } from '@/lib/selectors';
import { cn, createId, formatLongDate, todayIso } from '@/lib/utils';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  LinkButton,
  PageContainer,
  PageHeader,
  StatCard,
} from '@/components/ui';
import { useToast } from '@/components/ui';

const STATUS_ORDER: AttendanceStatus[] = ['present', 'retard', 'absent'];

const STATUS_STYLES: Record<AttendanceStatus, { active: string; idle: string }> = {
  present: {
    active: 'bg-green-500 text-white border-green-500',
    idle: 'bg-white text-slate-500 border-slate-200 hover:border-green-300 hover:text-green-600',
  },
  retard: {
    active: 'bg-orange-500 text-white border-orange-500',
    idle: 'bg-white text-slate-500 border-slate-200 hover:border-orange-300 hover:text-orange-600',
  },
  absent: {
    active: 'bg-red-500 text-white border-red-500',
    idle: 'bg-white text-slate-500 border-slate-200 hover:border-red-300 hover:text-red-600',
  },
};

export default function AttendanceSheetPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = use(params);
  const href = useHref();
  const toast = useToast();
  const { classes, students, sheets, actions } = useSchoolData();

  const [date, setDate] = useState(todayIso);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [saving, setSaving] = useState(false);

  const schoolClass = classes.find((item) => item.id === classId);

  const roster = useMemo(
    () =>
      students
        .filter(
          (student) =>
            student.classId === classId &&
            (student.status === 'actif' || student.status === 'en_attente'),
        )
        .sort((a, b) => studentName(a).localeCompare(studentName(b), 'fr')),
    [students, classId],
  );

  const existingSheet = useMemo(
    () =>
      sheets.find((sheet) => sheet.classId === classId && sheet.date === date),
    [sheets, classId, date],
  );

  /**
   * Charge la feuille existante ou initialise tous les élèves comme présents.
   * Ajustement pendant le rendu (et non dans un effet) afin d'éviter un rendu
   * en cascade : la grille est reconstruite dès que la classe, la date ou
   * l'effectif change.
   */
  const sheetKey = `${classId}|${date}|${roster.length}|${existingSheet?.id ?? ''}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  if (loadedKey !== sheetKey) {
    setLoadedKey(sheetKey);
    setRecords(
      roster.map((student) => {
        const saved = existingSheet?.records.find(
          (record) => record.studentId === student.id,
        );
        return saved ?? { studentId: student.id, status: 'present', note: '' };
      }),
    );
  }

  const stats = attendanceStats(records);

  function setStatus(studentId: string, status: AttendanceStatus) {
    setRecords((previous) =>
      previous.map((record) =>
        record.studentId === studentId ? { ...record, status } : record,
      ),
    );
  }

  function setNote(studentId: string, note: string) {
    setRecords((previous) =>
      previous.map((record) =>
        record.studentId === studentId ? { ...record, note } : record,
      ),
    );
  }

  function markAllPresent() {
    setRecords((previous) =>
      previous.map((record) => ({ ...record, status: 'present' })),
    );
  }

  function save() {
    setSaving(true);
    setTimeout(() => {
      actions.saveAttendanceSheet({
        id: existingSheet?.id ?? createId('att'),
        classId,
        date,
        records,
        takenBy: CURRENT_USER.fullName,
        savedAt: new Date().toISOString(),
      });
      setSaving(false);
      toast.success(
        `Feuille de présence du ${formatLongDate(date)} enregistrée (${stats.rate}% de présence).`,
      );
    }, 600);
  }

  if (!schoolClass) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title="Classe introuvable"
            message="Cette classe n’existe pas ou a été supprimée."
            icon={<Users size={24} />}
            action={
              <LinkButton href={href('/attendance')} variant="outline">
                Retour aux présences
              </LinkButton>
            }
          />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Appel — ${classLabel(classes, classId)}`}
        description={formatLongDate(date)}
        breadcrumb={[
          { label: 'Présences', href: href('/attendance') },
          { label: schoolClass.name },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              onClick={markAllPresent}
              disabled={roster.length === 0}
            >
              <CheckCircle2 size={16} /> Tous présents
            </Button>
            <Button
              onClick={save}
              loading={saving}
              disabled={roster.length === 0}
            >
              <Save size={16} /> Enregistrer la feuille
            </Button>
          </>
        }
      />

      <Card className="p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          <Field label="Date de l’appel" htmlFor="attendance-date">
            <Input
              id="attendance-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </Field>
          <div className="flex items-center gap-2 pb-1">
            {existingSheet ? (
              <Badge tone="blue" dot>
                Feuille déjà enregistrée — saisie par {existingSheet.takenBy}
              </Badge>
            ) : (
              <Badge tone="yellow" dot>
                Nouvelle feuille pour cette date
              </Badge>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Présents"
          value={stats.present}
          icon={<CheckCircle2 size={22} />}
          tone="green"
        />
        <StatCard
          label="Absents"
          value={stats.absent}
          icon={<UserRoundX size={22} />}
          tone="red"
        />
        <StatCard
          label="Retards"
          value={stats.retard}
          icon={<Clock size={22} />}
          tone="orange"
        />
        <StatCard
          label="Taux de présence"
          value={`${stats.rate}%`}
          icon={<Users size={22} />}
          tone="brand"
          hint={`${stats.total} élèves appelés`}
        />
      </div>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Liste d’appel
          </h2>
          <Badge tone="brand">{roster.length} élèves</Badge>
        </div>

        {roster.length === 0 ? (
          <EmptyState
            title="Aucun élève"
            message="Aucun élève actif n’est affecté à cette classe."
            icon={<CalendarCheck size={24} />}
            action={
              <LinkButton href={href('/students/new')} variant="outline">
                Ajouter un élève
              </LinkButton>
            }
          />
        ) : (
          <ul className="space-y-3">
            {roster.map((student) => {
              const record = records.find(
                (item) => item.studentId === student.id,
              );
              if (!record) return null;

              return (
                <li
                  key={student.id}
                  className="border border-slate-100 rounded-xl p-3 sm:p-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar
                        name={studentName(student)}
                        src={student.photoUrl}
                        size="md"
                      />
                      <div className="min-w-0">
                        <Link
                          href={href(`/students/${student.id}`)}
                          className="text-sm font-medium text-slate-900 hover:text-brand-600 transition-colors block truncate"
                        >
                          {studentName(student)}
                        </Link>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {student.matricule}
                        </p>
                      </div>
                    </div>

                    <div
                      role="group"
                      aria-label={`Statut de ${studentName(student)}`}
                      className="grid grid-cols-3 gap-2 lg:w-72 shrink-0"
                    >
                      {STATUS_ORDER.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setStatus(student.id, status)}
                          aria-pressed={record.status === status}
                          className={cn(
                            'px-2 py-2 rounded-xl border text-xs font-medium transition-colors',
                            record.status === status
                              ? STATUS_STYLES[status].active
                              : STATUS_STYLES[status].idle,
                          )}
                        >
                          {attendanceStatusMeta(status).label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {record.status !== 'present' && (
                    <div className="mt-3">
                      <Input
                        value={record.note}
                        onChange={(event) =>
                          setNote(student.id, event.target.value)
                        }
                        placeholder="Observation (justificatif, motif, remarque...)"
                        className="py-2.5 text-xs"
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </PageContainer>
  );
}
