import type { Guardian, GuardianLink } from '@/types';
import { STUDENTS, STUDENT_GUARDIAN_SEED } from './students';

/**
 * Parents et tuteurs de l'établissement.
 *
 * Construits par déduplication de la graine élève sur le couple
 * (nom, téléphone) : trois familles partagent volontairement un même tuteur,
 * afin d'éprouver le rattachement à plusieurs enfants.
 *
 * REMPLACEMENT SUPABASE : tables `guardians` et `guardian_students`.
 */
const PROFESSIONS = [
  'Commerçante',
  'Fonctionnaire',
  'Enseignant',
  'Infirmière',
  'Chauffeur',
  'Ingénieur',
  'Artisan',
  'Cadre bancaire',
  'Agricultrice',
  'Sans emploi déclaré',
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
];

function emailFor(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .replace(new RegExp('[^a-z]+', 'g'), '.');
  return `${slug}@mail.ga`;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(' ');
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' ') || parts[0] || '',
  };
}

const guardians: Guardian[] = [];
const links: GuardianLink[] = [];
const byKey = new Map<string, Guardian>();
const studentByMatricule = new Map(
  STUDENTS.map((student) => [student.matricule, student]),
);

STUDENT_GUARDIAN_SEED.forEach((seed, index) => {
  const student = studentByMatricule.get(seed.matricule);
  if (!student) return;

  const key = `${seed.guardianName}|${seed.guardianPhone}`;
  let guardian = byKey.get(key);

  if (!guardian) {
    const { firstName, lastName } = splitName(seed.guardianName);
    guardian = {
      id: `grd-${`${guardians.length + 1}`.padStart(3, '0')}`,
      firstName,
      lastName,
      phone: seed.guardianPhone,
      altPhone: index % 4 === 0 ? '+241 01 76 30 12' : '',
      email: emailFor(seed.guardianName),
      address: QUARTERS[guardians.length % QUARTERS.length],
      profession: PROFESSIONS[guardians.length % PROFESSIONS.length],
      idDocument:
        index % 3 === 0
          ? `CNI n° ${1200000 + index * 37}`
          : `Passeport n° GA${450000 + index * 13}`,
      notes: '',
      status: 'actif',
    };
    byKey.set(key, guardian);
    guardians.push(guardian);
  }

  const alreadyLinked = links.some(
    (link) => link.guardianId === guardian.id && link.studentId === student.id,
  );
  if (alreadyLinked) return;

  const isFirstChild = !links.some((link) => link.guardianId === guardian.id);

  links.push({
    id: `gl-${guardian.id}-${student.id}`,
    guardianId: guardian.id,
    studentId: student.id,
    relation: seed.relation,
    isPrimary: true,
    // Les étudiants du supérieur sont majeurs : personne ne « récupère » un adulte.
    canPickUp: seed.relation !== 'autre' && isFirstChild,
  });
});

export const GUARDIANS: Guardian[] = guardians;
export const GUARDIAN_LINKS: GuardianLink[] = links;
