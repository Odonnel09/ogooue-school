'use client';

import { Check, Info, Minus } from 'lucide-react';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { ROLES } from '@/data/roles';
import { permissionLabels } from '@/i18n/fr';
import { useSession } from '@/lib/auth/session';
import {
  Badge,
  Card,
  TD,
  TH,
  THead,
  TRow,
  Table,
  TableWrapper,
} from '@/components/ui';
import { settingsMessages as m } from '../messages';
import { SettingsSection } from './SettingsSection';

export function RolesSection() {
  const { membership } = useSession();

  return (
    <SettingsSection title={m.roles.title} description={m.roles.description}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {ROLES.map((role) => (
          <Card key={role.id} className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">{role.name}</h2>
              {role.id === membership.roleId && (
                <Badge tone="brand" dot>
                  Actif
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {role.description}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <Badge tone={role.isSystem ? 'slate' : 'blue'}>
                {role.isSystem ? m.roles.systemRole : m.roles.customRole}
              </Badge>
              <Badge tone="green">
                {m.roles.permissionCount(role.permissions.length)}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 sm:p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">
          {m.roles.matrixTitle}
        </h2>

        <TableWrapper>
          <Table>
            <THead>
              <tr>
                <TH scope="col">Permission</TH>
                {ROLES.map((role) => (
                  <TH key={role.id} scope="col" className="text-center">
                    {role.name}
                  </TH>
                ))}
              </tr>
            </THead>
            <tbody>
              {PERMISSIONS.map((permission) => (
                <TRow key={permission}>
                  <TD>
                    <span className="text-slate-900">
                      {permissionLabels[permission]}
                    </span>
                    <span className="block text-[11px] text-slate-400 font-mono">
                      {permission}
                    </span>
                  </TD>
                  {ROLES.map((role) => {
                    const granted = role.permissions.includes(permission);
                    return (
                      <TD key={role.id} className="text-center">
                        <span
                          className={
                            granted
                              ? 'inline-flex text-green-600'
                              : 'inline-flex text-slate-300'
                          }
                          aria-label={
                            granted
                              ? `${role.name} : accordée`
                              : `${role.name} : refusée`
                          }
                        >
                          {granted ? (
                            <Check size={16} aria-hidden="true" />
                          ) : (
                            <Minus size={16} aria-hidden="true" />
                          )}
                        </span>
                      </TD>
                    );
                  })}
                </TRow>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      </Card>

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
        <Info size={18} className="text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-xs text-slate-600 leading-relaxed">{m.roles.note}</p>
      </div>
    </SettingsSection>
  );
}
