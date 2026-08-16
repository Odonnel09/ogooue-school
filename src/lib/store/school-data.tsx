'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  ANNOUNCEMENTS,
  AUDIT_ENTRIES,
  ATTENDANCE_SHEETS,
  CLASSES,
  CLASS_SUBJECTS,
  CONVERSATIONS,
  ENROLLMENT_APPLICATIONS,
  EVALUATIONS,
  GUARDIANS,
  GUARDIAN_LINKS,
  INVOICES,
  MESSAGES,
  PARTICIPANTS,
  PAYMENTS,
  SCHEDULE_SLOTS,
  STUDENTS,
  SUBJECTS,
  TEACHERS,
} from '@/data';
import { DEFAULT_TENANT_CONFIG, type TenantConfig } from '@/data/tenant-config';
import type {
  Announcement,
  AuditEntry,
  AttendanceSheet,
  ClassSubject,
  Conversation,
  EnrollmentApplication,
  Evaluation,
  Grade,
  GradeHistoryEntry,
  Guardian,
  GuardianLink,
  Invoice,
  Message,
  Participant,
  Payment,
  ReportCard,
  SchoolClass,
  ScheduleSlot,
  Student,
  Subject,
  Teacher,
} from '@/types';
import { createCrud, type Crud } from './collection';
import { clearStoredConfig, loadStoredConfig, storeConfig } from './persistence';

/**
 * Source de vérité locale de l'espace d'administration.
 *
 * Cette étape n'utilise que des données fictives conservées en mémoire :
 * toute création, modification ou suppression est simulée dans l'état React.
 * REMPLACEMENT SUPABASE : ce provider deviendra une couche de requêtes
 * (React Query + Server Actions) sans changer l'API consommée par les pages.
 */
interface SchoolDataContextValue {
  /** Configuration de l'établissement — pilote menus, formulaires et notation. */
  config: TenantConfig;
  students: Student[];
  enrollments: EnrollmentApplication[];
  guardians: Guardian[];
  guardianLinks: GuardianLink[];
  teachers: Teacher[];
  classes: SchoolClass[];
  classSubjects: ClassSubject[];
  subjects: Subject[];
  slots: ScheduleSlot[];
  sheets: AttendanceSheet[];
  evaluations: Evaluation[];
  invoices: Invoice[];
  payments: Payment[];
  reports: ReportCard[];
  announcements: Announcement[];
  /** Annuaire de la messagerie — fixe tant que la gestion des comptes n'existe pas. */
  participants: Participant[];
  conversations: Conversation[];
  messages: Message[];
  /**
   * Notifications déjà consultées. Seul l'état de lecture est stocké : les
   * notifications elles-mêmes se déduisent de l'état de l'établissement.
   */
  readNotificationIds: string[];
  /** Journal d'audit — en lecture seule pour les composants. */
  auditLog: AuditEntry[];
  actions: {
    students: Crud<Student>;
    enrollments: Crud<EnrollmentApplication>;
    guardians: Crud<Guardian>;
    guardianLinks: Crud<GuardianLink>;
    teachers: Crud<Teacher>;
    classes: Crud<SchoolClass>;
    classSubjects: Crud<ClassSubject>;
    subjects: Crud<Subject>;
    slots: Crud<ScheduleSlot>;
    evaluations: Crud<Evaluation>;
    invoices: Crud<Invoice>;
    payments: Crud<Payment>;
    reports: Crud<ReportCard>;
    announcements: Crud<Announcement>;
    conversations: Crud<Conversation>;
    /** Ajoute un message à un fil et remonte celui-ci en tête de liste. */
    sendMessage: (message: Message) => void;
    /** Marque tous les messages d'un fil comme lus par un participant. */
    markConversationRead: (conversationId: string, participantId: string) => void;
    /** Enregistre une ou plusieurs notifications comme consultées. */
    markNotificationsRead: (ids: string[]) => void;
    /**
     * Ajoute une entrée au journal d'audit. Aucune API de modification ni de
     * suppression n'est exposée : une trace ne se réécrit pas.
     */
    recordAudit: (entry: AuditEntry) => void;
    /** Met à jour la configuration de l'établissement (Paramètres). */
    updateConfig: (patch: Partial<TenantConfig>) => void;
    /** Rétablit la configuration livrée par défaut. */
    resetConfig: () => void;
    /** Insère ou remplace la feuille de présence d'une classe pour une date. */
    saveAttendanceSheet: (sheet: AttendanceSheet) => void;
    /**
     * Met à jour une note. `history` est renseigné lorsque la correction
     * intervient après verrouillage : elle exige alors un motif.
     */
    setGrade: (
      evaluationId: string,
      studentId: string,
      patch: Partial<Omit<Grade, 'studentId'>>,
      history?: GradeHistoryEntry,
    ) => void;
  };
}

const SchoolDataContext = createContext<SchoolDataContextValue | null>(null);

export function SchoolDataProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<TenantConfig>(DEFAULT_TENANT_CONFIG);
  const [students, setStudents] = useState<Student[]>(STUDENTS);
  const [enrollments, setEnrollments] = useState<EnrollmentApplication[]>(
    ENROLLMENT_APPLICATIONS,
  );
  const [guardians, setGuardians] = useState<Guardian[]>(GUARDIANS);
  const [guardianLinks, setGuardianLinks] =
    useState<GuardianLink[]>(GUARDIAN_LINKS);
  const [teachers, setTeachers] = useState<Teacher[]>(TEACHERS);
  const [classes, setClasses] = useState<SchoolClass[]>(CLASSES);
  const [classSubjects, setClassSubjects] =
    useState<ClassSubject[]>(CLASS_SUBJECTS);
  const [subjects, setSubjects] = useState<Subject[]>(SUBJECTS);
  const [slots, setSlots] = useState<ScheduleSlot[]>(SCHEDULE_SLOTS);
  const [sheets, setSheets] = useState<AttendanceSheet[]>(ATTENDANCE_SHEETS);
  const [evaluations, setEvaluations] = useState<Evaluation[]>(EVALUATIONS);
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES);
  const [payments, setPayments] = useState<Payment[]>(PAYMENTS);
  const [reports, setReports] = useState<ReportCard[]>([]);
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(ANNOUNCEMENTS);
  const [conversations, setConversations] =
    useState<Conversation[]>(CONVERSATIONS);
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(AUDIT_ENTRIES);

  const sendMessage = useCallback((message: Message) => {
    setMessages((previous) => [...previous, message]);
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === message.conversationId
          ? { ...conversation, lastMessageAt: message.sentAt }
          : conversation,
      ),
    );
  }, []);

  const markConversationRead = useCallback(
    (conversationId: string, participantId: string) => {
      setMessages((previous) =>
        previous.map((message) =>
          message.conversationId === conversationId &&
          !message.readBy.includes(participantId)
            ? { ...message, readBy: [...message.readBy, participantId] }
            : message,
        ),
      );
    },
    [],
  );

  const markNotificationsRead = useCallback((ids: string[]) => {
    setReadNotificationIds((previous) =>
      Array.from(new Set([...previous, ...ids])),
    );
  }, []);

  const recordAudit = useCallback((entry: AuditEntry) => {
    setAuditLog((previous) => [entry, ...previous]);
  }, []);

  /**
   * Reprise de la configuration enregistrée localement.
   *
   * La lecture doit avoir lieu après le montage : la lire pendant le rendu
   * produirait un écart entre le HTML du serveur et la première passe client.
   */
  useEffect(() => {
    const stored = loadStoredConfig();
    if (!stored) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydratation : voir ci-dessus
    setConfig(stored);
  }, []);

  const updateConfig = useCallback((patch: Partial<TenantConfig>) => {
    setConfig((previous) => {
      const next = { ...previous, ...patch };
      storeConfig(next);
      return next;
    });
  }, []);

  const resetConfig = useCallback(() => {
    clearStoredConfig();
    setConfig(DEFAULT_TENANT_CONFIG);
  }, []);

  const saveAttendanceSheet = useCallback((sheet: AttendanceSheet) => {
    setSheets((previous) => {
      const index = previous.findIndex(
        (item) => item.classId === sheet.classId && item.date === sheet.date,
      );
      if (index === -1) return [sheet, ...previous];
      const next = previous.slice();
      next[index] = sheet;
      return next;
    });
  }, []);

  const setGrade = useCallback(
    (
      evaluationId: string,
      studentId: string,
      patch: Partial<Omit<Grade, 'studentId'>>,
      history?: GradeHistoryEntry,
    ) => {
      setEvaluations((previous) =>
        previous.map((evaluation) => {
          if (evaluation.id !== evaluationId) return evaluation;

          const exists = evaluation.grades.some(
            (grade) => grade.studentId === studentId,
          );
          const grades = exists
            ? evaluation.grades.map((grade) =>
                grade.studentId === studentId ? { ...grade, ...patch } : grade,
              )
            : [
                ...evaluation.grades,
                { studentId, score: null, value: null, comment: '', ...patch },
              ];

          return {
            ...evaluation,
            grades,
            gradeHistory: history
              ? [history, ...evaluation.gradeHistory]
              : evaluation.gradeHistory,
          };
        }),
      );
    },
    [],
  );

  const actions = useMemo(
    () => ({
      students: createCrud(setStudents),
      enrollments: createCrud(setEnrollments),
      guardians: createCrud(setGuardians),
      guardianLinks: createCrud(setGuardianLinks),
      teachers: createCrud(setTeachers),
      classes: createCrud(setClasses),
      classSubjects: createCrud(setClassSubjects),
      subjects: createCrud(setSubjects),
      slots: createCrud(setSlots),
      evaluations: createCrud(setEvaluations),
      invoices: createCrud(setInvoices),
      payments: createCrud(setPayments),
      reports: createCrud(setReports),
      announcements: createCrud(setAnnouncements),
      conversations: createCrud(setConversations),
      sendMessage,
      markConversationRead,
      markNotificationsRead,
      recordAudit,
      updateConfig,
      resetConfig,
      saveAttendanceSheet,
      setGrade,
    }),
    [
      sendMessage,
      markConversationRead,
      markNotificationsRead,
      recordAudit,
      updateConfig,
      resetConfig,
      saveAttendanceSheet,
      setGrade,
    ],
  );

  const value = useMemo<SchoolDataContextValue>(
    () => ({
      config,
      students,
      enrollments,
      guardians,
      guardianLinks,
      teachers,
      classes,
      classSubjects,
      subjects,
      slots,
      sheets,
      evaluations,
      invoices,
      payments,
      reports,
      announcements,
      participants: PARTICIPANTS,
      conversations,
      messages,
      readNotificationIds,
      auditLog,
      actions,
    }),
    [
      config,
      students,
      enrollments,
      guardians,
      guardianLinks,
      teachers,
      classes,
      classSubjects,
      subjects,
      slots,
      sheets,
      evaluations,
      invoices,
      payments,
      reports,
      announcements,
      conversations,
      messages,
      readNotificationIds,
      auditLog,
      actions,
    ],
  );

  return (
    <SchoolDataContext.Provider value={value}>
      {children}
    </SchoolDataContext.Provider>
  );
}

export function useSchoolData(): SchoolDataContextValue {
  const context = useContext(SchoolDataContext);
  if (!context) {
    throw new Error(
      'useSchoolData doit être utilisé à l’intérieur de <SchoolDataProvider>.',
    );
  }
  return context;
}
