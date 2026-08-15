'use client';

import { Info, Lock } from 'lucide-react';
import { ACADEMIC_YEARS } from '@/data/academic';
import { useSession } from '@/lib/auth/session';
import { academicYearStatusMeta } from '@/lib/status';
import { formatDate } from '@/lib/utils';
import {
  Badge,
  Card,
  StatusBadge,
  TD,
  TH,
  THead,
  TRow,
  Table,
  TableWrapper,
} from '@/components/ui';
import { settingsMessages as m } from '../messages';
import { SettingsSection } from './SettingsSection';

export function YearsSection() {
  const { academicYear } = useSession();

  return (
    <SettingsSection
      title={m.years.title}
      description={m.years.description}
      actions={
        <Badge tone="brand">
          {m.years.current} : {academicYear.label}
        </Badge>
      }
    >
      <Card className="p-4 sm:p-6">
        <TableWrapper>
          <Table>
            <THead>
              <tr>
                <TH scope="col">{m.years.columns.year}</TH>
                <TH scope="col">{m.years.columns.start}</TH>
                <TH scope="col">{m.years.columns.end}</TH>
                <TH scope="col">{m.years.columns.status}</TH>
              </tr>
            </THead>
            <tbody>
              {ACADEMIC_YEARS.map((year) => (
                <TRow key={year.id} highlighted={year.id === academicYear.id}>
                  <TD className="font-medium text-slate-900">
                    <span className="flex items-center gap-2">
                      {year.label}
                      {year.status !== 'active' && year.status !== 'draft' && (
                        <Lock
                          size={13}
                          className="text-slate-400"
                          aria-label="Année en lecture seule"
                        />
                      )}
                    </span>
                  </TD>
                  <TD>{formatDate(year.startDate)}</TD>
                  <TD>{formatDate(year.endDate)}</TD>
                  <TD>
                    <StatusBadge meta={academicYearStatusMeta(year.status)} />
                  </TD>
                </TRow>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      </Card>

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
        <Info size={18} className="text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-xs text-slate-600 leading-relaxed">{m.years.note}</p>
      </div>
    </SettingsSection>
  );
}
