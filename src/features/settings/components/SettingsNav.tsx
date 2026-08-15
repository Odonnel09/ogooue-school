'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHref } from '@/lib/hooks';
import { useSession } from '@/lib/auth/session';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui';
import { settingsMessages as m } from '../messages';
import { SETTINGS_GROUP_ORDER, SETTINGS_SECTIONS } from '../sections';

/** Navigation latérale de Paramètres, filtrée par les permissions du rôle. */
export function SettingsNav({ onNavigate }: { onNavigate?: () => void }) {
  const href = useHref();
  const pathname = usePathname();
  const { can } = useSession();

  const groups = useMemo(
    () =>
      SETTINGS_GROUP_ORDER.map((group) => ({
        group,
        sections: SETTINGS_SECTIONS.filter(
          (section) => section.group === group && can(section.permission),
        ),
      })).filter((entry) => entry.sections.length > 0),
    [can],
  );

  return (
    <nav aria-label={m.navLabel} className="space-y-5">
      {groups.map(({ group, sections }) => (
        <div key={group}>
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-3 mb-1.5">
            {m.groups[group]}
          </h2>
          <ul className="space-y-0.5">
            {sections.map((section) => {
              const target = href(`/settings/${section.key}`);
              const active = pathname === target;

              return (
                <li key={section.key}>
                  <Link
                    href={target}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20',
                      active
                        ? 'bg-brand-50 text-brand-600 font-medium'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
                    )}
                  >
                    <span className="truncate">{section.label}</span>
                    {!section.ready && (
                      <Badge tone="yellow" className="shrink-0 text-[10px] px-1.5">
                        Bientôt
                      </Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
