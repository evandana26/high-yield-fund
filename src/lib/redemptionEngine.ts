import { INP, type FundInputs } from "./data";
import {
  calculateAdjustedCostBasis,
  eng_structure,
  type AdjustedTaxLot,
  type TaxDistribution,
  type TaxLot,
} from "./engine";

export type RedemptionRiskRating = "Safe" | "Warning" | "Critical";

export type RedemptionAssetSymbol = "STRC" | "SATA" | (string & {});

export type RedemptionLot = TaxLot & {
  assetSymbol: RedemptionAssetSymbol;
  marketValue: number;
  currentYield: number;
  expectedSaleDiscountPct?: number;
};

export type RedemptionFundState = {
  inputs?: FundInputs;
  taxLots?: RedemptionLot[];
  taxDistributions?: TaxDistribution[];
  asOfDate?: string;
  targetReserveRatio?: number;
  marginRateOverride?: number;
  maxSafeLeverageRatio?: number;
  maxWarningLeverageRatio?: number;
  sponsorBackstopAvailable?: number;
  shortTermTaxRate?: number;
  longTermTaxRate?: number;
};

export type CashRedemptionOption = {
  path: "Cash";
  availableCashUsed: number;
  unfundedAmount: number;
  remainingReserve: number;
  reserveRatioBefore: number;
  reserveRatioAfter: number;
  reserveRatioImpact: number;
};

export type MarginRedemptionOption = {
  path: "Temporary Margin";
  marginAdded: number;
  newMarginDebt: number;
  newLeverageRatio: number;
  newMarginInterestCost: number;
  incrementalAnnualInterestCost: number;
  newLiquidationBuffer: number;
  riskRating: RedemptionRiskRating;
};

export type LotSaleSelection = {
  lotId: string;
  assetSymbol: string;
  quantityToSell: number;
  estimatedProceeds: number;
  adjustedBasisUsed: number;
  realizedGainLoss: number;
  term: "shortTerm" | "longTerm";
  currentYield: number;
  yieldLost: number;
  score: number;
  rationale: string[];
};

export type TaxAwareLotSaleOption = {
  path: "Tax-Aware Lot Sale";
  lotsToSell: LotSaleSelection[];
  estimatedProceeds: number;
  realizedGainLoss: number;
  taxImpactEstimate: number;
  yieldLost: number;
  unfundedAmount: number;
};

export type SponsorBackstopOption = {
  path: "Sponsor Backstop";
  backstopCapitalUsed: number;
  unfundedAmount: number;
  remainingBackstop: number;
  repayFromFutureDistributions: boolean;
};

export type RedemptionOptions = {
  optionA: CashRedemptionOption;
  optionB: MarginRedemptionOption;
  optionC: TaxAwareLotSaleOption;
  optionD: SponsorBackstopOption;
  recommendedAction: string;
};

const DAYS_TO_LONG_TERM = 365;
const NEAR_LONG_TERM_WINDOW_DAYS = 45;
const DEFAULT_SHORT_TERM_TAX_RATE = 0.37;
const DEFAULT_LONG_TERM_TAX_RATE = 0.20;
const DEFAULT_SAFE_LEVERAGE = 0.65;
const DEFAULT_WARNING_LEVERAGE = 0.75;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeDate(value?: string) {
  return value ?? new Date().toISOString().split("T")[0];
}

function daysBetween(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T12:00:00`).getTime();
  const end = new Date(`${endDate}T12:00:00`).getTime();

  return Math.max(0, Math.round((end - start) / 86_400_000));
}

function getDefaultLots(inputs: FundInputs): RedemptionLot[] {
  const today = normalizeDate();

  return [
    {
      id: "redemption-strc-core",
      assetSymbol: "STRC",
      acquiredDate: today,
      originalCost: inputs.strcMV.v,
      quantity: 1,
      capitalBucket: "outsideInvestors",
      marketValue: inputs.strcMV.v,
      currentYield: inputs.strcMV.v > 0 ? inputs.strcInc.v / inputs.strcMV.v : 0,
    },
    {
      id: "redemption-sata-core",
      assetSymbol: "SATA",
      acquiredDate: today,
      originalCost: inputs.sataMV.v,
      quantity: 1,
      capitalBucket: "outsideInvestors",
      marketValue: inputs.sataMV.v,
      currentYield: inputs.sataMV.v > 0 ? inputs.sataInc.v / inputs.sataMV.v : 0,
    },
  ];
}

function getAdjustedLotMap(
  taxLots: RedemptionLot[],
  taxDistributions: TaxDistribution[],
): Map<string, AdjustedTaxLot> {
  const adjusted = calculateAdjustedCostBasis(taxLots, taxDistributions);

  return new Map(adjusted.lots.map((lot) => [lot.id, lot]));
}

function calculateReserveRatio(cash: number, grossAssets: number) {
  return grossAssets > 0 ? cash / grossAssets : 0;
}

function rateForTerm(term: "shortTerm" | "longTerm", fundState: RedemptionFundState) {
  return term === "longTerm"
    ? fundState.longTermTaxRate ?? DEFAULT_LONG_TERM_TAX_RATE
    : fundState.shortTermTaxRate ?? DEFAULT_SHORT_TERM_TAX_RATE;
}

function scoreLotForSale({
  lot,
  adjustedLot,
  asOfDate,
}: {
  lot: RedemptionLot;
  adjustedLot: AdjustedTaxLot;
  asOfDate: string;
}) {
  const marketValue = Math.max(0, lot.marketValue);
  const remainingQuantity = Math.max(0, adjustedLot.remainingQuantity);
  const adjustedBasis = Math.max(0, adjustedLot.adjustedBasis);
  const unrealizedGainLoss = marketValue - adjustedBasis;
  const daysHeld = daysBetween(lot.acquiredDate, asOfDate);
  const daysUntilLongTerm = DAYS_TO_LONG_TERM - daysHeld;
  const nearLongTerm =
    daysUntilLongTerm > 0 && daysUntilLongTerm <= NEAR_LONG_TERM_WINDOW_DAYS;
  const lowAdjustedBasis = marketValue > 0 ? adjustedBasis / marketValue < 0.35 : false;
  const highGain = marketValue > 0 ? unrealizedGainLoss / marketValue > 0.25 : false;
  const rationale: string[] = [];
  let score = 0;

  if (unrealizedGainLoss < 0) {
    score -= 1_000 + Math.abs(unrealizedGainLoss) / Math.max(1, marketValue);
    rationale.push("Harvests realized loss");
  } else {
    score += unrealizedGainLoss / Math.max(1, marketValue);
    rationale.push("Creates taxable gain");
  }

  if (nearLongTerm) {
    score += 500;
    rationale.push("Near long-term holding period");
  }

  if (lowAdjustedBasis && highGain) {
    score += 350;
    rationale.push("Low ROC-adjusted basis / high gain lot");
  }

  score += lot.currentYield * 100;
  rationale.push(`Yield preservation score ${lot.currentYield.toFixed(4)}`);

  if (remainingQuantity <= 0 || marketValue <= 0) {
    score += 10_000;
    rationale.push("No sellable quantity or market value");
  }

  return { score, rationale, unrealizedGainLoss, daysHeld };
}

function calculateTaxAwareLotSale(
  withdrawalAmount: number,
  fundState: RedemptionFundState,
): TaxAwareLotSaleOption {
  const inputs = fundState.inputs ?? INP;
  const asOfDate = normalizeDate(fundState.asOfDate);
  const taxLots = fundState.taxLots ?? getDefaultLots(inputs);
  const taxDistributions = fundState.taxDistributions ?? [];
  const adjustedLots = getAdjustedLotMap(taxLots, taxDistributions);
  let remainingNeed = withdrawalAmount;
  const lotsToSell: LotSaleSelection[] = [];

  const saleCandidates = taxLots
    .map((lot) => {
      const adjustedLot = adjustedLots.get(lot.id);

      if (!adjustedLot) {
        return null;
      }

      return {
        lot,
        adjustedLot,
        ...scoreLotForSale({ lot, adjustedLot, asOfDate }),
      };
    })
    .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate))
    .sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score;
      }

      return a.lot.currentYield - b.lot.currentYield;
    });

  saleCandidates.forEach(({ lot, adjustedLot, score, rationale }) => {
    if (remainingNeed <= 0 || lot.marketValue <= 0 || adjustedLot.remainingQuantity <= 0) {
      return;
    }

    const saleDiscount = clamp(lot.expectedSaleDiscountPct ?? 0, 0, 0.5);
    const netMarketValue = lot.marketValue * (1 - saleDiscount);
    const saleProceeds = Math.min(remainingNeed, netMarketValue);
    const saleRatio = saleProceeds / netMarketValue;
    const quantityToSell = adjustedLot.remainingQuantity * saleRatio;
    const adjustedBasisUsed = adjustedLot.adjustedBasis * saleRatio;
    const realizedGainLoss = saleProceeds - adjustedBasisUsed;
    const term = daysBetween(lot.acquiredDate, asOfDate) > DAYS_TO_LONG_TERM ? "longTerm" : "shortTerm";
    const yieldLost = saleProceeds * lot.currentYield;

    lotsToSell.push({
      lotId: lot.id,
      assetSymbol: lot.assetSymbol,
      quantityToSell,
      estimatedProceeds: saleProceeds,
      adjustedBasisUsed,
      realizedGainLoss,
      term,
      currentYield: lot.currentYield,
      yieldLost,
      score,
      rationale,
    });

    remainingNeed -= saleProceeds;
  });

  const estimatedProceeds = lotsToSell.reduce((sum, sale) => sum + sale.estimatedProceeds, 0);
  const realizedGainLoss = lotsToSell.reduce((sum, sale) => sum + sale.realizedGainLoss, 0);
  const taxImpactEstimate = lotsToSell.reduce(
    (sum, sale) => sum + Math.max(0, sale.realizedGainLoss) * rateForTerm(sale.term, fundState),
    0,
  );
  const yieldLost = lotsToSell.reduce((sum, sale) => sum + sale.yieldLost, 0);

  return {
    path: "Tax-Aware Lot Sale",
    lotsToSell,
    estimatedProceeds,
    realizedGainLoss,
    taxImpactEstimate,
    yieldLost,
    unfundedAmount: Math.max(0, remainingNeed),
  };
}

function rateMarginRisk(leverageRatio: number, liquidationBuffer: number, fundState: RedemptionFundState) {
  const safeLeverage = fundState.maxSafeLeverageRatio ?? DEFAULT_SAFE_LEVERAGE;
  const warningLeverage = fundState.maxWarningLeverageRatio ?? DEFAULT_WARNING_LEVERAGE;

  if (leverageRatio <= safeLeverage && liquidationBuffer > 0) {
    return "Safe";
  }

  if (leverageRatio <= warningLeverage && liquidationBuffer >= 0) {
    return "Warning";
  }

  return "Critical";
}

function chooseRecommendedAction({
  optionA,
  optionB,
  optionC,
  optionD,
}: {
  optionA: CashRedemptionOption;
  optionB: MarginRedemptionOption;
  optionC: TaxAwareLotSaleOption;
  optionD: SponsorBackstopOption;
}) {
  if (optionA.unfundedAmount === 0 && optionA.reserveRatioAfter >= 0) {
    return "Use available cash; it fully funds the withdrawal without added leverage or taxable sales.";
  }

  if (
    optionC.unfundedAmount === 0 &&
    optionC.taxImpactEstimate <= optionB.incrementalAnnualInterestCost &&
    optionC.realizedGainLoss <= 0
  ) {
    return "Sell tax-selected lots; the algorithm can fund the withdrawal while harvesting losses and avoiding incremental margin cost.";
  }

  if (optionB.riskRating === "Safe") {
    return "Use temporary margin and repay from near-term distributions; this preserves tax lots while keeping leverage inside the safe range.";
  }

  if (optionD.unfundedAmount === 0) {
    return "Use the sponsor backstop; it avoids distressed sales and should be flagged for repayment from future distributions.";
  }

  if (optionC.unfundedAmount === 0) {
    return "Use tax-aware lot sales; margin/backstop capacity is constrained, so fund the withdrawal with the lowest-scoring sale basket.";
  }

  return "Escalate for manual approval; no single path fully funds the withdrawal within current liquidity, leverage, and backstop limits.";
}

export function calculateRedemptionOptions(
  withdrawalAmount: number,
  fundState: RedemptionFundState = {},
): RedemptionOptions {
  const inputs = fundState.inputs ?? INP;
  const amount = Math.max(0, withdrawalAmount);
  const structure = eng_structure(
    inputs.strcMV.v,
    inputs.sataMV.v,
    inputs.brokerCash.v,
    inputs.marginDebt.v,
    inputs.maintPct.v,
  );
  const portfolioMarketValue = structure.portMV;
  const grossAssets = structure.grossAssets;
  const availableCash = Math.max(0, inputs.brokerCash.v);
  const cashUsed = Math.min(amount, availableCash);
  const remainingReserve = availableCash - cashUsed;
  const reserveRatioBefore = calculateReserveRatio(availableCash, grossAssets);
  const reserveRatioAfter = calculateReserveRatio(
    remainingReserve,
    Math.max(0, grossAssets - cashUsed),
  );
  const marginRate =
    fundState.marginRateOverride ??
    (inputs.marginDebt.v > 0 ? inputs.margIntAnn.v / inputs.marginDebt.v : 0);
  const marginAdded = amount;
  const newMarginDebt = inputs.marginDebt.v + marginAdded;
  const newLeverageRatio = portfolioMarketValue > 0 ? newMarginDebt / portfolioMarketValue : 0;
  const newMarginInterestCost = newMarginDebt * marginRate;
  const incrementalAnnualInterestCost = marginAdded * marginRate;
  const newBrokerEquity = grossAssets - newMarginDebt;
  const newLiquidationBuffer = newBrokerEquity - portfolioMarketValue * inputs.maintPct.v;
  const optionA: CashRedemptionOption = {
    path: "Cash",
    availableCashUsed: cashUsed,
    unfundedAmount: amount - cashUsed,
    remainingReserve,
    reserveRatioBefore,
    reserveRatioAfter,
    reserveRatioImpact: reserveRatioAfter - reserveRatioBefore,
  };
  const optionB: MarginRedemptionOption = {
    path: "Temporary Margin",
    marginAdded,
    newMarginDebt,
    newLeverageRatio,
    newMarginInterestCost,
    incrementalAnnualInterestCost,
    newLiquidationBuffer,
    riskRating: rateMarginRisk(newLeverageRatio, newLiquidationBuffer, fundState),
  };
  const optionC = calculateTaxAwareLotSale(amount, fundState);
  const backstopAvailable = fundState.sponsorBackstopAvailable ?? inputs.sponsorLiq.v;
  const backstopCapitalUsed = Math.min(amount, Math.max(0, backstopAvailable));
  const optionD: SponsorBackstopOption = {
    path: "Sponsor Backstop",
    backstopCapitalUsed,
    unfundedAmount: amount - backstopCapitalUsed,
    remainingBackstop: Math.max(0, backstopAvailable - backstopCapitalUsed),
    repayFromFutureDistributions: backstopCapitalUsed > 0,
  };

  return {
    optionA,
    optionB,
    optionC,
    optionD,
    recommendedAction: chooseRecommendedAction({ optionA, optionB, optionC, optionD }),
  };
}
