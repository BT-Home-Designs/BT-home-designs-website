import type { PriceGroupLetter } from "./matrices";
import type { CatalogProductType } from "./fabricCatalog";

export type MatrixPricingStatus = "SUCCESS" | "OUT_OF_MATRIX_RANGE" | "UNKNOWN_FABRIC" | "INVALID_DIMENSIONS" | "CONFIGURATION_ERROR";

export interface MatrixPriceInput {
  /** Any casing/spacing — matched against the catalog via normalization. */
  readonly fabricSourceName: string;
  /** Inches. */
  readonly width: number;
  /** Inches. */
  readonly height: number;
}

/**
 * STRICT ERROR CONTRACT: for every status other than SUCCESS, priceGroup,
 * selectedWidthTier, selectedHeightTier, retailCents, retailDollars,
 * dealerMultiplierBps, dealerCostCents, and dealerCostDollars are all
 * null. Only the raw input (fabric name, entered dimensions) and the
 * status/warnings/message are populated on failure — never a default,
 * substitute, or partial price.
 */
export interface MatrixPriceResult {
  readonly pricingEngineVersion: string;
  readonly status: MatrixPricingStatus;

  /** Raw input, exactly as given, preserved for audit/error display. */
  readonly sourceFabricName: string;
  readonly normalizedFabricName: string;
  readonly actualWidth: number;
  readonly actualHeight: number;

  /**
   * Catalog metadata, not a computed pricing field — so it's not subject to
   * the strict null-on-failure contract below. Populated whenever the
   * fabric was successfully resolved (SUCCESS, OUT_OF_MATRIX_RANGE,
   * CONFIGURATION_ERROR); null when it never was (INVALID_DIMENSIONS,
   * UNKNOWN_FABRIC).
   */
  readonly productType: CatalogProductType | null;

  readonly priceGroup: PriceGroupLetter | null;
  readonly selectedWidthTier: number | null;
  readonly selectedHeightTier: number | null;

  readonly retailCents: number | null;
  readonly retailDollars: number | null;
  readonly dealerMultiplierBps: number | null;
  readonly dealerCostCents: number | null;
  readonly dealerCostDollars: number | null;

  readonly warnings: readonly string[];

  /** Human-readable explanation, always present on a non-SUCCESS status. */
  readonly message: string | null;
}
