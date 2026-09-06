# Roller Shade / Neolux Matrix Pricing Specification

This document is a plain-language transcription of the **verified, locked**
matrix pricing engine already implemented in this repository. It exists so
this specification never has to be re-pasted into a prompt — if anything
here looks wrong, the code is the actual source of truth; fix this
document to match the code, not the other way around.

Source files (all under `lib/pricing/matrix-engine/`):

| File | Contents |
|---|---|
| `breakpoints.ts` | Width/height breakpoint lists, tier-selection rule |
| `matrices.ts` | Groups A–E retail-price matrices, the known anomaly |
| `fabricCatalog.ts` | The 68-fabric catalog, normalization, validation |
| `engine.ts` | `priceMatrixItem` — the lookup/pricing algorithm |
| `types.ts` | `MatrixPriceInput` / `MatrixPriceResult` contracts |
| `version.ts` | `MATRIX_PRICING_ENGINE_VERSION` (currently `roller-neolux-matrix-v1.0.0`) |
| `engine.test.ts`, `boundary.test.ts`, `fabricCatalog.test.ts` | The locked regression/boundary/config tests described below |

**This document does not change any pricing code or pricing data.** It is
documentation only.

---

## 1. Width breakpoints

```
[30, 36, 42, 48, 60, 72, 84, 96, 120, 140]
```

10 breakpoints, inches, sorted ascending. `140` is `MAX_WIDTH`.

## 2. Height breakpoints

```
[40, 50, 60, 74, 84, 96, 120, 140, 160, 190]
```

10 breakpoints, inches, sorted ascending. `190` is `MAX_HEIGHT`.

## 3. Tier-selection rule

For an actual measurement, the selected tier is **the smallest listed
breakpoint that is `>=` the actual measurement** — never interpolated,
never rounded down, never clamped, never "nearest."

- Exactly on a breakpoint → that breakpoint's tier.
- Any amount over a breakpoint (even `+0.001"`) → the *next* tier up.
- Any amount over the maximum breakpoint (`140"` wide or `190"` tall) →
  `OUT_OF_MATRIX_RANGE` — the maximum tier is never used as a fallback/clamp.

This rule is implemented once, generically, as `selectBreakpoint()` and used
identically for width and height.

## 4. Price Groups A–E (vendor retail matrices)

Each fabric belongs to exactly one of 5 price groups (A, B, C, D, E). Each
group is a 10×10 matrix: 10 height-breakpoint rows × 10 width-breakpoint
columns = 100 cells, all whole-dollar vendor retail prices.

Column order within every row matches `WIDTH_BREAKPOINTS` positionally:
`[30, 36, 42, 48, 60, 72, 84, 96, 120, 140]`.

### Group A

| H\W | 30 | 36 | 42 | 48 | 60 | 72 | 84 | 96 | 120 | 140 |
|---|---|---|---|---|---|---|---|---|---|---|
| 40 | 108 | 130 | 146 | 170 | 186 | 200 | 250 | 304 | 384 | 504 |
| 50 | 126 | 144 | 158 | 184 | 196 | 212 | 276 | 326 | 408 | 530 |
| 60 | 144 | 158 | 178 | 198 | 212 | 232 | 292 | 348 | 430 | 580 |
| 74 | 162 | 178 | 198 | 216 | 230 | 244 | 316 | 366 | 460 | 620 |
| 84 | 178 | 188 | 216 | 228 | 242 | 278 | 338 | 380 | 480 | 680 |
| 96 | 192 | 204 | 234 | 246 | 266 | 302 | 364 | 400 | 504 | 720 |
| 120 | 212 | 216 | 266 | 280 | 304 | 320 | 390 | 416 | 580 | 760 |
| 140 | 236 | 252 | 296 | 314 | 356 | 358 | 450 | 470 | 740 | 808 |
| 160 | 258 | 280 | 322 | 350 | 390 | 410 | 478 | 496 | 770 | 930 |
| 190 | 296 | 318 | 362 | 392 | 470 | 490 | 508 | 528 | 830 | 980 |

### Group B

| H\W | 30 | 36 | 42 | 48 | 60 | 72 | 84 | 96 | 120 | 140 |
|---|---|---|---|---|---|---|---|---|---|---|
| 40 | 116 | 140 | 157 | 183 | 200 | 216 | 270 | 328 | 414 | 544 |
| 50 | 136 | 155 | 170 | 198 | 211 | 228 | 298 | 352 | 440 | 572 |
| 60 | 155 | 170 | 192 | 213 | 228 | 250 | 315 | 375 | 464 | 626 |
| 74 | 174 | 192 | 213 | 233 | 248 | 263 | 341 | 395 | 496 | 669 |
| 84 | 192 | 203 | 233 | 246 | 261 | 300 | 365 | 410 | 518 | 734 |
| 96 | 207 | 220 | 252 | 265 | 287 | 326 | 393 | 432 | 544 | 777 |
| 120 | 228 | 233 | 287 | 302 | 328 | 345 | 421 | 449 | 626 | 820 |
| 140 | 254 | 250 | 319 | 339 | 384 | 386 | 486 | 507 | 799 | 872 |
| 160 | 278 | 302 | 347 | 378 | 421 | 442 | 516 | 535 | 831 | 1004 |
| 190 | 319 | 343 | 390 | 423 | 507 | 529 | 548 | 570 | 896 | 1058 |

### Group C

| H\W | 30 | 36 | 42 | 48 | 60 | 72 | 84 | 96 | 120 | 140 |
|---|---|---|---|---|---|---|---|---|---|---|
| 40 | 133 | 161 | 180 | 210 | 230 | 248 | 310 | 377 | 476 | 625 |
| 50 | 156 | 178 | 195 | 227 | 242 | 262 | 342 | 404 | 506 | 657 |
| 60 | 178 | 195 | 220 | 244 | 262 | 287 | 362 | 431 | 533 | 719 |
| 74 | 200 | 220 | 244 | 267 | 285 | 302 | 392 | 454 | 570 | 769 |
| 84 | 220 | 233 | 267 | 282 | 300 | 345 | 419 | 471 | 595 | 844 |
| 96 | 238 | 253 | 289 | 304 | 330 | 374 | 451 | 496 | 625 | 893 |
| 120 | 262 | 267 | 330 | 347 | 377 | 396 | 484 | 516 | 719 | 943 |
| 140 | 292 | 287 | 366 | 389 | 441 | 443 | 558 | 583 | 918 | 1002 |
| 160 | 319 | 347 | 399 | 434 | 484 | 508 | 615 | 615 | 955 | 1154 |
| 190 | 366 | 394 | 448 | 486 | 583 | 608 | 630 | 655 | 1030 | 1216 |

### Group D

| H\W | 30 | 36 | 42 | 48 | 60 | 72 | 84 | 96 | 120 | 140 |
|---|---|---|---|---|---|---|---|---|---|---|
| 40 | 152 | 185 | 207 | 241 | 264 | 285 | 356 | 433 | 547 | 718 |
| 50 | 179 | 204 | 224 | 261 | 278 | 301 | 393 | 464 | 581 | 755 |
| 60 | 204 | 224 | 253 | 280 | 301 | 330 | 416 | 495 | 612 | 826 |
| 74 | 230 | 253 | 280 | 307 | 327 | 347 | 450 | 522 | 655 | 884 |
| 84 | 253 | 267 | 307 | 324 | 345 | 396 | 481 | 514 | 684 | 970 |
| 96 | 273 | 290 | 332 | 349 | 379 | 430 | 518 | 570 | 718 | 1026 |
| 120 | 301 | 307 | 379 | 399 | 433 | 455 | 556 | 593 | 826 | 1084 |
| 140 | 335 | 330 | 420 | 447 | 507 | 509 | 641 | 670 | 1055 | 1152 |
| 160 | 366 | 399 | 458 | 499 | 556 | 584 | 707 | 707 | 1098 | 1327 |
| 190 | 420 | 453 | 515 | 558 | 670 | 699 | 724 | 753 | 1184 | 1398 |

### Group E

| H\W | 30 | 36 | 42 | 48 | 60 | 72 | 84 | 96 | 120 | 140 |
|---|---|---|---|---|---|---|---|---|---|---|
| 40 | 197 | 240 | 269 | 313 | 343 | 370 | 462 | 562 | 711 | 933 |
| 50 | 232 | 265 | 291 | 339 | 361 | 391 | 510 | 603 | 755 | 981 |
| 60 | 265 | 291 | 328 | 364 | 391 | 429 | 540 | 643 | 795 | 1073 |
| 74 | 299 | 328 | **264** ⚠ | 399 | 425 | 451 | 585 | 678 | 851 | 1149 |
| 84 | 328 | 347 | 399 | 421 | 448 | 514 | 638 | 668 | 889 | 1261 |
| 96 | 362 | 377 | 431 | 453 | 492 | 559 | 673 | 741 | 933 | 1333 |
| 120 | 391 | 399 | 492 | 518 | 562 | 591 | 722 | 770 | 1073 | 1409 |
| 140 | 435 | 429 | 546 | 581 | 659 | 661 | 833 | 871 | 1371 | 1497 |
| 160 | 475 | 518 | 595 | 648 | 722 | 759 | 919 | 919 | 1427 | 1725 |
| 190 | 546 | 588 | 669 | 725 | 871 | 908 | 941 | 978 | 1539 | 1817 |

⚠ See [§7 — Group E / H74 / W42 anomaly](#7-known-anomaly-group-e--h74--w42--264) below.

## 5. The 68-fabric catalog and product types

`lib/pricing/matrix-engine/fabricCatalog.ts` defines exactly **68** fabrics,
split between two `CatalogProductType` values:

- **37 Roller Shade fabrics** (`ROLLER_SHADE`)
- **31 Neolux fabrics** (`NEOLUX`)

Every fabric row has: an exact `sourceName` (transcribed byte-for-byte from
the vendor's own source list, including apparent typos — see §6), a
`priceGroup` (A–E), and a `productType`.

### Roller Shade fabrics (37)

| Source name | Price Group |
|---|---|
| VX 3000-1% | A |
| VX 3000-3% | A |
| VX 3000-5% | A |
| VX 3000-10% | A |
| VX 4000-5% | A |
| SANCTUARY LIGHT FILTERING | C |
| SANCTUARY BLACKOUT | E |
| TUSK LIGHT FILTERING | C |
| TUSK BLACKOUT | E |
| VX SCREEN BRAYSON -11% | C |
| BALMORAL LIGHT FILTERING | E |
| BALMORAL BLACKOUT | D |
| KLEENSCREEN BLACKOUT | C |
| X-WAVE | D |
| 3000 HT SOLAR SCREEN FABRIC | C |
| VX SCREEN NATURE -3% | B |
| VX SCREEN STUCCO-8% | E |
| BIMINI | A |
| DAKU LIGHT FILTERING | E |
| DECO STYLES DAKAR | C |
| DECO STYLES LINEN | B |
| DECO STYLES RIMINI | A |
| ROLUX SOUTH BEACH | A |
| DECO STYLES STUCCO | C |
| DECO STYLES TOUAREG | C |
| DECO STYLES XANDER | B |
| VX SCREEN 3000 BLACKOUT | E |
| NIGHTFALL BIMINI BLACKOUT | B |
| INTIMATE CAPTIVA BLACKOUT | C |
| INTIMATE DAKAR BLACKOUT | D |
| INTIMATE DAKU BLACKOUT | E |
| NIGHTFALL SUNSET BLACKOUT | B |
| NIGHTFALL SOUTH BEACH BLACKOUT | B |
| INTIMATE SINGULAR BLACKOUT 3000 FR | D |
| STUCKO BLACKOUT *(sic)* | C |
| INTIMATE TOLEDO BLACKOUT | C |
| NIGHTFALL VELVET BLACKOUT | C |

### Neolux fabrics (31)

| Source name | Price Group |
|---|---|
| NEOLUX SOLITUDE DIM OUT | C |
| NEOLUX SUNDOWN DIM OUT | B |
| AVANT NEOLUX COSMOPOLITAN DIM OUT | B |
| ESSENCE NEOLUX MONACO DIM OUT FR | C |
| AVANT NEOLUX MYKONOS DIM OUT | C |
| ESSENCE NEOLUX BAHIA DIM OUT | A |
| ESSENCE ECLIPSE DIM OUT | C |
| NEOLUX CLASSIC DIM OUT | D |
| NEOLUX RUSTIC & RUSTIC DIM OUT *(sic)* | B |
| AVANT NEOLUX COMFORT DIM OUT | B |
| VICTORIA DIM OUT | B |
| AVANT NEOLUX COMPASS DIM OUT FR | B |
| NEOLUX SHEER VISION FR | D |
| AVANT NEOLUX ABACUS FR | B |
| NEOLUX CONTEMPORARY SHEER FR | D |
| NEOLUX PALAU | A |
| NEOLUX COLLECTION DYNASTY | A |
| NEOLUX COLLECTIONS NOVEL | A |
| NEOLUX COLLECTION FIJI | B |
| NEOLUX COLLECTIONS GLAMOUR | B |
| ESSENCE COLLECTIONS NEOLUX KORO | A |
| NEOLUX COLLECTIONS SERENADE | A |
| NEOLUX COLLECTIONS NAPA | B |
| NEOLUX COLLECTIONS ARCADIA | A |
| AVANT COLLECTIONS NEOLUX LUXURY DENSE | A |
| ESSENCE COLLECTIONS NEOLUX CANCUN | A |
| ESSENCE COLLECTIONS NEOLUX SPLANDOR *(sic)* | C |
| E3SSENCE COLLECTION NEOLUX MADEIRA *(sic)* | C |
| ESSENCE COLLECTIONS NEOLUX HORIZON | D |
| ESSENCE COLLECTIONS NEOLUX LUXURY | B |
| NEOLUX COLLECTIONS SOFT | B |

*(sic)* marks a name kept exactly as transcribed from the vendor source,
including its apparent typo — see §6.

## 6. Normalization / collision requirements

- A fabric's **permanent identity** is its database row id (the `Fabric`
  table), never its normalized name — normalization is a lookup aid only.
- `normalizeFabricName()` = trim, collapse internal whitespace to single
  spaces, upper-case. Used only to match arbitrary-casing/whitespace input
  against the catalog (`findFabricInCatalog`).
- Lookup is **case/whitespace-insensitive but never fuzzy**: `"  vx
  3000-3%  "` matches `VX 3000-3%`; `"VX 3000-30%"` matches nothing (not a
  near-match fallback to `VX 3000-3%`).
- Apparent source-data typos (`STUCKO BLACKOUT`, `E3SSENCE COLLECTION NEOLUX
  MADEIRA`, `NEOLUX RUSTIC & RUSTIC DIM OUT`, `ESSENCE COLLECTIONS NEOLUX
  SPLANDOR`) are preserved byte-for-byte. The catalog must never "auto-correct"
  a source name.
- **Collision policy**: if two distinct source names ever normalized to the
  same value, catalog validation fails loudly at module load
  (`assertValidFabricCatalog()` throws) rather than silently letting one
  entry shadow the other. This — plus an exact-count check (68 total, 37
  Roller Shade, 31 Neolux) and a "every fabric references an existing
  price-group matrix" check — runs automatically whenever this module is
  imported, so a broken catalog fails at startup, not mid-quote.

## 7. Dealer cost — 8000 bps rule

```
DEALER_MULTIPLIER_BPS = 8000        // 8000 basis points = 0.80 = 80%
dealerCostCents = round(retailCents * 8000 / 10000)
```

Dealer cost is **80% of vendor retail**, always computed by multiplying by
`8000` basis points and dividing by `10000` — never by dividing retail by
`0.80` or by adding an "80% markup" the other direction. Every source
retail value is a whole-dollar amount, so this integer arithmetic is exact
in practice; the `Math.round` is a defensive safety net, not a real source
of rounding.

## 8. Strict error behavior

The engine's status is one of exactly five values
(`MatrixPricingStatus`): `SUCCESS`, `OUT_OF_MATRIX_RANGE`, `UNKNOWN_FABRIC`,
`INVALID_DIMENSIONS`, `CONFIGURATION_ERROR`.

**Contract**: for every status other than `SUCCESS`, every pricing field —
`priceGroup`, `selectedWidthTier`, `selectedHeightTier`, `retailCents`,
`retailDollars`, `dealerMultiplierBps`, `dealerCostCents`,
`dealerCostDollars` — is `null`. There is no default, substitute, or
partial price on any failure path. Only the raw input (fabric name, entered
dimensions) and `status` / `warnings` / `message` are populated.

Validation order, each one fully fail-closed:

1. **`INVALID_DIMENSIONS`** — width or height is not a finite number `> 0`
   (rejects `0`, negative values, `NaN`, `Infinity`, `-Infinity`). Checked
   before fabric lookup.
2. **`UNKNOWN_FABRIC`** — the (normalized) fabric name isn't in the 68-item
   catalog. Never assigns Group A, never substitutes another fabric, never
   returns a `$0` price.
3. **`OUT_OF_MATRIX_RANGE`** — width `> 140"` or height `> 190"`. Never
   interpolates, rounds down, clamps to the max tier, or extrapolates
   beyond the matrix.
4. **`CONFIGURATION_ERROR`** — the fabric resolved and the dimensions are
   in range, but the price matrix/cell for that fabric's price group is
   missing. This should be unreachable against the real locked data (every
   fabric references an existing matrix, every matrix has all 100 cells —
   enforced by catalog/matrix validation) and exists to fail loudly instead
   of pricing at `$0` if that invariant is ever violated. Exercised in
   tests only against deliberately-broken fixtures, never the real data.
5. **`SUCCESS`** — all of the above passed; the full pricing result is
   populated, including any anomaly warning (§9).

## 9. Known anomaly: Group E / H74 / W42 = 264

At price group **E**, height tier **74**, width tier **42**, the vendor
source retail value is **$264** — noticeably out of line with its
neighbors in the same row (`299, 328, [264], 399, 425, ...`) and column.
This has been verified against the source data and is **intentionally
preserved as-is** — it is not a typo to "fix" in this codebase; any
correction must come from a re-verified vendor specification.

Whenever a priced item lands exactly on this cell, the result carries a
warning:

```
"SOURCE DATA WARNING: H74/W42 VALUE SHOULD BE HUMAN-VERIFIED"
```

This is independent of which fabric landed on that cell — any Group E
fabric priced at width tier 42 / height tier 74 gets the same warning. The
mechanism (`PRICE_ANOMALIES` in `matrices.ts`) is a generic list of
`{priceGroup, widthTier, heightTier, warning}` entries the engine checks
against every successful result, so additional verified-but-unusual cells
could be flagged the same way in the future without changing engine logic.

Concretely: a Group E fabric at exactly 42"×74" prices at retail **$264**,
dealer cost **$211.20**, with the warning attached (locked regression test
#14).

## 10. Locked regression cases

These are transcribed from `engine.test.ts`'s "locked regression tests
(1–15)" and the "cross-group isolation at exactly 60×84" block — the
canonical set of known-correct answers. All dollar figures below are
`retailDollars` / `dealerCostDollars` (dealer = retail × 0.80).

| # | Fabric | W × H (in) | Status | Price Group | W Tier | H Tier | Retail | Dealer |
|---|---|---|---|---|---|---|---|---|
| 1 | VX 3000-3% | 30 × 40 | SUCCESS | A | 30 | 40 | $108.00 | $86.40 |
| 2 | VX SCREEN NATURE -3% | 30.01 × 40 | SUCCESS | B | 36 | 40 | $140.00 | $112.00 |
| 3 | SANCTUARY LIGHT FILTERING | 36.125 × 50.125 | SUCCESS | C | 42 | 60 | $220.00 | $176.00 |
| 4 | BALMORAL BLACKOUT | 48.01 × 74.01 | SUCCESS | D | 60 | 84 | $345.00 | $276.00 |
| 5 | SANCTUARY BLACKOUT | 59.875 × 83.5 | SUCCESS | E | 60 | 84 | $448.00 | $358.40 |
| 6 | NIGHTFALL BIMINI BLACKOUT | 72 × 96 | SUCCESS | B | — | — | $326.00 | $260.80 |
| 7 | NIGHTFALL VELVET BLACKOUT | 72.125 × 96.125 | SUCCESS | C | 84 | 120 | $484.00 | $387.20 |
| 8 | INTIMATE DAKAR BLACKOUT | 95.75 × 119.5 | SUCCESS | D | 96 | 120 | $593.00 | $474.40 |
| 9 | INTIMATE DAKU BLACKOUT | 119.99 × 139.99 | SUCCESS | E | 120 | 140 | $1371.00 | $1096.80 |
| 10 | ESSENCE NEOLUX BAHIA DIM OUT | 120.01 × 140.01 | SUCCESS | A | 140 | 160 | $930.00 | $744.00 |
| 11 | NEOLUX SUNDOWN DIM OUT | 140 × 190 | SUCCESS | B | 140 | 190 | $1058.00 | $846.40 |
| 12 | NEOLUX SOLITUDE DIM OUT | 140.001 × 190 | OUT_OF_MATRIX_RANGE | — | — | — | — | — |
| 13 | NEOLUX CLASSIC DIM OUT | 140 × 190.001 | OUT_OF_MATRIX_RANGE | — | — | — | — | — |
| 14 | SANCTUARY BLACKOUT | 42 × 74 | SUCCESS | E | 42 | 74 | $264.00 | $211.20 | ⚠ anomaly warning present |
| 15 | FAKE FABRIC THAT DOES NOT EXIST | 36 × 50 | UNKNOWN_FABRIC | — | — | — | — | — |

**Cross-group isolation at exactly 60×84** — five different fabrics, one
per price group, all priced at the same 60"×84" size, confirming each
group's matrix is genuinely independent (no accidental sharing):

| Price Group | Fabric | Retail | Dealer |
|---|---|---|---|
| A | VX 3000-3% | $242.00 | $193.60 |
| B | VX SCREEN NATURE -3% | $261.00 | $208.80 |
| C | SANCTUARY LIGHT FILTERING | $300.00 | $240.00 |
| D | BALMORAL BLACKOUT | $345.00 | $276.00 |
| E | SANCTUARY BLACKOUT | $448.00 | $358.40 |

All five retail values above are distinct (also asserted directly in the
test suite).

### Other locked behaviors covered by the test suite

- **Invalid dimensions**: `0`, `-1`, `-0.001`, `NaN`, `Infinity`,
  `-Infinity` on either width or height → `INVALID_DIMENSIONS`, tested
  independently for width and for height. The entered fabric name and
  dimensions are preserved on the failure result exactly as given (e.g.
  `width: -5` stays `-5`, not clamped or nulled).
- **Unknown fabric never substitutes**: an unrecognized name never falls
  back to Group A (or any other group) and never returns partial pricing
  fields.
- **Fabric lookup is case/whitespace-insensitive but never fuzzy**:
  `"  vx 3000-3%  "` resolves; `"VX 3000-30%"` does not resolve to
  `VX 3000-3%` or anything else.
- **Configuration-error paths** are exercised only against deliberately
  broken test fixtures (an empty matrix map, or a matrix missing a cell) —
  never against the real locked `PRICE_MATRICES` — and both produce
  `CONFIGURATION_ERROR` with every pricing field null.
- **Exhaustive breakpoint boundary coverage** (`boundary.test.ts`): every
  one of the 10 width breakpoints and 10 height breakpoints is tested both
  exactly at the breakpoint (selects that tier) and at `+0.001` over it
  (selects the *next* tier, or `OUT_OF_MATRIX_RANGE` with a `null` tier if
  it's already the maximum breakpoint — never clamped to the max tier).
- **Fabric/matrix shape invariants** (`fabricCatalog.test.ts`): exact
  counts (68 / 37 / 31), every fabric has a non-empty, already-trimmed
  source name and a valid `productType`, every fabric's `priceGroup`
  resolves to an existing matrix, no normalized-name collisions, the four
  apparent-typo names are present verbatim, and `validateFabricCatalog()`
  reports valid with zero errors against the real catalog. Separately,
  every one of the 5 matrices has exactly 10 height rows × 10 width
  columns (100 cells), and every cell is a positive finite number.

---

*Generated from the locked source in `lib/pricing/matrix-engine/` — see
that directory for the authoritative implementation and its full test
suite. This file documents behavior; it does not define it.*
