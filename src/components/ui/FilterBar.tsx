'use client';

import { useState, type ReactNode } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type { SelectOption } from '@/types';
import { cn } from '@/lib/utils';
import { SearchInput } from './SearchInput';

/**
 * Barre de recherche + filtres.
 * Sur mobile, les filtres sont regroupés dans un panneau dépliable pour
 * garder l'action principale et la recherche immédiatement accessibles.
 */
export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  activeCount = 0,
  onReset,
  children,
  trailing,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Nombre de filtres actifs, affiché sur le bouton mobile. */
  activeCount?: number;
  onReset?: () => void;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="flex-1"
        />

        <button
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          className={cn(
            'lg:hidden inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-colors shrink-0',
            open || activeCount > 0
              ? 'bg-brand-50 border-brand-100 text-brand-600'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
          )}
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Filtres</span>
          {activeCount > 0 && (
            <span className="bg-brand-600 text-white text-[11px] w-4 h-4 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        <div className="hidden lg:flex items-center gap-3">{children}</div>

        {trailing && <div className="hidden lg:flex items-center gap-2">{trailing}</div>}
      </div>

      {/* Panneau de filtres mobile / tablette */}
      {open && (
        <div className="lg:hidden mt-3 pt-3 border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
          {trailing && <div className="flex flex-wrap gap-2">{trailing}</div>}
        </div>
      )}

      {activeCount > 0 && onReset && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {activeCount} filtre{activeCount > 1 ? 's' : ''} actif
            {activeCount > 1 ? 's' : ''}
          </p>
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-brand-600 hover:underline inline-flex items-center gap-1"
          >
            <X size={13} /> Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
}

/** Select compact utilisé dans la barre de filtres. */
export function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  label,
  fullWidth = false,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  label?: string;
  /** Occupe toute la largeur disponible, y compris en desktop. */
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <select
      aria-label={label ?? placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        'w-full py-2.5 pl-3.5 pr-9 bg-slate-50 border border-transparent rounded-xl text-sm text-slate-600 cursor-pointer appearance-none bg-no-repeat focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all duration-300 outline-none',
        !fullWidth && 'lg:w-auto',
        value && 'text-slate-900 bg-brand-50/60',
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundSize: '1rem',
        backgroundPosition: 'right 0.75rem center',
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
