'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, Menu, X } from 'lucide-react';
import { ACADEMIC_YEARS, CURRENT_USER } from '@/data/academic';
import { useSchoolData } from '@/lib/store/school-data';
import { unreadConversations } from '@/features/messages/queries';
import {
  MessagesButton,
  NotificationBell,
} from '@/features/notifications/components/NotificationPanel';
import { academicYearStatusLabels } from '@/i18n/fr';
import { useSession } from '@/lib/auth/session';
import { signOut } from '@/features/auth/actions';
import { useHref } from '@/lib/hooks';
import { Avatar } from '@/components/ui/Avatar';
import { ActionMenu } from '@/components/ui/Dropdown';
import { SelectShell } from '@/components/ui/Select';
import { TenantSwitcher } from './TenantSwitcher';

export function Header({ onOpenNav }: { onOpenNav: () => void }) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const href = useHref();
  const router = useRouter();
  const { email, roleName, academicYear, setAcademicYearId } = useSession();
  const { conversations, messages } = useSchoolData();

  /**
   * La messagerie tourne encore sur le magasin en mémoire : son identifiant
   * de participant reste celui du jeu fictif. Il deviendra `user.id` quand le
   * module sera branché sur les tables `conversations` et `messages`.
   */
  const unreadThreads = unreadConversations(
    conversations,
    messages,
    CURRENT_USER.id,
  ).length;

  return (
    <header className="bg-white sticky top-0 z-20 border-b border-slate-100 shrink-0">
      <div className="h-16 lg:h-[80px] flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8">
        {/* Ouverture du menu (mobile / tablette) */}
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Ouvrir le menu"
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors shrink-0"
        >
          <Menu size={22} />
        </button>

        {/* Établissement actif — un utilisateur peut en desservir plusieurs. */}
        <TenantSwitcher />

        {/* Barre de recherche (masquée sur petit écran) */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl text-sm placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all duration-300 outline-none"
              placeholder="Rechercher un élève, une classe..."
            />
          </div>
        </div>

        <div className="flex-1 md:hidden" />

        {/* Année scolaire — le rôle vient désormais de l'appartenance réelle. */}
        <div className="hidden xl:flex items-center gap-2 shrink-0">
          <SelectShell
            variant="compact"
            ariaLabel="Année scolaire"
            options={ACADEMIC_YEARS.map((year) => ({
              value: year.id,
              label: `${year.label} — ${academicYearStatusLabels[year.status]}`,
            }))}
            value={academicYear.id}
            onSelect={setAcademicYearId}
          />
        </div>

        {/* Section droite */}
        <div className="flex items-center gap-1 sm:gap-4 lg:gap-6 shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setMobileSearchOpen((previous) => !previous)}
              aria-label="Rechercher"
              className="sm:hidden p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
            >
              {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
            <NotificationBell />
            <MessagesButton unread={unreadThreads} />
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          {/* Profil utilisateur */}
          <div className="flex items-center gap-2">
            <Link
              href={href('/account')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar name={email} size="md" className="border-2 border-white shadow-sm" />
              <span className="text-left hidden md:block">
                <span className="block text-sm font-bold text-slate-900 leading-tight truncate max-w-[12rem]">
                  {email}
                </span>
                <span className="block text-xs text-slate-500">{roleName}</span>
              </span>
            </Link>
            <ActionMenu
              label="Menu du compte"
              trigger={<ChevronDown size={16} className="text-slate-400" />}
              actions={[
                {
                  label: 'Mon compte',
                  onSelect: () => router.push(href('/account')),
                },
                {
                  label: 'Se déconnecter',
                  destructive: true,
                  onSelect: () => {
                    // Server Action : la session est détruite côté serveur,
                    // pas en effaçant un cookie depuis le navigateur.
                    void signOut();
                  },
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Recherche dépliée sur petit écran */}
      {mobileSearchOpen && (
        <div className="sm:hidden px-4 pb-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
            </div>
            <input
              type="text"
              autoFocus
              className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all duration-300 outline-none"
              placeholder="Rechercher un élève, une classe..."
            />
          </div>
        </div>
      )}
    </header>
  );
}
