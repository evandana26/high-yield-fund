import {
  INP,
  CLIENTS,
  REDEMPTIONS,
  type Client,
  type FundInputs,
  type PayStatus,
  type Redemption,
} from "./data";

const pendingRedemptionStatuses = ["requested", "reviewed", "approved", "scheduled"];

export type StructureResult = {
  portMV: number;
  grossAssets: number;
  brokerEquity: number;
  maintRequired: number;
  marginDeficit: number;
  excessLiq: number;
};

export type LiabilitiesResult = {
  totalPrincipal: number;
  annualInterest: number;
  monthlyAccrued: number;
  clientLiabilities: number;
  /** @deprecated Fixed-yield account holders are clients. Use clientLiabilities. */
  investorLiabilities: number;
};

export type CoverageResult = {
  netBeforeInv: number;
  sponsorEquity: number;
  tacr: number;
  invCov: number;
  distToImpair: number;
};

export type IncomeResult = {
  totalInc: number;
  cashInc: number;
  econInc: number;
  netCash: number;
  netEcon: number;
  cashICR: number;
  econICR: number;
  excessSpread: number;
  monthlyExcess: number;
  monthlyInvInt: number;
  monthlyMargInt: number;
  monthlyOpex: number;
};

export type WireStatus = "ok" | "warn" | "alert";

export type MorningWireParams = {
  strcDrop?: number;
  sataDrop?: number;
  maintOverride?: number;
  redemptionOverride?: number;
  sponsorLiqOverride?: number;
  payStatusOverride?: PayStatus;
  inputs?: FundInputs;
  clients?: Client[];
  /** @deprecated Fixed-yield account holders are now clients. Use clients. */
  investors?: Client[];
  redemptions?: Redemption[];
  taxLots?: TaxLot[];
  taxDistributions?: TaxDistribution[];
  taxSales?: TaxSale[];
  financingInstruments?: FinancingInstrument[];
  taxWaterfallConfig?: TaxWaterfallConfig;
  taxYear?: number;
};

export type TaxCapitalBucket =
  | "sponsorInvestmentCapital"
  | "outsideInvestors"
  | "customerDeposits";

export type TaxDistributionClassification =
  | "taxableDividend"
  | "returnOfCapital"
  | "interestIncome";

export type TaxLot = {
  id: string;
  assetSymbol: string;
  acquiredDate: string;
  originalCost: number;
  quantity: number;
  capitalBucket: TaxCapitalBucket;
};

export type TaxDistribution = {
  id: string;
  lotId: string;
  date: string;
  amount: number;
  classification: TaxDistributionClassification;
  capitalBucket?: TaxCapitalBucket;
};

export type TaxSale = {
  id: string;
  lotId: string;
  date: string;
  quantity: number;
  proceeds: number;
  capitalBucket?: TaxCapitalBucket;
};

export type FinancingInstrument = {
  id: string;
  type: "margin" | "boxSpread";
  principal: number;
  annualRate: number;
  startDate: string;
  endDate?: string;
  capitalBucket: TaxCapitalBucket;
};

export type TaxWaterfallConfig = {
  outsideInvestorShare: number;
};

export type AdjustedTaxLot = TaxLot & {
  adjustedBasis: number;
  remainingQuantity: number;
  rocApplied: number;
};

export type RocCapitalGain = {
  distributionId: string;
  lotId: string;
  assetSymbol: string;
  date: string;
  amount: number;
  term: "shortTerm" | "longTerm";
  capitalBucket: TaxCapitalBucket;
};

export type RealizedGainLoss = {
  saleId: string;
  lotId: string;
  assetSymbol: string;
  date: string;
  quantitySold: number;
  proceeds: number;
  adjustedBasisUsed: number;
  gainLoss: number;
  term: "shortTerm" | "longTerm";
  capitalBucket: TaxCapitalBucket;
};

export type FinancingAccrual = {
  instrumentId: string;
  type: FinancingInstrument["type"];
  principal: number;
  annualRate: number;
  daysAccrued: number;
  dailyAccrual: number;
  monthlyEstimate: number;
  annualEstimate: number;
  ytdAccrued: number;
  capitalBucket: TaxCapitalBucket;
};

export type TaxWaterfallAllocation = {
  sponsorInvestmentCapital: number;
  outsideInvestors: number;
  customerDeposits: number;
  isolatedCustomerDeposits: number;
};

export type TaxWaterfallAttribute = {
  attribute: "taxableDividends" | "rocCapitalGains" | "interestOffsets";
  sourceAmount: number;
  allocation: TaxWaterfallAllocation;
};

export type CpaExportRow = {
  section: string;
  lineItem: string;
  amount: number;
  bucket: keyof TaxWaterfallAllocation | "fund";
  notes: string;
};

export type TaxSummary = {
  adjustedCostBasis: {
    lots: AdjustedTaxLot[];
    rocApplied: number;
    rocCapitalGains: RocCapitalGain[];
  };
  realizedGainLoss: {
    events: RealizedGainLoss[];
    shortTerm: number;
    longTerm: number;
    net: number;
  };
  leverageTracking: {
    accruals: FinancingAccrual[];
    dailyMarginInterest: number;
    monthlyFinancingCosts: number;
    annualFinancingCosts: number;
    ytdFinancingCosts: number;
    blendedFinancingCost: number;
    byCapitalBucket: Record<TaxCapitalBucket, number>;
  };
  taxWaterfall: {
    taxableDividends: TaxWaterfallAttribute;
    rocCapitalGains: TaxWaterfallAttribute;
    interestOffsets: TaxWaterfallAttribute;
  };
  netTaxableIncome: number;
  ytdFinancingCosts: number;
  cpaExportMatrix: () => CpaExportRow[];
};

export type MorningWireResult = StructureResult &
  LiabilitiesResult &
  CoverageResult & {
    strcMV: number;
    sataMV: number;
    strcDrop: number;
    sataDrop: number;
    maintOver: number;
    redemptionNeed: number;
    sponsorLiq: number;
    psOver: PayStatus;
    marginCureSponsor: number;
    marginCureForced: number;
    cashUsedForRed: number;
    borrowUsedForRed: number;
    sponsorUsedForRed: number;
    forcedSaleForRed: number;
    totalSponsorWire: number;
    totalForcedSale: number;
    remainingLiq: number;
    wireStatus: WireStatus;
    sponsorWire: number;
    forcedSale: number;
    exLiqUsed: number;
    postBrokerCash: number;
    postMarginDebt: number;
    postPortMV: number;
    postGrossAssets: number;
    postBrokerEquity: number;
    postMaintReq: number;
    postExcessLiq: number;
    postPrincipal: number;
    postInvCov: number;
    postTACR: number;
    postSponsorEquity: number;
    postDistToImpair: number;
    inc: IncomeResult;
    dropToCall: number;
    dropToImpair: number;
    deferralRunway: number;
    sponsorRecovery: number;
    interestShortfall: number;
    excessLiqAfterCure: number;
    cashSafeForRed: number;
    borrowCapacity: number;
    tax_summary: TaxSummary;
  };

export function getPendingRedemptionTotal(redemptions: Redemption[] = REDEMPTIONS) {
  return redemptions
    .filter((redemption) => pendingRedemptionStatuses.includes(redemption.status))
    .reduce((sum, redemption) => sum + redemption.amount, 0);
}

export function eng_structure(
  strcMV: number,
  sataMV: number,
  brokerCash: number,
  marginDebt: number,
  maintPct: number,
): StructureResult {
  const portMV = strcMV + sataMV;
  const grossAssets = portMV + brokerCash;
  const brokerEquity = grossAssets - marginDebt;
  const maintRequired = portMV * maintPct;
  const marginDeficit = Math.max(0, maintRequired - brokerEquity);
  const excessLiq = Math.max(0, brokerEquity - maintRequired);

  return { portMV, grossAssets, brokerEquity, maintRequired, marginDeficit, excessLiq };
}

export function eng_liabilities(
  principalOverride: number | null = null,
  clients: Client[] = CLIENTS,
): LiabilitiesResult {
  const basePrincipal = clients.reduce((sum, client) => sum + client.principal, 0);
  const totalPrincipal = principalOverride ?? basePrincipal;
  const baseAnnualInterest = clients.reduce(
    (sum, client) => sum + client.principal * client.rate,
    0,
  );
  const annualInterest =
    principalOverride != null && basePrincipal > 0
      ? baseAnnualInterest * (principalOverride / basePrincipal)
      : baseAnnualInterest;
  const monthlyAccrued = annualInterest / 12;
  const clientLiabilities = totalPrincipal + monthlyAccrued;

  return {
    totalPrincipal,
    annualInterest,
    monthlyAccrued,
    clientLiabilities,
    investorLiabilities: clientLiabilities,
  };
}

export function eng_coverage(
  grossAssets: number,
  marginDebt: number,
  brokerEquity: number,
  clientLiabilities: number,
  portMV: number,
): CoverageResult {
  const netBeforeInv = brokerEquity;
  const sponsorEquity = netBeforeInv - clientLiabilities;
  const tacr =
    marginDebt + clientLiabilities > 0 ? grossAssets / (marginDebt + clientLiabilities) : 99;
  const invCov = clientLiabilities > 0 ? netBeforeInv / clientLiabilities : 99;
  const distToImpair = portMV > 0 ? sponsorEquity / portMV : 0;

  return { netBeforeInv, sponsorEquity, tacr, invCov, distToImpair };
}

export function eng_income(
  strcInc: number,
  sataInc: number,
  margInt: number,
  opex: number,
  invIntAnn: number,
  payStatus: PayStatus,
  impairRecov = 0.25,
): IncomeResult {
  const totalInc = strcInc + sataInc;
  let cashInc: number;
  let econInc: number;

  if (payStatus === "paying") {
    cashInc = totalInc;
    econInc = totalInc;
  } else if (payStatus === "deferred") {
    cashInc = 0;
    econInc = totalInc;
  } else {
    cashInc = 0;
    econInc = totalInc * impairRecov;
  }

  const netCash = cashInc - margInt - opex;
  const netEcon = econInc - margInt - opex;
  const cashICR = invIntAnn > 0 ? netCash / invIntAnn : 0;
  const econICR = invIntAnn > 0 ? netEcon / invIntAnn : 0;
  const excessSpread = netCash - invIntAnn;
  const monthlyExcess = excessSpread / 12;
  const monthlyInvInt = invIntAnn / 12;
  const monthlyMargInt = margInt / 12;
  const monthlyOpex = opex / 12;

  return {
    totalInc,
    cashInc,
    econInc,
    netCash,
    netEcon,
    cashICR,
    econICR,
    excessSpread,
    monthlyExcess,
    monthlyInvInt,
    monthlyMargInt,
    monthlyOpex,
  };
}

function daysBetween(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`).getTime();
  const end = new Date(`${endDate}T00:00:00`).getTime();

  return Math.max(0, Math.floor((end - start) / 86_400_000));
}

function isLongTerm(acquiredDate: string, dispositionDate: string) {
  return daysBetween(acquiredDate, dispositionDate) > 365;
}

function getYearStart(year: number) {
  return `${year}-01-01`;
}

function normalizePct(value: number) {
  const decimalValue = value > 1 ? value / 100 : value;

  return Math.min(1, Math.max(0, decimalValue));
}

function getTaxWaterfallConfig(inputs: FundInputs, override?: TaxWaterfallConfig): TaxWaterfallConfig {
  return {
    outsideInvestorShare:
      override?.outsideInvestorShare ?? normalizePct(inputs.investorSplitPct.v),
  };
}

function toIsoDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function getDefaultTaxLots(inputs: FundInputs): TaxLot[] {
  const today = toIsoDate(new Date());

  return [
    {
      id: "lot-strc",
      assetSymbol: "STRC",
      acquiredDate: today,
      originalCost: inputs.strcMV.v,
      quantity: 1,
      capitalBucket: "outsideInvestors",
    },
    {
      id: "lot-sata",
      assetSymbol: "SATA",
      acquiredDate: today,
      originalCost: inputs.sataMV.v,
      quantity: 1,
      capitalBucket: "outsideInvestors",
    },
  ];
}

function getDefaultTaxDistributions(inputs: FundInputs): TaxDistribution[] {
  const today = toIsoDate(new Date());

  return [
    {
      id: "dist-strc-taxable-income",
      lotId: "lot-strc",
      date: today,
      amount: inputs.strcInc.v,
      classification: "taxableDividend",
      capitalBucket: "outsideInvestors",
    },
    {
      id: "dist-sata-taxable-income",
      lotId: "lot-sata",
      date: today,
      amount: inputs.sataInc.v,
      classification: "taxableDividend",
      capitalBucket: "outsideInvestors",
    },
  ];
}

function getDefaultFinancingInstruments(inputs: FundInputs, taxYear: number): FinancingInstrument[] {
  return [
    {
      id: "margin-debt",
      type: "margin",
      principal: inputs.marginDebt.v,
      annualRate: inputs.marginDebt.v > 0 ? inputs.margIntAnn.v / inputs.marginDebt.v : 0,
      startDate: getYearStart(taxYear),
      capitalBucket: "outsideInvestors",
    },
  ];
}

function zeroTaxWaterfallAllocation(): TaxWaterfallAllocation {
  return {
    sponsorInvestmentCapital: 0,
    outsideInvestors: 0,
    customerDeposits: 0,
    isolatedCustomerDeposits: 0,
  };
}

function addTaxWaterfallAllocation(
  target: TaxWaterfallAllocation,
  addition: TaxWaterfallAllocation,
) {
  target.sponsorInvestmentCapital += addition.sponsorInvestmentCapital;
  target.outsideInvestors += addition.outsideInvestors;
  target.customerDeposits += addition.customerDeposits;
  target.isolatedCustomerDeposits += addition.isolatedCustomerDeposits;
}

function allocateTaxAttribute(
  amount: number,
  capitalBucket: TaxCapitalBucket,
  config: TaxWaterfallConfig,
): TaxWaterfallAllocation {
  if (capitalBucket === "customerDeposits") {
    return {
      sponsorInvestmentCapital: 0,
      outsideInvestors: 0,
      customerDeposits: 0,
      isolatedCustomerDeposits: amount,
    };
  }

  if (capitalBucket === "sponsorInvestmentCapital") {
    return {
      sponsorInvestmentCapital: amount,
      outsideInvestors: 0,
      customerDeposits: 0,
      isolatedCustomerDeposits: 0,
    };
  }

  const outsideInvestorShare = normalizePct(config.outsideInvestorShare);
  const sponsorResidualShare = 1 - outsideInvestorShare;

  return {
    sponsorInvestmentCapital: amount * sponsorResidualShare,
    outsideInvestors: amount * outsideInvestorShare,
    customerDeposits: 0,
    isolatedCustomerDeposits: 0,
  };
}

export function calculateAdjustedCostBasis(
  taxLots: TaxLot[],
  taxDistributions: TaxDistribution[],
  taxSales: TaxSale[] = [],
) {
  const lotStates = new Map(
    taxLots.map((lot) => [
      lot.id,
      {
        ...lot,
        adjustedBasis: lot.originalCost,
        remainingQuantity: lot.quantity,
        rocApplied: 0,
      },
    ]),
  );
  const rocCapitalGains: RocCapitalGain[] = [];
  const realizedEvents: RealizedGainLoss[] = [];
  const events = [
    ...taxDistributions.map((distribution) => ({
      kind: "distribution" as const,
      date: distribution.date,
      value: distribution,
    })),
    ...taxSales.map((sale) => ({
      kind: "sale" as const,
      date: sale.date,
      value: sale,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  events.forEach((event) => {
    if (event.kind === "distribution") {
      const distribution = event.value;
      const lot = lotStates.get(distribution.lotId);

      if (!lot || distribution.classification !== "returnOfCapital") {
        return;
      }

      const basisReduction = Math.min(lot.adjustedBasis, distribution.amount);
      const excessRoc = distribution.amount - basisReduction;

      lot.adjustedBasis -= basisReduction;
      lot.rocApplied += basisReduction;

      if (excessRoc > 0) {
        rocCapitalGains.push({
          distributionId: distribution.id,
          lotId: lot.id,
          assetSymbol: lot.assetSymbol,
          date: distribution.date,
          amount: excessRoc,
          term: isLongTerm(lot.acquiredDate, distribution.date) ? "longTerm" : "shortTerm",
          capitalBucket: distribution.capitalBucket ?? lot.capitalBucket,
        });
      }

      return;
    }

    const sale = event.value;
    const lot = lotStates.get(sale.lotId);

    if (!lot || lot.remainingQuantity <= 0) {
      return;
    }

    const quantitySold = Math.min(sale.quantity, lot.remainingQuantity);
    const saleRatio = quantitySold / lot.remainingQuantity;
    const adjustedBasisUsed = lot.adjustedBasis * saleRatio;
    const proceeds = sale.proceeds * (quantitySold / sale.quantity);

    lot.remainingQuantity -= quantitySold;
    lot.adjustedBasis -= adjustedBasisUsed;
    realizedEvents.push({
      saleId: sale.id,
      lotId: lot.id,
      assetSymbol: lot.assetSymbol,
      date: sale.date,
      quantitySold,
      proceeds,
      adjustedBasisUsed,
      gainLoss: proceeds - adjustedBasisUsed,
      term: isLongTerm(lot.acquiredDate, sale.date) ? "longTerm" : "shortTerm",
      capitalBucket: sale.capitalBucket ?? lot.capitalBucket,
    });
  });

  return {
    lots: Array.from(lotStates.values()),
    rocApplied: Array.from(lotStates.values()).reduce((sum, lot) => sum + lot.rocApplied, 0),
    rocCapitalGains,
    realizedEvents,
  };
}

export function calculateLeverageTracking(
  financingInstruments: FinancingInstrument[],
  taxYear = new Date().getFullYear(),
) {
  const today = toIsoDate(new Date());
  const yearStart = getYearStart(taxYear);
  const accruals = financingInstruments.map((instrument) => {
    const accrualStart = instrument.startDate > yearStart ? instrument.startDate : yearStart;
    const accrualEnd = instrument.endDate && instrument.endDate < today ? instrument.endDate : today;
    const daysAccrued = daysBetween(accrualStart, accrualEnd) + 1;
    const dailyAccrual = (instrument.principal * instrument.annualRate) / 365;
    const ytdAccrued = dailyAccrual * daysAccrued;

    return {
      instrumentId: instrument.id,
      type: instrument.type,
      principal: instrument.principal,
      annualRate: instrument.annualRate,
      daysAccrued,
      dailyAccrual,
      monthlyEstimate: dailyAccrual * 30,
      annualEstimate: instrument.principal * instrument.annualRate,
      ytdAccrued,
      capitalBucket: instrument.capitalBucket,
    };
  });
  const totalPrincipal = accruals.reduce((sum, accrual) => sum + accrual.principal, 0);
  const annualFinancingCosts = accruals.reduce((sum, accrual) => sum + accrual.annualEstimate, 0);
  const byCapitalBucket: Record<TaxCapitalBucket, number> = {
    sponsorInvestmentCapital: 0,
    outsideInvestors: 0,
    customerDeposits: 0,
  };

  accruals.forEach((accrual) => {
    byCapitalBucket[accrual.capitalBucket] += accrual.ytdAccrued;
  });

  return {
    accruals,
    dailyMarginInterest: accruals
      .filter((accrual) => accrual.type === "margin")
      .reduce((sum, accrual) => sum + accrual.dailyAccrual, 0),
    monthlyFinancingCosts: accruals.reduce((sum, accrual) => sum + accrual.monthlyEstimate, 0),
    annualFinancingCosts,
    ytdFinancingCosts: accruals.reduce((sum, accrual) => sum + accrual.ytdAccrued, 0),
    blendedFinancingCost: totalPrincipal > 0 ? annualFinancingCosts / totalPrincipal : 0,
    byCapitalBucket,
  };
}

export function generateTaxSummary({
  inputs = INP,
  taxLots,
  taxDistributions,
  taxSales = [],
  financingInstruments,
  taxWaterfallConfig,
  taxYear = new Date().getFullYear(),
}: {
  inputs?: FundInputs;
  taxLots?: TaxLot[];
  taxDistributions?: TaxDistribution[];
  taxSales?: TaxSale[];
  financingInstruments?: FinancingInstrument[];
  taxWaterfallConfig?: TaxWaterfallConfig;
  taxYear?: number;
} = {}): TaxSummary {
  const effectiveTaxWaterfallConfig = getTaxWaterfallConfig(inputs, taxWaterfallConfig);
  const lots = taxLots ?? getDefaultTaxLots(inputs);
  const distributions = taxDistributions ?? getDefaultTaxDistributions(inputs);
  const financing = financingInstruments ?? getDefaultFinancingInstruments(inputs, taxYear);
  const basis = calculateAdjustedCostBasis(lots, distributions, taxSales);
  const leverageTracking = calculateLeverageTracking(financing, taxYear);
  const shortTerm = basis.realizedEvents
    .filter((event) => event.term === "shortTerm")
    .reduce((sum, event) => sum + event.gainLoss, 0);
  const longTerm = basis.realizedEvents
    .filter((event) => event.term === "longTerm")
    .reduce((sum, event) => sum + event.gainLoss, 0);
  const taxableDividendAllocation = zeroTaxWaterfallAllocation();
  const rocCapitalGainAllocation = zeroTaxWaterfallAllocation();
  const interestOffsetAllocation = zeroTaxWaterfallAllocation();
  const taxableDividends = distributions
    .filter((distribution) => distribution.classification === "taxableDividend")
    .reduce((sum, distribution) => {
      const lot = lots.find((item) => item.id === distribution.lotId);

      addTaxWaterfallAllocation(
        taxableDividendAllocation,
        allocateTaxAttribute(
          distribution.amount,
          distribution.capitalBucket ?? lot?.capitalBucket ?? "outsideInvestors",
          effectiveTaxWaterfallConfig,
        ),
      );

      return sum + distribution.amount;
    }, 0);
  const rocCapitalGains = basis.rocCapitalGains.reduce((sum, gain) => {
    addTaxWaterfallAllocation(
      rocCapitalGainAllocation,
      allocateTaxAttribute(gain.amount, gain.capitalBucket, effectiveTaxWaterfallConfig),
    );

    return sum + gain.amount;
  }, 0);

  leverageTracking.accruals.forEach((accrual) => {
    addTaxWaterfallAllocation(
      interestOffsetAllocation,
      allocateTaxAttribute(accrual.ytdAccrued, accrual.capitalBucket, effectiveTaxWaterfallConfig),
    );
  });

  const netRealizedGain = shortTerm + longTerm;
  const netTaxableIncome =
    taxableDividends + rocCapitalGains + netRealizedGain - leverageTracking.ytdFinancingCosts;

  return {
    adjustedCostBasis: {
      lots: basis.lots,
      rocApplied: basis.rocApplied,
      rocCapitalGains: basis.rocCapitalGains,
    },
    realizedGainLoss: {
      events: basis.realizedEvents,
      shortTerm,
      longTerm,
      net: netRealizedGain,
    },
    leverageTracking,
    taxWaterfall: {
      taxableDividends: {
        attribute: "taxableDividends",
        sourceAmount: taxableDividends,
        allocation: taxableDividendAllocation,
      },
      rocCapitalGains: {
        attribute: "rocCapitalGains",
        sourceAmount: rocCapitalGains,
        allocation: rocCapitalGainAllocation,
      },
      interestOffsets: {
        attribute: "interestOffsets",
        sourceAmount: leverageTracking.ytdFinancingCosts,
        allocation: interestOffsetAllocation,
      },
    },
    netTaxableIncome,
    ytdFinancingCosts: leverageTracking.ytdFinancingCosts,
    cpaExportMatrix: () => [
      {
        section: "Income",
        lineItem: "Taxable dividends",
        amount: taxableDividends,
        bucket: "fund",
        notes: "Estimated taxable dividends before K-1/1099 reconciliation.",
      },
      {
        section: "Basis",
        lineItem: "ROC capital gains after basis reaches zero",
        amount: rocCapitalGains,
        bucket: "fund",
        notes: "Placeholder CPA export row; final mapping depends on tax preparer format.",
      },
      {
        section: "Financing",
        lineItem: "YTD financing costs",
        amount: leverageTracking.ytdFinancingCosts,
        bucket: "fund",
        notes: "Includes margin and box spread accruals allocated by capital bucket.",
      },
      {
        section: "Taxable income",
        lineItem: "Estimated net taxable income",
        amount: netTaxableIncome,
        bucket: "fund",
        notes: "Preliminary estimate for review, not tax advice.",
      },
    ],
  };
}

export function eng_morningWire(params: MorningWireParams = {}): MorningWireResult {
  const inputs = params.inputs ?? INP;
  const clients = params.clients ?? params.investors ?? CLIENTS;
  const redemptions = params.redemptions ?? REDEMPTIONS;
  const strcDrop = params.strcDrop ?? 0;
  const sataDrop = params.sataDrop ?? 0;
  const maintOver = params.maintOverride ?? inputs.maintPct.v;
  const useSliderRed = params.redemptionOverride != null;
  const redemptionNeed = useSliderRed
    ? params.redemptionOverride ?? 0
    : getPendingRedemptionTotal(redemptions);
  const sponsorLiq = params.sponsorLiqOverride ?? inputs.sponsorLiq.v;
  const psOver = params.payStatusOverride ?? inputs.payStatus.v;

  const strcMV = inputs.strcMV.v * (1 - strcDrop);
  const sataMV = inputs.sataMV.v * (1 - sataDrop);
  const st = eng_structure(
    strcMV,
    sataMV,
    inputs.brokerCash.v,
    inputs.marginDebt.v,
    maintOver,
  );

  const marginDeficit = st.marginDeficit;
  const marginCureSponsor = Math.min(sponsorLiq, marginDeficit);
  const marginCureForced = Math.max(0, marginDeficit - marginCureSponsor);
  const sponsorLiqAfterMarginCure = sponsorLiq - marginCureSponsor;
  const excessLiqAfterCure =
    marginDeficit > 0 ? Math.max(0, st.excessLiq + marginCureSponsor) : st.excessLiq;

  const cashSafeForRed = Math.min(inputs.brokerCash.v, Math.max(0, excessLiqAfterCure));
  const cashUsedForRed = Math.min(cashSafeForRed, redemptionNeed);
  let redRemaining = redemptionNeed - cashUsedForRed;

  const borrowCapacity = Math.max(0, excessLiqAfterCure - cashUsedForRed);
  const borrowUsedForRed = Math.min(borrowCapacity, redRemaining);
  redRemaining -= borrowUsedForRed;

  const sponsorUsedForRed = Math.min(sponsorLiqAfterMarginCure, redRemaining);
  redRemaining -= sponsorUsedForRed;

  const forcedSaleForRed = Math.max(0, redRemaining);
  const totalSponsorWire = marginCureSponsor + sponsorUsedForRed;
  const totalForcedSale = marginCureForced + forcedSaleForRed;
  const remainingLiq = sponsorLiq - totalSponsorWire;
  const wireStatus: WireStatus =
    totalForcedSale > 0 ? "alert" : totalSponsorWire > 0 ? "warn" : "ok";

  const postBrokerCash = inputs.brokerCash.v + marginCureSponsor - cashUsedForRed;
  const postMarginDebt = inputs.marginDebt.v + borrowUsedForRed;
  const postPortMV = strcMV + sataMV;
  const postBrokerEquity = postPortMV + postBrokerCash - postMarginDebt;
  const postMaintReq = postPortMV * maintOver;
  const postExcessLiq = postBrokerEquity - postMaintReq;
  const postGrossAssets = postPortMV + postBrokerCash;

  const liab = eng_liabilities(null, clients);
  const postPrincipal = Math.max(0, liab.totalPrincipal - (useSliderRed ? redemptionNeed : 0));
  const postLibs = eng_liabilities(postPrincipal, clients);
  const cov = eng_coverage(
    st.grossAssets,
    inputs.marginDebt.v,
    st.brokerEquity,
    liab.clientLiabilities,
    st.portMV,
  );
  const postCov = eng_coverage(
    postGrossAssets,
    postMarginDebt,
    postBrokerEquity,
    postLibs.clientLiabilities,
    postPortMV,
  );
  const inc = eng_income(
    inputs.strcInc.v,
    inputs.sataInc.v,
    inputs.margIntAnn.v,
    inputs.opexAnn.v,
    liab.annualInterest,
    psOver,
    inputs.impairRecov.v,
  );

  const curPortMV = inputs.strcMV.v + inputs.sataMV.v;
  const curBrokerEq = curPortMV + inputs.brokerCash.v - inputs.marginDebt.v;
  const curMaintReq = curPortMV * maintOver;
  const dropToCall =
    curPortMV > 0 ? Math.max(0, (curBrokerEq - curMaintReq) / (curPortMV * (1 - maintOver))) : 0;
  const dropToImpair = st.portMV > 0 ? Math.max(0, cov.sponsorEquity / st.portMV) : 0;
  const monthlyObligations = inc.monthlyMargInt + inc.monthlyOpex + inc.monthlyInvInt;
  const totalCashAvailable = inputs.brokerCash.v + inputs.sponsorLiq.v;
  const deferralRunway = monthlyObligations > 0 ? totalCashAvailable / monthlyObligations : 99;
  const sponsorRecovery =
    totalSponsorWire > 0 && inc.monthlyExcess > 0
      ? Math.ceil(totalSponsorWire / inc.monthlyExcess)
      : 0;
  const interestShortfall = Math.max(0, -inc.netCash);
  const tax_summary = generateTaxSummary({
    inputs,
    taxLots: params.taxLots,
    taxDistributions: params.taxDistributions,
    taxSales: params.taxSales,
    financingInstruments: params.financingInstruments,
    taxWaterfallConfig: params.taxWaterfallConfig,
    taxYear: params.taxYear,
  });

  return {
    strcMV,
    sataMV,
    strcDrop,
    sataDrop,
    maintOver,
    redemptionNeed,
    sponsorLiq,
    psOver,
    ...st,
    ...liab,
    ...cov,
    marginDeficit,
    marginCureSponsor,
    marginCureForced,
    cashUsedForRed,
    borrowUsedForRed,
    sponsorUsedForRed,
    forcedSaleForRed,
    totalSponsorWire,
    totalForcedSale,
    remainingLiq,
    wireStatus,
    sponsorWire: totalSponsorWire,
    forcedSale: totalForcedSale,
    exLiqUsed: cashUsedForRed + borrowUsedForRed,
    postBrokerCash,
    postMarginDebt,
    postPortMV,
    postGrossAssets,
    postBrokerEquity,
    postMaintReq,
    postExcessLiq,
    postPrincipal,
    postInvCov: postCov.invCov,
    postTACR: postCov.tacr,
    postSponsorEquity: postCov.sponsorEquity,
    postDistToImpair: postCov.distToImpair,
    inc,
    dropToCall,
    dropToImpair,
    deferralRunway,
    sponsorRecovery,
    interestShortfall,
    excessLiqAfterCure,
    cashSafeForRed,
    borrowCapacity,
    tax_summary,
  };
}
