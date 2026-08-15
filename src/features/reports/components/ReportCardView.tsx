'use client';

import type { ReportColumnKey, ReportSnapshot } from '@/types';
import { decisionLabels } from '@/i18n/fr';
import { formatDate } from '@/lib/utils';
import { reportMessages as m } from '../messages';

const c = m.detail.card;

function score(value: number | null): string {
  return value === null ? '—' : value.toFixed(2).replace('.', ',');
}

/**
 * Rendu imprimable d'un bulletin.
 *
 * Il ne lit **que** l'instantané — données *et* gabarit. Aucun réglage n'est
 * relu depuis la configuration : c'est ce qui garantit qu'un bulletin publié
 * en 2026 se réaffiche identique des années plus tard, même si l'établissement
 * a changé de logo, de couleurs ou de signataire entre-temps.
 */
export function ReportCardView({ snapshot }: { snapshot: ReportSnapshot }) {
  const style = snapshot.style;
  const showCredits = snapshot.totalCredits > 0;
  const accent = style.accentColor;

  const shows = (column: ReportColumnKey) => style.columns.includes(column);
  const title = style.documentTitle || c.title[snapshot.template];

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print-area">
      {/* Papier à en-tête, posé en fond du document */}
      {style.background.dataUrl && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-center bg-no-repeat bg-cover pointer-events-none"
          style={{
            backgroundImage: `url(${style.background.dataUrl})`,
            opacity: style.backgroundOpacity / 100,
          }}
        />
      )}

      <div className="relative p-5 sm:p-8">
        {/* En-tête de l'établissement */}
        <header
          className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b-2"
          style={{ borderColor: accent }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {style.logo.dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={style.logo.dataUrl}
                alt=""
                className="h-12 w-auto max-w-24 object-contain shrink-0"
              />
            ) : (
              <span
                aria-hidden="true"
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ backgroundColor: `${accent}1a` }}
              >
                {snapshot.school.logo}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-900">
                {snapshot.school.name}
              </p>
              <p className="text-xs text-slate-500">
                {snapshot.school.city} · République gabonaise
              </p>
            </div>
          </div>

          <div className="text-right">
            <h1 className="text-lg font-bold" style={{ color: accent }}>
              {title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {snapshot.periodLabel} · {snapshot.academicYear}
            </p>
          </div>
        </header>

        {/* Identité de l'élève */}
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-100">
          <div>
            <dt className="text-xs text-slate-400">Élève</dt>
            <dd className="text-sm font-medium text-slate-900 mt-0.5">
              {snapshot.student.fullName}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Matricule</dt>
            <dd className="text-sm text-slate-900 mt-0.5 font-mono">
              {snapshot.student.matricule}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Classe</dt>
            <dd className="text-sm text-slate-900 mt-0.5">
              {snapshot.student.className}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Né(e) le</dt>
            <dd className="text-sm text-slate-900 mt-0.5">
              {formatDate(snapshot.student.birthDate)}
            </dd>
          </div>
        </dl>

        {/* Tableau des matières */}
        <div className="overflow-x-auto hide-scrollbar py-5">
          <table className="w-full text-sm text-left min-w-max">
            <thead
              className="text-xs uppercase"
              style={{ backgroundColor: `${accent}14`, color: accent }}
            >
              <tr>
                <th scope="col" className="px-3 py-2.5 rounded-l-lg">
                  {c.subject}
                </th>
                {shows('teacher') && (
                  <th scope="col" className="px-3 py-2.5">
                    {c.teacher}
                  </th>
                )}
                {shows('coefficient') && (
                  <th scope="col" className="px-3 py-2.5 text-center">
                    {showCredits ? c.credits : c.coefficient}
                  </th>
                )}
                <th scope="col" className="px-3 py-2.5 text-center">
                  {c.average}
                </th>
                {shows('classAverage') && (
                  <th scope="col" className="px-3 py-2.5 text-center">
                    {c.classAverage}
                  </th>
                )}
                {shows('lowest') && (
                  <th scope="col" className="px-3 py-2.5 text-center">
                    {c.lowest}
                  </th>
                )}
                {shows('best') && (
                  <th scope="col" className="px-3 py-2.5 text-center">
                    {c.best}
                  </th>
                )}
                <th scope="col" className="px-0 rounded-r-lg" />
              </tr>
            </thead>
            <tbody>
              {snapshot.lines.map((line) => (
                <tr
                  key={line.subjectId}
                  className="border-b last:border-0 border-slate-100"
                >
                  <td className="px-3 py-2.5 font-medium text-slate-900">
                    {line.subjectLabel}
                    {line.validated !== null && (
                      <span
                        className={
                          line.validated
                            ? 'ml-2 text-[11px] text-green-600'
                            : 'ml-2 text-[11px] text-red-500'
                        }
                      >
                        {line.validated ? c.validated : c.notValidated}
                      </span>
                    )}
                  </td>
                  {shows('teacher') && (
                    <td className="px-3 py-2.5 text-slate-500 text-xs">
                      {line.teacherName}
                    </td>
                  )}
                  {shows('coefficient') && (
                    <td className="px-3 py-2.5 text-center text-slate-700">
                      {showCredits ? line.credits : line.coefficient}
                    </td>
                  )}
                  <td className="px-3 py-2.5 text-center font-medium text-slate-900">
                    {line.gradeCount === 0 ? (
                      <span className="text-slate-400 text-xs">{c.noGrade}</span>
                    ) : (
                      score(line.average)
                    )}
                  </td>
                  {shows('classAverage') && (
                    <td className="px-3 py-2.5 text-center text-slate-500">
                      {score(line.classAverage)}
                    </td>
                  )}
                  {shows('lowest') && (
                    <td className="px-3 py-2.5 text-center text-slate-500">
                      {score(line.lowest)}
                    </td>
                  )}
                  {shows('best') && (
                    <td className="px-3 py-2.5 text-center text-slate-500">
                      {score(line.best)}
                    </td>
                  )}
                  <td className="px-0" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Synthèse */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-5 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs text-slate-500">{c.generalAverage}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: accent }}>
              {snapshot.average === null ? '—' : `${score(snapshot.average)}/20`}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs text-slate-500">{c.rank}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {snapshot.rank === null
                ? '—'
                : c.rankOf(snapshot.rank, snapshot.headcount)}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs text-slate-500">{c.decision}</p>
            <p className="text-base font-bold text-slate-900 mt-1">
              {decisionLabels[snapshot.decision.kind]}
            </p>
            {snapshot.decision.mention && (
              <p className="text-xs text-slate-500 mt-0.5">
                {c.mention} : {snapshot.decision.mention}
              </p>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs text-slate-500">{c.attendance}</p>
            <p className="text-base font-bold text-slate-900 mt-1">
              {snapshot.attendance.rate}% {c.attendanceRate}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {snapshot.attendance.absent} {c.absences} ·{' '}
              {snapshot.attendance.retard} {c.delays}
            </p>
          </div>
        </div>

        {showCredits && (
          <p className="text-sm text-slate-700 pb-5">
            <span className="text-slate-500">{c.credits_earned} : </span>
            <span className="font-bold">
              {snapshot.earnedCredits} / {snapshot.totalCredits}
            </span>
          </p>
        )}

        {/* Appréciation */}
        {snapshot.councilComment && (
          <div className="border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-400 mb-1">
              {m.detail.councilComment}
            </p>
            <p className="text-sm text-slate-700 leading-relaxed italic">
              « {snapshot.councilComment} »
            </p>
          </div>
        )}

        {/* Pied de page, cachet et signature */}
        <footer className="flex flex-wrap items-end justify-between gap-6 pt-6 mt-5 border-t border-slate-200">
          <div className="text-xs text-slate-400 min-w-0">
            <p>{c.generatedOn(formatDate(snapshot.generatedAt))}</p>
            <p className="mt-0.5">{c.configLine(snapshot.configSummary)}</p>
            {style.footerText && (
              <p className="mt-2 text-slate-500 max-w-md">{style.footerText}</p>
            )}
          </div>

          <div className="flex items-end gap-4">
            {style.stamp.dataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={style.stamp.dataUrl}
                alt=""
                className="h-20 w-auto object-contain opacity-90"
              />
            )}

            <div className="text-right">
              <p className="text-xs text-slate-500">
                {snapshot.signature?.signerRole ?? c.signature}
              </p>

              {snapshot.signature?.dataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={snapshot.signature.dataUrl}
                  alt={`Signature de ${snapshot.signature.signerName}`}
                  className="h-14 w-auto max-w-48 object-contain ml-auto my-1"
                />
              ) : (
                <div className="h-14" aria-hidden="true" />
              )}

              <p className="text-sm font-medium text-slate-900">
                {snapshot.signature?.signerName ?? snapshot.school.director}
              </p>
              {snapshot.signature && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Signé le {formatDate(snapshot.signature.signedAt)}
                </p>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
