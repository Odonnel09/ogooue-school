'use client';

import { useState } from 'react';
import {
  Archive,
  ArchiveRestore,
  Info,
  Paperclip,
  Pin,
  PinOff,
  Send,
} from 'lucide-react';
import type { Conversation, Message, Participant, Student } from '@/types';
import { PARTICIPANT_KIND_TONES } from '@/types';
import { CURRENT_USER } from '@/data/academic';
import { participantKindLabels } from '@/i18n/fr';
import { cn, formatLongDate } from '@/lib/utils';
import { Avatar, Badge, Button, Textarea } from '@/components/ui';
import { participantById, relatedStudentLabel } from '../queries';
import { messagingMessages as m } from '../messages';

const TIME = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
});

/** Sépare le fil par journée : un fil sans repère de date est illisible. */
function dayLabel(iso: string, today: string): string {
  const day = iso.slice(0, 10);
  if (day === today) return m.thread.today;
  return formatLongDate(day);
}

export function MessageThread({
  conversation,
  thread,
  participants,
  students,
  today,
  attachmentsAllowed,
  onSend,
  onTogglePin,
  onToggleArchive,
}: {
  conversation: Conversation;
  thread: Message[];
  participants: Participant[];
  students: Student[];
  today: string;
  attachmentsAllowed: boolean;
  onSend: (body: string) => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
}) {
  const [draft, setDraft] = useState('');
  const archived = conversation.status === 'archivee';
  const student = relatedStudentLabel(students, conversation);

  function submit() {
    const body = draft.trim();
    if (!body) return;
    onSend(body);
    setDraft('');
  }

  /**
   * Séparateurs de journée calculés en amont : comparer au message précédent
   * est une dérivation pure, là où un accumulateur muterait pendant le rendu.
   */
  const rows = thread.map((message, index) => {
    const day = dayLabel(message.sentAt, today);
    const previousDay =
      index > 0 ? dayLabel(thread[index - 1].sentAt, today) : '';
    return { message, day, showDay: day !== previousDay };
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* En-tête du fil */}
      <header className="p-4 sm:p-5 border-b border-slate-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900">
              {conversation.subject}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {m.thread.participants(conversation.participantIds.length)}
              {student ? ` · ${m.list.about(student)}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button variant="outline" size="sm" onClick={onTogglePin}>
              {conversation.pinned ? (
                <>
                  <PinOff size={15} aria-hidden="true" /> {m.thread.unpin}
                </>
              ) : (
                <>
                  <Pin size={15} aria-hidden="true" /> {m.thread.pin}
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={onToggleArchive}>
              {archived ? (
                <>
                  <ArchiveRestore size={15} aria-hidden="true" />{' '}
                  {m.thread.unarchive}
                </>
              ) : (
                <>
                  <Archive size={15} aria-hidden="true" /> {m.thread.archive}
                </>
              )}
            </Button>
          </div>
        </div>

        <ul className="flex flex-wrap gap-1.5 mt-3">
          {conversation.participantIds.map((id) => {
            const participant = participantById(participants, id);
            if (!participant) return null;
            return (
              <li key={id}>
                <Badge tone={PARTICIPANT_KIND_TONES[participant.kind]}>
                  {id === CURRENT_USER.id ? m.thread.you : participant.name} ·{' '}
                  {participantKindLabels[participant.kind]}
                </Badge>
              </li>
            );
          })}
        </ul>
      </header>

      {/* Fil */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/40">
        {rows.map(({ message, day, showDay }) => {
          const author = participantById(participants, message.authorId);
          const mine = message.authorId === CURRENT_USER.id;

          return (
            <div key={message.id}>
              {showDay && (
                <div className="flex items-center gap-3 my-4 first:mt-0">
                  <span className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                    {day}
                  </span>
                  <span className="flex-1 h-px bg-slate-200" />
                </div>
              )}

              <article
                className={cn(
                  'flex gap-3 max-w-2xl',
                  mine && 'ml-auto flex-row-reverse',
                )}
              >
                <Avatar
                  name={author?.name ?? '?'}
                  size="sm"
                  className="shrink-0 mt-1"
                />

                <div className="min-w-0">
                  <div
                    className={cn(
                      'flex items-baseline gap-2',
                      mine && 'flex-row-reverse',
                    )}
                  >
                    <span className="text-xs font-medium text-slate-700">
                      {mine ? m.thread.you : (author?.name ?? '—')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {TIME.format(new Date(message.sentAt))}
                    </span>
                  </div>

                  <div
                    className={cn(
                      'mt-1 px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line',
                      mine
                        ? 'bg-brand-600 text-white rounded-tr-sm'
                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm',
                    )}
                  >
                    {message.body}
                  </div>

                  {message.attachments.length > 0 && (
                    <ul
                      className={cn(
                        'mt-2 flex flex-wrap gap-2',
                        mine && 'justify-end',
                      )}
                    >
                      {message.attachments.map((attachment) => (
                        <li key={attachment.id}>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-100 text-xs text-slate-600">
                            <Paperclip
                              size={13}
                              aria-hidden="true"
                              className="text-slate-400"
                            />
                            {attachment.name}
                            <span className="text-slate-400">
                              {attachment.size}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            </div>
          );
        })}
      </div>

      {/* Zone de réponse */}
      <footer className="p-3 sm:p-4 border-t border-slate-100">
        {archived ? (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Info
              size={15}
              aria-hidden="true"
              className="text-slate-400 mt-0.5 shrink-0"
            />
            <p className="text-xs text-slate-600 leading-relaxed">
              {m.thread.archivedNotice}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              rows={3}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={m.thread.replyPlaceholder}
              aria-label={m.thread.reply}
              onKeyDown={(event) => {
                // Ctrl/⌘ + Entrée envoie : Entrée seule reste un saut de ligne.
                if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                  event.preventDefault();
                  submit();
                }
              }}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-slate-400">
                {attachmentsAllowed
                  ? 'Ctrl + Entrée pour envoyer.'
                  : m.thread.attachmentsDisabled}
              </p>
              <Button onClick={submit} disabled={!draft.trim()}>
                <Send size={16} aria-hidden="true" /> {m.thread.send}
              </Button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
