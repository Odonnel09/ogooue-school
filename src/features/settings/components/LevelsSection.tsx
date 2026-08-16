'use client';

import { AlertTriangle, Check, Minus } from 'lucide-react';
import { CYCLES, type Cycle } from '@/types';
import {
  cycleDescriptions,
  cycleLabels,
  evaluationTypeLabels,
  gradingKindLabels,
  periodKindLabels,
  studentFieldLabels,
} from '@/i18n/fr';
import { LEVEL_CAPABILITIES } from '@/lib/school-levels/capabilities';
import { useSchoolData } from '@/lib/store/school-data';
import { useAudit } from '@/lib/audit/use-audit';
import { cn } from '@/lib/utils';
import { Badge, Button, Card, useToast } from '@/components/ui';
import { settingsMessages as m } from '../messages';
import { SettingsSection } from './SettingsSection';

export function LevelsSection() {
  const toast = useToast();
  const { config, actions } = useSchoolData();
  const audit = useAudit();

  const active = config.activeCycles;

  function toggle(cycle: Cycle) {
    const isActive = active.includes(cycle);

    if (isActive && active.length === 1) {
      toast.error(m.levels.lastOne);
      return;
    }

    const next = isActive
      ? active.filter((item) => item !== cycle)
      : [...CYCLES.filter((item) => active.includes(item) || item === cycle)];

    actions.updateConfig({ activeCycles: next });
    audit({
      action: 'settings.levels.toggle',
      resourceType: 'Configuration',
      resourceId: `cycle-${cycle}`,
      resourceLabel: `Cycle ${cycleLabels[cycle]}`,
      detail: isActive
        ? `Cycle désactivé : ses menus, champs et barèmes disparaissent de l’application.`
        : `Cycle activé : ses menus, champs et barèmes deviennent disponibles.`,
    });
    toast.success(
      isActive
        ? `${cycleLabels[cycle]} désactivé : ses écrans disparaissent de la navigation.`
        : `${cycleLabels[cycle]} activé : ses menus, champs et barèmes sont disponibles.`,
    );
  }

  return (
    <SettingsSection
      title={m.levels.title}
      description={m.levels.description}
      actions={
        <Badge tone="brand">
          {active.length} cycle{active.length > 1 ? 's' : ''} actif
          {active.length > 1 ? 's' : ''}
        </Badge>
      }
    >
      <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle
          size={18}
          className="text-yellow-600 mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <p className="text-xs text-yellow-800 leading-relaxed">
          {m.levels.warning}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {CYCLES.map((cycle) => {
          const capabilities = LEVEL_CAPABILITIES[cycle];
          const isActive = active.includes(cycle);

          return (
            <Card
              key={cycle}
              className={cn(
                'p-4 sm:p-6 transition-colors',
                isActive ? 'border-brand-200 bg-brand-50/30' : '',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      {cycleLabels[cycle]}
                    </h2>
                    <Badge tone={isActive ? 'green' : 'slate'} dot>
                      {isActive ? m.levels.active : m.levels.inactive}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {cycleDescriptions[cycle]}
                  </p>
                </div>

                <Button
                  variant={isActive ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => toggle(cycle)}
                >
                  {isActive ? (
                    <>
                      <Minus size={15} aria-hidden="true" />
                      {m.levels.deactivate}
                    </>
                  ) : (
                    <>
                      <Check size={15} aria-hidden="true" />
                      {m.levels.activate}
                    </>
                  )}
                </Button>
              </div>

              <dl className="mt-4 space-y-2.5 text-xs">
                <Row
                  label={m.levels.impacts.grading}
                  value={gradingKindLabels[capabilities.gradingKind]}
                />
                <Row
                  label={m.levels.impacts.periods}
                  value={capabilities.periodKinds
                    .map((kind) => periodKindLabels[kind])
                    .join(', ')}
                />
                <Row
                  label={m.levels.impacts.coefficients}
                  value={capabilities.hasCoefficients ? m.levels.yes : m.levels.no}
                />
                <Row
                  label={m.levels.impacts.credits}
                  value={capabilities.hasCredits ? m.levels.yes : m.levels.no}
                />
                {capabilities.hasCompensation && (
                  <Row
                    label={m.levels.impacts.compensation}
                    value={m.levels.yes}
                  />
                )}
                {capabilities.hasSessions && (
                  <Row label={m.levels.impacts.sessions} value={m.levels.yes} />
                )}
                <Row
                  label={m.levels.impacts.evaluationKinds}
                  value={capabilities.evaluationKinds
                    .map((kind) => evaluationTypeLabels[kind])
                    .join(', ')}
                />
                <Row
                  label={m.levels.impacts.studentFields}
                  value={capabilities.studentFields
                    .map((field) => studentFieldLabels[field])
                    .join(', ')}
                />
              </dl>
            </Card>
          );
        })}
      </div>
    </SettingsSection>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-2 items-start">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-slate-700">{value}</dd>
    </div>
  );
}
