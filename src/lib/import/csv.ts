/**
 * LECTURE DE FICHIERS TABULAIRES.
 *
 * Pourquoi pas de bibliothèque : Excel enregistre en CSV nativement, et un
 * analyseur conforme tient en cinquante lignes. `GEMINI.md` interdit les
 * dépendances inutiles ; le format `.xlsx` — une archive ZIP de XML — sera lu
 * **côté serveur** au moment de Supabase, là où l'on doit de toute façon
 * revalider le fichier. Faire confiance à un fichier analysé par le navigateur
 * violerait la règle « toujours valider côté serveur ».
 *
 * Le séparateur est détecté : Excel francophone écrit `;`, les exports
 * anglophones et les outils en ligne écrivent `,`, les copiers-collers depuis
 * un tableur donnent des tabulations.
 */

export interface ParsedSheet {
  headers: string[];
  /** Lignes de données, alignées sur `headers` et complétées si trop courtes. */
  rows: string[][];
  delimiter: string;
}

export class CsvError extends Error {}

const DELIMITERS = [';', ',', '\t', '|'];

/** Retient le séparateur le plus fréquent hors guillemets sur la première ligne. */
function detectDelimiter(firstLine: string): string {
  let best = ';';
  let bestCount = 0;

  DELIMITERS.forEach((candidate) => {
    let count = 0;
    let inQuotes = false;

    for (let index = 0; index < firstLine.length; index += 1) {
      const character = firstLine[index];
      if (character === '"') inQuotes = !inQuotes;
      else if (character === candidate && !inQuotes) count += 1;
    }

    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  });

  return best;
}

/**
 * Analyse un texte délimité en respectant les guillemets.
 * Les doubles guillemets à l'intérieur d'un champ échappent un guillemet,
 * conformément à l'usage d'Excel comme à la RFC 4180.
 */
export function parseDelimited(text: string): ParsedSheet {
  // Retire la marque d'ordre d'octets qu'Excel ajoute à ses exports UTF-8.
  const clean = text.replace(/^﻿/, '');
  if (!clean.trim()) throw new CsvError('Le fichier est vide.');

  const firstBreak = clean.search(/\r?\n/);
  const firstLine = firstBreak === -1 ? clean : clean.slice(0, firstBreak);
  const delimiter = detectDelimiter(firstLine);

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < clean.length; index += 1) {
    const character = clean[index];

    if (inQuotes) {
      if (character === '"') {
        if (clean[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      inQuotes = true;
    } else if (character === delimiter) {
      row.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      // Un CRLF ne doit produire qu'une seule fin de ligne.
      if (character === '\r' && clean[index + 1] === '\n') index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  // Dernière ligne, si le fichier ne se termine pas par un saut de ligne.
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const cleaned = rows.filter((line) =>
    line.some((cell) => cell.trim() !== ''),
  );

  if (cleaned.length === 0) throw new CsvError('Le fichier est vide.');

  const headers = cleaned[0].map((header) => header.trim());
  if (headers.every((header) => header === '')) {
    throw new CsvError(
      'La première ligne doit contenir les intitulés de colonnes.',
    );
  }

  const body = cleaned.slice(1).map((line) => {
    const padded = line.slice(0, headers.length);
    while (padded.length < headers.length) padded.push('');
    return padded.map((cell) => cell.trim());
  });

  return { headers, rows: body, delimiter };
}

/** Extensions reconnues par l'assistant. */
export const ACCEPTED_EXTENSIONS = ['.csv', '.tsv', '.txt'] as const;

export function isWorkbook(fileName: string): boolean {
  return /\.(xlsx|xls|ods)$/i.test(fileName);
}

export function isAcceptedFile(fileName: string): boolean {
  return ACCEPTED_EXTENSIONS.some((extension) =>
    fileName.toLowerCase().endsWith(extension),
  );
}
