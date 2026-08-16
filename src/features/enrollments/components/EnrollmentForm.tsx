'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { CURRENT_ACADEMIC_YEAR } from '@/data/academic';
import { genderLabels, guardianRelationLabels, ui } from '@/i18n/fr';
import { useHref } from '@/lib/hooks';
import { useSchoolData } from '@/lib/store/school-data';
import { useAudit } from '@/lib/audit/use-audit';
import { guardianName } from '@/lib/selectors';
import { labelOptions } from '@/lib/status';
import { levelOptions, yearOptions } from '@/lib/options';
import { createId, todayIso } from '@/lib/utils';
import type { EnrollmentApplication, EnrollmentStatus } from '@/types';
import {
  Button,
  Field,
  FormActions,
  FormSection,
  Input,
  Select,
  useToast,
  DatePicker,
} from '@/components/ui';
import { enrollmentMessages as m } from '../messages';
import { enrollmentSchema, type EnrollmentFormValues } from '../schemas';

export function EnrollmentForm() {
  const router = useRouter();
  const href = useHref();
  const toast = useToast();
  const { enrollments, guardians, config, actions } = useSchoolData();
  const audit = useAudit();
  const [submitting, setSubmitting] = useState<EnrollmentStatus | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<EnrollmentFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      birthDate: '',
      birthPlace: '',
      gender: 'M',
      nationality: 'Gabonaise',
      address: '',
      previousSchool: '',
      requestedLevelId: '',
      academicYear: CURRENT_ACADEMIC_YEAR,
      guardianId: '',
      guardianRelation: 'pere',
    },
    resolver: zodResolver(enrollmentSchema),
  });

  /** Référence lisible communiquée à la famille. */
  function nextReference(): string {
    const year = new Date().getFullYear();
    const count = enrollments.length + 1;
    return `PRE-${year}-${`${count}`.padStart(4, '0')}`;
  }

  function persist(values: EnrollmentFormValues, status: EnrollmentStatus) {
    setSubmitting(status);
    const reference = nextReference();

    const application: EnrollmentApplication = {
      id: createId('enr'),
      reference,
      ...values,
      requestedClassId: '',
      // Les pièces exigées viennent de Paramètres : changer la liste là-bas
      // change ce qui est attendu des nouveaux dossiers.
      documents: config.enrollment.requiredDocuments.map((name) => ({
        name,
        provided: false,
        receivedAt: '',
      })),
      status,
      submittedAt: status === 'brouillon' ? '' : todayIso(),
      decidedAt: '',
      decidedBy: '',
      decisionNote: '',
      createdStudentId: '',
    };

    setTimeout(() => {
      actions.enrollments.create(application);
      if (status !== 'brouillon') {
        audit({
          action: 'enrollments.submit',
          resourceType: 'Dossier d’inscription',
          resourceId: application.id,
          resourceLabel: `${reference} — ${values.firstName} ${values.lastName}`,
          detail: `Dossier déposé avec ${application.documents.length} pièce(s) attendue(s).`,
        });
      }
      setSubmitting(null);
      toast.success(
        status === 'brouillon'
          ? m.form.toasts.draft(reference)
          : m.form.toasts.submitted(reference),
      );
      router.push(href(`/enrollments/${application.id}`));
    }, 500);
  }

  /** Le brouillon accepte un dossier partiel : la famille complètera plus tard. */
  function saveDraft() {
    const values = getValues();
    if (!values.firstName.trim() || !values.lastName.trim()) {
      toast.error('Renseignez au moins le nom et le prénom du candidat.');
      return;
    }
    persist(values, 'brouillon');
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(
        (values) => persist(values, 'soumise'),
        () => toast.error(ui.invalidForm),
      )}
      className="space-y-5 sm:space-y-6"
    >
      <FormSection
        title={m.form.sections.candidate}
        description={m.form.sections.candidateHint}
      >
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
          label={m.form.fields.birthDate}
          htmlFor="birthDate"
          required
          error={errors.birthDate?.message}
        >
          <DatePicker
            id="birthDate"
            invalid={Boolean(errors.birthDate)}
            {...register('birthDate')}
          />
        </Field>

        <Field label={m.form.fields.birthPlace} htmlFor="birthPlace">
          <Input id="birthPlace" placeholder="Libreville" {...register('birthPlace')} />
        </Field>

        <Field label={m.form.fields.gender} htmlFor="gender">
          <Select
            id="gender"
            options={labelOptions(genderLabels)}
            {...register('gender')}
          />
        </Field>

        <Field label={m.form.fields.nationality} htmlFor="nationality">
          <Input id="nationality" {...register('nationality')} />
        </Field>

        <Field
          label={m.form.fields.address}
          htmlFor="address"
          className="sm:col-span-2"
        >
          <Input id="address" {...register('address')} />
        </Field>
      </FormSection>

      <FormSection
        title={m.form.sections.schooling}
        description={m.form.sections.schoolingHint}
      >
        <Field
          label={m.form.fields.requestedLevel}
          htmlFor="requestedLevelId"
          required
          error={errors.requestedLevelId?.message}
        >
          <Select
            id="requestedLevelId"
            options={levelOptions(config.activeCycles)}
            placeholder="Sélectionner un niveau"
            invalid={Boolean(errors.requestedLevelId)}
            {...register('requestedLevelId')}
          />
        </Field>

        <Field label={m.form.fields.academicYear} htmlFor="academicYear">
          <Select
            id="academicYear"
            options={yearOptions()}
            {...register('academicYear')}
          />
        </Field>

        <Field
          label={m.form.fields.previousSchool}
          htmlFor="previousSchool"
          className="sm:col-span-2"
        >
          <Input id="previousSchool" {...register('previousSchool')} />
        </Field>
      </FormSection>

      <FormSection
        title={m.form.sections.guardian}
        description={m.form.sections.guardianHint}
      >
        <Field
          label={m.form.fields.guardian}
          htmlFor="guardianId"
          required
          error={errors.guardianId?.message}
        >
          <Select
            id="guardianId"
            options={guardians
              .filter((item) => item.status === 'actif')
              .map((item) => ({
                value: item.id,
                label: `${guardianName(item)} — ${item.phone}`,
              }))}
            placeholder="Sélectionner un parent ou tuteur"
            invalid={Boolean(errors.guardianId)}
            {...register('guardianId')}
          />
        </Field>

        <Field label={m.form.fields.guardianRelation} htmlFor="guardianRelation">
          <Select
            id="guardianRelation"
            options={labelOptions(guardianRelationLabels)}
            {...register('guardianRelation')}
          />
        </Field>
      </FormSection>

      <FormActions>
        <Button
          variant="ghost"
          onClick={() => router.push(href('/enrollments'))}
          disabled={submitting !== null}
        >
          {m.form.actions.cancel}
        </Button>
        <Button
          variant="outline"
          onClick={saveDraft}
          loading={submitting === 'brouillon'}
          disabled={submitting !== null}
        >
          {m.form.actions.saveDraft}
        </Button>
        <Button
          type="submit"
          loading={submitting === 'soumise'}
          disabled={submitting !== null}
        >
          {m.form.actions.submit}
        </Button>
      </FormActions>
    </form>
  );
}
