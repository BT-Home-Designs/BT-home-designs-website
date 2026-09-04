import { WIDTH_BREAKPOINTS, HEIGHT_BREAKPOINTS, MAX_WIDTH, MAX_HEIGHT, selectBreakpoint } from "./breakpoints";
import { PRICE_MATRICES, PRICE_ANOMALIES, type PriceGroupLetter, type Matrix } from "./matrices";
import { findFabricInCatalog, normalizeFabricName, type FabricCatalogEntry } from "./fabricCatalog";
import { MATRIX_PRICING_ENGINE_VERSION } from "../version";
import type { MatrixPriceInput, MatrixPriceResult, MatrixPricingStatus } from "./types";

/** 8000 basis points = 0.80. Locked — do not divide by .80 or add 80%. */
const DEALER_MULTIPLIER_BPS = 8000;

export interface MatrixEngineDependencies {
  readonly matrices: Readonly<Partial<Record<PriceGroupLetter, Matrix>>>;
  readonly findFabric: (sourceNameOrAnyCasing: string) => FabricCatalogEntry | undefined;
}

/** The real, locked, verified data — what every non-test caller uses. */
const DEFAULT_DEPENDENCIES: MatrixEngineDependencies = {
  matrices: PRICE_MATRICES,
  findFabric: findFabricInCatalog,
};

function isValidDimension(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function failureResult(
  input: MatrixPriceInput,
  status: MatrixPricingStatus,
  message: string,
  warnings: readonly string[] = [],
  fabric: FabricCatalogEntry | null = null
): MatrixPriceResult {
  return {
    pricingEngineVersion: MATRIX_PRICING_ENGINE_VERSION,
    status,
    sourceFabricName: input.fabricSourceName,
    normalizedFabricName: normalizeFabricName(input.fabricSourceName),
    actualWidth: input.width,
    actualHeight: input.height,
    productType: fabric?.productType ?? null,
    priceGroup: null,
    selectedWidthTier: null,
    selectedHeightTier: null,
    retailCents: null,
    retailDollars: null,
    dealerMultiplierBps: null,
    dealerCostCents: null,
    dealerCostDollars: null,
    warnings,
    message,
  };
}

/**
 * Core lookup implementation, parameterized over its data dependencies so
 * configuration-error paths (a missing matrix/cell) can be exercised in
 * tests without ever touching the real locked data. Every other caller
 * should use `priceMatrixItem` below, not this function directly.
 */
export function priceMatrixItemWithDependencies(input: MatrixPriceInput, deps: MatrixEngineDependencies): MatrixPriceResult {
  // 1. Validate dimensions — reject 0, negative, NaN, Infinity, and any
  // other non-finite value before anything else.
  if (!isValidDimension(input.width) || !isValidDimension(input.height)) {
    return failureResult(
      input,
      "INVALID_DIMENSIONS",
      `Width and height must be finite numbers greater than zero (got width=${input.width}, height=${input.height}).`
    );
  }

  // 2. Resolve fabric — fail closed. Never assign Group A, substitute
  // another fabric, or return a $0 price for an unrecognized name.
  const fabric = deps.findFabric(input.fabricSourceName);
  if (!fabric) {
    return failureResult(input, "UNKNOWN_FABRIC", `"${input.fabricSourceName}" is not in the verified fabric catalog. Manual review required.`);
  }

  // 3. Range check — never interpolate, round down, clamp, or extrapolate
  // beyond the matrix.
  if (input.width > MAX_WIDTH || input.height > MAX_HEIGHT) {
    return failureResult(
      input,
      "OUT_OF_MATRIX_RANGE",
      `${input.width}"W x ${input.height}"H exceeds the matrix (max ${MAX_WIDTH}"W x ${MAX_HEIGHT}"H). Manual pricing required.`,
      [],
      fabric
    );
  }

  // 4. Select tiers: the smallest listed breakpoint >= actual measurement.
  const widthTier = selectBreakpoint(WIDTH_BREAKPOINTS, input.width);
  const heightTier = selectBreakpoint(HEIGHT_BREAKPOINTS, input.height);
  if (widthTier === undefined || heightTier === undefined) {
    // Defensive: the range check above should make this unreachable.
    return failureResult(input, "OUT_OF_MATRIX_RANGE", "Could not select a width/height tier within the matrix.", [], fabric);
  }

  // 5. Look up the matrix cell for this fabric's price group.
  const matrix = deps.matrices[fabric.priceGroup];
  if (!matrix) {
    return failureResult(
      input,
      "CONFIGURATION_ERROR",
      `No price matrix is configured for price group "${fabric.priceGroup}". Do not price.`,
      [],
      fabric
    );
  }
  const row = matrix[heightTier];
  const widthIndex = WIDTH_BREAKPOINTS.indexOf(widthTier);
  const retailDollars = row !== undefined && widthIndex !== -1 ? row[widthIndex] : undefined;
  if (retailDollars === undefined) {
    return failureResult(
      input,
      "CONFIGURATION_ERROR",
      `No price cell configured for price group "${fabric.priceGroup}" at W${widthTier}/H${heightTier}. Do not price.`,
      [],
      fabric
    );
  }

  // 6. Dealer cost = vendor retail x 8000 bps. Every source retail value is
  // a whole dollar amount (see matrices.ts), so this integer arithmetic is
  // always exact; Math.round is a defensive safety net, not a source of
  // rounding in practice.
  const retailCents = Math.round(retailDollars * 100);
  const dealerCostCents = Math.round((retailCents * DEALER_MULTIPLIER_BPS) / 10000);

  // 7. Attach any known source-data warning for this exact cell (e.g. the
  // Group E / H74 / W42 anomaly) — independent of which fabric landed here.
  const warnings = PRICE_ANOMALIES.filter(
    (anomaly) => anomaly.priceGroup === fabric.priceGroup && anomaly.widthTier === widthTier && anomaly.heightTier === heightTier
  ).map((anomaly) => anomaly.warning);

  return {
    pricingEngineVersion: MATRIX_PRICING_ENGINE_VERSION,
    status: "SUCCESS",
    sourceFabricName: input.fabricSourceName,
    normalizedFabricName: normalizeFabricName(input.fabricSourceName),
    actualWidth: input.width,
    actualHeight: input.height,
    productType: fabric.productType,
    priceGroup: fabric.priceGroup,
    selectedWidthTier: widthTier,
    selectedHeightTier: heightTier,
    retailCents,
    retailDollars: retailCents / 100,
    dealerMultiplierBps: DEALER_MULTIPLIER_BPS,
    dealerCostCents,
    dealerCostDollars: dealerCostCents / 100,
    warnings,
    message: null,
  };
}

/**
 * Prices one Roller Shade / Neolux matrix line item against the real,
 * locked, verified catalog and matrices. This is the function every
 * non-test caller should use.
 */
export function priceMatrixItem(input: MatrixPriceInput): MatrixPriceResult {
  return priceMatrixItemWithDependencies(input, DEFAULT_DEPENDENCIES);
}
