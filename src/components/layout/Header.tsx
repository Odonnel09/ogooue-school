'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, MessageSquare, ChevronDown, Menu, X } from 'lucide-react';
import { ACADEMIC_YEARS, CURRENT_USER } from '@/data/academic';
import { academicYearStatusLabels, ui } from '@/i18n/fr';
import { ROLES, useSession } from '@/lib/auth/session';
import { useHref } from '@/lib/hooks';
import { Avatar } from '@/components/ui/Avatar';
import { ActionMenu } from '@/components/ui/Dropdown';
import { useToast } from '@/components/ui/Toast';

export function Header({ onOpenNav }: { onOpenNav: () => void }) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const href = useHref();
  const router = useRouter();
  const toast = useToast();
  const { roleId, setRoleId, academicYear, setAcademicYearId } = useSession();

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

        {/* Barre de recherche (masquée sur petit écran) */}
        <div className="flex-1 max-w-xl hidden sm:block">
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

        <div className="flex-1 sm:hidden" />

        {/*
          Sélecteurs de démonstration : rôle actif et année scolaire.
          Le rôle pilote le RBAC de l'interface, l'année verrouille les écritures
          lorsqu'elle est clôturée. Ils disparaîtront avec l'authentification réelle.
        */}
        <div className="hidden xl:flex items-center gap-2 shrink-0">
          <select
            aria-label="Rôle de démonstration"
            title={ui.demoRoleNotice}
            value={roleId}
            onChange={(event) => setRoleId(event.target.value)}
            className="py-2 pl-3 pr-8 bg-slate-50 border border-transparent rounded-xl text-xs text-slate-600 cursor-pointer focus-visible:border-brand-500 focus-visible:bg-white outline-none transition-colors"
          >
            {ROLES.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Année scolaire"
            value={academicYear.id}
            onChange={(event) => setAcademicYearId(event.target.value)}
            className="py-2 pl-3 pr-8 bg-slate-50 border border-transparent rounded-xl text-xs text-slate-600 cursor-pointer focus-visible:border-brand-500 focus-visible:bg-white outline-none transition-colors"
          >
            {ACADEMIC_YEARS.map((year) => (
              <option key={year.id} value={year.id}>
                {year.label} — {academicYearStatusLabels[year.status]}
              </option>
            ))}
          </select>
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
            <button
              type="button"
              aria-label="Notifications"
              className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <button
              type="button"
              aria-label="Messages"
              className="hidden sm:inline-flex p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
            >
              <MessageSquare size={20} />
            </button>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          {/* Profil utilisateur */}
          <div className="flex items-center gap-2">
            <Link
              href={href('/account')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar name={CURRENT_USER.fullName} size="md" className="border-2 border-white shadow-sm" />
              <span className="text-left hidden md:block">
                <span className="block text-sm font-bold text-slate-900 leading-tight">
                  {CURRENT_USER.name}
                </span>
                <span className="block text-xs text-slate-500">
                  {CURRENT_USER.role}
                </span>
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
                  onSelect: () =>
                    toast.info(
                      'L’authentification réelle sera branchée à une étape ultérieure.',
                    ),
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
