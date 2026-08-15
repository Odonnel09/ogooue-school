import type {
  Gender,
  GuardianRelation,
  Student,
  StudentStatus,
} from '@/types';
import { CLASSES } from './classes';

/**
 * Élèves inscrits dans l'établissement de démonstration.
 * REMPLACEMENT SUPABASE : table `students` (+ `guardians`, `enrollments`,
 * `student_documents`).
 *
 * Les fiches sont décrites sous forme de tuples compacts puis normalisées par
 * `buildStudent` afin de garder le fichier lisible et facile à étendre.
 */
type StudentSeed = readonly [
  matricule: string,
  firstName: string,
  lastName: string,
  classId: string,
  gender: Gender,
  birthDate: string,
  birthPlace: string,
  guardianName: string,
  guardianPhone: string,
  relation: GuardianRelation,
  status: StudentStatus,
];

const QUARTERS = [
  'Quartier Louis, Libreville',
  'Nzeng-Ayong, Libreville',
  'Glass, Libreville',
  'Owendo, Libreville',
  'Akanda, Libreville',
  'PK8, Libreville',
  'Lalala, Libreville',
  'Batterie IV, Libreville',
  'Charbonnages, Libreville',
  'Sotega, Libreville',
  'Awendje, Libreville',
  'Angondje, Libreville',
];

const PREVIOUS_SCHOOLS = [
  'École publique de Nzeng-Ayong',
  'Collège Bessieux',
  'Lycée Léon Mba',
  'Institut Immaculée Conception',
  'École Sainte-Marie de Port-Gentil',
];

const FILIERES = ['Informatique', 'Gestion des Organisations'];

const SEEDS: StudentSeed[] = [
  // --- Terminale C ---
  ['MAT-2301', 'Jean', 'Ndong', 'cls-tc', 'M', '2008-03-14', 'Libreville', 'Paulin Ndong', '+241 06 21 44 08', 'pere', 'actif'],
  ['MAT-2305', 'Sarah', 'Nguema', 'cls-tc', 'F', '2008-07-02', 'Port-Gentil', 'Estelle Nguema', '+241 07 33 12 76', 'mere', 'actif'],
  ['MAT-2312', 'Yannick', 'Mboumba', 'cls-tc', 'M', '2007-11-25', 'Franceville', 'Sophie Mboumba', '+241 07 95 21 03', 'mere', 'actif'],
  ['MAT-2318', 'Aline', 'Ovono', 'cls-tc', 'F', '2008-01-30', 'Oyem', 'Célestin Ovono', '+241 07 15 62 44', 'pere', 'actif'],
  ['MAT-2324', 'Fabrice', 'Kombila', 'cls-tc', 'M', '2008-05-19', 'Libreville', 'Georges Kombila', '+241 06 31 78 25', 'pere', 'en_attente'],
  ['MAT-2331', 'Grace', 'Bongo', 'cls-tc', 'F', '2008-09-08', 'Libreville', 'Rodrigue Bongo', '+241 07 61 28 55', 'pere', 'actif'],

  // --- Terminale A1 ---
  ['MAT-2340', 'Christian', 'Mengue', 'cls-ta1', 'M', '2007-12-11', 'Lambaréné', 'Odette Mengue', '+241 06 44 71 30', 'mere', 'actif'],
  ['MAT-2346', 'Prisca', 'Ibinga', 'cls-ta1', 'F', '2008-02-27', 'Mouila', 'Fatou Ibinga', '+241 07 08 34 71', 'mere', 'actif'],
  ['MAT-2352', 'Wilfried', 'Nzamba', 'cls-ta1', 'M', '2008-06-16', 'Tchibanga', 'Julie Nzamba', '+241 06 30 18 47', 'mere', 'transfere'],
  ['MAT-2358', 'Nadia', 'Lekogo', 'cls-ta1', 'F', '2008-04-05', 'Libreville', 'Marc Lekogo', '+241 07 82 34 60', 'pere', 'actif'],

  // --- Première S ---
  ['MAT-2410', 'Marie', 'Mba', 'cls-1s', 'F', '2009-05-21', 'Libreville', 'Antoine Mba', '+241 06 55 77 21', 'pere', 'actif'],
  ['MAT-2415', 'Steve', 'Assoumou', 'cls-1s', 'M', '2009-08-13', 'Bitam', 'Delphine Assoumou', '+241 07 41 96 08', 'mere', 'actif'],
  ['MAT-2421', 'Laetitia', 'Divounguy', 'cls-1s', 'F', '2009-01-09', 'Moanda', 'Guy Divounguy', '+241 06 12 85 39', 'pere', 'actif'],
  ['MAT-2427', 'Brice', 'Makaya', 'cls-1s', 'M', '2009-10-04', 'Libreville', 'Sylviane Makaya', '+241 07 70 23 14', 'mere', 'actif'],
  ['MAT-2433', 'Ornella', 'Mouele', 'cls-1s', 'F', '2009-03-18', 'Port-Gentil', 'Landry Mouele', '+241 06 68 02 51', 'oncle', 'en_attente'],

  // --- Seconde ---
  ['MAT-2287', 'Paul', 'Obiang', 'cls-seconde', 'M', '2010-02-07', 'Libreville', 'Rachel Obiang', '+241 07 25 63 90', 'mere', 'actif'],
  ['MAT-2291', 'Chimène', 'Sima', 'cls-seconde', 'F', '2010-06-29', 'Oyem', 'Bernard Sima', '+241 06 91 47 22', 'pere', 'actif'],
  ['MAT-2296', 'Ludovic', 'Rekangalt', 'cls-seconde', 'M', '2010-09-15', 'Koulamoutou', 'Antoinette Rekangalt', '+241 07 58 11 07', 'mere', 'actif'],
  ['MAT-2302', 'Vanessa', 'Nzue', 'cls-seconde', 'F', '2010-04-23', 'Libreville', 'Thierry Nzue', '+241 06 37 80 64', 'pere', 'actif'],
  ['MAT-2308', 'Kevin', 'Boussougou', 'cls-seconde', 'M', '2010-11-11', 'Makokou', 'Nathalie Boussougou', '+241 07 04 92 38', 'mere', 'archive'],

  // --- 3ème A ---
  ['MAT-2501', 'Ange', 'Mintsa', 'cls-3a', 'F', '2011-01-17', 'Libreville', 'Patricia Mintsa', '+241 06 49 26 73', 'mere', 'actif'],
  ['MAT-2506', 'Junior', 'Ondo', 'cls-3a', 'M', '2011-07-30', 'Libreville', 'Franck Ondo', '+241 07 13 45 89', 'pere', 'actif'],
  ['MAT-2511', 'Sonia', 'Mavoungou', 'cls-3a', 'F', '2011-03-06', 'Mouila', 'Blaise Mavoungou', '+241 06 76 31 20', 'pere', 'actif'],
  ['MAT-2516', 'Emmanuel', 'Bekale', 'cls-3a', 'M', '2011-09-24', 'Bitam', 'Colette Bekale', '+241 07 88 07 41', 'grand_parent', 'actif'],

  // --- 4ème A ---
  ['MAT-2604', 'Doriane', 'Koumba', 'cls-4a', 'F', '2012-05-12', 'Libreville', 'Alphonse Koumba', '+241 06 22 59 84', 'pere', 'actif'],
  ['MAT-2609', 'Rodrigue', 'Ella', 'cls-4a', 'M', '2012-08-03', 'Lambaréné', 'Sylvie Ella', '+241 07 66 14 27', 'mere', 'actif'],
  ['MAT-2614', 'Elodie', 'Ngoua', 'cls-4a', 'F', '2012-12-19', 'Libreville', 'Didier Ngoua', '+241 06 05 73 60', 'pere', 'en_attente'],

  // --- 5ème B ---
  ['MAT-2702', 'Merveille', 'Nzigou', 'cls-5b', 'F', '2013-02-25', 'Franceville', 'Régine Nzigou', '+241 07 39 82 15', 'mere', 'actif'],
  ['MAT-2707', 'Alban', 'Mabika', 'cls-5b', 'M', '2013-06-08', 'Libreville', 'Yves Mabika', '+241 06 84 20 93', 'pere', 'actif'],
  ['MAT-2712', 'Carine', 'Ntoutoume', 'cls-5b', 'F', '2013-10-14', 'Oyem', 'Josiane Ntoutoume', '+241 07 51 67 32', 'mere', 'actif'],

  // --- 6ème A ---
  ['MAT-2801', 'Gaël', 'Oyane', 'cls-6a', 'M', '2014-04-02', 'Libreville', 'Martine Oyane', '+241 06 60 38 71', 'mere', 'actif'],
  ['MAT-2806', 'Ruth', 'Biyoghe', 'cls-6a', 'F', '2014-08-27', 'Port-Gentil', 'Armand Biyoghe', '+241 07 27 90 46', 'pere', 'actif'],
  ['MAT-2811', 'Idriss', 'Moussavou', 'cls-6a', 'M', '2014-11-09', 'Tchibanga', 'Léa Moussavou', '+241 06 43 15 08', 'mere', 'actif'],
  ['MAT-2816', 'Naomi', 'Ndong Mba', 'cls-6a', 'F', '2014-01-21', 'Libreville', 'Christiane Ndong', '+241 07 72 04 59', 'tuteur', 'actif'],

  // --- 6ème B ---
  ['MAT-2821', 'Samuel', 'Ovono', 'cls-6b', 'M', '2014-09-05', 'Libreville', 'Bertrand Ovono', '+241 06 18 47 62', 'pere', 'actif'],
  ['MAT-2826', 'Léa', 'Mboumba', 'cls-6b', 'F', '2014-03-30', 'Moanda', 'Sophie Mboumba', '+241 07 95 21 03', 'mere', 'actif'],
  ['MAT-2831', 'Ismaël', 'Kombila', 'cls-6b', 'M', '2014-06-17', 'Libreville', 'Georges Kombila', '+241 06 31 78 25', 'pere', 'en_attente'],

  // --- CM2 A ---
  ['MAT-2901', 'Bénédicte', 'Nguema', 'cls-cm2', 'F', '2015-05-14', 'Libreville', 'Alice Nguema', '+241 07 46 09 87', 'mere', 'actif'],
  ['MAT-2906', 'Yohan', 'Mengue', 'cls-cm2', 'M', '2015-10-22', 'Libreville', 'Roger Mengue', '+241 06 57 63 40', 'pere', 'actif'],

  // --- Grande Section ---
  ['MAT-2951', 'Aïcha', 'Ibinga', 'cls-gs', 'F', '2021-07-19', 'Libreville', 'Fatou Ibinga', '+241 07 08 34 71', 'mere', 'actif'],

  // --- Licence 1 Informatique ---
  ['ETU-1101', 'Cédric', 'Nzamba', 'cls-l1-info', 'M', '2007-02-11', 'Libreville', 'Cédric Nzamba', '+241 06 90 52 18', 'autre', 'actif'],
  ['ETU-1106', 'Stéphanie', 'Lekogo', 'cls-l1-info', 'F', '2006-12-04', 'Port-Gentil', 'Stéphanie Lekogo', '+241 07 34 76 90', 'autre', 'actif'],
  ['ETU-1111', 'Arnaud', 'Assoumou', 'cls-l1-info', 'M', '2007-08-28', 'Franceville', 'Arnaud Assoumou', '+241 06 65 29 47', 'autre', 'actif'],

  // --- Master 1 Gestion ---
  ['ETU-1201', 'Murielle', 'Divounguy', 'cls-m1-gestion', 'F', '2003-09-16', 'Libreville', 'Murielle Divounguy', '+241 07 19 83 25', 'autre', 'actif'],
  ['ETU-1206', 'Landry', 'Makaya', 'cls-m1-gestion', 'M', '2002-04-08', 'Mouila', 'Landry Makaya', '+241 06 73 41 06', 'autre', 'actif'],
];

const CLASS_LEVELS = new Map(CLASSES.map((item) => [item.id, item.levelId]));
const CLASS_NAMES = new Map(CLASSES.map((item) => [item.id, item.name]));

function buildStudent(seed: StudentSeed, index: number): Student {
  const [
    matricule,
    firstName,
    lastName,
    classId,
    gender,
    birthDate,
    birthPlace,
    ,
    ,
    ,
    status,
  ] = seed;

  const id = `std-${`${index + 1}`.padStart(3, '0')}`;
  const className = CLASS_NAMES.get(classId) ?? 'Non affecté';
  const hasDocuments = index % 2 === 0;
  const isReturning = index % 3 !== 0;

  return {
    id,
    firstName,
    lastName,
    matricule,
    birthDate,
    birthPlace,
    gender,
    nationality: index % 11 === 0 ? 'Camerounaise' : 'Gabonaise',
    address: QUARTERS[index % QUARTERS.length],
    classId,
    levelId: CLASS_LEVELS.get(classId) ?? '',
    academicYear: '2026-2027',
    status,
    medicalInfo: index % 7 === 0 ? 'Asthme léger — inhalateur au bureau de la vie scolaire.' : '',
    previousSchool: isReturning ? '' : PREVIOUS_SCHOOLS[index % PREVIOUS_SCHOOLS.length],
    filiere: matricule.startsWith('ETU') ? FILIERES[index % FILIERES.length] : '',
    parcours: matricule.startsWith('ETU') ? 'Formation initiale' : '',
    documents: hasDocuments
      ? [
          {
            id: `${id}-doc-1`,
            name: 'Acte de naissance.pdf',
            type: 'État civil',
            size: '312 Ko',
            uploadedAt: '2026-09-02',
          },
          {
            id: `${id}-doc-2`,
            name: 'Certificat de scolarité.pdf',
            type: 'Scolarité',
            size: '188 Ko',
            uploadedAt: '2026-09-14',
          },
        ]
      : [],
    enrollment: [
      {
        id: `${id}-enr-1`,
        academicYear: '2026-2027',
        className,
        date: '2026-09-14',
        label: 'Inscription confirmée pour l’année 2026-2027',
      },
      ...(isReturning
        ? [
            {
              id: `${id}-enr-0`,
              academicYear: '2025-2026',
              className,
              date: '2025-09-15',
              label: 'Réinscription — élève déjà présent l’année précédente',
            },
          ]
        : []),
    ],
    createdAt: '2026-09-14',
    isDraft: false,
  };
}

export const STUDENTS: Student[] = SEEDS.map(buildStudent);

/**
 * Graine des tuteurs, extraite des mêmes tuples.
 * `data/guardians.ts` la déduplique pour construire les personnes et leurs
 * rattachements — un adulte peut ainsi suivre plusieurs enfants.
 */
export interface StudentGuardianSeed {
  matricule: string;
  guardianName: string;
  guardianPhone: string;
  relation: GuardianRelation;
}

export const STUDENT_GUARDIAN_SEED: StudentGuardianSeed[] = SEEDS.map(
  (seed) => ({
    matricule: seed[0],
    guardianName: seed[7],
    guardianPhone: seed[8],
    relation: seed[9],
  }),
);
