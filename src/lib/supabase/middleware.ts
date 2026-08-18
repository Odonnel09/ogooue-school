import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './database.types';

/**
 * RAFRAÎCHISSEMENT DE SESSION ET PROTECTION DES ROUTES.
 *
 * Deux rôles, dans cet ordre :
 *
 *   1. Renouveler la session à chaque requête. Sans cela, les composants
 *      serveur travailleraient sur un jeton périmé et l'utilisateur serait
 *      déconnecté sans raison apparente.
 *
 *   2. Refuser l'entrée. Un visiteur sans session n'atteint aucune page de
 *      l'espace établissement — la redirection se produit **avant** le rendu,
 *      donc avant qu'aucune donnée ne soit lue.
 *
 * ⚠️ Ce middleware n'est pas la sécurité : il évite un aller-retour inutile.
 * La sécurité tient aux politiques RLS, qui s'appliqueraient même si ce
 * fichier disparaissait. C'est ce que `GEMINI.md` appelle ne jamais faire du
 * frontend la seule couche de protection.
 */

/** Chemins accessibles sans session. */
const PUBLICS = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/accept-invite',
  '/auth',
];

function estPublic(pathname: string): boolean {
  return PUBLICS.some(
    (chemin) => pathname === chemin || pathname.startsWith(`${chemin}/`),
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sans configuration, on laisse passer : c'est un défaut d'installation,
  // pas une tentative d'intrusion. Les politiques RLS restent en place.
  if (!url || !key) return supabaseResponse;

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  /**
   * `getUser()` et non `getSession()` : le premier vérifie le jeton auprès de
   * Supabase, le second se contente de relire un cookie que n'importe qui
   * pourrait avoir fabriqué.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, searchParams } = request.nextUrl;

  if (!user && !estPublic(pathname)) {
    const login = request.nextUrl.clone();
    login.pathname = '/login';
    login.search = '';
    // On mémorise la destination pour y revenir après connexion.
    if (pathname !== '/') login.searchParams.set('suite', pathname);
    return NextResponse.redirect(login);
  }

  // Déjà connecté : les écrans d'entrée n'ont plus lieu d'être, sauf ceux qui
  // exigent précisément une session fraîche (changement de mot de passe).
  if (user && (pathname === '/login' || pathname === '/forgot-password')) {
    const suite = searchParams.get('suite');
    const cible = request.nextUrl.clone();
    cible.pathname = suite && suite.startsWith('/') ? suite : '/select-tenant';
    cible.search = '';
    return NextResponse.redirect(cible);
  }

  return supabaseResponse;
}
