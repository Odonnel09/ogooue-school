'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

/**
 * PANNEAU FLOTTANT ANCRÉ.
 *
 * Rendu dans un portail sur `document.body` et positionné en `fixed` : c'est
 * la seule façon d'échapper aux `overflow-hidden` des cartes et au défilement
 * horizontal des tableaux, qui rogneraient sinon la liste déroulante.
 *
 * Le placement est écrit directement sur le nœud, sans passer par un état :
 * une mesure suivie d'un rendu supplémentaire ferait clignoter le panneau.
 */

interface PlacementOptions {
  /** Hauteur maximale souhaitée, réduite si le bord de l'écran est proche. */
  maxHeight: number;
  /** Largeur minimale, quand le déclencheur est plus étroit que le contenu. */
  minWidth: number;
  /** Aligne la largeur du panneau sur celle du déclencheur. */
  matchAnchorWidth: boolean;
}

const MARGIN = 8;
const GAP = 6;

function place(
  panel: HTMLElement,
  anchor: HTMLElement,
  { maxHeight, minWidth, matchAnchorWidth }: PlacementOptions,
): void {
  const rect = anchor.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  const spaceBelow = viewportHeight - rect.bottom - MARGIN - GAP;
  const spaceAbove = rect.top - MARGIN - GAP;
  // On bascule au-dessus seulement si le dessous est vraiment trop court.
  const below = spaceBelow >= Math.min(maxHeight, 200) || spaceBelow >= spaceAbove;
  const available = below ? spaceBelow : spaceAbove;

  const width = matchAnchorWidth
    ? Math.max(rect.width, minWidth)
    : Math.max(minWidth, Math.min(rect.width, 420));

  const left = Math.max(
    MARGIN,
    Math.min(rect.left, viewportWidth - MARGIN - width),
  );

  panel.style.position = 'fixed';
  panel.style.left = `${Math.round(left)}px`;
  panel.style.width = `${Math.round(width)}px`;
  panel.style.maxHeight = `${Math.round(Math.max(160, Math.min(maxHeight, available)))}px`;

  if (below) {
    panel.style.top = `${Math.round(rect.bottom + GAP)}px`;
    panel.style.bottom = '';
  } else {
    panel.style.top = '';
    panel.style.bottom = `${Math.round(viewportHeight - rect.top + GAP)}px`;
  }
}

export function PopoverPanel({
  open,
  anchorRef,
  onDismiss,
  maxHeight = 320,
  minWidth = 200,
  matchAnchorWidth = true,
  className,
  children,
  ...rest
}: {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  /** Appelé au clic extérieur — la touche Échap reste gérée par l'appelant. */
  onDismiss: () => void;
  maxHeight?: number;
  minWidth?: number;
  matchAnchorWidth?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className'>) {
  const panelRef = useRef<HTMLDivElement>(null);

  /** Positionne dès que le nœud existe : aucun rendu intermédiaire visible. */
  const attach = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      if (node && anchorRef.current) {
        place(node, anchorRef.current, {
          maxHeight,
          minWidth,
          matchAnchorWidth,
        });
      }
    },
    [anchorRef, maxHeight, minWidth, matchAnchorWidth],
  );

  // Le panneau suit son ancre pendant le défilement et au redimensionnement.
  useEffect(() => {
    if (!open) return;

    const reposition = () => {
      if (panelRef.current && anchorRef.current) {
        place(panelRef.current, anchorRef.current, {
          maxHeight,
          minWidth,
          matchAnchorWidth,
        });
      }
    };

    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, anchorRef, maxHeight, minWidth, matchAnchorWidth]);

  // Fermeture au clic extérieur, déclencheur compris.
  useEffect(() => {
    if (!open) return;

    const handlePointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onDismiss();
    };

    document.addEventListener('mousedown', handlePointer);
    return () => document.removeEventListener('mousedown', handlePointer);
  }, [open, anchorRef, onDismiss]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={attach}
      className={cn(
        'z-50 flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5 popover-enter',
        className,
      )}
      {...rest}
    >
      {children}
    </div>,
    document.body,
  );
}
