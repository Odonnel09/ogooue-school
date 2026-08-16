'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { guardianStatusLabels, ui } from '@/i18n/fr';
import { useHref } from '@/lib/hooks';
import { useSchoolData } from '@/lib/store/school-data';
import { useAudit } from '@/lib/audit/use-audit';
import { labelOptions } from '@/lib/status';
import { createId } from '@/lib/utils';
import type { Guardian } from '@/types';
import {
  Button,
  Field,
  FormActions,
  FormSection,
  Input,
  Select,
  Textarea,
  useToast,
} from '@/components/ui';
import { guardianMessages as m } from '../messages';
import { guardianSchema, type GuardianFormValues } from '../schemas';

function toFormValues(guardian?: Guardian): GuardianFormValues {
  return {
    firstName: guardian?.firstName ?? '',
    lastName: guardian?.lastName ?? '',
    phone: guardian?.phone ?? '',
    altPhone: guardian?.altPhone ?? '',
    email: guardian?.email ?? '',
    address: guardian?.address ?? '',
    profession: guardian?.profession ?? '',
    idDocument: guardian?.idDocument ?? '',
    notes: guardian?.notes ?? '',
    status: guardian?.status ?? 'actif',
  };
}

export function GuardianForm({ guardian }: { guardian?: Guardian }) {
  const isEdit = Boolean(guardian);
  const router = useRouter();
  const href = useHref();
  const toast = useToast();
  const { actions } = useSchoolData();
  const audit = useAudit();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuardianFormValues>({
    defaultValues: toFormValues(guardian),
    resolver: zodResolver(guardianSchema),
  });

  function persist(values: GuardianFormValues) {
    setSubmitting(true);
    const payload: Guardian = { id: guardian?.id ?? createId('grd'), ...values };

    setTimeout(() => {
      const fullName = `${payload.firstName} ${payload.lastName}`.trim();
      audit({
        action: isEdit ? 'guardians.update' : 'guardians.create',
        resourceType: 'Tuteur',
        resourceId: payload.id,
        resourceLabel: fullName,
        detail: `Fiche ${isEdit ? 'modifiée' : 'créée'} — contact ${payload.phone || 'non renseigné'}.`,
      });
      if (isEdit) {
        actions.guardians.update(payload.id, payload);
        toast.success(m.form.toasts.updated(fullName));
      } else {
        actions.guardians.create(payload);
        toast.success(m.form.toasts.created(fullName));
      }
      setSubmitting(false);
      router.push(href(`/guardians/${payload.id}`));
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

        <Field
          label={m.form.fields.altPhone}
          htmlFor="altPhone"
          hint={m.form.fields.altPhoneHint}
          error={errors.altPhone?.message}
        >
          <Input
            id="altPhone"
            type="tel"
            invalid={Boolean(errors.altPhone)}
            {...register('altPhone')}
          />
        </Field>

        <Field
          label={m.form.fields.email}
          htmlFor="email"
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </Field>

        <Field label={m.form.fields.profession} htmlFor="profession">
          <Input id="profession" {...register('profession')} />
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
        title={m.form.sections.admin}
        description={m.form.sections.adminHint}
      >
        <Field
          label={m.form.fields.idDocument}
          htmlFor="idDocument"
          hint={m.form.fields.idDocumentHint}
        >
          <Input id="idDocument" {...register('idDocument')} />
        </Field>

        <Field label={m.form.fields.status} htmlFor="status">
          <Select
            id="status"
            options={labelOptions(guardianStatusLabels)}
            {...register('status')}
          />
        </Field>

        <Field
          label={m.form.fields.notes}
          htmlFor="notes"
          className="sm:col-span-2"
        >
          <Textarea id="notes" {...register('notes')} />
        </Field>
      </FormSection>

      <FormActions>
        <Button
          variant="ghost"
          onClick={() => router.push(href('/guardians'))}
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
