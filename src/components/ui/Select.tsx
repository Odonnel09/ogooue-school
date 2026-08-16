'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import type { SelectOption } from '@/types';
import { ui } from '@/i18n/fr';
import { cn, matches } from '@/lib/utils';
import {
  CONTROL_INVALID,
  OPTION_BASE,
  TRIGGER_BASE,
  TRIGGER_OPEN,
} from './field-styles';
import { PopoverPanel } from './Popover';

/**
 * LISTE DÉROULANTE.
 *
 * Un `<select>` natif délègue le rendu de sa liste au système : impossible de
 * la mettre aux couleurs de la plateforme. On dessine donc la liste nous-mêmes
 * et l'on conserve un `<select>` masqué comme **véritable champ de
 * formulaire** — c'est lui qui porte le `name`, la `ref` et l'événement
 * `change`. React Hook Form continue donc de fonctionner sans rien changer aux
 * appelants, et le formulaire reste valide sans JavaScript de notre part.
 *
 * Le motif ARIA suivi est celui du bouton combobox : `role="combobox"` sur le
 * déclencheur, `role="listbox"` sur le panneau, `aria-activedescendant` pour
 * désigner l'option courante sans déplacer le focus.
 */

/** Au-delà de ce nombre d'options, un champ de recherche apparaît. */
const SEARCH_THRESHOLD = 8;

/* -------------------------------------------------------------------------- */
/* Synchronisation avec l'élément natif                                        */
/* -------------------------------------------------------------------------- */

/**
 * Lit la valeur de l'élément natif et se réabonne à ses changements.
 *
 * `useSyncExternalStore` est ici le bon outil : la valeur vit dans le DOM, où
 * React Hook Form l'écrit directement (valeurs par défaut, `reset`). Un état
 * local se désynchroniserait à la première réinitialisation.
 */
export function useNativeValue(
  ref: RefObject<HTMLSelectElement | HTMLInputElement | null>,
): string {
  const subscribe = useCallback(
    (notify: () => void) => {
      const node = ref.current;
      if (!node) return () => undefined;
      node.addEventListener('change', notify);
      node.addEventListener('input', notify);
      return () => {
        node.removeEventListener('change', notify);
        node.removeEventListener('input', notify);
      };
    },
    [ref],
  );

  return useSyncExternalStore(
    subscribe,
    () => ref.current?.value ?? '',
    () => '',
  );
}

/**
 * Écrit une valeur dans un élément natif **comme le ferait l'utilisateur**.
 *
 * React garde une trace de la dernière valeur rendue pour dédupliquer les
 * événements ; passer par le mutateur du prototype contourne ce suivi et
 * garantit que `onChange` se déclenche bien.
 */
export function setNativeValue(
  node: HTMLSelectElement | HTMLInputElement,
  value: string,
): void {
  const prototype =
    node instanceof HTMLSelectElement
      ? HTMLSelectElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  setter?.call(node, value);
  node.dispatchEvent(new Event('input', { bubbles: true }));
  node.dispatchEvent(new Event('change', { bubbles: true }));
}

/** Fusionne notre ref interne avec celle éventuellement fournie par l'appelant. */
export function mergeRefs<T>(
  own: RefObject<T | null>,
  forwarded: Ref<T> | undefined,
): (node: T | null) => void {
  return (node: T | null) => {
    own.current = node;
    if (typeof forwarded === 'function') forwarded(node);
    else if (forwarded) {
      (forwarded as { current: T | null }).current = node;
    }
  };
}

/* -------------------------------------------------------------------------- */
/* Coquille commune                                                            */
/* -------------------------------------------------------------------------- */

interface ShellProps {
  options: SelectOption[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  describedBy?: string;
  ariaLabel?: string;
  /**
   * Gabarit du déclencheur :
   * `field` pour les formulaires, `filter` pour la barre de filtres,
   * `compact` pour les sélecteurs du bandeau, `inline` pour un choix posé
   * dans un titre de section, sans cadre.
   */
  variant?: 'field' | 'filter' | 'compact' | 'inline';
  className?: string;
  onBlur?: () => void;
  /** Pastille de couleur ou icône affichée devant l'option et la valeur. */
  renderAdornment?: (option: SelectOption) => ReactNode;
}

const FILTER_TRIGGER =
  'flex w-full items-center gap-2 py-2.5 pl-3.5 pr-3 bg-slate-50 border border-transparent rounded-xl text-sm text-left transition-all duration-300 outline-none cursor-pointer hover:bg-slate-100/80 focus-visible:border-brand-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand-500/10';

const COMPACT_TRIGGER =
  'flex items-center gap-1.5 py-2 pl-3 pr-2 bg-slate-50 border border-transparent rounded-xl text-xs text-left transition-all duration-300 outline-none cursor-pointer hover:bg-slate-100 focus-visible:border-brand-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand-500/10';

const INLINE_TRIGGER =
  'group flex items-center gap-1.5 py-1 px-1.5 -mx-1.5 rounded-lg bg-transparent text-sm text-left transition-colors outline-none cursor-pointer hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-brand-500/20';

const TRIGGERS = {
  field: TRIGGER_BASE,
  filter: FILTER_TRIGGER,
  compact: COMPACT_TRIGGER,
  inline: INLINE_TRIGGER,
} as const;

export function SelectShell({
  options,
  value,
  onSelect,
  placeholder,
  disabled,
  invalid,
  id,
  describedBy,
  ariaLabel,
  variant = 'field',
  className,
  onBlur,
  renderAdornment,
}: ShellProps) {
  const listId = useId();
  const optionId = useId();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const searchable = options.length >= SEARCH_THRESHOLD;
  const visible = search
    ? options.filter((option) => matches(option.label, search))
    : options;

  const selected = options.find((option) => option.value === value) ?? null;
  /** Une option de valeur vide vaut « aucun choix » : elle s'affiche en gris. */
  const hasChoice = Boolean(selected && selected.value !== '');

  const close = useCallback(
    (returnFocus = true) => {
      setOpen(false);
      setSearch('');
      if (returnFocus) triggerRef.current?.focus();
      onBlur?.();
    },
    [onBlur],
  );

  function openList() {
    if (disabled) return;
    const index = visible.findIndex((option) => option.value === value);
    setActiveIndex(index === -1 ? 0 : index);
    setSearch('');
    setOpen(true);
  }

  function choose(option: SelectOption) {
    onSelect(option.value);
    close();
  }

  // Le champ de recherche prend le focus à l'ouverture : on peut taper aussitôt.
  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  // L'option active reste visible pendant la navigation au clavier.
  useEffect(() => {
    if (!open) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  function move(delta: number) {
    if (visible.length === 0) return;
    setActiveIndex((previous) => {
      const next = previous + delta;
      if (next < 0) return visible.length - 1;
      if (next >= visible.length) return 0;
      return next;
    });
  }

  function handleKey(event: ReactKeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) openList();
        else move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) openList();
        else move(-1);
        break;
      case 'Home':
        if (!open) break;
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        if (!open) break;
        event.preventDefault();
        setActiveIndex(Math.max(0, visible.length - 1));
        break;
      case 'Enter':
        if (!open) {
          event.preventDefault();
          openList();
          break;
        }
        event.preventDefault();
        if (visible[activeIndex]) choose(visible[activeIndex]);
        break;
      case ' ':
        // Espace n'ouvre la liste que hors saisie de recherche.
        if (open && searchable) break;
        event.preventDefault();
        if (open && visible[activeIndex]) choose(visible[activeIndex]);
        else openList();
        break;
      case 'Escape':
        if (!open) break;
        event.preventDefault();
        close();
        break;
      case 'Tab':
        if (open) close(false);
        break;
      default:
        break;
    }
  }

  const isFilter = variant === 'filter';
  const isInline = variant === 'inline';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={handleKey}
        className={cn(
          TRIGGERS[variant],
          open && !isInline && TRIGGER_OPEN,
          isFilter && value && 'bg-brand-50/60 text-slate-900',
          invalid && CONTROL_INVALID,
          className,
        )}
      >
        {selected && renderAdornment?.(selected)}
        <span
          className={cn(
            'flex-1 truncate',
            isInline
              ? 'text-slate-500 group-hover:text-slate-900'
              : hasChoice
                ? 'text-slate-900'
                : 'text-slate-400',
          )}
        >
          {selected?.label ?? placeholder ?? ui.selectPlaceholder}
        </span>
        <ChevronDown
          size={isInline || variant === 'compact' ? 14 : 16}
          aria-hidden="true"
          className={cn(
            'shrink-0 text-slate-400 transition-transform duration-200',
            open && 'rotate-180 text-brand-500',
          )}
        />
      </button>

      <PopoverPanel
        open={open}
        anchorRef={triggerRef}
        onDismiss={() => close(false)}
        minWidth={variant === 'field' ? 224 : 208}
        matchAnchorWidth={variant === 'field' || isFilter}
        maxHeight={340}
      >
        {searchable && (
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search
                size={15}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKey}
                placeholder={ui.searchOption}
                aria-label={ui.searchOption}
                aria-controls={listId}
                aria-activedescendant={
                  visible[activeIndex] ? `${optionId}-${activeIndex}` : undefined
                }
                className="w-full py-2 pl-9 pr-3 bg-slate-50 rounded-lg text-sm text-slate-900 placeholder-slate-400 outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20"
              />
            </div>
          </div>
        )}

        <div
          id={listId}
          role="listbox"
          aria-label={ariaLabel ?? placeholder}
          aria-activedescendant={
            !searchable && visible[activeIndex]
              ? `${optionId}-${activeIndex}`
              : undefined
          }
          className="flex-1 overflow-y-auto p-1.5"
        >
          {visible.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-slate-400">
              {ui.noOption}
            </p>
          ) : (
            visible.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;

              return (
                <div
                  key={option.value}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  id={`${optionId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(option)}
                  className={cn(
                    OPTION_BASE,
                    isActive && !isSelected && 'bg-slate-100 text-slate-900',
                    isSelected
                      ? 'bg-brand-50 text-brand-700 font-medium'
                      : 'text-slate-600',
                  )}
                >
                  {renderAdornment?.(option)}
                  <span className="flex-1 truncate">{option.label}</span>
                  {isSelected && (
                    <Check
                      size={15}
                      aria-hidden="true"
                      className="shrink-0 text-brand-600"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </PopoverPanel>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Champ de formulaire                                                         */
/* -------------------------------------------------------------------------- */

type SelectProps = Omit<ComponentPropsWithRef<'select'>, 'children'> & {
  options: SelectOption[];
  placeholder?: string;
  invalid?: boolean;
};

export function Select({
  options,
  placeholder,
  invalid,
  className,
  id,
  ref,
  value,
  disabled,
  onBlur,
  ...props
}: SelectProps) {
  const nativeRef = useRef<HTMLSelectElement>(null);
  const nativeValue = useNativeValue(nativeRef);

  // En usage contrôlé, la prop fait foi dès le premier rendu : attendre la
  // synchronisation du DOM ferait clignoter l'étiquette au montage.
  const current = value !== undefined ? String(value) : nativeValue;

  function handleSelect(next: string) {
    if (nativeRef.current) setNativeValue(nativeRef.current, next);
  }

  return (
    <>
      {/*
        Champ réel : masqué visuellement mais présent dans le DOM. Il n'est pas
        atteignable au clavier — le déclencheur ci-dessous joue ce rôle — et
        renvoie le focus vers lui si un moteur de validation l'y amène.
      */}
      <select
        ref={mergeRefs(nativeRef, ref)}
        value={value}
        disabled={disabled}
        onBlur={onBlur}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <SelectShell
        options={options}
        value={current}
        onSelect={handleSelect}
        placeholder={placeholder}
        disabled={disabled}
        invalid={invalid}
        id={id}
        describedBy={id && invalid ? `${id}-error` : undefined}
        className={className}
      />
    </>
  );
}
