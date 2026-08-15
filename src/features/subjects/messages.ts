export const subjectMessages = {
  list: {
    title: 'Matières',
    description:
      'Catalogue des matières et de leur répartition par cycle et par niveau.',
    add: 'Ajouter une matière',
    tableTitle: 'Catalogue des matières',
    searchPlaceholder: 'Rechercher une matière ou un code...',
    emptyTitle: 'Aucune matière trouvée',
    emptyMessage:
      'Aucune matière ne correspond à votre recherche ou à vos filtres.',
    stats: {
      total: 'Matières',
      active: 'Actives',
      classes: 'Rattachements aux classes',
    },
    columns: {
      code: 'Code',
      name: 'Nom',
      levels: 'Niveaux',
      cycle: 'Cycle',
      teacher: 'Enseignant responsable',
      classes: 'Classes',
      credits: 'ECTS',
      status: 'Statut',
      actions: 'Actions',
    },
    filters: {
      allCycles: 'Tous les cycles',
      allLevels: 'Tous les niveaux',
      allStatuses: 'Tous les statuts',
    },
    archiveTitle: 'Archiver cette matière ?',
    archiveMessage: (name: string) =>
      `La matière ${name} ne sera plus proposée lors de la création d’évaluations ou de créneaux. Les données passées sont conservées.`,
  },

  form: {
    createTitle: 'Nouvelle matière',
    createDescription:
      'Ajoutez une matière au catalogue. Le coefficient se règle ensuite classe par classe.',
    editTitle: (name: string) => `Modifier ${name}`,
    editDescription:
      'Les modifications sont appliquées immédiatement au catalogue.',
    sections: {
      identity: 'Identification',
      identityHint:
        'Code, intitulé et positionnement de la matière dans le cursus.',
      pedagogy: 'Contenu pédagogique',
      pedagogyHint:
        'Le coefficient et le volume horaire se définissent sur la fiche de chaque classe.',
      lmd: 'Enseignement supérieur (LMD)',
      lmdHint:
        'Renseignements spécifiques aux parcours Licence, Master et Doctorat.',
    },
    fields: {
      code: 'Code',
      name: 'Nom de la matière',
      cycle: 'Cycle',
      status: 'Statut',
      levels: 'Niveaux concernés',
      levelsEmpty: 'Aucun niveau sélectionné',
      teacher: 'Enseignant responsable',
      teacherPlaceholder: 'Non désigné',
      description: 'Description',
      descriptionPlaceholder:
        'Contenu du programme, objectifs pédagogiques...',
      ue: 'Unité d’enseignement (UE)',
      ecue: 'Élément constitutif (ECUE)',
      credits: 'Crédits ECTS',
      semester: 'Semestre',
      filiere: 'Filière',
    },
    actions: {
      cancel: 'Annuler',
      create: 'Ajouter la matière',
      update: 'Enregistrer les modifications',
    },
    toasts: {
      created: (name: string) => `La matière ${name} a été ajoutée au catalogue.`,
      updated: (name: string) => `La matière ${name} a été mise à jour.`,
    },
  },

  detail: {
    back: '← Retour aux matières',
    notFoundTitle: 'Matière introuvable',
    notFoundMessage: 'Cette matière n’existe pas ou a été supprimée.',
    backToList: 'Retour au catalogue',
    info: 'Informations',
    lmd: 'Enseignement supérieur (LMD)',
    classes: 'Classes concernées',
    noClass: 'Aucune classe',
    noClassMessage: 'Cette matière n’est encore rattachée à aucune classe.',
    evaluations: 'Évaluations liées',
    noEvaluation: 'Aucune évaluation',
    noEvaluationMessage:
      'Aucune évaluation n’a encore été créée pour cette matière.',
    archiveTitle: 'Archiver cette matière ?',
    restoreTitle: 'Réactiver cette matière ?',
    restoreMessage: (name: string) =>
      `La matière ${name} redeviendra disponible pour les emplois du temps et les évaluations.`,
    archived: (name: string) => `La matière ${name} a été archivée.`,
    restored: (name: string) => `La matière ${name} a été réactivée.`,
  },
} as const;
