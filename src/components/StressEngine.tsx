"use client";

import { useMemo, useState } from "react";

import { INVESTORS, fmt, fmts, fp1, fx, type FundInputs, type PayStatus } from "@/src/lib/data";
import { eng_morningWire, type MorningWireResult } from "@/src/lib/engine";

type StressEngineProps = {
  inputs: FundInputs;
};

type StressControlProps = {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

type ScenarioMetricProps = {
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

const matrixTone = {
  ok: "bg-surface-success text-text-success",
  warn: "bg-surface-warning text-text-warning",
  alert: "bg-surface-danger text-text-danger",
};

function cloneInputs(inputs: FundInputs): FundInputs {
  return Object.fromEntries(
    Object.entries(inputs).map(([key, input]) => [key, { ...input }]),
  ) as FundInputs;
}

function getTotalPrincipal() {
  return INVESTORS.reduce((sum, investor) => sum + investor.principal, 0);
}

function buildScenarioInputs(inputs: FundInputs, yieldDrop: number, leverageSpike: number) {
  const stressed = cloneInputs(inputs);

  stressed.strcInc.v = Math.round(stressed.strcInc.v * (1 - yieldDrop));
  stressed.sataInc.v = Math.round(stressed.sataInc.v * (1 - yieldDrop));
  stressed.marginDebt.v = Math.round(stressed.marginDebt.v * (1 + leverageSpike));

  return stressed;
}

function StressControl({ label, value, display, min, max, step, onChange }: StressControlProps) {
  return (
    <div className="mb-3">
      <label className="mb-1 flex justify-between text-xs text-text-secondary">
        <span>{label}</span>
        <strong className="font-semibold text-text-primary">{display}</strong>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full border-none bg-transparent p-0 accent-text-info"
      />
    </div>
  );
}

function ScenarioMetric({ label, value, sub, tone }: ScenarioMetricProps) {
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

function getRiskTone(value: number, warn: number, danger: number) {
  if (value <= danger) {
    return "danger";
  }

  if (value <= warn) {
    return "warning";
  }

  return "success";
}

function LiveScenario({ result }: { result: MorningWireResult }) {
  const wireTone =
    result.wireStatus === "ok" ? "success" : result.wireStatus === "warn" ? "warning" : "danger";

  return (
    <>
      <div className="mb-5 rounded-fund-lg border border-border-warning bg-surface-warning p-6 text-text-warning">
        <div className="text-[10px] font-bold uppercase tracking-[.07em]">
          Stress Result - External Sponsor Cash Required
        </div>
        <div className="mt-2 text-4xl font-medium tracking-[-.03em]">
          {fmts(result.totalSponsorWire)}
        </div>
        <div className="mt-2 text-xs font-semibold">
          {result.wireStatus === "ok"
            ? "No sponsor wire required - all obligations covered"
            : result.wireStatus === "warn"
              ? "Sponsor wire required - external liquidity sufficient"
              : "Sponsor liquidity insufficient - forced asset sale required"}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(118px,1fr))] gap-2">
        <ScenarioMetric
          label="Sponsor Wire"
          value={fmts(result.totalSponsorWire)}
          sub="Required today"
          tone={wireTone}
        />
        <ScenarioMetric
          label="Forced Sale"
          value={fmt(result.totalForcedSale)}
          sub="Collateral liquidation"
          tone={result.totalForcedSale > 0 ? "danger" : "success"}
        />
        <ScenarioMetric
          label="Cash ICR"
          value={fx(result.inc.cashICR)}
          sub="Target >= 1.50x"
          tone={getRiskTone(result.inc.cashICR, 1.5, 1)}
        />
        <ScenarioMetric
          label="Investor Coverage"
          value={fx(result.postInvCov)}
          sub="After stress"
          tone={getRiskTone(result.postInvCov, 1.1, 1)}
        />
        <ScenarioMetric
          label="TACR"
          value={fx(result.postTACR)}
          sub="Total asset coverage"
          tone={getRiskTone(result.postTACR, 1.2, 1.05)}
        />
        <ScenarioMetric
          label="Reserve Remaining"
          value={fmt(result.remainingLiq)}
          sub="After sponsor wire"
          tone={result.remainingLiq > 0 ? "success" : "danger"}
        />
      </div>
    </>
  );
}

function SurvivalMatrix({
  inputs,
  yieldDrop,
  leverageSpike,
}: {
  inputs: FundInputs;
  yieldDrop: number;
  leverageSpike: number;
}) {
  const totalPrincipal = getTotalPrincipal();
  const drops = [0.1, 0.2, 0.3];
  const redemptions = [0.05, 0.15, 0.25];

  return (
    <div className="overflow-hidden rounded-fund-lg border border-border-subtle bg-surface-primary">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-2.5">
        <span className="text-[13px] font-medium">Survival matrix - Sponsor cash required</span>
        <span className="text-[11px] text-text-secondary">
          Green = no wire · Amber = sponsor covers · Red = forced sale
        </span>
      </div>
      <div className="overflow-x-auto px-5 py-4">
        <div className="grid min-w-[620px] grid-cols-4 gap-[3px]">
          <div className="rounded-[6px] bg-surface-secondary p-2 text-center text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary">
            Redemptions ↓
            <br />
            Price drop →
          </div>
          {drops.map((drop) => (
            <div
              key={drop}
              className="rounded-[6px] bg-surface-secondary p-2 text-center text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary"
            >
              -{fp1(drop)}
              <br />
              <span className="text-[9px] font-normal">price drop</span>
            </div>
          ))}

          {redemptions.map((redemption) => {
            const redemptionAmount = totalPrincipal * redemption;

            return (
              <div key={redemption} className="contents">
                <div className="rounded-[6px] bg-surface-secondary p-2 text-center text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary">
                  {fp1(redemption)} of principal
                  <br />
                  <span className="text-[9px] font-normal">{fmt(redemptionAmount)}</span>
                </div>
                {drops.map((drop) => {
                  const result = eng_morningWire({
                    inputs: buildScenarioInputs(inputs, yieldDrop, leverageSpike),
                    strcDrop: drop,
                    sataDrop: drop,
                    redemptionOverride: redemptionAmount,
                  });
                  const total = result.sponsorWire + result.forcedSale;

                  return (
                    <div
                      key={`${redemption}-${drop}`}
                      className={`rounded-[6px] p-2 text-center text-xs font-medium ${matrixTone[result.wireStatus]}`}
                    >
                      {total === 0 ? "✓ $0" : `Wire ${fmt(result.sponsorWire)}`}
                      {result.forcedSale > 0 ? (
                        <>
                          <br />
                          Sell {fmt(result.forcedSale)}
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div className="border-t border-border-subtle px-5 py-2 text-[11px] text-text-secondary">
        Rows = redemption wave (% of investor principal). Columns = collateral price drop. Sponsor
        external liquidity: {fmt(inputs.sponsorLiq.v)}.
      </div>
    </div>
  );
}

export default function StressEngine({ inputs }: StressEngineProps) {
  const [yieldDrop, setYieldDrop] = useState(0);
  const [leverageSpike, setLeverageSpike] = useState(0);
  const [massRedemptionPct, setMassRedemptionPct] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<PayStatus>(inputs.payStatus.v);
  const totalPrincipal = getTotalPrincipal();
  const redemptionAmount = totalPrincipal * massRedemptionPct;
  const result = useMemo(
    () =>
      eng_morningWire({
        inputs: buildScenarioInputs(inputs, yieldDrop, leverageSpike),
        redemptionOverride: redemptionAmount,
        payStatusOverride: paymentStatus,
      }),
    [inputs, yieldDrop, leverageSpike, redemptionAmount, paymentStatus],
  );

  return (
    <section className="px-5 pb-5">
      <div className="mb-[3px] text-lg font-medium">Sponsor Survival Engine - Stress View</div>
      <div className="mb-5 text-[13px] text-text-secondary">
        Adjust sliders to model yield drops, leverage spikes, and mass redemptions. All metrics update
        in real time.
      </div>

      <div className="mb-5 rounded-fund-lg border border-border-subtle bg-surface-primary p-5">
        <div className="mb-4 border-b border-border-subtle pb-1.5 text-[10px] font-bold uppercase tracking-[.07em] text-text-secondary">
          Scenario inputs
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <StressControl
              label="Yield drop"
              value={Number((yieldDrop * 100).toFixed(1))}
              display={fp1(yieldDrop)}
              min={0}
              max={60}
              step={0.5}
              onChange={(value) => setYieldDrop(value / 100)}
            />
            <StressControl
              label="Leverage spike"
              value={Number((leverageSpike * 100).toFixed(1))}
              display={fp1(leverageSpike)}
              min={0}
              max={50}
              step={0.5}
              onChange={(value) => setLeverageSpike(value / 100)}
            />
          </div>
          <div>
            <StressControl
              label="Mass redemptions"
              value={Number((massRedemptionPct * 100).toFixed(1))}
              display={`${fp1(massRedemptionPct)} / ${fmt(redemptionAmount)}`}
              min={0}
              max={40}
              step={0.5}
              onChange={(value) => setMassRedemptionPct(value / 100)}
            />
            <div className="mb-3">
              <label className="mb-1 flex justify-between text-xs text-text-secondary">
                <span>Payment status</span>
              </label>
              <select
                value={paymentStatus}
                onChange={(event) => setPaymentStatus(event.target.value as PayStatus)}
                className="mt-1 w-full rounded-fund-md border border-border-strong bg-surface-primary px-2.5 py-1.5 text-xs text-text-primary outline-none transition-colors focus:border-text-primary"
              >
                <option value="paying">Paying</option>
                <option value="deferred">Deferred</option>
                <option value="impaired">Impaired</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <LiveScenario result={result} />
      <SurvivalMatrix inputs={inputs} yieldDrop={yieldDrop} leverageSpike={leverageSpike} />
    </section>
  );
}
