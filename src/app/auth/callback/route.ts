import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * ÉCHANGE D'UN LIEN D'AUTHENTIFICATION CONTRE UNE SESSION.
 *
 * Point d'arrivée de tout ce que Supabase envoie par courriel — lien de
 * réinitialisation, confirmation d'adresse, invitation — et, plus tard, du
 * retour d'un fournisseur externe comme Google.
 *
 * Pourquoi ici et pas dans une page : l'échange pose des cookies de session,
 * ce qu'un composant client ne doit jamais faire. Le code arrive dans l'URL,
 * il est consommé côté serveur, et il n'atteint jamais le navigateur sous une
 * forme réutilisable.
 *
 * `next` est validé avant redirection : accepter une destination arbitraire
 * transformerait ce point d'entrée en tremplin de redirection ouverte.
 */

/** Seules des destinations internes, sans double barre oblique initiale. */
function safeNext(raw: string | null): string {
  if (!raw) return '/select-tenant';
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/select-tenant';
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?erreur=lien_invalide`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth] échange du code', error.message);
    return NextResponse.redirect(`${origin}/login?erreur=lien_expire`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
