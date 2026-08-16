import type { StudentFieldKey } from '@/lib/school-levels/capabilities';
import { normalize } from '@/lib/utils';

/**
 * COLONNES ATTENDUES À L'IMPORT.
 *
 * La liste n'est pas figée : elle se restreint aux blocs déclarés par les
 * cycles actifs, exactement comme le formulaire élève. Désactiver le collège
 * dans Paramètres retire les colonnes que seul le collège exigeait, et le
 * modèle téléchargeable change avec.
 */
export interface ImportColumn {
  key: string;
  label: string;
  required: boolean;
  /** Bloc de la matrice de capacités dont dépend la colonne. */
  field?: StudentFieldKey;
  hint: string;
  /** Exemple porté par le modèle téléchargeable. */
  sample: string;
  /** Intitulés reconnus automatiquement au mappage. */
  aliases: string[];
}

const COLUMNS: ImportColumn[] = [
  {
    key: 'lastName',
    label: 'Nom',
    required: true,
    hint: 'Nom de famille de l’élève.',
    sample: 'Obame',
    aliases: ['nom', 'nom de famille', 'last name', 'surname'],
  },
  {
    key: 'firstName',
    label: 'Prénom',
    required: true,
    hint: 'Prénom usuel.',
    sample: 'Kevin',
    aliases: ['prenom', 'prenoms', 'first name', 'given name'],
  },
  {
    key: 'matricule',
    label: 'Matricule',
    required: true,
    hint: 'Identifiant unique dans l’établissement.',
    sample: 'MAT-3001',
    aliases: ['matricule', 'numero', 'identifiant', 'code eleve', 'id'],
  },
  {
    key: 'birthDate',
    label: 'Date de naissance',
    required: true,
    hint: 'Formats acceptés : 12/05/2014 ou 2014-05-12.',
    sample: '12/05/2014',
    aliases: ['date de naissance', 'naissance', 'ne le', 'birth date', 'dob'],
  },
  {
    key: 'gender',
    label: 'Sexe',
    required: true,
    hint: 'M, F, Masculin, Féminin, Garçon ou Fille.',
    sample: 'M',
    aliases: ['sexe', 'genre', 'gender'],
  },
  {
    key: 'className',
    label: 'Classe',
    required: true,
    hint: 'Nom exact de la classe, telle qu’elle existe dans l’établissement.',
    sample: '6ème A',
    aliases: ['classe', 'class', 'groupe', 'promotion', 'section'],
  },
  {
    key: 'birthPlace',
    label: 'Lieu de naissance',
    required: false,
    field: 'birthPlace',
    hint: 'Ville de naissance.',
    sample: 'Libreville',
    aliases: ['lieu de naissance', 'ville de naissance', 'birth place'],
  },
  {
    key: 'nationality',
    label: 'Nationalité',
    required: false,
    field: 'nationality',
    hint: 'Vide, la valeur « Gabonaise » est appliquée.',
    sample: 'Gabonaise',
    aliases: ['nationalite', 'nationality'],
  },
  {
    key: 'address',
    label: 'Adresse',
    required: false,
    field: 'address',
    hint: 'Quartier et ville de résidence.',
    sample: 'Quartier Nzeng-Ayong, Libreville',
    aliases: ['adresse', 'domicile', 'address'],
  },
  {
    key: 'previousSchool',
    label: 'Établissement précédent',
    required: false,
    field: 'previousSchool',
    hint: 'Dernier établissement fréquenté.',
    sample: 'École publique de Nkembo',
    aliases: [
      'etablissement precedent',
      'ancienne ecole',
      'ecole precedente',
      'previous school',
    ],
  },
  {
    key: 'medicalInfo',
    label: 'Informations médicales',
    required: false,
    field: 'medicalInfo',
    hint: 'Allergies, traitements en cours, précautions.',
    sample: 'Asthme léger',
    aliases: ['informations medicales', 'sante', 'allergies', 'medical'],
  },
];

/** Colonnes retenues pour les blocs actifs de l'établissement. */
export function columnsFor(fields: StudentFieldKey[]): ImportColumn[] {
  return COLUMNS.filter(
    (column) => !column.field || fields.includes(column.field),
  );
}

/**
 * Réduit un intitulé à ses seules lettres et chiffres.
 * « Prénom(s) », « PRENOMS » et « prénom s » se ramènent ainsi à la même clé,
 * à condition d'appliquer la même réduction des deux côtés de la comparaison.
 */
function fingerprint(value: string): string {
  return normalize(value).replace(/[^a-z0-9]/g, '');
}

/**
 * Mappage automatique d'un intitulé de fichier vers une colonne cible.
 * La comparaison ignore la casse, les accents, les espaces et la ponctuation.
 */
export function guessColumn(
  header: string,
  columns: ImportColumn[],
): string | null {
  const cleaned = fingerprint(header);
  if (!cleaned) return null;

  const match = columns.find(
    (column) =>
      fingerprint(column.label) === cleaned ||
      column.aliases.some((alias) => fingerprint(alias) === cleaned),
  );

  return match?.key ?? null;
}
