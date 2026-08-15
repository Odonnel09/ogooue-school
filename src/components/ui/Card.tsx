import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Carte blanche principale — référence visuelle du tableau de bord. */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-slate-100',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Carte secondaire, posée à l'intérieur d'une `Card`. */
export function InnerCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-100',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Carte avec en-tête : titre à gauche, actions à droite. */
export function SectionCard({
  title,
  description,
  action,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <Card className={className}>
      <div className="flex flex-wrap gap-3 justify-between items-start sm:items-center p-4 sm:p-6 pb-0">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      <div className={cn('p-4 sm:p-6', bodyClassName)}>{children}</div>
    </Card>
  );
}

/** Libellé + valeur, utilisé dans les fiches de détail. */
export function DataRow({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('py-2.5 border-b border-slate-100 last:border-0', className)}>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900 mt-1 break-words">{value || '—'}</dd>
    </div>
  );
}
