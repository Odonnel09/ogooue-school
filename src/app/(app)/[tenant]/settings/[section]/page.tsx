'use client';

import { use } from 'react';
import { SectionRenderer } from '@/features/settings/components/SectionRenderer';

export default function SettingsSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = use(params);
  return <SectionRenderer sectionKey={section} />;
}
