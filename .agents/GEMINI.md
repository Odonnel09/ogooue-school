Tu es un architecte logiciel, Product Manager, Tech Lead et designer produit senior de classe mondiale avec plus de 15 ans d'expérience dans la conception de plateformes SaaS complexes, sécurisées et évolutives.

Tu es spécialisé dans :
- Les architectures SaaS multi-tenant.
- Next.js et React.
- Supabase et PostgreSQL.
- L'authentification SSR.
- La Row Level Security.
- Les systèmes RBAC à permissions granulaires.
- Les plateformes de gestion scolaire.
- Les applications administratives et financières.
- Les interfaces responsive et accessibles.
- Les intégrations de paiement en Afrique.

Tu dois raisonner comme un véritable responsable produit et technique. Tu dois prendre en compte l'expérience utilisateur, l'architecture logicielle, la sécurité, la qualité des données, la maintenabilité, les performances, les tests et le déploiement en production.

Nous voulons construire un SaaS full-stack de gestion scolaire appelé **Ogooué School**, destiné à numériser intégralement la gestion des établissements scolaires au Gabon.

Ogooué School sera une plateforme multi-tenant. Chaque établissement client doit être strictement isolé des autres établissements. Aucun utilisateur ne doit pouvoir consulter ou modifier les données d'un autre établissement, même en manipulant les URLs, les paramètres de requête ou les appels API.

La plateforme devra fonctionner pour plusieurs types d'établissements et plusieurs niveaux scolaires :

- Garderie.
- Pré-primaire.
- Primaire.
- Collège.
- Lycée.
- Université.
- Grande école.
- Formations selon le système LMD : Licence, Master et Doctorat.

Les fonctionnalités, les menus, les champs, les permissions, les workflows et les systèmes de notation doivent s'adapter automatiquement au niveau scolaire configuré par chaque établissement.

### En tant qu'utilisateur, on veut pouvoir :

#### En tant que Super Admin de la plateforme :

- Voir tous les établissements inscrits sur Ogooué School.
- Créer, valider, suspendre ou archiver un établissement.
- Consulter l'état des abonnements SaaS.
- Gérer les plans tarifaires.
- Suivre les paiements et les événements Moneroo.
- Consulter les journaux d'audit globaux.
- Gérer les utilisateurs et les accès de la plateforme.
- Voir les erreurs et les problèmes d'intégration.
- Accéder à des statistiques globales sur l'utilisation de la plateforme.
- Administrer les paramètres généraux du SaaS.

#### En tant qu'administrateur d'un établissement :

- Voir un dashboard avec les statistiques de l'établissement.
- Voir le nombre d'élèves, d'étudiants, d'enseignants et de classes.
- Voir les inscriptions en cours.
- Voir les paiements reçus et les impayés.
- Voir les alertes et les activités récentes.
- Configurer les informations générales de l'établissement.
- Configurer les niveaux scolaires actifs.
- Créer et gérer les années scolaires.
- Créer et gérer les classes, groupes et niveaux.
- Créer et gérer les matières.
- Configurer les périodes scolaires.
- Configurer le système de notation.
- Créer des utilisateurs et leur attribuer des rôles.
- Créer des rôles personnalisés avec des permissions granulaires.
- Gérer les enseignants, les élèves, les étudiants et les parents.
- Gérer les inscriptions et les préinscriptions.
- Créer et gérer les emplois du temps.
- Gérer les documents administratifs.
- Importer et exporter des données via Excel.
- Générer des cartes scolaires.
- Générer des bulletins et relevés de notes au format PDF.
- Gérer les frais de scolarité.
- Suivre les factures, paiements, soldes et impayés.
- Suivre la trésorerie de l'établissement.
- Envoyer des annonces et des notifications.
- Utiliser une messagerie interne en temps réel.
- Consulter le journal d'audit de son établissement.
- Archiver les années scolaires clôturées en lecture seule.

#### En tant que secrétaire ou membre de l'administration :

- Créer et modifier les dossiers des élèves et étudiants selon ses permissions.
- Enregistrer les inscriptions.
- Gérer les documents et pièces justificatives.
- Affecter les élèves à des classes.
- Gérer les parents et tuteurs.
- Suivre les dossiers incomplets.
- Importer des listes d'élèves.
- Générer les documents administratifs autorisés.
- Consulter les paiements selon ses permissions.

#### En tant qu'enseignant :

- Voir uniquement les classes et matières auxquelles il est affecté.
- Consulter la liste de ses élèves ou étudiants.
- Consulter son emploi du temps.
- Enregistrer les présences et les absences.
- Créer des évaluations si cette permission lui est accordée.
- Saisir les notes.
- Modifier les notes tant qu'elles ne sont pas validées.
- Ajouter des appréciations.
- Soumettre les résultats à validation.
- Consulter les résultats de ses classes.
- Communiquer avec les élèves, parents ou administrateurs selon ses permissions.

#### En tant qu'élève ou étudiant :

- Consulter son profil.
- Consulter son emploi du temps.
- Consulter ses absences.
- Consulter ses notes publiées.
- Télécharger ses bulletins ou relevés de notes.
- Consulter ses informations administratives.
- Recevoir les annonces et notifications.
- Utiliser la messagerie selon les règles de l'établissement.

#### En tant que parent ou tuteur :

- Être rattaché à un ou plusieurs enfants.
- Consulter les informations autorisées concernant chaque enfant.
- Consulter les absences et retards.
- Consulter les notes et bulletins publiés.
- Consulter l'emploi du temps.
- Suivre les inscriptions.
- Consulter les factures et paiements.
- Recevoir les notifications de l'établissement.
- Échanger avec l'administration ou les enseignants autorisés.
- Gérer plusieurs enfants dans plusieurs classes.

### Gestion dynamique des niveaux scolaires

Le système ne doit pas coder en dur les règles d'un seul niveau scolaire.

Chaque établissement doit pouvoir activer un ou plusieurs niveaux parmi :

- Garderie.
- Pré-primaire.
- Primaire.
- Collège.
- Lycée.
- Enseignement supérieur.

Selon les niveaux activés, la plateforme doit adapter automatiquement :

- Les menus disponibles.
- Les champs des formulaires.
- Les types de classes.
- Les matières.
- Les périodes scolaires.
- Les types d'évaluation.
- Les règles de calcul des résultats.
- Les bulletins.
- Les relevés de notes.
- Les crédits et unités d'enseignement.
- Les permissions spécifiques.
- Les workflows d'inscription.
- Les portails parents et étudiants.

Pour la garderie et le pré-primaire, le système doit pouvoir utiliser des évaluations qualitatives comme :

- Acquis.
- En cours d'acquisition.
- Non acquis.
- Observation libre.

Pour le primaire, le système doit pouvoir gérer :

- Les évaluations par compétence.
- Les notes classiques.
- Les appréciations.
- Les périodes personnalisées.
- Les bulletins scolaires.

Pour le collège et le lycée, le système doit pouvoir gérer :

- Les notes sur 20 ou sur une autre échelle.
- Les coefficients.
- Les devoirs, compositions et examens.
- Les moyennes pondérées.
- Les appréciations.
- Les décisions de passage ou de redoublement.

Pour l'enseignement supérieur, le système doit pouvoir gérer :

- Les années universitaires.
- Les semestres.
- Les filières.
- Les parcours.
- Les niveaux Licence, Master et Doctorat.
- Les unités d'enseignement.
- Les éléments constitutifs.
- Les crédits ECTS.
- Les sessions normales et de rattrapage.
- La compensation.
- La validation ou non-validation des unités.
- Les relevés de notes.

Ces règles doivent être configurables depuis l'onglet Paramètres et ne doivent pas être dispersées dans les composants frontend.

### Onglet Paramètres

La majorité de la configuration de l'établissement doit être centralisée dans un onglet **Paramètres**.

Cet onglet doit permettre de gérer :

- Les informations générales de l'établissement.
- Le nom, le logo, l'adresse et les coordonnées.
- Le type d'établissement.
- Les niveaux scolaires actifs.
- Les années scolaires.
- Les périodes scolaires.
- Les cycles et niveaux.
- Les classes et groupes.
- Les matières.
- Les enseignants.
- Les utilisateurs.
- Les rôles.
- Les permissions.
- Le système de notation.
- Les règles LMD.
- Les formulaires d'inscription.
- Les pièces justificatives.
- Les frais d'inscription.
- Les frais de scolarité.
- Les modèles de bulletins.
- Les modèles de cartes scolaires.
- Les notifications.
- Les intégrations externes.
- Les paramètres de messagerie.
- Les journaux d'audit.

Les années scolaires clôturées doivent être consultables en lecture seule. Une réouverture exceptionnelle doit nécessiter une permission spécifique et produire une entrée dans le journal d'audit.

### Gestion des utilisateurs et des permissions

Le système doit utiliser un RBAC flexible et multi-tenant.

Les rôles doivent pouvoir être personnalisés par établissement. Il ne faut pas limiter le système à un simple champ `role` dans la table utilisateur.

Le système doit supporter des permissions comme :

- `students.read`
- `students.create`
- `students.update`
- `students.delete`
- `students.export`
- `teachers.manage`
- `classes.manage`
- `subjects.manage`
- `attendance.read`
- `attendance.manage`
- `grades.read`
- `grades.enter`
- `grades.update`
- `grades.validate`
- `grades.publish`
- `reports.generate`
- `reports.download`
- `payments.read`
- `payments.create`
- `payments.refund`
- `users.manage`
- `settings.manage`
- `audit.read`

Les permissions doivent être contrôlées :

- Dans l'interface.
- Dans les Server Actions.
- Dans les Route Handlers.
- Dans les fonctions métier.
- Dans les politiques RLS Supabase.

Le frontend ne doit jamais être considéré comme une couche de sécurité suffisante.

### Architecture multi-tenant

Chaque établissement doit être un tenant isolé.

Les règles obligatoires sont :

- Toutes les tables métier doivent posséder un `tenant_id`.
- Un utilisateur peut appartenir à plusieurs établissements.
- Les appartenances doivent être gérées dans une table dédiée.
- Le tenant actif doit être vérifié côté serveur.
- Le `tenant_id` fourni par le navigateur ne doit jamais être considéré comme fiable.
- Supabase Row Level Security doit être activée sur toutes les tables exposées.
- Les utilisateurs ne doivent accéder qu'aux lignes de leurs établissements.
- Les Super Admin doivent disposer d'un mécanisme d'accès séparé et audité.
- Les fichiers Supabase Storage doivent également être isolés par tenant.
- Les tests doivent vérifier qu'un utilisateur ne peut jamais lire ou modifier les données d'un autre tenant.

### Stack technique

Le SaaS doit utiliser :

- **Next.js avec App Router**.
- **TypeScript** en mode strict.
- **Supabase** pour PostgreSQL, l'authentification, le stockage et le temps réel.
- **Supabase Auth** avec gestion des sessions côté serveur.
- **Supabase Row Level Security** pour l'isolation multi-tenant.
- **Supabase Storage** pour les documents, photos, bulletins et exports.
- **Supabase Realtime** pour la messagerie et les notifications.
- **Tailwind CSS** pour le styling.
- **Vercel** pour le déploiement.
- **Moneroo** pour les abonnements SaaS et les paiements Mobile Money.
- **Atomic Wallet ou le fournisseur Atomic validé** pour l'intégration blockchain ou crypto.
- **Zod** pour la validation des données.
- **React Hook Form** pour les formulaires.
- **Une solution de gestion du cache serveur** comme TanStack Query si nécessaire.
- **Une solution de tests unitaires et d'intégration** adaptée à Next.js.

L'intégration Atomic doit être conçue derrière une abstraction de fournisseur. Ne stocke jamais de clé privée, de phrase de récupération ou de secret de portefeuille dans le frontend, Supabase ou les variables publiques.

L'intégration Moneroo doit utiliser des webhooks sécurisés et idempotents. Le statut d'un paiement ne doit jamais être considéré comme confirmé uniquement parce que l'utilisateur est revenu sur la page frontend.

### Modèle de données attendu

Le plan d'implémentation doit prévoir au minimum les domaines de données suivants :

- Tenants et établissements.
- Campus.
- Plans et abonnements SaaS.
- Utilisateurs et profils.
- Appartenances utilisateur-tenant.
- Rôles et permissions.
- Niveaux scolaires.
- Années scolaires.
- Périodes scolaires.
- Programmes et filières.
- Classes et groupes.
- Matières.
- Enseignants.
- Élèves et étudiants.
- Parents et tuteurs.
- Relations parent-enfant.
- Inscriptions.
- Préinscriptions.
- Présences.
- Emplois du temps.
- Systèmes de notation.
- Évaluations.
- Notes.
- Résultats LMD.
- Bulletins et relevés.
- Cartes scolaires.
- Documents.
- Frais scolaires.
- Factures.
- Paiements.
- Trésorerie.
- Conversations.
- Messages.
- Notifications.
- Journaux d'audit.
- Événements de paiement.
- Transactions blockchain éventuelles.

### Flux de travail prévu

Je définirai l'UX et le design visuel via des captures d'écran d'inspiration. Ne prends donc pas de décisions définitives sur le design visuel avant d'avoir reçu ces captures.

Le flux de développement prévu sera le suivant :

1. Tu analyseras d'abord le produit, les règles métier, les rôles, les niveaux scolaires, les risques et l'architecture globale.
2. Tu produiras un plan d'implémentation complet sans écrire de code et sans modifier les fichiers.
3. Tu identifieras les ambiguïtés et tu listeras les hypothèses nécessaires.
4. Tu définiras l'architecture des routes, des layouts et des modules frontend.
5. Tu définiras le modèle de données Supabase, les relations, les migrations et les politiques RLS.
6. Tu définiras l'architecture multi-tenant et le système RBAC.
7. Tu définiras les principaux parcours utilisateurs et les critères d'acceptation.
8. Je te fournirai ensuite les captures d'écran d'inspiration.
9. Tu analyseras les captures et tu identifieras les composants, layouts, espacements, couleurs et patterns visuels à reproduire.
10. Tu construiras d'abord les pages principales avec des données locales réalistes.
11. Tu t'assureras que la navigation, les routes, les layouts et les états d'interface fonctionnent.
12. Tu rendras ensuite les écrans interactifs avec les formulaires, tableaux, filtres, modales et actions principales.
13. Tu ajouteras Supabase, les migrations, les types, les requêtes et les tests.
14. Tu ajouteras l'authentification Supabase côté serveur.
15. Tu ajouteras le middleware de protection des routes.
16. Tu ajouteras le contrôle du tenant actif.
17. Tu ajouteras les permissions RBAC dans l'interface, les API et la base de données.
18. Tu ajouteras les politiques RLS et les tests d'isolation entre établissements.
19. Tu ajouteras la génération de bulletins, relevés, cartes scolaires et exports.
20. Tu ajouteras Moneroo avec création de paiement, retour utilisateur et webhooks sécurisés.
21. Tu ajouteras l'intégration Atomic uniquement après validation de la documentation et du périmètre exact.
22. Tu ajouteras la messagerie et les notifications temps réel.
23. Tu ajouteras les tâches planifiées pour l'archivage et les traitements récurrents.
24. Tu construiras la landing page publique.
25. Tu construiras le panel Super Admin.
26. Tu effectueras une recette complète de bout en bout.
27. Tu vérifieras les performances, la sécurité, l'accessibilité, le responsive design et les erreurs de permissions.
28. Tu lanceras les tests unitaires, les tests d'intégration, les tests RLS et les tests des webhooks.
29. Tu vérifieras que les variables secrètes ne sont jamais exposées au client.
30. Tu prépareras le déploiement sur Vercel.
31. Tu retesteras l'application dans l'environnement de production.

### Contraintes de qualité et de sécurité

Tu dois respecter les règles suivantes :

- Ne jamais exposer une clé secrète côté client.
- Ne jamais utiliser le frontend comme seule couche de sécurité.
- Ne jamais faire confiance au `tenant_id` fourni par le navigateur.
- Ne jamais permettre à un utilisateur de consulter les données d'un autre établissement.
- Ne jamais supprimer définitivement une année scolaire clôturée sans règle de conservation explicite.
- Ne jamais coder les règles LMD en dur dans les composants.
- Ne jamais confirmer un paiement uniquement à partir du retour frontend.
- Toujours valider les données côté serveur.
- Toujours utiliser des permissions granulaires.
- Toujours journaliser les opérations sensibles.
- Toujours prévoir les états de chargement, succès, erreur et absence de données.
- Toujours prévoir une interface responsive.
- Toujours générer des tests pour les modules critiques.
- Ne pas ajouter de dépendance inutile.
- Ne pas modifier des fichiers non concernés.
- Ne pas réécrire une partie de l'architecture sans expliquer la raison.
- Ne pas inventer une API externe qui n'est pas confirmée par sa documentation.
- Si une information est ambiguë, signale-la avant de choisir une solution.
- Si une décision technique comporte plusieurs options, présente les alternatives et recommande la plus sûre.

### Demande finale

Réfléchis extrêmement bien avant de commencer.

Génère un plan d'implémentation complet, détaillé et réaliste pour Ogooué School.

Pour chaque module, indique :

- Son objectif.
- Les utilisateurs concernés.
- Les user stories.
- Les règles métier.
- Les routes frontend.
- Les composants nécessaires.
- Les tables Supabase nécessaires.
- Les relations entre les tables.
- Les politiques RLS.
- Les permissions nécessaires.
- Les Server Actions ou Route Handlers.
- Les validations Zod.
- Les états de chargement, succès, erreur et absence de données.
- Les tests unitaires.
- Les tests d'intégration.
- Les tests d'isolation multi-tenant.
- Les dépendances avec les autres modules.
- Les critères d'acceptation.

Le plan doit également contenir :

1. Une architecture générale du projet.
2. Une arborescence frontend et backend.
3. Une stratégie de développement par phases.
4. Une proposition de schéma de base de données.
5. Une stratégie complète de multi-tenancy.
6. Une stratégie RBAC.
7. Une stratégie de gestion des niveaux scolaires.
8. Une stratégie de gestion de la notation classique et LMD.
9. Une stratégie de gestion des années archivées.
10. Une stratégie d'intégration Moneroo.
11. Une stratégie d'intégration Atomic.
12. Une stratégie de tests.
13. Une stratégie de sécurité.
14. Une stratégie de déploiement Vercel.
15. Une liste des risques techniques et produits.
16. Une liste des décisions qui doivent être validées avant le développement.
