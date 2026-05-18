"use client";

import { useMemo, useState } from "react";

import { CLIENTS, fmt, fmts, fp, type FundInputs } from "@/src/lib/data";
import {
  calculateRedemptionOptions,
  type RedemptionOptions,
  type RedemptionRiskRating,
} from "@/src/lib/redemptionEngine";

type RedemptionManagerProps = {
  inputs: FundInputs;
};

type OptionKey = "optionA" | "optionB" | "optionC" | "optionD";

const pendingRequest = {
  id: "WD-2026-0518",
  client: CLIENTS[1],
  amount: 250_000,
  urgency: "High Urgency",
  requestedDate: "2026-05-18",
};

const optionLabels: Record<OptionKey, string> = {
  optionA: "Option A",
  optionB: "Option B",
  optionC: "Option C",
  optionD: "Option D",
};

const optionNames: Record<OptionKey, string> = {
  optionA: "Cash",
  optionB: "Margin",
  optionC: "Lot Sale",
  optionD: "Backstop",
};

const riskClass: Record<RedemptionRiskRating, string> = {
  Safe: "bg-surface-success text-text-success",
  Warning: "bg-surface-warning text-text-warning",
  Critical: "bg-surface-danger text-text-danger",
};

const inputClass =
  "w-full rounded-fund-md border border-border-strong bg-surface-primary px-3 py-2 text-[13px] text-text-primary outline-none transition-colors focus:border-text-primary";

function getRecommendedOption(options: RedemptionOptions): OptionKey {
  const action = options.recommendedAction.toLowerCase();

  if (action.includes("available cash") || action.includes("use cash")) {
    return "optionA";
  }

  if (action.includes("temporary margin")) {
    return "optionB";
  }

  if (action.includes("sponsor backstop")) {
    return "optionD";
  }

  return "optionC";
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border-subtle py-1.5 first:border-t-0">
      <span className="text-[11px] text-text-secondary">{label}</span>
      <span className="text-right text-xs font-medium text-text-primary">{value}</span>
    </div>
  );
}

function OptionCard({
  optionKey,
  recommended,
  children,
}: {
  optionKey: OptionKey;
  recommended: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative rounded-fund-lg border bg-surface-primary p-4 ${
        recommended ? "border-border-success shadow-[0_0_0_1px_var(--bsuc)]" : "border-border-subtle"
      }`}
    >
      {recommended ? (
        <div className="absolute right-3 top-3 rounded-full bg-surface-success px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[.04em] text-text-success">
          Recommended
        </div>
      ) : null}
      <div className="mb-0.5 text-[10px] font-bold uppercase tracking-[.07em] text-text-secondary">
        {optionLabels[optionKey]}
      </div>
      <div className="mb-3 text-base font-medium text-text-primary">{optionNames[optionKey]}</div>
      {children}
    </div>
  );
}

export default function RedemptionManager({ inputs }: RedemptionManagerProps) {
  const [selectedOption, setSelectedOption] = useState<OptionKey>("optionA");
  const [auditNote, setAuditNote] = useState("");
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);
  const options = useMemo(
    () =>
      calculateRedemptionOptions(pendingRequest.amount, {
        inputs,
        taxLots: [
          {
            id: "strc-loss-harvest",
            assetSymbol: "STRC",
            acquiredDate: "2024-02-15",
            originalCost: 320_000,
            quantity: 1,
            capitalBucket: "outsideInvestors",
            marketValue: 285_000,
            currentYield: 0.108,
          },
          {
            id: "sata-near-lt",
            assetSymbol: "SATA",
            acquiredDate: "2025-06-20",
            originalCost: 250_000,
            quantity: 1,
            capitalBucket: "outsideInvestors",
            marketValue: 270_000,
            currentYield: 0.118,
          },
          {
            id: "strc-low-basis-roc",
            assetSymbol: "STRC",
            acquiredDate: "2023-01-10",
            originalCost: 210_000,
            quantity: 1,
            capitalBucket: "outsideInvestors",
            marketValue: 410_000,
            currentYield: 0.104,
          },
          {
            id: "sata-high-yield-core",
            assetSymbol: "SATA",
            acquiredDate: "2022-09-12",
            originalCost: 375_000,
            quantity: 1,
            capitalBucket: "outsideInvestors",
            marketValue: 390_000,
            currentYield: 0.13,
          },
        ],
        taxDistributions: [
          {
            id: "roc-strc-low-basis-2024",
            lotId: "strc-low-basis-roc",
            date: "2024-12-31",
            amount: 85_000,
            classification: "returnOfCapital",
            capitalBucket: "outsideInvestors",
          },
        ],
      }),
    [inputs],
  );
  const recommendedOption = getRecommendedOption(options);

  function handleExecute() {
    const optionName = optionNames[selectedOption];
    const noteText = auditNote.trim();

    setExecutionStatus(
      `${optionName} approved for ${fmt(pendingRequest.amount)} withdrawal${
        noteText ? ` with audit note: ${noteText}` : "."
      }`,
    );
  }

  return (
    <section className="px-5 pb-5">
      <div className="mb-[3px] text-lg font-medium">Algorithmic Treasury Manager</div>
      <div className="mb-5 text-[13px] text-text-secondary">
        Tax-aware redemption routing across cash, temporary margin, lot sales, and sponsor
        backstop capacity.
      </div>

      <div className="mb-4 rounded-fund-lg border border-border-subtle bg-surface-primary p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[.07em] text-text-secondary">
              Pending Client Withdrawal
            </div>
            <div className="mt-1 text-base font-medium text-text-primary">
              {pendingRequest.client.name} · {fmt(pendingRequest.amount)}
            </div>
            <div className="mt-1 text-xs text-text-secondary">
              Request {pendingRequest.id} · Submitted {pendingRequest.requestedDate}
            </div>
          </div>
          <span className="rounded-full bg-surface-danger px-2.5 py-1 text-[11px] font-semibold text-text-danger">
            {pendingRequest.urgency}
          </span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
        <OptionCard optionKey="optionA" recommended={recommendedOption === "optionA"}>
          <MetricLine label="Cash used" value={fmt(options.optionA.availableCashUsed)} />
          <MetricLine label="Remaining reserve" value={fmt(options.optionA.remainingReserve)} />
          <MetricLine label="Reserve before" value={fp(options.optionA.reserveRatioBefore)} />
          <MetricLine label="Reserve after" value={fp(options.optionA.reserveRatioAfter)} />
          <MetricLine label="Unfunded" value={fmt(options.optionA.unfundedAmount)} />
        </OptionCard>

        <OptionCard optionKey="optionB" recommended={recommendedOption === "optionB"}>
          <div className="mb-2">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${riskClass[options.optionB.riskRating]}`}>
              {options.optionB.riskRating}
            </span>
          </div>
          <MetricLine label="Margin added" value={fmt(options.optionB.marginAdded)} />
          <MetricLine label="New leverage" value={fp(options.optionB.newLeverageRatio)} />
          <MetricLine label="Annual interest" value={fmt(options.optionB.newMarginInterestCost)} />
          <MetricLine label="Incremental cost" value={fmt(options.optionB.incrementalAnnualInterestCost)} />
          <MetricLine label="Liquidation buffer" value={fmts(options.optionB.newLiquidationBuffer)} />
        </OptionCard>

        <OptionCard optionKey="optionC" recommended={recommendedOption === "optionC"}>
          <MetricLine label="Sale proceeds" value={fmt(options.optionC.estimatedProceeds)} />
          <MetricLine label="Realized gain/loss" value={fmts(options.optionC.realizedGainLoss)} />
          <MetricLine label="Tax impact" value={fmt(options.optionC.taxImpactEstimate)} />
          <MetricLine label="Yield lost" value={fmt(options.optionC.yieldLost)} />
          <MetricLine label="Unfunded" value={fmt(options.optionC.unfundedAmount)} />
          <div className="mt-3 rounded-fund-md bg-surface-secondary p-2">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[.05em] text-text-secondary">
              Lots selected
            </div>
            {options.optionC.lotsToSell.map((lot) => (
              <div key={lot.lotId} className="py-1 text-[11px] text-text-secondary">
                <span className="font-medium text-text-primary">{lot.assetSymbol}</span> ·{" "}
                {fmt(lot.estimatedProceeds)} · {fmts(lot.realizedGainLoss)}
              </div>
            ))}
          </div>
        </OptionCard>

        <OptionCard optionKey="optionD" recommended={recommendedOption === "optionD"}>
          <MetricLine label="Backstop used" value={fmt(options.optionD.backstopCapitalUsed)} />
          <MetricLine label="Remaining backstop" value={fmt(options.optionD.remainingBackstop)} />
          <MetricLine label="Unfunded" value={fmt(options.optionD.unfundedAmount)} />
          <MetricLine
            label="Repayment flag"
            value={options.optionD.repayFromFutureDistributions ? "Future distributions" : "None"}
          />
        </OptionCard>
      </div>

      <div className="mb-4 rounded-fund-lg border border-border-success bg-surface-success p-4">
        <div className="text-[10px] font-bold uppercase tracking-[.07em] text-text-success">
          Recommended Option
        </div>
        <div className="mt-1 text-sm font-medium text-text-primary">
          {optionLabels[recommendedOption]} · {optionNames[recommendedOption]}
        </div>
        <div className="mt-1 text-xs text-text-secondary">{options.recommendedAction}</div>
      </div>

      <div className="rounded-fund-lg border border-border-subtle bg-surface-primary p-4">
        <div className="mb-3 text-sm font-medium">Execution module</div>
        <div className="grid gap-3 md:grid-cols-[220px_1fr_auto]">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-text-secondary">
              Chosen option
            </span>
            <select
              value={selectedOption}
              onChange={(event) => setSelectedOption(event.target.value as OptionKey)}
              className={inputClass}
            >
              {(Object.keys(optionLabels) as OptionKey[]).map((key) => (
                <option key={key} value={key}>
                  {optionLabels[key]} · {optionNames[key]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-text-secondary">
              Audit log note
            </span>
            <input
              value={auditNote}
              onChange={(event) => setAuditNote(event.target.value)}
              placeholder="Document approval rationale, tax considerations, or sponsor instructions"
              className={inputClass}
            />
          </label>

          <button
            type="button"
            onClick={handleExecute}
            className="self-end rounded-fund-md bg-text-primary px-4 py-2 text-xs font-semibold text-surface-primary transition-opacity hover:opacity-90"
          >
            Approve & Execute
          </button>
        </div>
        {executionStatus ? (
          <div className="mt-3 rounded-fund-md bg-surface-info px-3 py-2 text-xs text-text-info">
            {executionStatus}
          </div>
        ) : null}
      </div>
    </section>
  );
}
