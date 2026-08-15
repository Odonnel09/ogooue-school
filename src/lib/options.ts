import { ACADEMIC_YEARS, LEVELS, ROOMS } from '@/data/academic';
import {
  cycleLabels,
  evaluationTypeLabels,
  gradingScaleLabels,
  periodKindLabels,
} from '@/i18n/fr';
import {
  evaluationKindsFor,
  gradingScalesFor,
  periodKindsFor,
} from '@/lib/school-levels/capabilities';
import { labelOptions, labelOptionsFor } from '@/lib/status';
import type {
  Cycle,
  Period,
  SchoolClass,
  SelectOption,
  Subject,
  Teacher,
} from '@/types';
import { teacherName } from './selectors';

/**
 * Construction des options de select.
 *
 * Les listes dépendant du niveau scolaire (barèmes, types d'évaluation,
 * découpages de période) sont dérivées de la matrice de capacités : aucun
 * composant ne décide lui-même de ce qui est proposé.
 */

export function classOptions(classes: SchoolClass[]): SelectOption[] {
  return classes
    .filter((item) => item.status !== 'archivee')
    .map((item) => ({ value: item.id, label: item.name }));
}

/** Niveaux limités aux cycles ouverts dans l'établissement. */
export function levelOptions(activeCycles: Cycle[]): SelectOption[] {
  return LEVELS.filter((level) => activeCycles.includes(level.cycle))
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((level) => ({
      value: level.id,
      label: `${level.label} — ${cycleLabels[level.cycle]}`,
    }));
}

/** Tous les cycles de la plateforme (utilisé par Paramètres). */
export function cycleOptions(): SelectOption[] {
  return labelOptions(cycleLabels);
}

/** Cycles ouverts dans l'établissement. */
export function activeCycleOptions(activeCycles: Cycle[]): SelectOption[] {
  return labelOptionsFor(cycleLabels, activeCycles);
}

export function teacherOptions(teachers: Teacher[]): SelectOption[] {
  return teachers
    .filter((teacher) => teacher.status !== 'archive')
    .map((teacher) => ({ value: teacher.id, label: teacherName(teacher) }));
}

export function subjectOptions(subjects: Subject[]): SelectOption[] {
  return subjects
    .filter((subject) => subject.status === 'active')
    .map((subject) => ({
      value: subject.id,
      label: `${subject.code} — ${subject.name}`,
    }));
}

/** Périodes de l'établissement, filtrées sur les cycles actifs. */
export function periodOptions(
  periods: Period[],
  activeCycles: Cycle[],
): SelectOption[] {
  return periods
    .filter((period) =>
      period.cycles.some((cycle) => activeCycles.includes(cycle)),
    )
    .map((period) => ({ value: period.id, label: period.label }));
}

export function yearOptions(): SelectOption[] {
  return ACADEMIC_YEARS.map((year) => ({ value: year.id, label: year.label }));
}

export function roomOptions(): SelectOption[] {
  return ROOMS.map((room) => ({ value: room, label: room }));
}

/** Types d'évaluation autorisés par les cycles actifs. */
export function evaluationTypeOptions(activeCycles: Cycle[]): SelectOption[] {
  return labelOptionsFor(
    evaluationTypeLabels,
    evaluationKindsFor(activeCycles),
  );
}

/** Barèmes autorisés par les cycles actifs. */
export function gradingScaleOptions(activeCycles: Cycle[]): SelectOption[] {
  return labelOptionsFor(gradingScaleLabels, gradingScalesFor(activeCycles));
}

/** Découpages de période autorisés par les cycles actifs. */
export function periodKindOptions(activeCycles: Cycle[]): SelectOption[] {
  return labelOptionsFor(periodKindLabels, periodKindsFor(activeCycles));
}
