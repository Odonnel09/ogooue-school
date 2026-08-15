'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Rocket, X } from 'lucide-react';
import { navLabels, ui } from '@/i18n/fr';
import { useSession } from '@/lib/auth/session';
import { useCapabilities } from '@/lib/school-levels/use-capabilities';
import { cn } from '@/lib/utils';
import { NAV_ENTRIES } from './navigation';

export function Sidebar({
  tenantSlug,
  className,
  onNavigate,
}: {
  tenantSlug: string;
  className?: string;
  /** Fourni uniquement dans le tiroir mobile : ferme le menu après navigation. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { canAny } = useSession();
  const capabilities = useCapabilities();

  /**
   * Menus visibles = capacités des cycles actifs ∩ permissions de l'utilisateur.
   * Changer les cycles actifs dans Paramètres modifie donc la navigation, sans
   * qu'aucune ligne de code ne soit touchée.
   */
  const entries = useMemo(
    () =>
      NAV_ENTRIES.filter(
        (entry) =>
          entry.implemented &&
          capabilities.menus.includes(entry.key) &&
          (entry.permissions.length === 0 || canAny(entry.permissions)),
      ),
    [capabilities.menus, canAny],
  );

  return (
    <aside
      className={cn(
        'w-64 bg-white border-r border-slate-100 flex flex-col h-full overflow-y-auto hide-scrollbar shrink-0',
        className,
      )}
    >
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold shrink-0">
          <GraduationCap size={20} aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight truncate">
          {ui.brand}
        </h1>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label={ui.closeMenu}
            className="ml-auto text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg p-1.5 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav aria-label="Navigation principale" className="flex-1 px-4 pb-4 space-y-1">
        {entries.map((entry) => {
          const href = `/${tenantSlug}${entry.href}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const Icon = entry.icon;

          return (
            <Link
              key={entry.key}
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20',
                active
                  ? 'bg-brand-50 text-brand-600 font-medium'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Icon
                size={20}
                aria-hidden="true"
                className={active ? 'text-brand-600' : 'text-slate-400'}
              />
              <span className="text-sm">{navLabels[entry.key]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Pro Card */}
      <div className="p-4 mt-auto">
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-5 text-center text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-20">
            <Rocket size={48} aria-hidden="true" />
          </div>
          <div className="relative z-10">
            <h4 className="font-semibold text-sm mb-1">Passer à la version Pro</h4>
            <p className="text-xs text-brand-100 mb-3 opacity-90">
              Accédez à toutes les fonctionnalités.
            </p>
            <button
              type="button"
              className="w-full bg-white text-brand-600 text-sm font-medium py-2 rounded-xl hover:bg-slate-50 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            >
              Mettre à niveau
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
