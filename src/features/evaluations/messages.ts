export const evaluationMessages = {
  list: {
    title: 'Évaluations',
    description:
      'Créez les devoirs et contrôles, suivez la saisie des notes et publiez les résultats.',
    add: 'Nouvelle évaluation',
    tableTitle: 'Liste des évaluations',
    searchPlaceholder: 'Rechercher une évaluation...',
    emptyTitle: 'Aucune évaluation trouvée',
    emptyFiltered:
      'Aucune évaluation ne correspond à votre recherche ou à vos filtres.',
    emptyInitial:
      'Aucune évaluation n’a encore été créée. Commencez par en créer une.',
    stats: {
      total: 'Évaluations',
      pending: 'Saisie en cours',
      published: 'Publiées',
    },
    columns: {
      evaluation: 'Évaluation',
      subject: 'Matière',
      classroom: 'Classe',
      teacher: 'Enseignant',
      period: 'Période',
      date: 'Date',
      type: 'Type',
      students: 'Élèves',
      status: 'Statut',
      actions: 'Actions',
    },
    filters: {
      allStatuses: 'Tous les statuts',
      allClasses: 'Toutes les classes',
      allSubjects: 'Toutes les matières',
      allPeriods: 'Toutes les périodes',
    },
    publish: 'Publier les résultats',
    deleteTitle: 'Supprimer cette évaluation ?',
    deleteMessage: (name: string, count: number) =>
      `L’évaluation « ${name} » et les ${count} notes associées seront définitivement supprimées.`,
    published: (name: string) => `« ${name} » a été publiée.`,
    deleted: (name: string) => `L’évaluation « ${name} » a été supprimée.`,
  },

  form: {
    createTitle: 'Nouvelle évaluation',
    createDescription:
      'Créez un devoir, un contrôle ou un examen. La grille de saisie des notes sera générée automatiquement.',
    editTitle: (name: string) => `Modifier « ${name} »`,
    editDescription:
      'Les notes déjà saisies sont conservées lors de la modification.',
    sections: {
      general: 'Informations générales',
      generalHint: 'Nature de l’évaluation et classe concernée.',
      grading: 'Calendrier et notation',
      gradingHint:
        'Les types d’épreuve et les barèmes proposés dépendent du cycle de la classe choisie.',
    },
    fields: {
      name: 'Nom de l’évaluation',
      namePlaceholder: 'Devoir n°1 — Suites numériques',
      type: 'Type',
      subject: 'Matière',
      classroom: 'Classe',
      teacher: 'Enseignant',
      teacherHint: 'Pré-rempli avec l’enseignant responsable de la matière.',
      academicYear: 'Année scolaire',
      period: 'Période',
      date: 'Date',
      scale: 'Barème',
      scaleHint:
        'Les barèmes disponibles sont ceux déclarés pour le cycle de la classe.',
      maxScore: 'Note maximale',
      maxScoreHintFixed: 'Déduite automatiquement du barème choisi.',
      maxScoreHintCustom: 'Définissez librement la note maximale.',
      maxScoreHintSymbolic:
        'Sans objet pour un barème symbolique : les valeurs sont fixées.',
      coefficient: 'Coefficient',
      status: 'Statut',
      description: 'Description',
      descriptionPlaceholder:
        'Consignes, durée de l’épreuve, chapitres évalués...',
      selectClassFirst: 'Choisissez d’abord une classe',
    },
    actions: {
      cancel: 'Annuler',
      create: 'Créer l’évaluation',
      update: 'Enregistrer les modifications',
    },
    toasts: {
      created: (name: string, count: number) =>
        `L’évaluation « ${name} » a été créée pour ${count} élèves.`,
      updated: (name: string) => `L’évaluation « ${name} » a été mise à jour.`,
    },
  },

  detail: {
    back: '← Retour aux évaluations',
    notFoundTitle: 'Évaluation introuvable',
    notFoundMessage: 'Cette évaluation n’existe pas ou a été supprimée.',
    backToList: 'Retour à la liste',
    info: 'Informations',
    entryTitle: 'Saisie des notes',
    entryHint: (max: string) =>
      `${max} La moyenne est recalculée automatiquement.`,
    lockedTitle: 'Saisie verrouillée',
    lockedMessage:
      'Les notes ont été validées. Toute correction exige la permission « Corriger une note validée » et un motif, tracé dans l’historique.',
    correctionTitle: 'Corriger une note validée',
    correctionMessage:
      'Cette évaluation est verrouillée. Indiquez le motif de la correction : il sera conservé dans l’historique et signalé à la direction.',
    correctionReason: 'Motif de la correction',
    correctionPlaceholder:
      'Erreur de report de la copie n°14 signalée par l’élève...',
    historyTitle: 'Historique des corrections',
    historyEmpty: 'Aucune correction n’a été apportée après validation.',
    stats: {
      average: 'Moyenne de la classe',
      best: 'Meilleure note',
      lowest: 'Note la plus basse',
      progress: 'Saisie',
      progressHint: (percent: number) => `${percent}% complété`,
      noStudent: 'Aucun élève concerné',
    },
    actions: {
      edit: 'Modifier',
      submit: 'Soumettre à validation',
      validate: 'Valider les notes',
      publish: 'Publier',
      reopen: 'Rouvrir la saisie',
    },
    publishTitle: 'Publier les résultats ?',
    publishMessage: (count: number) =>
      `Les ${count} note(s) saisies seront visibles par les élèves et les parents. La saisie sera verrouillée, mais vous pourrez la rouvrir.`,
    noStudentTitle: 'Aucun élève concerné',
    noStudentMessage:
      'Aucun élève actif n’est affecté à la classe de cette évaluation.',
    viewClass: 'Voir la classe',
    invalidFields: 'Champs invalides',
    comment: 'Appréciation (facultatif)',
    toasts: {
      submitted: 'L’évaluation a été soumise à validation.',
      validated: 'Les notes ont été validées : la saisie est verrouillée.',
      published: 'Les résultats ont été publiés.',
      reopened: 'L’évaluation est repassée en saisie.',
      corrected: 'La correction a été enregistrée et tracée.',
    },
  },
} as const;
