import type { AcademicYear, Level, Period } from '@/types';

/**
 * Référentiel scolaire de l'établissement de démonstration.
 * REMPLACEMENT SUPABASE : tables `levels`, `academic_years`, `periods`.
 */

export const CURRENT_ACADEMIC_YEAR = '2026-2027';

/**
 * Date de référence de la démonstration.
 *
 * Les données fictives décrivent un établissement **en cours d'année** :
 * feuilles d'appel et évaluations d'octobre-novembre 2026. Les calculs de
 * retard (échéances dépassées) s'appuient donc sur cette date plutôt que sur
 * l'horloge de la machine, sans quoi aucune facture ne serait jamais échue.
 *
 * REMPLACEMENT SUPABASE : remplacer par `todayIso()`.
 */
export const REFERENCE_DATE = '2026-11-15';

export const ACADEMIC_YEARS: AcademicYear[] = [
  {
    id: '2026-2027',
    label: '2026-2027',
    startDate: '2026-09-14',
    endDate: '2027-07-09',
    status: 'active',
  },
  {
    id: '2025-2026',
    label: '2025-2026',
    startDate: '2025-09-15',
    endDate: '2026-07-10',
    status: 'closed',
  },
  {
    id: '2024-2025',
    label: '2024-2025',
    startDate: '2024-09-16',
    endDate: '2025-07-11',
    status: 'archived',
  },
];

export const LEVELS: Level[] = [
  { id: 'garderie', label: 'Garderie', cycle: 'garderie', order: 1 },
  { id: 'ps', label: 'Petite section', cycle: 'prescolaire', order: 2 },
  { id: 'ms', label: 'Moyenne section', cycle: 'prescolaire', order: 3 },
  { id: 'gs', label: 'Grande section', cycle: 'prescolaire', order: 4 },
  { id: 'cp1', label: 'CP1', cycle: 'primaire', order: 5 },
  { id: 'cp2', label: 'CP2', cycle: 'primaire', order: 6 },
  { id: 'ce1', label: 'CE1', cycle: 'primaire', order: 7 },
  { id: 'ce2', label: 'CE2', cycle: 'primaire', order: 8 },
  { id: 'cm1', label: 'CM1', cycle: 'primaire', order: 9 },
  { id: 'cm2', label: 'CM2', cycle: 'primaire', order: 10 },
  { id: '6eme', label: '6ème', cycle: 'college', order: 11 },
  { id: '5eme', label: '5ème', cycle: 'college', order: 12 },
  { id: '4eme', label: '4ème', cycle: 'college', order: 13 },
  { id: '3eme', label: '3ème', cycle: 'college', order: 14 },
  { id: 'seconde', label: 'Seconde', cycle: 'lycee', order: 15 },
  { id: 'premiere', label: 'Première', cycle: 'lycee', order: 16 },
  { id: 'terminale', label: 'Terminale', cycle: 'lycee', order: 17 },
  { id: 'licence1', label: 'Licence 1', cycle: 'superieur', order: 18 },
  { id: 'licence2', label: 'Licence 2', cycle: 'superieur', order: 19 },
  { id: 'licence3', label: 'Licence 3', cycle: 'superieur', order: 20 },
  { id: 'master1', label: 'Master 1', cycle: 'superieur', order: 21 },
  { id: 'master2', label: 'Master 2', cycle: 'superieur', order: 22 },
  { id: 'doctorat', label: 'Doctorat', cycle: 'superieur', order: 23 },
];

export const DEFAULT_PERIODS: Period[] = [
  {
    id: 't1',
    label: '1er trimestre',
    kind: 'trimestre',
    cycles: ['garderie', 'prescolaire', 'primaire', 'college', 'lycee'],
  },
  {
    id: 't2',
    label: '2ème trimestre',
    kind: 'trimestre',
    cycles: ['garderie', 'prescolaire', 'primaire', 'college', 'lycee'],
  },
  {
    id: 't3',
    label: '3ème trimestre',
    kind: 'trimestre',
    cycles: ['garderie', 'prescolaire', 'primaire', 'college', 'lycee'],
  },
  { id: 's1', label: 'Semestre 1', kind: 'semestre', cycles: ['superieur'] },
  { id: 's2', label: 'Semestre 2', kind: 'semestre', cycles: ['superieur'] },
];

/** Salles disponibles dans l'établissement. */
export const ROOMS: string[] = [
  'Salle 101',
  'Salle 102',
  'Salle 103',
  'Salle 201',
  'Salle 202',
  'Salle 203',
  'Labo Sciences',
  'Labo Informatique',
  'Amphi A',
  'Amphi B',
  'Gymnase',
];

/** Créneaux horaires standards de l'établissement. */
export const TIME_SLOTS: string[] = [
  '07:30',
  '08:30',
  '09:30',
  '10:30',
  '11:30',
  '12:30',
  '13:30',
  '14:30',
  '15:30',
  '16:30',
  '17:30',
];

/** Utilisateur connecté simulé (affiché dans l'en-tête). */
export const CURRENT_USER = {
  name: 'M. Ndong',
  role: 'Admin',
  fullName: 'Serge Ndong',
};
