/** Libellés de l'assistant d'import. */
export const importMessages = {
  title: 'Importer des élèves',
  description:
    'Déposez un fichier, associez les colonnes, vérifiez le rapport, puis importez.',
  back: '← Retour aux élèves',

  steps: {
    upload: 'Fichier',
    mapping: 'Colonnes',
    preview: 'Vérification',
    done: 'Import',
  },

  upload: {
    title: 'Déposer le fichier',
    hint: 'Formats acceptés : CSV, TSV ou TXT délimité. Le séparateur est détecté automatiquement.',
    drop: 'Glissez le fichier ici',
    browse: 'ou parcourir vos fichiers',
    template: 'Télécharger le modèle',
    templateHint:
      'Le modèle reprend exactement les colonnes attendues par votre établissement, et deux lignes d’exemple.',
    workbookTitle: 'Fichier Excel détecté',
    workbookMessage:
      'Les classeurs .xlsx ne sont pas lus par le navigateur : leur analyse aura lieu côté serveur, où le fichier doit de toute façon être revalidé. En attendant, ouvrez le classeur dans Excel puis « Enregistrer sous » → « CSV UTF-8 (délimité par des points-virgules) ».',
    rejectedTitle: 'Format non pris en charge',
    rejectedMessage:
      'Déposez un fichier CSV, TSV ou TXT délimité.',
    readError: 'Le fichier n’a pas pu être lu.',
  },

  mapping: {
    title: 'Associer les colonnes',
    hint: 'Les colonnes reconnues sont pré-remplies. Vérifiez-les, complétez les manquantes, ignorez le reste.',
    fileColumn: 'Colonne du fichier',
    targetColumn: 'Champ de la fiche élève',
    ignore: 'Ne pas importer',
    required: 'Obligatoire',
    detected: (count: number) =>
      `${count} colonne${count > 1 ? 's' : ''} détectée${count > 1 ? 's' : ''} dans le fichier`,
    missingRequired: (labels: string[]) =>
      `Colonnes obligatoires non associées : ${labels.join(', ')}.`,
    sample: 'Premier enregistrement',
  },

  preview: {
    title: 'Rapport de contrôle',
    hint: 'Seules les lignes valides seront importées. Les autres restent dans votre fichier, à corriger.',
    columns: {
      line: 'Ligne',
      status: 'État',
      student: 'Élève',
      matricule: 'Matricule',
      className: 'Classe',
      issues: 'Anomalies',
    },
    onlyProblems: 'Afficher seulement les anomalies',
    noProblem: 'Aucune anomalie détectée.',
    exportReport: 'Exporter le rapport',
  },

  status: {
    valide: 'Valide',
    erreur: 'Erreur',
    doublon: 'Doublon',
  },

  stats: {
    total: 'Lignes lues',
    valid: 'Prêtes à importer',
    errors: 'En erreur',
    duplicates: 'Doublons',
  },

  actions: {
    next: 'Continuer',
    previous: 'Revenir',
    restart: 'Importer un autre fichier',
    confirm: (count: number) =>
      `Importer ${count} élève${count > 1 ? 's' : ''}`,
    cancel: 'Annuler',
  },

  confirm: {
    title: 'Confirmer l’import',
    message: (count: number) =>
      `${count} fiche${count > 1 ? 's' : ''} élève ${count > 1 ? 'seront créées' : 'sera créée'}. Les lignes en erreur et les doublons sont écartés. L’opération est journalisée.`,
  },

  done: {
    title: 'Import terminé',
    message: (count: number) =>
      `${count} élève${count > 1 ? 's ont' : ' a'} été ajouté${count > 1 ? 's' : ''} à l’établissement.`,
    rejected: (count: number) =>
      `${count} ligne${count > 1 ? 's' : ''} écartée${count > 1 ? 's' : ''}. Exportez le rapport pour les corriger.`,
  },

  serverNotice:
    'Le fichier est ici analysé par le navigateur, pour la démonstration. Avec Supabase, l’analyse et la validation auront lieu côté serveur : un fichier venu du poste client ne peut pas être tenu pour fiable.',
} as const;
