'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHref } from '@/lib/hooks';
import { useSession } from '@/lib/auth/session';
import { cn } from '@/lib/utils';
import { Card, EmptyState, PageContainer, PageHeader } from '@/components/ui';
import { reportMessages as m } from '@/features/reports/messages';

const SECTIONS = [
  { key: 'reports', label: m.tabs.reports, path: '/reports' },
  { key: 'cards', label: m.tabs.cards, path: '/reports/cards' },
];

export default function ReportsLayout({ children }: { children: ReactNode }) {
  const href = useHref();
  const pathname = usePathname();
  const { canAny } = useSession();

  if (!canAny(['reports.generate', 'reports.download'])) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title="Accès non autorisé"
            message="Votre rôle ne donne pas accès aux bulletins de l’établissement."
          />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="print-hidden">
        <PageHeader title={m.title} description={m.description} />
      </div>

      <nav
        aria-label={m.navLabel}
        className="flex items-center gap-1 overflow-x-auto hide-scrollbar bg-slate-50 border border-slate-100 rounded-xl p-1 print-hidden"
      >
        {SECTIONS.map((section) => {
          const target = href(section.path);
          const active =
            section.path === '/reports'
              ? pathname === target
              : pathname.startsWith(target);

          return (
            <Link
              key={section.key}
              href={target}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'px-3.5 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20',
                active
                  ? 'bg-white text-brand-600 font-medium shadow-sm'
                  : 'text-slate-500 hover:text-slate-900',
              )}
            >
              {section.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </PageContainer>
  );
}
