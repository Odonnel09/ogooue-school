import 'server-only';

import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { TenantMembership } from '@/types';

/**
 * RÉSOLUTION DE LA SESSION — CÔTÉ SERVEUR, ET NULLE PART AILLEURS.
 *
 * `server-only` en tête n'est pas décoratif : il fait échouer la compilation
 * si ce module est importé depuis un composant client. Les appartenances et
 * les permissions ne doivent jamais être calculées à partir de ce que le
 * navigateur affirme.
 *
 * Trois principes, tirés de `GEMINI.md` :
 *   · l'identité vient de `auth.getUser()`, vérifiée auprès de Supabase, et
 *     jamais de `getSession()` qui se contente de relire un cookie ;
 *   · le `tenant_id` de l'URL est une demande, jamais une autorisation ;
 *   · les permissions sont résolues ici et transmises à l'interface, qui ne
 *     fait que les afficher.
 */

export interface SessionContext {
  userId: string;
  email: string;
  /** Appartenances ouvertes, dans l'ordre alphabétique. */
  memberships: TenantMembership[];
  /** Appartenance correspondant au tenant demandé, `null` si aucune. */
  membership: TenantMembership | null;
  /** Permissions détenues dans cet établissement. */
  permissions: string[];
}

/**
 * Utilisateur authentifié, ou `null`.
 * `cache()` évite de réinterroger Supabase à chaque composant du même rendu.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Appartenances de l'utilisateur courant, lues depuis la base. */
export const getMemberships = cache(async (): Promise<TenantMembership[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('memberships')
    .select(
      `status,
       roles ( id, name ),
       tenants ( id, slug, name, short_name, city, type, logo )`,
    )
    .in('status', ['active', 'invitation']);

  if (error || !data) return [];

  return data
    .filter((row) => row.tenants && row.roles)
    .map((row) => {
      const tenant = row.tenants as unknown as {
        id: string;
        slug: string;
        name: string;
        short_name: string;
        city: string;
        type: string;
        logo: string;
      };
      const role = row.roles as unknown as { id: string; name: string };

      return {
        tenantId: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        shortName: tenant.short_name || tenant.name,
        city: tenant.city,
        type: tenant.type,
        logo: tenant.logo,
        roleId: role.id,
        roleName: role.name,
        status: row.status === 'active' ? 'active' : 'invitation',
      } satisfies TenantMembership;
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
});

/**
 * Contexte complet pour un établissement demandé.
 *
 * Renvoie `null` si aucune session : l'appelant redirige vers la connexion.
 * Renvoie un contexte avec `membership: null` si la session existe mais que
 * l'utilisateur n'appartient pas à l'établissement demandé — les deux cas
 * appellent des réponses différentes, on ne les confond pas.
 */
export async function getSessionContext(
  tenantSlug: string,
): Promise<SessionContext | null> {
  const user = await getUser();
  if (!user) return null;

  const memberships = await getMemberships();
  const membership =
    memberships.find(
      (item) => item.slug === tenantSlug && item.status === 'active',
    ) ?? null;

  let permissions: string[] = [];

  if (membership) {
    const supabase = await createClient();
    const { data } = await supabase.rpc('my_permissions', {
      p_tenant_id: membership.tenantId,
    });
    permissions = (data as string[] | null) ?? [];
  }

  return {
    userId: user.id,
    email: user.email ?? '',
    memberships,
    membership,
    permissions,
  };
}
