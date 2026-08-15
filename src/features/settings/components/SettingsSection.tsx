'use client';

import type { ReactNode } from 'react';
import { Construction } from 'lucide-react';
import { Badge, Card, EmptyState } from '@/components/ui';
import { settingsMessages as m } from '../messages';

/** En-tête commun à toutes les sections de Paramètres. */
export function SettingsSection({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-3xl">{description}</p>
        </div>
        {actions && (
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">{actions}</div>
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * Section déclarée dans le hub mais dont l'écran arrive à une étape ultérieure.
 * On l'affiche plutôt que de la masquer : `GEMINI.md` exige que Paramètres
 * recense l'intégralité de la configuration de l'établissement.
 */
export function ComingSoonSection({
  title,
  description,
  message,
}: {
  title: string;
  description: string;
  message: string;
}) {
  return (
    <SettingsSection
      title={title}
      description={description}
      actions={<Badge tone="yellow">{m.comingSoon.badge}</Badge>}
    >
      <Card>
        <EmptyState
          title="Écran à venir"
          message={message}
          icon={<Construction size={24} aria-hidden="true" />}
        />
      </Card>
    </SettingsSection>
  );
}
