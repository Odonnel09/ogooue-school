'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useSchoolData } from '@/lib/store/school-data';
import { useAudit } from '@/lib/audit/use-audit';
import {
  Card,
  Field,
  Input,
  SignaturePad,
  useToast,
} from '@/components/ui';
import { settingsMessages as m } from '../messages';
import { SettingsSection } from './SettingsSection';
import { TemplateEditor } from './TemplateEditor';

export function ReportTemplateSection() {
  const toast = useToast();
  const { config, actions } = useSchoolData();
  const audit = useAudit();

  const signature = config.signature;

  /**
   * Identité déjà journalisée. Les champs texte se modifient frappe par
   * frappe : sans ce repère, chaque lettre saisie produirait une entrée.
   */
  const [auditedSigner, setAuditedSigner] = useState(
    `${signature.signerName}|${signature.signerRole}`,
  );

  function patchSignature(changes: Partial<typeof signature>) {
    actions.updateConfig({ signature: { ...signature, ...changes } });
  }

  function recordSignature(detail: string) {
    audit({
      action: 'settings.signature.update',
      resourceType: 'Signature d’établissement',
      resourceId: 'signature',
      resourceLabel: signature.signerName || 'Chef d’établissement',
      detail,
    });
  }

  /** Journalise le signataire au moment où le champ est quitté, s'il a changé. */
  function auditSignerIdentity() {
    const current = `${signature.signerName}|${signature.signerRole}`;
    if (current === auditedSigner) return;
    setAuditedSigner(current);
    recordSignature(
      `Signataire des bulletins : ${signature.signerName || '—'} (${
        signature.signerRole || '—'
      }).`,
    );
  }

  return (
    <SettingsSection
      title={m.templates.reportTitle}
      description={m.templates.reportDescription}
    >
      <TemplateEditor variant="report" />

      {/* Signature du chef d'établissement */}
      <Card className="p-4 sm:p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {m.templates.signatureTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {m.templates.signatureHint}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SignaturePad
            label={m.templates.signatureFields.pad}
            hint={m.templates.signatureFields.padHint}
            value={signature.image.dataUrl}
            onChange={(dataUrl) => {
              recordSignature(
                dataUrl
                  ? 'Nouvelle signature manuscrite enregistrée : elle sera apposée sur les bulletins publiés ensuite.'
                  : 'Signature manuscrite supprimée : les bulletins déjà publiés la conservent.',
              );
              patchSignature({
                image: {
                  name: dataUrl ? 'signature.png' : '',
                  dataUrl,
                  // La taille sert au suivi du quota de stockage local.
                  size: Math.round(((dataUrl.split(',')[1] ?? '').length * 3) / 4),
                },
              });
            }}
            onError={toast.error}
          />

          <div className="space-y-4">
            <Field
              label={m.templates.signatureFields.signerName}
              htmlFor="signer-name"
            >
              <Input
                id="signer-name"
                value={signature.signerName}
                onBlur={auditSignerIdentity}
                onChange={(event) =>
                  patchSignature({ signerName: event.target.value })
                }
              />
            </Field>

            <Field
              label={m.templates.signatureFields.signerRole}
              htmlFor="signer-role"
            >
              <Input
                id="signer-role"
                value={signature.signerRole}
                onBlur={auditSignerIdentity}
                onChange={(event) =>
                  patchSignature({ signerRole: event.target.value })
                }
              />
            </Field>
          </div>
        </div>

        {!signature.image.dataUrl && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 flex items-start gap-2.5">
            <AlertTriangle
              size={16}
              className="text-yellow-600 mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <p className="text-xs text-yellow-800 leading-relaxed">
              {m.templates.signatureMissing}
            </p>
          </div>
        )}
      </Card>
    </SettingsSection>
  );
}
