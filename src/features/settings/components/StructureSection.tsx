'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, ClipboardList, Users } from 'lucide-react';
import { useHref } from '@/lib/hooks';
import { useSchoolData } from '@/lib/store/school-data';
import { Badge, Card } from '@/components/ui';
import { settingsMessages as m } from '../messages';
import { SettingsSection } from './SettingsSection';

/**
 * Renvois vers les modules existants.
 * Rééditer les classes, matières et enseignants ici créerait une seconde
 * source de vérité — on renvoie plutôt vers leur module dédié.
 */
export function StructureSection() {
  const href = useHref();
  const { classes, subjects, teachers } = useSchoolData();

  const entries = [
    {
      icon: BookOpen,
      title: m.structure.classes,
      hint: m.structure.classesHint,
      href: href('/classes'),
      count: classes.filter((item) => item.status === 'active').length,
      unit: 'classes actives',
    },
    {
      icon: ClipboardList,
      title: m.structure.subjects,
      hint: m.structure.subjectsHint,
      href: href('/subjects'),
      count: subjects.filter((item) => item.status === 'active').length,
      unit: 'matières actives',
    },
    {
      icon: Users,
      title: m.structure.teachers,
      hint: m.structure.teachersHint,
      href: href('/teachers'),
      count: teachers.filter((item) => item.status === 'actif').length,
      unit: 'enseignants en activité',
    },
  ];

  return (
    <SettingsSection title={m.structure.title} description={m.structure.description}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {entries.map((entry) => {
          const Icon = entry.icon;
          return (
            <Card key={entry.title} className="p-4 sm:p-6 flex flex-col">
              <span className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Icon size={20} aria-hidden="true" />
              </span>
              <h2 className="text-sm font-bold text-slate-900 mt-4">
                {entry.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed flex-1">
                {entry.hint}
              </p>
              <div className="flex items-center justify-between gap-3 mt-4">
                <Badge tone="slate">
                  {entry.count} {entry.unit}
                </Badge>
                <Link
                  href={entry.href}
                  className="text-xs font-medium text-brand-600 hover:underline inline-flex items-center gap-1 rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                >
                  {m.structure.open}
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </SettingsSection>
  );
}
