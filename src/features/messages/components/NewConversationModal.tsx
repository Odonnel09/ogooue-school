'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import type { Participant, Student } from '@/types';
import { CURRENT_USER } from '@/data/academic';
import { reachableParticipants } from '@/lib/messaging/policy';
import type { MessagingRules } from '@/lib/messaging/policy';
import { participantKindLabels } from '@/i18n/fr';
import { studentName } from '@/lib/selectors';
import { Button, Field, Input, Modal, Select, Textarea } from '@/components/ui';
import { messagingMessages as m } from '../messages';

export interface NewConversationValues {
  recipientId: string;
  subject: string;
  studentId: string;
  body: string;
}

/**
 * Ouverture d'une conversation.
 *
 * La liste des destinataires n'est pas la liste des comptes : c'est le
 * résultat de `reachableParticipants()`, qui applique les règles d'échange de
 * l'établissement. Un correspondant interdit n'est pas grisé, il est absent.
 */
export function NewConversationModal({
  open,
  onClose,
  onSubmit,
  participants,
  students,
  rules,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewConversationValues) => void;
  participants: Participant[];
  students: Student[];
  rules: MessagingRules;
}) {
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [studentId, setStudentId] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const self = participants.find((item) => item.id === CURRENT_USER.id);
  const reachable = self
    ? reachableParticipants(rules, participants, self)
    : [];

  function reset() {
    setRecipientId('');
    setSubject('');
    setStudentId('');
    setBody('');
    setErrors({});
  }

  function submit() {
    const found: Record<string, string> = {};
    if (!recipientId) found.recipientId = m.form.errors.recipient;
    if (subject.trim().length < 3) found.subject = m.form.errors.subject;
    if (body.trim().length < 5) found.body = m.form.errors.body;

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit({
      recipientId,
      subject: subject.trim(),
      studentId,
      body: body.trim(),
    });
    reset();
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={m.form.title}
      description={m.form.description}
      size="lg"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            {m.form.cancel}
          </Button>
          <Button onClick={submit}>{m.form.submit}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field
          label={m.form.fields.recipient}
          htmlFor="conversation-recipient"
          required
          error={errors.recipientId}
        >
          <Select
            id="conversation-recipient"
            value={recipientId}
            invalid={Boolean(errors.recipientId)}
            placeholder={m.form.recipientPlaceholder}
            onChange={(event) => setRecipientId(event.target.value)}
            options={reachable.map((participant) => ({
              value: participant.id,
              label: `${participant.name} — ${participantKindLabels[participant.kind]}`,
            }))}
          />
        </Field>

        <Field
          label={m.form.fields.subject}
          htmlFor="conversation-subject"
          required
          error={errors.subject}
        >
          <Input
            id="conversation-subject"
            value={subject}
            invalid={Boolean(errors.subject)}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Absences répétées en mathématiques"
          />
        </Field>

        <Field
          label={m.form.fields.student}
          htmlFor="conversation-student"
          hint="Rattacher le fil à un élève évite les quiproquos dans les familles nombreuses."
        >
          <Select
            id="conversation-student"
            value={studentId}
            placeholder={m.form.noStudent}
            onChange={(event) => setStudentId(event.target.value)}
            options={students
              .filter((student) => student.status === 'actif')
              .map((student) => ({
                value: student.id,
                label: `${studentName(student)} — ${student.matricule}`,
              }))}
          />
        </Field>

        <Field
          label={m.form.fields.body}
          htmlFor="conversation-body"
          required
          error={errors.body}
        >
          <Textarea
            id="conversation-body"
            rows={4}
            value={body}
            invalid={Boolean(errors.body)}
            onChange={(event) => setBody(event.target.value)}
            placeholder={m.thread.replyPlaceholder}
          />
        </Field>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <Info
            size={15}
            aria-hidden="true"
            className="text-slate-400 mt-0.5 shrink-0"
          />
          <p className="text-xs text-slate-600 leading-relaxed">
            {m.policyNotice}
          </p>
        </div>
      </div>
    </Modal>
  );
}
