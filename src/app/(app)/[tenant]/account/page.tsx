'use client';

import { Building2, ShieldCheck, UserCircle } from 'lucide-react';
import { CURRENT_USER } from '@/data/academic';
import { useSchoolData } from '@/lib/store/school-data';
import { useTenant } from '@/lib/hooks';
import {
  Avatar,
  Badge,
  Card,
  DataRow,
  PageContainer,
  PageHeader,
} from '@/components/ui';

/**
 * Fiche du compte administrateur et de l'établissement.
 * Les informations proviennent des données locales : l'authentification réelle
 * et l'édition du profil seront branchées avec Supabase.
 */
export default function AccountPage() {
  const tenant = useTenant();
  const { config } = useSchoolData();
  const SCHOOL_PROFILE = config.profile;

  return (
    <PageContainer>
      <PageHeader
        title="Compte"
        description="Informations du compte connecté et de l’établissement géré."
      />

      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <Avatar name={CURRENT_USER.fullName} size="xl" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {CURRENT_USER.fullName}
              </h1>
              <Badge tone="brand" dot>
                {CURRENT_USER.role}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {SCHOOL_PROFILE.name} — {SCHOOL_PROFILE.city}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <UserCircle size={20} />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Profil utilisateur
            </h2>
          </div>
          <dl>
            <DataRow label="Nom complet" value={CURRENT_USER.fullName} />
            <DataRow label="Rôle" value={CURRENT_USER.role} />
            <DataRow label="Établissement" value={SCHOOL_PROFILE.name} />
            <DataRow label="Identifiant d’espace" value={tenant} />
          </dl>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
              <Building2 size={20} />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Établissement
            </h2>
          </div>
          <dl>
            <DataRow label="Nom" value={SCHOOL_PROFILE.name} />
            <DataRow label="Directeur" value={SCHOOL_PROFILE.director} />
            <DataRow
              label="Ville"
              value={`${SCHOOL_PROFILE.city}, ${SCHOOL_PROFILE.country}`}
            />
            <DataRow label="Email" value={SCHOOL_PROFILE.email} />
            <DataRow label="Téléphone" value={SCHOOL_PROFILE.phone} />
          </dl>
        </Card>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Authentification et rôles
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              À cette étape, les données affichées sont fictives et l’espace n’est
              pas protégé. La connexion, la vérification d’appartenance à
              l’établissement et les permissions granulaires seront activées avec
              Supabase.
            </p>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
