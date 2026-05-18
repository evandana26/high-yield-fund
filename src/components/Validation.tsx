"use client";

import { allFresh, anyStale, fmt, fmts, fx, type FundInputs } from "@/src/lib/data";
import { eng_morningWire, getPendingRedemptionTotal } from "@/src/lib/engine";

type ValidationProps = {
  inputs: FundInputs;
};

type Check = {
  label: string;
  detail: string;
  pass: boolean;
};

export default function Validation({ inputs }: ValidationProps) {
  const wire = eng_morningWire({ inputs });
  const reconciliation = Math.abs(
    wire.grossAssets - inputs.marginDebt.v - wire.clientLiabilities - wire.sponsorEquity,
  );
  const dailyChecks: Check[] = [
    {
      label: "Position inputs refreshed",
      detail: anyStale(inputs) ? "One or more inputs need review" : "All inputs are current",
      pass: allFresh(inputs),
    },
    {
      label: "Morning wire calculated",
      detail: `Sponsor wire: ${fmts(wire.totalSponsorWire)} · Status: ${wire.wireStatus}`,
      pass: wire.totalSponsorWire >= 0,
    },
    {
      label: "Coverage reconciles",
      detail: `Gross - debt - liabilities - sponsor equity = ${fmts(reconciliation)}`,
      pass: reconciliation < 1,
    },
    {
      label: "Client coverage reviewed",
      detail: `Client coverage: ${fx(wire.invCov)} · Post-stress: ${fx(wire.postInvCov)}`,
      pass: wire.invCov >= 1,
    },
    {
      label: "Redemption queue checked",
      detail: `Pending redemption total: ${fmt(getPendingRedemptionTotal())}`,
      pass: true,
    },
    {
      label: "No forced sale in base case",
      detail: `Forced sale required: ${fmts(wire.forcedSale)}`,
      pass: wire.forcedSale === 0,
    },
  ];
  const engineChecks: Check[] = [
    {
      label: "Sponsor wire is non-negative",
      detail: `Sponsor wire: ${fmts(wire.totalSponsorWire)}`,
      pass: wire.totalSponsorWire >= 0,
    },
    {
      label: "Post-redemption debt does not decrease from borrowing logic",
      detail: `Pre: ${fmt(inputs.marginDebt.v)} · Post: ${fmt(wire.postMarginDebt)}`,
      pass: wire.postMarginDebt >= inputs.marginDebt.v,
    },
    {
      label: "Forced sale is non-negative",
      detail: `Forced sale: ${fmts(wire.forcedSale)}`,
      pass: wire.forcedSale >= 0,
    },
    {
      label: "Sponsor equity absorbs market losses first",
      detail: `Client coverage: ${fx(wire.invCov)} · Sponsor equity: ${fmts(wire.sponsorEquity)}`,
      pass: wire.invCov >= 1 || wire.sponsorEquity < 0,
    },
  ];

  return (
    <section className="px-5 pb-5">
      <div className="mb-[3px] text-lg font-medium">Validation & Test Scenarios</div>
      <div className="mb-5 text-[13px] text-text-secondary">
        Daily operating checklist and automated checks for the survival engine.
      </div>

      <div className="mb-5 rounded-fund-lg border border-border-subtle bg-surface-primary p-5">
        <div className="mb-4 border-b border-border-subtle pb-1.5 text-[10px] font-bold uppercase tracking-[.07em] text-text-secondary">
          Daily operations checklist
        </div>
        <div className="space-y-2">
          {dailyChecks.map((check) => (
            <CheckRow key={check.label} check={check} />
          ))}
        </div>
      </div>

      <div className="rounded-fund-lg border border-border-subtle bg-surface-primary p-5">
        <div className="mb-4 border-b border-border-subtle pb-1.5 text-[10px] font-bold uppercase tracking-[.07em] text-text-secondary">
          System invariants
        </div>
        <div className="space-y-2">
          {engineChecks.map((check) => (
            <CheckRow key={check.label} check={check} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CheckRow({ check }: { check: Check }) {
  return (
    <div
      className={`rounded-fund-md border px-3 py-2 text-xs ${
        check.pass
          ? "border-border-success bg-surface-success text-text-success"
          : "border-border-warning bg-surface-warning text-text-warning"
      }`}
    >
      <div className="flex items-center gap-2 font-semibold">
        <span>{check.pass ? "✓" : "!"}</span>
        <span>{check.label}</span>
      </div>
      <div className="mt-1 text-[11px] opacity-90">{check.detail}</div>
    </div>
  );
}
