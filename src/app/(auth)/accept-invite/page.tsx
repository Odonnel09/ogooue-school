'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, CheckCircle2, Info, MailX, UserPlus, X } from 'lucide-react';
import { MEMBERSHIPS } from '@/data/memberships';
import { ROLES } from '@/data/roles';
import { permissionLabels } from '@/i18n/fr';
import { Badge, Button, Card } from '@/components/ui';
import { authMessages as m } from '@/features/auth/messages';
import { AuthCardSkeleton } from '@/features/auth/components/AuthCardSkeleton';

/**
 * Acceptation d'une invitation.
 *
 * Ce que l'écran montre avant la décision : l'établissement, le rôle proposé,
 * et **ce que ce rôle permet réellement**. Accepter une invitation revient à
 * accorder des droits sur des données d'élèves ; les énumérer avant, plutôt
 * qu'après, est le minimum.
 *
 * L'acceptation est une **écriture serveur** : elle crée un rattachement dans
 * `memberships`. C'est pourquoi la maquette s'arrête à la confirmation et
 * n'ouvre pas l'accès elle-même — le faire depuis le navigateur reviendrait à
 * laisser le client s'octroyer une appartenance.
 *
 * REMPLACEMENT SUPABASE : Server Action vérifiant le jeton d'invitation, puis
 * insertion dans `memberships`, avec journalisation de l'opération.
 */
type Decision = 'pending' | 'accepted' | 'declined';

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('etablissement') ?? '';

  const [decision, setDecision] = useState<Decision>('pending');

  const membership = MEMBERSHIPS.find((item) => item.slug === slug);
  const role = ROLES.find((item) => item.id === membership?.roleId);

  /* ------------------------------------------------ Invitation inconnue */
  if (!membership) {
    return (
      <Card className="p-6 sm:p-8">
        <span className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-5">
          <MailX size={24} aria-hidden="true" />
        </span>
        <h1 className="text-xl font-bold text-slate-900">
          {m.invite.unknownTitle}
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {m.invite.unknownMessage}
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            Aller à la connexion
          </Link>
        </div>
      </Card>
    );
  }

  /* ------------------------------------------------------ Après décision */
  if (decision !== 'pending') {
    const accepted = decision === 'accepted';

    return (
      <Card className="p-6 sm:p-8">
        <span
          className={
            accepted
              ? 'w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-5'
              : 'w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-5'
          }
        >
          {accepted ? (
            <CheckCircle2 size={24} aria-hidden="true" />
          ) : (
            <X size={24} aria-hidden="true" />
          )}
        </span>

        <h1 className="text-xl font-bold text-slate-900">
          {accepted ? m.invite.acceptedTitle : m.invite.declinedTitle}
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {accepted
            ? m.invite.acceptedMessage(membership.name)
            : m.invite.declinedMessage}
        </p>

        <div className="mt-6">
          <Link
            href="/select-tenant"
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            Voir mes établissements
          </Link>
        </div>
      </Card>
    );
  }

  /* --------------------------------------------------------- Invitation */
  return (
    <Card className="p-6 sm:p-8">
      <span className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
        <UserPlus size={24} aria-hidden="true" />
      </span>

      <h1 className="text-xl font-bold text-slate-900">{m.invite.title}</h1>
      <p className="text-sm text-slate-500 mt-1">{m.invite.description}</p>

      <dl className="mt-6 space-y-4">
        <div>
          <dt className="text-xs text-slate-400">{m.invite.establishment}</dt>
          <dd className="flex items-center gap-3 mt-1.5">
            <span
              aria-hidden="true"
              className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-xl shrink-0"
            >
              {membership.logo}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-900">
                {membership.name}
              </span>
              <span className="block text-xs text-slate-500">
                {membership.city} · {membership.type}
              </span>
            </span>
          </dd>
        </div>

        <div>
          <dt className="text-xs text-slate-400">{m.invite.role}</dt>
          <dd className="mt-1.5">
            <Badge tone="brand">{role?.name ?? 'Rôle inconnu'}</Badge>
            {role && (
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {role.description}
              </p>
            )}
          </dd>
        </div>
      </dl>

      {role && role.permissions.length > 0 && (
        <div className="mt-5 pt-5 border-t border-slate-100">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
            {m.invite.permissionsTitle}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            {role.permissions.map((permission) => (
              <li
                key={permission}
                className="flex items-start gap-2 text-xs text-slate-600"
              >
                <Check
                  size={13}
                  aria-hidden="true"
                  className="text-green-600 mt-0.5 shrink-0"
                />
                {permissionLabels[permission]}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2">
        <Button
          variant="outline"
          onClick={() => setDecision('declined')}
          className="sm:flex-1 justify-center"
        >
          {m.invite.decline}
        </Button>
        <Button
          onClick={() => setDecision('accepted')}
          className="sm:flex-1 justify-center"
        >
          <Check size={16} aria-hidden="true" /> {m.invite.accept}
        </Button>
      </div>

      <p className="mt-6 pt-5 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
        <Info size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
        {m.invite.serverNotice}
      </p>
    </Card>
  );
}

/**
 * La lecture des paramètres d'adresse n'a lieu qu'à la requête : la frontière
 * Suspense est ce qui permet à Next de prérendre la page malgré tout.
 */
export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <AcceptInviteContent />
    </Suspense>
  );
}
