'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Lock } from 'lucide-react';
import { ui } from '@/i18n/fr';
import { useSession } from '@/lib/auth/session';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

/**
 * Ossature de l'espace d'administration.
 *
 * - Desktop (≥ lg) : sidebar fixe de 256 px + zone de travail défilante.
 * - Mobile / tablette : la sidebar devient un tiroir superposé, la zone de
 *   travail occupe toute la largeur (`min-w-0` évite tout débordement
 *   horizontal des tableaux).
 */
export function AppShell({
  tenantSlug,
  children,
}: {
  tenantSlug: string;
  children: ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();
  const { academicYear, isYearWritable } = useSession();
  const [lastPathname, setLastPathname] = useState(pathname);

  // Ferme le tiroir dès que l'on change de page (ajustement pendant le rendu :
  // pas d'effet, donc pas de rendu en cascade).
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setNavOpen(false);
  }

  // Empêche le défilement de l'arrière-plan quand le tiroir est ouvert.
  useEffect(() => {
    if (!navOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [navOpen]);

  return (
    <div className="h-dvh flex bg-slate-50 overflow-hidden">
      <Sidebar tenantSlug={tenantSlug} className="hidden lg:flex" />

      {/* Tiroir de navigation mobile */}
      {navOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={() => setNavOpen(false)}
            aria-hidden="true"
          />
          <div className="relative h-full w-72 max-w-[85vw] shadow-xl">
            <Sidebar
              tenantSlug={tenantSlug}
              className="w-full border-r-0"
              onNavigate={() => setNavOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        <Header onOpenNav={() => setNavOpen(true)} />

        {/* Année clôturée : lecture seule, les actions d'écriture sont masquées. */}
        {!isYearWritable && (
          <div
            role="status"
            className="flex items-start gap-2 bg-blue-50 border-b border-blue-100 px-4 sm:px-6 lg:px-8 py-2.5 text-xs text-blue-700 shrink-0"
          >
            <Lock size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            {ui.readOnlyYear(academicYear.label)}
          </div>
        )}

        <main className="flex-1 overflow-y-auto hide-scrollbar">{children}</main>
      </div>
    </div>
  );
}
