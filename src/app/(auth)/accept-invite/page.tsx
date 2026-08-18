import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Check, Info, MailX, UserPlus } from 'lucide-react';
import { getMemberships, getUser } from '@/lib/auth/server';
import { acceptInvitation, declineInvitation } from '@/features/auth/actions';
import { Badge, Button, Card } from '@/components/ui';
import { authMessages as m } from '@/features/auth/messages';

/**
 * Acceptation d'une invitation.
 *
 * L'invitation **existe déjà en base** : un administrateur a créé la ligne
 * `memberships` au statut « invitation ». Cette page ne la crée pas, elle la
 * confirme — et seule la personne invitée peut le faire, puisque la politique
 * RLS « chacun répond à sa propre invitation » restreint la mise à jour à
 * `auth.uid()`.
 *
 * Composant serveur : la décision d'afficher ou non repose sur ce que la base
 * accorde, jamais sur un paramètre d'adresse.
 */
export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ etablissement?: string }>;
}) {
  const { etablissement } = await searchParams;

  const user = await getUser();
  if (!user) {
    redirect(
      `/login?suite=/accept-invite${etablissement ? `?etablissement=${etablissement}` : ''}`,
    );
  }

  const memberships = await getMemberships();
  const invitation = memberships.find(
    (item) => item.slug === etablissement && item.status === 'invitation',
  );

  if (!invitation) {
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
            href="/select-tenant"
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            Voir mes établissements
          </Link>
        </div>
      </Card>
    );
  }

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
              {invitation.logo}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-900">
                {invitation.name}
              </span>
              <span className="block text-xs text-slate-500">
                {invitation.city} · {invitation.type}
              </span>
            </span>
          </dd>
        </div>

        <div>
          <dt className="text-xs text-slate-400">{m.invite.role}</dt>
          <dd className="mt-1.5">
            <Badge tone="brand">{invitation.roleName}</Badge>
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2">
        <form action={declineInvitation} className="sm:flex-1">
          <input type="hidden" name="tenantId" value={invitation.tenantId} />
          <Button
            type="submit"
            variant="outline"
            className="w-full justify-center"
          >
            {m.invite.decline}
          </Button>
        </form>

        <form action={acceptInvitation} className="sm:flex-1">
          <input type="hidden" name="tenantId" value={invitation.tenantId} />
          <input type="hidden" name="slug" value={invitation.slug} />
          <Button type="submit" className="w-full justify-center">
            <Check size={16} aria-hidden="true" /> {m.invite.accept}
          </Button>
        </form>
      </div>

      <p className="mt-6 pt-5 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
        <Info size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
        {m.invite.serverNotice}
      </p>
    </Card>
  );
}
