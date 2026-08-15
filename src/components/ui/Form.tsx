import {
  useId,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { AlertCircle } from 'lucide-react';
import type { SelectOption } from '@/types';
import { cn } from '@/lib/utils';

const CONTROL_BASE =
  'block w-full py-3 px-4 bg-slate-50 border border-transparent rounded-xl text-sm text-slate-900 placeholder-slate-400 focus-visible:border-brand-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand-500/10 transition-all duration-300 outline-none disabled:opacity-60 disabled:cursor-not-allowed';

const CONTROL_INVALID =
  'border-red-300 bg-red-50/50 focus-visible:border-red-500 focus-visible:ring-red-500/10';

/** Groupe de champs avec titre de section, comme dans les fiches du dashboard. */
export function FormSection({
  title,
  description,
  children,
  columns = 2,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  columns?: 1 | 2 | 3;
}) {
  const headingId = useId();
  const grid =
    columns === 1
      ? 'grid-cols-1'
      : columns === 3
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2';

  return (
    <section
      aria-labelledby={headingId}
      className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100"
    >
      <div className="mb-5">
        <h2 id={headingId} className="text-base sm:text-lg font-bold text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
      </div>
      <div className={cn('grid gap-4 sm:gap-5', grid)}>{children}</div>
    </section>
  );
}

/** Barre d'actions de formulaire, collante en bas d'écran sur mobile. */
export function FormActions({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 bg-white/90 backdrop-blur border border-slate-100 rounded-2xl shadow-sm p-3 sm:p-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
      {children}
    </div>
  );
}

/**
 * Étiquette + aide + message d'erreur.
 * Relie l'erreur au champ par `aria-describedby` : un lecteur d'écran annonce
 * le motif du rejet au moment où le champ prend le focus.
 */
export function Field({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-slate-700 mb-1.5"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p
          id={htmlFor ? `${htmlFor}-error` : undefined}
          role="alert"
          className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
        >
          <AlertCircle size={13} aria-hidden="true" /> {error}
        </p>
      ) : (
        hint && (
          <p
            id={htmlFor ? `${htmlFor}-hint` : undefined}
            className="mt-1.5 text-xs text-slate-400"
          >
            {hint}
          </p>
        )
      )}
    </div>
  );
}

type InputProps = ComponentPropsWithRef<'input'> & { invalid?: boolean };

export function Input({ invalid, className, id, ...props }: InputProps) {
  return (
    <input
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={id && invalid ? `${id}-error` : undefined}
      className={cn(CONTROL_BASE, invalid && CONTROL_INVALID, className)}
      {...props}
    />
  );
}

type SelectProps = ComponentPropsWithRef<'select'> & {
  options: SelectOption[];
  placeholder?: string;
  invalid?: boolean;
};

const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

export function Select({
  options,
  placeholder,
  invalid,
  className,
  id,
  ...props
}: SelectProps) {
  return (
    <select
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={id && invalid ? `${id}-error` : undefined}
      className={cn(
        CONTROL_BASE,
        'appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10 cursor-pointer',
        invalid && CONTROL_INVALID,
        className,
      )}
      style={{ backgroundImage: CHEVRON }}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

type TextareaProps = ComponentPropsWithRef<'textarea'> & { invalid?: boolean };

export function Textarea({ invalid, className, id, ...props }: TextareaProps) {
  return (
    <textarea
      id={id}
      rows={4}
      aria-invalid={invalid || undefined}
      aria-describedby={id && invalid ? `${id}-error` : undefined}
      className={cn(
        CONTROL_BASE,
        'resize-y',
        invalid && CONTROL_INVALID,
        className,
      )}
      {...props}
    />
  );
}

/** Case à cocher accessible, utilisée dans les listes de sélection. */
export function Checkbox({
  label,
  description,
  className,
  ...props
}: ComponentPropsWithRef<'input'> & {
  label: string;
  description?: string;
}) {
  return (
    <label
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer focus-within:ring-4 focus-within:ring-brand-500/10',
        className,
      )}
    >
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-brand-600 cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-500"
        {...props}
      />
      <span className="min-w-0">
        <span className="block text-sm text-slate-900">{label}</span>
        {description && (
          <span className="block text-xs text-slate-500 mt-0.5">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
