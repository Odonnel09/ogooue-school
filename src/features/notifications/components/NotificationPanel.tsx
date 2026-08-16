'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  BellOff,
  CheckCheck,
  ClipboardCheck,
  FileText,
  Info,
  MessageSquare,
  Receipt,
} from 'lucide-react';
import type { AppNotification, NotificationKind } from '@/types';
import { NOTIFICATION_TONES } from '@/types';
import { REFERENCE_DATE } from '@/data/academic';
import { ui } from '@/i18n/fr';
import { useHref } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { Badge, PopoverPanel } from '@/components/ui';
import { useNotifications } from '../queries';
import { notificationMessages as m } from '../messages';

/**
 * Centre de notifications de la cloche.
 *
 * Le contenu vient de `useNotifications()`, qui le déduit de l'état réel :
 * ce panneau n'invente rien, il met en forme.
 */

const ICONS: Record<NotificationKind, typeof Bell> = {
  message: MessageSquare,
  impaye: Receipt,
  dossier_incomplet: ClipboardCheck,
  notes_a_valider: FileText,
  echeance: Receipt,
  absence: ClipboardCheck,
};

const TONE_CLASSES: Record<string, string> = {
  brand: 'bg-brand-50 text-brand-600',
  red: 'bg-red-50 text-red-500',
  orange: 'bg-orange-50 text-orange-500',
  blue: 'bg-blue-50 text-blue-500',
  yellow: 'bg-yellow-50 text-yellow-600',
  green: 'bg-green-50 text-green-600',
  slate: 'bg-slate-100 text-slate-500',
};

const DATE_TIME = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** Regroupe par ancienneté : la cloche se lit de haut en bas, du frais au vieux. */
function groupOf(at: string): 'today' | 'week' | 'earlier' {
  const day = at.slice(0, 10);
  if (day === REFERENCE_DATE) return 'today';

  const reference = new Date(`${REFERENCE_DATE}T00:00:00`);
  const moment = new Date(`${day}T00:00:00`);
  const days = (reference.getTime() - moment.getTime()) / 86_400_000;
  return days <= 7 && days >= 0 ? 'week' : 'earlier';
}

export function NotificationBell() {
  const href = useHref();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const { notifications, unread, markRead } = useNotifications();

  const groups = useMemo(() => {
    const buckets: Record<string, AppNotification[]> = {
      today: [],
      week: [],
      earlier: [],
    };
    notifications.forEach((notification) => {
      buckets[groupOf(notification.at)].push(notification);
    });
    return buckets;
  }, [notifications]);

  function markAll() {
    markRead(notifications.map((notification) => notification.id));
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ui.notifications}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className={cn(
          'p-2.5 rounded-full transition-colors relative outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20',
          open
            ? 'bg-brand-50 text-brand-600'
            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50',
        )}
      >
        <Bell size={20} aria-hidden="true" />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <PopoverPanel
        open={open}
        anchorRef={triggerRef}
        onDismiss={() => setOpen(false)}
        matchAnchorWidth={false}
        minWidth={360}
        maxHeight={480}
        role="dialog"
        aria-label={m.title}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900">{m.title}</h2>
            <p className="text-[11px] text-slate-500">
              {unread > 0 ? m.unread(unread) : m.empty}
            </p>
          </div>
          {unread > 0 && (
            <button
              type="button"
              onClick={markAll}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-brand-600 hover:bg-brand-50 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
            >
              <CheckCheck size={13} aria-hidden="true" /> {m.markAllRead}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <BellOff
                size={24}
                aria-hidden="true"
                className="mx-auto text-slate-300 mb-3"
              />
              <p className="text-sm font-medium text-slate-700">{m.empty}</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {m.emptyMessage}
              </p>
            </div>
          ) : (
            (['today', 'week', 'earlier'] as const).map((key) => {
              const bucket = groups[key];
              if (bucket.length === 0) return null;

              return (
                <section key={key}>
                  <h3 className="px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {m.groups[key]}
                  </h3>
                  <ul className="px-1.5 pb-1.5">
                    {bucket.map((notification) => {
                      const Icon = ICONS[notification.kind];
                      const tone = NOTIFICATION_TONES[notification.kind];

                      return (
                        <li key={notification.id}>
                          <Link
                            href={href(notification.href)}
                            onClick={() => {
                              markRead([notification.id]);
                              setOpen(false);
                            }}
                            className={cn(
                              'flex items-start gap-3 p-2.5 rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                              notification.read
                                ? 'hover:bg-slate-50'
                                : 'bg-brand-50/40 hover:bg-brand-50',
                            )}
                          >
                            <span
                              className={cn(
                                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                                TONE_CLASSES[tone] ?? TONE_CLASSES.slate,
                              )}
                            >
                              <Icon size={16} aria-hidden="true" />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'text-sm truncate',
                                    notification.read
                                      ? 'text-slate-700'
                                      : 'text-slate-900 font-medium',
                                  )}
                                >
                                  {notification.title}
                                </span>
                                {!notification.read && (
                                  <span
                                    aria-hidden="true"
                                    className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0"
                                  />
                                )}
                              </span>
                              <span className="block text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                {notification.body}
                              </span>
                              <span className="block text-[11px] text-slate-400 mt-1">
                                {m.kinds[notification.kind]} ·{' '}
                                {DATE_TIME.format(new Date(notification.at))}
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 flex items-start gap-2">
          <Info
            size={13}
            aria-hidden="true"
            className="text-slate-400 mt-0.5 shrink-0"
          />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {m.derivedNotice}
          </p>
        </div>
      </PopoverPanel>
    </>
  );
}

/** Icône de messagerie du bandeau, avec pastille de fils non lus. */
export function MessagesButton({ unread }: { unread: number }) {
  const href = useHref();

  return (
    <Link
      href={href('/messages')}
      aria-label={
        unread > 0 ? `${ui.messages} — ${m.unread(unread)}` : ui.messages
      }
      className="hidden sm:inline-flex p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
    >
      <MessageSquare size={20} aria-hidden="true" />
      {unread > 0 && (
        <Badge
          tone="brand"
          className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 justify-center text-[10px] ring-2 ring-white"
        >
          {unread > 9 ? '9+' : unread}
        </Badge>
      )}
    </Link>
  );
}
