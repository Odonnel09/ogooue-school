/**
 * Export CSV local.
 * REMPLACEMENT SUPABASE : l'export sera généré côté serveur (Route Handler)
 * pour appliquer les règles d'isolation par établissement.
 */
function escapeCell(value: string): string {
  const needsQuotes = /[";\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

/** Marque d'ordre d'octets : garantit l'affichage des accents dans Excel. */
const BOM = '﻿';

/**
 * Déclenche le téléchargement d'un fichier CSV à partir d'un tableau de lignes.
 * Le séparateur `;` est celui attendu par Excel en configuration francophone.
 */
export function downloadCsv(
  fileName: string,
  headers: string[],
  rows: string[][],
): void {
  const lines = [headers, ...rows]
    .map((row) => row.map(escapeCell).join(';'))
    .join('\r\n');

  const blob = new Blob([`${BOM}${lines}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
