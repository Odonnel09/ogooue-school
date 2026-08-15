'use client';

import { cycleLabels } from '@/i18n/fr';
import { useSchoolData } from '@/lib/store/school-data';
import { Badge, Card, DataRow } from '@/components/ui';
import { SetupChecklist } from '@/features/settings/components/SetupChecklist';
import { settingsMessages as m } from '@/features/settings/messages';

export default function SettingsHomePage() {
  const { config } = useSchoolData();

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{m.title}</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-3xl">{m.description}</p>
      </div>

      <SetupChecklist />

      <Card className="p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
          Configuration actuelle
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <DataRow label="Établissement" value={config.profile.name} />
          <DataRow
            label="Ville"
            value={`${config.profile.city}, ${config.profile.country}`}
          />
          <DataRow
            label="Cycles actifs"
            value={
              <span className="flex flex-wrap gap-1.5">
                {config.activeCycles.map((cycle) => (
                  <Badge key={cycle} tone="brand">
                    {cycleLabels[cycle]}
                  </Badge>
                ))}
              </span>
            }
          />
          <DataRow
            label="Périodes définies"
            value={`${config.periods.length} périodes`}
          />
          <DataRow
            label="Pièces exigées à l’inscription"
            value={`${config.enrollment.requiredDocuments.length} documents`}
          />
          <DataRow label="Devise" value={config.profile.currency} />
        </dl>
      </Card>
    </div>
  );
}
