'use client';

import { useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import type { Cycle } from '@/types';
import { cycleLabels, gradingKindLabels, gradingScaleLabels } from '@/i18n/fr';
import { LEVEL_CAPABILITIES } from '@/lib/school-levels/capabilities';
import { SCALES } from '@/lib/grading/scales';
import { gradingConfigSchema } from '@/lib/grading/config.schema';
import type { GradingConfig } from '@/lib/grading/types';
import { useSchoolData } from '@/lib/store/school-data';
import { useAudit } from '@/lib/audit/use-audit';
import { labelOptionsFor } from '@/lib/status';
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Select,
  Tabs,
  useToast,
} from '@/components/ui';
import { settingsMessages as m } from '../messages';
import { SettingsSection } from './SettingsSection';

const ROUNDING_OPTIONS = [
  { value: 'round_half_up', label: m.grading.rounding.round_half_up },
  { value: 'truncate', label: m.grading.rounding.truncate },
  { value: 'nearest_quarter', label: m.grading.rounding.nearest_quarter },
];

const ABSENCE_OPTIONS = [
  { value: 'exclude', label: m.grading.absence.exclude },
  { value: 'count_as_zero', label: m.grading.absence.count_as_zero },
];

export function GradingSection() {
  const toast = useToast();
  const { config, actions } = useSchoolData();
  const audit = useAudit();

  const cycles = config.activeCycles;
  const [cycle, setCycle] = useState<Cycle>(cycles[0]);
  const [draft, setDraft] = useState<GradingConfig>(
    () => config.gradingSystems[cycles[0]],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  /**
   * Ajustement pendant le rendu : changer d'onglet recharge le brouillon
   * correspondant sans passer par un effet.
   */
  const [loadedCycle, setLoadedCycle] = useState<Cycle>(cycles[0]);
  if (loadedCycle !== cycle) {
    setLoadedCycle(cycle);
    setDraft(config.gradingSystems[cycle]);
    setErrors({});
  }

  const capabilities = LEVEL_CAPABILITIES[cycle];
  const scaleChoices = labelOptionsFor(
    gradingScaleLabels,
    capabilities.gradingScales,
  );

  function patch(next: Partial<GradingConfig>) {
    setDraft((previous) => ({ ...previous, ...next }));
  }

  function save() {
    const parsed = gradingConfigSchema.safeParse(draft);

    if (!parsed.success) {
      const found: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path.join('.');
        found[key] = issue.message;
      });
      setErrors(found);
      toast.error('Certains réglages sont invalides.');
      return;
    }

    setErrors({});
    setSaving(true);
    setTimeout(() => {
      actions.updateConfig({
        gradingSystems: { ...config.gradingSystems, [cycle]: draft },
      });
      audit({
        action: 'settings.grading.update',
        resourceType: 'Configuration',
        resourceId: `grading-${cycle}`,
        resourceLabel: `Notation — ${cycleLabels[cycle]}`,
        detail: `Barème ${draft.scale}, seuil de réussite ${draft.passMark}/20, arrondi ${draft.rounding}.`,
      });
      setSaving(false);
      toast.success(m.saved);
    }, 400);
  }

  return (
    <SettingsSection
      title={m.grading.title}
      description={m.grading.description}
      actions={
        <Button onClick={save} loading={saving}>
          <Save size={16} aria-hidden="true" /> {m.save}
        </Button>
      }
    >
      <Tabs
        items={cycles.map((item) => ({ id: item, label: cycleLabels[item] }))}
        active={cycle}
        onChange={(value) => setCycle(value as Cycle)}
      />

      <Card className="p-4 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">{m.grading.engine}</span>
          <Badge tone="brand">{gradingKindLabels[capabilities.gradingKind]}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <Field label={m.grading.fields.scale} htmlFor="scale">
            <Select
              id="scale"
              value={draft.scale}
              options={scaleChoices}
              onChange={(event) => {
                const scale = event.target
                  .value as GradingConfig['scale'];
                patch({ scale, maxScore: SCALES[scale].defaultMax || 1 });
              }}
            />
          </Field>

          <Field
            label={m.grading.fields.maxScore}
            htmlFor="maxScore"
            error={errors.maxScore}
            hint={
              SCALES[draft.scale].editableMax
                ? undefined
                : 'Déduite du barème choisi.'
            }
          >
            <Input
              id="maxScore"
              type="number"
              min={1}
              value={draft.maxScore}
              disabled={!SCALES[draft.scale].editableMax}
              invalid={Boolean(errors.maxScore)}
              onChange={(event) => patch({ maxScore: Number(event.target.value) })}
            />
          </Field>

          <Field label={m.grading.fields.rounding} htmlFor="rounding">
            <Select
              id="rounding"
              value={draft.rounding}
              options={ROUNDING_OPTIONS}
              onChange={(event) =>
                patch({ rounding: event.target.value as GradingConfig['rounding'] })
              }
            />
          </Field>

          <Field
            label={m.grading.fields.absencePolicy}
            htmlFor="absencePolicy"
            className="sm:col-span-2"
          >
            <Select
              id="absencePolicy"
              value={draft.absencePolicy}
              options={ABSENCE_OPTIONS}
              onChange={(event) =>
                patch({
                  absencePolicy: event.target
                    .value as GradingConfig['absencePolicy'],
                })
              }
            />
          </Field>

          <Field
            label={m.grading.fields.passMark}
            htmlFor="passMark"
            error={errors.passMark}
          >
            <Input
              id="passMark"
              type="number"
              min={0}
              max={20}
              step={0.5}
              value={draft.passMark}
              invalid={Boolean(errors.passMark)}
              onChange={(event) => patch({ passMark: Number(event.target.value) })}
            />
          </Field>
        </div>

        {/* Réglages LMD — affichés selon les capacités déclarées par le cycle. */}
        {(capabilities.hasCompensation || capabilities.hasSessions) && (
          <div className="border-t border-slate-100 pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {capabilities.hasCompensation && (
              <Field label={m.grading.fields.compensation} htmlFor="compensation">
                <Select
                  id="compensation"
                  value={draft.compensation ? 'oui' : 'non'}
                  options={[
                    { value: 'oui', label: 'Activée' },
                    { value: 'non', label: 'Désactivée' },
                  ]}
                  onChange={(event) =>
                    patch({ compensation: event.target.value === 'oui' })
                  }
                />
              </Field>
            )}

            {capabilities.hasSessions && (
              <>
                <Field label={m.grading.fields.sessions} htmlFor="sessions">
                  <Select
                    id="sessions"
                    value={draft.sessions ? 'oui' : 'non'}
                    options={[
                      { value: 'oui', label: 'Activée' },
                      { value: 'non', label: 'Désactivée' },
                    ]}
                    onChange={(event) =>
                      patch({ sessions: event.target.value === 'oui' })
                    }
                  />
                </Field>

                <Field
                  label={m.grading.fields.resitThreshold}
                  htmlFor="resitThreshold"
                  error={errors.resitThreshold}
                >
                  <Input
                    id="resitThreshold"
                    type="number"
                    min={0}
                    max={20}
                    step={0.5}
                    value={draft.resitThreshold}
                    invalid={Boolean(errors.resitThreshold)}
                    onChange={(event) =>
                      patch({ resitThreshold: Number(event.target.value) })
                    }
                  />
                </Field>
              </>
            )}
          </div>
        )}

        {/* Mentions */}
        <div className="border-t border-slate-100 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h3 className="text-sm font-bold text-slate-900">
              {m.grading.fields.mentions}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                patch({ mentions: [...draft.mentions, { label: '', min: 10 }] })
              }
            >
              <Plus size={15} aria-hidden="true" /> {m.grading.addMention}
            </Button>
          </div>

          <ul className="space-y-2">
            {draft.mentions.map((mention, index) => (
              <li
                key={index}
                className="grid grid-cols-[1fr_7rem_auto] gap-2 items-center"
              >
                <Input
                  aria-label={`${m.grading.fields.mentionLabel} ${index + 1}`}
                  value={mention.label}
                  className="py-2.5"
                  onChange={(event) =>
                    patch({
                      mentions: draft.mentions.map((item, position) =>
                        position === index
                          ? { ...item, label: event.target.value }
                          : item,
                      ),
                    })
                  }
                />
                <Input
                  aria-label={`${m.grading.fields.mentionMin} ${index + 1}`}
                  type="number"
                  min={0}
                  max={20}
                  step={0.5}
                  value={mention.min}
                  className="py-2.5"
                  onChange={(event) =>
                    patch({
                      mentions: draft.mentions.map((item, position) =>
                        position === index
                          ? { ...item, min: Number(event.target.value) }
                          : item,
                      ),
                    })
                  }
                />
                <button
                  type="button"
                  aria-label={`${m.grading.removeMention} ${mention.label || index + 1}`}
                  onClick={() =>
                    patch({
                      mentions: draft.mentions.filter(
                        (_, position) => position !== index,
                      ),
                    })
                  }
                  className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-red-500/20"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </SettingsSection>
  );
}
