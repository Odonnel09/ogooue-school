'use client';

import { useState, type ReactNode } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useSession } from '@/lib/auth/session';
import { Card, EmptyState, PageContainer } from '@/components/ui';
import { SettingsNav } from '@/features/settings/components/SettingsNav';
import { settingsMessages as m } from '@/features/settings/messages';

/**
 * Ossature de Paramètres : navigation latérale persistante en desktop,
 * repliée derrière un bouton sur les écrans étroits.
 */
export default function SettingsLayout({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const { canAny } = useSession();

  const hasAccess = canAny(['settings.manage', 'users.manage', 'audit.read']);

  if (!hasAccess) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title="Accès non autorisé"
            message="Votre rôle ne donne pas accès à la configuration de l’établissement."
          />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Bascule de la navigation sur écrans étroits */}
      <button
        type="button"
        onClick={() => setNavOpen((previous) => !previous)}
        aria-expanded={navOpen}
        className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
      >
        {navOpen ? (
          <X size={16} aria-hidden="true" />
        ) : (
          <SlidersHorizontal size={16} aria-hidden="true" />
        )}
        {m.navLabel}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-5 sm:gap-6 items-start">
        <Card
          className={
            navOpen
              ? 'p-3 sm:p-4 lg:sticky lg:top-4'
              : 'p-3 sm:p-4 hidden lg:block lg:sticky lg:top-4'
          }
        >
          <SettingsNav onNavigate={() => setNavOpen(false)} />
        </Card>

        <div className="min-w-0">{children}</div>
      </div>
    </PageContainer>
  );
}
