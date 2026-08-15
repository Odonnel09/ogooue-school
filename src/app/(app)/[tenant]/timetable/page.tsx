'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Download,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { CURRENT_ACADEMIC_YEAR, TIME_SLOTS } from '@/data/academic';
import {
  WEEKDAYS,
} from '@/types';
import type { ScheduleSlot, ScheduleStatus, Weekday } from '@/types';
import { weekdayLabels } from '@/i18n/fr';
import { scheduleStatusMeta } from '@/lib/status';
import { useSchoolData } from '@/lib/store/school-data';
import { useSimulatedLoading } from '@/lib/hooks';
import {
  classLabel,
  conflictingSlotIds,
  detectConflicts,
  sortSlots,
  subjectLabel,
  teacherLabel,
} from '@/lib/selectors';
import {
  classOptions,
  roomOptions,
  subjectOptions,
  teacherOptions,
  yearOptions,
} from '@/lib/options';
import { createId, timeToMinutes } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  FilterSelect,
  InnerCard,
  Modal,
  PageContainer,
  PageHeader,
  Select,
  StatusBadge,
  Skeleton,
  useToast,
} from '@/components/ui';

interface SlotDraftState {
  day: Weekday;
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
  room: string;
}

const DAY_OPTIONS = WEEKDAYS.map((day) => ({
  value: day,
  label: weekdayLabels[day],
}));

const TIME_OPTIONS = TIME_SLOTS.map((time) => ({ value: time, label: time }));

export default function TimetablePage() {
  const toast = useToast();
  const ready = useSimulatedLoading();
  const { classes, subjects, teachers, slots, actions } = useSchoolData();

  const activeClasses = useMemo(
    () => classes.filter((item) => item.status !== 'archivee'),
    [classes],
  );

  const [year, setYear] = useState(CURRENT_ACADEMIC_YEAR);
  const [classId, setClassId] = useState(activeClasses[0]?.id ?? '');
  const [view, setView] = useState<'week' | 'day'>('week');
  const [day, setDay] = useState<Weekday>('lundi');

  const [editing, setEditing] = useState<ScheduleSlot | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<ScheduleSlot | null>(null);
  const [draft, setDraft] = useState<SlotDraftState>({
    day: 'lundi',
    startTime: '07:30',
    endTime: '09:30',
    subjectId: '',
    teacherId: '',
    room: '',
  });
  const [draftError, setDraftError] = useState<string | null>(null);

  const yearSlots = useMemo(
    () => slots.filter((slot) => slot.academicYear === year),
    [slots, year],
  );

  const classSlots = useMemo(
    () => sortSlots(yearSlots.filter((slot) => slot.classId === classId)),
    [yearSlots, classId],
  );

  /** Les conflits sont calculés sur tout l'établissement, pas seulement la classe. */
  const conflicts = useMemo(() => detectConflicts(yearSlots), [yearSlots]);
  const conflictIds = useMemo(() => conflictingSlotIds(conflicts), [conflicts]);

  const classConflicts = useMemo(
    () =>
      conflicts.filter(
        (conflict) =>
          classSlots.some((slot) => slot.id === conflict.slotId) ||
          classSlots.some((slot) => slot.id === conflict.otherSlotId),
      ),
    [conflicts, classSlots],
  );

  const status: ScheduleStatus = classSlots.some(
    (slot) => slot.status === 'brouillon',
  )
    ? 'brouillon'
    : 'valide';

  const visibleDays = view === 'week' ? WEEKDAYS : [day];

  function openCreate(prefillDay?: Weekday) {
    setDraft({
      day: prefillDay ?? (view === 'day' ? day : 'lundi'),
      startTime: '07:30',
      endTime: '09:30',
      subjectId: '',
      teacherId: '',
      room: '',
    });
    setDraftError(null);
    setCreating(true);
  }

  function openEdit(slot: ScheduleSlot) {
    setDraft({
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subjectId: slot.subjectId,
      teacherId: slot.teacherId,
      room: slot.room,
    });
    setDraftError(null);
    setEditing(slot);
  }

  function validateDraft(): string | null {
    if (!draft.subjectId) return 'Sélectionnez une matière.';
    if (!draft.teacherId) return 'Sélectionnez un enseignant.';
    if (!draft.room) return 'Sélectionnez une salle.';
    if (timeToMinutes(draft.endTime) <= timeToMinutes(draft.startTime)) {
      return 'L’heure de fin doit être postérieure à l’heure de début.';
    }
    return null;
  }

  function saveSlot() {
    const error = validateDraft();
    setDraftError(error);
    if (error) return;

    if (editing) {
      actions.slots.update(editing.id, { ...draft });
      toast.success('Le créneau a été modifié.');
      setEditing(null);
      return;
    }

    actions.slots.create({
      id: createId('slot'),
      classId,
      academicYear: year,
      status: 'brouillon',
      ...draft,
    });
    toast.success('Le créneau a été ajouté à l’emploi du temps.');
    setCreating(false);
  }

  function deleteSlot(slot: ScheduleSlot) {
    actions.slots.remove(slot.id);
    setToDelete(null);
    toast.success('Le créneau a été supprimé.');
  }

  function toggleStatus() {
    const next: ScheduleStatus = status === 'valide' ? 'brouillon' : 'valide';
    classSlots.forEach((slot) => actions.slots.update(slot.id, { status: next }));
    toast.success(
      next === 'valide'
        ? 'L’emploi du temps a été validé.'
        : 'L’emploi du temps est repassé en brouillon.',
    );
  }

  const modalOpen = creating || editing !== null;

  return (
    <PageContainer>
      <PageHeader
        title="Emploi du temps"
        description="Construisez et validez l’emploi du temps hebdomadaire de chaque classe."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => window.print()}
              disabled={classSlots.length === 0}
            >
              <Download size={16} /> Télécharger (PDF)
            </Button>
            <Button onClick={() => openCreate()} disabled={!classId}>
              <Plus size={16} /> Ajouter un créneau
            </Button>
          </>
        }
      />

      {/* Filtres */}
      <Card className="p-3 sm:p-4 print-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <FilterSelect
            value={year}
            onChange={setYear}
            options={yearOptions()}
            placeholder="Année scolaire"
            label="Année scolaire"
            fullWidth
          />
          <FilterSelect
            value={classId}
            onChange={setClassId}
            options={classOptions(activeClasses)}
            placeholder="Sélectionner une classe"
            label="Classe"
            fullWidth
          />
          <FilterSelect
            value={view}
            onChange={(value) => setView(value === 'day' ? 'day' : 'week')}
            options={[
              { value: 'week', label: 'Vue par semaine' },
              { value: 'day', label: 'Vue par jour' },
            ]}
            placeholder="Vue"
            label="Type de vue"
            fullWidth
          />
          <FilterSelect
            value={day}
            onChange={(value) => setDay((value || 'lundi') as Weekday)}
            options={DAY_OPTIONS}
            placeholder="Jour"
            label="Jour"
            fullWidth
            className={view === 'day' ? undefined : 'opacity-50'}
          />
        </div>
      </Card>

      {/* Conflits */}
      {classConflicts.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 print-hidden">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-xl bg-white text-red-500 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-red-600">
                {classConflicts.length} conflit
                {classConflicts.length > 1 ? 's' : ''} détecté
                {classConflicts.length > 1 ? 's' : ''}
              </h2>
              <ul className="mt-2 space-y-1">
                {classConflicts.map((conflict, index) => {
                  const slot = yearSlots.find((item) => item.id === conflict.slotId);
                  const other = yearSlots.find(
                    (item) => item.id === conflict.otherSlotId,
                  );
                  return (
                    <li key={index} className="text-xs text-red-600/90">
                      <span className="font-medium capitalize">
                        {conflict.type}
                      </span>{' '}
                      — {conflict.message}
                      {slot && other && (
                        <span className="text-red-500/70">
                          {' '}
                          ({classLabel(classes, slot.classId)} et{' '}
                          {classLabel(classes, other.classId)},{' '}
                          {weekdayLabels[slot.day]} {slot.startTime})
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Grille */}
      <Card className="p-4 sm:p-6 print-area">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {classId ? classLabel(classes, classId) : 'Aucune classe'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Année {year} ·{' '}
              {view === 'week' ? 'semaine complète' : weekdayLabels[day]} ·{' '}
              {classSlots.length} créneau{classSlots.length > 1 ? 'x' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge meta={scheduleStatusMeta(status)} />
            {classSlots.length > 0 && (
              <Button
                variant={status === 'valide' ? 'outline' : 'primary'}
                size="sm"
                onClick={toggleStatus}
                className="print-hidden"
              >
                <CheckCircle2 size={15} />
                {status === 'valide' ? 'Repasser en brouillon' : 'Valider'}
              </Button>
            )}
          </div>
        </div>

        {!ready ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : !classId ? (
          <EmptyState
            title="Aucune classe sélectionnée"
            message="Choisissez une classe pour afficher son emploi du temps."
            icon={<CalendarDays size={24} />}
          />
        ) : classSlots.length === 0 ? (
          <EmptyState
            title="Aucun créneau programmé"
            message="Aucun cours n’est encore planifié pour cette classe sur l’année sélectionnée."
            icon={<CalendarDays size={24} />}
            action={
              <Button onClick={() => openCreate()}>
                <Plus size={16} /> Ajouter un créneau
              </Button>
            }
          />
        ) : (
          <div
            className={
              view === 'week'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'
                : 'grid grid-cols-1 gap-4'
            }
          >
            {visibleDays.map((weekday) => {
              const daySlots = classSlots.filter((slot) => slot.day === weekday);
              return (
                <InnerCard key={weekday}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      {weekdayLabels[weekday]}
                    </h3>
                    <button
                      type="button"
                      onClick={() => openCreate(weekday)}
                      aria-label={`Ajouter un créneau le ${weekdayLabels[weekday]}`}
                      className="text-slate-400 hover:text-brand-600 transition-colors print-hidden"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {daySlots.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      Aucun cours
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {daySlots.map((slot) => {
                        const inConflict = conflictIds.has(slot.id);
                        return (
                          <li
                            key={slot.id}
                            className={
                              inConflict
                                ? 'bg-white rounded-lg p-3 border border-red-200 ring-1 ring-red-100'
                                : 'bg-white rounded-lg p-3 border border-slate-100'
                            }
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-medium text-brand-600">
                                {slot.startTime} – {slot.endTime}
                              </p>
                              <div className="flex items-center gap-0.5 print-hidden">
                                <button
                                  type="button"
                                  onClick={() => openEdit(slot)}
                                  aria-label="Modifier le créneau"
                                  className="text-slate-300 hover:text-brand-600 transition-colors p-0.5"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setToDelete(slot)}
                                  aria-label="Supprimer le créneau"
                                  className="text-slate-300 hover:text-red-500 transition-colors p-0.5"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-slate-900 mt-1">
                              {subjectLabel(subjects, slot.subjectId)}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {teacherLabel(teachers, slot.teacherId)}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <Badge tone="slate">{slot.room}</Badge>
                              {inConflict && <Badge tone="red">Conflit</Badge>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </InnerCard>
              );
            })}
          </div>
        )}
      </Card>

      {/* Ajout / modification d'un créneau */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={editing ? 'Modifier le créneau' : 'Ajouter un créneau'}
        description={
          classId
            ? `${classLabel(classes, classId)} · année ${year}`
            : undefined
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              Annuler
            </Button>
            <Button onClick={saveSlot}>
              {editing ? 'Enregistrer' : 'Ajouter le créneau'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Jour" htmlFor="slot-day" required>
            <Select
              id="slot-day"
              value={draft.day}
              options={DAY_OPTIONS}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  day: event.target.value as Weekday,
                }))
              }
            />
          </Field>

          <Field label="Salle" htmlFor="slot-room" required>
            <Select
              id="slot-room"
              value={draft.room}
              options={roomOptions()}
              placeholder="Sélectionner une salle"
              onChange={(event) =>
                setDraft((previous) => ({ ...previous, room: event.target.value }))
              }
            />
          </Field>

          <Field label="Heure de début" htmlFor="slot-start" required>
            <Select
              id="slot-start"
              value={draft.startTime}
              options={TIME_OPTIONS}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  startTime: event.target.value,
                }))
              }
            />
          </Field>

          <Field label="Heure de fin" htmlFor="slot-end" required>
            <Select
              id="slot-end"
              value={draft.endTime}
              options={TIME_OPTIONS}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  endTime: event.target.value,
                }))
              }
            />
          </Field>

          <Field label="Matière" htmlFor="slot-subject" required>
            <Select
              id="slot-subject"
              value={draft.subjectId}
              options={subjectOptions(subjects)}
              placeholder="Sélectionner une matière"
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  subjectId: event.target.value,
                }))
              }
            />
          </Field>

          <Field label="Enseignant" htmlFor="slot-teacher" required>
            <Select
              id="slot-teacher"
              value={draft.teacherId}
              options={teacherOptions(teachers)}
              placeholder="Sélectionner un enseignant"
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  teacherId: event.target.value,
                }))
              }
            />
          </Field>

          {draftError && (
            <p className="sm:col-span-2 text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle size={13} /> {draftError}
            </p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer ce créneau ?"
        message={
          toDelete
            ? `Le cours de ${subjectLabel(subjects, toDelete.subjectId)} du ${weekdayLabels[toDelete.day]} ${toDelete.startTime} sera retiré de l’emploi du temps.`
            : ''
        }
        confirmLabel="Supprimer"
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteSlot(toDelete)}
      />
    </PageContainer>
  );
}
