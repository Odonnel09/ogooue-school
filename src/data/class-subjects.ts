import type { ClassSubject } from '@/types';

/**
 * Rattachement des matières aux classes.
 *
 * C'est ici que vivent le coefficient et le volume horaire : les mathématiques
 * pèsent 4 en 6ème et 7 en Terminale C. Porter cette information sur la matière
 * seule rendrait le bulletin faux.
 *
 * REMPLACEMENT SUPABASE : table `class_subjects`.
 */
type ClassSubjectSeed = readonly [
  classId: string,
  subjectId: string,
  coefficient: number,
  weeklyHours: number,
  teacherId: string,
];

const SEEDS: ClassSubjectSeed[] = [
  // --- Terminale C (série scientifique) ---
  ['cls-tc', 'sub-math', 7, 8, 'tch-01'],
  ['cls-tc', 'sub-pc', 6, 6, 'tch-02'],
  ['cls-tc', 'sub-philo', 3, 4, 'tch-09'],
  ['cls-tc', 'sub-ang', 2, 3, 'tch-06'],
  ['cls-tc', 'sub-hg', 2, 2, 'tch-04'],
  ['cls-tc', 'sub-info', 1, 2, 'tch-10'],

  // --- Terminale A1 (lettres et économie) ---
  ['cls-ta1', 'sub-philo', 5, 6, 'tch-09'],
  ['cls-ta1', 'sub-eco', 5, 5, 'tch-12'],
  ['cls-ta1', 'sub-hg', 4, 4, 'tch-04'],
  ['cls-ta1', 'sub-ang', 3, 3, 'tch-06'],
  ['cls-ta1', 'sub-esp', 3, 3, 'tch-11'],

  // --- Première S ---
  ['cls-1s', 'sub-math', 5, 6, 'tch-01'],
  ['cls-1s', 'sub-pc', 4, 4, 'tch-02'],
  ['cls-1s', 'sub-svt', 4, 4, 'tch-05'],
  ['cls-1s', 'sub-fra', 4, 4, 'tch-03'],
  ['cls-1s', 'sub-ang', 2, 3, 'tch-06'],
  ['cls-1s', 'sub-esp', 2, 2, 'tch-11'],
  ['cls-1s', 'sub-eps', 1, 2, 'tch-08'],

  // --- Seconde (classe de détermination) ---
  ['cls-seconde', 'sub-math', 4, 5, 'tch-01'],
  ['cls-seconde', 'sub-fra', 4, 5, 'tch-03'],
  ['cls-seconde', 'sub-ang', 3, 3, 'tch-06'],
  ['cls-seconde', 'sub-pc', 3, 4, 'tch-02'],
  ['cls-seconde', 'sub-svt', 3, 3, 'tch-05'],
  ['cls-seconde', 'sub-hg', 3, 3, 'tch-04'],
  ['cls-seconde', 'sub-esp', 2, 2, 'tch-11'],
  ['cls-seconde', 'sub-info', 1, 2, 'tch-10'],
  ['cls-seconde', 'sub-eps', 1, 2, 'tch-08'],

  // --- 3ème A (classe d'examen) ---
  ['cls-3a', 'sub-math', 4, 5, 'tch-07'],
  ['cls-3a', 'sub-fra', 4, 5, 'tch-03'],
  ['cls-3a', 'sub-ang', 3, 4, 'tch-06'],
  ['cls-3a', 'sub-hg', 3, 3, 'tch-04'],
  ['cls-3a', 'sub-svt', 2, 3, 'tch-05'],
  ['cls-3a', 'sub-pc', 2, 3, 'tch-02'],
  ['cls-3a', 'sub-eps', 1, 2, 'tch-08'],

  // --- 4ème A ---
  ['cls-4a', 'sub-math', 4, 5, 'tch-07'],
  ['cls-4a', 'sub-fra', 4, 5, 'tch-03'],
  ['cls-4a', 'sub-ang', 3, 4, 'tch-06'],
  ['cls-4a', 'sub-hg', 3, 3, 'tch-04'],
  ['cls-4a', 'sub-svt', 2, 3, 'tch-05'],
  ['cls-4a', 'sub-pc', 2, 2, 'tch-02'],
  ['cls-4a', 'sub-eps', 1, 2, 'tch-08'],

  // --- 5ème B ---
  ['cls-5b', 'sub-math', 4, 5, 'tch-07'],
  ['cls-5b', 'sub-fra', 4, 5, 'tch-03'],
  ['cls-5b', 'sub-ang', 3, 4, 'tch-06'],
  ['cls-5b', 'sub-hg', 3, 3, 'tch-04'],
  ['cls-5b', 'sub-svt', 2, 3, 'tch-05'],
  ['cls-5b', 'sub-eps', 1, 2, 'tch-08'],

  // --- 6ème A ---
  ['cls-6a', 'sub-fra', 5, 6, 'tch-03'],
  ['cls-6a', 'sub-math', 4, 5, 'tch-07'],
  ['cls-6a', 'sub-ang', 3, 4, 'tch-06'],
  ['cls-6a', 'sub-hg', 3, 3, 'tch-04'],
  ['cls-6a', 'sub-svt', 2, 2, 'tch-05'],
  ['cls-6a', 'sub-eps', 1, 2, 'tch-08'],

  // --- 6ème B ---
  ['cls-6b', 'sub-fra', 5, 6, 'tch-03'],
  ['cls-6b', 'sub-math', 4, 5, 'tch-07'],
  ['cls-6b', 'sub-ang', 3, 4, 'tch-06'],
  ['cls-6b', 'sub-hg', 3, 3, 'tch-04'],
  ['cls-6b', 'sub-svt', 2, 2, 'tch-05'],
  ['cls-6b', 'sub-eps', 1, 2, 'tch-08'],

  // --- CM2 A (primaire) ---
  ['cls-cm2', 'sub-lecture', 4, 6, 'tch-13'],

  // --- Grande Section (pré-primaire) ---
  ['cls-gs', 'sub-eveil', 1, 5, 'tch-13'],

  // --- Licence 1 Informatique (LMD : le coefficient suit les crédits) ---
  ['cls-l1-info', 'sub-algo', 6, 6, 'tch-10'],
  ['cls-l1-info', 'sub-bd', 4, 4, 'tch-14'],

  // --- Master 1 Gestion ---
  ['cls-m1-gestion', 'sub-mgmt', 5, 3, 'tch-12'],
];

export const CLASS_SUBJECTS: ClassSubject[] = SEEDS.map(
  ([classId, subjectId, coefficient, weeklyHours, teacherId]): ClassSubject => ({
    id: `cs-${classId}-${subjectId}`,
    classId,
    subjectId,
    teacherId,
    coefficient,
    weeklyHours,
  }),
);
