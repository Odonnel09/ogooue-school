import type { Attachment, BadgeTone } from './common';

/**
 * MESSAGERIE INTERNE.
 *
 * `GEMINI.md` place les conversations et les messages parmi les données
 * strictement cloisonnées par établissement (l. 353) et subordonne l'usage de
 * la messagerie aux « règles de l'établissement » (l. 115). Ces règles ne sont
 * donc pas écrites ici : elles vivent dans la configuration du tenant et sont
 * appliquées par `lib/messaging/policy.ts`.
 *
 * REMPLACEMENT SUPABASE : tables `conversations`, `conversation_participants`
 * et `messages`, avec Supabase Realtime pour la diffusion instantanée (l. 303).
 * Le `tenant_id` viendra de la session serveur, jamais du navigateur.
 */

/**
 * Nature d'un correspondant.
 * C'est cette nature — et non le rôle RBAC — qui détermine qui peut écrire à
 * qui : un parent reste un parent quel que soit le rôle technique attaché.
 */
export type ParticipantKind =
  | 'administration'
  | 'enseignant'
  | 'parent'
  | 'eleve';

export const PARTICIPANT_KIND_TONES: Record<ParticipantKind, BadgeTone> = {
  administration: 'brand',
  enseignant: 'blue',
  parent: 'orange',
  eleve: 'green',
};

export interface Participant {
  id: string;
  name: string;
  kind: ParticipantKind;
  /** Fonction affichée sous le nom (« Professeur de mathématiques »). */
  title: string;
}

export type ConversationKind = 'direct' | 'groupe' | 'diffusion';

export const CONVERSATION_KIND_TONES: Record<ConversationKind, BadgeTone> = {
  direct: 'slate',
  groupe: 'blue',
  diffusion: 'brand',
};

export type ConversationStatus = 'active' | 'archivee';

export interface Message {
  id: string;
  conversationId: string;
  authorId: string;
  body: string;
  /** Horodatage ISO complet : l'heure structure la lecture d'un fil. */
  sentAt: string;
  attachments: Attachment[];
  /**
   * Participants ayant lu le message. Le non-lu se déduit de cette liste
   * plutôt que d'un compteur stocké, qui se désynchroniserait.
   */
  readBy: string[];
}

export interface Conversation {
  id: string;
  subject: string;
  kind: ConversationKind;
  participantIds: string[];
  /**
   * Élève concerné, s'il y en a un. Un échange avec une famille porte presque
   * toujours sur un enfant précis ; le rappeler évite les quiproquos.
   */
  relatedStudentId: string;
  status: ConversationStatus;
  createdAt: string;
  lastMessageAt: string;
  /** Épinglé en tête de liste par l'utilisateur courant. */
  pinned: boolean;
}

export type ConversationDraft = Omit<Conversation, 'id'>;

/** Vrai si le message n'a pas encore été lu par le participant donné. */
export function isUnreadFor(message: Message, participantId: string): boolean {
  return (
    message.authorId !== participantId && !message.readBy.includes(participantId)
  );
}
