'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHref } from '@/lib/hooks';
import { useSession } from '@/lib/auth/session';
import { cn } from '@/lib/utils';
import { Card, EmptyState, PageContainer, PageHeader } from '@/components/ui';
import { financeMessages as m } from '@/features/finance/messages';

const SECTIONS = [
  { key: 'treasury', label: m.tabs.treasury, path: '/finance' },
  { key: 'invoices', label: m.tabs.invoices, path: '/finance/invoices' },
  { key: 'payments', label: m.tabs.payments, path: '/finance/payments' },
  { key: 'overdue', label: m.tabs.overdue, path: '/finance/overdue' },
];

export default function FinanceLayout({ children }: { children: ReactNode }) {
  const href = useHref();
  const pathname = usePathname();
  const { can } = useSession();

  if (!can('payments.read')) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title="Accès non autorisé"
            message="Votre rôle ne donne pas accès aux données financières de l’établissement."
          />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title={m.title} description={m.description} />

      <nav
        aria-label={m.navLabel}
        className="flex items-center gap-1 overflow-x-auto hide-scrollbar bg-slate-50 border border-slate-100 rounded-xl p-1"
      >
        {SECTIONS.map((section) => {
          const target = href(section.path);
          const active =
            section.path === '/finance'
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
