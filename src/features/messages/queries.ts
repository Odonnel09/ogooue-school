import type {
  Conversation,
  Message,
  Participant,
  Student,
} from '@/types';
import { isUnreadFor } from '@/types';
import { studentName } from '@/lib/selectors';

/**
 * Sélecteurs dérivés de la messagerie.
 * Fonctions pures : aucune ne lit le store, toutes reçoivent leurs données.
 */

export function participantById(
  participants: Participant[],
  id: string,
): Participant | undefined {
  return participants.find((item) => item.id === id);
}

export function participantName(
  participants: Participant[],
  id: string,
): string {
  return participantById(participants, id)?.name ?? 'Participant inconnu';
}

/**
 * Fils auxquels le participant appartient.
 *
 * Filtre de confidentialité, pas de confort : `GEMINI.md` interdit qu'un
 * utilisateur voie les données d'un autre. Tout écran de messagerie part de
 * cette liste, jamais de la collection brute.
 *
 * ⚠️ Côté serveur, ce cloisonnement sera porté par une politique RLS sur
 * `conversation_participants` : le filtrage client ne protège rien.
 */
export function conversationsOf(
  conversations: Conversation[],
  participantId: string,
): Conversation[] {
  return conversations.filter((conversation) =>
    conversation.participantIds.includes(participantId),
  );
}

/** Messages d'un fil, du plus ancien au plus récent — l'ordre de lecture. */
export function messagesOf(
  messages: Message[],
  conversationId: string,
): Message[] {
  return messages
    .filter((message) => message.conversationId === conversationId)
    .sort((a, b) => a.sentAt.localeCompare(b.sentAt));
}

export function lastMessageOf(
  messages: Message[],
  conversationId: string,
): Message | undefined {
  const thread = messagesOf(messages, conversationId);
  return thread[thread.length - 1];
}

export function unreadCount(
  messages: Message[],
  conversationId: string,
  participantId: string,
): number {
  return messages.filter(
    (message) =>
      message.conversationId === conversationId &&
      isUnreadFor(message, participantId),
  ).length;
}

/** Nombre de fils comportant au moins un message non lu. */
export function unreadConversations(
  conversations: Conversation[],
  messages: Message[],
  participantId: string,
): Conversation[] {
  return conversationsOf(conversations, participantId).filter(
    (conversation) =>
      conversation.status === 'active' &&
      unreadCount(messages, conversation.id, participantId) > 0,
  );
}

/**
 * Correspondants d'un fil, l'utilisateur courant exclu : c'est ce qu'on
 * affiche en tête de liste, personne n'a besoin de lire son propre nom.
 */
export function counterparts(
  participants: Participant[],
  conversation: Conversation,
  selfId: string,
): Participant[] {
  return conversation.participantIds
    .filter((id) => id !== selfId)
    .map((id) => participantById(participants, id))
    .filter((item): item is Participant => Boolean(item));
}

export function counterpartLabel(
  participants: Participant[],
  conversation: Conversation,
  selfId: string,
): string {
  const others = counterparts(participants, conversation, selfId);
  if (others.length === 0) return 'Vous';
  if (others.length <= 2) return others.map((item) => item.name).join(', ');
  return `${others[0].name} et ${others.length - 1} autres`;
}

/** Élève concerné par le fil, quand il y en a un. */
export function relatedStudentLabel(
  students: Student[],
  conversation: Conversation,
): string {
  if (!conversation.relatedStudentId) return '';
  const student = students.find(
    (item) => item.id === conversation.relatedStudentId,
  );
  return student ? studentName(student) : '';
}

/**
 * Tri d'affichage : les fils épinglés d'abord, puis les plus récents.
 * Le non-lu ne remonte pas un fil — sinon la liste bougerait sous le curseur
 * à chaque message reçu.
 */
export function sortConversations(
  conversations: Conversation[],
): Conversation[] {
  return conversations
    .slice()
    .sort((a, b) =>
      a.pinned === b.pinned
        ? b.lastMessageAt.localeCompare(a.lastMessageAt)
        : Number(b.pinned) - Number(a.pinned),
    );
}
