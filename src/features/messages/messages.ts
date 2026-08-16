/** Libellés du module Messagerie. Aucune chaîne en dur dans les composants. */
export const messagingMessages = {
  title: 'Messagerie',
  description:
    'Échanges entre l’administration, les enseignants et les familles.',

  compose: 'Nouvelle conversation',
  searchPlaceholder: 'Rechercher un correspondant, un sujet…',

  filters: {
    allKinds: 'Tous les types',
    allStatuses: 'Tous les fils',
    unreadOnly: 'Non lus seulement',
  },

  stats: {
    active: 'Fils actifs',
    unread: 'Non lus',
    participants: 'Correspondants',
    archived: 'Archivés',
  },

  list: {
    title: 'Conversations',
    emptyTitle: 'Aucune conversation',
    emptyInitial:
      'Aucun échange n’a encore eu lieu. Ouvrez une conversation pour écrire à un enseignant ou à une famille.',
    emptyFiltered:
      'Aucune conversation ne correspond à cette recherche ou à ces filtres.',
    pinned: 'Épinglé',
    archived: 'Archivé',
    about: (name: string) => `À propos de ${name}`,
  },

  thread: {
    placeholderTitle: 'Sélectionnez une conversation',
    placeholderMessage:
      'Choisissez un fil dans la liste pour en afficher le contenu.',
    back: '← Conversations',
    participants: (count: number) =>
      `${count} participant${count > 1 ? 's' : ''}`,
    reply: 'Écrire un message',
    replyPlaceholder: 'Rédigez votre message…',
    send: 'Envoyer',
    attach: 'Joindre un fichier',
    attachmentsDisabled:
      'Les pièces jointes sont désactivées dans les paramètres de messagerie.',
    archivedNotice:
      'Cette conversation est archivée. Réactivez-la pour reprendre l’échange.',
    unarchive: 'Réactiver',
    archive: 'Archiver',
    pin: 'Épingler',
    unpin: 'Ne plus épingler',
    today: 'Aujourd’hui',
    yesterday: 'Hier',
    you: 'Vous',
  },

  form: {
    title: 'Nouvelle conversation',
    description:
      'Le destinataire, le sujet et le premier message sont obligatoires.',
    fields: {
      recipient: 'Destinataire',
      subject: 'Sujet',
      student: 'Élève concerné',
      body: 'Message',
    },
    noStudent: 'Aucun élève en particulier',
    recipientPlaceholder: 'Choisir un correspondant',
    submit: 'Ouvrir la conversation',
    cancel: 'Annuler',
    errors: {
      recipient: 'Choisissez un destinataire.',
      subject: 'Le sujet doit comporter au moins 3 caractères.',
      body: 'Le message doit comporter au moins 5 caractères.',
    },
  },

  toasts: {
    sent: 'Message envoyé.',
    created: (subject: string) => `Conversation « ${subject} » ouverte.`,
    archived: 'Conversation archivée.',
    unarchived: 'Conversation réactivée.',
    pinned: 'Conversation épinglée.',
    unpinned: 'Conversation retirée des épinglés.',
  },

  policyNotice:
    'Les correspondants proposés découlent des règles d’échange définies dans Paramètres → Messagerie. Ce filtrage est d’interface : il sera rejoué côté serveur.',
  realtimeNotice:
    'Les messages sont ici conservés en mémoire. La diffusion instantanée reposera sur Supabase Realtime.',
} as const;
