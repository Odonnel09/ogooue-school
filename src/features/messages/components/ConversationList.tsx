'use client';

import { Pin } from 'lucide-react';
import type { Conversation, Message, Participant, Student } from '@/types';
import { CONVERSATION_KIND_TONES } from '@/types';
import { CURRENT_USER } from '@/data/academic';
import { conversationKindLabels } from '@/i18n/fr';
import { cn } from '@/lib/utils';
import { Avatar, Badge } from '@/components/ui';
import {
  counterpartLabel,
  lastMessageOf,
  relatedStudentLabel,
  unreadCount,
} from '../queries';
import { messagingMessages as m } from '../messages';

const TIME = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
});

const DAY = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
});

/** Heure pour aujourd'hui, date sinon : la précision utile change avec l'âge. */
function stamp(iso: string, todayIsoDate: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return iso.slice(0, 10) === todayIsoDate ? TIME.format(date) : DAY.format(date);
}

export function ConversationList({
  conversations,
  messages,
  participants,
  students,
  selectedId,
  today,
  onSelect,
}: {
  conversations: Conversation[];
  messages: Message[];
  participants: Participant[];
  students: Student[];
  selectedId: string;
  today: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="divide-y divide-slate-100">
      {conversations.map((conversation) => {
        const unread = unreadCount(messages, conversation.id, CURRENT_USER.id);
        const last = lastMessageOf(messages, conversation.id);
        const label = counterpartLabel(
          participants,
          conversation,
          CURRENT_USER.id,
        );
        const student = relatedStudentLabel(students, conversation);
        const active = conversation.id === selectedId;

        return (
          <li key={conversation.id}>
            <button
              type="button"
              onClick={() => onSelect(conversation.id)}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'w-full text-left p-3 sm:p-4 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-400',
                active ? 'bg-brand-50/70' : 'hover:bg-slate-50',
              )}
            >
              <div className="flex items-start gap-3">
                <Avatar name={label} size="md" className="shrink-0" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-sm truncate',
                        unread > 0
                          ? 'font-semibold text-slate-900'
                          : 'font-medium text-slate-700',
                      )}
                    >
                      {label}
                    </span>
                    {conversation.pinned && (
                      <Pin
                        size={12}
                        aria-label={m.list.pinned}
                        className="text-brand-500 shrink-0"
                      />
                    )}
                    <span className="ml-auto text-[11px] text-slate-400 shrink-0">
                      {stamp(conversation.lastMessageAt, today)}
                    </span>
                  </div>

                  <p
                    className={cn(
                      'text-xs truncate mt-0.5',
                      unread > 0 ? 'text-slate-700' : 'text-slate-500',
                    )}
                  >
                    {conversation.subject}
                  </p>

                  {last && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {last.body}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <Badge tone={CONVERSATION_KIND_TONES[conversation.kind]}>
                      {conversationKindLabels[conversation.kind]}
                    </Badge>
                    {student && (
                      <Badge tone="slate">{m.list.about(student)}</Badge>
                    )}
                    {conversation.status === 'archivee' && (
                      <Badge tone="slate">{m.list.archived}</Badge>
                    )}
                    {unread > 0 && (
                      <Badge tone="brand" className="ml-auto">
                        {unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
