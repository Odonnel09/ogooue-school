/** Concatène des classes Tailwind en ignorant les valeurs falsy. */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(' ');
}

let idCounter = 0;

/**
 * Génère un identifiant local unique.
 * À n'appeler que dans un gestionnaire d'événement (jamais pendant le rendu)
 * afin d'éviter tout écart d'hydratation.
 */
export function createId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}${idCounter.toString(36)}`;
}

const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** « 2026-10-12 » → « 12 oct. 2026 ». Renvoie « — » si la date est vide. */
export function formatDate(iso: string): string {
  if (!iso) return '—';
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return DATE_FORMATTER.format(date);
}

export function formatLongDate(iso: string): string {
  if (!iso) return '—';
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return LONG_DATE_FORMATTER.format(date);
}

/** Date du jour au format « YYYY-MM-DD » (fuseau local). */
export function todayIso(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Âge en années à partir d'une date de naissance ISO. */
export function ageFromBirthDate(iso: string): number | null {
  if (!iso) return null;
  const birth = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

/** « Jean Ndong » → « JN ». */
export function initials(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .map((part) => part.trim().charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/** Plage des diacritiques combinants, construite sans caractère littéral. */
const DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g');

/** Normalise une chaîne pour la recherche (minuscules, sans accents). */
export function normalize(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(DIACRITICS, '');
}

/** Vrai si `haystack` contient `needle`, accents et casse ignorés. */
export function matches(haystack: string, needle: string): boolean {
  if (!needle.trim()) return true;
  return normalize(haystack).includes(normalize(needle));
}

/** Formate une note selon le barème : « 15,5/20 ». */
export function formatScore(score: number | null, maxScore: number): string {
  if (score === null) return '—';
  const rounded = Math.round(score * 100) / 100;
  return `${rounded.toString().replace('.', ',')}/${maxScore}`;
}

/** Moyenne arrondie à 2 décimales, `null` si aucune valeur. */
export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((total, value) => total + value, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

/** Convertit « 08:30 » en minutes depuis minuit. */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/** URL d'avatar déterministe (même service que le tableau de bord). */
export function avatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}
