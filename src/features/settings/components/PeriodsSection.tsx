'use client';

import { useState } from 'react';
import { CalendarRange, Plus, Trash2 } from 'lucide-react';
import type { Cycle, Period, PeriodKind } from '@/types';
import { cycleLabels, periodKindLabels } from '@/i18n/fr';
import { useSchoolData } from '@/lib/store/school-data';
import { labelOptions, labelOptionsFor } from '@/lib/status';
import { periodKindsFor } from '@/lib/school-levels/capabilities';
import { createId } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  MultiSelect,
  Select,
  TD,
  TH,
  THead,
  TRow,
  Table,
  TableWrapper,
  useToast,
} from '@/components/ui';
import { settingsMessages as m } from '../messages';
import { periodSchema, type PeriodValues } from '../schemas';
import { SettingsSection } from './SettingsSection';

export function PeriodsSection() {
  const toast = useToast();
  const { config, actions } = useSchoolData();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<PeriodValues>({
    label: '',
    kind: periodKindsFor(config.activeCycles)[0] ?? 'trimestre',
    cycles: [config.activeCycles[0]],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** Périodes concernant au moins un cycle ouvert. */
  const visible = config.periods.filter((period) =>
    period.cycles.some((cycle) => config.activeCycles.includes(cycle)),
  );

  function add() {
    const parsed = periodSchema.safeParse(draft);
    if (!parsed.success) {
      const found: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        found[issue.path.join('.')] = issue.message;
      });
      setErrors(found);
      return;
    }

    const period: Period = { id: createId('per'), ...parsed.data };
    actions.updateConfig({ periods: [...config.periods, period] });
    setErrors({});
    setOpen(false);
    setDraft({ ...draft, label: '' });
    toast.success(`Période « ${period.label} » ajoutée.`);
  }

  function remove(period: Period) {
    actions.updateConfig({
      periods: config.periods.filter((item) => item.id !== period.id),
    });
    toast.success(`Période « ${period.label} » retirée.`);
  }

  return (
    <SettingsSection
      title={m.periods.title}
      description={m.periods.description}
      actions={
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} aria-hidden="true" /> {m.periods.add}
        </Button>
      }
    >
      <Card className="p-4 sm:p-6">
        {visible.length === 0 ? (
          <EmptyState
            title={m.periods.empty}
            message={m.periods.emptyMessage}
            icon={<CalendarRange size={24} aria-hidden="true" />}
            action={
              <Button onClick={() => setOpen(true)}>
                <Plus size={16} aria-hidden="true" /> {m.periods.add}
              </Button>
            }
          />
        ) : (
          <TableWrapper>
            <Table>
              <THead>
                <tr>
                  <TH scope="col">{m.periods.columns.label}</TH>
                  <TH scope="col">{m.periods.columns.kind}</TH>
                  <TH scope="col">{m.periods.columns.cycles}</TH>
                  <TH scope="col" className="text-right">
                    Actions
                  </TH>
                </tr>
              </THead>
              <tbody>
                {visible.map((period) => (
                  <TRow key={period.id}>
                    <TD className="font-medium text-slate-900">{period.label}</TD>
                    <TD>{periodKindLabels[period.kind]}</TD>
                    <TD>
                      <span className="flex flex-wrap gap-1">
                        {period.cycles
                          .filter((cycle) => config.activeCycles.includes(cycle))
                          .map((cycle) => (
                            <Badge key={cycle} tone="slate">
                              {cycleLabels[cycle]}
                            </Badge>
                          ))}
                      </span>
                    </TD>
                    <TD className="text-right">
                      <button
                        type="button"
                        aria-label={`${m.periods.remove} ${period.label}`}
                        onClick={() => remove(period)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-red-500/20"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </TD>
                  </TRow>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={m.periods.addTitle}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={add}>{m.periods.add}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field
            label={m.periods.fields.label}
            htmlFor="period-label"
            required
            error={errors.label}
          >
            <Input
              id="period-label"
              value={draft.label}
              placeholder={m.periods.fields.labelPlaceholder}
              invalid={Boolean(errors.label)}
              onChange={(event) =>
                setDraft({ ...draft, label: event.target.value })
              }
            />
          </Field>

          <Field label={m.periods.fields.kind} htmlFor="period-kind">
            <Select
              id="period-kind"
              value={draft.kind}
              options={labelOptionsFor(
                periodKindLabels,
                periodKindsFor(config.activeCycles),
              )}
              onChange={(event) =>
                setDraft({ ...draft, kind: event.target.value as PeriodKind })
              }
            />
          </Field>

          <Field
            label={m.periods.fields.cycles}
            required
            error={errors.cycles}
          >
            <MultiSelect
              options={labelOptions(cycleLabels).filter((option) =>
                config.activeCycles.includes(option.value as Cycle),
              )}
              value={draft.cycles}
              onChange={(value) =>
                setDraft({ ...draft, cycles: value as Cycle[] })
              }
            />
          </Field>
        </div>
      </Modal>
    </SettingsSection>
  );
}
