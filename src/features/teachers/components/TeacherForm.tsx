'use client';

import { useMemo, useState } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { UserRound } from 'lucide-react';
import { contractTypeLabels, teacherStatusLabels, ui } from '@/i18n/fr';
import { useHref } from '@/lib/hooks';
import { useSchoolData } from '@/lib/store/school-data';
import { labelOptions } from '@/lib/status';
import { classOptions, subjectOptions } from '@/lib/options';
import { avatarUrl, createId, todayIso } from '@/lib/utils';
import type { Teacher } from '@/types';
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
import { teacherMessages as m } from '../messages';
import { teacherSchema, type TeacherFormValues } from '../schemas';

function toFormValues(teacher?: Teacher): TeacherFormValues {
  return {
    firstName: teacher?.firstName ?? '',
    lastName: teacher?.lastName ?? '',
    matricule: teacher?.matricule ?? '',
    email: teacher?.email ?? '',
    phone: teacher?.phone ?? '',
    address: teacher?.address ?? '',
    photoUrl: teacher?.photoUrl ?? '',
    subjectIds: teacher?.subjectIds ?? [],
    classIds: teacher?.classIds ?? [],
    contractType: teacher?.contractType ?? 'contractuel',
    status: teacher?.status ?? 'actif',
    startDate: teacher?.startDate ?? todayIso(),
    notes: teacher?.notes ?? '',
  };
}

export function TeacherForm({ teacher }: { teacher?: Teacher }) {
  const isEdit = Boolean(teacher);
  const router = useRouter();
  const href = useHref();
  const toast = useToast();
  const { teachers, subjects, classes, actions } = useSchoolData();
  const [submitting, setSubmitting] = useState(false);

  const takenMatricules = useMemo(
    () =>
      teachers
        .filter((item) => item.id !== teacher?.id)
        .map((item) => item.matricule),
    [teachers, teacher?.id],
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TeacherFormValues>({
    defaultValues: toFormValues(teacher),
    resolver: zodResolver(teacherSchema(takenMatricules)),
  });

  /**
   * `useWatch` plutôt que le `watch()` renvoyé par `useForm` : ce dernier est une
   * fonction que le compilateur React ne peut pas mémoïser, ce qui lui fait
   * abandonner l'optimisation du composant entier. `useWatch` renvoie une valeur.
   */
  const firstName = useWatch({ control, name: 'firstName' });
  const lastName = useWatch({ control, name: 'lastName' });
  const photoUrl = useWatch({ control, name: 'photoUrl' });

  function persist(values: TeacherFormValues) {
    setSubmitting(true);
    const payload: Teacher = {
      id: teacher?.id ?? createId('tch'),
      ...values,
      photoUrl: values.photoUrl || undefined,
    };

    setTimeout(() => {
      if (isEdit) {
        actions.teachers.update(payload.id, payload);
        toast.success(m.form.toasts.updated(payload.firstName));
      } else {
        actions.teachers.create(payload);
        toast.success(
          m.form.toasts.created(`${payload.firstName} ${payload.lastName}`),
        );
      }
      setSubmitting(false);
      router.push(href(`/teachers/${payload.id}`));
    }, 500);
  }

  const previewName =
    `${firstName} ${lastName}`.trim() || 'Nouvel enseignant';

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
        <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-16 h-16 rounded-full bg-white border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-300">
            {photoUrl || firstName ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl || avatarUrl(previewName)}
                alt={previewName}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound size={24} aria-hidden="true" />
            )}
          </div>
          <Field label={m.form.fields.photo} htmlFor="photoUrl" className="flex-1">
            <Input id="photoUrl" placeholder="https://..." {...register('photoUrl')} />
          </Field>
        </div>

        <Field
          label={m.form.fields.lastName}
          htmlFor="lastName"
          required
          error={errors.lastName?.message}
        >
          <Input
            id="lastName"
            invalid={Boolean(errors.lastName)}
            {...register('lastName')}
          />
        </Field>

        <Field
          label={m.form.fields.firstName}
          htmlFor="firstName"
          required
          error={errors.firstName?.message}
        >
          <Input
            id="firstName"
            invalid={Boolean(errors.firstName)}
            {...register('firstName')}
          />
        </Field>

        <Field
          label={m.form.fields.matricule}
          htmlFor="matricule"
          required
          error={errors.matricule?.message}
        >
          <Input
            id="matricule"
            placeholder="ENS-0000"
            invalid={Boolean(errors.matricule)}
            {...register('matricule')}
          />
        </Field>

        <Field
          label={m.form.fields.email}
          htmlFor="email"
          required
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </Field>

        <Field
          label={m.form.fields.phone}
          htmlFor="phone"
          required
          error={errors.phone?.message}
        >
          <Input
            id="phone"
            type="tel"
            placeholder="+241 06 00 00 00"
            invalid={Boolean(errors.phone)}
            {...register('phone')}
          />
        </Field>

        <Field label={m.form.fields.address} htmlFor="address">
          <Input id="address" {...register('address')} />
        </Field>
      </FormSection>

      <FormSection
        title={m.form.sections.assignments}
        description={m.form.sections.assignmentsHint}
      >
        <Field
          label={m.form.fields.subjects}
          required
          error={errors.subjectIds?.message}
        >
          <Controller
            control={control}
            name="subjectIds"
            render={({ field }) => (
              <MultiSelect
                options={subjectOptions(subjects)}
                value={field.value}
                onChange={field.onChange}
                emptyLabel={m.form.fields.subjectsEmpty}
              />
            )}
          />
        </Field>

        <Field label={m.form.fields.classes}>
          <Controller
            control={control}
            name="classIds"
            render={({ field }) => (
              <MultiSelect
                options={classOptions(classes)}
                value={field.value}
                onChange={field.onChange}
                emptyLabel={m.form.fields.classesEmpty}
              />
            )}
          />
        </Field>
      </FormSection>

      <FormSection
        title={m.form.sections.administrative}
        description={m.form.sections.administrativeHint}
      >
        <Field label={m.form.fields.contractType} htmlFor="contractType">
          <Select
            id="contractType"
            options={labelOptions(contractTypeLabels)}
            {...register('contractType')}
          />
        </Field>

        <Field label={m.form.fields.status} htmlFor="status">
          <Select
            id="status"
            options={labelOptions(teacherStatusLabels)}
            {...register('status')}
          />
        </Field>

        <Field
          label={m.form.fields.startDate}
          htmlFor="startDate"
          required
          error={errors.startDate?.message}
        >
          <Input
            id="startDate"
            type="date"
            invalid={Boolean(errors.startDate)}
            {...register('startDate')}
          />
        </Field>

        <Field
          label={m.form.fields.notes}
          htmlFor="notes"
          className="sm:col-span-2"
        >
          <Textarea
            id="notes"
            placeholder={m.form.fields.notesPlaceholder}
            {...register('notes')}
          />
        </Field>
      </FormSection>

      <FormActions>
        <Button
          variant="ghost"
          onClick={() => router.push(href('/teachers'))}
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
