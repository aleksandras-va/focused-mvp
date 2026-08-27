# Focused

A Lithuanian marketplace for used cameras and lenses, where users post their own ads.

## Why it exists

Lithuanians buy and sell used gear on skelbiu.lt (and Vinted, usually pricier). Both are
general classifieds, and that creates two problems this project exists to fix:

1. **Naming is chaos.** One seller writes "Fuji XT3", another "Fujifilm X-T3". Every
   permutation is a different string, and fuzzy search on both sites is poor, so buyers
   cannot find gear that is listed right in front of them.
2. **Ads under-describe.** A few low-quality photos, no shutter count, no mention of
   whether the battery is OEM.

The fix is structured data, not features: sellers pick a canonical model from a catalog
instead of typing free text, and the ad form asks for the details buyers decide on.
MPB is the north star; there is no dedicated camera marketplace here today.

## Stage

Early test pilot. No business behind it yet, no separate backend. All data access runs
through Next.js App Router features — Server Components, Server Actions, Route Handlers.
Do not introduce a standalone API server or a client-side data layer.

## Scope

In scope for MVP:

- Cameras and lenses only.
- A hand-seeded catalog of common models, borrowed from MPB. AI-generated catalog
  entries from user input come later.
- Auth, with sellers choosing private person or store. Stores get a basic storefront
  and a badge.
- Ad details: shutter count where applicable, separate cosmetic and functional
  condition, and a fixed checklist of what is included (box, charger, OEM battery,
  body cap, strap, and so on).

Out of scope for now: accessories, lens/body compatibility recommendations, Leica.

## Rules

- **No comments.** Code is self-commenting; put the meaning in names.
- **Check shadcn before building any UI component.** Install it with
  `pnpm shadcn add <name>`; only hand-roll what the registry does not have.
  `src/components/ui/` and `src/lib/utils.ts` are vendored and excluded from Biome.
- Respect the layering in `@STRUCTURE.md`. Imports point inward only.
- Repositories return database row shapes. Services map them to camelCase DTOs.
  Nothing above `src/services/` sees a snake_case column name.
- Never edit `src/db/types.ts` — it is generated.
- **No migrations.** Do not write migration files or run schema changes. Hand the
  schema change over as plain SQL for Aleksandras to run, then regenerate types with
  `pnpm db:codegen` and verify by inspecting the live schema.
- Money is stored as EUR cents, never floats.
- Everything in the codebase is English: routes, UI copy, identifiers, error messages.
  Model names stay canonical ("X-T3"). Lithuanian localisation comes later, as i18n.
- Prefer invariants the database enforces — constraints, generated columns — over
  checks duplicated in application code.
- `pnpm lint` (Biome) must pass.
- Verify database work by inspecting the live database (`pnpm db:psql`, read queries),
  not by assuming the SQL did what it said.

## Commands

- `pnpm dev` — Next dev server
- `pnpm lint` / `pnpm format` — Biome
- `pnpm db:up` / `pnpm db:down` — Postgres container, host port 5434
- `pnpm db:codegen` after any schema change — regenerates `src/db/types.ts`
- `pnpm db:seed` — load the gear catalog, idempotent
- `pnpm db:reset` — drop the volume and start clean
- `pnpm db:codegen:check` — fails if `src/db/types.ts` has drifted from the database
- `pnpm db:psql` — psql shell in the container

## Roadmap

1. Catalog — done.
2. Auth — placeholder in place (`/login`, no passwords, DB-backed sessions).
   Swap for a real provider before traffic.
3. Listings schema and the ad creation flow.
4. Photo uploads. Built against the plain S3 API with MinIO locally, so the provider
   (Cloudflare R2, Railway, other) stays a deploy-time credential choice.
5. UI: browse, search, listing page, storefront.

@STRUCTURE.md
@AGENTS.md
