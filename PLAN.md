# Plan

Ordered implementation steps for HANDOFF.md. Settled choices behind them are in
DECISIONS.md — read both first. Schema changes follow the no-migrations rule:
additive SQL is run directly, destructive scripts are handed to Aleksandras.
After every schema change: `pnpm db:codegen`, then verify by reading the live
database. New tables are singular, like the rest of the schema.

## 1. Schema — stores - done

Create `store`: `id`, `user_id` (unique, FK), `name`, `slug` (unique),
timestamps. Copy existing store users in, then drop `seller_type`,
`store_name`, `store_slug` from `user`. Destructive — hand the SQL over.
Update signup and any code reading `seller_type`: choosing "store" at signup
now creates a `store` row.

## 2. Schema — catalog extensions - done

Additive, run directly: `camera_spec.is_film boolean not null default false`;
add `slr` and `rangefinder` to `camera_body_type`; add `accessory` to
`model_category`. Accessories get no spec table — brand and name are enough.
Extend the seed with a few film bodies and accessories so step 6 can be
exercised.

## 3. Schema — listings become containers - done

Create `listing_item`: `id`, `listing_id` (FK), `model_id` (FK),
`price_cents`, `cosmetic_condition`, `functional_condition`, `shutter_count`
(nullable), `sold_separately` (default true), `position`; unique
`(listing_id, position)`. Move each existing listing's fields into one item
row, re-key `listing_inclusion` to `listing_item_id`, then drop `model_id`,
both conditions and `shutter_count` from `listing`. Destructive — hand over.

`listing.price_cents` stays and is always the ad's asking price; for a
single-item ad it equals the item's price (service keeps them in sync).

## 4. Schema — contact and photos - done

Additive: `user.phone`; `listing.contact_email`, `listing.contact_phone`;
`listing_photo` (`id`, `listing_id`, `storage_key`, `position`). Contact is
shown plainly on the page for MVP; socials come later.

## 5. Auth — email and password - done

Add `user.password_hash`. Replace the placeholder flow with real signup
(email, password, display name, optional store) and login. Hash with bcrypt.
Keep the DB-backed sessions exactly as they are. An unknown email no longer
creates an account silently. Existing test users: delete or reseed.

## 6. Sell flow rework - done

Update the listing repository, listing service and the sell form for the new
schema:

- Per-item fields driven by the catalog: shutter count only for non-film
  cameras; lenses and accessories never see camera questions.
- "Add another item" turns the ad into a bundle: say so plainly, ask a bundle
  price plus a price per item, allow marking items not sold separately.
  Fixed-lens models (null mount) never prompt for a lens.
- Inclusions checklist per item.
- Contact prefilled from the profile, editable per listing.
- On submit, show the seller their ad and its status.

## 7. Photos - done

Browser-side resize/compress to WebP, two sizes (2560px and 800px long edge),
cap the count (~12) with a clear rejection above it. Presigned PUT to R2 from
a route handler; store only `storage_key`. First photo is the cover. Blocked
on R2 credentials — build behind env vars and degrade gracefully in dev.

## 8. Search overlay - done

Prominent search over a dimmed page. Under two characters: suggested and
recently viewed models. From two: prefix-match brands and models, fall back to
the existing `word_similarity` search. A brand hit links to browse filtered by
that brand.

## 9. Browse - done

Replace the placeholder home grid with real listings. Filters: category,
brand, mount, price range, condition. Sort: newest, price. Only `active`
listings appear publicly — `sold` and `removed` stay in the database but never
render.

## 10. Listing detail

Photos, per-item breakdown with per-item prices, a discount label when the
bundle price is below the sum of item prices, inclusions, condition, seller
with store badge, contact.

## 11. Store page

`/store/[slug]`: name, badge, active listings.

## 12. My listings

A seller's own ads across all statuses, with edit, mark as sold, and delete
(sets `removed`). Every list in steps 8–12 needs an empty state.
