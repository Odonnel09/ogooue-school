export const financeMessages = {
  title: 'Finances',
  description:
    'Suivi de la facturation, des encaissements et des impayés de l’établissement.',
  navLabel: 'Sections des finances',
  tabs: {
    treasury: 'Trésorerie',
    invoices: 'Factures',
    payments: 'Paiements',
    overdue: 'Impayés',
  },

  treasury: {
    title: 'Trésorerie',
    description:
      'Vue d’ensemble de l’année scolaire sélectionnée. Seuls les encaissements confirmés sont comptabilisés.',
    stats: {
      expected: 'Total facturé',
      collected: 'Encaissé',
      pending: 'En attente de confirmation',
      outstanding: 'Reste à recouvrer',
      rate: 'Taux de recouvrement',
      overdue: 'Factures en retard',
    },
    byMethod: 'Encaissements par moyen de paiement',
    noPayment: 'Aucun encaissement confirmé',
    noPaymentMessage:
      'Les règlements confirmés apparaîtront ici, répartis par moyen de paiement.',
    pendingNotice:
      'Les montants « en attente » proviennent de règlements Mobile Money non encore confirmés par le prestataire. Ils ne réduisent pas la dette des familles tant qu’un webhook signé ne les a pas validés.',
  },

  invoices: {
    title: 'Factures',
    description:
      'Une facture par tranche, générée depuis la grille tarifaire réglée en Paramètres.',
    searchPlaceholder: 'Rechercher par numéro, élève ou matricule...',
    tableTitle: 'Factures émises',
    emptyTitle: 'Aucune facture',
    emptyFiltered:
      'Aucune facture ne correspond à votre recherche ou à vos filtres.',
    emptyInitial:
      'Aucune facture n’a encore été émise pour cette année scolaire.',
    columns: {
      number: 'Numéro',
      student: 'Élève',
      classroom: 'Classe',
      installment: 'Tranche',
      total: 'Montant',
      paid: 'Réglé',
      balance: 'Solde',
      dueDate: 'Échéance',
      status: 'Statut',
      actions: 'Actions',
    },
    filters: {
      allStatuses: 'Tous les statuts',
      allClasses: 'Toutes les classes',
    },
  },

  invoice: {
    back: '← Retour aux factures',
    notFoundTitle: 'Facture introuvable',
    notFoundMessage: 'Cette facture n’existe pas ou a été supprimée.',
    backToList: 'Retour aux factures',
    linesTitle: 'Détail de la facture',
    paymentsTitle: 'Règlements',
    noPayment: 'Aucun règlement',
    noPaymentMessage: 'Aucun encaissement n’a encore été enregistré sur cette facture.',
    total: 'Total à régler',
    paid: 'Déjà réglé',
    pending: 'En attente de confirmation',
    balance: 'Solde restant',
    recordPayment: 'Enregistrer un règlement',
    print: 'Imprimer la facture',
    fields: {
      amount: 'Montant',
      amountHint: 'En francs CFA, sans décimale.',
      method: 'Moyen de paiement',
      receivedAt: 'Date de réception',
      providerReference: 'Référence de transaction',
      providerReferenceHint:
        'Identifiant fourni par l’opérateur Mobile Money, s’il est connu.',
      note: 'Observation',
    },
    providerNotice:
      'Un règlement Mobile Money est enregistré « en attente de confirmation ». Seul un webhook signé du prestataire pourra le confirmer — jamais cet écran.',
    deskNotice:
      'Encaissement constaté au guichet : il est confirmé immédiatement par l’agent qui le saisit.',
    toasts: {
      recorded: 'Règlement enregistré.',
      recordedPending:
        'Règlement enregistré, en attente de confirmation du prestataire.',
      cancelled: 'Facture annulée.',
    },
    cancelTitle: 'Annuler cette facture ?',
    cancelMessage: (number: string) =>
      `La facture ${number} passera au statut « Annulée ». Les règlements déjà encaissés restent visibles à des fins de traçabilité.`,
  },

  payments: {
    title: 'Paiements',
    description:
      'Journal des encaissements. Un règlement par prestataire reste en attente tant qu’il n’est pas confirmé côté serveur.',
    searchPlaceholder: 'Rechercher par référence, élève ou transaction...',
    tableTitle: 'Journal des encaissements',
    emptyTitle: 'Aucun paiement',
    emptyFiltered:
      'Aucun règlement ne correspond à votre recherche ou à vos filtres.',
    emptyInitial: 'Aucun encaissement n’a encore été enregistré.',
    columns: {
      reference: 'Référence',
      student: 'Élève',
      invoice: 'Facture',
      amount: 'Montant',
      method: 'Moyen',
      receivedAt: 'Reçu le',
      status: 'Statut',
    },
    filters: {
      allStatuses: 'Tous les statuts',
      allMethods: 'Tous les moyens',
    },
  },

  overdue: {
    title: 'Impayés',
    description:
      'Factures dont l’échéance est dépassée et le solde non soldé. Les familles concernées sont à relancer.',
    tableTitle: 'Factures en retard',
    emptyTitle: 'Aucun impayé',
    emptyMessage:
      'Toutes les factures échues ont été réglées. Rien à relancer pour l’instant.',
    stats: {
      count: 'Factures en retard',
      amount: 'Montant en souffrance',
      families: 'Familles concernées',
    },
    columns: {
      number: 'Facture',
      student: 'Élève',
      guardian: 'Tuteur à relancer',
      phone: 'Téléphone',
      balance: 'Solde dû',
      dueDate: 'Échéance dépassée',
      lateBy: 'Retard',
    },
    lateBy: (days: number) => `${days} jour${days > 1 ? 's' : ''}`,
    export: 'Exporter la liste',
    exported: (count: number) => `Export de ${count} impayés généré.`,
  },
} as const;
