'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  Trophy,
  Calendar as CalendarIcon,
  FileText,
} from 'lucide-react';
import { useSchoolData } from '@/lib/store/school-data';
import { useSession } from '@/lib/auth/session';
import { useCapabilities } from '@/lib/school-levels/use-capabilities';
import { useHref } from '@/lib/hooks';
import { classLabel, studentName } from '@/lib/selectors';
import { avatarUrl } from '@/lib/utils';
import { SelectShell } from '@/components/ui/Select';
import { PulseSection } from '@/features/dashboard/components/PulseSection';
import {
  documentCategories,
  evaluationSummary,
  timetableSummaries,
  topStudents,
} from '@/features/dashboard/queries';

/** Palette des pastilles de documents, reprise du dashboard de référence. */
const DOCUMENT_TONES = [
  { color: 'text-orange-500', bg: 'bg-orange-50' },
  { color: 'text-blue-500', bg: 'bg-blue-50' },
  { color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { color: 'text-green-500', bg: 'bg-green-50' },
];

export default function DashboardPage() {
  const href = useHref();
  const { academicYear } = useSession();
  const capabilities = useCapabilities();
  const {
    config,
    students,
    teachers,
    classes,
    classSubjects,
    slots,
    evaluations,
  } = useSchoolData();

  const [selectedClassId, setSelectedClassId] = useState('');

  const counts = useMemo(
    () => ({
      students: students.filter((student) => student.status === 'actif').length,
      teachers: teachers.filter((teacher) => teacher.status === 'actif').length,
      classes: classes.filter((item) => item.status === 'active').length,
    }),
    [students, teachers, classes],
  );

  const best = useMemo(
    () =>
      topStudents(
        students,
        classes,
        classSubjects,
        evaluations,
        capabilities.gradingConfigForClass,
      ),
    [students, classes, classSubjects, evaluations, capabilities],
  );

  const documents = useMemo(() => documentCategories(students), [students]);

  const timetables = useMemo(() => {
    const summaries = timetableSummaries(classes, slots, academicYear.id, 4);
    return selectedClassId
      ? summaries.filter((entry) => entry.schoolClass.id === selectedClassId)
      : summaries.slice(0, 2);
  }, [classes, slots, academicYear.id, selectedClassId]);

  const evaluationStats = useMemo(
    () => evaluationSummary(evaluations, academicYear.id),
    [evaluations, academicYear.id],
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bienvenue.</h1>
        <p className="text-slate-500 text-sm mt-1">
          Gérez {config.profile.name} avec Ogooué School.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Students */}
        <Link
          href={href('/students')}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex justify-between items-center transition-colors hover:border-brand-100 outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
        >
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Élèves</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 whitespace-nowrap">
              {counts.students}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
            <GraduationCap size={24} aria-hidden="true" />
          </div>
        </Link>

        {/* Teachers */}
        <Link
          href={href('/teachers')}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex justify-between items-center transition-colors hover:border-brand-100 outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
        >
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Enseignants</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 whitespace-nowrap">
              {counts.teachers}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <Users size={24} aria-hidden="true" />
          </div>
        </Link>

        {/* Classes */}
        <Link
          href={href('/classes')}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex justify-between items-center transition-colors hover:border-brand-100 outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
        >
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">
              Classes actives
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 whitespace-nowrap">
              {counts.classes}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
            <Trophy size={24} aria-hidden="true" />
          </div>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column (Span 2 on lg) */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          {/* Class Routine */}
          <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
            <div className="flex flex-wrap gap-3 justify-between items-center mb-5 sm:mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Emplois du temps
              </h2>
              <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
                <SelectShell
                  variant="inline"
                  ariaLabel="Filtrer par classe"
                  value={selectedClassId}
                  onSelect={setSelectedClassId}
                  options={[
                    { value: '', label: 'Toutes les classes' },
                    ...classes
                      .filter((item) => item.status === 'active')
                      .map((item) => ({ value: item.id, label: item.name })),
                  ]}
                />
                <Link
                  href={href('/timetable')}
                  className="text-sm text-brand-600 hover:underline rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                >
                  Voir tout
                </Link>
              </div>
            </div>

            {timetables.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                Aucun créneau programmé pour l’année {academicYear.label}.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {timetables.map((entry) => (
                  <div
                    key={entry.schoolClass.id}
                    className="bg-slate-50 rounded-xl p-5 border border-slate-100"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className={
                          entry.isDraft
                            ? 'w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-orange-500'
                            : 'w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-brand-500'
                        }
                      >
                        <CalendarIcon size={20} aria-hidden="true" />
                      </div>
                      <span
                        className={
                          entry.isDraft
                            ? 'text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full'
                            : 'text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full'
                        }
                      >
                        {entry.isDraft ? 'Brouillon' : 'Validé'}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900">
                      {entry.schoolClass.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      {entry.slotCount} créneau
                      {entry.slotCount > 1 ? 'x' : ''} programmé
                      {entry.slotCount > 1 ? 's' : ''} pour l’année{' '}
                      {academicYear.label}.
                    </p>
                    <Link
                      href={href('/timetable')}
                      className={
                        entry.isDraft
                          ? 'w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-slate-500/20'
                          : 'w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20'
                      }
                    >
                      <CalendarIcon size={16} aria-hidden="true" /> Ouvrir
                      l’emploi du temps
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Star Students */}
          <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
            <div className="flex flex-wrap gap-3 justify-between items-center mb-5 sm:mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Meilleurs Élèves
              </h2>
              <Link
                href={href('/evaluations')}
                className="text-sm text-brand-600 hover:underline rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
              >
                Voir les évaluations
              </Link>
            </div>

            {best.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                Aucune note validée ou publiée pour l’instant : le classement
                apparaîtra dès la première évaluation publiée.
              </p>
            ) : (
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-sm text-left min-w-max">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 rounded-l-lg">
                        Nom
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Matricule
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Classe
                      </th>
                      <th scope="col" className="px-4 py-3 rounded-r-lg">
                        Moyenne
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {best.map((entry, index) => (
                      <tr
                        key={entry.student.id}
                        className={`border-b last:border-0 border-slate-100 ${index === 0 ? 'bg-brand-50/50' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={href(`/students/${entry.student.id}`)}
                            className="flex items-center gap-3 group rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                          >
                            <span className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={
                                  entry.student.photoUrl ||
                                  avatarUrl(studentName(entry.student))
                                }
                                alt=""
                              />
                            </span>
                            <span className="font-medium text-slate-900 group-hover:text-brand-600 transition-colors">
                              {studentName(entry.student)}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                          {entry.student.matricule}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {classLabel(classes, entry.student.classId)}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {entry.average.toFixed(2).replace('.', ',')}/20
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-6 lg:space-y-8">
          {/* Documents */}
          <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
            <div className="flex flex-wrap gap-3 justify-between items-center mb-5 sm:mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Documents des dossiers
              </h2>
              <Link
                href={href('/students')}
                className="text-sm text-slate-400 hover:text-brand-600 transition-colors rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
              >
                Voir tout
              </Link>
            </div>

            {documents.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                Aucune pièce n’a encore été déposée dans les dossiers élèves.
              </p>
            ) : (
              <div className="space-y-4">
                {documents.map((category, index) => {
                  const tone = DOCUMENT_TONES[index % DOCUMENT_TONES.length];
                  return (
                    <div
                      key={category.type}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg ${tone.bg} flex items-center justify-center ${tone.color}`}
                        >
                          <FileText size={20} aria-hidden="true" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 text-sm">
                            {category.type}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {category.count} fichier
                            {category.count > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Evaluations */}
          <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
            <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">Évaluations</h2>
              {evaluationStats.inProgress > 0 && (
                <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {evaluationStats.inProgress} en saisie
                </span>
              )}
            </div>
            <h3 className="text-4xl font-bold text-slate-900 mb-2">
              {evaluationStats.total}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Devoirs, contrôles et examens créés pour l’année{' '}
              {academicYear.label}.{' '}
              <Link
                href={href('/evaluations')}
                className="font-medium text-brand-600 hover:underline rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
              >
                Voir les détails
              </Link>
            </p>
          </section>
        </div>
      </div>

      {/*
        Second niveau exigé par `GEMINI.md` (l. 51-55) : inscriptions en cours,
        paiements et impayés, alertes, activités récentes. Ajouté sous les blocs
        validés, dont aucun n'est modifié.
      */}
      <PulseSection />
    </div>
  );
}
