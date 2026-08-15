import type { Subject } from '@/types';

/**
 * Catalogue des matières.
 *
 * Aucun coefficient ni volume horaire ici : ils dépendent de la classe et
 * vivent dans `class-subjects.ts`. Les champs LMD sont toujours présents ;
 * leur affichage est décidé par `LevelCapabilities.hasCredits`.
 *
 * REMPLACEMENT SUPABASE : table `subjects` (+ `subject_levels`).
 */
type SubjectSeed = readonly [
  id: string,
  code: string,
  name: string,
  cycle: Subject['cycle'],
  teacherId: string,
  levelIds: string[],
  description: string,
];

const SECONDARY_LEVELS = [
  '6eme',
  '5eme',
  '4eme',
  '3eme',
  'seconde',
  'premiere',
  'terminale',
];

const SEEDS: SubjectSeed[] = [
  [
    'sub-math',
    'MATH',
    'Mathématiques',
    'lycee',
    'tch-01',
    SECONDARY_LEVELS,
    'Algèbre, analyse, géométrie et probabilités du collège au baccalauréat.',
  ],
  [
    'sub-fra',
    'FRA',
    'Français',
    'college',
    'tch-03',
    ['6eme', '5eme', '4eme', '3eme', 'seconde', 'premiere'],
    'Expression écrite, lecture analytique et littérature.',
  ],
  [
    'sub-ang',
    'ANG',
    'Anglais',
    'college',
    'tch-06',
    SECONDARY_LEVELS,
    'Première langue vivante étrangère.',
  ],
  [
    'sub-pc',
    'PC',
    'Physique-Chimie',
    'lycee',
    'tch-02',
    ['4eme', '3eme', 'seconde', 'premiere', 'terminale'],
    'Cours et travaux pratiques au laboratoire de sciences.',
  ],
  [
    'sub-svt',
    'SVT',
    'Sciences de la Vie et de la Terre',
    'lycee',
    'tch-05',
    ['6eme', '5eme', '4eme', '3eme', 'seconde', 'premiere'],
    'Biologie, géologie et éducation à l’environnement.',
  ],
  [
    'sub-hg',
    'HG',
    'Histoire-Géographie',
    'college',
    'tch-04',
    SECONDARY_LEVELS,
    'Histoire du Gabon, de l’Afrique centrale et du monde.',
  ],
  [
    'sub-philo',
    'PHILO',
    'Philosophie',
    'lycee',
    'tch-09',
    ['terminale'],
    'Programme de terminale, séries scientifiques et littéraires.',
  ],
  [
    'sub-eps',
    'EPS',
    'Éducation Physique et Sportive',
    'college',
    'tch-08',
    SECONDARY_LEVELS,
    'Athlétisme, sports collectifs et natation.',
  ],
  [
    'sub-esp',
    'ESP',
    'Espagnol',
    'lycee',
    'tch-11',
    ['seconde', 'premiere', 'terminale'],
    'Deuxième langue vivante étrangère.',
  ],
  [
    'sub-info',
    'INFO',
    'Informatique',
    'lycee',
    'tch-10',
    ['seconde', 'premiere', 'terminale'],
    'Bureautique, culture numérique et initiation à la programmation.',
  ],
  [
    'sub-eco',
    'ECO',
    'Sciences Économiques',
    'lycee',
    'tch-12',
    ['premiere', 'terminale'],
    'Série A1 : économie générale et organisation des entreprises.',
  ],
  [
    'sub-eveil',
    'EVEIL',
    'Éveil et Découverte du Monde',
    'prescolaire',
    'tch-13',
    ['garderie', 'ps', 'ms', 'gs'],
    'Activités d’éveil sensoriel et de socialisation.',
  ],
  [
    'sub-lecture',
    'LECT',
    'Lecture et Écriture',
    'primaire',
    'tch-13',
    ['cp1', 'cp2', 'ce1', 'ce2', 'cm1', 'cm2'],
    'Apprentissage fondamental de la lecture et de l’écriture.',
  ],
];

function base(seed: SubjectSeed): Subject {
  const [id, code, name, cycle, teacherId, levelIds, description] = seed;
  return {
    id,
    code,
    name,
    levelIds,
    cycle,
    teacherId,
    status: 'active',
    description,
    ue: '',
    ecue: '',
    ectsCredits: 0,
    semester: '',
    filiere: '',
  };
}

export const SUBJECTS: Subject[] = [
  ...SEEDS.map(base),

  // --- Enseignement supérieur : les champs LMD sont renseignés ---
  {
    id: 'sub-algo',
    code: 'INF-L1-01',
    name: 'Algorithmique et Programmation',
    levelIds: ['licence1'],
    cycle: 'superieur',
    teacherId: 'tch-10',
    status: 'active',
    description:
      'Fondamentaux de l’algorithmique, structures de données, langage C.',
    ue: 'UE 1 — Fondamentaux de l’informatique',
    ecue: 'ECUE 1.1 — Algorithmique',
    ectsCredits: 6,
    semester: 'Semestre 1',
    filiere: 'Informatique',
  },
  {
    id: 'sub-bd',
    code: 'INF-L1-04',
    name: 'Bases de Données Relationnelles',
    levelIds: ['licence1'],
    cycle: 'superieur',
    teacherId: 'tch-14',
    status: 'active',
    description: 'Modèle relationnel, SQL et conception de schémas.',
    ue: 'UE 2 — Systèmes d’information',
    ecue: 'ECUE 2.1 — Bases de données',
    ectsCredits: 4,
    semester: 'Semestre 2',
    filiere: 'Informatique',
  },
  {
    id: 'sub-mgmt',
    code: 'GES-M1-02',
    name: 'Management Stratégique',
    levelIds: ['master1'],
    cycle: 'superieur',
    teacherId: 'tch-12',
    status: 'active',
    description:
      'Diagnostic stratégique, gouvernance et pilotage de la performance.',
    ue: 'UE 3 — Stratégie et organisation',
    ecue: 'ECUE 3.2 — Management stratégique',
    ectsCredits: 5,
    semester: 'Semestre 1',
    filiere: 'Gestion des Organisations',
  },

  // --- Matière archivée ---
  {
    id: 'sub-latin',
    code: 'LAT',
    name: 'Latin',
    levelIds: ['5eme', '4eme', '3eme'],
    cycle: 'college',
    teacherId: '',
    status: 'archivee',
    description: 'Option supprimée à la rentrée 2026 faute d’effectif.',
    ue: '',
    ecue: '',
    ectsCredits: 0,
    semester: '',
    filiere: '',
  },
];
