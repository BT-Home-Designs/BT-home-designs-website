# BT Home Designs — Approved Business Pricing Rules

This document records the currently **approved** BT Home Designs business
pricing rules as a reference, so they don't have to be re-pasted into future
prompts. It is a record of business decisions, not a description of what is
currently wired into application code — see the status note under each
section for where a rule stands relative to implementation.

All money is integer cents. All rates are basis points (bps); `10000` bps
= 100%.

---

## Customer pricing (general cash/card formula)

```
Total Internal Cost = Cost of Goods + Labor

Cash Price           = Total Internal Cost × 1.75      (7500 bps markup)
Credit Card Fee      = Cash Price × 0.06                (600 bps)
Credit Card Price    = Cash Price + Credit Card Fee
```

- **75% markup on cost** = `7500` basis points. `Cash Price = Total Internal
  Cost × 7500 / 10000`.
- **6% credit card fee** = `600` basis points. `Credit Card Fee = Cash Price
  × 600 / 10000`.
- `Total Internal Cost` is only meaningful once **both** Cost of Goods and
  Labor are known — this formula is not applied against a partial/unknown
  cost.

**Status**: approved formula, not yet implemented in application code (see
§ Roller / Neolux below for how it applies there).

## Plantation Shutters

- Customer selling price: **$17.25 per square foot**
- Arch: **$150 per panel**
- Door cutout: **$150 per cutout**

**Status**: implemented and ACTIVE (see `SquareFootPricingRule` /
`lib/quotes/shutterPricing.ts`).

## Accessories

| Item | Price |
|---|---|
| Acmeda rechargeable motorization | $175 |
| 5-channel remote | $75 |
| 15-channel remote | $95 |
| Solar charger | $110 |
| Hub | $200 |

**Status**: implemented and ACTIVE (`FixedPriceOption` catalog).

## Labor

| Item | Price |
|---|---|
| Base installation | $75 |
| Motorized installation add-on | $45 |
| Cordless installation add-on | $25 |
| Installer minimum trip fee | $125 for jobs under five shades |

**Installer minimum trip fee: REQUIRES BUSINESS-RULE CONFIRMATION.** It is
not yet defined whether the $125 minimum *replaces* the job's calculated
installation labor or *supplements* it (e.g. as a floor applied only when
calculated labor falls short). Do not apply this charge in any calculation
until that decision is confirmed.

**Status**: base/motorized/cordless add-ons implemented and ACTIVE; the
trip-minimum rule exists in the data model (`InstallationTripMinimumRule`)
but is seeded `PENDING_VERIFICATION` and is not applied to any quote.

## Roller Shade cordless upgrade

Approximately **$60 per shade**.

**Status**: `PENDING_VERIFICATION`. Do not apply automatically to any
quote until this amount is explicitly confirmed as final.

## Faux Wood

No generalized pricing rule has been approved (a single data point — one
35"×72" cordless faux wood example at ~$200 installed — is not sufficient
to derive a formula or table).

**Status**: `MANUAL / NOT_CONFIGURED`.

## Roller / Neolux customer selling price

Use the general cash/card pricing formula above (`Total Internal Cost ×
1.75`, plus the 6% credit card fee when applicable) **only** once a
complete `Total Internal Cost` (Cost of Goods + Labor) is available for
that line item.

**Never** use vendor retail automatically as the customer price, and never
derive customer price from dealer cost by any other automatic markup.

**Status**: automatic customer selling price remains `NOT_CONFIGURED` for
Roller Shade / Neolux line items. Manual override remains allowed.

---

*This file documents approved business rules. It does not itself change,
activate, or wire any pricing calculation — see the "Status" note under
each section for what is actually implemented today.*
