/** Libellés des écrans d'authentification. */
export const authMessages = {
  brand: {
    tagline: 'La gestion scolaire, du préscolaire au supérieur.',
    points: [
      'Inscriptions, présences, notes et bulletins au même endroit.',
      'Frais de scolarité suivis en francs CFA, à l’unité près.',
      'Un compte, plusieurs établissements, un rôle par établissement.',
    ],
  },

  mockNotice:
    'Maquette d’interface : aucune authentification réelle n’est branchée. Les identifiants saisis ne quittent pas cette page.',

  login: {
    title: 'Connexion',
    description: 'Accédez à l’espace de votre établissement.',
    fields: {
      email: 'Adresse électronique',
      password: 'Mot de passe',
      remember: 'Rester connecté sur cet appareil',
      rememberHint:
        'À éviter sur un poste partagé — au secrétariat notamment.',
    },
    submit: 'Se connecter',
    forgot: 'Mot de passe oublié ?',
    /** Message volontairement générique : voir la note d'énumération. */
    failed: 'Adresse électronique ou mot de passe incorrect.',
    showPassword: 'Afficher le mot de passe',
    hidePassword: 'Masquer le mot de passe',
    noEnumerationNotice:
      'Le message d’erreur ne dit jamais si l’adresse existe : l’indiquer permettrait de dresser la liste des comptes de l’établissement.',
  },

  forgot: {
    title: 'Mot de passe oublié',
    description:
      'Indiquez votre adresse électronique : un lien de réinitialisation vous sera envoyé.',
    fields: { email: 'Adresse électronique' },
    submit: 'Envoyer le lien',
    back: '← Revenir à la connexion',
    sentTitle: 'Vérifiez votre boîte de réception',
    /** Formulation neutre : elle ne révèle pas l'existence du compte. */
    sentMessage:
      'Si un compte est associé à cette adresse, un lien de réinitialisation vient d’être envoyé. Le lien expire au bout d’une heure.',
    resend: 'Renvoyer le lien',
    spamHint:
      'Sans nouvelle après quelques minutes, pensez à regarder dans les courriers indésirables.',
  },

  reset: {
    title: 'Nouveau mot de passe',
    description: 'Choisissez un mot de passe que vous n’utilisez nulle part ailleurs.',
    fields: {
      password: 'Nouveau mot de passe',
      confirmation: 'Confirmer le mot de passe',
    },
    strength: 'Robustesse',
    submit: 'Enregistrer le mot de passe',
    doneTitle: 'Mot de passe modifié',
    doneMessage:
      'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe. Les autres sessions ouvertes ont été fermées.',
    toLogin: 'Aller à la connexion',
    invalidTitle: 'Lien invalide ou expiré',
    invalidMessage:
      'Ce lien de réinitialisation n’est plus valable. Demandez-en un nouveau depuis la page « Mot de passe oublié ».',
    request: 'Demander un nouveau lien',
    tokenNotice:
      'Le jeton présent dans l’adresse vaut preuve d’identité à lui seul : il est à usage unique, expire vite, et n’est vérifié que côté serveur.',
  },

  invite: {
    title: 'Invitation à rejoindre un établissement',
    description: 'Vérifiez les informations avant d’accepter.',
    establishment: 'Établissement',
    role: 'Rôle proposé',
    invitedBy: 'Invitation émise par',
    accept: 'Accepter l’invitation',
    decline: 'Refuser',
    acceptedTitle: 'Invitation acceptée',
    acceptedMessage: (name: string) =>
      `Votre rattachement à ${name} a été enregistré. L’accès s’ouvre dès que le serveur a confirmé l’appartenance.`,
    declinedTitle: 'Invitation refusée',
    declinedMessage:
      'L’invitation a été déclinée. L’établissement en est informé ; vous pouvez être réinvité plus tard.',
    unknownTitle: 'Invitation introuvable',
    unknownMessage:
      'Ce lien d’invitation n’est pas reconnu. Il a peut-être déjà été utilisé, ou son délai est dépassé.',
    permissionsTitle: 'Ce que ce rôle permet',
    serverNotice:
      'Accepter une invitation crée un rattachement : l’écriture a lieu côté serveur, jamais depuis le navigateur.',
  },

  select: {
    title: 'Choisir un établissement',
    description:
      'Votre compte est rattaché à plusieurs établissements. Le rôle change avec l’établissement.',
    open: 'Ouvrir',
    pending: 'Invitation en attente',
    review: 'Examiner l’invitation',
    emptyTitle: 'Aucun établissement',
    emptyMessage:
      'Votre compte n’est rattaché à aucun établissement. Demandez une invitation à un administrateur.',
    logout: 'Se déconnecter',
  },
} as const;
