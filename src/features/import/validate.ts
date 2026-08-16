import type { Gender, SchoolClass, Student } from '@/types';
import { normalize } from '@/lib/utils';
import type { ImportColumn } from './columns';

/**
 * CONTRÔLE LIGNE À LIGNE.
 *
 * Un fichier venu d'un secrétariat n'est jamais propre : dates au format
 * français, sexe écrit « Garçon », classe nommée « 6e A » au lieu de
 * « 6ème A ». On tolère ce qui est déchiffrable sans ambiguïté et on refuse
 * le reste, ligne par ligne — jamais le fichier entier.
 *
 * ⚠️ Ces contrôles seront rejoués côté serveur. Une ligne validée par le
 * navigateur n'est pas une ligne validée.
 */

export type RowStatus = 'valide' | 'erreur' | 'doublon';

export interface RowIssue {
  column: string;
  message: string;
}

export interface CheckedRow {
  /** Numéro de ligne dans le fichier, en-tête comprise — celui d'Excel. */
  line: number;
  status: RowStatus;
  issues: RowIssue[];
  values: Record<string, string>;
  /** Élève reconstitué, présent seulement si la ligne est exploitable. */
  student: Omit<Student, 'id'> | null;
}

/* -------------------------------------------------------------------------- */
/* Conversions tolérantes                                                      */
/* -------------------------------------------------------------------------- */

const MALE = ['m', 'masculin', 'garcon', 'homme', 'male', 'h'];
const FEMALE = ['f', 'feminin', 'fille', 'femme', 'female'];

function readGender(raw: string): Gender | null {
  const value = normalize(raw).trim();
  if (MALE.includes(value)) return 'M';
  if (FEMALE.includes(value)) return 'F';
  return null;
}

/** Accepte « 12/05/2014 », « 12-05-2014 » et « 2014-05-12 ». */
function readDate(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (iso) return isRealDate(iso[1], iso[2], iso[3]) ? value : null;

  const french = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/.exec(value);
  if (french) {
    const day = french[1].padStart(2, '0');
    const month = french[2].padStart(2, '0');
    return isRealDate(french[3], month, day)
      ? `${french[3]}-${month}-${day}`
      : null;
  }

  return null;
}

/** Écarte le 31 février : `Date` le décalerait silencieusement au 3 mars. */
function isRealDate(year: string, month: string, day: string): boolean {
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return (
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
  );
}

/** Rapproche « 6e A », « 6EME A » et « 6ème A » de la même classe. */
function readClass(raw: string, classes: SchoolClass[]): SchoolClass | null {
  const wanted = normalize(raw).replace(/eme|ere|e\b/g, '').replace(/\s+/g, '');
  if (!wanted) return null;

  return (
    classes.find(
      (item) =>
        normalize(item.name).replace(/eme|ere|e\b/g, '').replace(/\s+/g, '') ===
        wanted,
    ) ?? null
  );
}

/* -------------------------------------------------------------------------- */
/* Contrôle du fichier                                                         */
/* -------------------------------------------------------------------------- */

export interface CheckOptions {
  rows: string[][];
  /** Index de colonne du fichier pour chaque clé cible, -1 si non mappée. */
  mapping: Record<string, number>;
  columns: ImportColumn[];
  classes: SchoolClass[];
  existingMatricules: string[];
  academicYear: string;
  today: string;
}

export function checkRows({
  rows,
  mapping,
  columns,
  classes,
  existingMatricules,
  academicYear,
  today,
}: CheckOptions): CheckedRow[] {
  const taken = new Set(
    existingMatricules.map((matricule) => matricule.toLowerCase()),
  );
  /** Matricules rencontrés dans le fichier : le doublon interne compte aussi. */
  const seen = new Set<string>();

  return rows.map((row, index) => {
    const issues: RowIssue[] = [];
    const values: Record<string, string> = {};

    columns.forEach((column) => {
      const position = mapping[column.key];
      values[column.key] = position >= 0 ? (row[position] ?? '') : '';
    });

    columns
      .filter((column) => column.required && !values[column.key])
      .forEach((column) => {
        issues.push({
          column: column.key,
          message: `${column.label} : valeur manquante.`,
        });
      });

    const gender = readGender(values.gender ?? '');
    if (values.gender && !gender) {
      issues.push({
        column: 'gender',
        message: `Sexe « ${values.gender} » non reconnu. Utilisez M ou F.`,
      });
    }

    const birthDate = readDate(values.birthDate ?? '');
    if (values.birthDate && !birthDate) {
      issues.push({
        column: 'birthDate',
        message: `Date « ${values.birthDate} » illisible. Attendu : 12/05/2014.`,
      });
    }
    if (birthDate && birthDate > today) {
      issues.push({
        column: 'birthDate',
        message: 'La date de naissance est postérieure à aujourd’hui.',
      });
    }

    const schoolClass = readClass(values.className ?? '', classes);
    if (values.className && !schoolClass) {
      issues.push({
        column: 'className',
        message: `Classe « ${values.className} » introuvable dans l’établissement.`,
      });
    }

    const matricule = (values.matricule ?? '').trim();
    const key = matricule.toLowerCase();
    let duplicate = false;

    if (matricule) {
      if (taken.has(key)) {
        duplicate = true;
        issues.push({
          column: 'matricule',
          message: `Le matricule ${matricule} existe déjà dans l’établissement.`,
        });
      } else if (seen.has(key)) {
        duplicate = true;
        issues.push({
          column: 'matricule',
          message: `Le matricule ${matricule} apparaît plusieurs fois dans le fichier.`,
        });
      } else {
        seen.add(key);
      }
    }

    const usable =
      issues.length === 0 && gender && birthDate && schoolClass && matricule;

    return {
      line: index + 2,
      status: duplicate ? 'doublon' : issues.length > 0 ? 'erreur' : 'valide',
      issues,
      values,
      student: usable
        ? {
            firstName: values.firstName,
            lastName: values.lastName,
            matricule,
            birthDate,
            birthPlace: values.birthPlace ?? '',
            gender,
            nationality: values.nationality || 'Gabonaise',
            address: values.address ?? '',
            classId: schoolClass.id,
            levelId: schoolClass.levelId,
            academicYear,
            status: 'actif',
            medicalInfo: values.medicalInfo ?? '',
            previousSchool: values.previousSchool ?? '',
            filiere: '',
            parcours: '',
            documents: [],
            enrollment: [
              {
                id: `imp-${matricule}`,
                academicYear,
                className: schoolClass.name,
                date: today,
                label: 'Inscription enregistrée par import de fichier',
              },
            ],
            createdAt: today,
            isDraft: false,
          }
        : null,
    };
  });
}

export interface ImportSummary {
  total: number;
  valid: number;
  errors: number;
  duplicates: number;
}

export function summarize(rows: CheckedRow[]): ImportSummary {
  return {
    total: rows.length,
    valid: rows.filter((row) => row.status === 'valide').length,
    errors: rows.filter((row) => row.status === 'erreur').length,
    duplicates: rows.filter((row) => row.status === 'doublon').length,
  };
}
