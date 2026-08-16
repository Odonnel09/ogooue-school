import type { Participant, ParticipantKind } from '@/types';

/**
 * RÈGLES D'ÉCHANGE DE L'ÉTABLISSEMENT.
 *
 * `GEMINI.md` subordonne l'usage de la messagerie aux « règles de
 * l'établissement » (l. 115) et impose de les rendre configurables
 * (« Les paramètres de messagerie », l. 229). Elles ne sont donc écrites
 * nulle part en dur : ce module ne fait que **lire** la configuration et
 * répondre à une seule question — untel peut-il écrire à untel ?
 *
 * Trois consommateurs seulement : la composition d'une conversation, la barre
 * de réponse d'un fil, et l'écran Paramètres → Messagerie qui édite ces
 * règles. Aucun autre composant n'a de raison d'y toucher.
 *
 * ⚠️ Ce filtrage est **d'interface**. La règle devra être rejouée côté serveur
 * dans la Server Action d'envoi et dans les politiques RLS : un navigateur ne
 * décide pas de qui parle à qui.
 */
export interface MessagingRules {
  /**
   * Pour chaque nature de correspondant, les natures qu'il peut contacter.
   * Une matrice explicite se relit plus vite qu'une suite de conditions.
   */
  allowed: Record<ParticipantKind, ParticipantKind[]>;
  /**
   * Les familles peuvent-elles ouvrir une conversation, ou seulement répondre
   * à celles ouvertes par l'établissement ?
   */
  guardiansMayInitiate: boolean;
  /** La diffusion à plusieurs destinataires est réservée à l'administration. */
  broadcastRestrictedToAdmin: boolean;
  /** Les pièces jointes sont-elles autorisées dans les échanges ? */
  attachmentsAllowed: boolean;
}

/**
 * Règles livrées par défaut : prudentes, conformes à l'usage gabonais.
 * Les familles parlent à l'école, pas entre elles ; les élèves ne peuvent pas
 * écrire directement aux parents des autres.
 */
export const DEFAULT_MESSAGING_RULES: MessagingRules = {
  allowed: {
    administration: ['administration', 'enseignant', 'parent', 'eleve'],
    enseignant: ['administration', 'enseignant', 'parent', 'eleve'],
    parent: ['administration', 'enseignant'],
    eleve: ['administration', 'enseignant'],
  },
  guardiansMayInitiate: true,
  broadcastRestrictedToAdmin: true,
  attachmentsAllowed: true,
};

/** Untel peut-il écrire à untel ? Unique porte d'entrée de la règle. */
export function canWriteTo(
  rules: MessagingRules,
  from: ParticipantKind,
  to: ParticipantKind,
): boolean {
  return rules.allowed[from].includes(to);
}

/** Correspondants joignables par l'utilisateur courant, une fois la règle appliquée. */
export function reachableParticipants(
  rules: MessagingRules,
  participants: Participant[],
  from: Participant,
): Participant[] {
  return participants.filter(
    (participant) =>
      participant.id !== from.id &&
      canWriteTo(rules, from.kind, participant.kind),
  );
}

/** L'utilisateur courant peut-il ouvrir une conversation de ce type ? */
export function canStartConversation(
  rules: MessagingRules,
  from: ParticipantKind,
  kind: 'direct' | 'groupe' | 'diffusion',
): boolean {
  if (from === 'parent' && !rules.guardiansMayInitiate) return false;
  if (kind === 'diffusion' && rules.broadcastRestrictedToAdmin) {
    return from === 'administration';
  }
  return true;
}
