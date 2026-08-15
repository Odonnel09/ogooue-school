import type { TemplateAsset } from '@/types';

/**
 * Préparation des images téléversées.
 *
 * Faute de stockage de fichiers à cette étape, les images vivent en `data:`
 * dans la configuration, elle-même persistée en `localStorage` (~5 Mo au
 * total). Elles sont donc redimensionnées et recompressées avant stockage,
 * et refusées au-delà d'un seuil.
 *
 * REMPLACEMENT SUPABASE : upload vers Storage, seule l'URL signée est conservée.
 */

/** Au-delà, l'image ferait courir un risque de dépassement du quota local. */
export const MAX_ASSET_BYTES = 900_000;

export const ACCEPTED_IMAGE_TYPES = 'image/png,image/jpeg,image/webp,image/svg+xml';

export class ImageTooLargeError extends Error {
  constructor(public readonly size: number) {
    super('Image trop lourde après compression.');
    this.name = 'ImageTooLargeError';
  }
}

/** Longueur approximative en octets d'une chaîne `data:`. */
function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? '';
  return Math.round((base64.length * 3) / 4);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Fichier image illisible.'));
    image.src = dataUrl;
  });
}

/**
 * Lit un fichier image, le redimensionne à `maxWidth` et le recompresse.
 * Les SVG sont conservés tels quels : les vectoriser à nouveau n'a pas de sens.
 */
export async function fileToAsset(
  file: File,
  maxWidth = 1600,
): Promise<TemplateAsset> {
  const original = await readAsDataUrl(file);

  if (file.type === 'image/svg+xml') {
    const size = dataUrlBytes(original);
    if (size > MAX_ASSET_BYTES) throw new ImageTooLargeError(size);
    return { name: file.name, dataUrl: original, size };
  }

  const image = await loadImage(original);
  const ratio = Math.min(1, maxWidth / image.width);
  const width = Math.round(image.width * ratio);
  const height = Math.round(image.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Traitement de l’image impossible.');
  context.drawImage(image, 0, 0, width, height);

  // Le PNG préserve la transparence, indispensable pour un logo ou un cachet.
  const hasAlpha = file.type === 'image/png' || file.type === 'image/webp';
  const dataUrl = hasAlpha
    ? canvas.toDataURL('image/png')
    : canvas.toDataURL('image/jpeg', 0.85);

  const size = dataUrlBytes(dataUrl);
  if (size > MAX_ASSET_BYTES) throw new ImageTooLargeError(size);

  return { name: file.name, dataUrl, size };
}

/** « 245 Ko ». */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
