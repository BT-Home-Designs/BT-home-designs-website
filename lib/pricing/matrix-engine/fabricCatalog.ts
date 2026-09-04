import type { PriceGroupLetter } from "./matrices";

/**
 * LOCKED — verified source data (68 fabrics: 37 Roller Shade + 31 Neolux).
 * Source names are transcribed EXACTLY, including apparent typos
 * ("STUCKO BLACKOUT", "E3SSENCE COLLECTION NEOLUX MADEIRA",
 * "NEOLUX RUSTIC & RUSTIC DIM OUT", "ESSENCE COLLECTIONS NEOLUX SPLANDOR").
 * Never silently "correct" a source name — see project instructions.
 */
export type CatalogProductType = "ROLLER_SHADE" | "NEOLUX";

export interface FabricCatalogEntry {
  readonly sourceName: string;
  readonly priceGroup: PriceGroupLetter;
  readonly productType: CatalogProductType;
}

const ROLLER_SHADE_FABRICS: readonly FabricCatalogEntry[] = [
  { sourceName: "VX 3000-1%", priceGroup: "A", productType: "ROLLER_SHADE" },
  { sourceName: "VX 3000-3%", priceGroup: "A", productType: "ROLLER_SHADE" },
  { sourceName: "VX 3000-5%", priceGroup: "A", productType: "ROLLER_SHADE" },
  { sourceName: "VX 3000-10%", priceGroup: "A", productType: "ROLLER_SHADE" },
  { sourceName: "VX 4000-5%", priceGroup: "A", productType: "ROLLER_SHADE" },
  { sourceName: "SANCTUARY LIGHT FILTERING", priceGroup: "C", productType: "ROLLER_SHADE" },
  { sourceName: "SANCTUARY BLACKOUT", priceGroup: "E", productType: "ROLLER_SHADE" },
  { sourceName: "TUSK LIGHT FILTERING", priceGroup: "C", productType: "ROLLER_SHADE" },
  { sourceName: "TUSK BLACKOUT", priceGroup: "E", productType: "ROLLER_SHADE" },
  { sourceName: "VX SCREEN BRAYSON -11%", priceGroup: "C", productType: "ROLLER_SHADE" },
  { sourceName: "BALMORAL LIGHT FILTERING", priceGroup: "E", productType: "ROLLER_SHADE" },
  { sourceName: "BALMORAL BLACKOUT", priceGroup: "D", productType: "ROLLER_SHADE" },
  { sourceName: "KLEENSCREEN BLACKOUT", priceGroup: "C", productType: "ROLLER_SHADE" },
  { sourceName: "X-WAVE", priceGroup: "D", productType: "ROLLER_SHADE" },
  { sourceName: "3000 HT SOLAR SCREEN FABRIC", priceGroup: "C", productType: "ROLLER_SHADE" },
  { sourceName: "VX SCREEN NATURE -3%", priceGroup: "B", productType: "ROLLER_SHADE" },
  { sourceName: "VX SCREEN STUCCO-8%", priceGroup: "E", productType: "ROLLER_SHADE" },
  { sourceName: "BIMINI", priceGroup: "A", productType: "ROLLER_SHADE" },
  { sourceName: "DAKU LIGHT FILTERING", priceGroup: "E", productType: "ROLLER_SHADE" },
  { sourceName: "DECO STYLES DAKAR", priceGroup: "C", productType: "ROLLER_SHADE" },
  { sourceName: "DECO STYLES LINEN", priceGroup: "B", productType: "ROLLER_SHADE" },
  { sourceName: "DECO STYLES RIMINI", priceGroup: "A", productType: "ROLLER_SHADE" },
  { sourceName: "ROLUX SOUTH BEACH", priceGroup: "A", productType: "ROLLER_SHADE" },
  { sourceName: "DECO STYLES STUCCO", priceGroup: "C", productType: "ROLLER_SHADE" },
  { sourceName: "DECO STYLES TOUAREG", priceGroup: "C", productType: "ROLLER_SHADE" },
  { sourceName: "DECO STYLES XANDER", priceGroup: "B", productType: "ROLLER_SHADE" },
  { sourceName: "VX SCREEN 3000 BLACKOUT", priceGroup: "E", productType: "ROLLER_SHADE" },
  { sourceName: "NIGHTFALL BIMINI BLACKOUT", priceGroup: "B", productType: "ROLLER_SHADE" },
  { sourceName: "INTIMATE CAPTIVA BLACKOUT", priceGroup: "C", productType: "ROLLER_SHADE" },
  { sourceName: "INTIMATE DAKAR BLACKOUT", priceGroup: "D", productType: "ROLLER_SHADE" },
  { sourceName: "INTIMATE DAKU BLACKOUT", priceGroup: "E", productType: "ROLLER_SHADE" },
  { sourceName: "NIGHTFALL SUNSET BLACKOUT", priceGroup: "B", productType: "ROLLER_SHADE" },
  { sourceName: "NIGHTFALL SOUTH BEACH BLACKOUT", priceGroup: "B", productType: "ROLLER_SHADE" },
  { sourceName: "INTIMATE SINGULAR BLACKOUT 3000 FR", priceGroup: "D", productType: "ROLLER_SHADE" },
  { sourceName: "STUCKO BLACKOUT", priceGroup: "C", productType: "ROLLER_SHADE" },
  { sourceName: "INTIMATE TOLEDO BLACKOUT", priceGroup: "C", productType: "ROLLER_SHADE" },
  { sourceName: "NIGHTFALL VELVET BLACKOUT", priceGroup: "C", productType: "ROLLER_SHADE" },
];

const NEOLUX_FABRICS: readonly FabricCatalogEntry[] = [
  { sourceName: "NEOLUX SOLITUDE DIM OUT", priceGroup: "C", productType: "NEOLUX" },
  { sourceName: "NEOLUX SUNDOWN DIM OUT", priceGroup: "B", productType: "NEOLUX" },
  { sourceName: "AVANT NEOLUX COSMOPOLITAN DIM OUT", priceGroup: "B", productType: "NEOLUX" },
  { sourceName: "ESSENCE NEOLUX MONACO DIM OUT FR", priceGroup: "C", productType: "NEOLUX" },
  { sourceName: "AVANT NEOLUX MYKONOS DIM OUT", priceGroup: "C", productType: "NEOLUX" },
  { sourceName: "ESSENCE NEOLUX BAHIA DIM OUT", priceGroup: "A", productType: "NEOLUX" },
  { sourceName: "ESSENCE ECLIPSE DIM OUT", priceGroup: "C", productType: "NEOLUX" },
  { sourceName: "NEOLUX CLASSIC DIM OUT", priceGroup: "D", productType: "NEOLUX" },
  { sourceName: "NEOLUX RUSTIC & RUSTIC DIM OUT", priceGroup: "B", productType: "NEOLUX" },
  { sourceName: "AVANT NEOLUX COMFORT DIM OUT", priceGroup: "B", productType: "NEOLUX" },
  { sourceName: "VICTORIA DIM OUT", priceGroup: "B", productType: "NEOLUX" },
  { sourceName: "AVANT NEOLUX COMPASS DIM OUT FR", priceGroup: "B", productType: "NEOLUX" },
  { sourceName: "NEOLUX SHEER VISION FR", priceGroup: "D", productType: "NEOLUX" },
  { sourceName: "AVANT NEOLUX ABACUS FR", priceGroup: "B", productType: "NEOLUX" },
  { sourceName: "NEOLUX CONTEMPORARY SHEER FR", priceGroup: "D", productType: "NEOLUX" },
  { sourceName: "NEOLUX PALAU", priceGroup: "A", productType: "NEOLUX" },
  { sourceName: "NEOLUX COLLECTION DYNASTY", priceGroup: "A", productType: "NEOLUX" },
  { sourceName: "NEOLUX COLLECTIONS NOVEL", priceGroup: "A", productType: "NEOLUX" },
  { sourceName: "NEOLUX COLLECTION FIJI", priceGroup: "B", productType: "NEOLUX" },
  { sourceName: "NEOLUX COLLECTIONS GLAMOUR", priceGroup: "B", productType: "NEOLUX" },
  { sourceName: "ESSENCE COLLECTIONS NEOLUX KORO", priceGroup: "A", productType: "NEOLUX" },
  { sourceName: "NEOLUX COLLECTIONS SERENADE", priceGroup: "A", productType: "NEOLUX" },
  { sourceName: "NEOLUX COLLECTIONS NAPA", priceGroup: "B", productType: "NEOLUX" },
  { sourceName: "NEOLUX COLLECTIONS ARCADIA", priceGroup: "A", productType: "NEOLUX" },
  { sourceName: "AVANT COLLECTIONS NEOLUX LUXURY DENSE", priceGroup: "A", productType: "NEOLUX" },
  { sourceName: "ESSENCE COLLECTIONS NEOLUX CANCUN", priceGroup: "A", productType: "NEOLUX" },
  { sourceName: "ESSENCE COLLECTIONS NEOLUX SPLANDOR", priceGroup: "C", productType: "NEOLUX" },
  { sourceName: "E3SSENCE COLLECTION NEOLUX MADEIRA", priceGroup: "C", productType: "NEOLUX" },
  { sourceName: "ESSENCE COLLECTIONS NEOLUX HORIZON", priceGroup: "D", productType: "NEOLUX" },
  { sourceName: "ESSENCE COLLECTIONS NEOLUX LUXURY", priceGroup: "B", productType: "NEOLUX" },
  { sourceName: "NEOLUX COLLECTIONS SOFT", priceGroup: "B", productType: "NEOLUX" },
];

export const FABRIC_CATALOG: readonly FabricCatalogEntry[] = [...ROLLER_SHADE_FABRICS, ...NEOLUX_FABRICS];

export const ROLLER_SHADE_FABRIC_COUNT = ROLLER_SHADE_FABRICS.length;
export const NEOLUX_FABRIC_COUNT = NEOLUX_FABRICS.length;

/**
 * Lookup-only normalization (trim + collapse internal whitespace + upper
 * case). Used to match user/UI input against the catalog. NEVER used as a
 * fabric's permanent identity — that's the Fabric row's database id (see
 * prisma/schema.prisma). If two distinct source names normalize to the
 * same value, catalog validation fails loudly (see validateCatalog below)
 * rather than silently colliding.
 */
export function normalizeFabricName(sourceName: string): string {
  return sourceName.trim().replace(/\s+/g, " ").toUpperCase();
}

const CATALOG_BY_NORMALIZED_NAME: ReadonlyMap<string, FabricCatalogEntry> = new Map(
  FABRIC_CATALOG.map((entry) => [normalizeFabricName(entry.sourceName), entry])
);

/**
 * Looks up a fabric by its (normalized) name. Returns undefined — never a
 * default/substitute entry — when the fabric isn't in the verified
 * catalog; callers must treat that as UNKNOWN_FABRIC, not fall back to
 * any other fabric or price group.
 */
export function findFabricInCatalog(sourceNameOrAnyCasing: string): FabricCatalogEntry | undefined {
  return CATALOG_BY_NORMALIZED_NAME.get(normalizeFabricName(sourceNameOrAnyCasing));
}

export interface CatalogValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/**
 * Structural invariants the fabric catalog must satisfy. Run at module
 * load (see the bottom of this file) so a broken catalog fails immediately
 * and loudly rather than silently mispricing quotes — "FAIL AT STARTUP /
 * VALIDATION" per project instructions.
 */
export function validateFabricCatalog(): CatalogValidationResult {
  const errors: string[] = [];

  if (FABRIC_CATALOG.length !== 68) {
    errors.push(`Expected exactly 68 fabrics, found ${FABRIC_CATALOG.length}.`);
  }
  if (ROLLER_SHADE_FABRIC_COUNT !== 37) {
    errors.push(`Expected exactly 37 Roller Shade fabrics, found ${ROLLER_SHADE_FABRIC_COUNT}.`);
  }
  if (NEOLUX_FABRIC_COUNT !== 31) {
    errors.push(`Expected exactly 31 Neolux fabrics, found ${NEOLUX_FABRIC_COUNT}.`);
  }

  for (const entry of FABRIC_CATALOG) {
    if (!entry.sourceName || entry.sourceName.trim().length === 0) {
      errors.push(`Fabric has an empty source name (productType=${entry.productType}).`);
    }
    if (!entry.priceGroup) {
      errors.push(`Fabric "${entry.sourceName}" has no price group.`);
    }
  }

  const seenNormalized = new Map<string, string[]>();
  for (const entry of FABRIC_CATALOG) {
    const normalized = normalizeFabricName(entry.sourceName);
    const existing = seenNormalized.get(normalized) ?? [];
    existing.push(entry.sourceName);
    seenNormalized.set(normalized, existing);
  }
  for (const [normalized, sourceNames] of seenNormalized) {
    if (sourceNames.length > 1) {
      errors.push(
        `Normalized name collision "${normalized}" shared by: ${sourceNames.join(", ")}. Fabric identity must be unique — refusing to silently overwrite one.`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Throws immediately if the catalog is structurally invalid. Called at
 * module load below — importing this file anywhere is enough to enforce
 * the invariant.
 */
export function assertValidFabricCatalog(): void {
  const result = validateFabricCatalog();
  if (!result.valid) {
    throw new Error(`Fabric catalog configuration is invalid:\n${result.errors.join("\n")}`);
  }
}

assertValidFabricCatalog();
