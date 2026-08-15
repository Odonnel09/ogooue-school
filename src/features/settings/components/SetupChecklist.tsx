'use client';

import Link from 'next/link';
import { ArrowRight, Check, Circle } from 'lucide-react';
import { useHref } from '@/lib/hooks';
import { useSchoolData } from '@/lib/store/school-data';
import { cn } from '@/lib/utils';
import { Badge, Card } from '@/components/ui';
import { settingsMessages as m } from '../messages';

/** Progression de configuration : ce qu'il reste à régler avant l'ouverture. */
export function SetupChecklist() {
  const href = useHref();
  const { config, classes, subjects, teachers } = useSchoolData();

  const items = [
    {
      label: m.checklist.items.profile,
      done: Boolean(config.profile.name && config.profile.email),
      target: href('/settings/general'),
    },
    {
      label: m.checklist.items.levels,
      done: config.activeCycles.length > 0,
      target: href('/settings/levels'),
    },
    {
      label: m.checklist.items.periods,
      done: config.periods.some((period) =>
        period.cycles.some((cycle) => config.activeCycles.includes(cycle)),
      ),
      target: href('/settings/periods'),
    },
    {
      label: m.checklist.items.grading,
      done: config.activeCycles.every(
        (cycle) => config.gradingSystems[cycle] !== undefined,
      ),
      target: href('/settings/grading'),
    },
    {
      label: m.checklist.items.classes,
      done: classes.some((item) => item.status === 'active'),
      target: href('/classes'),
    },
    {
      label: m.checklist.items.subjects,
      done: subjects.some((item) => item.status === 'active'),
      target: href('/subjects'),
    },
    {
      label: m.checklist.items.teachers,
      done: teachers.some((item) => item.status === 'actif'),
      target: href('/teachers'),
    },
    {
      label: m.checklist.items.documents,
      done: config.enrollment.requiredDocuments.length > 0,
      target: href('/settings/enrollment'),
    },
  ];

  const done = items.filter((item) => item.done).length;
  const rate = Math.round((done / items.length) * 100);

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {m.checklist.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1">{m.checklist.description}</p>
        </div>
        <Badge tone={done === items.length ? 'green' : 'yellow'}>
          {m.checklist.progress(done, items.length)}
        </Badge>
      </div>

      <div
        className="h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden"
        role="progressbar"
        aria-valuenow={rate}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={m.checklist.title}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all',
            rate === 100 ? 'bg-green-500' : 'bg-brand-500',
          )}
          style={{ width: `${rate}%` }}
        />
      </div>

      <ul className="mt-5 space-y-2">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.target}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
            >
              <span className="flex items-center gap-3 min-w-0">
                <span
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                    item.done
                      ? 'bg-green-50 text-green-600'
                      : 'bg-slate-100 text-slate-400',
                  )}
                  aria-label={item.done ? m.checklist.done : m.checklist.todo}
                >
                  {item.done ? (
                    <Check size={13} aria-hidden="true" />
                  ) : (
                    <Circle size={11} aria-hidden="true" />
                  )}
                </span>
                <span
                  className={cn(
                    'text-sm truncate',
                    item.done ? 'text-slate-500' : 'text-slate-900 font-medium',
                  )}
                >
                  {item.label}
                </span>
              </span>
              <ArrowRight
                size={15}
                className="text-slate-300 shrink-0"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
