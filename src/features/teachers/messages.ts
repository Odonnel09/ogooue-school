export const teacherMessages = {
  list: {
    title: 'Enseignants',
    description:
      'Gérez le corps enseignant, les matières couvertes et les classes affectées.',
    add: 'Ajouter un enseignant',
    tableTitle: 'Liste des enseignants',
    searchPlaceholder: 'Rechercher un enseignant...',
    emptyTitle: 'Aucun enseignant trouvé',
    emptyMessage:
      'Aucun enseignant ne correspond à votre recherche ou à vos filtres.',
    stats: {
      total: 'Total enseignants',
      active: 'En activité',
      subjects: 'Matières couvertes',
    },
    columns: {
      teacher: 'Enseignant',
      matricule: 'Identifiant',
      subjects: 'Matières',
      classes: 'Classes',
      phone: 'Téléphone',
      email: 'Email',
      status: 'Statut',
      actions: 'Actions',
    },
    filters: {
      allSubjects: 'Toutes les matières',
      allClasses: 'Toutes les classes',
      allStatuses: 'Tous les statuts',
    },
    archiveTitle: 'Archiver cet enseignant ?',
    archiveMessage: (name: string) =>
      `${name} n’apparaîtra plus dans les listes d’affectation. Ses évaluations passées restent conservées.`,
  },

  form: {
    createTitle: 'Nouvel enseignant',
    createDescription:
      'Créez la fiche d’un enseignant et affectez-lui ses matières et ses classes.',
    editTitle: (name: string) => `Modifier ${name}`,
    editDescription:
      'Les modifications sont appliquées immédiatement à la fiche et à la liste.',
    sections: {
      identity: 'Identité',
      identityHint: 'Coordonnées personnelles de l’enseignant.',
      assignments: 'Affectations pédagogiques',
      assignmentsHint:
        'Matières enseignées et classes prises en charge cette année.',
      administrative: 'Situation administrative',
      administrativeHint: 'Ces informations restent internes à l’administration.',
    },
    fields: {
      photo: 'Photo (facultatif)',
      lastName: 'Nom',
      firstName: 'Prénom',
      matricule: 'Identifiant enseignant',
      email: 'Email',
      phone: 'Téléphone',
      address: 'Adresse',
      subjects: 'Matières',
      subjectsEmpty: 'Aucune matière sélectionnée',
      classes: 'Classes affectées',
      classesEmpty: 'Aucune classe affectée',
      contractType: 'Type de contrat',
      status: 'Statut',
      startDate: 'Date de début',
      notes: 'Notes administratives',
      notesPlaceholder:
        'Responsabilités particulières, remarques du service RH...',
    },
    actions: {
      cancel: 'Annuler',
      create: 'Enregistrer l’enseignant',
      update: 'Enregistrer les modifications',
    },
    toasts: {
      created: (name: string) => `${name} a rejoint le corps enseignant.`,
      updated: (name: string) => `La fiche de ${name} a été mise à jour.`,
    },
  },

  detail: {
    back: '← Retour aux enseignants',
    notFoundTitle: 'Enseignant introuvable',
    notFoundMessage: 'Cette fiche n’existe pas ou a été supprimée.',
    backToList: 'Retour à la liste',
    contact: 'Coordonnées',
    subjects: 'Matières enseignées',
    classes: 'Classes affectées',
    evaluations: 'Évaluations créées',
    noSubject: 'Aucune matière',
    noSubjectMessage: 'Aucune matière n’est encore associée à cet enseignant.',
    noClass: 'Aucune classe',
    noClassMessage: 'Aucune classe n’est encore affectée à cet enseignant.',
    noEvaluation: 'Aucune évaluation',
    noEvaluationMessage:
      'Cet enseignant n’a pas encore créé d’évaluation cette année.',
    inPostSince: (date: string) => `En poste depuis le ${date}`,
    archiveTitle: 'Archiver cet enseignant ?',
    restoreTitle: 'Réactiver cet enseignant ?',
    restoreMessage: (name: string) =>
      `${name} redeviendra disponible pour les affectations de classes et de matières.`,
    archived: (name: string) => `${name} a été archivé.`,
    restored: (name: string) => `${name} a été réactivé.`,
  },
} as const;
