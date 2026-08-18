import {
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { ui } from '@/i18n/fr';
import { authMessages as m } from '@/features/auth/messages';

/**
 * Ossature des écrans d'authentification.
 *
 * Volontairement séparée de `AppShell` : ces pages n'ont ni établissement
 * actif, ni permissions, ni données. Rien de ce qui appartient à un
 * établissement ne doit être monté avant qu'une session existe.
 *
 * Le panneau de gauche reprend le vocabulaire visuel du tableau de bord —
 * mêmes tuiles `rounded-2xl`, même pastille d'icône teintée, même hiérarchie
 * typographique — pour que la connexion appartienne visiblement au produit et
 * non à une page d'accueil générique.
 */
const TUILES = [
  { icon: GraduationCap, label: 'Élèves et inscriptions', hint: 'Dossiers, pièces, affectations' },
  { icon: BookOpen, label: 'Notes et bulletins', hint: 'Du carnet de suivi au relevé LMD' },
  { icon: Wallet, label: 'Frais et paiements', hint: 'Francs CFA, à l’unité près' },
  { icon: ShieldCheck, label: 'Cloisonnement strict', hint: 'Un établissement ne voit que le sien' },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex bg-slate-50">
      {/* Panneau de marque — décoratif, masqué sous 1024 px */}
      <aside className="hidden lg:flex lg:w-[46%] xl:w-1/2 bg-brand-700 text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-brand-500/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 -left-20 w-[26rem] h-[26rem] rounded-full bg-brand-900/60 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <GraduationCap size={20} aria-hidden="true" />
          </span>
          <span className="text-xl font-bold tracking-tight">{ui.brand}</span>
        </div>

        <div className="relative max-w-lg">
          <p className="text-2xl xl:text-[2rem] font-bold leading-[1.15] tracking-tight">
            {m.brand.tagline}
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TUILES.map(({ icon: Icon, label, hint }) => (
              <div
                key={label}
                className="rounded-2xl bg-white/10 border border-white/10 p-4 backdrop-blur-sm"
              >
                <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                  <Icon size={17} aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold leading-tight">{label}</p>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  {hint}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/60">
          Gabon · Francs CFA · Français
        </p>
      </aside>

      {/* Zone de formulaire */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <span className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center">
              <GraduationCap size={20} aria-hidden="true" />
            </span>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              {ui.brand}
            </span>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
