# Focused

A Lithuanian marketplace for used cameras and lenses, where users post their own ads.

## Why it exists

Lithuanians sell gear on skelbiu.lt and Vinted, general classifieds with two failures:
model names are written every possible way and search cannot bridge them, and ads omit
what buyers decide on. The fix is structured data — sellers pick a curated model from a
catalog instead of typing free text, and the ad form asks the questions that matter.
MPB is the north star. Being gear-only also opens a community angle later: forums, chats.

## Stage

Early test pilot, no business behind it yet. All data access runs through Next.js App
Router features — Server Components, Server Actions, Route Handlers. No standalone API
server, no client-side data layer.

## Scope

- Cameras, lenses and accessories.
- A hand-seeded catalog of common models, borrowed from MPB.
- Auth, sellers choosing private person or store. Stores get a storefront and a badge.
- Ad details: shutter count where applicable, separate cosmetic and functional
  condition, and a fixed checklist of what is included.

Out of scope: lens/body compatibility recommendations, Leica.

## Rules

- **Keep replies short and plain.** Answer first, in simple words. Skip exhaustive
  detail and long option surveys; give one recommendation.
- **Catch structural drift.** Aleksandras is mid-level fullstack and wants to be
  corrected. Before building anything structural — schema shape, layering, data flow,
  state ownership — check it against standard practice. If the request diverges, say so
  before writing code: name the convention, explain why it exists, then build whatever
  he decides. Example: "a jsonb column on users listing their listings" should get
  "listings belong in their own table with a foreign key, because…", not silent
  compliance.
- **No comments.** Code is self-commenting; put the meaning in names.
- **Check shadcn before building any UI component.** `pnpm shadcn add <name>`; only
  hand-roll what the registry lacks. shadcn's files in `src/components/ui/` and
  `src/lib/utils.ts` are vendored and excluded from Biome. Our own atomic components
  also go in `ui/`, named after the component, and are re-included in `biome.json`.
- Respect the layering in `@STRUCTURE.md`. Imports point inward only.
- Repositories return row shapes. Services map them to camelCase DTOs. Nothing above
  `src/services/` sees a snake_case column name.
- Never edit `src/db/types.ts` — it is generated.
- **Schema changes are migration files.** One file per change in `src/db/migrations/`,
  numbered in order (`0002_listing_views.mts`), written as raw SQL through Kysely's `sql`
  tag. Never edit a migration that has been applied; add a new one. Claude writes the
  file, Aleksandras runs `pnpm db:migrate` — locally and against production — then
  `pnpm db:codegen`, then Claude reads the schema. No ad-hoc `ALTER` in psql.
- Money is stored as EUR cents, never floats.
- Everything is English: routes, copy, identifiers, errors. Model names stay canonical
  ("X-T3"). Lithuanian comes later as i18n.
- Prefer invariants the database enforces over checks duplicated in application code.
- `pnpm lint` (Biome) must pass.
- Verify database work by reading the live database, not by assuming.

## Commands

- `pnpm dev` — Next dev server
- `pnpm lint` / `pnpm format` — Biome
- `pnpm db:up` / `pnpm db:down` — Postgres container, host port 5434
- `pnpm db:migrate` — apply pending migrations to the database in `DATABASE_URL`;
  prefix `DATABASE_URL=<production url>` to migrate production
- `pnpm db:codegen` — regenerate `src/db/types.ts` after any schema change
- `pnpm db:codegen:check` — fails if the generated types have drifted
- `pnpm db:seed` — load the gear catalog, idempotent
- `pnpm db:seed:cities` — load the city list, idempotent
- `pnpm db:reset` — drop the volume and start clean; follow with `pnpm db:migrate`
- `pnpm db:psql` — psql shell in the container

## Roadmap

No active plan; the next work is set per session. Settled choices live in
`DECISIONS.md`.

@STRUCTURE.md
@DECISIONS.md
@AGENTS.md
