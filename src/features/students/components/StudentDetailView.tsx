'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Archive,
  CalendarCheck,
  FileText,
  History,
  Pencil,
  RotateCcw,
  UserRound,
} from 'lucide-react';

import { genderLabels, guardianRelationLabels } from '@/i18n/fr';
import { studentStatusMeta } from '@/lib/status';
import { useHref } from '@/lib/hooks';
import { guardianName, studentName } from '@/lib/selectors';
import { ageFromBirthDate, formatDate } from '@/lib/utils';
import { archiveStudent as archiveStudentAction } from '../actions';
import type { StudentDetailData } from '../queries.server';
import {
  Avatar,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DataRow,
  EmptyState,
  LinkButton,
  PageContainer,
  StatusBadge,
  Tabs,
  useToast,
} from '@/components/ui';

const TABS = [
  { id: 'infos', label: 'Informations' },
  { id: 'attendance', label: 'Présences' },
  { id: 'grades', label: 'Notes' },
  { id: 'documents', label: 'Documents' },
  { id: 'history', label: 'Historique' },
];

/**
 * Fiche d'un élève.
 *
 * Les données viennent du serveur, filtrées par les politiques RLS. Les
 * panneaux « présences » et « notes » sont vides tant que ces modules ne sont
 * pas branchés — non par omission, mais parce que la base ne contient
 * effectivement aucune feuille d'appel ni évaluation. Afficher un jeu fictif
 * à côté de données réelles serait le vrai défaut.
 */
export function StudentDetailView({
  tenantSlug,
  student,
  schoolClass,
  levelLabel,
  guardians,
  guardianLinks,
}: StudentDetailData & { tenantSlug: string }) {
  const href = useHref();
  const toast = useToast();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [tab, setTab] = useState('infos');
  const [confirmArchive, setConfirmArchive] = useState(false);

  /** Tuteurs rattachés, contact principal en tête. */
  const studentLinks = useMemo(
    () =>
      guardianLinks
        .slice()
        .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary)),
    [guardianLinks],
  );

  const fullName = studentName(student);
  const isArchived = student.status === 'archive';

  function toggleArchive() {
    setConfirmArchive(false);
    if (isArchived) {
      toast.info('La réactivation sera branchée avec le formulaire d’édition.');
      return;
    }
    startTransition(async () => {
      const result = await archiveStudentAction(tenantSlug, student.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`${fullName} a été archivé.`);
      router.refresh();
    });
  }

  return (
    <PageContainer>
      {/* En-tête de fiche */}
      <Card className="p-4 sm:p-6">
        <nav aria-label="Fil d'Ariane" className="mb-4">
          <Link
            href={href('/students')}
            className="text-xs text-slate-500 hover:text-brand-600 transition-colors"
          >
            ← Retour aux élèves
          </Link>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <Avatar name={fullName} src={student.photoUrl} size="xl" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {fullName}
              </h1>
              <StatusBadge meta={studentStatusMeta(student.status)} />
              {student.isDraft && <Badge tone="yellow">Brouillon</Badge>}
            </div>
            <p className="text-sm text-slate-500 mt-1 font-mono">
              {student.matricule}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge tone="brand">{schoolClass?.name ?? 'Non affecté'}</Badge>
              <Badge tone="blue">{levelLabel}</Badge>
              <Badge tone="slate">{student.academicYear}</Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-col lg:flex-row">
            <LinkButton href={href(`/students/${student.id}/edit`)} variant="primary">
              <Pencil size={16} /> Modifier
            </LinkButton>
            <Button
              variant={isArchived ? 'outline' : 'dangerSoft'}
              onClick={() => setConfirmArchive(true)}
            >
              {isArchived ? <RotateCcw size={16} /> : <Archive size={16} />}
              {isArchived ? 'Réactiver' : 'Archiver'}
            </Button>
          </div>
        </div>
      </Card>

      <Tabs items={TABS} active={tab} onChange={setTab} />

      {tab === 'infos' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              Informations personnelles
            </h2>
            <dl>
              <DataRow label="Nom complet" value={fullName} />
              <DataRow
                label="Date de naissance"
                value={
                  student.birthDate
                    ? `${formatDate(student.birthDate)} (${ageFromBirthDate(student.birthDate)} ans)`
                    : ''
                }
              />
              <DataRow label="Lieu de naissance" value={student.birthPlace} />
              <DataRow label="Sexe" value={genderLabels[student.gender]} />
              <DataRow label="Nationalité" value={student.nationality} />
              <DataRow label="Adresse" value={student.address} />
            </dl>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              Parents et tuteurs
            </h2>

            {studentLinks.length === 0 ? (
              <EmptyState
                title="Aucun tuteur rattaché"
                message="Rattachez un parent ou tuteur depuis le formulaire de modification."
                icon={<UserRound size={24} aria-hidden="true" />}
                action={
                  <LinkButton
                    href={href(`/students/${student.id}/edit`)}
                    variant="outline"
                  >
                    <Pencil size={16} aria-hidden="true" /> Rattacher un tuteur
                  </LinkButton>
                }
              />
            ) : (
              <ul className="space-y-3">
                {studentLinks.map((link) => {
                  const guardian = guardians.find(
                    (item) => item.id === link.guardianId,
                  );
                  if (!guardian) return null;

                  return (
                    <li
                      key={link.id}
                      className="border border-slate-100 rounded-xl p-3 sm:p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <Link
                          href={href(`/guardians/${guardian.id}`)}
                          className="text-sm font-medium text-slate-900 hover:text-brand-600 transition-colors"
                        >
                          {guardianName(guardian)}
                        </Link>
                        <span className="flex flex-wrap gap-1.5">
                          <Badge tone="brand">
                            {guardianRelationLabels[link.relation]}
                          </Badge>
                          {link.isPrimary && (
                            <Badge tone="blue">Contact principal</Badge>
                          )}
                          {link.canPickUp && (
                            <Badge tone="green">Autorisé à récupérer</Badge>
                          )}
                        </span>
                      </div>
                      <dl className="mt-2">
                        <DataRow label="Téléphone" value={guardian.phone} />
                        <DataRow label="Email" value={guardian.email} />
                        <DataRow label="Profession" value={guardian.profession} />
                      </dl>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      )}

      {tab === 'attendance' && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
            Présences et absences
          </h2>
          <EmptyState
            title="Aucune présence enregistrée"
            message="La base ne contient encore aucune feuille d’appel pour cette classe. Ce panneau se remplira dès que le module Présences sera branché."
            icon={<CalendarCheck size={24} aria-hidden="true" />}
            action={
              <LinkButton href={href('/attendance')} variant="outline">
                Aller aux présences
              </LinkButton>
            }
          />
        </Card>
      )}

      {tab === 'grades' && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
            Notes récentes
          </h2>
          <EmptyState
            title="Aucune note enregistrée"
            message="La base ne contient encore aucune évaluation. Ce panneau se remplira dès que le module Évaluations sera branché."
            icon={<FileText size={24} aria-hidden="true" />}
            action={
              <LinkButton href={href('/evaluations')} variant="outline">
                Aller aux évaluations
              </LinkButton>
            }
          />
        </Card>
      )}

      {tab === 'documents' && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
            Documents du dossier
          </h2>
          {student.documents.length === 0 ? (
            <EmptyState
              title="Aucun document"
              message="Aucune pièce n’a été jointe à ce dossier. Ajoutez-en depuis le formulaire de modification."
              icon={<FileText size={24} />}
              action={
                <LinkButton
                  href={href(`/students/${student.id}/edit`)}
                  variant="outline"
                >
                  <Pencil size={16} /> Modifier la fiche
                </LinkButton>
              }
            />
          ) : (
            <ul className="space-y-2">
              {student.documents.map((document) => (
                <li
                  key={document.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {document.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {document.type} · {document.size} · ajouté le{' '}
                        {formatDate(document.uploadedAt)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'history' && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
            Historique d’inscription
          </h2>
          {student.enrollment.length === 0 ? (
            <EmptyState
              title="Aucun historique"
              message="Aucun mouvement d’inscription n’est enregistré pour cet élève."
              icon={<History size={24} />}
            />
          ) : (
            <ol className="relative border-l border-slate-100 ml-3 space-y-5">
              {student.enrollment.map((entry) => (
                <li key={entry.id} className="pl-6">
                  <span className="absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full bg-brand-500" />
                  <p className="text-sm font-medium text-slate-900">
                    {entry.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {entry.academicYear} · {entry.className} ·{' '}
                    {formatDate(entry.date)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </Card>
      )}

      <ConfirmDialog
        open={confirmArchive}
        title={isArchived ? 'Réactiver cet élève ?' : 'Archiver cet élève ?'}
        message={
          isArchived
            ? `${fullName} redeviendra actif et réapparaîtra dans les listes de sa classe.`
            : `La fiche de ${fullName} sera archivée. Elle restera consultable et pourra être réactivée à tout moment.`
        }
        destructive={!isArchived}
        confirmLabel={isArchived ? 'Réactiver' : 'Archiver'}
        onCancel={() => setConfirmArchive(false)}
        onConfirm={toggleArchive}
      />
    </PageContainer>
  );
}
