'use client';

import { useEffect, useRef, useState } from 'react';
import SignaturePadLib from 'signature_pad';
import { Eraser, Upload } from 'lucide-react';
import { ACCEPTED_IMAGE_TYPES, fileToAsset } from '@/lib/images';
import { cn } from '@/lib/utils';
import { Button } from './Button';

/**
 * Zone de signature manuscrite.
 *
 * S'appuie sur `signature_pad`, qui lisse le tracé par interpolation de Bézier
 * et module l'épaisseur selon la vitesse — c'est ce qui fait qu'une signature
 * ressemble à une signature plutôt qu'à une polyligne.
 *
 * Deux entrées possibles : tracer à la souris ou au doigt, ou importer une
 * signature scannée.
 */
export function SignaturePad({
  value,
  onChange,
  label,
  hint,
  onError,
  className,
}: {
  /** Signature actuelle, en `data:`. Vide si aucune. */
  value: string;
  onChange: (dataUrl: string) => void;
  label: string;
  hint?: string;
  onError?: (message: string) => void;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);
  const [hasStrokes, setHasStrokes] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /**
     * `signature_pad` dessine en pixels physiques : sans cette mise à l'échelle,
     * le tracé est flou et décalé sur les écrans à forte densité.
     */
    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.getContext('2d')?.scale(ratio, ratio);
      padRef.current?.clear();
    };

    resize();

    const pad = new SignaturePadLib(canvas, {
      penColor: '#0f172a',
      backgroundColor: 'rgba(255,255,255,0)',
      minWidth: 0.7,
      maxWidth: 2.4,
    });
    padRef.current = pad;

    pad.addEventListener('endStroke', () => {
      setHasStrokes(true);
      onChange(pad.toDataURL('image/png'));
    });

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      pad.off();
      padRef.current = null;
    };
    // Le pad est créé une fois ; `onChange` est lu au moment du trait.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clear() {
    padRef.current?.clear();
    setHasStrokes(false);
    onChange('');
  }

  async function importImage(file: File) {
    try {
      const asset = await fileToAsset(file, 600);
      onChange(asset.dataUrl);
      padRef.current?.clear();
      setHasStrokes(false);
    } catch (error) {
      onError?.(
        error instanceof Error
          ? error.message
          : 'Import de la signature impossible.',
      );
    }
  }

  // Une signature importée s'affiche en aperçu ; le tracé reste possible ensuite.
  const showImported = Boolean(value) && !hasStrokes;

  return (
    <div className={cn('space-y-2', className)}>
      <p className="block text-sm font-medium text-slate-700">{label}</p>

      <div className="relative rounded-xl border border-slate-200 bg-white overflow-hidden">
        {showImported && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Signature enregistrée"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}
        <canvas
          ref={canvasRef}
          aria-label={label}
          className="w-full h-36 touch-none cursor-crosshair"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={clear} disabled={!value}>
          <Eraser size={15} aria-hidden="true" /> Effacer
        </Button>

        <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer focus-within:ring-4 focus-within:ring-brand-500/20">
          <Upload size={15} aria-hidden="true" />
          Importer une image
          <input
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importImage(file);
              event.target.value = '';
            }}
          />
        </label>

        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
    </div>
  );
}
