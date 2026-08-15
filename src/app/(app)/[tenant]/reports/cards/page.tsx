'use client';

import { useMemo, useState } from 'react';
import { Info, Printer, Users } from 'lucide-react';
import { ACADEMIC_YEARS } from '@/data/academic';
import { useSession } from '@/lib/auth/session';
import { useSchoolData } from '@/lib/store/school-data';
import { levelLabel, studentName } from '@/lib/selectors';
import { classOptions } from '@/lib/options';
import { avatarUrl, formatDate } from '@/lib/utils';
import {
  Button,
  Card,
  EmptyState,
  Field,
  Select,
} from '@/components/ui';
import { reportMessages as m } from '@/features/reports/messages';

export default function SchoolCardsPage() {
  const { classes, students, config } = useSchoolData();
  const { academicYear } = useSession();

  const activeClasses = useMemo(
    () => classes.filter((item) => item.status === 'active'),
    [classes],
  );

  const [classId, setClassId] = useState('');

  const roster = useMemo(
    () =>
      students
        .filter(
          (student) =>
            student.classId === classId && student.status === 'actif',
        )
        .sort((a, b) => studentName(a).localeCompare(studentName(b), 'fr')),
    [students, classId],
  );

  const schoolClass = classes.find((item) => item.id === classId);
  /** Gabarit réglé dans Paramètres → Modèles de cartes scolaires. */
  const template = config.templates.card;
  const yearEnd =
    ACADEMIC_YEARS.find((year) => year.id === academicYear.id)?.endDate ?? '';

  return (
    <>
      <Card className="p-3 sm:p-4 print-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          <Field label={m.cards.selectClass} htmlFor="cards-class">
            <Select
              id="cards-class"
              value={classId}
              options={classOptions(activeClasses)}
              placeholder="Sélectionner une classe"
              onChange={(event) => setClassId(event.target.value)}
            />
          </Field>

          {roster.length > 0 && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => window.print()}>
                <Printer size={16} aria-hidden="true" /> {m.cards.print}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {roster.length === 0 ? (
        <Card>
          <EmptyState
            title={m.cards.emptyTitle}
            message={m.cards.emptyMessage}
            icon={<Users size={24} aria-hidden="true" />}
          />
        </Card>
      ) : (
        <>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3 print-hidden">
            <Info
              size={18}
              className="text-slate-400 mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <p className="text-xs text-slate-600 leading-relaxed">
              {m.cards.verifyNotice}
            </p>
          </div>

          <div className="print-area grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {roster.map((student) => (
              <article
                key={student.id}
                className="relative bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
              >
                {template.background.dataUrl && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-center bg-cover bg-no-repeat pointer-events-none"
                    style={{
                      backgroundImage: `url(${template.background.dataUrl})`,
                      opacity: template.backgroundOpacity / 100,
                    }}
                  />
                )}
                <div className="relative">
                {/* Bandeau établissement, aux couleurs du gabarit */}
                <div
                  className="text-white p-4 flex items-center gap-3"
                  style={{ backgroundColor: template.accentColor }}
                >
                  {template.logo.dataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={template.logo.dataUrl}
                      alt=""
                      className="h-9 w-auto max-w-16 object-contain shrink-0"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-lg shrink-0"
                    >
                      {config.profile.logo}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">
                      {config.profile.shortName}
                    </p>
                    <p className="text-[11px] text-white/80 truncate">
                      {template.documentTitle || `${config.profile.city} · ${config.profile.country}`}
                    </p>
                  </div>
                </div>

                <div className="p-4 flex gap-4">
                  <span className="w-16 h-20 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={student.photoUrl || avatarUrl(studentName(student))}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </span>

                  <dl className="min-w-0 flex-1 space-y-1.5">
                    <div>
                      <dt className="sr-only">Nom</dt>
                      <dd className="text-sm font-bold text-slate-900 truncate">
                        {studentName(student)}
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-[11px] text-slate-400 shrink-0">
                        {m.cards.matricule}
                      </dt>
                      <dd className="text-[11px] text-slate-900 font-mono truncate">
                        {student.matricule}
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-[11px] text-slate-400 shrink-0">
                        {m.cards.born}
                      </dt>
                      <dd className="text-[11px] text-slate-900 truncate">
                        {formatDate(student.birthDate)}
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-[11px] text-slate-400 shrink-0">
                        {m.cards.classroom}
                      </dt>
                      <dd className="text-[11px] text-slate-900 truncate">
                        {schoolClass?.name} · {levelLabel(student.levelId)}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="px-4 pb-3 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    {m.cards.year} {academicYear.label}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {yearEnd ? m.cards.validUntil(formatDate(yearEnd)) : ''}
                  </span>
                </div>

                {template.footerText && (
                  <p className="px-4 pb-3 text-[10px] text-slate-400 leading-snug">
                    {template.footerText}
                  </p>
                )}

                <div
                  className="h-1.5"
                  style={{ backgroundColor: template.accentColor }}
                />
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}
