'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { CURRENT_ACADEMIC_YEAR } from '@/data/academic';
import {
  evaluationStatusLabels,
  evaluationTypeLabels,
  gradingScaleLabels,
  ui,
} from '@/i18n/fr';
import { useHref } from '@/lib/hooks';
import { useCapabilities } from '@/lib/school-levels/use-capabilities';
import { useSchoolData } from '@/lib/store/school-data';
import { SCALES } from '@/lib/grading/scales';
import { labelOptions, labelOptionsFor } from '@/lib/status';
import {
  classOptions,
  subjectOptions,
  teacherOptions,
  yearOptions,
} from '@/lib/options';
import { createId, todayIso } from '@/lib/utils';
import type { Evaluation, Grade, GradingScale } from '@/types';
import {
  Button,
  Field,
  FormActions,
  FormSection,
  Input,
  Select,
  Textarea,
  useToast,
  DatePicker,
} from '@/components/ui';
import { evaluationMessages as m } from '../messages';
import { evaluationSchema, type EvaluationFormValues } from '../schemas';

function toFormValues(evaluation?: Evaluation): EvaluationFormValues {
  return {
    name: evaluation?.name ?? '',
    type: evaluation?.type ?? 'devoir',
    subjectId: evaluation?.subjectId ?? '',
    classId: evaluation?.classId ?? '',
    teacherId: evaluation?.teacherId ?? '',
    academicYear: evaluation?.academicYear ?? CURRENT_ACADEMIC_YEAR,
    periodId: evaluation?.periodId ?? '',
    date: evaluation?.date ?? todayIso(),
    scale: evaluation?.scale ?? 'sur_20',
    maxScore: evaluation?.maxScore ?? 20,
    coefficient: evaluation?.coefficient ?? 1,
    description: evaluation?.description ?? '',
    status: evaluation?.status ?? 'draft',
  };
}

export function EvaluationForm({ evaluation }: { evaluation?: Evaluation }) {
  const isEdit = Boolean(evaluation);
  const router = useRouter();
  const href = useHref();
  const toast = useToast();
  const { classes, subjects, teachers, students, config, actions } =
    useSchoolData();
  const capabilities = useCapabilities();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<EvaluationFormValues>({
    defaultValues: toFormValues(evaluation),
    resolver: zodResolver(evaluationSchema),
  });

  /**
   * `useWatch` plutôt que le `watch()` renvoyé par `useForm` : ce dernier est une
   * fonction que le compilateur React ne peut pas mémoïser, ce qui lui fait
   * abandonner l'optimisation du composant entier. `useWatch` renvoie une valeur.
   */
  const classId = useWatch({ control, name: 'classId' });
  const scale = useWatch({ control, name: 'scale' });
  const subjectId = useWatch({ control, name: 'subjectId' });

  const selectedClass = classes.find((item) => item.id === classId);

  /**
   * Tout ce qui est proposé ici découle du cycle de la classe : types
   * d'épreuve, barèmes et périodes. Aucun de ces choix n'est écrit en dur.
   */
  const classCapabilities = selectedClass
    ? capabilities.forClass(selectedClass)
    : null;

  const typeChoices = useMemo(
    () =>
      classCapabilities
        ? labelOptionsFor(evaluationTypeLabels, classCapabilities.evaluationKinds)
        : [],
    [classCapabilities],
  );

  const scaleChoices = useMemo(
    () =>
      classCapabilities
        ? labelOptionsFor(gradingScaleLabels, classCapabilities.gradingScales)
        : [],
    [classCapabilities],
  );

  const periodChoices = useMemo(() => {
    if (!selectedClass) return [];
    return config.periods
      .filter((period) => period.cycles.includes(selectedClass.cycle))
      .map((period) => ({ value: period.id, label: period.label }));
  }, [config.periods, selectedClass]);

  const scaleDefinition = SCALES[scale];
  const isSymbolicScale = scaleDefinition.kind === 'symbolic';

  /** Aligne type, barème et période dès qu'on change de classe. */
  useEffect(() => {
    if (!classCapabilities) return;

    const currentType = getValues('type');
    if (!classCapabilities.evaluationKinds.includes(currentType)) {
      setValue('type', classCapabilities.evaluationKinds[0]);
    }

    const currentScale = getValues('scale');
    if (!classCapabilities.gradingScales.includes(currentScale)) {
      const nextScale = classCapabilities.gradingScales[0];
      setValue('scale', nextScale);
      setValue('maxScore', SCALES[nextScale].defaultMax || 1);
    }

    const currentPeriod = getValues('periodId');
    if (!periodChoices.some((period) => period.value === currentPeriod)) {
      setValue('periodId', periodChoices[0]?.value ?? '');
    }
    // `getValues` est stable ; les dépendances utiles sont la classe et ses périodes.
  }, [classCapabilities, periodChoices, setValue, getValues]);

  function handleScaleChange(next: GradingScale) {
    setValue('scale', next);
    setValue('maxScore', SCALES[next].defaultMax || 1);
  }

  function handleSubjectChange(subjectId: string) {
    setValue('subjectId', subjectId);
    if (!getValues('teacherId')) {
      const subject = subjects.find((item) => item.id === subjectId);
      if (subject?.teacherId) setValue('teacherId', subject.teacherId);
    }
  }

  /** Les élèves de la classe sont pré-inscrits dans la grille de saisie. */
  function buildGrades(targetClassId: string, previous: Grade[]): Grade[] {
    return students
      .filter(
        (student) =>
          student.classId === targetClassId &&
          (student.status === 'actif' || student.status === 'en_attente'),
      )
      .map((student) => {
        const existing = previous.find((item) => item.studentId === student.id);
        return (
          existing ?? {
            studentId: student.id,
            score: null,
            value: null,
            comment: '',
          }
        );
      });
  }

  function persist(values: EvaluationFormValues) {
    setSubmitting(true);
    const payload: Evaluation = {
      id: evaluation?.id ?? createId('eva'),
      ...values,
      maxScore: isSymbolicScale ? 0 : values.maxScore,
      grades: buildGrades(values.classId, evaluation?.grades ?? []),
      gradeHistory: evaluation?.gradeHistory ?? [],
    };

    setTimeout(() => {
      if (isEdit) {
        actions.evaluations.update(payload.id, payload);
        toast.success(m.form.toasts.updated(payload.name));
      } else {
        actions.evaluations.create(payload);
        toast.success(m.form.toasts.created(payload.name, payload.grades.length));
      }
      setSubmitting(false);
      router.push(href(`/evaluations/${payload.id}`));
    }, 500);
  }

  const maxScoreHint = isSymbolicScale
    ? m.form.fields.maxScoreHintSymbolic
    : scaleDefinition.editableMax
      ? m.form.fields.maxScoreHintCustom
      : m.form.fields.maxScoreHintFixed;

  return (
    <form
      noValidate
      onSubmit={handleSubmit(persist, () => toast.error(ui.invalidForm))}
      className="space-y-5 sm:space-y-6"
    >
      <FormSection
        title={m.form.sections.general}
        description={m.form.sections.generalHint}
      >
        <Field
          label={m.form.fields.name}
          htmlFor="name"
          required
          error={errors.name?.message}
          className="sm:col-span-2"
        >
          <Input
            id="name"
            placeholder={m.form.fields.namePlaceholder}
            invalid={Boolean(errors.name)}
            {...register('name')}
          />
        </Field>

        <Field
          label={m.form.fields.classroom}
          htmlFor="classId"
          required
          error={errors.classId?.message}
        >
          <Select
            id="classId"
            options={classOptions(classes)}
            placeholder="Sélectionner une classe"
            invalid={Boolean(errors.classId)}
            {...register('classId')}
          />
        </Field>

        <Field
          label={m.form.fields.type}
          htmlFor="type"
          required
          error={errors.type?.message}
        >
          <Select
            id="type"
            options={typeChoices}
            placeholder={m.form.fields.selectClassFirst}
            disabled={!classCapabilities}
            invalid={Boolean(errors.type)}
            {...register('type')}
          />
        </Field>

        <Field
          label={m.form.fields.subject}
          htmlFor="subjectId"
          required
          error={errors.subjectId?.message}
        >
          <Select
            id="subjectId"
            value={subjectId}
            options={subjectOptions(subjects)}
            placeholder="Sélectionner une matière"
            invalid={Boolean(errors.subjectId)}
            onChange={(event) => handleSubjectChange(event.target.value)}
          />
        </Field>

        <Field
          label={m.form.fields.teacher}
          htmlFor="teacherId"
          required
          error={errors.teacherId?.message}
          hint={m.form.fields.teacherHint}
        >
          <Select
            id="teacherId"
            options={teacherOptions(teachers)}
            placeholder="Sélectionner un enseignant"
            invalid={Boolean(errors.teacherId)}
            {...register('teacherId')}
          />
        </Field>
      </FormSection>

      <FormSection
        title={m.form.sections.grading}
        description={m.form.sections.gradingHint}
      >
        <Field label={m.form.fields.academicYear} htmlFor="academicYear">
          <Select
            id="academicYear"
            options={yearOptions()}
            {...register('academicYear')}
          />
        </Field>

        <Field
          label={m.form.fields.period}
          htmlFor="periodId"
          required
          error={errors.periodId?.message}
        >
          <Select
            id="periodId"
            options={periodChoices}
            placeholder={m.form.fields.selectClassFirst}
            disabled={!selectedClass}
            invalid={Boolean(errors.periodId)}
            {...register('periodId')}
          />
        </Field>

        <Field
          label={m.form.fields.date}
          htmlFor="date"
          required
          error={errors.date?.message}
        >
          <DatePicker
            id="date"
            invalid={Boolean(errors.date)}
            {...register('date')}
          />
        </Field>

        <Field
          label={m.form.fields.scale}
          htmlFor="scale"
          hint={m.form.fields.scaleHint}
        >
          <Select
            id="scale"
            value={scale}
            options={scaleChoices}
            placeholder={m.form.fields.selectClassFirst}
            disabled={!classCapabilities}
            onChange={(event) =>
              handleScaleChange(event.target.value as GradingScale)
            }
          />
        </Field>

        <Field
          label={m.form.fields.maxScore}
          htmlFor="maxScore"
          error={errors.maxScore?.message}
          hint={maxScoreHint}
        >
          <Input
            id="maxScore"
            type="number"
            min={1}
            max={1000}
            disabled={isSymbolicScale || !scaleDefinition.editableMax}
            invalid={Boolean(errors.maxScore)}
            {...register('maxScore', { valueAsNumber: true })}
          />
        </Field>

        <Field
          label={m.form.fields.coefficient}
          htmlFor="coefficient"
          required
          error={errors.coefficient?.message}
        >
          <Input
            id="coefficient"
            type="number"
            min={0.5}
            max={20}
            step={0.5}
            invalid={Boolean(errors.coefficient)}
            {...register('coefficient', { valueAsNumber: true })}
          />
        </Field>

        <Field label={m.form.fields.status} htmlFor="status">
          <Select
            id="status"
            options={labelOptions(evaluationStatusLabels)}
            {...register('status')}
          />
        </Field>

        <Field
          label={m.form.fields.description}
          htmlFor="description"
          className="sm:col-span-2"
        >
          <Textarea
            id="description"
            placeholder={m.form.fields.descriptionPlaceholder}
            {...register('description')}
          />
        </Field>
      </FormSection>

      <FormActions>
        <Button
          variant="ghost"
          onClick={() => router.push(href('/evaluations'))}
          disabled={submitting}
        >
          {m.form.actions.cancel}
        </Button>
        <Button type="submit" loading={submitting}>
          {isEdit ? m.form.actions.update : m.form.actions.create}
        </Button>
      </FormActions>
    </form>
  );
}
