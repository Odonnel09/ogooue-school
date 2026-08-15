import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type StatTone = 'brand' | 'blue' | 'orange' | 'green' | 'red' | 'yellow';

const TONES: Record<StatTone, string> = {
  brand: 'bg-brand-50 text-brand-600',
  blue: 'bg-blue-50 text-blue-500',
  orange: 'bg-orange-50 text-orange-500',
  green: 'bg-green-50 text-green-500',
  red: 'bg-red-50 text-red-500',
  yellow: 'bg-yellow-50 text-yellow-500',
};

/**
 * Taille de la valeur, adaptée à sa longueur.
 *
 * Un effectif (« 39 ») et un montant (« 21 255 000 FCFA ») n'occupent pas la
 * même place : sans cette réduction, les montants débordaient derrière la
 * pastille d'icône.
 */
function valueSize(length: number): string {
  if (length > 12) return 'text-base sm:text-lg';
  if (length > 8) return 'text-lg sm:text-xl';
  if (length > 5) return 'text-xl sm:text-2xl';
  return 'text-2xl sm:text-3xl';
}

/** Carte statistique identique à celles du tableau de bord. */
export function StatCard({
  label,
  value,
  icon,
  tone = 'brand',
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: StatTone;
  hint?: string;
  className?: string;
}) {
  const text =
    typeof value === 'string' || typeof value === 'number' ? String(value) : '';

  return (
    <div
      className={cn(
        'bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex justify-between items-center gap-3',
        className,
      )}
    >
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="text-sm font-medium text-slate-500 mb-1 truncate">
          {label}
        </p>
        <h3
          title={text || undefined}
          className={cn(
            'font-bold text-slate-900 leading-tight whitespace-nowrap truncate',
            valueSize(text.length),
          )}
        >
          {value}
        </h3>
        {hint && <p className="text-xs text-slate-400 mt-1 truncate">{hint}</p>}
      </div>
      <div
        className={cn(
          'w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0',
          TONES[tone],
        )}
      >
        {icon}
      </div>
    </div>
  );
}
