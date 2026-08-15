import type { ScheduleSlot, ScheduleStatus, Weekday } from '@/types';

/**
 * Emplois du temps hebdomadaires par classe.
 * REMPLACEMENT SUPABASE : table `schedule_slots`.
 *
 * Deux créneaux du vendredi matin (Seconde et Première S) partagent
 * volontairement le même enseignant et la même salle : ils servent à
 * démontrer la détection de conflits.
 */
type SlotSeed = readonly [
  classId: string,
  day: Weekday,
  startTime: string,
  endTime: string,
  subjectId: string,
  teacherId: string,
  room: string,
  status: ScheduleStatus,
];

const SEEDS: SlotSeed[] = [
  // --- Terminale C ---
  ['cls-tc', 'lundi', '07:30', '09:30', 'sub-math', 'tch-01', 'Salle 203', 'valide'],
  ['cls-tc', 'lundi', '09:30', '11:30', 'sub-pc', 'tch-02', 'Labo Sciences', 'valide'],
  ['cls-tc', 'lundi', '13:30', '15:30', 'sub-philo', 'tch-09', 'Salle 203', 'valide'],
  ['cls-tc', 'mardi', '07:30', '09:30', 'sub-hg', 'tch-04', 'Salle 203', 'valide'],
  ['cls-tc', 'mardi', '09:30', '11:30', 'sub-math', 'tch-01', 'Salle 203', 'valide'],
  ['cls-tc', 'mardi', '13:30', '15:30', 'sub-ang', 'tch-06', 'Salle 203', 'valide'],
  ['cls-tc', 'mercredi', '07:30', '09:30', 'sub-pc', 'tch-02', 'Labo Sciences', 'valide'],
  ['cls-tc', 'mercredi', '09:30', '11:30', 'sub-info', 'tch-10', 'Labo Informatique', 'valide'],
  ['cls-tc', 'jeudi', '07:30', '09:30', 'sub-math', 'tch-01', 'Salle 203', 'valide'],
  ['cls-tc', 'jeudi', '09:30', '11:30', 'sub-philo', 'tch-09', 'Salle 203', 'valide'],
  ['cls-tc', 'jeudi', '13:30', '15:30', 'sub-hg', 'tch-04', 'Salle 203', 'valide'],
  ['cls-tc', 'vendredi', '07:30', '09:30', 'sub-ang', 'tch-06', 'Salle 203', 'valide'],
  ['cls-tc', 'vendredi', '09:30', '11:30', 'sub-pc', 'tch-02', 'Labo Sciences', 'valide'],
  ['cls-tc', 'vendredi', '13:30', '15:30', 'sub-math', 'tch-01', 'Salle 203', 'valide'],
  ['cls-tc', 'samedi', '07:30', '09:30', 'sub-info', 'tch-10', 'Labo Informatique', 'valide'],

  // --- Première S ---
  ['cls-1s', 'lundi', '07:30', '09:30', 'sub-math', 'tch-01', 'Salle 202', 'valide'],
  ['cls-1s', 'lundi', '09:30', '11:30', 'sub-fra', 'tch-03', 'Salle 202', 'valide'],
  ['cls-1s', 'lundi', '13:30', '15:30', 'sub-svt', 'tch-05', 'Labo Sciences', 'valide'],
  ['cls-1s', 'mardi', '07:30', '09:30', 'sub-pc', 'tch-02', 'Labo Sciences', 'valide'],
  ['cls-1s', 'mardi', '09:30', '11:30', 'sub-esp', 'tch-11', 'Salle 202', 'valide'],
  ['cls-1s', 'mardi', '13:30', '15:30', 'sub-eps', 'tch-08', 'Gymnase', 'valide'],
  ['cls-1s', 'mercredi', '07:30', '09:30', 'sub-math', 'tch-01', 'Salle 202', 'valide'],
  ['cls-1s', 'mercredi', '09:30', '11:30', 'sub-svt', 'tch-05', 'Labo Sciences', 'valide'],
  ['cls-1s', 'jeudi', '07:30', '09:30', 'sub-fra', 'tch-03', 'Salle 202', 'valide'],
  ['cls-1s', 'jeudi', '09:30', '11:30', 'sub-pc', 'tch-02', 'Labo Sciences', 'valide'],
  ['cls-1s', 'jeudi', '13:30', '15:30', 'sub-ang', 'tch-06', 'Salle 202', 'valide'],
  ['cls-1s', 'vendredi', '07:30', '09:30', 'sub-svt', 'tch-05', 'Labo Sciences', 'valide'],
  ['cls-1s', 'vendredi', '09:30', '11:30', 'sub-math', 'tch-01', 'Salle 202', 'valide'],

  // --- Seconde ---
  ['cls-seconde', 'lundi', '07:30', '09:30', 'sub-fra', 'tch-03', 'Salle 201', 'valide'],
  ['cls-seconde', 'lundi', '09:30', '11:30', 'sub-math', 'tch-01', 'Salle 201', 'valide'],
  ['cls-seconde', 'lundi', '13:30', '15:30', 'sub-ang', 'tch-06', 'Salle 201', 'valide'],
  ['cls-seconde', 'mardi', '07:30', '09:30', 'sub-esp', 'tch-11', 'Salle 201', 'valide'],
  ['cls-seconde', 'mardi', '09:30', '11:30', 'sub-svt', 'tch-05', 'Labo Sciences', 'valide'],
  ['cls-seconde', 'mardi', '13:30', '15:30', 'sub-info', 'tch-10', 'Labo Informatique', 'valide'],
  ['cls-seconde', 'mercredi', '07:30', '09:30', 'sub-fra', 'tch-03', 'Salle 201', 'valide'],
  ['cls-seconde', 'mercredi', '09:30', '11:30', 'sub-eps', 'tch-08', 'Gymnase', 'valide'],
  ['cls-seconde', 'jeudi', '07:30', '09:30', 'sub-hg', 'tch-04', 'Salle 201', 'valide'],
  ['cls-seconde', 'jeudi', '09:30', '11:30', 'sub-math', 'tch-01', 'Salle 201', 'valide'],
  ['cls-seconde', 'jeudi', '13:30', '15:30', 'sub-fra', 'tch-03', 'Salle 201', 'valide'],
  // Conflit volontaire : même enseignante et même salle que la Première S.
  ['cls-seconde', 'vendredi', '07:30', '09:30', 'sub-svt', 'tch-05', 'Labo Sciences', 'valide'],
  ['cls-seconde', 'vendredi', '09:30', '11:30', 'sub-ang', 'tch-06', 'Salle 201', 'valide'],

  // --- 3ème A ---
  ['cls-3a', 'lundi', '07:30', '09:30', 'sub-hg', 'tch-04', 'Salle 102', 'valide'],
  ['cls-3a', 'lundi', '09:30', '11:30', 'sub-math', 'tch-07', 'Salle 102', 'valide'],
  ['cls-3a', 'lundi', '13:30', '15:30', 'sub-pc', 'tch-02', 'Salle 102', 'valide'],
  ['cls-3a', 'mardi', '07:30', '09:30', 'sub-math', 'tch-07', 'Salle 102', 'valide'],
  ['cls-3a', 'mardi', '09:30', '11:30', 'sub-fra', 'tch-03', 'Salle 102', 'valide'],
  ['cls-3a', 'mercredi', '07:30', '09:30', 'sub-ang', 'tch-06', 'Salle 102', 'valide'],
  ['cls-3a', 'mercredi', '09:30', '11:30', 'sub-pc', 'tch-02', 'Salle 102', 'valide'],
  ['cls-3a', 'jeudi', '07:30', '09:30', 'sub-math', 'tch-07', 'Salle 102', 'valide'],
  ['cls-3a', 'jeudi', '09:30', '11:30', 'sub-hg', 'tch-04', 'Salle 102', 'valide'],
  ['cls-3a', 'vendredi', '07:30', '09:30', 'sub-fra', 'tch-03', 'Salle 102', 'valide'],
  ['cls-3a', 'vendredi', '13:30', '15:30', 'sub-eps', 'tch-08', 'Gymnase', 'valide'],

  // --- 6ème A ---
  ['cls-6a', 'lundi', '07:30', '09:30', 'sub-math', 'tch-07', 'Salle 103', 'valide'],
  ['cls-6a', 'lundi', '09:30', '11:30', 'sub-ang', 'tch-06', 'Salle 103', 'valide'],
  ['cls-6a', 'lundi', '13:30', '15:30', 'sub-hg', 'tch-04', 'Salle 103', 'valide'],
  ['cls-6a', 'mardi', '07:30', '09:30', 'sub-fra', 'tch-03', 'Salle 103', 'valide'],
  ['cls-6a', 'mardi', '09:30', '11:30', 'sub-math', 'tch-07', 'Salle 103', 'valide'],
  ['cls-6a', 'mercredi', '07:30', '09:30', 'sub-svt', 'tch-05', 'Salle 103', 'valide'],
  ['cls-6a', 'mercredi', '09:30', '11:30', 'sub-hg', 'tch-04', 'Salle 103', 'valide'],
  ['cls-6a', 'jeudi', '07:30', '09:30', 'sub-ang', 'tch-06', 'Salle 103', 'valide'],
  ['cls-6a', 'jeudi', '09:30', '11:30', 'sub-fra', 'tch-03', 'Salle 103', 'valide'],
  ['cls-6a', 'vendredi', '07:30', '09:30', 'sub-math', 'tch-07', 'Salle 103', 'valide'],
  ['cls-6a', 'vendredi', '09:30', '11:30', 'sub-eps', 'tch-08', 'Gymnase', 'valide'],

  // --- Licence 1 Informatique (brouillon) ---
  ['cls-l1-info', 'lundi', '08:30', '11:30', 'sub-algo', 'tch-10', 'Amphi A', 'brouillon'],
  ['cls-l1-info', 'mardi', '13:30', '16:30', 'sub-bd', 'tch-14', 'Amphi A', 'brouillon'],
  ['cls-l1-info', 'jeudi', '08:30', '11:30', 'sub-algo', 'tch-10', 'Labo Informatique', 'brouillon'],

  // --- Master 1 Gestion (brouillon) ---
  ['cls-m1-gestion', 'mercredi', '13:30', '16:30', 'sub-mgmt', 'tch-12', 'Amphi B', 'brouillon'],
  ['cls-m1-gestion', 'vendredi', '08:30', '11:30', 'sub-mgmt', 'tch-12', 'Amphi B', 'brouillon'],
];

export const SCHEDULE_SLOTS: ScheduleSlot[] = SEEDS.map(
  (
    [classId, day, startTime, endTime, subjectId, teacherId, room, status],
    index,
  ): ScheduleSlot => ({
    id: `slot-${`${index + 1}`.padStart(3, '0')}`,
    classId,
    subjectId,
    teacherId,
    room,
    day,
    startTime,
    endTime,
    academicYear: '2026-2027',
    status,
  }),
);
