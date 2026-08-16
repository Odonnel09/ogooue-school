'use client';

import { useMemo } from 'react';
import type { AppNotification } from '@/types';
import { isFileComplete, missingDocuments } from '@/types';
import { CURRENT_USER, REFERENCE_DATE } from '@/data/academic';
import { classLabel, studentName } from '@/lib/selectors';
import { formatMoney } from '@/lib/money';
import { useSchoolData } from '@/lib/store/school-data';
import { balanceOf, resolveInvoiceStatus } from '@/features/finance/queries';
import {
  counterpartLabel,
  lastMessageOf,
  unreadConversations,
} from '@/features/messages/queries';

/**
 * NOTIFICATIONS DÉRIVÉES DE L'ÉTAT RÉEL.
 *
 * Rien n'est semé ici : chaque ligne est la lecture d'une situation en cours
 * dans l'établissement. Une facture réglée fait disparaître son alerte sans
 * qu'on ait à la supprimer, et le compteur de la cloche ne peut pas mentir.
 *
 * L'identifiant est dérivé de la ressource d'origine (« notif-invoice-inv-004 »)
 * pour que l'état « lu », lui, puisse être mémorisé.
 *
 * REMPLACEMENT SUPABASE : ces règles migreront dans des déclencheurs serveur
 * écrivant dans `notifications`, avec Realtime pour la remontée immédiate.
 */

/** Au-delà, la cloche devient illisible : on agrège le reste en une ligne. */
const MAX_PER_KIND = 4;

export function useNotifications(): {
  notifications: AppNotification[];
  unread: number;
  markRead: (ids: string[]) => void;
} {
  const {
    invoices,
    payments,
    students,
    classes,
    enrollments,
    evaluations,
    conversations,
    messages,
    participants,
    readNotificationIds,
    actions,
  } = useSchoolData();

  const notifications = useMemo<AppNotification[]>(() => {
    const list: AppNotification[] = [];
    const read = new Set(readNotificationIds);

    /* ------------------------------------------------- Messages non lus */
    unreadConversations(conversations, messages, CURRENT_USER.id)
      .slice(0, MAX_PER_KIND)
      .forEach((conversation) => {
        const last = lastMessageOf(messages, conversation.id);
        list.push({
          id: `notif-message-${conversation.id}`,
          kind: 'message',
          title: counterpartLabel(participants, conversation, CURRENT_USER.id),
          body: last ? last.body.slice(0, 120) : conversation.subject,
          at: conversation.lastMessageAt,
          href: `/messages?fil=${conversation.id}`,
          read: read.has(`notif-message-${conversation.id}`),
        });
      });

    /* ------------------------------------------------------- Impayés */
    const overdue = invoices.filter(
      (invoice) =>
        resolveInvoiceStatus(invoice, payments, REFERENCE_DATE) === 'en_retard',
    );

    overdue.slice(0, MAX_PER_KIND).forEach((invoice) => {
      const student = students.find((item) => item.id === invoice.studentId);
      list.push({
        id: `notif-invoice-${invoice.id}`,
        kind: 'impaye',
        title: `Facture ${invoice.number} en retard`,
        body: `${student ? studentName(student) : 'Élève inconnu'} — ${formatMoney(
          balanceOf(invoice, payments),
        )} restant dus depuis le ${invoice.dueDate}.`,
        at: invoice.dueDate,
        href: `/finance/invoices/${invoice.id}`,
        read: read.has(`notif-invoice-${invoice.id}`),
      });
    });

    if (overdue.length > MAX_PER_KIND) {
      list.push({
        id: 'notif-invoice-reste',
        kind: 'impaye',
        title: `${overdue.length - MAX_PER_KIND} autres factures en retard`,
        body: 'Consultez le suivi des impayés pour la liste complète.',
        at: REFERENCE_DATE,
        href: '/finance/overdue',
        read: read.has('notif-invoice-reste'),
      });
    }

    /* -------------------------------------------- Dossiers incomplets */
    enrollments
      .filter(
        (application) =>
          application.status !== 'inscrite' &&
          application.status !== 'refusee' &&
          application.status !== 'brouillon' &&
          !isFileComplete(application),
      )
      .slice(0, MAX_PER_KIND)
      .forEach((application) => {
        const missing = missingDocuments(application);
        list.push({
          id: `notif-enrollment-${application.id}`,
          kind: 'dossier_incomplet',
          title: `Dossier ${application.reference} incomplet`,
          body: `${application.firstName} ${application.lastName} — ${missing.length} pièce(s) manquante(s) : ${missing
            .map((document) => document.name)
            .join(', ')}.`,
          at: application.submittedAt || REFERENCE_DATE,
          href: `/enrollments/${application.id}`,
          read: read.has(`notif-enrollment-${application.id}`),
        });
      });

    /* ------------------------------------------ Notes à valider */
    evaluations
      .filter(
        (evaluation) =>
          evaluation.status === 'submitted' ||
          (evaluation.status === 'in_progress' &&
            evaluation.grades.length > 0 &&
            evaluation.grades.every((grade) => grade.score !== null)),
      )
      .slice(0, MAX_PER_KIND)
      .forEach((evaluation) => {
        list.push({
          id: `notif-evaluation-${evaluation.id}`,
          kind: 'notes_a_valider',
          title: 'Notes en attente de validation',
          body: `${evaluation.name} — ${classLabel(classes, evaluation.classId)} : la saisie est complète.`,
          at: evaluation.date,
          href: `/evaluations/${evaluation.id}`,
          read: read.has(`notif-evaluation-${evaluation.id}`),
        });
      });

    return list.sort((a, b) => b.at.localeCompare(a.at));
  }, [
    invoices,
    payments,
    students,
    classes,
    enrollments,
    evaluations,
    conversations,
    messages,
    participants,
    readNotificationIds,
  ]);

  return {
    notifications,
    unread: notifications.filter((item) => !item.read).length,
    markRead: actions.markNotificationsRead,
  };
}
