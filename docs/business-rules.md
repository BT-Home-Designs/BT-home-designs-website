# BT Home Designs — Approved Business Pricing Rules

Currently approved BT Home Designs business pricing rules. All money is
integer cents; all rates are basis points (bps) — `10000` bps = 100%.

**Classification convention (confirmed Phase 7):** every dollar figure
below is either an INTERNAL COST-OF-GOODS input, an INTERNAL LABOR COST
input, or a customer-facing PRICE. Only the standard cash/credit-card
formula in "Customer Pricing" below ever produces a customer-facing price.
No per-item rate (shutter rate, arch/cutout, accessories, labor) is ever
shown to or charged to a customer directly.

---

## Customer Pricing (the only source of a customer-facing price)

```
Total Internal Cost = Cost of Goods (COGS) + Labor

Cash Price        = Total Internal Cost × 1.75
Credit Card Fee   = Cash Price × 6%
Credit Card Price = Cash Price + Credit Card Fee
```

- Cash Price is a **75% markup on cost** = `7500` basis points.
  `Cash Price = Total Internal Cost × 7500 / 10000`.
- Credit Card Fee = **6%** = `600` basis points.
  `Credit Card Fee = Cash Price × 600 / 10000`.
- `Total Internal Cost` requires both COGS and Labor — never applied
  against a partial/unknown cost; incomplete inputs return
  NOT_CONFIGURED / MANUAL REQUIRED, never a $0 substitute.
- Every component (COGS, Labor, Total Internal Cost, Markup Amount, Cash
  Price, Credit Card Fee, Credit Card Price) is preserved separately and
  snapshotted with the rule/rate applied at calculation time — a later
  rate change never recalculates a historical quote.

## Plantation Shutters — INTERNAL COST OF GOODS

**$17.25 per square foot is an INTERNAL COST input, not a customer
selling price.**

```
Internal COGS base = square footage × $17.25
```

Then add any approved internal cost add-ons (arch/cutout, below). The
resulting COGS total feeds into the standard Customer Pricing formula
above like any other product's Cost of Goods — it is never itself shown
or charged to a customer.

## Shutter Add-Ons — INTERNAL COST OF GOODS

- Arch: **$150 per panel**
- Door cutout: **$150 per cutout**

Treated as internal cost-of-goods inputs added to the shutter COGS base
above — never a customer-facing add-on charge by themselves.

## Accessories — INTERNAL COST OF GOODS

| Item | Cost |
|---|---|
| Acmeda rechargeable motorization | $175 |
| 5-channel remote | $75 |
| 15-channel remote | $95 |
| Solar charger | $110 |
| Hub | $200 |

These are internal cost-of-goods inputs, never customer-facing selling
prices by themselves. They flow into internal COGS first, then through
the standard Customer Pricing formula above.

## Labor — INTERNAL LABOR COST

| Item | Cost |
|---|---|
| Base installation | $75 |
| Motorized installation add-on | $45 |
| Cordless installation add-on | $25 |
| Installer minimum trip fee | $125 for jobs under five shades |

These are internal labor-cost inputs, feeding the `Labor` term of the
Customer Pricing formula above.

**Installer minimum trip fee — CONFIRMED (Phase 7): ADDITIVE.** For a job
under five shades, the $125 minimum is added ON TOP OF the job's normally
calculated labor — never a replacement, never `max(normal labor, $125)`.

```
Total Labor (qualifying job) = normal labor calculation + $125
```

The $125 is included in Total Internal Cost before markup, i.e. it flows
through the same `× 1.75` / `× 6%` formula as every other cost, exactly
like the rest of Labor above.

## Pricing Flow (any fully configured automatic product)

```
COGS + Labor                = Total Internal Cost
Total Internal Cost × 1.75  = Cash Price
Cash Price × 6%              = Credit Card Fee
Cash Price + Credit Card Fee = Credit Card Price
```

Applies uniformly to Roller Shade / Neolux (COGS = matrix dealer cost +
accessories) and Plantation Shutter (COGS = square-foot base + arch/
cutout + accessories) alike.

## Roller Shade Cordless Upgrade

Approximately **$60 per shade**.

Status: `PENDING_VERIFICATION`. Do not apply automatically.

## Faux Wood

No generalized pricing rule approved.

Status: `MANUAL / NOT_CONFIGURED`.

## Roller / Neolux Customer Selling Price

Use the general BT Home Designs cash/card pricing formula only when
complete COGS + Labor is available.

Never use vendor retail automatically as customer price.

## UI Presentation

**Internal quote UI**, for any fully configured automatic product, shows:
Cost of Goods, Labor, Total Internal Cost, Markup Amount, Cash Price,
Credit Card Fee, Credit Card Price.

**Customer-facing output** exposes only:
- Cash / Check / ACH Price
- Credit Card Price

Never expose internal COGS, labor, markup, dealer cost, gross profit, or
margin on any customer-facing surface.
