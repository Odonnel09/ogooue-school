/** Libellés du module Élèves. */
export const studentMessages = {
  list: {
    title: 'Élèves',
    description:
      'Consultez, filtrez et gérez les dossiers des élèves de l’établissement.',
    add: 'Ajouter un élève',
    export: 'Exporter',
    import: 'Importer',
    tableTitle: 'Liste des élèves',
    searchPlaceholder: 'Rechercher par nom, prénom ou matricule...',
    emptyTitle: 'Aucun élève trouvé',
    emptyFiltered:
      'Aucun élève ne correspond à votre recherche ou à vos filtres.',
    emptyInitial:
      'Aucun élève n’est encore enregistré. Commencez par créer une première fiche.',
    stats: {
      total: 'Total élèves',
      active: 'Actifs',
      pending: 'En attente',
      archived: 'Archivés',
    },
    columns: {
      student: 'Élève',
      matricule: 'Matricule',
      classroom: 'Classe',
      level: 'Niveau',
      guardian: 'Parent / tuteur',
      phone: 'Téléphone',
      status: 'Statut',
      actions: 'Actions',
    },
    filters: {
      allClasses: 'Toutes les classes',
      allLevels: 'Tous les niveaux',
      allStatuses: 'Tous les statuts',
      sort: 'Trier par',
    },
    sort: {
      nameAsc: 'Nom (A → Z)',
      nameDesc: 'Nom (Z → A)',
      matricule: 'Matricule',
      classroom: 'Classe',
      recent: 'Inscription récente',
    },
    bulk: {
      selected: (count: number) =>
        `${count} élève${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}`,
      clear: 'Tout désélectionner',
      archive: 'Archiver la sélection',
      confirmTitle: 'Archiver la sélection ?',
      confirmMessage: (count: number) =>
        `${count} fiche${count > 1 ? 's' : ''} passeront au statut « Archivé ». Cette action reste réversible depuis chaque fiche.`,
    },
    archiveTitle: 'Archiver cet élève ?',
    archiveMessage: (name: string) =>
      `La fiche de ${name} sera archivée. L’élève n’apparaîtra plus dans les listes actives, mais son dossier reste consultable.`,
  },

  form: {
    createTitle: 'Nouvel élève',
    createDescription:
      'Renseignez le dossier d’inscription. Les champs marqués d’un astérisque sont obligatoires.',
    editTitle: (name: string) => `Modifier ${name}`,
    editDescription:
      'Les modifications sont appliquées immédiatement à la fiche et à la liste.',
    sections: {
      identity: 'Identité de l’élève',
      identityHint:
        'Informations d’état civil telles qu’elles figurent sur l’acte de naissance.',
      schooling: 'Scolarité',
      schoolingHint: 'Affectation de l’élève pour l’année scolaire en cours.',
      guardian: 'Parent ou tuteur',
      guardianHint:
        'Contact principal de l’établissement pour le suivi de l’élève.',
      health: 'Informations médicales',
      healthHint:
        'Renseignements utiles à l’équipe encadrante en cas d’incident.',
      background: 'Parcours antérieur',
      backgroundHint: 'Établissement fréquenté avant l’inscription.',
      track: 'Filière et parcours',
      trackHint: 'Orientation de l’étudiant au sein de l’établissement.',
      documents: 'Documents (facultatif)',
      documentsHint:
        'Pièces du dossier d’inscription. L’import réel de fichiers arrivera avec le stockage Supabase.',
    },
    fields: {
      photo: 'Photo (facultatif)',
      photoHint:
        'Collez l’adresse d’une photo. L’import de fichier sera disponible avec le stockage Supabase.',
      lastName: 'Nom',
      firstName: 'Prénom',
      birthDate: 'Date de naissance',
      birthPlace: 'Lieu de naissance',
      gender: 'Sexe',
      nationality: 'Nationalité',
      address: 'Adresse',
      matricule: 'Matricule',
      classroom: 'Classe',
      level: 'Niveau scolaire',
      levelHint: 'Pré-rempli automatiquement à partir de la classe.',
      academicYear: 'Année scolaire',
      status: 'Statut',
      guardian: 'Parent ou tuteur rattaché',
      guardianHint:
        'Un même adulte peut suivre plusieurs enfants. Créez-le depuis « Parents & tuteurs » s’il n’existe pas encore.',
      canPickUp: 'Autorisé à récupérer l’élève',
      canPickUpHint:
        'Cette personne peut venir chercher l’élève à la sortie des cours.',
      guardianName: 'Nom du parent ou tuteur',
      guardianRelation: 'Relation avec l’élève',
      guardianPhone: 'Téléphone du parent',
      guardianEmail: 'Email du parent',
      authorizedPickup: 'Personne autorisée à récupérer l’enfant',
      authorizedPickupHint:
        'Nom et téléphone de la personne autorisée à la sortie des cours.',
      medicalInfo: 'Allergies, traitements, contre-indications',
      previousSchool: 'Établissement précédent',
      filiere: 'Filière',
      parcours: 'Parcours',
      documentName: 'Nom du document (ex: Acte de naissance.pdf)',
      addDocument: 'Ajouter',
    },
    actions: {
      cancel: 'Annuler',
      saveDraft: 'Enregistrer comme brouillon',
      create: 'Enregistrer l’élève',
      update: 'Enregistrer les modifications',
    },
    toasts: {
      created: (name: string) => `${name} a été ajouté à la liste.`,
      draft: 'Brouillon enregistré. La fiche reste modifiable.',
      updated: (name: string) => `La fiche de ${name} a été mise à jour.`,
    },
  },

  detail: {
    back: '← Retour aux élèves',
    tabs: {
      infos: 'Informations',
      attendance: 'Présences',
      grades: 'Notes',
      documents: 'Documents',
      history: 'Historique',
    },
    notFoundTitle: 'Élève introuvable',
    notFoundMessage: 'Cette fiche n’existe pas ou a été supprimée.',
    backToList: 'Retour à la liste',
    personalInfo: 'Informations personnelles',
    guardianInfo: 'Parent ou tuteur',
    recentAttendance: 'Présences récentes',
    recentGrades: 'Notes récentes',
    documents: 'Documents du dossier',
    history: 'Historique d’inscription',
    generalAverage: (value: string) => `Moyenne générale ${value}`,
    archiveTitle: 'Archiver cet élève ?',
    restoreTitle: 'Réactiver cet élève ?',
    archiveMessage: (name: string) =>
      `La fiche de ${name} sera archivée. Elle restera consultable et pourra être réactivée à tout moment.`,
    restoreMessage: (name: string) =>
      `${name} redeviendra actif et réapparaîtra dans les listes de sa classe.`,
    archived: (name: string) => `${name} a été archivé.`,
    restored: (name: string) => `${name} a été réactivé.`,
  },
} as const;
