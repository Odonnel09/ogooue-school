'use client';

import { X } from 'lucide-react';
import type { SelectOption } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from './Badge';

/**
 * Sélection multiple sous forme de liste à cocher + puces récapitulatives.
 * Choisi plutôt qu'un `<select multiple>`, inutilisable au doigt sur mobile.
 */
export function MultiSelect({
  options,
  value,
  onChange,
  emptyLabel = 'Aucune sélection',
  className,
}: {
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  emptyLabel?: string;
  className?: string;
}) {
  function toggle(optionValue: string) {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-1.5 min-h-7">
        {value.length === 0 ? (
          <span className="text-xs text-slate-400">{emptyLabel}</span>
        ) : (
          value.map((item) => {
            const option = options.find((entry) => entry.value === item);
            return (
              <Badge key={item} tone="brand">
                {option?.label ?? item}
                <button
                  type="button"
                  onClick={() => toggle(item)}
                  aria-label={`Retirer ${option?.label ?? item}`}
                  className="hover:text-brand-800 transition-colors"
                >
                  <X size={12} />
                </button>
              </Badge>
            );
          })
        )}
      </div>

      <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 divide-y divide-slate-100">
        {options.length === 0 ? (
          <p className="text-xs text-slate-400 p-3">Aucune option disponible.</p>
        ) : (
          options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-white transition-colors"
            >
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => toggle(option.value)}
                className="h-4 w-4 rounded border-slate-300 accent-brand-600 cursor-pointer"
              />
              <span className="text-sm text-slate-700">{option.label}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
