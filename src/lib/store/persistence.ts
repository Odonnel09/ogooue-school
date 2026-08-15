import { DEFAULT_TENANT_CONFIG, type TenantConfig } from '@/data/tenant-config';

/**
 * Persistance locale de la configuration d'établissement.
 *
 * Sans elle, désactiver un cycle depuis Paramètres serait annulé au moindre
 * rechargement — la démonstration en deviendrait pénible.
 *
 * REMPLACEMENT SUPABASE : `tenants.settings`, écrit par une Server Action
 * auditée. Cette couche disparaîtra entièrement.
 */
const STORAGE_KEY = 'ogooue-school:tenant-config:v1';

export function loadStoredConfig(): TenantConfig | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<TenantConfig>;

    // Fusion tolérante : une configuration enregistrée par une version
    // antérieure ne doit pas casser l'application.
    return {
      ...DEFAULT_TENANT_CONFIG,
      ...parsed,
      profile: { ...DEFAULT_TENANT_CONFIG.profile, ...parsed.profile },
      gradingSystems: {
        ...DEFAULT_TENANT_CONFIG.gradingSystems,
        ...parsed.gradingSystems,
      },
      enrollment: {
        ...DEFAULT_TENANT_CONFIG.enrollment,
        ...parsed.enrollment,
      },
      templates: {
        ...DEFAULT_TENANT_CONFIG.templates,
        ...parsed.templates,
      },
      signature: {
        ...DEFAULT_TENANT_CONFIG.signature,
        ...parsed.signature,
      },
    };
  } catch {
    return null;
  }
}

export function storeConfig(config: TenantConfig): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Quota dépassé ou stockage désactivé : la configuration reste en mémoire.
  }
}

export function clearStoredConfig(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sans effet si le stockage est indisponible.
  }
}
