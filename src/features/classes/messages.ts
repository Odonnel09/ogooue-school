export const classMessages = {
  list: {
    title: 'Classes',
    description:
      'Suivez les effectifs, les capacités et l’encadrement de chaque classe.',
    add: 'Créer une classe',
    tableTitle: 'Liste des classes',
    searchPlaceholder: 'Rechercher une classe ou une salle...',
    emptyTitle: 'Aucune classe trouvée',
    emptyMessage:
      'Aucune classe ne correspond à votre recherche ou à vos filtres.',
    stats: {
      total: 'Classes',
      active: 'Classes actives',
      enrolled: 'Élèves inscrits',
      capacity: 'Places totales',
      available: (count: number) => `${count} places disponibles`,
    },
    columns: {
      classroom: 'Classe',
      level: 'Niveau',
      cycle: 'Cycle',
      year: 'Année',
      headcount: 'Effectif',
      mainTeacher: 'Professeur principal',
      room: 'Salle',
      status: 'Statut',
      actions: 'Actions',
    },
    filters: {
      allCycles: 'Tous les cycles',
      allLevels: 'Tous les niveaux',
      allYears: 'Toutes les années',
      allStatuses: 'Tous les statuts',
    },
    archiveTitle: 'Archiver cette classe ?',
    archiveMessage: (name: string) =>
      `La classe ${name} passera au statut « Archivée ». Elle ne sera plus proposée lors des affectations d’élèves.`,
  },

  form: {
    createTitle: 'Nouvelle classe',
    createDescription:
      'Créez une classe et définissez sa capacité, sa salle et son encadrement.',
    editTitle: (name: string) => `Modifier ${name}`,
    editDescription:
      'Les modifications sont appliquées immédiatement à la fiche et à la liste.',
    sections: {
      general: 'Informations générales',
      generalHint: 'Identification de la classe pour l’année scolaire choisie.',
      organisation: 'Organisation',
      organisationHint: 'Capacité d’accueil, salle attitrée et encadrement.',
      subjects: 'Matières enseignées',
      subjectsHint:
        'Le coefficient et le volume horaire sont propres à cette classe : les mathématiques ne pèsent pas le même poids en 6ème et en Terminale.',
      subjectsHintNoCoefficient:
        'Ce cycle ne pratique pas les coefficients : seules les matières et leur volume horaire sont demandés.',
    },
    fields: {
      name: 'Nom de la classe',
      level: 'Niveau',
      cycle: 'Cycle',
      cycleHint: 'Pré-rempli automatiquement à partir du niveau.',
      academicYear: 'Année scolaire',
      status: 'Statut',
      capacity: 'Capacité',
      capacityHint: 'Nombre maximum d’élèves pouvant être inscrits.',
      room: 'Salle',
      roomPlaceholder: 'Aucune salle attitrée',
      mainTeacher: 'Professeur principal',
      mainTeacherPlaceholder: 'Non désigné',
      description: 'Description',
      descriptionPlaceholder: 'Série, spécialité, remarques pédagogiques...',
      subjectsEmpty: 'Aucune matière associée',
      coefficient: 'Coefficient',
      weeklyHours: 'Heures / semaine',
      teacher: 'Enseignant',
    },
    actions: {
      cancel: 'Annuler',
      create: 'Créer la classe',
      update: 'Enregistrer les modifications',
    },
    toasts: {
      created: (name: string) => `La classe ${name} a été créée.`,
      updated: (name: string) => `La classe ${name} a été mise à jour.`,
    },
  },

  detail: {
    back: '← Retour aux classes',
    notFoundTitle: 'Classe introuvable',
    notFoundMessage: 'Cette classe n’existe pas ou a été supprimée.',
    backToList: 'Retour à la liste',
    takeAttendance: 'Faire l’appel',
    tabs: {
      overview: 'Aperçu',
      students: 'Élèves',
      timetable: 'Emploi du temps',
      evaluations: 'Évaluations',
      attendance: 'Présences',
    },
    stats: {
      headcount: 'Effectif',
      average: 'Moyenne de classe',
      averageHint: 'Évaluations validées et publiées',
      subjects: 'Matières',
      slots: 'Créneaux / semaine',
      occupancy: (rate: number) => `${rate}% de la capacité`,
    },
    general: 'Informations générales',
    subjects: 'Matières de la classe',
    students: 'Élèves de la classe',
    timetable: 'Emploi du temps hebdomadaire',
    evaluations: 'Évaluations de la classe',
    attendance: 'Feuilles de présence',
  },
} as const;
