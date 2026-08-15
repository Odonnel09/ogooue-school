'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MoreVertical } from 'lucide-react';
import { ui } from '@/i18n/fr';
import { cn } from '@/lib/utils';

export interface MenuAction {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  /** Action destructive : affichée en rouge, toujours en fin de menu. */
  destructive?: boolean;
  disabled?: boolean;
}

/**
 * Menu déroulant d'actions de ligne.
 *
 * Navigation clavier complète : flèches pour parcourir, Début/Fin pour aller
 * aux extrémités, Échap pour fermer en rendant le focus au déclencheur.
 */
export function ActionMenu({
  actions,
  label = ui.actions,
  align = 'right',
  trigger,
}: {
  actions: MenuAction[];
  label?: string;
  align?: 'left' | 'right';
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const enabled = actions
    .map((action, index) => ({ action, index }))
    .filter((entry) => !entry.action.disabled);

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function openMenu() {
    setActiveIndex(enabled[0]?.index ?? 0);
    setOpen(true);
  }

  // Fermeture au clic extérieur.
  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointer);
    return () => document.removeEventListener('mousedown', handlePointer);
  }, [open]);

  // Le focus suit l'élément actif du menu.
  useEffect(() => {
    if (!open) return;
    itemRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  function move(direction: 1 | -1) {
    if (enabled.length === 0) return;
    const position = enabled.findIndex((entry) => entry.index === activeIndex);
    const next =
      position === -1
        ? 0
        : (position + direction + enabled.length) % enabled.length;
    setActiveIndex(enabled[next].index);
  }

  function handleMenuKey(event: React.KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        break;
      case 'Home':
        event.preventDefault();
        if (enabled.length > 0) setActiveIndex(enabled[0].index);
        break;
      case 'End':
        event.preventDefault();
        if (enabled.length > 0) {
          setActiveIndex(enabled[enabled.length - 1].index);
        }
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  }

  function handleTriggerKey(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu();
    }
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={handleTriggerKey}
        className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg p-1.5 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
      >
        {trigger ?? <MoreVertical size={16} aria-hidden="true" />}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={label}
          onKeyDown={handleMenuKey}
          className={cn(
            'absolute z-30 mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {actions.map((action, index) => (
            <button
              key={action.label}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              role="menuitem"
              tabIndex={index === activeIndex ? 0 : -1}
              disabled={action.disabled}
              onClick={() => {
                close(false);
                action.onSelect();
              }}
              className={cn(
                'w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors outline-none disabled:opacity-40 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-inset',
                action.destructive
                  ? 'text-red-500 hover:bg-red-50 focus-visible:ring-red-400'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-brand-400',
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
