'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { Archive, Pencil, RotateCcw, Unlink, UsersRound } from 'lucide-react';
import type { GuardianLink } from '@/types';
import { guardianRelationLabels, ui } from '@/i18n/fr';
import { Can, useSession } from '@/lib/auth/session';
import { useHref } from '@/lib/hooks';
import { useSchoolData } from '@/lib/store/school-data';
import { useAudit } from '@/lib/audit/use-audit';
import {
  classLabel,
  guardianName,
  levelLabel,
  linksOfGuardian,
  studentName,
} from '@/lib/selectors';
import { guardianStatusMeta } from '@/lib/status';
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
  useToast,
} from '@/components/ui';
import { guardianMessages as m } from '@/features/guardians/messages';

export default function GuardianDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const href = useHref();
  const toast = useToast();
  const { guardians, guardianLinks, students, classes, actions } =
    useSchoolData();
  const audit = useAudit();
  const { isYearWritable } = useSession();

  const [confirmArchive, setConfirmArchive] = useState(false);
  const [toUnlink, setToUnlink] = useState<GuardianLink | null>(null);

  const guardian = guardians.find((item) => item.id === id);

  /** Enfants suivis, avec leur rattachement. */
  const children = useMemo(
    () =>
      linksOfGuardian(guardianLinks, id)
        .map((link) => ({
          link,
          student: students.find((item) => item.id === link.studentId),
        }))
        .filter(
          (
            entry,
          ): entry is { link: GuardianLink; student: (typeof students)[number] } =>
            entry.student !== undefined,
        ),
    [guardianLinks, students, id],
  );

  if (!guardian) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title={m.detail.notFoundTitle}
            message={m.detail.notFoundMessage}
            icon={<UsersRound size={24} aria-hidden="true" />}
            action={
              <LinkButton href={href('/guardians')} variant="outline">
                {m.detail.backToList}
              </LinkButton>
            }
          />
        </Card>
      </PageContainer>
    );
  }

  const fullName = guardianName(guardian);
  const isArchived = guardian.status === 'archive';

  function toggleArchive() {
    if (!guardian) return;
    actions.guardians.update(guardian.id, {
      status: isArchived ? 'actif' : 'archive',
    });
    audit({
      action: 'guardians.archive',
      resourceType: 'Tuteur',
      resourceId: guardian.id,
      resourceLabel: fullName,
      detail: isArchived
        ? 'Tuteur réactivé : il retrouve l’accès au portail famille.'
        : 'Tuteur archivé : son accès au portail famille est suspendu.',
    });
    setConfirmArchive(false);
    toast.success(
      isArchived ? m.detail.restored(fullName) : m.detail.archived(fullName),
    );
  }

  function unlink(link: GuardianLink) {
    actions.guardianLinks.remove(link.id);
    audit({
      action: 'guardians.unlink',
      resourceType: 'Rattachement tuteur',
      resourceId: link.id,
      resourceLabel: fullName,
      detail: 'Rattachement à un élève supprimé : le tuteur perd la visibilité sur ce dossier.',
    });
    setToUnlink(null);
    toast.success(m.detail.unlinked);
  }

  return (
    <PageContainer>
      <Card className="p-4 sm:p-6">
        <nav aria-label={ui.breadcrumb} className="mb-4">
          <Link
            href={href('/guardians')}
            className="text-xs text-slate-500 hover:text-brand-600 transition-colors rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            {m.detail.back}
          </Link>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <Avatar name={fullName} size="xl" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {fullName}
              </h1>
              <StatusBadge meta={guardianStatusMeta(guardian.status)} />
            </div>
            <p className="text-sm text-slate-500 mt-1">{guardian.phone}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge tone="brand">{m.list.children(children.length)}</Badge>
              {guardian.profession && (
                <Badge tone="slate">{guardian.profession}</Badge>
              )}
            </div>
          </div>

          {isYearWritable && (
            <div className="flex flex-wrap gap-2 sm:flex-col lg:flex-row">
              <Can permission="students.update">
                <LinkButton href={href(`/guardians/${guardian.id}/edit`)}>
                  <Pencil size={16} aria-hidden="true" /> {ui.edit}
                </LinkButton>
              </Can>
              <Can permission="students.delete">
                <Button
                  variant={isArchived ? 'outline' : 'dangerSoft'}
                  onClick={() => setConfirmArchive(true)}
                >
                  {isArchived ? (
                    <RotateCcw size={16} aria-hidden="true" />
                  ) : (
                    <Archive size={16} aria-hidden="true" />
                  )}
                  {isArchived ? ui.restore : ui.archive}
                </Button>
              </Can>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
            {m.detail.contact}
          </h2>
          <dl>
            <DataRow label={m.form.fields.phone} value={guardian.phone} />
            <DataRow label={m.form.fields.altPhone} value={guardian.altPhone} />
            <DataRow label={m.form.fields.email} value={guardian.email} />
            <DataRow label={m.form.fields.address} value={guardian.address} />
            <DataRow
              label={m.form.fields.profession}
              value={guardian.profession}
            />
            <DataRow
              label={m.form.fields.idDocument}
              value={guardian.idDocument}
            />
            <DataRow label={m.form.fields.notes} value={guardian.notes} />
          </dl>
        </Card>

        <Card className="p-4 sm:p-6 lg:col-span-2">
          <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {m.detail.children}
            </h2>
            <Badge tone="brand">{m.list.children(children.length)}</Badge>
          </div>

          {children.length === 0 ? (
            <EmptyState
              title={m.detail.noChild}
              message={m.detail.noChildMessage}
              icon={<UsersRound size={24} aria-hidden="true" />}
              action={
                <LinkButton href={href('/students')} variant="outline">
                  {m.detail.goToStudents}
                </LinkButton>
              }
            />
          ) : (
            <ul className="space-y-3">
              {children.map(({ link, student }) => (
                <li
                  key={link.id}
                  className="border border-slate-100 rounded-xl p-3 sm:p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar
                        name={studentName(student)}
                        src={student.photoUrl}
                        size="md"
                      />
                      <div className="min-w-0">
                        <Link
                          href={href(`/students/${student.id}`)}
                          className="text-sm font-medium text-slate-900 hover:text-brand-600 transition-colors block truncate rounded outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                        >
                          {studentName(student)}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {classLabel(classes, student.classId)} ·{' '}
                          {levelLabel(student.levelId)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <Badge tone="brand">
                        {guardianRelationLabels[link.relation]}
                      </Badge>
                      {link.isPrimary && (
                        <Badge tone="blue">{m.detail.primary}</Badge>
                      )}
                      {link.canPickUp && (
                        <Badge tone="green">{m.detail.canPickUp}</Badge>
                      )}
                      <Can permission="students.update" requiresWritableYear>
                        <button
                          type="button"
                          onClick={() => setToUnlink(link)}
                          aria-label={`${m.detail.unlink} ${studentName(student)}`}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-red-500/20"
                        >
                          <Unlink size={16} aria-hidden="true" />
                        </button>
                      </Can>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={confirmArchive}
        title={isArchived ? m.detail.restoreTitle : m.detail.archiveTitle}
        message={
          isArchived
            ? m.detail.restoreMessage(fullName)
            : m.list.archiveMessage(fullName)
        }
        destructive={!isArchived}
        confirmLabel={isArchived ? ui.restore : ui.archive}
        onCancel={() => setConfirmArchive(false)}
        onConfirm={toggleArchive}
      />

      <ConfirmDialog
        open={toUnlink !== null}
        title={m.detail.unlinkTitle}
        message={
          toUnlink
            ? m.detail.unlinkMessage(
                studentName(
                  children.find((entry) => entry.link.id === toUnlink.id)!
                    .student,
                ),
                fullName,
              )
            : ''
        }
        confirmLabel={m.detail.unlink}
        onCancel={() => setToUnlink(null)}
        onConfirm={() => toUnlink && unlink(toUnlink)}
      />
    </PageContainer>
  );
}
