'use client';

import { useState } from 'react';
import { ImageOff, Trash2, Upload } from 'lucide-react';
import type { TemplateAsset } from '@/types';
import { EMPTY_ASSET } from '@/types';
import {
  ACCEPTED_IMAGE_TYPES,
  fileToAsset,
  formatBytes,
  ImageTooLargeError,
  MAX_ASSET_BYTES,
} from '@/lib/images';
import { cn } from '@/lib/utils';
import { Button } from './Button';

/**
 * Champ de téléversement d'image avec aperçu.
 *
 * L'image est redimensionnée et recompressée avant d'entrer dans la
 * configuration : sans cela, un scan de papier à en-tête saturerait le stockage
 * local en une seule fois.
 */
export function AssetUpload({
  label,
  hint,
  value,
  onChange,
  maxWidth = 1600,
  previewClassName,
  onError,
}: {
  label: string;
  hint?: string;
  value: TemplateAsset;
  onChange: (asset: TemplateAsset) => void;
  /** Largeur maximale après redimensionnement. */
  maxWidth?: number;
  previewClassName?: string;
  onError?: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      onChange(await fileToAsset(file, maxWidth));
    } catch (error) {
      onError?.(
        error instanceof ImageTooLargeError
          ? `Image trop lourde (${formatBytes(error.size)}). Le maximum est de ${formatBytes(MAX_ASSET_BYTES)} après compression : réduisez ses dimensions.`
          : error instanceof Error
            ? error.message
            : 'Téléversement impossible.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-0">
      <p className="block text-sm font-medium text-slate-700 mb-1.5">{label}</p>

      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-24 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0',
            previewClassName,
          )}
        >
          {value.dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value.dataUrl}
              alt={value.name || label}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <ImageOff size={20} className="text-slate-300" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <label
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-colors cursor-pointer focus-within:ring-4 focus-within:ring-brand-500/20',
                busy
                  ? 'border-slate-100 bg-slate-50 text-slate-400 pointer-events-none'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
              )}
            >
              <Upload size={15} aria-hidden="true" />
              {busy ? 'Traitement...' : 'Choisir un fichier'}
              <input
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleFile(file);
                  event.target.value = '';
                }}
              />
            </label>

            {value.dataUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange(EMPTY_ASSET)}
              >
                <Trash2 size={15} aria-hidden="true" /> Retirer
              </Button>
            )}
          </div>

          {value.dataUrl ? (
            <p className="text-xs text-slate-500 truncate">
              {value.name} · {formatBytes(value.size)}
            </p>
          ) : (
            hint && <p className="text-xs text-slate-400">{hint}</p>
          )}
        </div>
      </div>
    </div>
  );
}
