'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  UserRoundX,
  Users,
} from 'lucide-react';
import { useSchoolData } from '@/lib/store/school-data';
import { useHref, useSimulatedLoading } from '@/lib/hooks';
import { attendanceStats, classHeadcount, levelLabel } from '@/lib/selectors';
import {
  cycleOptions,
} from '@/lib/options';
import { formatDate, matches } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FilterBar,
  FilterSelect,
  LinkButton,
  PageContainer,
  PageHeader,
  StatCard,
  TD,
  TH,
  THead,
  TRow,
  Table,
  TableSkeleton,
  TableWrapper,
} from '@/components/ui';

export default function AttendancePage() {
  const href = useHref();
  const ready = useSimulatedLoading();
  const { classes, students, sheets } = useSchoolData();

  const [search, setSearch] = useState('');
  const [cycleFilter, setCycleFilter] = useState('');

  const activeClasses = useMemo(
    () =>
      classes
        .filter((item) => item.status === 'active')
        .filter((item) => matches(item.name, search))
        .filter((item) => !cycleFilter || item.cycle === cycleFilter)
        .sort((a, b) => a.name.localeCompare(b.name, 'fr')),
    [classes, search, cycleFilter],
  );

  /** Dernière feuille saisie par classe. */
  const lastSheetByClass = useMemo(() => {
    const map = new Map<string, (typeof sheets)[number]>();
    sheets.forEach((sheet) => {
      const current = map.get(sheet.classId);
      if (!current || sheet.date > current.date) map.set(sheet.classId, sheet);
    });
    return map;
  }, [sheets]);

  const globalStats = useMemo(() => {
    const allRecords = sheets.flatMap((sheet) => sheet.records);
    return attendanceStats(allRecords);
  }, [sheets]);

  return (
    <PageContainer>
      <PageHeader
        title="Présences"
        description="Suivez l’assiduité des élèves et enregistrez les feuilles d’appel par classe."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Présents"
          value={globalStats.present}
          icon={<CheckCircle2 size={22} />}
          tone="green"
        />
        <StatCard
          label="Absents"
          value={globalStats.absent}
          icon={<UserRoundX size={22} />}
          tone="red"
        />
        <StatCard
          label="Retards"
          value={globalStats.retard}
          icon={<Clock size={22} />}
          tone="orange"
        />
        <StatCard
          label="Taux de présence"
          value={`${globalStats.rate}%`}
          icon={<Users size={22} />}
          tone="brand"
          hint={`${sheets.length} feuilles enregistrées`}
        />
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher une classe..."
        activeCount={cycleFilter ? 1 : 0}
        onReset={() => setCycleFilter('')}
      >
        <FilterSelect
          value={cycleFilter}
          onChange={setCycleFilter}
          options={cycleOptions()}
          placeholder="Tous les cycles"
          label="Filtrer par cycle"
        />
      </FilterBar>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Feuilles de présence par classe
          </h2>
          <Badge tone="brand">{activeClasses.length} classes</Badge>
        </div>

        {!ready ? (
          <TableSkeleton rows={5} />
        ) : activeClasses.length === 0 ? (
          <EmptyState
            title="Aucune classe active"
            message="Aucune classe ne correspond à votre recherche, ou aucune classe active n’est ouverte."
            icon={<CalendarCheck size={24} />}
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setCycleFilter('');
                }}
              >
                Réinitialiser les filtres
              </Button>
            }
          />
        ) : (
          <>
            <TableWrapper className="hidden md:block">
              <Table>
                <THead>
                  <tr>
                    <TH>Classe</TH>
                    <TH>Niveau</TH>
                    <TH>Effectif</TH>
                    <TH>Dernier appel</TH>
                    <TH>Résultat</TH>
                    <TH className="text-right">Action</TH>
                  </tr>
                </THead>
                <tbody>
                  {activeClasses.map((item) => {
                    const sheet = lastSheetByClass.get(item.id);
                    const stats = sheet ? attendanceStats(sheet.records) : null;
                    return (
                      <TRow key={item.id}>
                        <TD>
                          <Link
                            href={href(`/classes/${item.id}`)}
                            className="font-medium text-slate-900 hover:text-brand-600 transition-colors"
                          >
                            {item.name}
                          </Link>
                        </TD>
                        <TD>{levelLabel(item.levelId)}</TD>
                        <TD>{classHeadcount(students, item.id)} élèves</TD>
                        <TD>{sheet ? formatDate(sheet.date) : 'Jamais'}</TD>
                        <TD>
                          {stats ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Badge tone="green">{stats.present}</Badge>
                              <Badge tone="red">{stats.absent}</Badge>
                              <Badge tone="orange">{stats.retard}</Badge>
                              <span className="text-xs text-slate-900 font-medium">
                                {stats.rate}%
                              </span>
                            </div>
                          ) : (
                            '—'
                          )}
                        </TD>
                        <TD className="text-right">
                          <LinkButton
                            href={href(`/attendance/${item.id}`)}
                            variant="soft"
                            size="sm"
                          >
                            <CalendarCheck size={15} /> Faire l’appel
                          </LinkButton>
                        </TD>
                      </TRow>
                    );
                  })}
                </tbody>
              </Table>
            </TableWrapper>

            <ul className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeClasses.map((item) => {
                const sheet = lastSheetByClass.get(item.id);
                const stats = sheet ? attendanceStats(sheet.records) : null;
                return (
                  <li
                    key={item.id}
                    className="border border-slate-100 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {levelLabel(item.levelId)} ·{' '}
                          {classHeadcount(students, item.id)} élèves
                        </p>
                      </div>
                      {stats && <Badge tone="brand">{stats.rate}%</Badge>}
                    </div>

                    <p className="text-xs text-slate-500 mt-3">
                      Dernier appel :{' '}
                      <span className="text-slate-900">
                        {sheet ? formatDate(sheet.date) : 'Jamais'}
                      </span>
                    </p>

                    {stats && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge tone="green">{stats.present} présents</Badge>
                        <Badge tone="red">{stats.absent} absents</Badge>
                        <Badge tone="orange">{stats.retard} retards</Badge>
                      </div>
                    )}

                    <LinkButton
                      href={href(`/attendance/${item.id}`)}
                      variant="soft"
                      size="sm"
                      fullWidth
                      className="mt-4"
                    >
                      <CalendarCheck size={15} /> Faire l’appel
                    </LinkButton>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Card>
    </PageContainer>
  );
}
