'use client';

import { useRef, useState } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { importMessages as m } from '../messages';

/**
 * Zone de dépôt.
 *
 * Le clavier n'est pas oublié : la zone est un `<button>` qui ouvre le
 * sélecteur natif. Le glisser-déposer est un confort ajouté par-dessus, pas
 * le seul chemin.
 */
export function DropZone({
  onFile,
  accept,
}: {
  onFile: (file: File) => void;
  accept: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files[0];
          if (file) onFile(file);
        }}
        className={cn(
          'w-full rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20',
          dragging
            ? 'border-brand-500 bg-brand-50'
            : 'border-slate-200 bg-slate-50/60 hover:border-brand-300 hover:bg-brand-50/40',
        )}
      >
        <span
          className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors',
            dragging ? 'bg-brand-100 text-brand-600' : 'bg-white text-slate-400',
          )}
        >
          {dragging ? (
            <FileSpreadsheet size={24} aria-hidden="true" />
          ) : (
            <Upload size={24} aria-hidden="true" />
          )}
        </span>

        <span className="block text-sm font-medium text-slate-900">
          {m.upload.drop}
        </span>
        <span className="block text-xs text-brand-600 mt-1">
          {m.upload.browse}
        </span>
        <span className="block text-xs text-slate-400 mt-3 max-w-md mx-auto leading-relaxed">
          {m.upload.hint}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        aria-label={m.upload.drop}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          // Permet de re-sélectionner le même fichier après correction.
          event.target.value = '';
        }}
      />
    </div>
  );
}
