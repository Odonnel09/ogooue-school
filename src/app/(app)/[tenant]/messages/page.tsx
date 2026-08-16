'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Info, MessageSquare, Plus, Users } from 'lucide-react';
import type { Conversation, Message } from '@/types';
import { CURRENT_USER } from '@/data/academic';
import { conversationKindLabels, ui } from '@/i18n/fr';
import { canStartConversation } from '@/lib/messaging/policy';
import { useSchoolData } from '@/lib/store/school-data';
import { useSimulatedLoading } from '@/lib/hooks';
import { labelOptions } from '@/lib/status';
import { cn, createId, matches, todayIso } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FilterBar,
  FilterSelect,
  PageContainer,
  PageHeader,
  StatCard,
  TableSkeleton,
  useToast,
} from '@/components/ui';
import { ConversationList } from '@/features/messages/components/ConversationList';
import { MessageThread } from '@/features/messages/components/MessageThread';
import {
  NewConversationModal,
  type NewConversationValues,
} from '@/features/messages/components/NewConversationModal';
import {
  conversationsOf,
  counterpartLabel,
  messagesOf,
  sortConversations,
  unreadConversations,
} from '@/features/messages/queries';
import { messagingMessages as m } from '@/features/messages/messages';

export default function MessagesPage() {
  const toast = useToast();
  const ready = useSimulatedLoading();
  const searchParams = useSearchParams();
  const {
    config,
    students,
    participants,
    conversations,
    messages,
    actions,
  } = useSchoolData();

  const today = todayIso();
  const self = participants.find((item) => item.id === CURRENT_USER.id);

  const [selectedId, setSelectedId] = useState(
    () => searchParams.get('fil') ?? '',
  );
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);

  /** Cloisonnement d'abord : on ne travaille que sur ses propres fils. */
  const mine = useMemo(
    () => conversationsOf(conversations, CURRENT_USER.id),
    [conversations],
  );

  const visible = useMemo(() => {
    const filtered = mine.filter((conversation) => {
      const haystack = `${conversation.subject} ${counterpartLabel(
        participants,
        conversation,
        CURRENT_USER.id,
      )}`;
      if (!matches(haystack, search)) return false;
      if (kindFilter && conversation.kind !== kindFilter) return false;
      if (statusFilter && conversation.status !== statusFilter) return false;
      // Sans filtre de statut, les archives restent hors de la liste courante.
      if (!statusFilter && conversation.status === 'archivee') return false;
      return true;
    });
    return sortConversations(filtered);
  }, [mine, participants, search, kindFilter, statusFilter]);

  // Un fil ouvert par lien direct doit lui aussi passer le cloisonnement.
  const selected = mine.find((item) => item.id === selectedId) ?? null;
  const thread = selected ? messagesOf(messages, selected.id) : [];

  /**
   * Ouvrir un fil vaut lecture. L'effet est le bon endroit : c'est une
   * synchronisation avec l'extérieur, pas un calcul de rendu.
   */
  useEffect(() => {
    if (!selectedId) return;
    actions.markConversationRead(selectedId, CURRENT_USER.id);
  }, [selectedId, actions]);

  const stats = useMemo(
    () => ({
      active: mine.filter((item) => item.status === 'active').length,
      unread: unreadConversations(conversations, messages, CURRENT_USER.id)
        .length,
      participants: participants.length,
      archived: mine.filter((item) => item.status === 'archivee').length,
    }),
    [mine, conversations, messages, participants],
  );

  const activeFilters = (kindFilter ? 1 : 0) + (statusFilter ? 1 : 0);

  function resetFilters() {
    setKindFilter('');
    setStatusFilter('');
  }

  function send(body: string) {
    if (!selected) return;
    const message: Message = {
      id: createId('msg'),
      conversationId: selected.id,
      authorId: CURRENT_USER.id,
      body,
      sentAt: new Date().toISOString(),
      attachments: [],
      readBy: [CURRENT_USER.id],
    };
    actions.sendMessage(message);
    toast.success(m.toasts.sent);
  }

  function togglePin() {
    if (!selected) return;
    actions.conversations.update(selected.id, { pinned: !selected.pinned });
    toast.success(selected.pinned ? m.toasts.unpinned : m.toasts.pinned);
  }

  function toggleArchive() {
    if (!selected) return;
    const archived = selected.status === 'archivee';
    actions.conversations.update(selected.id, {
      status: archived ? 'active' : 'archivee',
    });
    toast.success(archived ? m.toasts.unarchived : m.toasts.archived);
  }

  function create(values: NewConversationValues) {
    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: createId('cnv'),
      subject: values.subject,
      kind: 'direct',
      participantIds: [CURRENT_USER.id, values.recipientId],
      relatedStudentId: values.studentId,
      status: 'active',
      createdAt: now,
      lastMessageAt: now,
      pinned: false,
    };

    actions.conversations.create(conversation);
    actions.sendMessage({
      id: createId('msg'),
      conversationId: conversation.id,
      authorId: CURRENT_USER.id,
      body: values.body,
      sentAt: now,
      attachments: [],
      readBy: [CURRENT_USER.id],
    });

    setSelectedId(conversation.id);
    setComposeOpen(false);
    toast.success(m.toasts.created(conversation.subject));
  }

  const mayCompose = self
    ? canStartConversation(config.messaging, self.kind, 'direct')
    : false;

  return (
    <PageContainer>
      <PageHeader
        title={m.title}
        description={m.description}
        actions={
          mayCompose ? (
            <Button onClick={() => setComposeOpen(true)}>
              <Plus size={16} aria-hidden="true" /> {m.compose}
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label={m.stats.active}
          value={stats.active}
          icon={<MessageSquare size={22} aria-hidden="true" />}
          tone="brand"
        />
        <StatCard
          label={m.stats.unread}
          value={stats.unread}
          icon={<MessageSquare size={22} aria-hidden="true" />}
          tone="orange"
        />
        <StatCard
          label={m.stats.participants}
          value={stats.participants}
          icon={<Users size={22} aria-hidden="true" />}
          tone="blue"
        />
        <StatCard
          label={m.stats.archived}
          value={stats.archived}
          icon={<MessageSquare size={22} aria-hidden="true" />}
          tone="green"
        />
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={m.searchPlaceholder}
        activeCount={activeFilters}
        onReset={resetFilters}
      >
        <FilterSelect
          value={kindFilter}
          onChange={setKindFilter}
          options={labelOptions(conversationKindLabels)}
          placeholder={m.filters.allKinds}
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'active', label: 'Fils actifs' },
            { value: 'archivee', label: 'Fils archivés' },
          ]}
          placeholder={m.filters.allStatuses}
        />
      </FilterBar>

      {/*
        Deux volets sur grand écran. Sur mobile, un seul est monté à la fois :
        superposer une liste et un fil sur 375 px ne rend service à personne.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-[22rem_1fr] gap-4 sm:gap-6 items-start">
        <Card className={cn('overflow-hidden', selected && 'hidden lg:block')}>
          <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              {m.list.title}
            </h2>
            <Badge tone="brand">{ui.results(visible.length)}</Badge>
          </div>

          {!ready ? (
            <div className="p-4">
              <TableSkeleton />
            </div>
          ) : visible.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title={m.list.emptyTitle}
                message={
                  mine.length === 0 ? m.list.emptyInitial : m.list.emptyFiltered
                }
                icon={<MessageSquare size={24} aria-hidden="true" />}
                action={
                  activeFilters > 0 || search ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearch('');
                        resetFilters();
                      }}
                    >
                      {ui.resetFilters}
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="max-h-[32rem] overflow-y-auto">
              <ConversationList
                conversations={visible}
                messages={messages}
                participants={participants}
                students={students}
                selectedId={selectedId}
                today={today}
                onSelect={setSelectedId}
              />
            </div>
          )}
        </Card>

        <Card className={cn('overflow-hidden', !selected && 'hidden lg:block')}>
          {selected ? (
            <>
              <button
                type="button"
                onClick={() => setSelectedId('')}
                className="lg:hidden w-full text-left px-4 py-3 text-xs font-medium text-brand-600 border-b border-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-400"
              >
                {m.thread.back}
              </button>
              <div className="h-[36rem]">
                <MessageThread
                  conversation={selected}
                  thread={thread}
                  participants={participants}
                  students={students}
                  today={today}
                  attachmentsAllowed={config.messaging.attachmentsAllowed}
                  onSend={send}
                  onTogglePin={togglePin}
                  onToggleArchive={toggleArchive}
                />
              </div>
            </>
          ) : (
            <div className="p-4">
              <EmptyState
                title={m.thread.placeholderTitle}
                message={m.thread.placeholderMessage}
                icon={<MessageSquare size={24} aria-hidden="true" />}
              />
            </div>
          )}
        </Card>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
        <Info
          size={18}
          aria-hidden="true"
          className="text-slate-400 mt-0.5 shrink-0"
        />
        <p className="text-xs text-slate-600 leading-relaxed">
          {m.realtimeNotice}
        </p>
      </div>

      <NewConversationModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSubmit={create}
        participants={participants}
        students={students}
        rules={config.messaging}
      />
    </PageContainer>
  );
}

