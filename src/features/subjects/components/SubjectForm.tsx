'use client';

import { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { subjectStatusLabels, ui } from '@/i18n/fr';
import { useHref } from '@/lib/hooks';
import { useCapabilities } from '@/lib/school-levels/use-capabilities';
import { useSchoolData } from '@/lib/store/school-data';
import { labelOptions } from '@/lib/status';
import { cycleOptions, levelOptions, teacherOptions } from '@/lib/options';
import { createId } from '@/lib/utils';
import type { Cycle, Subject } from '@/types';
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
import { subjectMessages as m } from '../messages';
import { subjectSchema, type SubjectFormValues } from '../schemas';

const SEMESTER_OPTIONS = [
  { value: 'Semestre 1', label: 'Semestre 1' },
  { value: 'Semestre 2', label: 'Semestre 2' },
];

function toFormValues(subject: Subject | undefined, fallbackCycle: Cycle) {
  return {
    code: subject?.code ?? '',
    name: subject?.name ?? '',
    levelIds: subject?.levelIds ?? [],
    cycle: subject?.cycle ?? fallbackCycle,
    teacherId: subject?.teacherId ?? '',
    status: subject?.status ?? 'active',
    description: subject?.description ?? '',
    ue: subject?.ue ?? '',
    ecue: subject?.ecue ?? '',
    ectsCredits: subject?.ectsCredits ?? 0,
    semester: subject?.semester ?? 'Semestre 1',
    filiere: subject?.filiere ?? '',
  } satisfies SubjectFormValues;
}

export function SubjectForm({ subject }: { subject?: Subject }) {
  const isEdit = Boolean(subject);
  const router = useRouter();
  const href = useHref();
  const toast = useToast();
  const { subjects, teachers, config, actions } = useSchoolData();
  const capabilities = useCapabilities();
  const [submitting, setSubmitting] = useState(false);

  const takenCodes = useMemo(
    () =>
      subjects.filter((item) => item.id !== subject?.id).map((item) => item.code),
    [subjects, subject?.id],
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SubjectFormValues>({
    defaultValues: toFormValues(subject, config.activeCycles[0] ?? 'college'),
    resolver: zodResolver(subjectSchema(takenCodes)),
  });

  /**
   * `useWatch` plutôt que le `watch()` renvoyé par `useForm` : ce dernier est une
   * fonction que le compilateur React ne peut pas mémoïser, ce qui lui fait
   * abandonner l'optimisation du composant entier. `useWatch` renvoie une valeur.
   */
  const cycle = useWatch({ control, name: 'cycle' });

  /**
   * Le bloc LMD n'est pas affiché parce que « le cycle vaut supérieur », mais
   * parce que la matrice de capacités déclare que ce cycle porte des crédits.
   */
  const showCredits = capabilities.forCycle(cycle).hasCredits;

  function persist(values: SubjectFormValues) {
    setSubmitting(true);
    const payload: Subject = {
      id: subject?.id ?? createId('sub'),
      ...values,
      code: values.code.toUpperCase(),
      ue: showCredits ? values.ue : '',
      ecue: showCredits ? values.ecue : '',
      ectsCredits: showCredits ? values.ectsCredits : 0,
      semester: showCredits ? values.semester : '',
      filiere: showCredits ? values.filiere : '',
    };

    setTimeout(() => {
      if (isEdit) {
        actions.subjects.update(payload.id, payload);
        toast.success(m.form.toasts.updated(payload.name));
      } else {
        actions.subjects.create(payload);
        toast.success(m.form.toasts.created(payload.name));
      }
      setSubmitting(false);
      router.push(href(`/subjects/${payload.id}`));
    }, 500);
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(persist, () => toast.error(ui.invalidForm))}
      className="space-y-5 sm:space-y-6"
    >
      <FormSection
        title={m.form.sections.identity}
        description={m.form.sections.identityHint}
      >
        <Field
          label={m.form.fields.code}
          htmlFor="code"
          required
          error={errors.code?.message}
        >
          <Input
            id="code"
            placeholder="MATH"
            invalid={Boolean(errors.code)}
            {...register('code')}
          />
        </Field>

        <Field
          label={m.form.fields.name}
          htmlFor="name"
          required
          error={errors.name?.message}
        >
          <Input
            id="name"
            placeholder="Mathématiques"
            invalid={Boolean(errors.name)}
            {...register('name')}
          />
        </Field>

        <Field label={m.form.fields.cycle} htmlFor="cycle">
          <Select id="cycle" options={cycleOptions()} {...register('cycle')} />
        </Field>

        <Field label={m.form.fields.status} htmlFor="status">
          <Select
            id="status"
            options={labelOptions(subjectStatusLabels)}
            {...register('status')}
          />
        </Field>

        <Field
          label={m.form.fields.levels}
          required
          error={errors.levelIds?.message}
          className="sm:col-span-2"
        >
          <Controller
            control={control}
            name="levelIds"
            render={({ field }) => (
              <MultiSelect
                options={levelOptions(config.activeCycles)}
                value={field.value}
                onChange={field.onChange}
                emptyLabel={m.form.fields.levelsEmpty}
              />
            )}
          />
        </Field>
      </FormSection>

      <FormSection
        title={m.form.sections.pedagogy}
        description={m.form.sections.pedagogyHint}
      >
        <Field label={m.form.fields.teacher} htmlFor="teacherId">
          <Select
            id="teacherId"
            options={teacherOptions(teachers)}
            placeholder={m.form.fields.teacherPlaceholder}
            {...register('teacherId')}
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

      {showCredits && (
        <FormSection title={m.form.sections.lmd} description={m.form.sections.lmdHint}>
          <Field label={m.form.fields.ue} htmlFor="ue">
            <Input
              id="ue"
              placeholder="UE 1 — Fondamentaux de l’informatique"
              {...register('ue')}
            />
          </Field>

          <Field label={m.form.fields.ecue} htmlFor="ecue">
            <Input
              id="ecue"
              placeholder="ECUE 1.1 — Algorithmique"
              {...register('ecue')}
            />
          </Field>

          <Field
            label={m.form.fields.credits}
            htmlFor="ectsCredits"
            error={errors.ectsCredits?.message}
          >
            <Input
              id="ectsCredits"
              type="number"
              min={0}
              max={60}
              invalid={Boolean(errors.ectsCredits)}
              {...register('ectsCredits', { valueAsNumber: true })}
            />
          </Field>

          <Field label={m.form.fields.semester} htmlFor="semester">
            <Select
              id="semester"
              options={SEMESTER_OPTIONS}
              {...register('semester')}
            />
          </Field>

          <Field
            label={m.form.fields.filiere}
            htmlFor="filiere"
            className="sm:col-span-2"
          >
            <Input id="filiere" placeholder="Informatique" {...register('filiere')} />
          </Field>
        </FormSection>
      )}

      <FormActions>
        <Button
          variant="ghost"
          onClick={() => router.push(href('/subjects'))}
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
