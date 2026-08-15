export const announcementMessages = {
  list: {
    title: 'Annonces',
    description:
      'Diffusez les informations de l’établissement aux parents, élèves et enseignants.',
    add: 'Créer une annonce',
    listTitle: 'Toutes les annonces',
    searchPlaceholder: 'Rechercher une annonce...',
    emptyTitle: 'Aucune annonce',
    emptyFiltered:
      'Aucune annonce ne correspond à votre recherche ou à vos filtres.',
    emptyInitial:
      'Aucune annonce n’a encore été publiée. Créez la première.',
    stats: {
      total: 'Annonces',
      published: 'Publiées',
      drafts: 'Brouillons',
    },
    filters: {
      allStatuses: 'Tous les statuts',
      allAudiences: 'Toutes les audiences',
    },
    actions: {
      preview: 'Prévisualiser',
      edit: 'Modifier',
      pin: 'Épingler',
      unpin: 'Ne plus épingler',
      publish: 'Publier',
      archive: 'Archiver',
      delete: 'Supprimer',
    },
    publishedOn: (date: string) => `Publiée le ${date}`,
    expiresOn: (date: string) => `Expire le ${date}`,
    author: (name: string) => `Par ${name}`,
    writtenBy: (name: string) => `Rédigée par ${name}`,
    targetClass: (name: string) => `Classe ${name}`,
    deleteTitle: 'Supprimer cette annonce ?',
    deleteMessage: (title: string) =>
      `L’annonce « ${title} » sera définitivement supprimée.`,
    toasts: {
      published: (title: string) => `« ${title} » a été publiée.`,
      archived: (title: string) => `« ${title} » a été archivée.`,
      pinned: 'L’annonce a été épinglée en haut de la liste.',
      unpinned: 'L’annonce n’est plus épinglée.',
      deleted: 'L’annonce a été supprimée.',
    },
  },

  form: {
    createTitle: 'Nouvelle annonce',
    editTitle: 'Modifier l’annonce',
    description: 'Les annonces sont diffusées aux audiences sélectionnées.',
    fields: {
      title: 'Titre',
      titlePlaceholder: 'Réunion des parents d’élèves',
      content: 'Contenu',
      contentPlaceholder: 'Rédigez le message diffusé aux destinataires...',
      author: 'Auteur',
      audience: 'Audience',
      targetClass: 'Classe concernée',
      targetLevel: 'Niveau concerné',
      targetLevelHint: 'Laissez vide pour tous les niveaux.',
      publishedAt: 'Date de publication',
      expiresAt: 'Date d’expiration',
      status: 'Statut',
    },
    notice:
      'À cette étape, aucune notification n’est réellement envoyée : l’annonce est uniquement enregistrée dans les données locales.',
    actions: {
      cancel: 'Annuler',
      create: 'Créer l’annonce',
      update: 'Enregistrer',
      close: 'Fermer',
    },
    toasts: {
      created: 'L’annonce a été enregistrée.',
      createdPublished: 'L’annonce a été publiée.',
      updated: 'L’annonce a été mise à jour.',
    },
  },
} as const;
