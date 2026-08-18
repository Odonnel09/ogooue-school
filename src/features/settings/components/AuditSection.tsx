'use client';

import Link from 'next/link';
import { ArrowRight, Info, ShieldAlert } from 'lucide-react';
import { useHref } from '@/lib/hooks';
import { Card } from '@/components/ui';
import { auditMessages as a } from '@/features/audit/messages';
import { SettingsSection } from './SettingsSection';

/**
 * Le journal se consulte depuis `/audit`. Cette section n'en affiche qu'un
 * extrait : le dupliquer entièrement créerait une seconde source de vérité.
 */
export function AuditSection() {
  const href = useHref();

  return (
    <SettingsSection
      title={a.settings.title}
      description={a.settings.description}
      actions={
        <Link
          href={href('/audit')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
        >
          {a.settings.open}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      }
    >
      <Card className="p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <ShieldAlert size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900">
              {a.settings.recentTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Le journal se consulte depuis son propre écran. Le dupliquer ici
              créerait une seconde source de vérité, qui finirait par diverger.
            </p>
          </div>
        </div>
      </Card>

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
        <Info
          size={18}
          className="text-slate-400 mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <p className="text-xs text-slate-600 leading-relaxed">
          {a.settings.retention}
        </p>
      </div>
    </SettingsSection>
  );
}
