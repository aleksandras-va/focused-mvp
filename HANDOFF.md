# Implementation brief

Read this against the current code. Where the two disagree, or where you have questions
— and you should have several — raise them before writing anything.

Then produce a plan: short, human-readable steps in the order they should be done. The
next agent implements it step by step.

`CLAUDE.md` covers what this project is. Three things to stress:

- **Simplicity and speed.** The goal is an MVP that is live, not one that is elegant.
- **Always take the simpler approach until it hits a wall.** Next.js handles data access
  instead of a separate backend; images are converted in the browser instead of by a
  transformation service.
- **Catch structural drift, including in this document.** If something here diverges
  from standard practice, say so before building it.

## How the app works

Written by feature, not in implementation order.

### Accounts

MVP is basic auth. Google and Apple SSO come later.

Stores exist from the start. A store's ads are presented as store ads; the upload flow
is identical to a private seller's.

**Decision — stores get their own table.** Today `seller_type`, `store_name` and
`store_slug` live on `user` behind a check constraint. Move them to `stores` with a
unique `user_id`. Reasons: store attributes will keep growing (logo, description,
location, badge), nullable columns guarded by a constraint get worse with every one
added, and it leaves room for a store with several staff accounts later. Drop
`seller_type` entirely — the presence of a `stores` row is the answer, and one source of
truth cannot contradict itself.

User settings stay as typed columns. Schema changes here are a single SQL statement, so
a `jsonb` bag would trade constraints and generated types for a problem we do not have.

### Catalog

Cameras, lenses, film cameras and accessories.

**Film cameras are cameras with a flag**, not a separate category. Add `is_film` to
`camera_spec`, and extend `camera_body_type` with `slr` and `rangefinder`. The flag
drives the form: no shutter count, no memory card, no megapixels for film bodies.

**Accessories get catalog entries too** — extend `model_category` with `accessory`. No
spec table for MVP; brand, name and display name are enough for a cage or a battery
grip. Naming and taxonomy can be refined later.

### Upload

Click upload, land on the upload page.

**Images.** Drag and drop or click to select. Typical seller uploads a handful of ~5MB
phone photos; we must also handle camera files up to 50MB. Resize, compress and convert
to WebP in the browser, then send to R2. Cap the number of images and reject clearly
when someone selects 1000 files. The cap, cover-image choice, ordering and partial
failure handling are implementation-time calls.

**Fields adapt to what is being sold.** A lens has no third-party battery. A Zenit TTL
has no memory card. The catalog knows the category, so the form should never ask the
user to declare it.

**Contact.** Prefilled from the user's profile, editable per listing: email, phone,
socials. Add these columns to `user`. Reveal contact details on click rather than in
the page source, or the ads get scraped.

### Bundles

See `BUNDLES.md`. Settled approach:

When a seller adds a second item, tell them plainly that this will be listed as a
bundle. They set a bundle price, and **also a price per item** — the softest hoop we can
manage. In return they get something: list the body at €350 and the lens at €220, sell
the bundle at €500, and the ad carries a discount label.

Per-item prices are what keep model price statistics clean, which is the reason the hoop
is worth it. Each item can also be marked as not for sale separately.

Fixed-lens cameras never see the "are you selling a lens as well?" question — the
catalog knows from a null mount.

**Structural consequence, flag this before building.** Per-item prices mean a listing
becomes a container with line items. `listing_items` should hold `model_id`,
`price_cents`, cosmetic and functional condition, shutter count, `sold_separately` and
position. `listing` keeps the bundle price, description, photos, location, seller and
status. A single-item listing is simply one row. This moves condition and shutter count
off `listing`, where they are today.

On finish, show the user their ad and its status.

### Search

Much more prominent. No design yet — think a large dropdown over a dimmed page.

Below two characters, show suggested and recently viewed items rather than attempting a
match. From two characters on, prefix-match brands and models, then fall back to
similarity. Brands matter as much as models here: `so` should offer Sony itself, not
just guess at a Sony body.

### Browse and listing pages

- **Browse**: results grid with filters for category, brand, mount, price range and
  condition. Sort by newest and by price.
- **Listing detail**: photos, per-item breakdown for bundles, condition, what is
  included, seller and contact.
- **Store page**: a store's active listings, name and badge.

### Listing management

A seller needs a page for their own ads, and per ad: edit, mark as sold, delete.

Statuses are `draft`, `active`, `sold` and `removed`. Decide what each means in the UI —
in particular whether sold ads stay publicly visible. Keeping them visible is what makes
price history possible later, and it is what buyers use to judge whether an asking price
is fair.

Every list needs an empty state: no results, no listings yet, no photos.
