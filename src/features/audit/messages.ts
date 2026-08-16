export const auditMessages = {
  title: 'Journal d’audit',
  description:
    'Trace des opérations sensibles réalisées dans l’établissement : qui a fait quoi, sur quelle ressource, et quand.',
  searchPlaceholder: 'Rechercher par acteur, ressource ou détail...',
  tableTitle: 'Événements enregistrés',
  emptyTitle: 'Aucun événement',
  emptyFiltered:
    'Aucun événement ne correspond à votre recherche ou à vos filtres.',
  emptyInitial: 'Aucune opération n’a encore été journalisée.',
  stats: {
    total: 'Événements',
    sensitive: 'Opérations sensibles',
    actors: 'Acteurs distincts',
    today: 'Aujourd’hui',
  },
  columns: {
    at: 'Horodatage',
    actor: 'Acteur',
    action: 'Opération',
    resource: 'Ressource',
    detail: 'Détail',
    severity: 'Gravité',
  },
  filters: {
    allDomains: 'Tous les domaines',
    allSeverities: 'Toutes gravités',
    allActors: 'Tous les acteurs',
    from: 'Depuis le',
    to: 'Jusqu’au',
  },
  export: 'Exporter le journal',
  exported: (count: number) => `Export de ${count} événements généré.`,
  immutableNotice:
    'Une entrée d’audit ne se modifie ni ne se supprime : aucune action de la plateforme ne permet de réécrire cette liste.',
  clientNotice:
    'À cette étape, les traces sont produites par le navigateur : elles documentent l’usage normal, pas la fraude. L’écriture migrera dans les Server Actions, où elle deviendra inévitable.',
  settings: {
    title: 'Journal d’audit',
    description:
      'Le journal se consulte depuis son module dédié. Le dupliquer ici créerait une seconde source de vérité.',
    open: 'Ouvrir le journal d’audit',
    recentTitle: 'Dernières opérations sensibles',
    retention:
      'La durée de conservation et la purge des traces seront réglées ici une fois la base de données branchée : ce sont des décisions de politique de rétention, pas de simples réglages d’affichage.',
  },
} as const;
