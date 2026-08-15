'use client';

import { ShieldAlert } from 'lucide-react';
import { useSession } from '@/lib/auth/session';
import { Card, EmptyState, LinkButton } from '@/components/ui';
import { useHref } from '@/lib/hooks';
import { findSection } from '../sections';
import { ComingSoonSection } from './SettingsSection';
import { CardTemplateSection } from './CardTemplateSection';
import { EnrollmentSection } from './EnrollmentSection';
import { FeesSection } from './FeesSection';
import { GeneralSection } from './GeneralSection';
import { GradingSection } from './GradingSection';
import { LevelsSection } from './LevelsSection';
import { PeriodsSection } from './PeriodsSection';
import { ReportTemplateSection } from './ReportTemplateSection';
import { RolesSection } from './RolesSection';
import { StructureSection } from './StructureSection';
import { YearsSection } from './YearsSection';

const READY_SECTIONS: Record<string, () => React.JSX.Element> = {
  general: GeneralSection,
  levels: LevelsSection,
  structure: StructureSection,
  years: YearsSection,
  periods: PeriodsSection,
  grading: GradingSection,
  enrollment: EnrollmentSection,
  roles: RolesSection,
  fees: FeesSection,
  'report-templates': ReportTemplateSection,
  cards: CardTemplateSection,
};

export function SectionRenderer({ sectionKey }: { sectionKey: string }) {
  const href = useHref();
  const { can } = useSession();
  const section = findSection(sectionKey);

  if (!section) {
    return (
      <Card>
        <EmptyState
          title="Section inconnue"
          message="Cette section de paramètres n’existe pas."
          action={
            <LinkButton href={href('/settings')} variant="outline">
              Retour aux paramètres
            </LinkButton>
          }
        />
      </Card>
    );
  }

  // Rappel : ce contrôle est cosmétique. La sécurité réelle sera côté serveur.
  if (!can(section.permission)) {
    return (
      <Card>
        <EmptyState
          title="Accès non autorisé"
          message="Votre rôle ne donne pas accès à cette section de la configuration."
          icon={<ShieldAlert size={24} aria-hidden="true" />}
          action={
            <LinkButton href={href('/settings')} variant="outline">
              Retour aux paramètres
            </LinkButton>
          }
        />
      </Card>
    );
  }

  const Component = READY_SECTIONS[section.key];

  if (!Component) {
    return (
      <ComingSoonSection
        title={section.title}
        description={section.description}
        message={section.pending ?? ''}
      />
    );
  }

  return <Component />;
}
