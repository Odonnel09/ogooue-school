export const reportMessages = {
  title: 'Bulletins',
  description:
    'Génération des bulletins, relevés de notes et cartes scolaires. Un bulletin publié est figé : il ne bouge plus, même si la configuration de notation change ensuite.',
  navLabel: 'Sections des bulletins',
  tabs: {
    reports: 'Bulletins',
    cards: 'Cartes scolaires',
  },

  list: {
    selectClass: 'Classe',
    selectPeriod: 'Période',
    selectPrompt: 'Choisissez une classe et une période',
    selectPromptMessage:
      'Les bulletins sont calculés par classe et par période, à partir des évaluations validées ou publiées.',
    generateAll: 'Générer les bulletins',
    publishAll: 'Publier les bulletins',
    tableTitle: 'Bulletins de la classe',
    emptyTitle: 'Aucun élève',
    emptyMessage: 'Cette classe ne compte aucun élève actif.',
    noEvaluationTitle: 'Aucune note exploitable',
    noEvaluationMessage:
      'Aucune évaluation validée ou publiée sur cette période : les bulletins seraient vides. Validez d’abord des notes depuis le module Évaluations.',
    goToEvaluations: 'Aller aux évaluations',
    columns: {
      rank: 'Rang',
      student: 'Élève',
      matricule: 'Matricule',
      average: 'Moyenne',
      decision: 'Décision',
      status: 'Statut',
      actions: 'Actions',
    },
    stats: {
      students: 'Élèves concernés',
      classAverage: 'Moyenne de classe',
      generated: 'Bulletins générés',
      published: 'Bulletins publiés',
    },
    toasts: {
      generated: (count: number) =>
        `${count} bulletin${count > 1 ? 's' : ''} généré${count > 1 ? 's' : ''}.`,
      published: (count: number) =>
        `${count} bulletin${count > 1 ? 's' : ''} publié${count > 1 ? 's' : ''} et figé${count > 1 ? 's' : ''}.`,
    },
    publishTitle: 'Publier les bulletins de la classe ?',
    publishMessage: (count: number) =>
      `${count} bulletin${count > 1 ? 's seront figés' : ' sera figé'} : notes, moyennes, rang et coefficients seront recopiés dans le document. Une modification ultérieure de la configuration de notation ne les changera plus.`,
  },

  detail: {
    back: '← Retour aux bulletins',
    notFoundTitle: 'Bulletin introuvable',
    notFoundMessage: 'Ce bulletin n’existe pas ou n’a pas encore été généré.',
    backToList: 'Retour aux bulletins',
    frozenNotice: (date: string) =>
      `Bulletin publié le ${date}. Son contenu est figé : il reflète les notes et la configuration en vigueur au moment de la publication.`,
    draftNotice:
      'Bulletin non publié : il est recalculé à chaque affichage et peut donc encore évoluer.',
    regenerate: 'Recalculer',
    sign: 'Signer ce bulletin',
    signTitle: 'Signer ce bulletin',
    signDescription:
      'Utile lorsqu’une autre personne que le chef d’établissement signe : censeur, directeur des études, proviseur adjoint.',
    signDefault: 'Rétablir la signature par défaut',
    signedBy: (name: string) => `Signé par ${name}`,
    notSigned: 'Non signé',
    publish: 'Publier et figer',
    print: 'Imprimer',
    councilComment: 'Appréciation du conseil de classe',
    councilPlaceholder:
      'Trimestre satisfaisant, des efforts à poursuivre en sciences...',
    saveComment: 'Enregistrer l’appréciation',
    publishTitle: 'Publier ce bulletin ?',
    publishMessage: (name: string) =>
      `Le bulletin de ${name} sera figé et visible par la famille. Vous pourrez toujours le consulter et l’imprimer, mais plus le recalculer.`,
    toasts: {
      regenerated: 'Bulletin recalculé.',
      published: 'Bulletin publié et figé.',
      commentSaved: 'Appréciation enregistrée.',
      signed: 'Signature apposée sur le bulletin.',
      signatureReset: 'Signature par défaut de l’établissement rétablie.',
      signatureMissing: 'Tracez ou importez une signature avant de valider.',
    },
    card: {
      subject: 'Matière',
      teacher: 'Enseignant',
      coefficient: 'Coef.',
      credits: 'ECTS',
      average: 'Moyenne',
      classAverage: 'Moy. classe',
      best: 'Max',
      lowest: 'Min',
      validated: 'Validée',
      notValidated: 'Non validée',
      generalAverage: 'Moyenne générale',
      rank: 'Rang',
      rankOf: (rank: number, total: number) => `${rank}ᵉ sur ${total}`,
      decision: 'Décision',
      mention: 'Mention',
      attendance: 'Assiduité',
      absences: 'absences',
      delays: 'retards',
      attendanceRate: 'de présence',
      credits_earned: 'Crédits acquis',
      noGrade: 'Aucune note',
      signature: 'Le chef d’établissement',
      generatedOn: (date: string) => `Document établi le ${date}`,
      configLine: (summary: string) => `Règles appliquées : ${summary}`,
      title: {
        bulletin_trimestriel: 'Bulletin de notes',
        releve_notes: 'Relevé de notes',
        bulletin_competences: 'Bulletin de compétences',
        carnet_suivi: 'Carnet de suivi',
      },
    },
  },

  cards: {
    title: 'Cartes scolaires',
    description:
      'Cartes à imprimer et à remettre aux élèves. Elles reprennent l’identité de l’établissement réglée dans Paramètres.',
    selectClass: 'Classe',
    print: 'Imprimer les cartes',
    emptyTitle: 'Aucun élève',
    emptyMessage: 'Choisissez une classe comptant au moins un élève actif.',
    validUntil: (date: string) => `Valable jusqu’au ${date}`,
    matricule: 'Matricule',
    born: 'Né(e) le',
    classroom: 'Classe',
    year: 'Année scolaire',
    verifyNotice:
      'La vérification par QR code arrivera avec la génération PDF côté serveur.',
  },
} as const;
