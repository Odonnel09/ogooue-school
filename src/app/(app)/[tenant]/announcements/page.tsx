'use client';

import { useMemo, useState } from 'react';
import {
  Archive,
  Bell,
  Eye,
  Megaphone,
  Pencil,
  Pin,
  Plus,
  Send,
  Trash2,
} from 'lucide-react';

import type { Announcement } from '@/types';
import { announcementStatusLabels, audienceLabels } from '@/i18n/fr';
import { announcementStatusMeta, labelOptions } from '@/lib/status';
import { useSchoolData } from '@/lib/store/school-data';
import { useSimulatedLoading } from '@/lib/hooks';
import { classLabel, levelLabel } from '@/lib/selectors';

import { formatDate, matches, todayIso } from '@/lib/utils';
import {
  ActionMenu,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  FilterBar,
  FilterSelect,
  Modal,
  PageContainer,
  PageHeader,
  Skeleton,
  StatCard,
  StatusBadge,
  useToast,
} from '@/components/ui';
import { AnnouncementForm } from '@/features/announcements/components/AnnouncementForm';

export default function AnnouncementsPage() {
  const toast = useToast();
  const ready = useSimulatedLoading();
  const { announcements, classes, actions } = useSchoolData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [preview, setPreview] = useState<Announcement | null>(null);
  const [toDelete, setToDelete] = useState<Announcement | null>(null);

  const visible = useMemo(
    () =>
      announcements
        .filter((announcement) => {
          if (!matches(`${announcement.title} ${announcement.content}`, search)) {
            return false;
          }
          if (statusFilter && announcement.status !== statusFilter) return false;
          if (audienceFilter && announcement.audience !== audienceFilter) {
            return false;
          }
          return true;
        })
        .sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return b.publishedAt.localeCompare(a.publishedAt);
        }),
    [announcements, search, statusFilter, audienceFilter],
  );

  const counts = useMemo(
    () => ({
      total: announcements.length,
      published: announcements.filter((item) => item.status === 'publiee').length,
      drafts: announcements.filter((item) => item.status === 'brouillon').length,
    }),
    [announcements],
  );

  const activeFilters = (statusFilter ? 1 : 0) + (audienceFilter ? 1 : 0);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(announcement: Announcement) {
    setEditing(announcement);
    setFormOpen(true);
  }

  function publish(announcement: Announcement) {
    actions.announcements.update(announcement.id, {
      status: 'publiee',
      publishedAt: announcement.publishedAt || todayIso(),
    });
    toast.success(`« ${announcement.title} » a été publiée.`);
  }

  function archive(announcement: Announcement) {
    actions.announcements.update(announcement.id, { status: 'archivee' });
    toast.success(`« ${announcement.title} » a été archivée.`);
  }

  function togglePin(announcement: Announcement) {
    actions.announcements.update(announcement.id, { pinned: !announcement.pinned });
    toast.success(
      announcement.pinned
        ? 'L’annonce n’est plus épinglée.'
        : 'L’annonce a été épinglée en haut de la liste.',
    );
  }

  function removeAnnouncement(announcement: Announcement) {
    actions.announcements.remove(announcement.id);
    setToDelete(null);
    toast.success('L’annonce a été supprimée.');
  }

  function audienceLabel(announcement: Announcement): string {
    if (announcement.audience === 'classe') {
      return `Classe ${classLabel(classes, announcement.targetClassId)}`;
    }
    return audienceLabels[announcement.audience];
  }

  return (
    <PageContainer>
      <PageHeader
        title="Annonces"
        description="Diffusez les informations de l’établissement aux parents, élèves et enseignants."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} /> Créer une annonce
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          label="Annonces"
          value={counts.total}
          icon={<Megaphone size={22} />}
          tone="brand"
        />
        <StatCard
          label="Publiées"
          value={counts.published}
          icon={<Send size={22} />}
          tone="green"
        />
        <StatCard
          label="Brouillons"
          value={counts.drafts}
          icon={<Pencil size={22} />}
          tone="yellow"
        />
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher une annonce..."
        activeCount={activeFilters}
        onReset={() => {
          setStatusFilter('');
          setAudienceFilter('');
        }}
      >
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={labelOptions(announcementStatusLabels)}
          placeholder="Tous les statuts"
          label="Filtrer par statut"
        />
        <FilterSelect
          value={audienceFilter}
          onChange={setAudienceFilter}
          options={labelOptions(audienceLabels)}
          placeholder="Toutes les audiences"
          label="Filtrer par audience"
        />
      </FilterBar>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Toutes les annonces
          </h2>
          <Badge tone="brand">
            {visible.length} résultat{visible.length > 1 ? 's' : ''}
          </Badge>
        </div>

        {!ready ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            title="Aucune annonce"
            message={
              announcements.length === 0
                ? 'Aucune annonce n’a encore été publiée. Créez la première.'
                : 'Aucune annonce ne correspond à votre recherche ou à vos filtres.'
            }
            icon={<Bell size={24} />}
            action={
              activeFilters > 0 || search ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('');
                    setAudienceFilter('');
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              ) : (
                <Button onClick={openCreate}>
                  <Plus size={16} /> Créer une annonce
                </Button>
              )
            }
          />
        ) : (
          <ul className="space-y-3">
            {visible.map((announcement) => (
              <li
                key={announcement.id}
                className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {announcement.pinned && (
                        <Pin size={14} className="text-brand-600 shrink-0" />
                      )}
                      <h3 className="text-sm font-bold text-slate-900">
                        {announcement.title}
                      </h3>
                      <StatusBadge
                        meta={announcementStatusMeta(announcement.status)}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                      {announcement.content}
                    </p>
                  </div>

                  <ActionMenu
                    label={`Actions pour ${announcement.title}`}
                    actions={[
                      {
                        label: 'Prévisualiser',
                        icon: <Eye size={16} />,
                        onSelect: () => setPreview(announcement),
                      },
                      {
                        label: 'Modifier',
                        icon: <Pencil size={16} />,
                        onSelect: () => openEdit(announcement),
                      },
                      {
                        label: announcement.pinned ? 'Ne plus épingler' : 'Épingler',
                        icon: <Pin size={16} />,
                        onSelect: () => togglePin(announcement),
                      },
                      {
                        label: 'Publier',
                        icon: <Send size={16} />,
                        disabled: announcement.status === 'publiee',
                        onSelect: () => publish(announcement),
                      },
                      {
                        label: 'Archiver',
                        icon: <Archive size={16} />,
                        disabled: announcement.status === 'archivee',
                        onSelect: () => archive(announcement),
                      },
                      {
                        label: 'Supprimer',
                        icon: <Trash2 size={16} />,
                        destructive: true,
                        onSelect: () => setToDelete(announcement),
                      },
                    ]}
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  <Badge tone="brand">{audienceLabel(announcement)}</Badge>
                  {announcement.targetLevelId && (
                    <Badge tone="blue">
                      {levelLabel(announcement.targetLevelId)}
                    </Badge>
                  )}
                  <Badge tone="slate">
                    Publiée le {formatDate(announcement.publishedAt)}
                  </Badge>
                  {announcement.expiresAt && (
                    <Badge tone="orange">
                      Expire le {formatDate(announcement.expiresAt)}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                  <p className="text-xs text-slate-400">
                    Par {announcement.authorName}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreview(announcement)}
                    >
                      <Eye size={15} /> Prévisualiser
                    </Button>
                    <Button
                      variant="soft"
                      size="sm"
                      onClick={() => openEdit(announcement)}
                    >
                      <Pencil size={15} /> Modifier
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {formOpen && (
        <AnnouncementForm
          key={editing?.id ?? 'new'}
          open={formOpen}
          announcement={editing ?? undefined}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}

      <Modal
        open={preview !== null}
        onClose={() => setPreview(null)}
        title={preview?.title ?? ''}
        description={
          preview
            ? `${audienceLabel(preview)} · publiée le ${formatDate(preview.publishedAt)}`
            : undefined
        }
        footer={
          <Button variant="outline" onClick={() => setPreview(null)}>
            Fermer
          </Button>
        }
      >
        {preview && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              <StatusBadge meta={announcementStatusMeta(preview.status)} />
              <Badge tone="brand">{audienceLabel(preview)}</Badge>
              {preview.expiresAt && (
                <Badge tone="orange">
                  Expire le {formatDate(preview.expiresAt)}
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {preview.content}
            </p>
            <p className="text-xs text-slate-400 pt-3 border-t border-slate-100">
              Rédigée par {preview.authorName}
            </p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer cette annonce ?"
        message={
          toDelete
            ? `L’annonce « ${toDelete.title} » sera définitivement supprimée.`
            : ''
        }
        confirmLabel="Supprimer"
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && removeAnnouncement(toDelete)}
      />
    </PageContainer>
  );
}
