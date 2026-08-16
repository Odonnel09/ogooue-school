'use client';

import { ShieldAlert } from 'lucide-react';
import type { ParticipantKind } from '@/types';
import { participantKindLabels } from '@/i18n/fr';
import type { MessagingRules } from '@/lib/messaging/policy';
import { useAudit } from '@/lib/audit/use-audit';
import { useSchoolData } from '@/lib/store/school-data';
import { cn } from '@/lib/utils';
import { Card, Checkbox, useToast } from '@/components/ui';
import { settingsMessages as m } from '../messages';
import { SettingsSection } from './SettingsSection';

const KINDS: ParticipantKind[] = [
  'administration',
  'enseignant',
  'parent',
  'eleve',
];

/**
 * Règles d'échange de l'établissement.
 *
 * `GEMINI.md` exige que les paramètres de messagerie soient configurables
 * (l. 229) et que l'usage de la messagerie suive « les règles de
 * l'établissement » (l. 115). C'est cet écran qui les définit ; la matrice
 * ci-dessous est la seule source consultée par la composition d'un message.
 */
export function MessagingSection() {
  const toast = useToast();
  const audit = useAudit();
  const { config, actions } = useSchoolData();

  const rules = config.messaging;

  function write(next: MessagingRules, detail: string) {
    actions.updateConfig({ messaging: next });
    audit({
      action: 'settings.messaging.update',
      resourceType: 'Messagerie',
      resourceId: 'messaging-rules',
      resourceLabel: 'Règles d’échange',
      detail,
    });
    toast.success(m.saved);
  }

  function toggleCell(from: ParticipantKind, to: ParticipantKind) {
    const current = rules.allowed[from];
    const allowed = current.includes(to);
    const next: MessagingRules = {
      ...rules,
      allowed: {
        ...rules.allowed,
        [from]: allowed
          ? current.filter((item) => item !== to)
          : [...current, to],
      },
    };

    write(
      next,
      `${participantKindLabels[from]} → ${participantKindLabels[to]} : ${
        allowed ? 'échange interdit' : 'échange autorisé'
      }.`,
    );
  }

  function toggleFlag(
    key: 'guardiansMayInitiate' | 'broadcastRestrictedToAdmin' | 'attachmentsAllowed',
    detail: string,
  ) {
    write({ ...rules, [key]: !rules[key] }, detail);
  }

  return (
    <SettingsSection
      title={m.messaging.title}
      description={m.messaging.description}
    >
      <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 flex items-start gap-3">
        <ShieldAlert
          size={18}
          className="text-yellow-600 mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <p className="text-xs text-yellow-800 leading-relaxed">
          {m.messaging.warning}
        </p>
      </div>

      <Card className="p-4 sm:p-6">
        <h2 className="text-base font-bold text-slate-900">
          {m.messaging.matrixTitle}
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          {m.messaging.matrixHint}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm border-separate border-spacing-1">
            <caption className="sr-only">{m.messaging.matrixTitle}</caption>
            <thead>
              <tr>
                <th scope="col" className="text-left text-xs font-medium text-slate-400 px-2 pb-2">
                  {m.messaging.fromColumn}
                </th>
                {KINDS.map((kind) => (
                  <th
                    key={kind}
                    scope="col"
                    className="text-xs font-medium text-slate-400 px-2 pb-2"
                  >
                    {participantKindLabels[kind]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {KINDS.map((from) => (
                <tr key={from}>
                  <th
                    scope="row"
                    className="text-left text-sm font-medium text-slate-700 px-2 whitespace-nowrap"
                  >
                    {participantKindLabels[from]}
                  </th>
                  {KINDS.map((to) => {
                    const allowed = rules.allowed[from].includes(to);
                    return (
                      <td key={to} className="text-center">
                        <button
                          type="button"
                          onClick={() => toggleCell(from, to)}
                          aria-pressed={allowed}
                          aria-label={`${participantKindLabels[from]} vers ${participantKindLabels[to]}`}
                          className={cn(
                            'w-full py-2.5 rounded-xl text-xs font-medium transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20',
                            allowed
                              ? 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                              : 'bg-slate-50 text-slate-400 hover:bg-slate-100',
                          )}
                        >
                          {allowed ? m.messaging.allowed : m.messaging.blocked}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4 sm:p-6 space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          {m.messaging.optionsTitle}
        </h2>

        <Checkbox
          label={m.messaging.options.guardiansMayInitiate}
          description={m.messaging.options.guardiansMayInitiateHint}
          checked={rules.guardiansMayInitiate}
          onChange={() =>
            toggleFlag(
              'guardiansMayInitiate',
              rules.guardiansMayInitiate
                ? 'Les familles ne peuvent plus ouvrir de conversation.'
                : 'Les familles peuvent ouvrir une conversation.',
            )
          }
        />

        <Checkbox
          label={m.messaging.options.broadcastRestricted}
          description={m.messaging.options.broadcastRestrictedHint}
          checked={rules.broadcastRestrictedToAdmin}
          onChange={() =>
            toggleFlag(
              'broadcastRestrictedToAdmin',
              rules.broadcastRestrictedToAdmin
                ? 'La diffusion est ouverte aux enseignants.'
                : 'La diffusion est réservée à l’administration.',
            )
          }
        />

        <Checkbox
          label={m.messaging.options.attachments}
          description={m.messaging.options.attachmentsHint}
          checked={rules.attachmentsAllowed}
          onChange={() =>
            toggleFlag(
              'attachmentsAllowed',
              rules.attachmentsAllowed
                ? 'Les pièces jointes sont désormais interdites.'
                : 'Les pièces jointes sont autorisées.',
            )
          }
        />
      </Card>
    </SettingsSection>
  );
}
