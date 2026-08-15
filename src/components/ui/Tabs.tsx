'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

/**
 * Onglets horizontaux, défilables sur mobile.
 *
 * Suit le modèle ARIA « tabs » : un seul onglet est atteignable au Tab
 * (tabindex mobile), les flèches déplacent la sélection, Début et Fin sautent
 * aux extrémités.
 */
export function Tabs({
  items,
  active,
  onChange,
  className,
}: {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function select(index: number) {
    const target = items[index];
    if (!target) return;
    onChange(target.id);
    refs.current[index]?.focus();
  }

  function handleKey(event: React.KeyboardEvent, index: number) {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        select((index + 1) % items.length);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        select((index - 1 + items.length) % items.length);
        break;
      case 'Home':
        event.preventDefault();
        select(0);
        break;
      case 'End':
        event.preventDefault();
        select(items.length - 1);
        break;
      default:
        break;
    }
  }

  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1 overflow-x-auto hide-scrollbar bg-slate-50 border border-slate-100 rounded-xl p-1',
        className,
      )}
    >
      {items.map((item, index) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => handleKey(event, index)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20',
              isActive
                ? 'bg-white text-brand-600 font-medium shadow-sm'
                : 'text-slate-500 hover:text-slate-900',
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  'text-[11px] px-1.5 py-0.5 rounded-full',
                  isActive
                    ? 'bg-brand-50 text-brand-600'
                    : 'bg-slate-200/70 text-slate-500',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
