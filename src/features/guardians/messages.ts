export const guardianMessages = {
  list: {
    title: 'Parents & tuteurs',
    description:
      'Répertoire des adultes référents. Un même tuteur peut suivre plusieurs enfants, y compris dans des classes différentes.',
    add: 'Ajouter un tuteur',
    tableTitle: 'Répertoire des tuteurs',
    searchPlaceholder: 'Rechercher par nom, téléphone ou email...',
    emptyTitle: 'Aucun tuteur trouvé',
    emptyFiltered:
      'Aucun tuteur ne correspond à votre recherche ou à vos filtres.',
    emptyInitial:
      'Aucun parent ou tuteur n’est encore enregistré. Créez le premier.',
    stats: {
      total: 'Tuteurs',
      active: 'Actifs',
      multiChild: 'Suivant plusieurs enfants',
      unlinked: 'Sans enfant rattaché',
    },
    columns: {
      guardian: 'Tuteur',
      phone: 'Téléphone',
      email: 'Email',
      children: 'Enfants suivis',
      profession: 'Profession',
      status: 'Statut',
      actions: 'Actions',
    },
    filters: {
      allStatuses: 'Tous les statuts',
      allClasses: 'Toutes les classes',
      linkage: 'Rattachement',
      withChildren: 'Avec enfant rattaché',
      withoutChildren: 'Sans enfant rattaché',
      multiChild: 'Plusieurs enfants',
    },
    children: (count: number) =>
      count === 0 ? 'Aucun enfant' : `${count} enfant${count > 1 ? 's' : ''}`,
    archiveTitle: 'Archiver ce tuteur ?',
    archiveMessage: (name: string) =>
      `${name} n’apparaîtra plus dans les listes de rattachement. Les liens existants avec les élèves sont conservés.`,
  },

  form: {
    createTitle: 'Nouveau parent ou tuteur',
    createDescription:
      'Créez la fiche du référent avant de le rattacher à un ou plusieurs élèves.',
    editTitle: (name: string) => `Modifier ${name}`,
    editDescription:
      'Les modifications sont répercutées sur toutes les fiches élèves rattachées.',
    sections: {
      identity: 'Identité',
      identityHint: 'Nom et coordonnées du référent.',
      admin: 'Informations administratives',
      adminHint:
        'Pièce d’identité présentée à l’inscription et remarques internes.',
    },
    fields: {
      lastName: 'Nom',
      firstName: 'Prénom',
      phone: 'Téléphone principal',
      altPhone: 'Téléphone secondaire',
      altPhoneHint: 'Souvent le numéro du lieu de travail.',
      email: 'Email',
      address: 'Adresse',
      profession: 'Profession',
      idDocument: 'Pièce d’identité',
      idDocumentHint: 'Référence du document présenté lors de l’inscription.',
      notes: 'Remarques internes',
      status: 'Statut',
    },
    actions: {
      cancel: 'Annuler',
      create: 'Enregistrer le tuteur',
      update: 'Enregistrer les modifications',
    },
    toasts: {
      created: (name: string) => `${name} a été ajouté au répertoire.`,
      updated: (name: string) => `La fiche de ${name} a été mise à jour.`,
    },
  },

  detail: {
    back: '← Retour aux parents & tuteurs',
    notFoundTitle: 'Tuteur introuvable',
    notFoundMessage: 'Cette fiche n’existe pas ou a été supprimée.',
    backToList: 'Retour au répertoire',
    contact: 'Coordonnées',
    children: 'Enfants suivis',
    noChild: 'Aucun enfant rattaché',
    noChildMessage:
      'Rattachez cette personne depuis le formulaire de modification d’un élève.',
    goToStudents: 'Voir les élèves',
    unlink: 'Détacher',
    unlinkTitle: 'Détacher cet élève ?',
    unlinkMessage: (student: string, guardian: string) =>
      `${guardian} ne sera plus référent de ${student}. La fiche de l’élève reste intacte.`,
    unlinked: 'Le rattachement a été supprimé.',
    primary: 'Contact principal',
    canPickUp: 'Autorisé à récupérer',
    archiveTitle: 'Archiver ce tuteur ?',
    restoreTitle: 'Réactiver ce tuteur ?',
    restoreMessage: (name: string) =>
      `${name} redeviendra disponible pour les rattachements.`,
    archived: (name: string) => `${name} a été archivé.`,
    restored: (name: string) => `${name} a été réactivé.`,
  },
} as const;
