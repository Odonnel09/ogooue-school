/**
 * Manipulation des montants.
 *
 * Le franc CFA n'a pas de subdivision d'usage : **tous les montants sont des
 * entiers**. Aucun `float` ne doit approcher l'argent — une addition flottante
 * qui dérive de quelques centimes sur un exercice comptable est indéfendable.
 */
export const CURRENCY = 'XAF' as const;

const FORMATTER = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 0,
  useGrouping: true,
});

/** « 150000 » → « 150 000 FCFA ». */
export function formatMoney(amount: number): string {
  return `${FORMATTER.format(Math.round(amount))} FCFA`;
}

/** Montant sans le suffixe, pour les colonnes de tableau serrées. */
export function formatAmount(amount: number): string {
  return FORMATTER.format(Math.round(amount));
}

/** Somme entière d'une liste de montants. */
export function sumAmounts(amounts: number[]): number {
  return amounts.reduce((total, amount) => total + Math.round(amount), 0);
}

/** Part d'un total, arrondie à l'entier — la somme des parts reste juste. */
export function share(total: number, percent: number): number {
  return Math.round((total * percent) / 100);
}

/** Taux de recouvrement en pourcentage entier. */
export function collectionRate(collected: number, expected: number): number {
  if (expected <= 0) return 0;
  return Math.min(100, Math.round((collected / expected) * 100));
}
