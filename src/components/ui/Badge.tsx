import type { ReactNode } from 'react';
import type { BadgeTone, StatusMeta } from '@/types';
import { cn } from '@/lib/utils';

const TONES: Record<BadgeTone, { chip: string; dot: string }> = {
  brand: { chip: 'bg-brand-50 text-brand-600', dot: 'bg-brand-500' },
  green: { chip: 'bg-green-50 text-green-600', dot: 'bg-green-500' },
  orange: { chip: 'bg-orange-50 text-orange-600', dot: 'bg-orange-500' },
  blue: { chip: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
  yellow: { chip: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-500' },
  red: { chip: 'bg-red-50 text-red-500', dot: 'bg-red-500' },
  slate: { chip: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
};

export function Badge({
  tone = 'slate',
  dot = false,
  className,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap',
        TONES[tone].chip,
        className,
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', TONES[tone].dot)} />
      )}
      {children}
    </span>
  );
}

/** Badge piloté par un `StatusMeta` (libellé + couleur définis dans les types). */
export function StatusBadge({
  meta,
  className,
}: {
  meta: StatusMeta;
  className?: string;
}) {
  return (
    <Badge tone={meta.tone} dot className={className}>
      {meta.label}
    </Badge>
  );
}
