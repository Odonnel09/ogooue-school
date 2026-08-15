'use client';

import { Info } from 'lucide-react';
import type { DocumentTemplate, ReportColumnKey } from '@/types';
import { useSchoolData } from '@/lib/store/school-data';
import {
  AssetUpload,
  Card,
  Checkbox,
  Field,
  Input,
  Textarea,
  useToast,
} from '@/components/ui';
import { settingsMessages as m } from '../messages';

const COLUMN_LABELS: Record<ReportColumnKey, string> = {
  teacher: m.templates.columns.teacher,
  coefficient: m.templates.columns.coefficient,
  classAverage: m.templates.columns.classAverage,
  lowest: m.templates.columns.lowest,
  best: m.templates.columns.best,
};

const COLUMN_ORDER: ReportColumnKey[] = [
  'teacher',
  'coefficient',
  'classAverage',
  'lowest',
  'best',
];

/**
 * Éditeur de gabarit.
 *
 * Le gabarit n'est jamais déduit d'un fichier : l'administrateur fournit des
 * images et des réglages, et le document se compose par-dessus. C'est ce qui
 * rend le rendu reproductible — condition nécessaire pour figer un bulletin.
 */
export function TemplateEditor({
  variant,
}: {
  variant: 'report' | 'card';
}) {
  const toast = useToast();
  const { config, actions } = useSchoolData();

  const template = config.templates[variant];

  function patch(changes: Partial<DocumentTemplate>) {
    actions.updateConfig({
      templates: {
        ...config.templates,
        [variant]: { ...template, ...changes },
      },
    });
  }

  function toggleColumn(column: ReportColumnKey, enabled: boolean) {
    patch({
      columns: enabled
        ? COLUMN_ORDER.filter(
            (key) => key === column || template.columns.includes(key),
          )
        : template.columns.filter((key) => key !== column),
    });
  }

  return (
    <>
      <Card className="p-4 sm:p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {m.templates.assetsTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {m.templates.assetsHint}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AssetUpload
            label={m.templates.fields.background}
            hint={m.templates.fields.backgroundHint}
            value={template.background}
            onChange={(background) => patch({ background })}
            onError={toast.error}
            previewClassName="w-24 h-16"
          />

          <Field
            label={m.templates.fields.backgroundOpacity}
            htmlFor={`opacity-${variant}`}
            hint={m.templates.fields.backgroundOpacityHint}
          >
            <Input
              id={`opacity-${variant}`}
              type="range"
              min={0}
              max={100}
              step={1}
              value={template.backgroundOpacity}
              className="py-2"
              onChange={(event) =>
                patch({ backgroundOpacity: Number(event.target.value) })
              }
            />
          </Field>

          <AssetUpload
            label={m.templates.fields.logo}
            hint={m.templates.fields.logoHint}
            value={template.logo}
            onChange={(logo) => patch({ logo })}
            maxWidth={400}
            onError={toast.error}
          />

          {variant === 'report' && (
            <AssetUpload
              label={m.templates.fields.stamp}
              hint={m.templates.fields.stampHint}
              value={template.stamp}
              onChange={(stamp) => patch({ stamp })}
              maxWidth={400}
              onError={toast.error}
            />
          )}
        </div>
      </Card>

      <Card className="p-4 sm:p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {m.templates.styleTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1">{m.templates.styleHint}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label={m.templates.fields.documentTitle}
            htmlFor={`title-${variant}`}
          >
            <Input
              id={`title-${variant}`}
              value={template.documentTitle}
              onChange={(event) =>
                patch({ documentTitle: event.target.value })
              }
            />
          </Field>

          <Field
            label={m.templates.fields.accentColor}
            htmlFor={`accent-${variant}`}
            hint={m.templates.fields.accentColorHint}
          >
            <div className="flex items-center gap-2">
              <input
                id={`accent-${variant}`}
                type="color"
                value={template.accentColor}
                onChange={(event) => patch({ accentColor: event.target.value })}
                className="h-11 w-14 rounded-xl border border-slate-200 bg-white cursor-pointer p-1"
              />
              <Input
                aria-label={m.templates.fields.accentColor}
                value={template.accentColor}
                onChange={(event) => patch({ accentColor: event.target.value })}
                className="font-mono"
              />
            </div>
          </Field>

          <Field
            label={m.templates.fields.footerText}
            htmlFor={`footer-${variant}`}
            className="sm:col-span-2"
            hint={m.templates.fields.footerHint}
          >
            <Textarea
              id={`footer-${variant}`}
              rows={2}
              value={template.footerText}
              placeholder={m.templates.fields.footerPlaceholder}
              onChange={(event) => patch({ footerText: event.target.value })}
            />
          </Field>
        </div>

        {variant === 'report' && (
          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              {m.templates.columnsTitle}
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              {m.templates.columnsHint}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {COLUMN_ORDER.map((column) => (
                <Checkbox
                  key={column}
                  label={COLUMN_LABELS[column]}
                  checked={template.columns.includes(column)}
                  onChange={(event) =>
                    toggleColumn(column, event.target.checked)
                  }
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {m.templates.referenceTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {m.templates.referenceHint}
          </p>
        </div>

        <AssetUpload
          label={m.templates.fields.reference}
          hint={m.templates.fields.referenceHint}
          value={template.referenceFile}
          onChange={(referenceFile) => patch({ referenceFile })}
          onError={toast.error}
        />

        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-2.5">
          <Info
            size={16}
            className="text-slate-400 mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <p className="text-xs text-slate-600 leading-relaxed">
            {m.templates.referenceNotice}
          </p>
        </div>
      </Card>
    </>
  );
}
