'use client';

import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Paperclip, Trash2, UserRound } from 'lucide-react';
import { CURRENT_ACADEMIC_YEAR } from '@/data/academic';
import { genderLabels, guardianRelationLabels, ui } from '@/i18n/fr';
import { guardianName } from '@/lib/selectors';
import { useHref } from '@/lib/hooks';
import { useCapabilities } from '@/lib/school-levels/use-capabilities';
import { labelOptions } from '@/lib/status';
import { classOptions } from '@/lib/options';
import { avatarUrl, createId, todayIso } from '@/lib/utils';
import type {
  Attachment,
  Guardian,
  GuardianLink,
  SchoolClass,
  Student,
} from '@/types';
import {
  Button,
  Field,
  FormActions,
  FormSection,
  Input,
  Checkbox,
  Select,
  Textarea,
  useToast,
  DatePicker,
} from '@/components/ui';
import { saveStudent } from '../actions';
import { studentMessages as m } from '../messages';
import {
  studentDraftSchema,
  studentFinalSchema,
  type StudentFormValues,
} from '../schemas';

function toFormValues(
  student: Student | undefined,
  link: GuardianLink | undefined,
): StudentFormValues {
  return {
    firstName: student?.firstName ?? '',
    lastName: student?.lastName ?? '',
    matricule: student?.matricule ?? '',
    birthDate: student?.birthDate ?? '',
    birthPlace: student?.birthPlace ?? '',
    gender: student?.gender ?? 'M',
    nationality: student?.nationality ?? 'Gabonaise',
    address: student?.address ?? '',
    photoUrl: student?.photoUrl ?? '',
    classId: student?.classId ?? '',
    levelId: student?.levelId ?? '',
    academicYear: student?.academicYear ?? CURRENT_ACADEMIC_YEAR,
    status: student?.status ?? 'en_attente',
    guardianId: link?.guardianId ?? '',
    guardianRelation: link?.relation ?? 'pere',
    canPickUp: link?.canPickUp ?? true,
    medicalInfo: student?.medicalInfo ?? '',
    previousSchool: student?.previousSchool ?? '',
    filiere: student?.filiere ?? '',
    parcours: student?.parcours ?? '',
  };
}

/**
 * Formulaire du dossier élève.
 *
 * Les listes déroulantes — classes, tuteurs, matricules déjà pris — viennent
 * du serveur : c'est ce qui garantit qu'un identifiant choisi ici existe
 * réellement en base. L'enregistrement repart en Server Action.
 */
export function StudentForm({
  tenantSlug,
  student,
  classes,
  guardians,
  takenMatricules: takenFromServer,
  currentLink,
}: {
  tenantSlug: string;
  student?: Student;
  classes: SchoolClass[];
  guardians: Guardian[];
  takenMatricules: string[];
  currentLink?: GuardianLink;
}) {
  const isEdit = Boolean(student);
  const router = useRouter();
  const href = useHref();
  const toast = useToast();
  const capabilities = useCapabilities();

  const [documents, setDocuments] = useState<Attachment[]>(
    student?.documents ?? [],
  );
  const [documentName, setDocumentName] = useState('');
  const [submitting, setSubmitting] = useState<'draft' | 'final' | null>(null);

  const takenMatricules = takenFromServer;

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    setError,
    formState: { errors },
  } = useForm<StudentFormValues>({
    defaultValues: toFormValues(student, currentLink),
    resolver: zodResolver(
      studentFinalSchema({
        // Le schéma est reconstruit à chaque rendu à partir des capacités :
        // changer de classe change les champs exigés.
        fields: capabilities.studentFields,
        takenMatricules,
      }),
    ),
  });

  /**
   * `useWatch` plutôt que le `watch()` renvoyé par `useForm` : ce dernier est une
   * fonction que le compilateur React ne peut pas mémoïser, ce qui lui fait
   * abandonner l'optimisation du composant entier. `useWatch` renvoie une valeur.
   */
  const classId = useWatch({ control, name: 'classId' });
  const firstName = useWatch({ control, name: 'firstName' });
  const lastName = useWatch({ control, name: 'lastName' });
  const photoUrl = useWatch({ control, name: 'photoUrl' });

  /**
   * Les blocs affichés découlent du cycle de la classe choisie. Sans classe,
   * on retombe sur l'union des cycles ouverts dans l'établissement.
   */
  const activeFields = useMemo(() => {
    const selected = classes.find((item) => item.id === classId);
    return selected
      ? capabilities.forClass(selected).studentFields
      : capabilities.studentFields;
  }, [classes, classId, capabilities]);

  const hasField = (field: (typeof activeFields)[number]) =>
    activeFields.includes(field);

  /** Libellé du niveau porté par une classe, pour l'affichage en lecture seule. */
  function levelNameOf(id: string): string {
    const selected = classes.find((item) => item.id === id);
    return selected ? `Niveau de ${selected.name}` : '';
  }

  function handleClassChange(nextClassId: string) {
    setValue('classId', nextClassId, { shouldValidate: false });
    const selected = classes.find((item) => item.id === nextClassId);
    if (selected) setValue('levelId', selected.levelId);
  }

  function persist(values: StudentFormValues, isDraft: boolean) {
    setSubmitting(isDraft ? 'draft' : 'final');

    void saveStudent(tenantSlug, {
      id: student?.id,
      firstName: values.firstName,
      lastName: values.lastName,
      matricule: values.matricule,
      birthDate: values.birthDate,
      birthPlace: values.birthPlace,
      gender: values.gender,
      nationality: values.nationality,
      address: values.address,
      classId: values.classId,
      levelId: values.levelId,
      status: values.status,
      medicalInfo: values.medicalInfo,
      previousSchool: values.previousSchool,
      filiere: values.filiere,
      parcours: values.parcours,
      isDraft,
      guardianId: values.guardianId,
      guardianRelation: values.guardianRelation,
      canPickUp: values.canPickUp,
    }).then((result) => {
      setSubmitting(null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        isEdit
          ? m.form.toasts.updated(values.firstName)
          : isDraft
            ? m.form.toasts.draft
            : m.form.toasts.created(`${values.firstName} ${values.lastName}`),
      );
      router.push(href(`/students/${result.id}`));
      router.refresh();
    });
  }

  /** Le brouillon n'exige que l'identité : le dossier reste incomplet. */
  function saveDraft() {
    const values = getValues();
    const parsed = studentDraftSchema.safeParse(values);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === 'string') {
          setError(path as keyof StudentFormValues, { message: issue.message });
        }
      });
      toast.error(ui.invalidForm);
      return;
    }

    persist(parsed.data, true);
  }

  function addDocument() {
    if (!documentName.trim()) return;
    setDocuments((previous) => [
      ...previous,
      {
        id: createId('doc'),
        name: documentName.trim(),
        type: 'Pièce jointe',
        size: '—',
        uploadedAt: todayIso(),
      },
    ]);
    setDocumentName('');
  }

  const previewName = `${firstName} ${lastName}`.trim() || 'Nouvel élève';

  return (
    <form
      noValidate
      onSubmit={handleSubmit(
        (values) => persist(values, false),
        () => toast.error(ui.invalidForm),
      )}
      className="space-y-5 sm:space-y-6"
    >
      <FormSection
        title={m.form.sections.identity}
        description={m.form.sections.identityHint}
      >
        <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-16 h-16 rounded-full bg-white border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-300">
            {photoUrl || firstName ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl || avatarUrl(previewName)}
                alt={previewName}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound size={24} aria-hidden="true" />
            )}
          </div>
          <Field
            label={m.form.fields.photo}
            htmlFor="photoUrl"
            hint={m.form.fields.photoHint}
            className="flex-1"
          >
            <Input id="photoUrl" placeholder="https://..." {...register('photoUrl')} />
          </Field>
        </div>

        <Field
          label={m.form.fields.lastName}
          htmlFor="lastName"
          required
          error={errors.lastName?.message}
        >
          <Input
            id="lastName"
            placeholder="Ndong"
            invalid={Boolean(errors.lastName)}
            {...register('lastName')}
          />
        </Field>

        <Field
          label={m.form.fields.firstName}
          htmlFor="firstName"
          required
          error={errors.firstName?.message}
        >
          <Input
            id="firstName"
            placeholder="Jean"
            invalid={Boolean(errors.firstName)}
            {...register('firstName')}
          />
        </Field>

        <Field
          label={m.form.fields.birthDate}
          htmlFor="birthDate"
          required
          error={errors.birthDate?.message}
        >
          <DatePicker
            id="birthDate"
            invalid={Boolean(errors.birthDate)}
            {...register('birthDate')}
          />
        </Field>

        {hasField('birthPlace') && (
          <Field label={m.form.fields.birthPlace} htmlFor="birthPlace">
            <Input id="birthPlace" placeholder="Libreville" {...register('birthPlace')} />
          </Field>
        )}

        <Field label={m.form.fields.gender} htmlFor="gender">
          <Select id="gender" options={labelOptions(genderLabels)} {...register('gender')} />
        </Field>

        {hasField('nationality') && (
          <Field label={m.form.fields.nationality} htmlFor="nationality">
            <Input id="nationality" {...register('nationality')} />
          </Field>
        )}

        {hasField('address') && (
          <Field
            label={m.form.fields.address}
            htmlFor="address"
            className="sm:col-span-2"
          >
            <Textarea
              id="address"
              rows={2}
              placeholder="Quartier, ville"
              {...register('address')}
            />
          </Field>
        )}
      </FormSection>

      <FormSection
        title={m.form.sections.schooling}
        description={m.form.sections.schoolingHint}
      >
        <Field
          label={m.form.fields.matricule}
          htmlFor="matricule"
          required
          error={errors.matricule?.message}
        >
          <Input
            id="matricule"
            placeholder="MAT-0000"
            invalid={Boolean(errors.matricule)}
            {...register('matricule')}
          />
        </Field>

        <Field
          label={m.form.fields.classroom}
          htmlFor="classId"
          required
          error={errors.classId?.message}
        >
          <Select
            id="classId"
            value={classId}
            options={classOptions(classes)}
            placeholder="Sélectionner une classe"
            invalid={Boolean(errors.classId)}
            onChange={(event) => handleClassChange(event.target.value)}
          />
        </Field>

        <Field
          label={m.form.fields.level}
          htmlFor="levelId"
          required
          error={errors.levelId?.message}
          hint={m.form.fields.levelHint}
        >
          {/*
            Le niveau découle de la classe choisie et n'est plus saisissable :
            le laisser libre permettait d'inscrire un élève de 6ème dans un
            niveau de Terminale.
          */}
          <Input
            id="levelId"
            readOnly
            value={
              classes.find((item) => item.id === classId)?.name
                ? levelNameOf(classId)
                : ''
            }
            placeholder="Déduit de la classe"
            className="bg-slate-50 text-slate-500"
          />
          <input type="hidden" {...register('levelId')} />
        </Field>

        {/*
          L'année scolaire est fixée par le serveur à l'enregistrement : la
          laisser au client permettrait de rattacher un élève à une année close.
        */}
      </FormSection>

      {hasField('guardian') && (
        <FormSection
          title={m.form.sections.guardian}
          description={m.form.sections.guardianHint}
        >
          <Field
            label={m.form.fields.guardian}
            htmlFor="guardianId"
            required
            error={errors.guardianId?.message}
            hint={m.form.fields.guardianHint}
          >
            <Select
              id="guardianId"
              options={guardians
                .filter((item) => item.status === 'actif')
                .map((item) => ({
                  value: item.id,
                  label: `${guardianName(item)} — ${item.phone}`,
                }))}
              placeholder="Sélectionner un parent ou tuteur"
              invalid={Boolean(errors.guardianId)}
              {...register('guardianId')}
            />
          </Field>

          <Field label={m.form.fields.guardianRelation} htmlFor="guardianRelation">
            <Select
              id="guardianRelation"
              options={labelOptions(guardianRelationLabels)}
              {...register('guardianRelation')}
            />
          </Field>

          {hasField('authorizedPickup') && (
            <div className="sm:col-span-2">
              <Checkbox
                label={m.form.fields.canPickUp}
                description={m.form.fields.canPickUpHint}
                {...register('canPickUp')}
              />
            </div>
          )}
        </FormSection>
      )}

      {hasField('medicalInfo') && (
        <FormSection
          title={m.form.sections.health}
          description={m.form.sections.healthHint}
          columns={1}
        >
          <Field label={m.form.fields.medicalInfo} htmlFor="medicalInfo">
            <Textarea id="medicalInfo" rows={3} {...register('medicalInfo')} />
          </Field>
        </FormSection>
      )}

      {hasField('previousSchool') && (
        <FormSection
          title={m.form.sections.background}
          description={m.form.sections.backgroundHint}
          columns={1}
        >
          <Field label={m.form.fields.previousSchool} htmlFor="previousSchool">
            <Input id="previousSchool" {...register('previousSchool')} />
          </Field>
        </FormSection>
      )}

      {hasField('academicTrack') && (
        <FormSection
          title={m.form.sections.track}
          description={m.form.sections.trackHint}
        >
          <Field label={m.form.fields.filiere} htmlFor="filiere">
            <Input id="filiere" {...register('filiere')} />
          </Field>
          <Field label={m.form.fields.parcours} htmlFor="parcours">
            <Input id="parcours" {...register('parcours')} />
          </Field>
        </FormSection>
      )}

      <FormSection
        title={m.form.sections.documents}
        description={m.form.sections.documentsHint}
        columns={1}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={documentName}
            onChange={(event) => setDocumentName(event.target.value)}
            placeholder={m.form.fields.documentName}
            aria-label={m.form.fields.documentName}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={addDocument}
            disabled={!documentName.trim()}
          >
            <Paperclip size={16} aria-hidden="true" /> {m.form.fields.addDocument}
          </Button>
        </div>

        {documents.length > 0 && (
          <ul className="space-y-2">
            {documents.map((document) => (
              <li
                key={document.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm text-slate-700 truncate">
                  {document.name}
                </span>
                <button
                  type="button"
                  aria-label={`Retirer ${document.name}`}
                  onClick={() =>
                    setDocuments((previous) =>
                      previous.filter((item) => item.id !== document.id),
                    )
                  }
                  className="text-slate-400 hover:text-red-500 transition-colors shrink-0 rounded-lg p-1 focus-visible:ring-4 focus-visible:ring-red-500/20 outline-none"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </FormSection>

      <FormActions>
        <Button
          variant="ghost"
          onClick={() => router.push(href('/students'))}
          disabled={submitting !== null}
        >
          {m.form.actions.cancel}
        </Button>
        <Button
          variant="outline"
          onClick={saveDraft}
          loading={submitting === 'draft'}
          disabled={submitting !== null}
        >
          {m.form.actions.saveDraft}
        </Button>
        <Button
          type="submit"
          loading={submitting === 'final'}
          disabled={submitting !== null}
        >
          {isEdit ? m.form.actions.update : m.form.actions.create}
        </Button>
      </FormActions>
    </form>
  );
}
