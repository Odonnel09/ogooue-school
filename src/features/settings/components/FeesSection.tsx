'use client';

import { useState } from 'react';
import { AlertTriangle, Plus, Receipt, Trash2 } from 'lucide-react';
import type { FeeInstallment, FeeItem, FeeSchedule } from '@/types';
import { CURRENT_ACADEMIC_YEAR } from '@/data/academic';
import { useSchoolData } from '@/lib/store/school-data';
import { useAudit } from '@/lib/audit/use-audit';
import { levelOptions, yearOptions } from '@/lib/options';
import { formatMoney, share, sumAmounts } from '@/lib/money';
import { createId } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  MultiSelect,
  Select,
  useToast,
  DatePicker,
} from '@/components/ui';
import { settingsMessages as m } from '../messages';
import { SettingsSection } from './SettingsSection';

export function FeesSection() {
  const toast = useToast();
  const { config, actions } = useSchoolData();
  const audit = useAudit();
  const [toDelete, setToDelete] = useState<FeeSchedule | null>(null);

  const schedules = config.feeSchedules;

  /** Toute modification réécrit la liste complète des grilles. */
  function writeSchedules(next: FeeSchedule[]) {
    actions.updateConfig({ feeSchedules: next });
  }

  function patchSchedule(id: string, changes: Partial<FeeSchedule>) {
    writeSchedules(
      schedules.map((schedule) =>
        schedule.id === id ? { ...schedule, ...changes } : schedule,
      ),
    );
  }

  function addSchedule() {
    const schedule: FeeSchedule = {
      id: createId('fee'),
      label: 'Nouvelle grille',
      levelIds: [],
      academicYear: CURRENT_ACADEMIC_YEAR,
      items: [
        {
          id: createId('fee-item'),
          label: 'Scolarité annuelle',
          amount: 0,
          mandatory: true,
        },
      ],
      installments: [
        {
          id: createId('inst'),
          label: 'Tranche unique',
          percent: 100,
          dueDate: '',
        },
      ],
    };
    writeSchedules([...schedules, schedule]);
    audit({
      action: 'settings.fees.update',
      resourceType: 'Grille tarifaire',
      resourceId: schedule.id,
      resourceLabel: schedule.label,
      detail: 'Nouvelle grille tarifaire créée.',
    });
    toast.success(m.fees.toasts.scheduleAdded);
  }

  function removeSchedule(schedule: FeeSchedule) {
    writeSchedules(schedules.filter((item) => item.id !== schedule.id));
    audit({
      action: 'settings.fees.update',
      resourceType: 'Grille tarifaire',
      resourceId: schedule.id,
      resourceLabel: schedule.label,
      detail: 'Grille tarifaire supprimée. Les factures déjà émises sont inchangées.',
    });
    setToDelete(null);
    toast.success(m.fees.toasts.scheduleRemoved(schedule.label));
  }

  function patchItem(
    scheduleId: string,
    itemId: string,
    changes: Partial<FeeItem>,
  ) {
    const schedule = schedules.find((item) => item.id === scheduleId);
    if (!schedule) return;
    patchSchedule(scheduleId, {
      items: schedule.items.map((item) =>
        item.id === itemId ? { ...item, ...changes } : item,
      ),
    });
  }

  function patchInstallment(
    scheduleId: string,
    installmentId: string,
    changes: Partial<FeeInstallment>,
  ) {
    const schedule = schedules.find((item) => item.id === scheduleId);
    if (!schedule) return;
    patchSchedule(scheduleId, {
      installments: schedule.installments.map((installment) =>
        installment.id === installmentId
          ? { ...installment, ...changes }
          : installment,
      ),
    });
  }

  return (
    <SettingsSection
      title={m.fees.title}
      description={m.fees.description}
      actions={
        <Button onClick={addSchedule}>
          <Plus size={16} aria-hidden="true" /> {m.fees.addSchedule}
        </Button>
      }
    >
      {schedules.length === 0 ? (
        <Card>
          <EmptyState
            title={m.fees.empty}
            message={m.fees.emptyMessage}
            icon={<Receipt size={24} aria-hidden="true" />}
            action={
              <Button onClick={addSchedule}>
                <Plus size={16} aria-hidden="true" /> {m.fees.addSchedule}
              </Button>
            }
          />
        </Card>
      ) : (
        schedules.map((schedule) => {
          const mandatoryTotal = sumAmounts(
            schedule.items
              .filter((item) => item.mandatory)
              .map((item) => item.amount),
          );
          const optionalTotal = sumAmounts(
            schedule.items
              .filter((item) => !item.mandatory)
              .map((item) => item.amount),
          );
          const percentTotal = schedule.installments.reduce(
            (total, installment) => total + installment.percent,
            0,
          );

          return (
            <Card key={schedule.id} className="p-4 sm:p-6 space-y-5">
              {/* Identification de la grille */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={m.fees.fields.label} htmlFor={`label-${schedule.id}`}>
                  <Input
                    id={`label-${schedule.id}`}
                    value={schedule.label}
                    onChange={(event) =>
                      patchSchedule(schedule.id, { label: event.target.value })
                    }
                  />
                </Field>

                <Field
                  label={m.fees.fields.academicYear}
                  htmlFor={`year-${schedule.id}`}
                >
                  <Select
                    id={`year-${schedule.id}`}
                    value={schedule.academicYear}
                    options={yearOptions()}
                    onChange={(event) =>
                      patchSchedule(schedule.id, {
                        academicYear: event.target.value,
                      })
                    }
                  />
                </Field>

                <Field
                  label={m.fees.fields.levels}
                  hint={m.fees.fields.levelsHint}
                  className="sm:col-span-2"
                >
                  <MultiSelect
                    options={levelOptions(config.activeCycles)}
                    value={schedule.levelIds}
                    onChange={(value) =>
                      patchSchedule(schedule.id, { levelIds: value })
                    }
                    emptyLabel={m.fees.fields.levelsEmpty}
                  />
                </Field>
              </div>

              {/* Frais */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    {m.fees.itemsTitle}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      patchSchedule(schedule.id, {
                        items: [
                          ...schedule.items,
                          {
                            id: createId('fee-item'),
                            label: '',
                            amount: 0,
                            mandatory: true,
                          },
                        ],
                      })
                    }
                  >
                    <Plus size={15} aria-hidden="true" /> {m.fees.addItem}
                  </Button>
                </div>

                <ul className="space-y-2">
                  {schedule.items.map((item) => (
                    <li
                      key={item.id}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_10rem_auto_auto] gap-2 items-center bg-slate-50 rounded-xl p-3 border border-slate-100"
                    >
                      <Input
                        aria-label={m.fees.fields.itemLabel}
                        value={item.label}
                        placeholder={m.fees.fields.itemPlaceholder}
                        className="py-2.5 bg-white"
                        onChange={(event) =>
                          patchItem(schedule.id, item.id, {
                            label: event.target.value,
                          })
                        }
                      />
                      <Input
                        aria-label={`${m.fees.fields.amount} — ${item.label}`}
                        type="number"
                        min={0}
                        step={1000}
                        value={item.amount}
                        className="py-2.5 bg-white text-right"
                        onChange={(event) =>
                          patchItem(schedule.id, item.id, {
                            // Montant entier : le franc CFA n'a pas de centimes.
                            amount: Math.max(
                              0,
                              Math.round(Number(event.target.value) || 0),
                            ),
                          })
                        }
                      />
                      <label className="flex items-center gap-2 text-xs text-slate-600 px-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.mandatory}
                          onChange={(event) =>
                            patchItem(schedule.id, item.id, {
                              mandatory: event.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-slate-300 accent-brand-600 cursor-pointer"
                        />
                        {m.fees.fields.mandatory}
                      </label>
                      <button
                        type="button"
                        aria-label={`${m.fees.removeItem} ${item.label}`}
                        onClick={() =>
                          patchSchedule(schedule.id, {
                            items: schedule.items.filter(
                              (entry) => entry.id !== item.id,
                            ),
                          })
                        }
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg justify-self-end outline-none focus-visible:ring-4 focus-visible:ring-red-500/20"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center justify-end gap-2 mt-3">
                  {optionalTotal > 0 && (
                    <Badge tone="slate">
                      {m.fees.optionalTotal} {formatMoney(optionalTotal)}
                    </Badge>
                  )}
                  <Badge tone="brand">
                    {m.fees.mandatoryTotal} {formatMoney(mandatoryTotal)}
                  </Badge>
                </div>
              </div>

              {/* Échéancier */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900">
                      {m.fees.installmentsTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {m.fees.installmentsHint}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      patchSchedule(schedule.id, {
                        installments: [
                          ...schedule.installments,
                          {
                            id: createId('inst'),
                            label: '',
                            percent: 0,
                            dueDate: '',
                          },
                        ],
                      })
                    }
                  >
                    <Plus size={15} aria-hidden="true" />{' '}
                    {m.fees.addInstallment}
                  </Button>
                </div>

                <ul className="space-y-2">
                  {schedule.installments.map((installment) => (
                    <li
                      key={installment.id}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_7rem_11rem_auto] gap-2 items-center bg-slate-50 rounded-xl p-3 border border-slate-100"
                    >
                      <Input
                        aria-label={m.fees.fields.installmentLabel}
                        value={installment.label}
                        placeholder={m.fees.fields.installmentPlaceholder}
                        className="py-2.5 bg-white"
                        onChange={(event) =>
                          patchInstallment(schedule.id, installment.id, {
                            label: event.target.value,
                          })
                        }
                      />
                      <Input
                        aria-label={`${m.fees.fields.percent} — ${installment.label}`}
                        type="number"
                        min={0}
                        max={100}
                        value={installment.percent}
                        className="py-2.5 bg-white text-right"
                        onChange={(event) =>
                          patchInstallment(schedule.id, installment.id, {
                            percent: Math.min(
                              100,
                              Math.max(
                                0,
                                Math.round(Number(event.target.value) || 0),
                              ),
                            ),
                          })
                        }
                      />
                      <DatePicker
                        aria-label={`${m.fees.fields.dueDate} — ${installment.label}`}
                        value={installment.dueDate}
                        className="py-2.5 bg-white"
                        onChange={(event) =>
                          patchInstallment(schedule.id, installment.id, {
                            dueDate: event.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        aria-label={`${m.fees.removeInstallment} ${installment.label}`}
                        onClick={() =>
                          patchSchedule(schedule.id, {
                            installments: schedule.installments.filter(
                              (entry) => entry.id !== installment.id,
                            ),
                          })
                        }
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg justify-self-end outline-none focus-visible:ring-4 focus-visible:ring-red-500/20"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Aperçu des montants par tranche */}
                {percentTotal === 100 ? (
                  <ul className="flex flex-wrap gap-2 mt-3 justify-end">
                    {schedule.installments.map((installment) => (
                      <li key={installment.id}>
                        <Badge tone="green">
                          {installment.label || '—'} ·{' '}
                          {formatMoney(share(mandatoryTotal, installment.percent))}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-3 bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-start gap-2.5">
                    <AlertTriangle
                      size={16}
                      className="text-orange-600 mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <p className="text-xs text-orange-800 leading-relaxed">
                      {m.fees.percentMismatch(percentTotal)}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end">
                <Button
                  variant="dangerSoft"
                  size="sm"
                  onClick={() => setToDelete(schedule)}
                >
                  <Trash2 size={15} aria-hidden="true" />{' '}
                  {m.fees.removeSchedule}
                </Button>
              </div>
            </Card>
          );
        })
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title={m.fees.removeScheduleTitle}
        message={toDelete ? m.fees.removeScheduleMessage(toDelete.label) : ''}
        confirmLabel={m.fees.removeSchedule}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && removeSchedule(toDelete)}
      />
    </SettingsSection>
  );
}
