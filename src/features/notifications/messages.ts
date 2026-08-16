/** Libellés du centre de notifications. */
export const notificationMessages = {
  title: 'Notifications',
  description: 'Situations en cours qui appellent une action.',

  empty: 'Rien à signaler',
  emptyMessage:
    'Aucune facture en retard, aucun dossier incomplet, aucune note en attente de validation.',

  markAllRead: 'Tout marquer comme lu',
  seeAll: 'Voir la messagerie',
  unread: (count: number) => `${count} non lue${count > 1 ? 's' : ''}`,

  groups: {
    today: 'Aujourd’hui',
    week: 'Cette semaine',
    earlier: 'Plus tôt',
  },

  kinds: {
    message: 'Message',
    impaye: 'Impayé',
    dossier_incomplet: 'Dossier incomplet',
    notes_a_valider: 'Notes à valider',
    echeance: 'Échéance',
    absence: 'Absence',
  },

  derivedNotice:
    'Ces alertes sont calculées à partir de l’état réel de l’établissement : elles disparaissent d’elles-mêmes une fois la situation réglée.',
} as const;
