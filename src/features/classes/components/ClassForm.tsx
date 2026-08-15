'use client';

import { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { CURRENT_ACADEMIC_YEAR, LEVELS } from '@/data/academic';
import { classStatusLabels, ui } from '@/i18n/fr';
import { useHref } from '@/lib/hooks';
import { useCapabilities } from '@/lib/school-levels/use-capabilities';
import { useSchoolData } from '@/lib/store/school-data';
import { labelOptions } from '@/lib/status';
import {
  cycleOptions,
  levelOptions,
  roomOptions,
  subjectOptions,
  teacherOptions,
  yearOptions,
} from '@/lib/options';
import { subjectsOfClass } from '@/lib/selectors';
import { createId } from '@/lib/utils';
import type { ClassSubject, Cycle, SchoolClass } from '@/types';
import {
  Button,
  Field,
  FormActions,
  FormSection,
  Input,
  MultiSelect,
  Select,
  Textarea,
  useToast,
} from '@/components/ui';
import { classMessages as m } from '../messages';
import { classSchema, type ClassFormValues } from '../schemas';

export function ClassForm({ schoolClass }: { schoolClass?: SchoolClass }) {
  const isEdit = Boolean(schoolClass);
  const router = useRouter();
  const href = useHref();
  const toast = useToast();
  const { classes, classSubjects, teachers, subjects, config, actions } =
    useSchoolData();
  const capabilities = useCapabilities();
  const [submitting, setSubmitting] = useState(false);

  const takenNames = useMemo(
    () =>
      classes
        .filter((item) => item.id !== schoolClass?.id)
        .map((item) => ({ name: item.name, year: item.academicYear })),
    [classes, schoolClass?.id],
  );

  const defaultValues = useMemo<ClassFormValues>(() => {
    const links = schoolClass
      ? subjectsOfClass(classSubjects, schoolClass.id)
      : [];
    return {
      name: schoolClass?.name ?? '',
      levelId: schoolClass?.levelId ?? '',
      cycle: schoolClass?.cycle ?? config.activeCycles[0] ?? 'college',
      academicYear: schoolClass?.academicYear ?? CURRENT_ACADEMIC_YEAR,
      capacity: schoolClass?.capacity ?? 40,
      room: schoolClass?.room ?? '',
      mainTeacherId: schoolClass?.mainTeacherId ?? '',
      description: schoolClass?.description ?? '',
      status: schoolClass?.status ?? 'active',
      subjects: links.map((link) => ({
        subjectId: link.subjectId,
        teacherId: link.teacherId,
        coefficient: link.coefficient,
        weeklyHours: link.weeklyHours,
      })),
    };
  }, [schoolClass, classSubjects, config.activeCycles]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ClassFormValues>({
    defaultValues,
    resolver: zodResolver(classSchema(takenNames)),
  });

  /**
   * `useWatch` plutôt que le `watch()` renvoyé par `useForm` : ce dernier est une
   * fonction que le compilateur React ne peut pas mémoïser, ce qui lui fait
   * abandonner l'optimisation du composant entier. `useWatch` renvoie une valeur.
   */
  const cycle = useWatch({ control, name: 'cycle' });
  const rows = useWatch({ control, name: 'subjects' });
  const levelId = useWatch({ control, name: 'levelId' });

  /** Le cycle décide si la classe pratique les coefficients. */
  const showCoefficient = capabilities.forCycle(cycle).hasCoefficients;

  function handleLevelChange(levelId: string) {
    setValue('levelId', levelId);
    const level = LEVELS.find((item) => item.id === levelId);
    if (level) setValue('cycle', level.cycle);
  }

  function persist(values: ClassFormValues) {
    setSubmitting(true);
    const id = schoolClass?.id ?? createId('cls');

    const payload: SchoolClass = {
      id,
      name: values.name,
      levelId: values.levelId,
      cycle: values.cycle,
      academicYear: values.academicYear,
      capacity: values.capacity,
      room: values.room,
      mainTeacherId: values.mainTeacherId,
      description: values.description,
      status: values.status,
    };

    const links: ClassSubject[] = values.subjects.map((row) => ({
      id: `cs-${id}-${row.subjectId}`,
      classId: id,
      subjectId: row.subjectId,
      teacherId: row.teacherId,
      coefficient: showCoefficient ? row.coefficient : 1,
      weeklyHours: row.weeklyHours,
    }));

    setTimeout(() => {
      if (isEdit) {
        actions.classes.update(payload.id, payload);
      } else {
        actions.classes.create(payload);
      }

      // Les rattachements sont remplacés en bloc : plus simple à raccorder
      // ensuite à un `upsert` Supabase sur `class_subjects`.
      actions.classSubjects.replaceAll([
        ...classSubjects.filter((item) => item.classId !== id),
        ...links,
      ]);

      toast.success(
        isEdit
          ? m.form.toasts.updated(payload.name)
          : m.form.toasts.created(payload.name),
      );
      setSubmitting(false);
      router.push(href(`/classes/${payload.id}`));
    }, 500);
  }

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
        >
          <Input
            id="name"
            placeholder="Terminale C"
            invalid={Boolean(errors.name)}
            {...register('name')}
          />
        </Field>

        <Field
          label={m.form.fields.level}
          htmlFor="levelId"
          required
          error={errors.levelId?.message}
        >
          <Select
            id="levelId"
            value={levelId}
            options={levelOptions(config.activeCycles)}
            placeholder="Sélectionner un niveau"
            invalid={Boolean(errors.levelId)}
            onChange={(event) => handleLevelChange(event.target.value)}
          />
        </Field>

        <Field
          label={m.form.fields.cycle}
          htmlFor="cycle"
          hint={m.form.fields.cycleHint}
        >
          <Select
            id="cycle"
            options={cycleOptions()}
            value={cycle}
            onChange={(event) => setValue('cycle', event.target.value as Cycle)}
          />
        </Field>

        <Field label={m.form.fields.academicYear} htmlFor="academicYear">
          <Select
            id="academicYear"
            options={yearOptions()}
            {...register('academicYear')}
          />
        </Field>

        <Field label={m.form.fields.status} htmlFor="status">
          <Select
            id="status"
            options={labelOptions(classStatusLabels)}
            {...register('status')}
          />
        </Field>
      </FormSection>

      <FormSection
        title={m.form.sections.organisation}
        description={m.form.sections.organisationHint}
      >
        <Field
          label={m.form.fields.capacity}
          htmlFor="capacity"
          required
          error={errors.capacity?.message}
          hint={m.form.fields.capacityHint}
        >
          <Input
            id="capacity"
            type="number"
            min={1}
            max={300}
            invalid={Boolean(errors.capacity)}
            {...register('capacity', { valueAsNumber: true })}
          />
        </Field>

        <Field label={m.form.fields.room} htmlFor="room">
          <Select
            id="room"
            options={roomOptions()}
            placeholder={m.form.fields.roomPlaceholder}
            {...register('room')}
          />
        </Field>

        <Field label={m.form.fields.mainTeacher} htmlFor="mainTeacherId">
          <Select
            id="mainTeacherId"
            options={teacherOptions(teachers)}
            placeholder={m.form.fields.mainTeacherPlaceholder}
            {...register('mainTeacherId')}
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

      <FormSection
        title={m.form.sections.subjects}
        description={
          showCoefficient
            ? m.form.sections.subjectsHint
            : m.form.sections.subjectsHintNoCoefficient
        }
        columns={1}
      >
        <Controller
          control={control}
          name="subjects"
          render={({ field }) => (
            <MultiSelect
              options={subjectOptions(subjects)}
              value={field.value.map((row) => row.subjectId)}
              onChange={(selected) =>
                field.onChange(
                  selected.map(
                    (subjectId) =>
                      field.value.find((row) => row.subjectId === subjectId) ?? {
                        subjectId,
                        teacherId:
                          subjects.find((item) => item.id === subjectId)
                            ?.teacherId ?? '',
                        coefficient: 1,
                        weeklyHours: 2,
                      },
                  ),
                )
              }
              emptyLabel={m.form.fields.subjectsEmpty}
            />
          )}
        />

        {rows.length > 0 && (
          <ul className="space-y-3">
            {rows.map((row, index) => {
              const subject = subjects.find((item) => item.id === row.subjectId);
              return (
                <li
                  key={row.subjectId}
                  className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-100"
                >
                  <p className="text-sm font-medium text-slate-900 mb-3">
                    {subject ? `${subject.code} — ${subject.name}` : row.subjectId}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {showCoefficient && (
                      <Field
                        label={m.form.fields.coefficient}
                        htmlFor={`coef-${row.subjectId}`}
                        error={errors.subjects?.[index]?.coefficient?.message}
                      >
                        <Input
                          id={`coef-${row.subjectId}`}
                          type="number"
                          min={0.5}
                          max={10}
                          step={0.5}
                          className="py-2.5 bg-white"
                          invalid={Boolean(errors.subjects?.[index]?.coefficient)}
                          {...register(`subjects.${index}.coefficient`, {
                            valueAsNumber: true,
                          })}
                        />
                      </Field>
                    )}

                    <Field
                      label={m.form.fields.weeklyHours}
                      htmlFor={`hours-${row.subjectId}`}
                      error={errors.subjects?.[index]?.weeklyHours?.message}
                    >
                      <Input
                        id={`hours-${row.subjectId}`}
                        type="number"
                        min={0}
                        max={40}
                        className="py-2.5 bg-white"
                        invalid={Boolean(errors.subjects?.[index]?.weeklyHours)}
                        {...register(`subjects.${index}.weeklyHours`, {
                          valueAsNumber: true,
                        })}
                      />
                    </Field>

                    <Field
                      label={m.form.fields.teacher}
                      htmlFor={`teacher-${row.subjectId}`}
                    >
                      <Select
                        id={`teacher-${row.subjectId}`}
                        options={teacherOptions(teachers)}
                        placeholder={m.form.fields.mainTeacherPlaceholder}
                        className="py-2.5 bg-white"
                        {...register(`subjects.${index}.teacherId`)}
                      />
                    </Field>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </FormSection>

      <FormActions>
        <Button
          variant="ghost"
          onClick={() => router.push(href('/classes'))}
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
