import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Primitives de tableau reprenant le style du tableau de bord :
 * en-tête gris clair, lignes séparées par une bordure très légère.
 * Le conteneur gère le défilement horizontal maîtrisé sur petits écrans.
 */
export function TableWrapper({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('overflow-x-auto hide-scrollbar -mx-1 px-1', className)}>
      {children}
    </div>
  );
}

export function Table({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <table className={cn('w-full text-sm text-left min-w-max', className)}>
      {children}
    </table>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
      {children}
    </thead>
  );
}

export function TH({
  className,
  children,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'px-4 py-3 font-medium first:rounded-l-lg last:rounded-r-lg',
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TRow({
  highlighted = false,
  className,
  children,
}: {
  highlighted?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <tr
      className={cn(
        'border-b last:border-0 border-slate-100 transition-colors hover:bg-slate-50/70',
        highlighted && 'bg-brand-50/50',
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TD({
  className,
  children,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('px-4 py-3 text-slate-500 align-middle', className)} {...props}>
      {children}
    </td>
  );
}
