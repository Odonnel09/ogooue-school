import type { Announcement } from '@/types';

/**
 * Annonces publiées par l'administration.
 * REMPLACEMENT SUPABASE : table `announcements`.
 */
export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-001',
    title: 'Rentrée scolaire 2026-2027 : organisation de la première semaine',
    content:
      'La rentrée des élèves est fixée au lundi 14 septembre 2026 à 07h30. Les cours commenceront selon l’emploi du temps provisoire affiché à l’entrée principale. Les manuels seront distribués le mercredi 16 septembre au CDI, classe par classe.',
    authorName: 'Direction générale',
    audience: 'tous',
    targetClassId: '',
    targetLevelId: '',
    publishedAt: '2026-09-05',
    expiresAt: '2026-09-30',
    status: 'publiee',
    pinned: true,
  },
  {
    id: 'ann-002',
    title: 'Réunion des parents d’élèves des classes d’examen',
    content:
      'Une réunion est organisée le samedi 24 octobre 2026 à 09h00 dans l’amphithéâtre A, à l’attention des parents des élèves de 3ème et de Terminale. Ordre du jour : calendrier des examens blancs, suivi des résultats du premier trimestre et modalités d’inscription au BEPC et au baccalauréat.',
    authorName: 'Serge Ndong',
    audience: 'parents',
    targetClassId: '',
    targetLevelId: 'terminale',
    publishedAt: '2026-10-08',
    expiresAt: '2026-10-24',
    status: 'publiee',
    pinned: true,
  },
  {
    id: 'ann-003',
    title: 'Paiement de la deuxième tranche des frais de scolarité',
    content:
      'Les familles sont invitées à s’acquitter de la deuxième tranche des frais de scolarité avant le 30 novembre 2026. Le règlement peut être effectué au secrétariat ou par Mobile Money. Un reçu est délivré systématiquement.',
    authorName: 'Service comptabilité',
    audience: 'parents',
    targetClassId: '',
    targetLevelId: '',
    publishedAt: '2026-10-15',
    expiresAt: '2026-11-30',
    status: 'publiee',
    pinned: false,
  },
  {
    id: 'ann-004',
    title: 'Conseil pédagogique du premier trimestre',
    content:
      'Le conseil pédagogique se tiendra le vendredi 6 novembre 2026 à 15h30 en salle 201. La présence de tous les professeurs principaux est obligatoire. Merci de transmettre vos moyennes de classe au plus tard la veille.',
    authorName: 'Direction des études',
    audience: 'enseignants',
    targetClassId: '',
    targetLevelId: '',
    publishedAt: '2026-10-20',
    expiresAt: '2026-11-06',
    status: 'publiee',
    pinned: false,
  },
  {
    id: 'ann-005',
    title: 'Sortie pédagogique de la Terminale C au CENAREST',
    content:
      'Les élèves de Terminale C effectueront une visite du Centre National de la Recherche Scientifique et Technologique le jeudi 12 novembre 2026. Le départ est prévu à 08h00 depuis la cour principale. L’autorisation parentale signée est à remettre avant le 8 novembre.',
    authorName: 'Sylvie Moussavou',
    audience: 'classe',
    targetClassId: 'cls-tc',
    targetLevelId: 'terminale',
    publishedAt: '2026-10-28',
    expiresAt: '2026-11-12',
    status: 'publiee',
    pinned: false,
  },
  {
    id: 'ann-006',
    title: 'Ouverture des inscriptions au concours d’éloquence',
    content:
      'Le club de lecture organise son concours annuel d’éloquence. Les élèves intéressés peuvent s’inscrire auprès de Mme Nzue jusqu’au 20 novembre 2026. La finale se déroulera en présence des parents.',
    authorName: 'Clarisse Nzue',
    audience: 'eleves',
    targetClassId: '',
    targetLevelId: '',
    publishedAt: '2026-11-02',
    expiresAt: '2026-11-20',
    status: 'programmee',
    pinned: false,
  },
  {
    id: 'ann-007',
    title: 'Calendrier des partiels du semestre 1 (Licence et Master)',
    content:
      'Le calendrier des épreuves du semestre 1 sera publié après validation par le conseil de faculté. Les étudiants sont invités à consulter régulièrement leur espace personnel.',
    authorName: 'Scolarité — Enseignement supérieur',
    audience: 'etudiants',
    targetClassId: '',
    targetLevelId: '',
    publishedAt: '',
    expiresAt: '',
    status: 'brouillon',
    pinned: false,
  },
  {
    id: 'ann-008',
    title: 'Mise à jour du règlement intérieur',
    content:
      'Le règlement intérieur a été mis à jour pour intégrer les nouvelles règles d’usage du téléphone portable dans l’enceinte de l’établissement. Le document complet est disponible au secrétariat et dans la bibliothèque numérique.',
    authorName: 'Direction générale',
    audience: 'administration',
    targetClassId: '',
    targetLevelId: '',
    publishedAt: '2026-09-21',
    expiresAt: '2026-10-10',
    status: 'archivee',
    pinned: false,
  },
];
