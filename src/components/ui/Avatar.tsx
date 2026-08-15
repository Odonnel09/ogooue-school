import { avatarUrl, cn, initials } from '@/lib/utils';

const SIZES = {
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 sm:w-24 sm:h-24 text-2xl',
} as const;

export type AvatarSize = keyof typeof SIZES;

/**
 * Avatar circulaire. Utilise le même service d'illustration que le tableau de
 * bord ; les initiales restent affichées en arrière-plan si l'image ne charge pas.
 */
export function Avatar({
  name,
  src,
  size = 'md',
  className,
}: {
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
}) {
  const source = src || avatarUrl(name);

  return (
    <span
      className={cn(
        'relative shrink-0 inline-flex items-center justify-center rounded-full bg-slate-200 text-slate-600 font-semibold overflow-hidden',
        SIZES[size],
        className,
      )}
    >
      <span aria-hidden="true">{initials(...name.split(' '))}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={source}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
    </span>
  );
}
