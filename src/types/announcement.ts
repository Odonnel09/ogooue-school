import type { BadgeTone } from './common';

export type AnnouncementStatus =
  | 'brouillon'
  | 'programmee'
  | 'publiee'
  | 'archivee';

export const ANNOUNCEMENT_STATUS_TONES: Record<AnnouncementStatus, BadgeTone> = {
  brouillon: 'slate',
  programmee: 'yellow',
  publiee: 'green',
  archivee: 'slate',
};

export type AnnouncementAudience =
  | 'tous'
  | 'parents'
  | 'eleves'
  | 'etudiants'
  | 'enseignants'
  | 'administration'
  | 'classe';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  audience: AnnouncementAudience;
  /** Renseigné uniquement quand `audience === 'classe'`. */
  targetClassId: string;
  /** Niveau concerné, optionnel (vide = tous les niveaux de l'audience). */
  targetLevelId: string;
  publishedAt: string;
  expiresAt: string;
  status: AnnouncementStatus;
  pinned: boolean;
}

export type AnnouncementDraft = Omit<Announcement, 'id'>;
