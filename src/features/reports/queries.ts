import {
  computePeriodAverage,
  computeRanking,
  computeSubjectAverage,
  computeDecision,
} from '@/lib/grading/engine';
import type {
  GradeInput,
  GradingConfig,
  PeriodResult,
  RankedResult,
  SubjectWeight,
} from '@/lib/grading/types';
import { gradingScaleLabels } from '@/i18n/fr';
import type { LevelCapabilities } from '@/lib/school-levels/capabilities';
import {
  attendanceStats,
  levelLabel,
  studentName,
  subjectsOfClass,
  teacherLabel,
} from '@/lib/selectors';
import { average as mean } from '@/lib/utils';
import type {
  AppliedSignature,
  AttendanceSheet,
  ClassSubject,
  DocumentTemplate,
  SignatureConfig,
  Evaluation,
  Period,
  ReportSnapshot,
  ReportSubjectLine,
  SchoolClass,
  Student,
  Subject,
  Teacher,
} from '@/types';
import type { TenantProfile } from '@/data/tenant-config';

/**
 * Construction d'un bulletin.
 *
 * Le calcul délègue intégralement au moteur de notation : cette couche ne fait
 * que rassembler les entrées et mettre en forme le résultat.
 */

/** Évaluations prises en compte : validées ou publiées, sur la période. */
function countedEvaluations(
  evaluations: Evaluation[],
  classId: string,
  periodId: string,
): Evaluation[] {
  return evaluations.filter(
    (evaluation) =>
      evaluation.classId === classId &&
      evaluation.periodId === periodId &&
      (evaluation.status === 'validated' || evaluation.status === 'published'),
  );
}

function gradeInputsFor(
  evaluations: Evaluation[],
  subjectId: string,
  studentId: string,
): GradeInput[] {
  return evaluations
    .filter((evaluation) => evaluation.subjectId === subjectId)
    .map((evaluation) => {
      const grade = evaluation.grades.find(
        (item) => item.studentId === studentId,
      );
      if (!grade || (grade.score === null && grade.value === null)) return null;

      return {
        studentId,
        score: grade.score,
        value: grade.value,
        scale: evaluation.scale,
        maxScore: evaluation.maxScore,
        evaluationType: evaluation.type,
        coefficient: evaluation.coefficient,
      } satisfies GradeInput;
    })
    .filter((input): input is GradeInput => input !== null);
}

export interface ReportContext {
  schoolClass: SchoolClass;
  period: Period;
  capabilities: LevelCapabilities;
  gradingConfig: GradingConfig;
  profile: TenantProfile;
  /** Gabarit en vigueur au moment de la génération. */
  template: DocumentTemplate;
  /** Signature d'établissement par défaut. */
  signature: SignatureConfig;
  roster: Student[];
  classSubjects: ClassSubject[];
  subjects: Subject[];
  teachers: Teacher[];
  evaluations: Evaluation[];
  sheets: AttendanceSheet[];
}

/** Résultat de période d'un élève, tel que le moteur le produit. */
function periodResultOf(
  studentId: string,
  context: ReportContext,
  scoped: Evaluation[],
): PeriodResult {
  const links = subjectsOfClass(context.classSubjects, context.schoolClass.id);

  const subjectResults = links.map((link) => {
    const weight: SubjectWeight = {
      subjectId: link.subjectId,
      coefficient: link.coefficient,
      credits:
        context.subjects.find((item) => item.id === link.subjectId)
          ?.ectsCredits ?? 0,
    };
    return computeSubjectAverage(
      gradeInputsFor(scoped, link.subjectId, studentId),
      weight,
      context.gradingConfig,
    );
  });

  return computePeriodAverage(studentId, subjectResults, context.gradingConfig);
}

/** Classement de la promotion sur la période. */
export function rankingOf(context: ReportContext): RankedResult[] {
  const scoped = countedEvaluations(
    context.evaluations,
    context.schoolClass.id,
    context.period.id,
  );
  return computeRanking(
    context.roster.map((student) => periodResultOf(student.id, context, scoped)),
  );
}

/**
 * Assemble l'instantané complet d'un bulletin.
 * Rien n'est lu depuis le store ensuite : le document devient autoportant.
 */
export function buildSnapshot(
  student: Student,
  context: ReportContext,
  councilComment: string,
  generatedAt: string,
  signatureOverride: AppliedSignature | null = null,
): ReportSnapshot {
  const scoped = countedEvaluations(
    context.evaluations,
    context.schoolClass.id,
    context.period.id,
  );

  const ranked = computeRanking(
    context.roster.map((item) => periodResultOf(item.id, context, scoped)),
  );
  const own = ranked.find((entry) => entry.studentId === student.id);

  const links = subjectsOfClass(context.classSubjects, context.schoolClass.id);

  const lines: ReportSubjectLine[] = links.map((link) => {
    const subject = context.subjects.find((item) => item.id === link.subjectId);
    const result = own?.subjects.find(
      (entry) => entry.subjectId === link.subjectId,
    );

    // Statistiques de la classe sur cette matière.
    const classAverages = ranked
      .map(
        (entry) =>
          entry.subjects.find((item) => item.subjectId === link.subjectId)
            ?.average ?? null,
      )
      .filter((value): value is number => value !== null);

    return {
      subjectId: link.subjectId,
      subjectLabel: subject?.name ?? link.subjectId,
      teacherName: teacherLabel(context.teachers, link.teacherId),
      coefficient: link.coefficient,
      credits: subject?.ectsCredits ?? 0,
      average: result?.average ?? null,
      classAverage: mean(classAverages),
      best: classAverages.length ? Math.max(...classAverages) : null,
      lowest: classAverages.length ? Math.min(...classAverages) : null,
      validated: result?.validated ?? null,
      gradeCount: result?.gradeCount ?? 0,
      comment: '',
    };
  });

  // Assiduité de l'élève sur les feuilles d'appel de sa classe.
  const records = context.sheets
    .filter((sheet) => sheet.classId === context.schoolClass.id)
    .map((sheet) =>
      sheet.records.find((record) => record.studentId === student.id),
    )
    .filter((record): record is NonNullable<typeof record> => Boolean(record));

  const attendance = attendanceStats(records);
  const decision = computeDecision(
    own ?? {
      studentId: student.id,
      subjects: [],
      average: null,
      totalCoefficient: 0,
      earnedCredits: 0,
      totalCredits: 0,
    },
    context.gradingConfig,
  );

  return {
    student: {
      id: student.id,
      fullName: studentName(student),
      matricule: student.matricule,
      birthDate: student.birthDate,
      className: context.schoolClass.name,
      levelLabel: levelLabel(student.levelId),
    },
    school: {
      name: context.profile.name,
      city: context.profile.city,
      director: context.profile.director,
      logo: context.profile.logo,
    },
    academicYear: context.schoolClass.academicYear,
    periodLabel: context.period.label,
    template: context.capabilities.reportTemplate,
    // Recopie du gabarit : le document devient indépendant de la configuration.
    style: structuredClone(context.template),
    signature:
      signatureOverride ??
      (context.signature.image.dataUrl
        ? {
            dataUrl: context.signature.image.dataUrl,
            signerName: context.signature.signerName,
            signerRole: context.signature.signerRole,
            signedAt: generatedAt,
          }
        : null),
    lines,
    average: own?.average ?? null,
    rank: ranked.find((entry) => entry.studentId === student.id)?.rank ?? null,
    headcount: context.roster.length,
    totalCoefficient: own?.totalCoefficient ?? 0,
    earnedCredits: own?.earnedCredits ?? 0,
    totalCredits: own?.totalCredits ?? 0,
    decision,
    attendance: {
      present: attendance.present,
      absent: attendance.absent,
      retard: attendance.retard,
      rate: attendance.rate,
    },
    councilComment,
    generatedAt,
    configSummary: `${gradingScaleLabels[context.gradingConfig.scale]} · seuil ${context.gradingConfig.passMark}/20 · arrondi ${context.gradingConfig.rounding}`,
  };
}
