import 'server-only';

import { createClient } from '@/lib/supabase/server';
import {
  toGuardian,
  toGuardianLink,
  toSchoolClass,
  toStudent,
  type StudentRow,
} from '@/lib/supabase/mappers';
import type { Guardian, GuardianLink, Level, SchoolClass, Student } from '@/types';

/**
 * LECTURES DU MODULE ÉLÈVES.
 *
 * Aucun `tenant_id` n'apparaît dans ces requêtes, et c'est délibéré : les
 * politiques RLS filtrent déjà sur l'appartenance de l'utilisateur. Ajouter
 * un filtre applicatif donnerait l'illusion que c'est lui qui protège, et
 * masquerait le jour où la politique se relâcherait.
 *
 * `server-only` en tête : ces fonctions utilisent la session en cookie, elles
 * n'ont rien à faire dans un composant client.
 */

export interface StudentsPageData {
  students: Student[];
  classes: SchoolClass[];
  levels: Level[];
  guardians: Guardian[];
  guardianLinks: GuardianLink[];
}

/** Tout ce dont la liste des élèves a besoin, en une passe. */
export async function getStudentsPageData(): Promise<StudentsPageData> {
  const supabase = await createClient();

  const [students, classes, levels, guardians, links] = await Promise.all([
    supabase
      .from('students')
      .select('*, academic_years ( label )')
      .order('last_name'),
    supabase.from('classes').select('*').order('name'),
    supabase.from('levels').select('*').order('position'),
    supabase.from('guardians').select('*').order('last_name'),
    supabase.from('guardian_links').select('*'),
  ]);

  return {
    students: (students.data ?? []).map((row) => toStudent(row as StudentRow)),
    classes: (classes.data ?? []).map(toSchoolClass),
    levels: (levels.data ?? []).map((row) => ({
      id: row.id,
      label: row.label,
      cycle: row.cycle as Level['cycle'],
      order: row.position,
    })),
    guardians: (guardians.data ?? []).map(toGuardian),
    guardianLinks: (links.data ?? []).map(toGuardianLink),
  };
}

/** Fiche d'un élève, `null` si la RLS ne l'accorde pas — les deux se valent. */
export async function getStudent(id: string): Promise<Student | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('students')
    .select('*, academic_years ( label )')
    .eq('id', id)
    .maybeSingle();

  return data ? toStudent(data as StudentRow) : null;
}

export interface StudentDetailData {
  student: Student;
  schoolClass: SchoolClass | null;
  levelLabel: string;
  guardians: Guardian[];
  guardianLinks: GuardianLink[];
}

/**
 * Tout ce qu'affiche la fiche d'un élève.
 *
 * Les panneaux « présences » et « évaluations » liront leurs propres tables
 * quand ces modules seront branchés. Ils sont aujourd'hui vides — non par
 * omission, mais parce que la base ne contient effectivement ni feuille
 * d'appel ni évaluation. Afficher un jeu fictif à côté de données réelles
 * serait le vrai défaut.
 */
export async function getStudentDetail(
  id: string,
): Promise<StudentDetailData | null> {
  const supabase = await createClient();

  const { data: row } = await supabase
    .from('students')
    .select('*, academic_years ( label )')
    .eq('id', id)
    .maybeSingle();

  if (!row) return null;
  const student = toStudent(row as StudentRow);

  const [classe, niveau, liens] = await Promise.all([
    student.classId
      ? supabase.from('classes').select('*').eq('id', student.classId).maybeSingle()
      : Promise.resolve({ data: null }),
    student.levelId
      ? supabase.from('levels').select('label').eq('id', student.levelId).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('guardian_links').select('*').eq('student_id', id),
  ]);

  const guardianIds = (liens.data ?? []).map((lien) => lien.guardian_id);
  const { data: tuteurs } = guardianIds.length
    ? await supabase.from('guardians').select('*').in('id', guardianIds)
    : { data: [] };

  return {
    student,
    schoolClass: classe.data ? toSchoolClass(classe.data) : null,
    levelLabel: (niveau.data as { label: string } | null)?.label ?? '—',
    guardians: (tuteurs ?? []).map(toGuardian),
    guardianLinks: (liens.data ?? []).map(toGuardianLink),
  };
}

export interface StudentFormData {
  classes: SchoolClass[];
  guardians: Guardian[];
  /** Matricules déjà attribués, pour la validation d'unicité côté client. */
  takenMatricules: string[];
  student?: Student;
  currentLink?: GuardianLink;
}

/**
 * Alimente le formulaire élève.
 *
 * Les matricules déjà pris sont fournis pour un retour immédiat à la saisie.
 * La contrainte d'unicité de la base reste la seule qui fasse foi : deux
 * secrétaires saisissant simultanément le même matricule verront la seconde
 * écriture refusée, quoi qu'ait dit le formulaire.
 */
export async function getStudentFormData(
  studentId?: string,
): Promise<StudentFormData> {
  const supabase = await createClient();

  const [classes, guardians, matricules] = await Promise.all([
    supabase.from('classes').select('*').eq('status', 'active').order('name'),
    supabase.from('guardians').select('*').eq('status', 'actif').order('last_name'),
    supabase.from('students').select('id, matricule'),
  ]);

  const base: StudentFormData = {
    classes: (classes.data ?? []).map(toSchoolClass),
    guardians: (guardians.data ?? []).map(toGuardian),
    takenMatricules: (matricules.data ?? [])
      .filter((row) => row.id !== studentId)
      .map((row) => row.matricule),
  };

  if (!studentId) return base;

  const [{ data: row }, { data: lien }] = await Promise.all([
    supabase
      .from('students')
      .select('*, academic_years ( label )')
      .eq('id', studentId)
      .maybeSingle(),
    supabase
      .from('guardian_links')
      .select('*')
      .eq('student_id', studentId)
      .eq('is_primary', true)
      .maybeSingle(),
  ]);

  return {
    ...base,
    student: row ? toStudent(row as StudentRow) : undefined,
    currentLink: lien ? toGuardianLink(lien) : undefined,
  };
}
