import {
  INP,
  INVESTORS,
  REDEMPTIONS,
  type FundInputs,
  type Investor,
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
  investors?: Investor[];
  redemptions?: Redemption[];
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
  investors: Investor[] = INVESTORS,
): LiabilitiesResult {
  const basePrincipal = investors.reduce((sum, investor) => sum + investor.principal, 0);
  const totalPrincipal = principalOverride ?? basePrincipal;
  const baseAnnualInterest = investors.reduce(
    (sum, investor) => sum + investor.principal * investor.rate,
    0,
  );
  const annualInterest =
    principalOverride != null && basePrincipal > 0
      ? baseAnnualInterest * (principalOverride / basePrincipal)
      : baseAnnualInterest;
  const monthlyAccrued = annualInterest / 12;
  const investorLiabilities = totalPrincipal + monthlyAccrued;

  return { totalPrincipal, annualInterest, monthlyAccrued, investorLiabilities };
}

export function eng_coverage(
  grossAssets: number,
  marginDebt: number,
  brokerEquity: number,
  investorLiabilities: number,
  portMV: number,
): CoverageResult {
  const netBeforeInv = brokerEquity;
  const sponsorEquity = netBeforeInv - investorLiabilities;
  const tacr =
    marginDebt + investorLiabilities > 0 ? grossAssets / (marginDebt + investorLiabilities) : 99;
  const invCov = investorLiabilities > 0 ? netBeforeInv / investorLiabilities : 99;
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

export function eng_morningWire(params: MorningWireParams = {}): MorningWireResult {
  const inputs = params.inputs ?? INP;
  const investors = params.investors ?? INVESTORS;
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

  const liab = eng_liabilities(null, investors);
  const postPrincipal = Math.max(0, liab.totalPrincipal - (useSliderRed ? redemptionNeed : 0));
  const postLibs = eng_liabilities(postPrincipal, investors);
  const cov = eng_coverage(
    st.grossAssets,
    inputs.marginDebt.v,
    st.brokerEquity,
    liab.investorLiabilities,
    st.portMV,
  );
  const postCov = eng_coverage(
    postGrossAssets,
    postMarginDebt,
    postBrokerEquity,
    postLibs.investorLiabilities,
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
  };
}
