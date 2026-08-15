import type { BadgeTone, GradingScale } from '@/types';

/**
 * Définition des barèmes de saisie.
 *
 * Un barème est soit **numérique** (une note bornée par un maximum), soit
 * **symbolique** (un jeu fermé de valeurs, chacune portant un poids qui permet
 * de la ramener sur l'échelle normalisée /20).
 */
export interface SymbolicValue {
  value: string;
  label: string;
  /** Poids entre 0 et 1, utilisé pour la normalisation. */
  weight: number;
  tone: BadgeTone;
}

export interface ScaleDefinition {
  kind: 'numeric' | 'symbolic';
  label: string;
  /** Note maximale par défaut (barèmes numériques). */
  defaultMax: number;
  /** L'utilisateur peut-il changer la note maximale ? */
  editableMax: boolean;
  values: SymbolicValue[];
}

export const SCALES: Record<GradingScale, ScaleDefinition> = {
  sur_20: {
    kind: 'numeric',
    label: 'Note sur 20',
    defaultMax: 20,
    editableMax: false,
    values: [],
  },
  sur_10: {
    kind: 'numeric',
    label: 'Note sur 10',
    defaultMax: 10,
    editableMax: false,
    values: [],
  },
  pourcentage: {
    kind: 'numeric',
    label: 'Pourcentage',
    defaultMax: 100,
    editableMax: false,
    values: [],
  },
  personnalise: {
    kind: 'numeric',
    label: 'Échelle personnalisée',
    defaultMax: 20,
    editableMax: true,
    values: [],
  },
  ects: {
    kind: 'numeric',
    label: 'Note sur 20 (crédits ECTS)',
    defaultMax: 20,
    editableMax: false,
    values: [],
  },
  acquis: {
    kind: 'symbolic',
    label: 'Acquis / Non acquis',
    defaultMax: 0,
    editableMax: false,
    values: [
      { value: 'acquis', label: 'Acquis', weight: 1, tone: 'green' },
      {
        value: 'en_cours',
        label: 'En cours d’acquisition',
        weight: 0.5,
        tone: 'orange',
      },
      { value: 'non_acquis', label: 'Non acquis', weight: 0, tone: 'red' },
    ],
  },
  competence: {
    kind: 'symbolic',
    label: 'Niveau de compétence',
    defaultMax: 0,
    editableMax: false,
    values: [
      { value: 'maitrise', label: 'Maîtrise', weight: 1, tone: 'green' },
      { value: 'partiel', label: 'Partiellement acquis', weight: 0.66, tone: 'blue' },
      { value: 'fragile', label: 'Fragile', weight: 0.33, tone: 'orange' },
      { value: 'insuffisant', label: 'Insuffisant', weight: 0, tone: 'red' },
    ],
  },
};

export function scaleOf(scale: GradingScale): ScaleDefinition {
  return SCALES[scale];
}

export function isSymbolic(scale: GradingScale): boolean {
  return SCALES[scale].kind === 'symbolic';
}

export function symbolicValue(
  scale: GradingScale,
  value: string,
): SymbolicValue | undefined {
  return SCALES[scale].values.find((item) => item.value === value);
}

/** Échelle de référence commune à tous les barèmes, pour les moyennes. */
export const NORMALIZED_MAX = 20;

/**
 * Ramène une note sur l'échelle normalisée /20, quel que soit le barème.
 * Renvoie `null` si la note n'est pas saisie ou si la valeur est inconnue.
 */
export function normalize(
  scale: GradingScale,
  score: number | null,
  value: string | null,
  maxScore: number,
): number | null {
  if (isSymbolic(scale)) {
    if (!value) return null;
    const match = symbolicValue(scale, value);
    return match ? match.weight * NORMALIZED_MAX : null;
  }
  if (score === null) return null;
  if (maxScore <= 0) return null;
  return (score / maxScore) * NORMALIZED_MAX;
}
