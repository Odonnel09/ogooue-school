import type { Conversation, Message, Participant } from '@/types';

/**
 * Annuaire et fils de discussion fictifs.
 *
 * Les identifiants d'élèves et de classes renvoient aux jeux de données déjà
 * en place : un fil parle d'un élève réel du catalogue, pas d'un nom inventé.
 *
 * REMPLACEMENT SUPABASE : tables `conversations`, `conversation_participants`
 * et `messages`, cloisonnées par `tenant_id` et exposées via Realtime.
 */

export const PARTICIPANTS: Participant[] = [
  {
    id: 'prt-admin',
    name: 'Serge Ndong',
    kind: 'administration',
    title: 'Directeur des études',
  },
  {
    id: 'prt-secr',
    name: 'Nadège Boussougou',
    kind: 'administration',
    title: 'Secrétariat général',
  },
  {
    id: 'prt-compta',
    name: 'Yann Mombo',
    kind: 'administration',
    title: 'Comptabilité et recouvrement',
  },
  {
    id: 'prt-tch-001',
    name: 'Estelle Moussavou',
    kind: 'enseignant',
    title: 'Professeure de mathématiques',
  },
  {
    id: 'prt-tch-002',
    name: 'Patrick Ovono',
    kind: 'enseignant',
    title: 'Professeur de français',
  },
  {
    id: 'prt-tch-003',
    name: 'Léa Ndoumba',
    kind: 'enseignant',
    title: 'Professeure de SVT',
  },
  {
    id: 'prt-grd-001',
    name: 'Jean-Pierre Obame',
    kind: 'parent',
    title: 'Parent — 6ème A',
  },
  {
    id: 'prt-grd-002',
    name: 'Clarisse Mintsa',
    kind: 'parent',
    title: 'Parent — 3ème B',
  },
  {
    id: 'prt-grd-003',
    name: 'Alphonse Ndong Mba',
    kind: 'parent',
    title: 'Parent — Terminale C',
  },
  {
    id: 'prt-std-014',
    name: 'Aurélie Bouanga',
    kind: 'eleve',
    title: 'Élève — Terminale C',
  },
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'cnv-001',
    subject: 'Absences répétées en mathématiques',
    kind: 'direct',
    participantIds: ['prt-admin', 'prt-grd-001'],
    relatedStudentId: 'std-001',
    status: 'active',
    createdAt: '2026-11-09T08:15:00',
    lastMessageAt: '2026-11-12T16:42:00',
    pinned: true,
  },
  {
    id: 'cnv-002',
    subject: 'Deuxième tranche — demande d’échelonnement',
    kind: 'direct',
    participantIds: ['prt-compta', 'prt-grd-002', 'prt-admin'],
    relatedStudentId: 'std-004',
    status: 'active',
    createdAt: '2026-11-10T10:02:00',
    lastMessageAt: '2026-11-13T09:20:00',
    pinned: true,
  },
  {
    id: 'cnv-003',
    subject: 'Conseil de classe du premier trimestre — organisation',
    kind: 'groupe',
    participantIds: [
      'prt-admin',
      'prt-tch-001',
      'prt-tch-002',
      'prt-tch-003',
    ],
    relatedStudentId: '',
    status: 'active',
    createdAt: '2026-11-05T14:00:00',
    lastMessageAt: '2026-11-13T11:05:00',
    pinned: false,
  },
  {
    id: 'cnv-004',
    subject: 'Sortie pédagogique au Parc de la Lékédi',
    kind: 'diffusion',
    participantIds: [
      'prt-admin',
      'prt-grd-001',
      'prt-grd-002',
      'prt-grd-003',
    ],
    relatedStudentId: '',
    status: 'active',
    createdAt: '2026-11-11T07:30:00',
    lastMessageAt: '2026-11-11T07:30:00',
    pinned: false,
  },
  {
    id: 'cnv-005',
    subject: 'Demande de relevé de notes du premier trimestre',
    kind: 'direct',
    participantIds: ['prt-secr', 'prt-std-014'],
    relatedStudentId: 'std-014',
    status: 'active',
    createdAt: '2026-11-12T13:45:00',
    lastMessageAt: '2026-11-12T15:10:00',
    pinned: false,
  },
  {
    id: 'cnv-006',
    subject: 'Remplacement du cours de SVT du 3 novembre',
    kind: 'direct',
    participantIds: ['prt-admin', 'prt-tch-003'],
    relatedStudentId: '',
    status: 'archivee',
    createdAt: '2026-10-30T09:00:00',
    lastMessageAt: '2026-11-03T17:25:00',
    pinned: false,
  },
];

const READ_BY_ALL = (conversationId: string): string[] =>
  CONVERSATIONS.find((item) => item.id === conversationId)?.participantIds ?? [];

export const MESSAGES: Message[] = [
  /* ---------------------------------------------------------------- cnv-001 */
  {
    id: 'msg-001',
    conversationId: 'cnv-001',
    authorId: 'prt-admin',
    body: 'Bonjour Monsieur Obame. Nous avons relevé quatre absences non justifiées en mathématiques depuis la rentrée du deuxième mois. Pouvez-vous nous indiquer si une difficulté particulière explique ces absences ?',
    sentAt: '2026-11-09T08:15:00',
    attachments: [],
    readBy: READ_BY_ALL('cnv-001'),
  },
  {
    id: 'msg-002',
    conversationId: 'cnv-001',
    authorId: 'prt-grd-001',
    body: 'Bonjour Monsieur le Directeur. Mon fils a été souffrant les deux premières semaines. Je vous transmets le certificat médical. Pour les deux autres dates, je vais en discuter avec lui ce week-end.',
    sentAt: '2026-11-10T19:30:00',
    attachments: [
      {
        id: 'att-msg-001',
        name: 'certificat-medical.pdf',
        type: 'Justificatif',
        size: '180 Ko',
        uploadedAt: '2026-11-10',
      },
    ],
    readBy: READ_BY_ALL('cnv-001'),
  },
  {
    id: 'msg-003',
    conversationId: 'cnv-001',
    authorId: 'prt-grd-001',
    body: 'Serait-il possible d’organiser un entretien avec le professeur principal la semaine prochaine ? Je suis disponible mardi et jeudi après 16h.',
    sentAt: '2026-11-12T16:42:00',
    attachments: [],
    // Non lu par l'administration : c'est ce fil qui fait vibrer la cloche.
    readBy: ['prt-grd-001'],
  },

  /* ---------------------------------------------------------------- cnv-002 */
  {
    id: 'msg-004',
    conversationId: 'cnv-002',
    authorId: 'prt-grd-002',
    body: 'Bonjour, je souhaite solliciter un échelonnement de la deuxième tranche. Je peux régler la moitié avant le 30 novembre et le solde à la mi-décembre.',
    sentAt: '2026-11-10T10:02:00',
    attachments: [],
    readBy: READ_BY_ALL('cnv-002'),
  },
  {
    id: 'msg-005',
    conversationId: 'cnv-002',
    authorId: 'prt-compta',
    body: 'Bonjour Madame Mintsa. Votre demande est recevable. Je la transmets à la direction pour accord ; aucune pénalité ne sera appliquée entre-temps.',
    sentAt: '2026-11-11T08:40:00',
    attachments: [],
    readBy: READ_BY_ALL('cnv-002'),
  },
  {
    id: 'msg-006',
    conversationId: 'cnv-002',
    authorId: 'prt-grd-002',
    body: 'Je vous remercie. Dois-je passer au secrétariat signer un document, ou l’accord par messagerie suffit-il ?',
    sentAt: '2026-11-13T09:20:00',
    attachments: [],
    readBy: ['prt-grd-002', 'prt-compta'],
  },

  /* ---------------------------------------------------------------- cnv-003 */
  {
    id: 'msg-007',
    conversationId: 'cnv-003',
    authorId: 'prt-admin',
    body: 'Chers collègues, les conseils de classe du premier trimestre se tiendront du 8 au 12 décembre. Merci de saisir et de soumettre vos notes au plus tard le 5 décembre au soir.',
    sentAt: '2026-11-05T14:00:00',
    attachments: [],
    readBy: READ_BY_ALL('cnv-003'),
  },
  {
    id: 'msg-008',
    conversationId: 'cnv-003',
    authorId: 'prt-tch-001',
    body: 'Bien reçu. Il me reste le devoir surveillé du 28 novembre à corriger pour les 6ème ; tout sera saisi avant la date limite.',
    sentAt: '2026-11-06T07:50:00',
    attachments: [],
    readBy: READ_BY_ALL('cnv-003'),
  },
  {
    id: 'msg-009',
    conversationId: 'cnv-003',
    authorId: 'prt-tch-002',
    body: 'Une question d’organisation : les appréciations générales sont-elles à rédiger avant le conseil, ou pendant la séance comme l’an dernier ?',
    sentAt: '2026-11-13T11:05:00',
    attachments: [],
    readBy: ['prt-tch-002', 'prt-tch-001'],
  },

  /* ---------------------------------------------------------------- cnv-004 */
  {
    id: 'msg-010',
    conversationId: 'cnv-004',
    authorId: 'prt-admin',
    body: 'Une sortie pédagogique au Parc de la Lékédi est organisée le samedi 6 décembre pour les classes de 6ème et 5ème. La participation est de 8 000 FCFA par élève, à régler au secrétariat avant le 28 novembre. L’autorisation parentale signée est obligatoire.',
    sentAt: '2026-11-11T07:30:00',
    attachments: [
      {
        id: 'att-msg-002',
        name: 'autorisation-parentale.pdf',
        type: 'Formulaire',
        size: '96 Ko',
        uploadedAt: '2026-11-11',
      },
    ],
    readBy: ['prt-admin', 'prt-grd-001'],
  },

  /* ---------------------------------------------------------------- cnv-005 */
  {
    id: 'msg-011',
    conversationId: 'cnv-005',
    authorId: 'prt-std-014',
    body: 'Bonjour, je dois constituer un dossier de candidature et il me faut un relevé de notes du premier trimestre. Quelle est la procédure ?',
    sentAt: '2026-11-12T13:45:00',
    attachments: [],
    readBy: READ_BY_ALL('cnv-005'),
  },
  {
    id: 'msg-012',
    conversationId: 'cnv-005',
    authorId: 'prt-secr',
    body: 'Bonjour Aurélie. Le relevé sera disponible dès la publication des bulletins, le 15 décembre. Vous pourrez le télécharger depuis votre espace ; une copie signée est délivrée au secrétariat sur demande.',
    sentAt: '2026-11-12T15:10:00',
    attachments: [],
    readBy: ['prt-secr'],
  },

  /* ---------------------------------------------------------------- cnv-006 */
  {
    id: 'msg-013',
    conversationId: 'cnv-006',
    authorId: 'prt-tch-003',
    body: 'Bonjour, je serai en mission académique le 3 novembre. Le cours de SVT de 4ème peut-il être déplacé au vendredi 6 en fin de matinée ?',
    sentAt: '2026-10-30T09:00:00',
    attachments: [],
    readBy: READ_BY_ALL('cnv-006'),
  },
  {
    id: 'msg-014',
    conversationId: 'cnv-006',
    authorId: 'prt-admin',
    body: 'Le créneau du vendredi 6 à 11h est libre : c’est validé, l’emploi du temps a été mis à jour.',
    sentAt: '2026-11-03T17:25:00',
    attachments: [],
    readBy: READ_BY_ALL('cnv-006'),
  },
];
