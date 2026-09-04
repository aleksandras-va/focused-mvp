# Bundles

Settled — see the Bundles sections of HANDOFF.md and DECISIONS.md: a listing is a
container with `listing_item` rows, per-item prices, and a discount label. This
document is the background reasoning, kept for context.

People sell gear together: a body with a lens, a body with three lenses, a body with a
cage. The catalog assumes one listing is one model, and that breaks in ways that hurt
both search and price data.

## Guardrails

**Do not make sellers jump through hoops.** Keep it simple, do not boss them around.
They can always go to Facebook and sell there instead.

**Search consistency is the main feature.** Someone searching "Helios 50mm" must find
the Zenit + Helios ad. If they do not, the product has failed at the one thing it is
for.

These two pull against each other. Every rule that improves search data is a hoop for
the seller. That tension is the whole problem.

## Problem 1 — the attic seller

A non-photographer finds an old Zenit in the attic. They upload it as a Zenit TTL,
which matches in the catalog list. The Helios lens is attached to the camera and never
gets mentioned.

Result: **a search for "Helios" returns zero matches**, even though one is listed.

They are not being lazy. They do not know the lens is a separate product with its own
name and value.

## Problem 2 — price dilution

**A body with an accessory.** Sony a6500 (€500) with a SmallRig cage (€80). Uploaded as
camera only at the combined price. Two failures: the recorded price for that camera
model is diluted, and the cage is not listed separately.

**A body with a set of lenses.** Sony a6500 (€500) with three lenses (€80, €400, €120),
uploaded as camera only at a total of €1100. Same dilution, and none of the three lenses
is discoverable — which is exactly the search benefit the catalog exists to provide.

Price dilution matters beyond a single ad: model price statistics are what let buyers
judge whether an ad is fair, and they are only as good as the per-model prices behind
them.

## Direction for problem 1

Do not ask the seller to classify the sale up front. Let them pick the model first, then
**suggest adding the lens as its own listing on the same page**, prefilled, with the
price split between the two.

The catalog decides whether the suggestion appears at all: an interchangeable-mount body
prompts for a lens, a fixed-lens camera (`mount_id is null` — X100V, GR III, X10) never
does. The seller classifies nothing.

## Unresolved

- **Splitting the price is a hoop.** The attic seller does not know a Helios from a
  Jupiter, let alone what either is worth. Asking them to divide €60 between body and
  lens may be harder than asking them to name the lens.
- **What happens when they decline the split?** If the lens is mentioned but not listed,
  it still needs to be discoverable. A structured reference from the listing to the
  Helios model would do it without a second listing, at the cost of having no price for
  the lens.
- **Accessories are not in the catalog.** The cage case cannot be modelled at all until
  they are. The inclusions checklist covers generic extras but has no price and no
  model.
- **Selling as a set.** Three lenses listed separately do not express "I want these gone
  together". Without a checkout this may be a description sentence rather than a
  feature.
