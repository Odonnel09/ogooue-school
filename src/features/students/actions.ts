'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSessionContext } from '@/lib/auth/server';

/**
 * MUTATIONS DU MODULE ÉLÈVES.
 *
 * Chaque action fait trois choses, dans cet ordre :
 *
 *   1. **Vérifie la permission côté serveur.** `GEMINI.md` l'exige dans les
 *      Server Actions autant que dans l'interface et la base. Le masquage du
 *      bouton n'est pas une autorisation.
 *   2. **Écrit.** La RLS refuserait de toute façon une écriture hors
 *      périmètre — cette vérification est une seconde barrière, pas la seule.
 *   3. **Journalise.** Archiver un élève est une opération sensible ; la trace
 *      part dans `audit_logs`, table append-only.
 *
 * La journalisation a lieu **après** l'écriture réussie : tracer une opération
 * qui a échoué serait pire que ne rien tracer.
 */

export interface StudentActionState {
  error?: string;
  success?: string;
}

/** Trace une opération sensible. Silencieuse en cas d'échec : elle ne doit
 *  jamais faire échouer l'opération qu'elle accompagne. */
async function journaliser(
  tenantId: string,
  actorName: string,
  actorRole: string,
  entry: {
    action: string;
    domain: string;
    severity: 'info' | 'sensitive';
    resourceType: string;
    resourceId: string;
    resourceLabel: string;
    detail: string;
  },
) {
  const supabase = await createClient();
  const { error } = await supabase.from('audit_logs').insert({
    tenant_id: tenantId,
    actor_name: actorName,
    actor_role: actorRole,
    action: entry.action,
    domain: entry.domain,
    severity: entry.severity,
    resource_type: entry.resourceType,
    resource_id: entry.resourceId,
    resource_label: entry.resourceLabel,
    detail: entry.detail,
  });
  if (error) console.error('[audit] écriture', error.message);
}

/* -------------------------------------------------------------------------- */

export async function archiveStudent(
  tenantSlug: string,
  studentId: string,
): Promise<StudentActionState> {
  const session = await getSessionContext(tenantSlug);
  if (!session?.membership) return { error: 'Session expirée.' };

  if (!session.permissions.includes('students.update')) {
    return { error: 'Vous n’avez pas le droit d’archiver un élève.' };
  }

  const supabase = await createClient();

  const { data: student } = await supabase
    .from('students')
    .select('matricule, first_name, last_name')
    .eq('id', studentId)
    .maybeSingle();

  const { error } = await supabase
    .from('students')
    .update({ status: 'archive' })
    .eq('id', studentId);

  if (error) {
    console.error('[students] archivage', error.message);
    return { error: 'L’archivage a échoué.' };
  }

  await journaliser(
    session.membership.tenantId,
    session.email,
    session.membership.roleName,
    {
      action: 'students.archive',
      domain: 'students',
      severity: 'sensitive',
      resourceType: 'Élève',
      resourceId: studentId,
      resourceLabel: student
        ? `${student.first_name} ${student.last_name} (${student.matricule})`
        : studentId,
      detail:
        'Dossier archivé : l’élève sort des effectifs sans être supprimé.',
    },
  );

  revalidatePath(`/${tenantSlug}/students`);
  return { success: 'Dossier archivé.' };
}

export async function archiveStudents(
  tenantSlug: string,
  studentIds: string[],
): Promise<StudentActionState> {
  const session = await getSessionContext(tenantSlug);
  if (!session?.membership) return { error: 'Session expirée.' };

  if (!session.permissions.includes('students.update')) {
    return { error: 'Vous n’avez pas le droit d’archiver un élève.' };
  }
  if (studentIds.length === 0) return { error: 'Aucun élève sélectionné.' };

  const supabase = await createClient();

  const { data: students } = await supabase
    .from('students')
    .select('id, matricule, first_name, last_name')
    .in('id', studentIds);

  const { error } = await supabase
    .from('students')
    .update({ status: 'archive' })
    .in('id', studentIds);

  if (error) {
    console.error('[students] archivage groupé', error.message);
    return { error: 'L’archivage a échoué.' };
  }

  // Une trace par élève : un archivage groupé reste une suite d'actes
  // individuels, et c'est ainsi qu'un inspecteur voudra les relire.
  for (const student of students ?? []) {
    await journaliser(
      session.membership.tenantId,
      session.email,
      session.membership.roleName,
      {
        action: 'students.archive',
        domain: 'students',
        severity: 'sensitive',
        resourceType: 'Élève',
        resourceId: student.id,
        resourceLabel: `${student.first_name} ${student.last_name} (${student.matricule})`,
        detail: `Archivage groupé de ${studentIds.length} dossier(s).`,
      },
    );
  }

  revalidatePath(`/${tenantSlug}/students`);
  return {
    success: `${studentIds.length} dossier(s) archivé(s).`,
  };
}

/** Journalise un export : le fichier emporte des données personnelles. */
export async function logStudentExport(
  tenantSlug: string,
  count: number,
): Promise<void> {
  const session = await getSessionContext(tenantSlug);
  if (!session?.membership) return;
  if (!session.permissions.includes('students.export')) return;

  await journaliser(
    session.membership.tenantId,
    session.email,
    session.membership.roleName,
    {
      action: 'students.export',
      domain: 'students',
      severity: 'sensitive',
      resourceType: 'Liste d’élèves',
      resourceId: 'students-csv',
      resourceLabel: `${count} élève(s)`,
      detail:
        'Export CSV de la liste filtrée : le fichier contient des données personnelles.',
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Création et modification                                                    */
/* -------------------------------------------------------------------------- */

export interface StudentPayload {
  id?: string;
  firstName: string;
  lastName: string;
  matricule: string;
  birthDate: string;
  birthPlace: string;
  gender: 'M' | 'F';
  nationality: string;
  address: string;
  classId: string;
  levelId: string;
  status: string;
  medicalInfo: string;
  previousSchool: string;
  filiere: string;
  parcours: string;
  isDraft: boolean;
  /** Tuteur principal, facultatif. */
  guardianId: string;
  guardianRelation: string;
  canPickUp: boolean;
}

export async function saveStudent(
  tenantSlug: string,
  payload: StudentPayload,
): Promise<StudentActionState & { id?: string }> {
  const session = await getSessionContext(tenantSlug);
  if (!session?.membership) return { error: 'Session expirée.' };

  const isEdit = Boolean(payload.id);
  const requise = isEdit ? 'students.update' : 'students.create';
  if (!session.permissions.includes(requise)) {
    return { error: 'Vous n’avez pas le droit d’effectuer cette action.' };
  }

  const supabase = await createClient();
  const tenantId = session.membership.tenantId;

  // L'année en cours est déduite côté serveur : la laisser au client
  // permettrait de rattacher un élève à une année close.
  const { data: annee } = await supabase
    .from('academic_years')
    .select('id')
    .eq('status', 'active')
    .maybeSingle();

  const ligne = {
    tenant_id: tenantId,
    matricule: payload.matricule,
    first_name: payload.firstName,
    last_name: payload.lastName,
    birth_date: payload.birthDate || null,
    birth_place: payload.birthPlace,
    gender: payload.gender,
    nationality: payload.nationality || 'Gabonaise',
    address: payload.address,
    class_id: payload.classId || null,
    level_id: payload.levelId || null,
    academic_year_id: annee?.id ?? null,
    status: payload.isDraft ? 'en_attente' : payload.status,
    medical_info: payload.medicalInfo,
    previous_school: payload.previousSchool,
    filiere: payload.filiere,
    parcours: payload.parcours,
    is_draft: payload.isDraft,
  };

  let studentId = payload.id ?? '';

  if (isEdit) {
    const { error } = await supabase
      .from('students')
      .update(ligne)
      .eq('id', payload.id!);
    if (error) {
      console.error('[students] modification', error.message);
      return { error: messageLisible(error.message) };
    }
  } else {
    const { data, error } = await supabase
      .from('students')
      .insert(ligne)
      .select('id')
      .single();
    if (error) {
      console.error('[students] création', error.message);
      return { error: messageLisible(error.message) };
    }
    studentId = data.id;
  }

  // Rattachement au tuteur principal : une ligne à part, car un même adulte
  // peut suivre plusieurs enfants.
  if (payload.guardianId && studentId) {
    const { error } = await supabase.from('guardian_links').upsert(
      {
        tenant_id: tenantId,
        guardian_id: payload.guardianId,
        student_id: studentId,
        relation: payload.guardianRelation,
        is_primary: true,
        can_pick_up: payload.canPickUp,
      },
      { onConflict: 'guardian_id,student_id' },
    );
    if (error) console.error('[students] rattachement tuteur', error.message);
  }

  await journaliser(tenantId, session.email, session.membership.roleName, {
    action: isEdit ? 'students.update' : 'students.create',
    domain: 'students',
    severity: 'info',
    resourceType: 'Élève',
    resourceId: studentId,
    resourceLabel: `${payload.firstName} ${payload.lastName} (${payload.matricule})`,
    detail: payload.isDraft
      ? 'Dossier enregistré en brouillon : il reste incomplet.'
      : `Dossier ${isEdit ? 'modifié' : 'créé'}.`,
  });

  revalidatePath(`/${tenantSlug}/students`);
  return { success: 'Dossier enregistré.', id: studentId };
}

/** Traduit les contraintes de la base en phrases compréhensibles. */
function messageLisible(brut: string): string {
  if (brut.includes('students_tenant_id_matricule_key')) {
    return 'Ce matricule est déjà attribué à un autre élève.';
  }
  if (brut.includes("n'appartient pas")) return brut;
  return 'L’enregistrement a échoué.';
}
