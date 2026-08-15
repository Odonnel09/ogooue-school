'use client';

import { settingsMessages as m } from '../messages';
import { SettingsSection } from './SettingsSection';
import { TemplateEditor } from './TemplateEditor';

export function CardTemplateSection() {
  return (
    <SettingsSection
      title={m.templates.cardTitle}
      description={m.templates.cardDescription}
    >
      <TemplateEditor variant="card" />
    </SettingsSection>
  );
}
