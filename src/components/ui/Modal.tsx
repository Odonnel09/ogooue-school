'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ui } from '@/i18n/fr';
import { cn } from '@/lib/utils';
import { Button } from './Button';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Boîte de dialogue centrée, en feuille glissante sur mobile.
 *
 * Accessibilité : le focus entre dans la boîte à l'ouverture, y reste piégé
 * tant qu'elle est ouverte, et retourne à l'élément déclencheur à la fermeture.
 * Sans cela, un utilisateur au clavier continue de tabuler dans la page
 * derrière la modale sans s'en apercevoir.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  size = 'md',
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    restoreFocusTo.current = document.activeElement as HTMLElement | null;

    const focusable = () => {
      const node = dialogRef.current;
      if (!node) return [] as HTMLElement[];
      return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      );
    };

    // Le focus entre dans la boîte, sur son premier élément actionnable.
    const first = focusable()[0] ?? dialogRef.current;
    first?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusable();
      if (items.length === 0) return;

      const firstItem = items[0];
      const lastItem = items[items.length - 1];

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
      restoreFocusTo.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const width =
    size === 'sm'
      ? 'sm:max-w-md'
      : size === 'lg'
        ? 'sm:max-w-3xl'
        : 'sm:max-w-xl';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'relative w-full max-h-[92vh] overflow-y-auto hide-scrollbar bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-100 outline-none',
          width,
        )}
      >
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 pb-0">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-bold text-slate-900">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-sm text-slate-500 mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={ui.close}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg p-1.5 transition-colors shrink-0 outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 sm:p-6">{children}</div>

        {footer && (
          <div className="p-5 sm:p-6 pt-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Confirmation obligatoire avant une action destructive ou irréversible. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = ui.confirm,
  cancelLabel = ui.cancel,
  destructive = true,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            destructive
              ? 'bg-red-50 text-red-500'
              : 'bg-brand-50 text-brand-600',
          )}
        >
          <AlertTriangle size={20} aria-hidden="true" />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}
