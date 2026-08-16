'use client';

import { useState } from 'react';
import { FileCheck, Info, Plus, Trash2 } from 'lucide-react';
import { studentFieldLabels } from '@/i18n/fr';
import { useCapabilities } from '@/lib/school-levels/use-capabilities';
import { useSchoolData } from '@/lib/store/school-data';
import { useAudit } from '@/lib/audit/use-audit';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Input,
  useToast,
} from '@/components/ui';
import { settingsMessages as m } from '../messages';
import { SettingsSection } from './SettingsSection';

export function EnrollmentSection() {
  const toast = useToast();
  const { config, actions } = useSchoolData();
  const capabilities = useCapabilities();
  const audit = useAudit();
  const [documentName, setDocumentName] = useState('');

  /** Champs déduits de la matrice : non modifiables ici, par construction. */
  const fields = capabilities.studentFields;

  function addDocument() {
    const name = documentName.trim();
    if (!name) return;
    if (config.enrollment.requiredDocuments.includes(name)) {
      toast.error('Cette pièce est déjà exigée.');
      return;
    }
    actions.updateConfig({
      enrollment: {
        ...config.enrollment,
        requiredDocuments: [...config.enrollment.requiredDocuments, name],
      },
    });
    audit({
      action: 'settings.enrollment.update',
      resourceType: 'Dossier d’inscription',
      resourceId: 'required-documents',
      resourceLabel: 'Pièces exigées',
      detail: `« ${name} » ajoutée : les dossiers sans cette pièce seront signalés incomplets.`,
    });
    setDocumentName('');
    toast.success(`« ${name} » ajoutée aux pièces exigées.`);
  }

  function removeDocument(name: string) {
    actions.updateConfig({
      enrollment: {
        ...config.enrollment,
        requiredDocuments: config.enrollment.requiredDocuments.filter(
          (item) => item !== name,
        ),
      },
    });
    audit({
      action: 'settings.enrollment.update',
      resourceType: 'Dossier d’inscription',
      resourceId: 'required-documents',
      resourceLabel: 'Pièces exigées',
      detail: `« ${name} » retirée des pièces exigées.`,
    });
    toast.success(`« ${name} » retirée des pièces exigées.`);
  }

  function toggleApproval(next: boolean) {
    actions.updateConfig({
      enrollment: { ...config.enrollment, requiresApproval: next },
    });
    audit({
      action: 'settings.enrollment.update',
      resourceType: 'Dossier d’inscription',
      resourceId: 'requires-approval',
      resourceLabel: 'Validation préalable',
      detail: next
        ? 'Validation par la direction désormais exigée avant toute inscription.'
        : 'Validation par la direction désactivée : le secrétariat peut inscrire directement.',
    });
    toast.success(m.saved);
  }

  return (
    <SettingsSection title={m.enrollment.title} description={m.enrollment.description}>
      <Card className="p-4 sm:p-6">
        <h2 className="text-base font-bold text-slate-900">
          {m.enrollment.fieldsTitle}
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          {m.enrollment.fieldsHint}
        </p>

        <div className="flex flex-wrap gap-2">
          {fields.map((field) => (
            <Badge key={field} tone="brand">
              {studentFieldLabels[field]}
            </Badge>
          ))}
        </div>

        <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-2.5">
          <Info
            size={16}
            className="text-slate-400 mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <p className="text-xs text-slate-600 leading-relaxed">
            Exemple : le bloc « Parent ou tuteur » disparaît du dossier dès que
            l’élève est affecté à une classe du supérieur, où les étudiants sont
            majeurs.
          </p>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-bold text-slate-900">
            {m.enrollment.documentsTitle}
          </h2>
          <Badge tone="slate">
            {config.enrollment.requiredDocuments.length} pièces
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Input
            value={documentName}
            onChange={(event) => setDocumentName(event.target.value)}
            placeholder={m.enrollment.documentPlaceholder}
            aria-label={m.enrollment.documentPlaceholder}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={addDocument}
            disabled={!documentName.trim()}
          >
            <Plus size={16} aria-hidden="true" /> {m.enrollment.addDocument}
          </Button>
        </div>

        {config.enrollment.requiredDocuments.length === 0 ? (
          <EmptyState
            title="Aucune pièce exigée"
            message="Les dossiers d’inscription pourront être validés sans justificatif."
            icon={<FileCheck size={24} aria-hidden="true" />}
          />
        ) : (
          <ul className="space-y-2">
            {config.enrollment.requiredDocuments.map((name) => (
              <li
                key={name}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm text-slate-700">{name}</span>
                <button
                  type="button"
                  aria-label={`${m.enrollment.removeDocument} ${name}`}
                  onClick={() => removeDocument(name)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-red-500/20"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">
          {m.enrollment.approvalTitle}
        </h2>
        <Checkbox
          label={m.enrollment.approvalLabel}
          checked={config.enrollment.requiresApproval}
          onChange={(event) => toggleApproval(event.target.checked)}
        />
      </Card>
    </SettingsSection>
  );
}
