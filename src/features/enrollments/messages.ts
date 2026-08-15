export const enrollmentMessages = {
  list: {
    title: 'Inscriptions',
    description:
      'Dossiers de préinscription, de leur dépôt jusqu’à la création de l’élève.',
    add: 'Déposer un dossier',
    tableTitle: 'Dossiers de préinscription',
    searchPlaceholder: 'Rechercher par nom, prénom ou référence...',
    emptyTitle: 'Aucun dossier trouvé',
    emptyFiltered:
      'Aucun dossier ne correspond à votre recherche ou à vos filtres.',
    emptyInitial:
      'Aucune préinscription n’a encore été déposée. Créez le premier dossier.',
    stats: {
      total: 'Dossiers',
      pending: 'En attente de décision',
      incomplete: 'Pièces manquantes',
      enrolled: 'Élèves créés',
    },
    columns: {
      reference: 'Référence',
      candidate: 'Candidat',
      level: 'Niveau demandé',
      guardian: 'Tuteur',
      documents: 'Pièces',
      submitted: 'Déposé le',
      status: 'Statut',
      actions: 'Actions',
    },
    filters: {
      allStatuses: 'Tous les statuts',
      allLevels: 'Tous les niveaux',
      completeness: 'Complétude',
      complete: 'Dossiers complets',
      incomplete: 'Dossiers incomplets',
    },
    documentsCount: (provided: number, total: number) =>
      `${provided}/${total} pièces`,
  },

  form: {
    createTitle: 'Nouvelle préinscription',
    createDescription:
      'Enregistrez la demande d’une famille. Les pièces exigées sont celles réglées dans Paramètres.',
    sections: {
      candidate: 'Le candidat',
      candidateHint: 'État civil du futur élève.',
      schooling: 'Scolarité demandée',
      schoolingHint:
        'Niveau souhaité pour la rentrée. La classe sera affectée à la validation.',
      guardian: 'Parent ou tuteur',
      guardianHint:
        'Le référent doit déjà exister dans le répertoire. Il sera rattaché à l’élève lors de l’inscription.',
    },
    fields: {
      lastName: 'Nom',
      firstName: 'Prénom',
      birthDate: 'Date de naissance',
      birthPlace: 'Lieu de naissance',
      gender: 'Sexe',
      nationality: 'Nationalité',
      address: 'Adresse',
      previousSchool: 'Établissement précédent',
      requestedLevel: 'Niveau demandé',
      academicYear: 'Année scolaire',
      guardian: 'Parent ou tuteur',
      guardianRelation: 'Relation avec le candidat',
    },
    actions: {
      cancel: 'Annuler',
      saveDraft: 'Enregistrer en brouillon',
      submit: 'Déposer le dossier',
    },
    toasts: {
      draft: (reference: string) =>
        `Dossier ${reference} enregistré en brouillon.`,
      submitted: (reference: string) =>
        `Dossier ${reference} déposé, en attente d’instruction.`,
    },
  },

  detail: {
    back: '← Retour aux inscriptions',
    notFoundTitle: 'Dossier introuvable',
    notFoundMessage: 'Ce dossier n’existe pas ou a été supprimé.',
    backToList: 'Retour aux dossiers',
    candidate: 'Le candidat',
    guardian: 'Parent ou tuteur',
    documentsTitle: 'Pièces du dossier',
    documentsHint:
      'Liste issue des exigences réglées dans Paramètres. Cochez une pièce à sa réception.',
    complete: 'Dossier complet',
    incomplete: (count: number) =>
      `${count} pièce${count > 1 ? 's' : ''} manquante${count > 1 ? 's' : ''}`,
    received: (date: string) => `Reçue le ${date}`,
    decisionTitle: 'Instruction du dossier',
    decisionNote: 'Note d’instruction',
    approvalRequired:
      'L’établissement exige une validation avant inscription : le dossier doit passer par l’état « Validée ».',
    approvalNotRequired:
      'L’établissement n’exige pas de validation : un dossier complet peut être inscrit directement.',
    createdStudent: 'Élève créé',
    openStudent: 'Ouvrir la fiche élève',
    actions: {
      submit: 'Déposer le dossier',
      markIncomplete: 'Signaler des pièces manquantes',
      validate: 'Valider le dossier',
      reject: 'Refuser le dossier',
      enroll: 'Inscrire l’élève',
      reopen: 'Rouvrir le dossier',
    },
    enrollTitle: 'Inscrire cet élève ?',
    enrollMessage: (name: string) =>
      `Une fiche élève sera créée pour ${name}, rattachée au tuteur du dossier. Le dossier passera à l’état « Inscrite ».`,
    enrollBlocked:
      'Le dossier doit être complet, et validé si l’établissement l’exige, avant de créer l’élève.',
    rejectTitle: 'Refuser ce dossier ?',
    rejectPrompt: 'Indiquez le motif du refus : il sera conservé au dossier.',
    validateTitle: 'Valider ce dossier ?',
    validatePrompt:
      'Indiquez la classe pressentie et toute réserve éventuelle.',
    assignClass: 'Classe pressentie',
    toasts: {
      submitted: 'Dossier déposé, en attente d’instruction.',
      incomplete: 'Le dossier a été signalé incomplet à la famille.',
      validated: 'Dossier validé.',
      rejected: 'Dossier refusé.',
      enrolled: (name: string) =>
        `${name} a été inscrit : la fiche élève est créée.`,
      reopened: 'Le dossier est repassé en instruction.',
      documentToggled: 'Pièce mise à jour.',
    },
  },
} as const;
