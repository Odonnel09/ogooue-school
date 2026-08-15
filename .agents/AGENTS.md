<!-- BEGIN:ogooue-school-rules -->

# Ogooué School - Architectural & Security Rules

This is the central rulebook for Ogooué School. You MUST strictly follow these rules for every line of code you write.

## 1. Multi-Tenant Architecture & Isolation
- **Tenant ID is Absolute**: Every business table MUST have a `tenant_id` (`uuid NOT NULL REFERENCES tenants(id)`).
- **No Client Trust**: Never trust a `tenant_id` provided by the browser (URL slug, body, query param) for data access. The backend must ALWAYS resolve and verify the `tenant_id` server-side against the user's actual memberships.
- **RLS is Mandatory**: Supabase Row Level Security (RLS) MUST be enabled on ALL exposed tables. Policies must restrict access to `tenant_id IN (SELECT app.my_tenant_ids())`.
- **Tenant Slug**: The `tenantSlug` in the URL (e.g. `/[tenant]/...`) is only an *intention*. The server layout/middleware MUST validate it. Unknown slugs return `notFound()`, NOT 403 (to prevent tenant enumeration).

## 2. Server-Side Security & Middleware
- **Middleware is NOT for Authorization**: The Next.js `middleware.ts` is ONLY used to refresh the session and redirect unauthenticated users (CVE-2025-29927). It MUST NOT make authorization decisions.
- **Server Actions & Route Handlers**: EVERY Server Action and Route Handler MUST verify:
  1. User identity (Authentication)
  2. Tenant membership (Authorization/Isolation)
  3. Granular permissions (RBAC)
  4. Business invariants (e.g., Year is writable)
- **Secret Keys**: NEVER expose secret keys (e.g., Moneroo secrets, Atomic wallet keys) to the client.

## 3. RBAC (Role-Based Access Control)
- **Granular Permissions**: Do not check generic roles like `if (user.role === 'admin')`. Check granular permissions like `if (hasPerm('grades.validate'))`.
- **Server-Side Resolution**: Permissions are resolved server-side, never trusted from a static JWT claim that might be stale.

## 4. Educational Rules & Immutability
- **No Hardcoded Levels**: NEVER hardcode rules like `if (level === 'lycee')` in UI components. School rules (LMD, numeric weighted, competencies) are driven by the database configuration (`grading_systems.config`).
- **Results Immutability**: A published report card (`report_cards.snapshot`) is a frozen JSONB snapshot. Changing the grading configuration later MUST NOT alter past results.
- **Closed Years**: An archived academic year is read-only at the database level (`AND app.year_is_writable(academic_year_id)`).

## 5. Payments (Moneroo) & Financials
- **Webhook Source of Truth**: NEVER confirm a payment based on the frontend redirect. The frontend state is always "pending". Only a verified, signed webhook or a direct server-to-server check can mark a payment as `success`.
- **Idempotency**: Payment events must be idempotent at the database level `UNIQUE(provider, provider_event_id)`.
- **Monotone State Machine**: A payment state never moves backwards from `success`.

## 6. Frontend & Design
- **No Direct Supabase Client Data Mutation**: Prefer Server Actions with `defineAction()` wrapper for mutations to ensure validation and audit logging.
- **Design System**: Use the established Tailwind tokens (`--color-brand-*`). Components must be responsive, accessible, and handle loading/success/error/empty states natively.

<!-- END:ogooue-school-rules -->

