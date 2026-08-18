'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from './schemas';
import { authMessages as m } from './messages';

/**
 * ACTIONS D'AUTHENTIFICATION.
 *
 * Tout se passe ici, sur le serveur. Le navigateur envoie un formulaire et
 * reçoit un message ; il ne manipule jamais de jeton, ne pose jamais de
 * cookie, et n'apprend rien qu'il ne doive savoir.
 *
 * Deux règles tenues sans exception :
 *
 *   1. **Aucune énumération de comptes.** L'échec de connexion et la demande
 *      de réinitialisation renvoient toujours le même message, que l'adresse
 *      existe ou non. Distinguer les deux cas livrerait la liste des comptes.
 *
 *   2. **Aucun détail d'erreur du fournisseur n'est relayé.** Les messages de
 *      Supabase peuvent révéler l'état d'un compte ; on les journalise côté
 *      serveur et on répond en termes neutres.
 */

export interface ActionState {
  error?: string;
  success?: string;
}

/** Origine réelle de la requête, pour construire les liens des courriels. */
async function origin(): Promise<string> {
  const list = await headers();
  const forwarded = list.get('x-forwarded-host');
  const host = forwarded ?? list.get('host') ?? 'localhost:3000';
  const protocol = list.get('x-forwarded-proto') ?? 'http';
  return `${protocol}://${host}`;
}

/* -------------------------------------------------------------------------- */
/* Connexion                                                                   */
/* -------------------------------------------------------------------------- */

export async function signIn(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    rememberMe: formData.get('rememberMe') === 'on',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? m.login.failed };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Le détail reste au serveur : le client ne reçoit qu'un refus générique.
    console.error('[auth] échec de connexion', error.message);
    return { error: m.login.failed };
  }

  revalidatePath('/', 'layout');
  redirect('/select-tenant');
}

/* -------------------------------------------------------------------------- */
/* Déconnexion                                                                 */
/* -------------------------------------------------------------------------- */

export async function signOut(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

/* -------------------------------------------------------------------------- */
/* Mot de passe oublié                                                         */
/* -------------------------------------------------------------------------- */

export async function requestPasswordReset(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: String(formData.get('email') ?? ''),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${await origin()}/auth/callback?next=/reset-password` },
  );

  // La réponse est la même dans tous les cas : compte existant, inexistant,
  // ou envoi en échec. Seul le serveur sait ce qui s'est réellement passé.
  if (error) console.error('[auth] envoi du lien', error.message);

  return { success: m.forgot.sentMessage };
}

/* -------------------------------------------------------------------------- */
/* Nouveau mot de passe                                                        */
/* -------------------------------------------------------------------------- */

export async function updatePassword(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: String(formData.get('password') ?? ''),
    confirmation: String(formData.get('confirmation') ?? ''),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();

  // Le jeton a déjà été échangé contre une session par `/auth/callback` :
  // sans session, le lien n'était pas valable et rien ne doit être modifié.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: m.reset.invalidMessage };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    console.error('[auth] changement de mot de passe', error.message);
    return { error: m.reset.updateFailed };
  }

  revalidatePath('/', 'layout');
  return { success: m.reset.doneMessage };
}

/* -------------------------------------------------------------------------- */
/* Invitations                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Accepte une invitation existante.
 *
 * L'écriture est autorisée par la politique « chacun répond à sa propre
 * invitation », qui restreint la mise à jour à `auth.uid()`. Un utilisateur ne
 * peut donc pas accepter l'invitation d'un autre, même en forgeant le
 * `tenantId` : la base refuserait la ligne.
 */
export async function acceptInvitation(formData: FormData): Promise<void> {
  const tenantId = String(formData.get('tenantId') ?? '');
  const slug = String(formData.get('slug') ?? '');
  if (!tenantId) redirect('/select-tenant');

  const supabase = await createClient();
  const { error } = await supabase
    .from('memberships')
    .update({ status: 'active', accepted_at: new Date().toISOString() })
    .eq('tenant_id', tenantId);

  if (error) {
    console.error('[auth] acceptation d’invitation', error.message);
    redirect('/select-tenant');
  }

  revalidatePath('/', 'layout');
  redirect(slug ? `/${slug}/dashboard` : '/select-tenant');
}

/** Décline une invitation : le rattachement est retiré. */
export async function declineInvitation(formData: FormData): Promise<void> {
  const tenantId = String(formData.get('tenantId') ?? '');
  if (!tenantId) redirect('/select-tenant');

  const supabase = await createClient();
  const { error } = await supabase
    .from('memberships')
    .delete()
    .eq('tenant_id', tenantId);

  if (error) console.error('[auth] refus d’invitation', error.message);

  revalidatePath('/', 'layout');
  redirect('/select-tenant');
}
