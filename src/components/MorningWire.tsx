"use client";

import { fmt, fmts, fp, type FundInputs } from "@/src/lib/data";
import { eng_morningWire } from "@/src/lib/engine";

type MetricCardProps = {
  label: string;
  value: string;
  sub?: string;
  tone?: "success" | "warning" | "danger" | "info";
};

const metricTone = {
  success: "text-text-success",
  warning: "text-text-warning",
  danger: "text-text-danger",
  info: "text-text-info",
};

function MetricCard({ label, value, sub, tone }: MetricCardProps) {
  return (
    <div className="rounded-fund-md bg-surface-secondary p-3.5">
      <div className="mb-[3px] text-[10px] uppercase tracking-[.05em] text-text-secondary">
        {label}
      </div>
      <div className={`text-[19px] font-medium leading-[1.1] ${tone ? metricTone[tone] : ""}`}>
        {value}
      </div>
      {sub ? <div className="mt-[3px] text-[11px] text-text-secondary">{sub}</div> : null}
    </div>
  );
}

type MorningWireProps = {
  inputs: FundInputs;
};

export default function MorningWire({ inputs }: MorningWireProps) {
  const wire = eng_morningWire({ inputs });
  const grossYield = wire.inc.totalInc / wire.portMV;
  const managementFee = inputs.opexAnn.v / wire.portMV;
  const leverageCost = inputs.margIntAnn.v / wire.portMV;
  const netYield = wire.inc.netCash / wire.portMV;
  const spread = wire.inc.excessSpread / wire.portMV;
  const cashReserve = inputs.brokerCash.v + inputs.sponsorLiq.v;
  const investorSplit = Math.min(1, Math.max(0, inputs.investorSplitPct.v / 100));
  const sponsorRetainment = 1 - investorSplit;
  const taxableDividendAllocation = wire.tax_summary.taxWaterfall.taxableDividends.allocation;
  const financingOffsetAllocation = wire.tax_summary.taxWaterfall.interestOffsets.allocation;
  const outsideInvestorProjectedPayout =
    taxableDividendAllocation.outsideInvestors - financingOffsetAllocation.outsideInvestors;
  const sponsorProjectedRetainment =
    taxableDividendAllocation.sponsorInvestmentCapital -
    financingOffsetAllocation.sponsorInvestmentCapital;

  return (
    <section className="p-5">
      <div className="mb-[3px] text-lg font-medium">Morning Wire</div>
      <div className="mb-5 text-[13px] text-text-secondary">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </div>

      <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(118px,1fr))] gap-2">
        <MetricCard label="Gross Yield" value={fp(grossYield)} sub="STRC + SATA income" tone="success" />
        <MetricCard label="Mgmt Fee" value={`(${fp(managementFee)})`} sub="Annual operating expenses" tone="danger" />
        <MetricCard label="Leverage Cost" value={`(${fp(leverageCost)})`} sub="Annual margin interest" tone="danger" />
        <MetricCard label="Net Yield" value={fp(netYield)} sub="After financing and opex" tone={netYield >= 0 ? "success" : "danger"} />
        <MetricCard label="Spread" value={fp(spread)} sub="After client fixed-yield interest" tone={spread >= 0 ? "success" : "danger"} />
        <MetricCard label="Cash/Reserve" value={fmt(cashReserve)} sub="Broker cash + sponsor liquidity" tone="info" />
      </div>

      <div className="mb-2 border-b border-border-subtle pb-1.5 text-[10px] font-bold uppercase tracking-[.07em] text-text-secondary">
        Capital waterfall
      </div>
      <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(118px,1fr))] gap-2">
        <MetricCard
          label="Investor Split"
          value={fp(investorSplit)}
          sub="Investor Capital"
          tone="info"
        />
        <MetricCard
          label="Sponsor Retainment"
          value={fp(sponsorRetainment)}
          sub="Residual after outside split"
          tone="success"
        />
        <MetricCard
          label="Investor Payout"
          value={fmts(outsideInvestorProjectedPayout)}
          sub="Taxable allocation less financing offsets"
          tone={outsideInvestorProjectedPayout >= 0 ? "success" : "danger"}
        />
        <MetricCard
          label="Sponsor Retained"
          value={fmts(sponsorProjectedRetainment)}
          sub="Sponsor allocation after financing offsets"
          tone={sponsorProjectedRetainment >= 0 ? "success" : "danger"}
        />
      </div>
    </section>
  );
}
