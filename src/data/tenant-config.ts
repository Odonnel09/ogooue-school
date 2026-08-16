import type {
  Cycle,
  DocumentTemplate,
  FeeSchedule,
  Period,
  SignatureConfig,
} from '@/types';
import { EMPTY_ASSET, EMPTY_SIGNATURE } from '@/types';
import { CYCLES } from '@/types';
import { LEVEL_CAPABILITIES } from '@/lib/school-levels/capabilities';
import { SCALES } from '@/lib/grading/scales';
import type { GradingConfig } from '@/lib/grading/types';
import {
  DEFAULT_MESSAGING_RULES,
  type MessagingRules,
} from '@/lib/messaging/policy';
import { DEFAULT_PERIODS } from './academic';

/**
 * CONFIGURATION DE L'ÉTABLISSEMENT — éditée depuis Paramètres.
 *
 * C'est de cet objet que dérivent les menus, les champs de formulaire, les
 * types d'évaluation proposés et les règles de calcul. Désactiver un cycle ici
 * modifie l'application entière sans qu'une ligne de code ne change.
 *
 * REMPLACEMENT SUPABASE : `tenants.settings` + `tenant_school_levels`.
 */
export interface TenantProfile {
  name: string;
  shortName: string;
  type: string;
  director: string;
  address: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  /** Emoji ou URL — l'upload réel arrivera avec Supabase Storage. */
  logo: string;
  currency: 'XAF';
  timezone: string;
}

export interface TenantConfig {
  profile: TenantProfile;
  /** Cycles ouverts dans l'établissement. Pilote les menus et les formulaires. */
  activeCycles: Cycle[];
  /** Une configuration de notation par cycle. */
  gradingSystems: Record<Cycle, GradingConfig>;
  periods: Period[];
  enrollment: {
    requiredDocuments: string[];
    /** Une préinscription doit-elle être validée par l'administration ? */
    requiresApproval: boolean;
  };
  /** Grilles tarifaires — alimentent la facturation du module Finances. */
  feeSchedules: FeeSchedule[];
  /** Gabarits des documents édités par l'établissement. */
  templates: {
    report: DocumentTemplate;
    card: DocumentTemplate;
  };
  /** Signature du chef d'établissement, apposée sur les bulletins. */
  signature: SignatureConfig;
  /** Règles d'échange de la messagerie interne. */
  messaging: MessagingRules;
}

/** Configuration de notation par défaut, déduite de la matrice de capacités. */
function defaultGradingConfig(cycle: Cycle): GradingConfig {
  const capabilities = LEVEL_CAPABILITIES[cycle];
  const scale = capabilities.gradingScales[0];

  return {
    kind: capabilities.gradingKind,
    scale,
    maxScore: SCALES[scale].defaultMax,
    rounding: 'round_half_up',
    absencePolicy: 'exclude',
    passMark: 10,
    weights: {},
    mentions: [
      { label: 'Excellent', min: 16 },
      { label: 'Très bien', min: 14 },
      { label: 'Bien', min: 12 },
      { label: 'Assez bien', min: 10 },
    ],
    compensation: capabilities.hasCompensation,
    sessions: capabilities.hasSessions,
    resitThreshold: 7,
  };
}

function defaultGradingSystems(): Record<Cycle, GradingConfig> {
  return CYCLES.reduce(
    (accumulator, cycle) => {
      accumulator[cycle] = defaultGradingConfig(cycle);
      return accumulator;
    },
    {} as Record<Cycle, GradingConfig>,
  );
}

/**
 * Grilles tarifaires livrées par défaut, en francs CFA entiers.
 * Elles se règlent depuis Paramètres → Frais de scolarité.
 */
const DEFAULT_FEE_SCHEDULES: FeeSchedule[] = [
  {
    id: 'fee-college',
    label: 'Collège — 6ème à 3ème',
    levelIds: ['6eme', '5eme', '4eme', '3eme'],
    academicYear: '2026-2027',
    items: [
      { id: 'fee-college-insc', label: 'Frais d’inscription', amount: 45000, mandatory: true },
      { id: 'fee-college-scol', label: 'Scolarité annuelle', amount: 420000, mandatory: true },
      { id: 'fee-college-four', label: 'Fournitures et manuels', amount: 60000, mandatory: true },
      { id: 'fee-college-cant', label: 'Cantine (facultatif)', amount: 180000, mandatory: false },
    ],
    installments: [
      { id: 'inst-college-1', label: '1ère tranche', percent: 40, dueDate: '2026-09-30' },
      { id: 'inst-college-2', label: '2ème tranche', percent: 30, dueDate: '2026-11-30' },
      { id: 'inst-college-3', label: '3ème tranche', percent: 30, dueDate: '2027-02-28' },
    ],
  },
  {
    id: 'fee-lycee',
    label: 'Lycée — Seconde à Terminale',
    levelIds: ['seconde', 'premiere', 'terminale'],
    academicYear: '2026-2027',
    items: [
      { id: 'fee-lycee-insc', label: 'Frais d’inscription', amount: 55000, mandatory: true },
      { id: 'fee-lycee-scol', label: 'Scolarité annuelle', amount: 520000, mandatory: true },
      { id: 'fee-lycee-four', label: 'Fournitures et manuels', amount: 75000, mandatory: true },
      { id: 'fee-lycee-labo', label: 'Frais de laboratoire', amount: 35000, mandatory: true },
      { id: 'fee-lycee-cant', label: 'Cantine (facultatif)', amount: 180000, mandatory: false },
    ],
    installments: [
      { id: 'inst-lycee-1', label: '1ère tranche', percent: 40, dueDate: '2026-09-30' },
      { id: 'inst-lycee-2', label: '2ème tranche', percent: 30, dueDate: '2026-11-30' },
      { id: 'inst-lycee-3', label: '3ème tranche', percent: 30, dueDate: '2027-02-28' },
    ],
  },
];

/** Gabarit livré par défaut : sobre, sans image, aux couleurs de la marque. */
function defaultTemplate(title: string): DocumentTemplate {
  return {
    kind: 'composed',
    background: EMPTY_ASSET,
    backgroundOpacity: 12,
    logo: EMPTY_ASSET,
    stamp: EMPTY_ASSET,
    accentColor: '#7c3aed',
    documentTitle: title,
    footerText: '',
    columns: ['teacher', 'coefficient', 'classAverage', 'lowest', 'best'],
    referenceFile: EMPTY_ASSET,
  };
}

export const DEFAULT_TENANT_CONFIG: TenantConfig = {
  profile: {
    name: 'Complexe Scolaire Ogooué',
    shortName: 'CS Ogooué',
    type: 'Établissement privé conventionné',
    director: 'M. Ndong Mba',
    address: 'Boulevard Triomphal, BP 4021',
    city: 'Libreville',
    country: 'Gabon',
    email: 'contact@complexe-ogooue.ga',
    phone: '+241 11 44 22 10',
    logo: '🎓',
    currency: 'XAF',
    timezone: 'Africa/Libreville',
  },
  /**
   * L'établissement de démonstration ouvre le collège et le lycée — le
   * périmètre v1. Activer « superieur » depuis Paramètres fait apparaître les
   * champs UE / ECUE / crédits ECTS et les semestres, sans redéploiement.
   */
  activeCycles: ['college', 'lycee'],
  gradingSystems: defaultGradingSystems(),
  periods: DEFAULT_PERIODS,
  feeSchedules: DEFAULT_FEE_SCHEDULES,
  templates: {
    report: defaultTemplate('Bulletin de notes'),
    card: defaultTemplate('Carte scolaire'),
  },
  signature: { ...EMPTY_SIGNATURE, signerName: 'M. Ndong Mba' },
  messaging: DEFAULT_MESSAGING_RULES,
  enrollment: {
    requiredDocuments: [
      'Acte de naissance',
      'Certificat de scolarité de l’année précédente',
      'Photo d’identité',
      'Carnet de vaccination',
    ],
    requiresApproval: true,
  },
};
