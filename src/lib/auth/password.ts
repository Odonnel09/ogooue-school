/**
 * ROBUSTESSE D'UN MOT DE PASSE.
 *
 * Fonction pure, sans dépendance : quatre règles lisibles valent mieux qu'une
 * bibliothèque de 200 Ko pour un indicateur d'interface.
 *
 * ⚠️ Cet indicateur **aide** l'utilisateur, il ne protège rien. La politique
 * qui fait foi est celle appliquée par Supabase Auth au moment de
 * l'enregistrement ; c'est elle qui refuse un mot de passe, pas cet écran.
 * Le mot de passe n'est ni journalisé, ni conservé, ni envoyé ailleurs qu'au
 * service d'authentification.
 */
export interface PasswordRule {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordStrength {
  /** Nombre de règles satisfaites, de 0 à 4. */
  score: number;
  label: string;
  /** Classe de couleur de la jauge, alignée sur la palette du projet. */
  tone: 'red' | 'orange' | 'yellow' | 'green';
  rules: PasswordRule[];
}

const LABELS = [
  'Très faible',
  'Faible',
  'Correct',
  'Bon',
  'Excellent',
] as const;

const TONES: PasswordStrength['tone'][] = [
  'red',
  'red',
  'orange',
  'yellow',
  'green',
];

export function passwordStrength(value: string): PasswordStrength {
  const rules: PasswordRule[] = [
    {
      id: 'length',
      label: 'Au moins 10 caractères',
      met: value.length >= 10,
    },
    {
      id: 'case',
      label: 'Des minuscules et des majuscules',
      met: /[a-z]/.test(value) && /[A-Z]/.test(value),
    },
    {
      id: 'digit',
      label: 'Au moins un chiffre',
      met: /\d/.test(value),
    },
    {
      id: 'symbol',
      label: 'Au moins un caractère spécial',
      met: /[^\w\s]/.test(value),
    },
  ];

  const score = rules.filter((rule) => rule.met).length;

  return {
    score,
    label: LABELS[score],
    tone: TONES[score],
    rules,
  };
}
