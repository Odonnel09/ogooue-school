import type { Database } from './database.types';
import type {
  Guardian,
  GuardianLink,
  SchoolClass,
  Student,
} from '@/types';

/**
 * TRADUCTION LIGNES → DOMAINE.
 *
 * La base parle `snake_case` et n'a pas d'opinion sur le métier ; le domaine
 * parle `camelCase` et en a une. Ces fonctions sont la frontière entre les
 * deux, et le seul endroit du code où les deux vocabulaires se croisent.
 *
 * Elles sont volontairement bêtes : aucune règle métier ici, aucun calcul.
 * Une conversion qui déciderait de quelque chose deviendrait un endroit où
 * chercher un bogue.
 *
 * Les colonnes `null` deviennent des chaînes vides : le domaine a été écrit
 * avec des champs obligatoires, et disperser des `?? ''` dans les composants
 * reviendrait à déplacer le problème plutôt qu'à le régler.
 */

type Tables = Database['public']['Tables'];

/** Les identifiants d'une classe et d'un niveau, résolus par jointure. */
export type StudentRow = Tables['students']['Row'] & {
  classes?: { name: string } | null;
  levels?: { code: string; label: string } | null;
  academic_years?: { label: string } | null;
};

export function toStudent(row: StudentRow): Student {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    matricule: row.matricule,
    birthDate: row.birth_date ?? '',
    birthPlace: row.birth_place,
    gender: row.gender === 'F' ? 'F' : 'M',
    nationality: row.nationality,
    address: row.address,
    classId: row.class_id ?? '',
    levelId: row.level_id ?? '',
    academicYear: row.academic_years?.label ?? '',
    status: row.status as Student['status'],
    photoUrl: row.photo_url || undefined,
    medicalInfo: row.medical_info,
    previousSchool: row.previous_school,
    filiere: row.filiere,
    parcours: row.parcours,
    // Pièces et historique d'inscription : tables distinctes, chargées à la
    // demande sur la fiche plutôt que dans chaque ligne de liste.
    documents: [],
    enrollment: [],
    createdAt: row.created_at.slice(0, 10),
    isDraft: row.is_draft,
  };
}

export function toSchoolClass(
  row: Tables['classes']['Row'] & { levels?: { code: string } | null },
): SchoolClass {
  return {
    id: row.id,
    name: row.name,
    levelId: row.level_id,
    cycle: row.cycle as SchoolClass['cycle'],
    academicYear: row.academic_year_id,
    capacity: row.capacity,
    room: row.room,
    mainTeacherId: row.main_teacher_id ?? '',
    description: row.description,
    status: row.status as SchoolClass['status'],
  };
}

export function toGuardian(row: Tables['guardians']['Row']): Guardian {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    altPhone: row.alt_phone,
    email: row.email,
    address: row.address,
    profession: row.profession,
    idDocument: row.id_document,
    notes: row.notes,
    status: row.status as Guardian['status'],
  };
}

export function toGuardianLink(
  row: Tables['guardian_links']['Row'],
): GuardianLink {
  return {
    id: row.id,
    guardianId: row.guardian_id,
    studentId: row.student_id,
    relation: row.relation as GuardianLink['relation'],
    isPrimary: row.is_primary,
    canPickUp: row.can_pick_up,
  };
}
