/**
 * Styles partagés par tous les contrôles de saisie.
 *
 * Isolés ici pour qu'un champ de texte, une liste déroulante et un sélecteur
 * de date aient rigoureusement la même hauteur, le même rayon et le même
 * anneau de focus — c'est ce qui fait tenir un formulaire visuellement.
 */

export const CONTROL_BASE =
  'block w-full py-3 px-4 bg-slate-50 border border-transparent rounded-xl text-sm text-slate-900 placeholder-slate-400 focus-visible:border-brand-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand-500/10 transition-all duration-300 outline-none disabled:opacity-60 disabled:cursor-not-allowed';

export const CONTROL_INVALID =
  'border-red-300 bg-red-50/50 focus-visible:border-red-500 focus-visible:ring-red-500/10';

/**
 * Déclencheur d'un panneau (liste déroulante, calendrier).
 * Même gabarit que `CONTROL_BASE`, mais en `flex` pour poser l'étiquette à
 * gauche et le chevron à droite, et avec un état ouvert explicite.
 */
export const TRIGGER_BASE =
  'flex w-full items-center gap-2 py-3 px-4 bg-slate-50 border border-transparent rounded-xl text-sm text-left transition-all duration-300 outline-none cursor-pointer hover:bg-slate-100/80 focus-visible:border-brand-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand-500/10 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-slate-50';

export const TRIGGER_OPEN =
  'border-brand-500 bg-white ring-4 ring-brand-500/10 hover:bg-white';

/** Élément d'une liste : la ligne survolée et la ligne active partagent le style. */
export const OPTION_BASE =
  'flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-left rounded-xl transition-colors cursor-pointer select-none';
