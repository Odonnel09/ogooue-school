'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { CURRENT_USER } from '@/data/academic';
import { announcementStatusLabels, audienceLabels, ui } from '@/i18n/fr';
import { useSchoolData } from '@/lib/store/school-data';
import { labelOptions } from '@/lib/status';
import { classOptions, levelOptions } from '@/lib/options';
import { createId, todayIso } from '@/lib/utils';
import type { Announcement } from '@/types';
import {
  Button,
  Field,
  Input,
  Modal,
  Select,
  Textarea,
  useToast,
  DatePicker,
} from '@/components/ui';
import { announcementMessages as m } from '../messages';
import { announcementSchema, type AnnouncementFormValues } from '../schemas';

function toFormValues(announcement?: Announcement): AnnouncementFormValues {
  return {
    title: announcement?.title ?? '',
    content: announcement?.content ?? '',
    authorName: announcement?.authorName ?? CURRENT_USER.fullName,
    audience: announcement?.audience ?? 'tous',
    targetClassId: announcement?.targetClassId ?? '',
    targetLevelId: announcement?.targetLevelId ?? '',
    publishedAt: announcement?.publishedAt ?? todayIso(),
    expiresAt: announcement?.expiresAt ?? '',
    status: announcement?.status ?? 'brouillon',
    pinned: announcement?.pinned ?? false,
  };
}

export function AnnouncementForm({
  open,
  announcement,
  onClose,
}: {
  open: boolean;
  announcement?: Announcement;
  onClose: () => void;
}) {
  const isEdit = Boolean(announcement);
  const toast = useToast();
  const { classes, config, actions } = useSchoolData();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    defaultValues: toFormValues(announcement),
    resolver: zodResolver(announcementSchema),
  });

  /**
   * `useWatch` plutôt que le `watch()` renvoyé par `useForm` : ce dernier est une
   * fonction que le compilateur React ne peut pas mémoïser, ce qui lui fait
   * abandonner l'optimisation du composant entier. `useWatch` renvoie une valeur.
   */
  const audience = useWatch({ control, name: 'audience' });

  function persist(values: AnnouncementFormValues) {
    setSubmitting(true);
    const payload: Announcement = {
      id: announcement?.id ?? createId('ann'),
      ...values,
      targetClassId: values.audience === 'classe' ? values.targetClassId : '',
    };

    setTimeout(() => {
      if (isEdit) {
        actions.announcements.update(payload.id, payload);
        toast.success(m.form.toasts.updated);
      } else {
        actions.announcements.create(payload);
        toast.success(
          payload.status === 'publiee'
            ? m.form.toasts.createdPublished
            : m.form.toasts.created,
        );
      }
      setSubmitting(false);
      onClose();
    }, 500);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? m.form.editTitle : m.form.createTitle}
      description={m.form.description}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            {m.form.actions.cancel}
          </Button>
          <Button
            onClick={handleSubmit(persist, () => toast.error(ui.invalidForm))}
            loading={submitting}
          >
            {isEdit ? m.form.actions.update : m.form.actions.create}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label={m.form.fields.title}
          htmlFor="ann-title"
          required
          error={errors.title?.message}
          className="sm:col-span-2"
        >
          <Input
            id="ann-title"
            placeholder={m.form.fields.titlePlaceholder}
            invalid={Boolean(errors.title)}
            {...register('title')}
          />
        </Field>

        <Field
          label={m.form.fields.content}
          htmlFor="ann-content"
          required
          error={errors.content?.message}
          className="sm:col-span-2"
        >
          <Textarea
            id="ann-content"
            rows={6}
            placeholder={m.form.fields.contentPlaceholder}
            invalid={Boolean(errors.content)}
            {...register('content')}
          />
        </Field>

        <Field
          label={m.form.fields.author}
          htmlFor="ann-author"
          required
          error={errors.authorName?.message}
        >
          <Input
            id="ann-author"
            invalid={Boolean(errors.authorName)}
            {...register('authorName')}
          />
        </Field>

        <Field label={m.form.fields.audience} htmlFor="ann-audience">
          <Select
            id="ann-audience"
            options={labelOptions(audienceLabels)}
            {...register('audience')}
          />
        </Field>

        {audience === 'classe' && (
          <Field
            label={m.form.fields.targetClass}
            htmlFor="ann-class"
            required
            error={errors.targetClassId?.message}
          >
            <Select
              id="ann-class"
              options={classOptions(classes)}
              placeholder="Sélectionner une classe"
              invalid={Boolean(errors.targetClassId)}
              {...register('targetClassId')}
            />
          </Field>
        )}

        <Field
          label={m.form.fields.targetLevel}
          htmlFor="ann-level"
          hint={m.form.fields.targetLevelHint}
        >
          <Select
            id="ann-level"
            options={levelOptions(config.activeCycles)}
            placeholder="Tous les niveaux"
            {...register('targetLevelId')}
          />
        </Field>

        <Field
          label={m.form.fields.publishedAt}
          htmlFor="ann-published"
          error={errors.publishedAt?.message}
        >
          <DatePicker
            id="ann-published"
            invalid={Boolean(errors.publishedAt)}
            {...register('publishedAt')}
          />
        </Field>

        <Field
          label={m.form.fields.expiresAt}
          htmlFor="ann-expires"
          error={errors.expiresAt?.message}
        >
          <DatePicker
            id="ann-expires"
            invalid={Boolean(errors.expiresAt)}
            {...register('expiresAt')}
          />
        </Field>

        <Field label={m.form.fields.status} htmlFor="ann-status">
          <Select
            id="ann-status"
            options={labelOptions(announcementStatusLabels)}
            {...register('status')}
          />
        </Field>

        <p className="sm:col-span-2 text-xs text-slate-400 flex items-start gap-1.5">
          <AlertCircle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          {m.form.notice}
        </p>
      </div>
    </Modal>
  );
}
