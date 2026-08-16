'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, Info } from 'lucide-react';
import { MEMBERSHIPS } from '@/data/memberships';
import { MEMBERSHIP_STATUS_TONES } from '@/types';
import { ROLES } from '@/data/roles';
import { useTenant } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { Badge, PopoverPanel } from '@/components/ui';

/**
 * Sélecteur d'établissement.
 *
 * Deux partis pris qui méritent d'être dits :
 *
 * 1. **Changer d'établissement ramène au tableau de bord**, jamais à la page
 *    équivalente. Les identifiants ne traversent pas les établissements :
 *    `/demo/students/std-001` n'a aucun sens ailleurs, et y conduire ne
 *    produirait qu'une page introuvable — au mieux.
 *
 * 2. La liste affichée vient des appartenances de l'utilisateur. Elle est ici
 *    tirée d'un fichier ; côté serveur, elle viendra de la session. Un
 *    établissement absent de cette liste reste inaccessible même si l'on tape
 *    son adresse à la main : le layout le vérifie avant tout rendu.
 */
export function TenantSwitcher() {
  const slug = useTenant();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const current = MEMBERSHIPS.find((membership) => membership.slug === slug);
  if (!current) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Établissement actif : ${current.name}. Changer d’établissement.`}
        onClick={() => setOpen((previous) => !previous)}
        className={cn(
          'flex items-center gap-2 py-1.5 pl-1.5 pr-2 rounded-xl border transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20 shrink-0',
          open
            ? 'border-brand-200 bg-brand-50'
            : 'border-transparent hover:bg-slate-50',
        )}
      >
        <span
          aria-hidden="true"
          className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-base shrink-0"
        >
          {current.logo}
        </span>
        <span className="hidden md:block text-left min-w-0">
          <span className="block text-xs font-semibold text-slate-900 leading-tight truncate max-w-[10rem]">
            {current.shortName}
          </span>
          <span className="block text-[11px] text-slate-500 truncate">
            {current.city}
          </span>
        </span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={cn(
            'text-slate-400 transition-transform duration-200 shrink-0',
            open && 'rotate-180 text-brand-500',
          )}
        />
      </button>

      <PopoverPanel
        open={open}
        anchorRef={triggerRef}
        onDismiss={() => setOpen(false)}
        matchAnchorWidth={false}
        minWidth={320}
        maxHeight={440}
        role="menu"
        aria-label="Établissements"
      >
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            Vos établissements
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {MEMBERSHIPS.length} appartenance
            {MEMBERSHIPS.length > 1 ? 's' : ''} — le rôle change avec
            l’établissement.
          </p>
        </div>

        <ul className="flex-1 overflow-y-auto p-1.5">
          {MEMBERSHIPS.map((membership) => {
            const isCurrent = membership.slug === slug;
            const accessible = membership.status === 'active';
            const role = ROLES.find((item) => item.id === membership.roleId);

            const content = (
              <>
                <span
                  aria-hidden="true"
                  className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg shrink-0"
                >
                  {membership.logo}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-sm truncate',
                        isCurrent
                          ? 'font-semibold text-brand-700'
                          : 'font-medium text-slate-900',
                      )}
                    >
                      {membership.name}
                    </span>
                    {isCurrent && (
                      <Check
                        size={15}
                        aria-hidden="true"
                        className="text-brand-600 shrink-0"
                      />
                    )}
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5 truncate">
                    {membership.city} · {membership.type}
                  </span>
                  <span className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <Badge tone="slate">{role?.name ?? 'Rôle inconnu'}</Badge>
                    {!accessible && (
                      <Badge tone={MEMBERSHIP_STATUS_TONES[membership.status]}>
                        Invitation en attente
                      </Badge>
                    )}
                  </span>
                </span>
              </>
            );

            return (
              <li key={membership.tenantId}>
                {accessible ? (
                  <Link
                    href={`/${membership.slug}/dashboard`}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-start gap-3 p-2.5 rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                      isCurrent ? 'bg-brand-50/60' : 'hover:bg-slate-50',
                    )}
                  >
                    {content}
                  </Link>
                ) : (
                  <span className="flex items-start gap-3 p-2.5 rounded-xl opacity-60 cursor-not-allowed">
                    {content}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 flex items-start gap-2">
          <Info
            size={13}
            aria-hidden="true"
            className="text-slate-400 mt-0.5 shrink-0"
          />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Changer d’établissement revient au tableau de bord : les
            identifiants ne traversent pas les établissements. Les données de la
            démonstration sont celles du Complexe scolaire Ogooué, quel que soit
            l’établissement ouvert.
          </p>
        </div>
      </PopoverPanel>
    </>
  );
}

