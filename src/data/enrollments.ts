import type {
  EnrollmentApplication,
  EnrollmentStatus,
  Gender,
  GuardianRelation,
} from '@/types';
import { DEFAULT_TENANT_CONFIG } from './tenant-config';
import { GUARDIANS } from './guardians';

/**
 * Dossiers de préinscription de la rentrée 2026-2027.
 * REMPLACEMENT SUPABASE : table `enrollment_applications`.
 *
 * Les pièces exigées sont celles réglées dans Paramètres : modifier la liste
 * là-bas change ce qui est attendu des futurs dossiers.
 */
type EnrollmentSeed = readonly [
  firstName: string,
  lastName: string,
  birthDate: string,
  gender: Gender,
  birthPlace: string,
  requestedLevelId: string,
  previousSchool: string,
  guardianIndex: number,
  relation: GuardianRelation,
  status: EnrollmentStatus,
  providedCount: number,
  note: string,
];

const REQUIRED = DEFAULT_TENANT_CONFIG.enrollment.requiredDocuments;

const SEEDS: EnrollmentSeed[] = [
  [
    'Nathan', 'Mombo', '2014-05-12', 'M', 'Libreville', '6eme',
    'École publique de Nzeng-Ayong', 0, 'pere', 'soumise', 4,
    'Dossier complet, en attente de décision.',
  ],
  [
    'Sarah', 'Ndoutoume', '2014-09-03', 'F', 'Oyem', '6eme',
    'École Sainte-Marie', 1, 'mere', 'incomplete', 2,
    'Carnet de vaccination et photo d’identité manquants.',
  ],
  [
    'Kevin', 'Bouanga', '2011-02-19', 'M', 'Port-Gentil', '3eme',
    'Collège Bessieux', 2, 'pere', 'validee', 4,
    'Accepté en 3ème A sous réserve du paiement de la première tranche.',
  ],
  [
    'Divine', 'Mihindou', '2010-11-27', 'F', 'Franceville', 'seconde',
    'Collège Saint-Joseph', 3, 'mere', 'soumise', 3,
    'Manque le certificat de scolarité.',
  ],
  [
    'Ryan', 'Nzoghe', '2015-07-08', 'M', 'Libreville', 'cm2',
    'École publique de Lalala', 4, 'tuteur', 'brouillon', 1,
    'Dossier en cours de constitution au secrétariat.',
  ],
  [
    'Emma', 'Loundou', '2013-03-30', 'F', 'Mouila', '5eme',
    'Collège de Mouila', 5, 'mere', 'refusee', 4,
    'Effectif maximal atteint sur le niveau demandé.',
  ],
  [
    'Israël', 'Ovouno', '2008-12-14', 'M', 'Libreville', 'terminale',
    'Lycée Léon Mba', 6, 'pere', 'soumise', 4,
    'Transfert depuis un autre établissement, dossier complet.',
  ],
  [
    'Chloé', 'Bounguendza', '2016-01-22', 'F', 'Libreville', 'gs',
    '', 7, 'mere', 'incomplete', 1,
    'Acte de naissance en cours de retrait à la mairie.',
  ],
  [
    'Franck', 'Mihindou', '2007-06-05', 'M', 'Libreville', 'licence1',
    'Lycée National Léon Mba', 8, 'autre', 'soumise', 3,
    'Candidature en Licence 1 Informatique.',
  ],
  [
    'Aurélie', 'Ngoma', '2012-04-17', 'F', 'Tchibanga', '4eme',
    'Collège de Tchibanga', 9, 'grand_parent', 'validee', 4,
    'Bourse municipale accordée.',
  ],
];

export const ENROLLMENT_APPLICATIONS: EnrollmentApplication[] = SEEDS.map(
  (
    [
      firstName,
      lastName,
      birthDate,
      gender,
      birthPlace,
      requestedLevelId,
      previousSchool,
      guardianIndex,
      relation,
      status,
      providedCount,
      note,
    ],
    index,
  ): EnrollmentApplication => {
    const reference = `PRE-2026-${`${index + 1}`.padStart(4, '0')}`;
    const submittedAt = `2026-08-${`${3 + index}`.padStart(2, '0')}`;
    const decided = status === 'validee' || status === 'refusee';

    return {
      id: `enr-${`${index + 1}`.padStart(3, '0')}`,
      reference,
      firstName,
      lastName,
      birthDate,
      birthPlace,
      gender,
      nationality: 'Gabonaise',
      address: 'Libreville',
      previousSchool,
      requestedLevelId,
      requestedClassId: '',
      academicYear: '2026-2027',
      guardianId: GUARDIANS[guardianIndex % GUARDIANS.length]?.id ?? '',
      guardianRelation: relation,
      documents: REQUIRED.map((name, position) => ({
        name,
        provided: position < providedCount,
        receivedAt: position < providedCount ? submittedAt : '',
      })),
      status,
      submittedAt: status === 'brouillon' ? '' : submittedAt,
      decidedAt: decided ? `2026-08-${`${10 + index}`.padStart(2, '0')}` : '',
      decidedBy: decided ? 'Serge Ndong' : '',
      decisionNote: note,
      createdStudentId: '',
    };
  },
);
