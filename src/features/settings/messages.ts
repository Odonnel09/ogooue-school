export const settingsMessages = {
  title: 'Paramètres',
  description:
    'Toute la configuration de l’établissement est centralisée ici : aucun réglage métier n’est atteignable ailleurs.',
  navLabel: 'Sections des paramètres',
  saved: 'Configuration enregistrée.',
  reset: 'Configuration rétablie aux valeurs livrées par défaut.',
  dirty: 'Modifications non enregistrées',
  save: 'Enregistrer',
  cancel: 'Annuler les modifications',

  groups: {
    establishment: 'Établissement',
    year: 'Année scolaire',
    evaluation: 'Évaluation',
    enrollment: 'Inscriptions',
    access: 'Accès et sécurité',
    finance: 'Finances',
    communication: 'Communication',
  },

  checklist: {
    title: 'Configuration de l’établissement',
    description:
      'Ce qu’il reste à régler avant d’ouvrir l’établissement aux enseignants et aux familles.',
    progress: (done: number, total: number) =>
      `${done} sur ${total} points réglés`,
    items: {
      profile: 'Informations générales renseignées',
      levels: 'Au moins un cycle scolaire activé',
      periods: 'Périodes définies pour les cycles actifs',
      grading: 'Système de notation configuré',
      classes: 'Au moins une classe ouverte',
      subjects: 'Au moins une matière au catalogue',
      teachers: 'Au moins un enseignant enregistré',
      documents: 'Pièces justificatives d’inscription définies',
    },
    done: 'Réglé',
    todo: 'À faire',
  },

  general: {
    title: 'Informations générales',
    description:
      'Identité de l’établissement, telle qu’elle apparaîtra sur les bulletins et les cartes scolaires.',
    fields: {
      name: 'Nom de l’établissement',
      shortName: 'Nom court',
      shortNameHint: 'Utilisé sur les documents à espace contraint.',
      type: 'Type d’établissement',
      director: 'Chef d’établissement',
      address: 'Adresse',
      city: 'Ville',
      country: 'Pays',
      email: 'Email de contact',
      phone: 'Téléphone',
      logo: 'Logo',
      logoHint:
        'Un emoji pour l’instant. L’upload d’image arrivera avec le stockage Supabase.',
      currency: 'Devise',
      currencyHint:
        'Le franc CFA n’a pas de subdivision d’usage : les montants sont des entiers.',
      timezone: 'Fuseau horaire',
    },
  },

  levels: {
    title: 'Niveaux scolaires actifs',
    description:
      'Le cœur de la configuration. Les cycles activés déterminent les menus disponibles, les champs des dossiers, les types d’évaluation et les règles de calcul — sans aucune modification de code.',
    warning:
      'Désactiver un cycle masque ses écrans, mais ne supprime aucune donnée : les classes et les élèves concernés restent enregistrés.',
    lastOne:
      'Au moins un cycle doit rester actif : sans cela, l’établissement n’a plus aucun menu.',
    impact: 'Ce que ce cycle apporte',
    impacts: {
      grading: 'Notation',
      periods: 'Périodes',
      coefficients: 'Coefficients',
      credits: 'Crédits ECTS',
      compensation: 'Compensation',
      sessions: 'Session de rattrapage',
      report: 'Bulletin',
      studentFields: 'Champs du dossier élève',
      evaluationKinds: 'Types d’évaluation',
    },
    yes: 'Oui',
    no: 'Non',
    activate: 'Activer',
    deactivate: 'Désactiver',
    active: 'Activé',
    inactive: 'Désactivé',
  },

  grading: {
    title: 'Système de notation',
    description:
      'Un réglage par cycle actif. Ces valeurs alimentent le moteur de calcul des moyennes, des mentions et des décisions de passage.',
    engine: 'Moteur appliqué',
    fields: {
      scale: 'Barème par défaut',
      maxScore: 'Note maximale',
      rounding: 'Arrondi',
      absencePolicy: 'Évaluation non saisie ou élève absent',
      passMark: 'Seuil de réussite (sur 20)',
      compensation: 'Compensation entre unités d’enseignement',
      sessions: 'Session de rattrapage',
      resitThreshold: 'Note minimale ouvrant droit au rattrapage (sur 20)',
      mentions: 'Mentions',
      mentionLabel: 'Libellé',
      mentionMin: 'À partir de',
    },
    rounding: {
      round_half_up: 'Au plus proche (0,5 vers le haut)',
      truncate: 'Troncature',
      nearest_quarter: 'Au quart de point',
    },
    absence: {
      exclude: 'Exclue de la moyenne',
      count_as_zero: 'Comptée comme zéro',
    },
    notApplicable:
      'Ce cycle ne pratique pas cette règle : le réglage est sans effet.',
    addMention: 'Ajouter une mention',
    removeMention: 'Retirer',
  },

  years: {
    title: 'Années scolaires',
    description:
      'Une année clôturée passe en lecture seule. La réouverture exceptionnelle exigera une permission dédiée et laissera une trace au journal d’audit.',
    current: 'Année sélectionnée',
    columns: {
      year: 'Année',
      start: 'Début',
      end: 'Fin',
      status: 'Statut',
    },
    note: 'La création et la clôture d’une année seront branchées avec Supabase : elles impliquent le calcul des résultats finaux et l’archivage des bulletins dans une transaction unique.',
  },

  periods: {
    title: 'Périodes scolaires',
    description:
      'Découpage de l’année utilisé par les évaluations et les bulletins. Les périodes proposées dépendent des cycles actifs.',
    columns: {
      label: 'Libellé',
      kind: 'Type',
      cycles: 'Cycles concernés',
    },
    add: 'Ajouter une période',
    addTitle: 'Nouvelle période',
    remove: 'Retirer',
    empty: 'Aucune période définie',
    emptyMessage:
      'Sans période, aucune évaluation ne peut être rattachée à un trimestre ou à un semestre.',
    fields: {
      label: 'Libellé',
      labelPlaceholder: '1er trimestre',
      kind: 'Type de découpage',
      cycles: 'Cycles concernés',
    },
  },

  enrollment: {
    title: 'Formulaire d’inscription',
    description:
      'Les champs du dossier élève sont déduits des cycles actifs. Les pièces justificatives, elles, se règlent librement.',
    fieldsTitle: 'Champs actifs du dossier',
    fieldsHint:
      'Ces champs sont déclarés par la matrice de capacités des cycles activés. Pour en changer, activez ou désactivez un cycle.',
    documentsTitle: 'Pièces justificatives exigées',
    documentPlaceholder: 'Certificat de résidence',
    addDocument: 'Ajouter',
    removeDocument: 'Retirer',
    approvalTitle: 'Validation des préinscriptions',
    approvalLabel:
      'Une préinscription doit être validée par l’administration avant de devenir une inscription',
  },

  fees: {
    title: 'Frais de scolarité',
    description:
      'Grilles tarifaires par niveau. Elles alimentent la facturation du module Finances : modifier un montant ici change ce qui sera facturé aux prochaines inscriptions.',
    addSchedule: 'Ajouter une grille',
    removeSchedule: 'Supprimer la grille',
    removeScheduleTitle: 'Supprimer cette grille tarifaire ?',
    removeScheduleMessage: (label: string) =>
      `La grille « ${label} » sera supprimée. Les factures déjà émises ne sont pas modifiées.`,
    empty: 'Aucune grille tarifaire',
    emptyMessage:
      'Sans grille, aucune facture ne peut être générée pour les élèves.',
    itemsTitle: 'Frais de la grille',
    addItem: 'Ajouter un frais',
    removeItem: 'Retirer',
    mandatoryTotal: 'Total annuel obligatoire :',
    optionalTotal: 'Options :',
    installmentsTitle: 'Échéancier',
    installmentsHint:
      'Répartition du total obligatoire. La somme des parts doit faire 100 %.',
    addInstallment: 'Ajouter une tranche',
    removeInstallment: 'Retirer',
    percentMismatch: (total: number) =>
      `La somme des tranches vaut ${total} % au lieu de 100 %. Ajustez les parts pour que la facturation soit complète.`,
    fields: {
      label: 'Libellé de la grille',
      academicYear: 'Année scolaire',
      levels: 'Niveaux concernés',
      levelsHint:
        'Un élève est facturé selon la grille correspondant au niveau de sa classe.',
      levelsEmpty: 'Aucun niveau sélectionné',
      itemLabel: 'Libellé du frais',
      itemPlaceholder: 'Scolarité annuelle',
      amount: 'Montant',
      mandatory: 'Obligatoire',
      installmentLabel: 'Libellé de la tranche',
      installmentPlaceholder: '1ère tranche',
      percent: 'Part (%)',
      dueDate: 'Échéance',
    },
    toasts: {
      scheduleAdded: 'Grille tarifaire ajoutée.',
      scheduleRemoved: (label: string) => `Grille « ${label} » supprimée.`,
    },
  },

  templates: {
    reportTitle: 'Modèles de bulletins',
    reportDescription:
      'Habillage des bulletins et relevés de notes. Le gabarit n’est pas déduit d’un fichier téléversé : vous fournissez les images et les réglages, et le document se compose par-dessus — c’est ce qui permet de figer un bulletin publié.',
    cardTitle: 'Modèles de cartes scolaires',
    cardDescription:
      'Habillage des cartes remises aux élèves. Le logo et l’en-tête de l’établissement y sont repris automatiquement.',
    assetsTitle: 'Images du document',
    assetsHint:
      'Formats acceptés : PNG, JPEG, WebP et SVG. Les images sont redimensionnées et compressées avant enregistrement.',
    styleTitle: 'Mise en forme',
    styleHint:
      'Titre, couleur d’accent et mention de pied de page du document.',
    columnsTitle: 'Colonnes du tableau de notes',
    columnsHint:
      'Décochez ce que votre établissement n’imprime pas sur ses bulletins.',
    referenceTitle: 'Modèle de référence',
    referenceHint:
      'Conservez ici une copie de votre formulaire officiel, à titre de comparaison.',
    referenceNotice:
      'Ce fichier n’est jamais interprété : reconstituer automatiquement une mise en page à partir d’une image donnerait un résultat approximatif et non reproductible, incompatible avec l’immuabilité d’un bulletin publié. La superposition sur PDF avec placement des champs viendra avec la génération côté serveur.',
    columns: {
      teacher: 'Enseignant',
      coefficient: 'Coefficient',
      classAverage: 'Moyenne de la classe',
      lowest: 'Note la plus basse',
      best: 'Meilleure note',
    },
    fields: {
      background: 'Papier à en-tête',
      backgroundHint: 'Image de fond du document, en pleine page.',
      backgroundOpacity: 'Opacité du fond',
      backgroundOpacityHint:
        'Atténuez le fond pour que le texte reste lisible à l’impression.',
      logo: 'Logo',
      logoHint: 'Affiché en tête du document.',
      stamp: 'Cachet',
      stampHint: 'Apposé près de la signature du chef d’établissement.',
      documentTitle: 'Titre du document',
      accentColor: 'Couleur d’accent',
      accentColorHint: 'Filets, titres et bandeaux du document.',
      footerText: 'Mention de pied de page',
      footerHint: 'Mention légale ou administrative imprimée en bas.',
      footerPlaceholder:
        'Document officiel — toute rature annule la présente pièce.',
      reference: 'Fichier de référence',
      referenceHint: 'Conservé tel quel, sans effet sur le rendu.',
    },
    signatureTitle: 'Signature du chef d’établissement',
    signatureHint:
      'Tracez la signature à la souris ou au doigt, ou importez-en une numérisée. Elle est apposée sur les bulletins et figée à leur publication.',
    signatureFields: {
      pad: 'Signature',
      padHint: 'Tracez dans le cadre, ou importez une image.',
      signerName: 'Nom du signataire',
      signerRole: 'Qualité',
    },
    signatureMissing:
      'Aucune signature enregistrée : les bulletins publiés porteront le nom du signataire, sans signature manuscrite.',
    saved: 'Gabarit mis à jour.',
  },

  roles: {
    title: 'Rôles et permissions',
    description:
      'Le contrôle réalisé dans l’interface est cosmétique : il masque ce que l’utilisateur ne peut pas faire. La sécurité réelle sera portée par les Server Actions et les politiques RLS.',
    systemRole: 'Rôle système',
    customRole: 'Rôle personnalisé',
    permissionCount: (count: number) =>
      `${count} permission${count > 1 ? 's' : ''}`,
    activeRole: 'Rôle actif dans cette session',
    matrixTitle: 'Matrice des permissions',
    note: 'La création de rôles personnalisés sera activée avec la gestion des utilisateurs.',
  },

  structure: {
    title: 'Structure pédagogique',
    description:
      'Classes, matières et enseignants se gèrent depuis leurs modules dédiés — les dupliquer ici créerait deux sources de vérité.',
    open: 'Ouvrir le module',
    classes: 'Classes et effectifs',
    classesHint:
      'Créer les classes, fixer les capacités, désigner les professeurs principaux et régler les coefficients matière par matière.',
    subjects: 'Catalogue des matières',
    subjectsHint:
      'Codes, intitulés, niveaux concernés et informations LMD des matières.',
    teachers: 'Corps enseignant',
    teachersHint:
      'Fiches des enseignants, matières couvertes et classes affectées.',
  },

  comingSoon: {
    badge: 'Étape ultérieure',
    action: 'Voir le plan de développement',
    sections: {
      reportTemplates:
        'Les modèles de bulletins seront rattachés au type de bulletin déclaré par chaque cycle (carnet de suivi, bulletin de compétences, bulletin trimestriel, relevé de notes).',
      cards:
        'Les modèles de cartes scolaires arriveront avec la génération PDF et la vérification par QR code.',
      users:
        'La gestion des utilisateurs et des invitations suppose l’authentification Supabase.',
      fees:
        'La grille des frais de scolarité arrivera avec le module Finances, en francs CFA entiers.',
      integrations:
        'Les intégrations de paiement supposent un compte marchand par établissement et des webhooks signés.',
      notifications:
        'Le réglage des notifications suivra la mise en place de la messagerie temps réel.',
      messaging:
        'Les paramètres de messagerie interne arriveront avec Supabase Realtime.',
      audit:
        'Le journal d’audit sera alimenté par les Server Actions : chaque opération sensible y laissera une trace.',
    },
  },
} as const;
