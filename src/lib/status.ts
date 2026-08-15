import {
  ANNOUNCEMENT_STATUS_TONES,
  ATTENDANCE_STATUS_TONES,
  CLASS_STATUS_TONES,
  ENROLLMENT_STATUS_TONES,
  EVALUATION_STATUS_TONES,
  GUARDIAN_STATUS_TONES,
  INVOICE_STATUS_TONES,
  PAYMENT_STATUS_TONES,
  REPORT_STATUS_TONES,
  SCHEDULE_STATUS_TONES,
  STUDENT_STATUS_TONES,
  SUBJECT_STATUS_TONES,
  TEACHER_STATUS_TONES,
} from '@/types';
import type {
  AcademicYearStatus,
  AnnouncementStatus,
  AttendanceStatus,
  BadgeTone,
  ClassStatus,
  EnrollmentStatus,
  EvaluationStatus,
  GuardianStatus,
  InvoiceStatus,
  PaymentStatus,
  ReportCardStatus,
  ScheduleStatus,
  StatusMeta,
  StudentStatus,
  SubjectStatus,
  TeacherStatus,
} from '@/types';
import {
  academicYearStatusLabels,
  announcementStatusLabels,
  attendanceStatusLabels,
  classStatusLabels,
  enrollmentStatusLabels,
  evaluationStatusLabels,
  guardianStatusLabels,
  invoiceStatusLabels,
  paymentStatusLabels,
  reportStatusLabels,
  scheduleStatusLabels,
  studentStatusLabels,
  subjectStatusLabels,
  teacherStatusLabels,
} from '@/i18n/fr';

/**
 * Assemble un `StatusMeta` à partir de deux sources séparées :
 * la **couleur** vient des types (préoccupation de design system) et le
 * **libellé** du dictionnaire (préoccupation de traduction).
 */
function build<T extends string>(
  tones: Record<T, BadgeTone>,
  labels: Record<T, string>,
) {
  return (status: T): StatusMeta => ({
    label: labels[status],
    tone: tones[status],
  });
}

export const studentStatusMeta = build<StudentStatus>(
  STUDENT_STATUS_TONES,
  studentStatusLabels,
);

export const teacherStatusMeta = build<TeacherStatus>(
  TEACHER_STATUS_TONES,
  teacherStatusLabels,
);

export const guardianStatusMeta = build<GuardianStatus>(
  GUARDIAN_STATUS_TONES,
  guardianStatusLabels,
);

export const classStatusMeta = build<ClassStatus>(
  CLASS_STATUS_TONES,
  classStatusLabels,
);

export const subjectStatusMeta = build<SubjectStatus>(
  SUBJECT_STATUS_TONES,
  subjectStatusLabels,
);

export const scheduleStatusMeta = build<ScheduleStatus>(
  SCHEDULE_STATUS_TONES,
  scheduleStatusLabels,
);

export const attendanceStatusMeta = build<AttendanceStatus>(
  ATTENDANCE_STATUS_TONES,
  attendanceStatusLabels,
);

export const evaluationStatusMeta = build<EvaluationStatus>(
  EVALUATION_STATUS_TONES,
  evaluationStatusLabels,
);

export const enrollmentStatusMeta = build<EnrollmentStatus>(
  ENROLLMENT_STATUS_TONES,
  enrollmentStatusLabels,
);

export const invoiceStatusMeta = build<InvoiceStatus>(
  INVOICE_STATUS_TONES,
  invoiceStatusLabels,
);

export const paymentStatusMeta = build<PaymentStatus>(
  PAYMENT_STATUS_TONES,
  paymentStatusLabels,
);

export const reportStatusMeta = build<ReportCardStatus>(
  REPORT_STATUS_TONES,
  reportStatusLabels,
);

export const announcementStatusMeta = build<AnnouncementStatus>(
  ANNOUNCEMENT_STATUS_TONES,
  announcementStatusLabels,
);

const ACADEMIC_YEAR_STATUS_TONES: Record<AcademicYearStatus, BadgeTone> = {
  draft: 'yellow',
  active: 'green',
  closed: 'blue',
  archived: 'slate',
};

export const academicYearStatusMeta = build<AcademicYearStatus>(
  ACADEMIC_YEAR_STATUS_TONES,
  academicYearStatusLabels,
);

/** Options de select construites depuis un dictionnaire de libellés. */
export function labelOptions<T extends string>(
  labels: Record<T, string>,
): Array<{ value: T; label: string }> {
  return (Object.keys(labels) as T[]).map((value) => ({
    value,
    label: labels[value],
  }));
}

/** Options de select restreintes à un sous-ensemble de clés autorisées. */
export function labelOptionsFor<T extends string>(
  labels: Record<T, string>,
  allowed: T[],
): Array<{ value: T; label: string }> {
  return allowed.map((value) => ({ value, label: labels[value] }));
}
