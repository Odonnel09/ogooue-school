import { Check, GraduationCap, ShieldAlert } from 'lucide-react';
import { ui } from '@/i18n/fr';
import { authMessages as m } from '@/features/auth/messages';

/**
 * Ossature des écrans d'authentification.
 *
 * Volontairement séparée de `AppShell` : ces pages n'ont ni établissement
 * actif, ni permissions, ni données. Rien de ce qui appartient à un
 * établissement ne doit être monté avant qu'une session existe.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex bg-slate-50">
      {/* Panneau de marque — décoratif, masqué sous 1024 px */}
      <aside className="hidden lg:flex lg:w-[45%] xl:w-1/2 bg-brand-600 text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-500/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-brand-700/50 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <GraduationCap size={22} aria-hidden="true" />
          </span>
          <span className="text-xl font-bold tracking-tight">{ui.brand}</span>
        </div>

        <div className="relative max-w-md">
          <p className="text-2xl xl:text-3xl font-bold leading-tight">
            {m.brand.tagline}
          </p>
          <ul className="mt-8 space-y-3">
            {m.brand.points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} aria-hidden="true" />
                </span>
                <span className="text-sm text-white/85 leading-relaxed">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/60">
          Gabon · Francs CFA · Français
        </p>
      </aside>

      {/* Zone de formulaire */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <span className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
              <GraduationCap size={22} aria-hidden="true" />
            </span>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              {ui.brand}
            </span>
          </div>

          {children}

          <p className="mt-6 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
            <ShieldAlert
              size={13}
              aria-hidden="true"
              className="mt-0.5 shrink-0"
            />
            {m.mockNotice}
          </p>
        </div>
      </main>
    </div>
  );
}
