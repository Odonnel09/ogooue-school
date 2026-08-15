import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Conteneur de page — reprend les marges du tableau de bord
 * (`p-8` en desktop) tout en restant lisible sur téléphone.
 */
export function PageContainer({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 sm:space-y-6 lg:space-y-8',
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface Crumb {
  label: string;
  href?: string;
}

/** Fil d'Ariane discret, affiché au-dessus du titre des pages de détail. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center flex-wrap gap-1 mb-2">
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center gap-1">
          {index > 0 && <ChevronRight size={13} className="text-slate-300" />}
          {item.href ? (
            <Link
              href={item.href}
              className="text-xs text-slate-500 hover:text-brand-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-xs text-slate-400">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Titre de page, description courte et action principale. */
export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumb?: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
      <div className="min-w-0">
        {breadcrumb && <Breadcrumb items={breadcrumb} />}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h1>
        {description && (
          <p className="text-slate-500 text-sm mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">{actions}</div>
      )}
    </div>
  );
}
