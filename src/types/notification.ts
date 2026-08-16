import type { BadgeTone } from './common';

/**
 * NOTIFICATIONS.
 *
 * Parti pris : une notification n'est **pas** une donnée saisie, c'est une
 * lecture de l'état réel de l'établissement. Une facture en retard, un dossier
 * incomplet ou des notes en attente de validation produisent la notification
 * correspondante tant que la situation dure, et elle disparaît d'elle-même
 * quand la situation est réglée.
 *
 * Conséquence : seul l'état « lu » est stocké. L'identifiant est donc dérivé
 * de la ressource d'origine pour rester stable d'un rendu à l'autre.
 *
 * REMPLACEMENT SUPABASE : table `notifications` alimentée par des déclencheurs
 * serveur, plus Supabase Realtime pour la remontée instantanée. La dérivation
 * côté client restera le repli hors ligne.
 */
export type NotificationKind =
  | 'message'
  | 'impaye'
  | 'dossier_incomplet'
  | 'notes_a_valider'
  | 'echeance'
  | 'absence';

export const NOTIFICATION_TONES: Record<NotificationKind, BadgeTone> = {
  message: 'brand',
  impaye: 'red',
  dossier_incomplet: 'orange',
  notes_a_valider: 'blue',
  echeance: 'yellow',
  absence: 'orange',
};

export interface AppNotification {
  /** Dérivé de la ressource (« notif-invoice-inv-004 ») : stable par nature. */
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** Horodatage de l'événement qui la motive, pas de son affichage. */
  at: string;
  /** Chemin relatif au tenant, préfixé à l'affichage. */
  href: string;
  read: boolean;
}
