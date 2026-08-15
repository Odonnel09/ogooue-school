/**
 * GABARITS DE DOCUMENTS.
 *
 * Un gabarit n'est **pas** une mise en page déduite d'un fichier téléversé :
 * ce serait une approximation, non reproductible, incompatible avec
 * l'immuabilité exigée d'un bulletin publié.
 *
 * C'est une configuration structurée — image de fond, logo, cachet, couleurs,
 * libellés, colonnes visibles — par-dessus laquelle le document se compose.
 * Le rendu reste donc déterministe et peut être figé mot pour mot dans
 * l'instantané d'un bulletin.
 */

/** Nature du gabarit. `overlay` (placement sur PDF) viendra avec le serveur. */
export type TemplateKind = 'composed' | 'overlay';

/** Image téléversée, conservée en `data:` tant que le stockage n'existe pas. */
export interface TemplateAsset {
  /** Nom du fichier d'origine, affiché à l'administrateur. */
  name: string;
  /** Contenu encodé. Vide si aucune image n'est définie. */
  dataUrl: string;
  /** Taille approximative en octets, pour surveiller le quota local. */
  size: number;
}

export const EMPTY_ASSET: TemplateAsset = { name: '', dataUrl: '', size: 0 };

/** Colonnes optionnelles du tableau de notes d'un bulletin. */
export type ReportColumnKey =
  | 'teacher'
  | 'coefficient'
  | 'classAverage'
  | 'lowest'
  | 'best';

export interface DocumentTemplate {
  kind: TemplateKind;
  /** Papier à en-tête ou formulaire officiel scanné, posé en fond. */
  background: TemplateAsset;
  /** Opacité du fond, en pourcentage — pour garder le texte lisible. */
  backgroundOpacity: number;
  logo: TemplateAsset;
  /** Cachet de l'établissement, apposé près de la signature. */
  stamp: TemplateAsset;
  /** Couleur d'accent, au format hexadécimal. */
  accentColor: string;
  /** Titre imprimé en tête du document. */
  documentTitle: string;
  /** Mention légale ou administrative en pied de page. */
  footerText: string;
  /** Colonnes affichées dans le tableau de notes (bulletins). */
  columns: ReportColumnKey[];
  /** Modèle de référence conservé pour comparaison, jamais interprété. */
  referenceFile: TemplateAsset;
}

/** Signature manuscrite du chef d'établissement. */
export interface SignatureConfig {
  /** Image de la signature, tracée ou téléversée. */
  image: TemplateAsset;
  /** Nom et qualité du signataire, imprimés sous la signature. */
  signerName: string;
  signerRole: string;
}

export const EMPTY_SIGNATURE: SignatureConfig = {
  image: EMPTY_ASSET,
  signerName: '',
  signerRole: 'Chef d’établissement',
};

/** Signature réellement apposée sur un document, figée à la publication. */
export interface AppliedSignature {
  dataUrl: string;
  signerName: string;
  signerRole: string;
  signedAt: string;
}
