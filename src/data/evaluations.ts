import type {
  Evaluation,
  EvaluationStatus,
  EvaluationType,
  Grade,
} from '@/types';
import { STUDENTS } from './students';

/**
 * Évaluations et notes de l'année 2026-2027.
 * REMPLACEMENT SUPABASE : tables `evaluations` et `grades`.
 */

/** Hash déterministe : les notes sont identiques serveur et client. */
function seededRatio(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

/** Élèves mis en avant dans « Meilleurs Élèves du Mois » du tableau de bord. */
const TOP_STUDENTS = new Set(['std-001', 'std-011', 'std-016']);

const COMMENTS = [
  'Travail sérieux, continue ainsi.',
  'Des progrès notables ce trimestre.',
  'Doit approfondir les exercices d’application.',
  'Résultats en baisse, un accompagnement est conseillé.',
  'Excellente maîtrise du chapitre.',
  '',
  '',
];

function buildGrades(
  evaluationId: string,
  classId: string,
  maxScore: number,
  status: EvaluationStatus,
): Grade[] {
  const roster = STUDENTS.filter(
    (student) =>
      student.classId === classId &&
      (student.status === 'actif' || student.status === 'en_attente'),
  );

  return roster.map((student, index) => {
    const ratio = seededRatio(`${evaluationId}|${student.id}`);
    const isFilled =
      status === 'draft'
        ? false
        : status === 'in_progress'
          ? index % 5 !== 0
          : true;

    if (!isFilled) {
      return { studentId: student.id, score: null, value: null, comment: '' };
    }

    const base = TOP_STUDENTS.has(student.id)
      ? 0.78 + ratio * 0.2
      : 0.28 + ratio * 0.62;
    const score = Math.round(base * maxScore * 2) / 2;
    const commentRatio = seededRatio(`${evaluationId}|${student.id}|c`);

    return {
      studentId: student.id,
      score,
      value: null,
      comment: COMMENTS[Math.floor(commentRatio * COMMENTS.length)],
    };
  });
}

type EvaluationSeed = readonly [
  name: string,
  type: EvaluationType,
  subjectId: string,
  classId: string,
  teacherId: string,
  periodId: string,
  date: string,
  coefficient: number,
  status: EvaluationStatus,
  description: string,
];

const SEEDS: EvaluationSeed[] = [
  [
    'Devoir n°1 — Suites numériques',
    'devoir',
    'sub-math',
    'cls-tc',
    'tch-01',
    't1',
    '2026-10-06',
    4,
    'published',
    'Devoir surveillé de 2 heures portant sur les suites et la récurrence.',
  ],
  [
    'Contrôle — Mécanique du point',
    'controle',
    'sub-pc',
    'cls-tc',
    'tch-02',
    't1',
    '2026-10-13',
    4,
    'validated',
    'Contrôle de 1 heure avec exercice de laboratoire.',
  ],
  [
    'Dissertation — La conscience',
    'devoir',
    'sub-philo',
    'cls-tc',
    'tch-09',
    't1',
    '2026-10-20',
    3,
    'in_progress',
    'Dissertation de 4 heures en conditions d’examen.',
  ],
  [
    'Examen blanc — Baccalauréat série C',
    'examen',
    'sub-math',
    'cls-tc',
    'tch-01',
    't1',
    '2026-11-10',
    5,
    'draft',
    'Épreuve blanche organisée avant les vacances de Noël.',
  ],
  [
    'Devoir n°1 — Dérivation',
    'devoir',
    'sub-math',
    'cls-1s',
    'tch-01',
    't1',
    '2026-10-07',
    4,
    'published',
    '',
  ],
  [
    'Contrôle — Génétique',
    'controle',
    'sub-svt',
    'cls-1s',
    'tch-05',
    't1',
    '2026-10-15',
    3,
    'submitted',
    'Contrôle sur le chapitre « transmission de l’information génétique ».',
  ],
  [
    'Oral — Compréhension et expression',
    'oral',
    'sub-ang',
    'cls-1s',
    'tch-06',
    't1',
    '2026-10-22',
    2,
    'in_progress',
    'Passage individuel de 10 minutes par élève.',
  ],
  [
    'Contrôle — Fonctions affines',
    'controle',
    'sub-math',
    'cls-seconde',
    'tch-01',
    't1',
    '2026-10-08',
    4,
    'published',
    '',
  ],
  [
    'Dictée et questions de compréhension',
    'devoir',
    'sub-fra',
    'cls-seconde',
    'tch-03',
    't1',
    '2026-10-16',
    4,
    'validated',
    '',
  ],
  [
    'Contrôle — La Première Guerre mondiale',
    'controle',
    'sub-hg',
    'cls-3a',
    'tch-04',
    't1',
    '2026-10-09',
    3,
    'published',
    'Contrôle de connaissances et étude de document.',
  ],
  [
    'Devoir n°1 — Théorème de Pythagore',
    'devoir',
    'sub-math',
    'cls-3a',
    'tch-07',
    't1',
    '2026-10-19',
    4,
    'in_progress',
    '',
  ],
  [
    'Évaluation — Vocabulaire de la famille',
    'controle',
    'sub-ang',
    'cls-6a',
    'tch-06',
    't1',
    '2026-10-12',
    3,
    'published',
    'Première évaluation de l’année pour la classe de 6ème A.',
  ],
  [
    'Devoir n°1 — Nombres décimaux',
    'devoir',
    'sub-math',
    'cls-6a',
    'tch-07',
    't1',
    '2026-10-21',
    4,
    'submitted',
    '',
  ],
  [
    'Partiel — Algorithmique et structures de données',
    'examen',
    'sub-algo',
    'cls-l1-info',
    'tch-10',
    's1',
    '2026-11-05',
    3,
    'in_progress',
    'Partiel de mi-semestre, épreuve écrite de 3 heures.',
  ],
  [
    'Étude de cas — Diagnostic stratégique',
    'devoir',
    'sub-mgmt',
    'cls-m1-gestion',
    'tch-12',
    's1',
    '2026-11-12',
    3,
    'draft',
    'Travail de groupe rendu sous forme de rapport écrit.',
  ],
];

export const EVALUATIONS: Evaluation[] = SEEDS.map(
  (
    [
      name,
      type,
      subjectId,
      classId,
      teacherId,
      periodId,
      date,
      coefficient,
      status,
      description,
    ],
    index,
  ): Evaluation => {
    const id = `eva-${`${index + 1}`.padStart(3, '0')}`;
    const maxScore = 20;
    return {
      id,
      name,
      type,
      subjectId,
      classId,
      teacherId,
      academicYear: '2026-2027',
      periodId,
      date,
      scale: 'sur_20',
      maxScore,
      coefficient,
      description,
      status,
      grades: buildGrades(id, classId, maxScore, status),
      gradeHistory: [],
    };
  },
);
