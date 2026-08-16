'use client';

import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ui } from '@/i18n/fr';
import { cn } from '@/lib/utils';
import { CONTROL_INVALID, TRIGGER_BASE, TRIGGER_OPEN } from './field-styles';
import { PopoverPanel } from './Popover';
import { mergeRefs, setNativeValue, useNativeValue } from './Select';

/**
 * SÉLECTEUR DE DATE.
 *
 * Même parti pris que la liste déroulante : le calendrier natif du navigateur
 * n'est pas stylable et change d'aspect d'un système à l'autre. On dessine
 * donc la grille nous-mêmes au-dessus d'un `<input type="date">` masqué, qui
 * reste le champ de formulaire réel — validation, `name` et `ref` inclus.
 *
 * Toutes les dates circulent au format ISO « AAAA-MM-JJ », comme partout
 * ailleurs dans l'application ; seul l'affichage est francisé.
 */

const WEEKDAYS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
const WEEKDAY_INITIALS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

const TRIGGER_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const CELL_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/* -------------------------------------------------------------------------- */
/* Dates : manipulations locales, sans dépendance                              */
/* -------------------------------------------------------------------------- */

function toIso(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Analyse « AAAA-MM-JJ » en date locale — `new Date(iso)` la lirait en UTC. */
function fromIso(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(date: Date, count: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}

/** Ajoute des mois en gardant le dernier jour valide (31 janvier → 28 février). */
function addMonths(date: Date, count: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth() + count, 1);
  const lastDay = new Date(
    next.getFullYear(),
    next.getMonth() + 1,
    0,
  ).getDate();
  next.setDate(Math.min(date.getDate(), lastDay));
  return next;
}

/** Index du jour dans une semaine commençant le lundi (0 = lundi). */
function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** Les 42 cases de la grille : semaines complètes, du lundi au dimanche. */
function buildGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = addDays(first, -weekdayIndex(first));
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/* -------------------------------------------------------------------------- */
/* Composant                                                                   */
/* -------------------------------------------------------------------------- */

type DatePickerProps = Omit<
  ComponentPropsWithRef<'input'>,
  'type' | 'children'
> & {
  invalid?: boolean;
  /** Autorise la remise à vide depuis le pied du calendrier. */
  clearable?: boolean;
};

export function DatePicker({
  invalid,
  clearable = true,
  className,
  id,
  ref,
  value,
  disabled,
  min,
  max,
  onBlur,
  'aria-label': ariaLabel,
  ...props
}: DatePickerProps) {
  const nativeRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const nativeValue = useNativeValue(nativeRef);

  const current = value !== undefined ? String(value) : nativeValue;
  const selected = fromIso(current);

  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState<Date>(() => selected ?? new Date());
  const [pickingMonth, setPickingMonth] = useState(false);

  const minDate = typeof min === 'string' ? fromIso(min) : null;
  const maxDate = typeof max === 'string' ? fromIso(max) : null;
  const today = new Date();

  function isDisabled(date: Date): boolean {
    if (minDate && date < minDate && !isSameDay(date, minDate)) return true;
    if (maxDate && date > maxDate && !isSameDay(date, maxDate)) return true;
    return false;
  }

  function close(returnFocus = true) {
    setOpen(false);
    setPickingMonth(false);
    if (returnFocus) triggerRef.current?.focus();
    onBlur?.(
      // Le champ masqué n'est jamais focalisé : on relaie le flou nous-mêmes.
      { target: nativeRef.current } as never,
    );
  }

  function openCalendar() {
    if (disabled) return;
    setCursor(selected ?? new Date());
    setPickingMonth(false);
    setOpen(true);
  }

  function commit(date: Date) {
    if (isDisabled(date) || !nativeRef.current) return;
    setNativeValue(nativeRef.current, toIso(date));
    close();
  }

  function clear() {
    if (!nativeRef.current) return;
    setNativeValue(nativeRef.current, '');
    close();
  }

  // Le focus entre dans la grille à l'ouverture : les flèches pilotent aussitôt.
  useEffect(() => {
    if (open && !pickingMonth) gridRef.current?.focus();
  }, [open, pickingMonth]);

  function handleGridKey(event: ReactKeyboardEvent) {
    const step: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };

    if (event.key in step) {
      event.preventDefault();
      setCursor((previous) => addDays(previous, step[event.key]));
      return;
    }

    switch (event.key) {
      case 'PageUp':
        event.preventDefault();
        setCursor((previous) => addMonths(previous, event.shiftKey ? -12 : -1));
        break;
      case 'PageDown':
        event.preventDefault();
        setCursor((previous) => addMonths(previous, event.shiftKey ? 12 : 1));
        break;
      case 'Home':
        event.preventDefault();
        setCursor((previous) => addDays(previous, -weekdayIndex(previous)));
        break;
      case 'End':
        event.preventDefault();
        setCursor((previous) => addDays(previous, 6 - weekdayIndex(previous)));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        commit(cursor);
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      default:
        break;
    }
  }

  function handleTriggerKey(event: ReactKeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openCalendar();
    }
  }

  const grid = buildGrid(cursor);

  return (
    <>
      <input
        ref={mergeRefs(nativeRef, ref)}
        type="date"
        value={value}
        disabled={disabled}
        min={min}
        max={max}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        {...props}
      />

      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={id && invalid ? `${id}-error` : undefined}
        disabled={disabled}
        onClick={() => (open ? close(false) : openCalendar())}
        onKeyDown={handleTriggerKey}
        className={cn(
          TRIGGER_BASE,
          open && TRIGGER_OPEN,
          invalid && CONTROL_INVALID,
          className,
        )}
      >
        <CalendarDays
          size={16}
          aria-hidden="true"
          className={cn('shrink-0', open ? 'text-brand-500' : 'text-slate-400')}
        />
        <span
          className={cn(
            'flex-1 truncate',
            selected ? 'text-slate-900' : 'text-slate-400',
          )}
        >
          {selected
            ? TRIGGER_FORMATTER.format(selected)
            : ui.openCalendar}
        </span>
      </button>

      <PopoverPanel
        open={open}
        anchorRef={triggerRef}
        onDismiss={() => close(false)}
        matchAnchorWidth={false}
        minWidth={312}
        maxHeight={420}
        role="dialog"
        aria-label={ui.openCalendar}
      >
        {/* En-tête : navigation par mois, bascule vers le choix mois/année */}
        <div className="flex items-center gap-1 p-3 border-b border-slate-100">
          <NavButton
            label={ui.previousMonth}
            onClick={() => setCursor((previous) => addMonths(previous, -1))}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </NavButton>

          <button
            type="button"
            onClick={() => setPickingMonth((previous) => !previous)}
            aria-label={ui.chooseMonth}
            className="flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
          </button>

          <NavButton
            label={ui.nextMonth}
            onClick={() => setCursor((previous) => addMonths(previous, 1))}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </NavButton>
        </div>

        {pickingMonth ? (
          <MonthYearPicker
            cursor={cursor}
            onPick={(next) => {
              setCursor(next);
              setPickingMonth(false);
            }}
          />
        ) : (
          <div className="p-3">
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAY_INITIALS.map((initial, index) => (
                <abbr
                  key={`${initial}-${index}`}
                  title={WEEKDAYS[index]}
                  className="h-8 flex items-center justify-center text-[11px] font-semibold text-slate-400 no-underline"
                >
                  {initial}
                </abbr>
              ))}
            </div>

            <div
              ref={gridRef}
              role="grid"
              tabIndex={0}
              aria-label={`${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`}
              onKeyDown={handleGridKey}
              className="grid grid-cols-7 gap-0.5 outline-none rounded-xl focus-visible:ring-4 focus-visible:ring-brand-500/20"
            >
              {grid.map((date) => {
                const outside = date.getMonth() !== cursor.getMonth();
                const isSelected = selected ? isSameDay(date, selected) : false;
                const isToday = isSameDay(date, today);
                const isCursor = isSameDay(date, cursor);
                const unavailable = isDisabled(date);

                return (
                  <button
                    key={date.getTime()}
                    type="button"
                    role="gridcell"
                    tabIndex={-1}
                    disabled={unavailable}
                    aria-selected={isSelected}
                    aria-current={isToday ? 'date' : undefined}
                    aria-label={CELL_FORMATTER.format(date)}
                    onClick={() => commit(date)}
                    className={cn(
                      'h-9 w-full rounded-lg text-sm transition-colors outline-none',
                      'disabled:opacity-30 disabled:cursor-not-allowed',
                      outside ? 'text-slate-300' : 'text-slate-700',
                      !isSelected && !unavailable && 'hover:bg-brand-50',
                      isCursor &&
                        !isSelected &&
                        'ring-2 ring-brand-400 ring-inset',
                      isToday && !isSelected && 'font-bold text-brand-600',
                      isSelected &&
                        'bg-brand-600 text-white font-semibold shadow-sm shadow-brand-600/30 hover:bg-brand-700',
                    )}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pied : raccourcis */}
        <div className="flex items-center justify-between gap-2 p-2 border-t border-slate-100 bg-slate-50/60">
          <button
            type="button"
            onClick={() => commit(new Date())}
            disabled={isDisabled(today)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {ui.today}
          </button>

          {clearable && current && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-slate-400/20"
            >
              <X size={13} aria-hidden="true" /> {ui.clearDate}
            </button>
          )}
        </div>
      </PopoverPanel>
    </>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
    >
      {children}
    </button>
  );
}

/** Grille mois + navigation d'année : évite douze clics pour une date de naissance. */
function MonthYearPicker({
  cursor,
  onPick,
}: {
  cursor: Date;
  onPick: (date: Date) => void;
}) {
  const [year, setYear] = useState(cursor.getFullYear());

  return (
    <div className="p-3">
      <div className="flex items-center justify-between gap-1 mb-3">
        <NavButton
          label={ui.previousYear}
          onClick={() => setYear((previous) => previous - 1)}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </NavButton>
        <span className="text-sm font-semibold text-slate-900">{year}</span>
        <NavButton
          label={ui.nextYear}
          onClick={() => setYear((previous) => previous + 1)}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </NavButton>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {MONTHS.map((month, index) => {
          const isCurrent =
            index === cursor.getMonth() && year === cursor.getFullYear();

          return (
            <button
              key={month}
              type="button"
              onClick={() => onPick(new Date(year, index, 1))}
              className={cn(
                'py-2.5 rounded-xl text-xs font-medium transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20',
                isCurrent
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              {month.slice(0, 4)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
