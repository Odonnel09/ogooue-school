'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Save } from 'lucide-react';
import { ui } from '@/i18n/fr';
import { useSchoolData } from '@/lib/store/school-data';
import { useAudit } from '@/lib/audit/use-audit';
import {
  Badge,
  Button,
  Field,
  FormSection,
  Input,
  useToast,
} from '@/components/ui';
import { settingsMessages as m } from '../messages';
import { tenantProfileSchema, type TenantProfileValues } from '../schemas';
import { SettingsSection } from './SettingsSection';

export function GeneralSection() {
  const toast = useToast();
  const { config, actions } = useSchoolData();
  const audit = useAudit();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TenantProfileValues>({
    defaultValues: config.profile,
    resolver: zodResolver(tenantProfileSchema),
  });

  function persist(values: TenantProfileValues) {
    setSaving(true);
    setTimeout(() => {
      actions.updateConfig({ profile: values });
      audit({
        action: 'settings.profile.update',
        resourceType: 'Établissement',
        resourceId: config.profile.name,
        resourceLabel: values.name,
        detail: 'Identité de l’établissement mise à jour : elle apparaît sur tous les documents émis.',
      });
      reset(values);
      setSaving(false);
      toast.success(m.saved);
    }, 400);
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(persist, () => toast.error(ui.invalidForm))}
    >
      <SettingsSection
        title={m.general.title}
        description={m.general.description}
        actions={
          <>
            {isDirty && <Badge tone="yellow" dot>{m.dirty}</Badge>}
            {isDirty && (
              <Button
                variant="ghost"
                onClick={() => reset(config.profile)}
                disabled={saving}
              >
                <RotateCcw size={16} aria-hidden="true" /> {m.cancel}
              </Button>
            )}
            <Button type="submit" loading={saving} disabled={!isDirty}>
              <Save size={16} aria-hidden="true" /> {m.save}
            </Button>
          </>
        }
      >
        <FormSection title="Identité" description={m.general.description}>
          <Field
            label={m.general.fields.name}
            htmlFor="name"
            required
            error={errors.name?.message}
            className="sm:col-span-2"
          >
            <Input id="name" invalid={Boolean(errors.name)} {...register('name')} />
          </Field>

          <Field
            label={m.general.fields.shortName}
            htmlFor="shortName"
            hint={m.general.fields.shortNameHint}
            error={errors.shortName?.message}
          >
            <Input
              id="shortName"
              invalid={Boolean(errors.shortName)}
              {...register('shortName')}
            />
          </Field>

          <Field label={m.general.fields.type} htmlFor="type">
            <Input id="type" {...register('type')} />
          </Field>

          <Field label={m.general.fields.director} htmlFor="director">
            <Input id="director" {...register('director')} />
          </Field>

          <Field
            label={m.general.fields.logo}
            htmlFor="logo"
            hint={m.general.fields.logoHint}
            error={errors.logo?.message}
          >
            <Input id="logo" invalid={Boolean(errors.logo)} {...register('logo')} />
          </Field>
        </FormSection>

        <FormSection title="Coordonnées" description="Utilisées sur les documents officiels et les notifications.">
          <Field
            label={m.general.fields.address}
            htmlFor="address"
            className="sm:col-span-2"
          >
            <Input id="address" {...register('address')} />
          </Field>

          <Field
            label={m.general.fields.city}
            htmlFor="city"
            required
            error={errors.city?.message}
          >
            <Input id="city" invalid={Boolean(errors.city)} {...register('city')} />
          </Field>

          <Field
            label={m.general.fields.country}
            htmlFor="country"
            required
            error={errors.country?.message}
          >
            <Input
              id="country"
              invalid={Boolean(errors.country)}
              {...register('country')}
            />
          </Field>

          <Field
            label={m.general.fields.email}
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
            label={m.general.fields.phone}
            htmlFor="phone"
            required
            error={errors.phone?.message}
          >
            <Input
              id="phone"
              type="tel"
              invalid={Boolean(errors.phone)}
              {...register('phone')}
            />
          </Field>
        </FormSection>

        <FormSection
          title="Régionalisation"
          description="Ces valeurs sont figées en v1 : le produit cible le Gabon."
        >
          <Field
            label={m.general.fields.currency}
            htmlFor="currency"
            hint={m.general.fields.currencyHint}
          >
            <Input id="currency" disabled {...register('currency')} />
          </Field>

          <Field label={m.general.fields.timezone} htmlFor="timezone">
            <Input id="timezone" disabled {...register('timezone')} />
          </Field>
        </FormSection>
      </SettingsSection>
    </form>
  );
}
