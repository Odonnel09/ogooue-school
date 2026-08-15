import type {
  AcademicYearStatus,
  AnnouncementAudience,
  AnnouncementStatus,
  AttendanceStatus,
  ClassStatus,
  Cycle,
  EnrollmentStatus,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  ReportCardStatus,
  EvaluationStatus,
  EvaluationType,
  Gender,
  GradingKind,
  GradingScale,
  GuardianRelation,
  GuardianStatus,
  PeriodKind,
  ContractType,
  ScheduleStatus,
  StudentStatus,
  SubjectStatus,
  TeacherStatus,
  Weekday,
} from '@/types';
import type { Permission } from '@/lib/auth/permissions';
import type {
  ClassTaxonomy,
  MenuKey,
  StudentFieldKey,
} from '@/lib/school-levels/capabilities';
import type { DecisionKind } from '@/lib/grading/types';

/**
 * Dictionnaire français des libellés partagés.
 *
 * Il couvre les énumérations, la navigation et les chaînes des primitives
 * d'interface — tout ce qui est réutilisé à plusieurs endroits. Les libellés
 * propres à un module vivent dans `features/<module>/messages.ts`, afin
 * d'éviter un cycle d'imports entre ce fichier et les features.
 *
 * v1 français uniquement : pas de bibliothèque i18n runtime, conformément à la
 * règle « ne pas ajouter de dépendance inutile ».
 */

export const cycleLabels: Record<Cycle, string> = {
  garderie: 'Garderie',
  prescolaire: 'Pré-primaire',
  primaire: 'Primaire',
  college: 'Collège',
  lycee: 'Lycée',
  superieur: 'Supérieur',
};

export const cycleDescriptions: Record<Cycle, string> = {
  garderie: 'Accueil des tout-petits, suivi par observations.',
  prescolaire: 'Petite, moyenne et grande section.',
  primaire: 'Du CP1 au CM2, évaluation par compétences.',
  college: 'De la 6ème à la 3ème, notes et coefficients.',
  lycee: 'De la Seconde à la Terminale, notes et coefficients.',
  superieur: 'Licence, Master et Doctorat — système LMD.',
};

export const genderLabels: Record<Gender, string> = {
  M: 'Masculin',
  F: 'Féminin',
};

export const gradingKindLabels: Record<GradingKind, string> = {
  qualitative: 'Appréciations qualitatives',
  competency: 'Évaluation par compétences',
  numeric_weighted: 'Notes pondérées par coefficient',
  lmd: 'Système LMD (crédits ECTS)',
};

export const gradingScaleLabels: Record<GradingScale, string> = {
  sur_20: 'Note sur 20',
  sur_10: 'Note sur 10',
  pourcentage: 'Pourcentage',
  acquis: 'Acquis / Non acquis',
  competence: 'Niveau de compétence',
  personnalise: 'Échelle personnalisée',
  ects: 'Note sur 20 (crédits ECTS)',
};

export const periodKindLabels: Record<PeriodKind, string> = {
  trimestre: 'Trimestre',
  semestre: 'Semestre',
  sequence: 'Séquence',
  personnalise: 'Période personnalisée',
};

export const academicYearStatusLabels: Record<AcademicYearStatus, string> = {
  draft: 'En préparation',
  active: 'En cours',
  closed: 'Clôturée',
  archived: 'Archivée',
};

export const classTaxonomyLabels: Record<ClassTaxonomy, string> = {
  classe: 'Classe',
  groupe: 'Groupe',
  promotion: 'Promotion',
};

export const studentStatusLabels: Record<StudentStatus, string> = {
  actif: 'Actif',
  en_attente: 'En attente',
  transfere: 'Transféré',
  archive: 'Archivé',
};

export const guardianStatusLabels: Record<GuardianStatus, string> = {
  actif: 'Actif',
  archive: 'Archivé',
};

export const guardianRelationLabels: Record<GuardianRelation, string> = {
  pere: 'Père',
  mere: 'Mère',
  tuteur: 'Tuteur légal',
  oncle: 'Oncle',
  tante: 'Tante',
  grand_parent: 'Grand-parent',
  autre: 'Autre',
};

export const enrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  brouillon: 'Brouillon',
  soumise: 'Soumise',
  incomplete: 'Dossier incomplet',
  validee: 'Validée',
  refusee: 'Refusée',
  inscrite: 'Inscrite',
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  brouillon: 'Brouillon',
  emise: 'Émise',
  partielle: 'Partiellement réglée',
  payee: 'Réglée',
  en_retard: 'En retard',
  annulee: 'Annulée',
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  en_attente: 'En attente de confirmation',
  confirme: 'Confirmé',
  echoue: 'Échoué',
  rembourse: 'Remboursé',
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  especes: 'Espèces',
  mobile_money: 'Mobile Money',
  virement: 'Virement bancaire',
  cheque: 'Chèque',
};

export const reportStatusLabels: Record<ReportCardStatus, string> = {
  brouillon: 'Non généré',
  genere: 'Généré',
  publie: 'Publié',
};

export const teacherStatusLabels: Record<TeacherStatus, string> = {
  actif: 'Actif',
  conge: 'En congé',
  suspendu: 'Suspendu',
  archive: 'Archivé',
};

export const contractTypeLabels: Record<ContractType, string> = {
  permanent: 'Permanent',
  contractuel: 'Contractuel',
  vacataire: 'Vacataire',
  stagiaire: 'Stagiaire',
};

export const classStatusLabels: Record<ClassStatus, string> = {
  active: 'Active',
  en_preparation: 'En préparation',
  archivee: 'Archivée',
};

export const subjectStatusLabels: Record<SubjectStatus, string> = {
  active: 'Active',
  archivee: 'Archivée',
};

export const scheduleStatusLabels: Record<ScheduleStatus, string> = {
  brouillon: 'Brouillon',
  valide: 'Validé',
};

export const weekdayLabels: Record<Weekday, string> = {
  lundi: 'Lundi',
  mardi: 'Mardi',
  mercredi: 'Mercredi',
  jeudi: 'Jeudi',
  vendredi: 'Vendredi',
  samedi: 'Samedi',
};

export const attendanceStatusLabels: Record<AttendanceStatus, string> = {
  present: 'Présent',
  absent: 'Absent',
  retard: 'En retard',
};

export const evaluationTypeLabels: Record<EvaluationType, string> = {
  observation: 'Observation',
  bilan_periodique: 'Bilan périodique',
  evaluation_competence: 'Évaluation de compétence',
  devoir: 'Devoir',
  controle: 'Contrôle',
  composition: 'Composition',
  examen: 'Examen',
  oral: 'Oral',
  tp: 'Travaux pratiques',
  projet: 'Projet',
  controle_continu: 'Contrôle continu',
  rattrapage: 'Rattrapage',
  autre: 'Autre',
};

export const evaluationStatusLabels: Record<EvaluationStatus, string> = {
  draft: 'Brouillon',
  in_progress: 'Saisie en cours',
  submitted: 'En attente de validation',
  validated: 'Validée',
  published: 'Publiée',
};

export const announcementStatusLabels: Record<AnnouncementStatus, string> = {
  brouillon: 'Brouillon',
  programmee: 'Programmée',
  publiee: 'Publiée',
  archivee: 'Archivée',
};

export const audienceLabels: Record<AnnouncementAudience, string> = {
  tous: 'Tous les utilisateurs',
  parents: 'Parents',
  eleves: 'Élèves',
  etudiants: 'Étudiants',
  enseignants: 'Enseignants',
  administration: 'Administration',
  classe: 'Une classe spécifique',
};

export const decisionLabels: Record<DecisionKind, string> = {
  admis: 'Admis',
  admis_par_compensation: 'Admis par compensation',
  rattrapage: 'Rattrapage',
  redouble: 'Redouble',
  non_evalue: 'Non évalué',
};

export const studentFieldLabels: Record<StudentFieldKey, string> = {
  birthPlace: 'Lieu de naissance',
  nationality: 'Nationalité',
  address: 'Adresse',
  guardian: 'Parent ou tuteur',
  authorizedPickup: 'Personne autorisée à récupérer l’enfant',
  medicalInfo: 'Informations médicales',
  previousSchool: 'Établissement précédent',
  academicTrack: 'Filière et parcours',
};

export const navLabels: Record<MenuKey, string> = {
  dashboard: 'Tableau de bord',
  students: 'Élèves',
  enrollments: 'Inscriptions',
  guardians: 'Parents & tuteurs',
  teachers: 'Enseignants',
  classes: 'Classes',
  subjects: 'Matières',
  timetable: 'Emploi du temps',
  attendance: 'Présences',
  evaluations: 'Évaluations',
  reports: 'Bulletins',
  finance: 'Finances',
  documents: 'Documents',
  library: 'Bibliothèque',
  announcements: 'Annonces',
  messages: 'Messagerie',
  audit: 'Journal d’audit',
  settings: 'Paramètres',
  account: 'Compte',
};

export const permissionLabels: Record<Permission, string> = {
  'students.read': 'Consulter les élèves',
  'students.create': 'Créer un élève',
  'students.update': 'Modifier un élève',
  'students.delete': 'Supprimer un élève',
  'students.export': 'Exporter les élèves',
  'teachers.manage': 'Gérer les enseignants',
  'classes.manage': 'Gérer les classes',
  'subjects.manage': 'Gérer les matières',
  'attendance.read': 'Consulter les présences',
  'attendance.manage': 'Saisir les présences',
  'grades.read': 'Consulter les notes',
  'grades.enter': 'Saisir les notes',
  'grades.update': 'Corriger une note validée',
  'grades.validate': 'Valider les notes',
  'grades.publish': 'Publier les résultats',
  'reports.generate': 'Générer les bulletins',
  'reports.download': 'Télécharger les bulletins',
  'payments.read': 'Consulter les paiements',
  'payments.create': 'Enregistrer un paiement',
  'payments.refund': 'Rembourser un paiement',
  'users.manage': 'Gérer les utilisateurs',
  'settings.manage': 'Administrer les paramètres',
  'audit.read': 'Consulter le journal d’audit',
};

/** Chaînes des primitives d'interface et libellés d'accessibilité. */
export const ui = {
  brand: 'Ogooué School',
  search: 'Rechercher...',
  searchGlobal: 'Rechercher un élève, une classe...',
  openMenu: 'Ouvrir le menu',
  closeMenu: 'Fermer le menu',
  close: 'Fermer',
  cancel: 'Annuler',
  confirm: 'Confirmer',
  save: 'Enregistrer',
  edit: 'Modifier',
  view: 'Voir',
  delete: 'Supprimer',
  archive: 'Archiver',
  restore: 'Réactiver',
  actions: 'Actions',
  filters: 'Filtres',
  resetFilters: 'Réinitialiser',
  clearSearch: 'Effacer la recherche',
  notifications: 'Notifications',
  messages: 'Messages',
  accountMenu: 'Menu du compte',
  breadcrumb: 'Fil d’Ariane',
  selectAll: 'Tout sélectionner',
  noSelection: 'Aucune sélection',
  noOption: 'Aucune option disponible.',
  results: (count: number) => `${count} résultat${count > 1 ? 's' : ''}`,
  activeFilters: (count: number) =>
    `${count} filtre${count > 1 ? 's' : ''} actif${count > 1 ? 's' : ''}`,
  errorTitle: 'Une erreur est survenue',
  errorMessage:
    'La page n’a pas pu être affichée. Réessayez ; si le problème persiste, contactez l’administrateur de la plateforme.',
  retry: 'Réessayer',
  requiredField: 'Champ obligatoire',
  invalidForm: 'Certains champs sont invalides. Vérifiez le formulaire.',
  readOnlyYear: (year: string) =>
    `L’année ${year} est clôturée : la consultation est possible, toute modification est bloquée.`,
  demoRoleNotice: 'Rôle de démonstration — la sécurité réelle est côté serveur.',
} as const;
