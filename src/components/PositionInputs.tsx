"use client";

import {
  allFresh,
  anyStale,
  fmt,
  fp1,
  freshColor,
  freshLabel,
  markUpdated,
  type FundInputs,
  type InputKey,
  type PayStatus,
} from "@/src/lib/data";

type PositionInputsProps = {
  inputs: FundInputs;
  setInputs: React.Dispatch<React.SetStateAction<FundInputs>>;
};

type ControlTone = "success" | "warning" | "danger";

type NumericControlProps = {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  note: string;
  onChange: (value: number) => void;
};

const toneClasses: Record<ControlTone, string> = {
  success: "bg-surface-success text-text-success border-border-success",
  warning: "bg-surface-warning text-text-warning border-border-warning",
  danger: "bg-surface-danger text-text-danger border-border-danger",
};

const cardClass = "overflow-hidden rounded-fund-lg border border-border-subtle bg-surface-primary";
const cardHeaderClass =
  "flex items-center justify-between border-b border-border-subtle px-5 py-2.5";
const sectionLabelClass =
  "border-b border-border-subtle pb-1.5 text-[10px] font-bold uppercase tracking-[.07em] text-text-secondary";
const inputClass =
  "w-28 rounded-fund-md border border-border-strong bg-surface-primary px-2.5 py-1.5 text-right text-[13px] text-text-primary outline-none transition-colors focus:border-text-primary";

function cloneInputs(inputs: FundInputs): FundInputs {
  return Object.fromEntries(
    Object.entries(inputs).map(([key, input]) => [key, { ...input }]),
  ) as FundInputs;
}

function getPortfolioSize(inputs: FundInputs) {
  return inputs.strcMV.v + inputs.sataMV.v;
}

function updateInput<K extends InputKey>(
  setInputs: React.Dispatch<React.SetStateAction<FundInputs>>,
  key: K,
  value: FundInputs[K]["v"],
) {
  setInputs((current) => markUpdated(current, key, value));
}

function updateMany(
  setInputs: React.Dispatch<React.SetStateAction<FundInputs>>,
  updater: (draft: FundInputs) => void,
) {
  setInputs((current) => {
    const next = cloneInputs(current);
    const ts = new Date().toISOString();

    updater(next);
    Object.values(next).forEach((input) => {
      input.ts = ts;
    });

    return next;
  });
}

function setPortfolioSize(
  setInputs: React.Dispatch<React.SetStateAction<FundInputs>>,
  value: number,
) {
  updateMany(setInputs, (draft) => {
    const currentPortfolio = getPortfolioSize(draft);
    const strcShare = currentPortfolio > 0 ? draft.strcMV.v / currentPortfolio : 0.5;
    const sataShare = 1 - strcShare;
    const grossYield = currentPortfolio > 0 ? (draft.strcInc.v + draft.sataInc.v) / currentPortfolio : 0;
    const managementFee = currentPortfolio > 0 ? draft.opexAnn.v / currentPortfolio : 0;
    const leverage = currentPortfolio > 0 ? draft.marginDebt.v / currentPortfolio : 0;

    draft.strcMV.v = Math.round(value * strcShare);
    draft.sataMV.v = Math.round(value * sataShare);
    draft.strcInc.v = Math.round(value * grossYield * strcShare);
    draft.sataInc.v = Math.round(value * grossYield * sataShare);
    draft.opexAnn.v = Math.round(value * managementFee);
    draft.marginDebt.v = Math.round(value * leverage);
  });
}

function setGrossYield(setInputs: React.Dispatch<React.SetStateAction<FundInputs>>, value: number) {
  updateMany(setInputs, (draft) => {
    const portfolioSize = getPortfolioSize(draft);
    const currentIncome = draft.strcInc.v + draft.sataInc.v;
    const strcShare = currentIncome > 0 ? draft.strcInc.v / currentIncome : 0.5;
    const totalIncome = portfolioSize * value;

    draft.strcInc.v = Math.round(totalIncome * strcShare);
    draft.sataInc.v = Math.round(totalIncome * (1 - strcShare));
  });
}

function setLeverage(setInputs: React.Dispatch<React.SetStateAction<FundInputs>>, value: number) {
  updateMany(setInputs, (draft) => {
    const portfolioSize = getPortfolioSize(draft);
    const currentBorrowRate = draft.marginDebt.v > 0 ? draft.margIntAnn.v / draft.marginDebt.v : 0.075;

    draft.marginDebt.v = Math.round(portfolioSize * value);
    draft.margIntAnn.v = Math.round(draft.marginDebt.v * currentBorrowRate);
  });
}

function setManagementFee(
  setInputs: React.Dispatch<React.SetStateAction<FundInputs>>,
  value: number,
) {
  updateMany(setInputs, (draft) => {
    draft.opexAnn.v = Math.round(getPortfolioSize(draft) * value);
  });
}

function setLeverageCost(
  setInputs: React.Dispatch<React.SetStateAction<FundInputs>>,
  value: number,
) {
  updateMany(setInputs, (draft) => {
    draft.margIntAnn.v = Math.round(draft.marginDebt.v * value);
  });
}

function NumericControl({ label, value, display, min, max, step, note, onChange }: NumericControlProps) {
  return (
    <div className="mb-3">
      <label className="mb-1 flex justify-between text-xs text-text-secondary">
        <span>{label}</span>
        <strong className="font-semibold text-text-primary">{display}</strong>
      </label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full border-none bg-transparent p-0 accent-text-info"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className={inputClass}
        />
      </div>
      <div className="mt-1 text-[10px] text-text-secondary">{note}</div>
    </div>
  );
}

function FreshnessSummary({ inputs }: { inputs: FundInputs }) {
  const tone: ControlTone = anyStale(inputs) ? "warning" : allFresh(inputs) ? "success" : "danger";

  return (
    <div className={`mb-5 rounded-fund-lg border px-4 py-3 text-xs ${toneClasses[tone]}`}>
      {anyStale(inputs)
        ? "One or more inputs are stale. Update assumptions before approving redemptions."
        : "All inputs are current. Redemption approvals may proceed if stress testing is complete."}
    </div>
  );
}

function InputRow({
  label,
  value,
  note,
  ts,
  children,
}: {
  label: string;
  value: string;
  note: string;
  ts: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center border-t border-border-subtle px-5 py-2.5">
      <div className="min-w-0 flex-1 pr-3">
        <div className="text-[13px] font-medium">{label}</div>
        <div className="mt-0.5 flex items-center gap-1">
          <span
            aria-hidden="true"
            className="size-2 rounded-full"
            style={{ background: freshColor(ts) }}
          />
          <span className="text-[10px] text-text-secondary">{freshLabel(ts)}</span>
        </div>
        <div className="mt-0.5 text-[10px] text-text-secondary">{note}</div>
      </div>
      <div className="flex items-center gap-2">
        <div className="min-w-24 text-right text-[13px] font-medium">{value}</div>
        {children}
      </div>
    </div>
  );
}

export default function PositionInputs({ inputs, setInputs }: PositionInputsProps) {
  const portfolioSize = getPortfolioSize(inputs);
  const grossYield = portfolioSize > 0 ? (inputs.strcInc.v + inputs.sataInc.v) / portfolioSize : 0;
  const leverage = portfolioSize > 0 ? inputs.marginDebt.v / portfolioSize : 0;
  const managementFee = portfolioSize > 0 ? inputs.opexAnn.v / portfolioSize : 0;
  const leverageCost = inputs.marginDebt.v > 0 ? inputs.margIntAnn.v / inputs.marginDebt.v : 0;
  const cashReserve = inputs.brokerCash.v + inputs.sponsorLiq.v;

  return (
    <section className="px-5 pb-5">
      <div className="mb-[3px] text-lg font-medium">Position Inputs</div>
      <div className="mb-5 text-[13px] text-text-secondary">
        Update daily before making morning decisions.{" "}
        <span className="text-text-success">●</span> Fresh (today){" "}
        <span className="text-text-warning">●</span> Stale (&gt;24h){" "}
        <span className="text-text-danger">●</span> Old (&gt;48h)
      </div>

      <FreshnessSummary inputs={inputs} />

      <div className={`${cardClass} mb-5 p-5`}>
        <div className={`${sectionLabelClass} mb-4`}>Scenario controls</div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <NumericControl
              label="Portfolio Size"
              value={portfolioSize}
              display={fmt(portfolioSize)}
              min={5_000_000}
              max={30_000_000}
              step={250_000}
              note="STRC + SATA market value"
              onChange={(value) => setPortfolioSize(setInputs, value)}
            />
            <NumericControl
              label="Gross Yield"
              value={Number((grossYield * 100).toFixed(2))}
              display={fp1(grossYield)}
              min={5}
              max={20}
              step={0.25}
              note="Annual STRC + SATA income as a percent of portfolio"
              onChange={(value) => setGrossYield(setInputs, value / 100)}
            />
            <NumericControl
              label="Leverage"
              value={Number((leverage * 100).toFixed(2))}
              display={fp1(leverage)}
              min={0}
              max={80}
              step={1}
              note="Margin debt as a percent of portfolio"
              onChange={(value) => setLeverage(setInputs, value / 100)}
            />
          </div>
          <div>
            <NumericControl
              label="Mgmt Fee"
              value={Number((managementFee * 100).toFixed(2))}
              display={fp1(managementFee)}
              min={0}
              max={2}
              step={0.05}
              note="Annual operating expenses as a percent of portfolio"
              onChange={(value) => setManagementFee(setInputs, value / 100)}
            />
            <NumericControl
              label="Leverage Cost"
              value={Number((leverageCost * 100).toFixed(2))}
              display={fp1(leverageCost)}
              min={0}
              max={15}
              step={0.25}
              note="Annual margin interest rate on debt"
              onChange={(value) => setLeverageCost(setInputs, value / 100)}
            />
            <NumericControl
              label="Cash/Reserve"
              value={cashReserve}
              display={fmt(cashReserve)}
              min={0}
              max={3_000_000}
              step={25_000}
              note="Broker cash + sponsor external liquidity"
              onChange={(value) => {
                updateMany(setInputs, (draft) => {
                  const brokerShare = cashReserve > 0 ? inputs.brokerCash.v / cashReserve : 0.5;
                  draft.brokerCash.v = Math.round(value * brokerShare);
                  draft.sponsorLiq.v = Math.round(value * (1 - brokerShare));
                });
              }}
            />
            <NumericControl
              label="Investor Profit Split (%)"
              value={inputs.investorSplitPct.v}
              display={fp1(inputs.investorSplitPct.v / 100)}
              min={0}
              max={100}
              step={1}
              note="Investor Capital share of the waterfall"
              onChange={(value) => updateInput(setInputs, "investorSplitPct", value)}
            />
          </div>
        </div>
      </div>

      <div className={`${cardClass} mb-5`}>
        <div className={cardHeaderClass}>
          <span className="text-[13px] font-medium">Collateral & balance sheet</span>
          <span className="text-[11px] text-text-secondary">Live assumptions</span>
        </div>
        <InputRow label={inputs.strcMV.label} value={fmt(inputs.strcMV.v)} note={inputs.strcMV.note} ts={inputs.strcMV.ts}>
          <input
            type="number"
            value={inputs.strcMV.v}
            onChange={(event) => updateInput(setInputs, "strcMV", Number(event.target.value))}
            className={inputClass}
          />
        </InputRow>
        <InputRow label={inputs.sataMV.label} value={fmt(inputs.sataMV.v)} note={inputs.sataMV.note} ts={inputs.sataMV.ts}>
          <input
            type="number"
            value={inputs.sataMV.v}
            onChange={(event) => updateInput(setInputs, "sataMV", Number(event.target.value))}
            className={inputClass}
          />
        </InputRow>
        <InputRow label={inputs.marginDebt.label} value={fmt(inputs.marginDebt.v)} note={inputs.marginDebt.note} ts={inputs.marginDebt.ts}>
          <input
            type="number"
            value={inputs.marginDebt.v}
            onChange={(event) => updateInput(setInputs, "marginDebt", Number(event.target.value))}
            className={inputClass}
          />
        </InputRow>
        <InputRow label={inputs.maintPct.label} value={fp1(inputs.maintPct.v)} note={inputs.maintPct.note} ts={inputs.maintPct.ts}>
          <input
            type="number"
            value={Number((inputs.maintPct.v * 100).toFixed(1))}
            step={0.5}
            onChange={(event) => updateInput(setInputs, "maintPct", Number(event.target.value) / 100)}
            className={inputClass}
          />
        </InputRow>
      </div>

      <div className={cardClass}>
        <div className={cardHeaderClass}>
          <span className="text-[13px] font-medium">Income & expenses</span>
          <span className="text-[11px] text-text-secondary">Annualized</span>
        </div>
        <InputRow label={inputs.strcInc.label} value={fmt(inputs.strcInc.v)} note={inputs.strcInc.note} ts={inputs.strcInc.ts}>
          <input
            type="number"
            value={inputs.strcInc.v}
            onChange={(event) => updateInput(setInputs, "strcInc", Number(event.target.value))}
            className={inputClass}
          />
        </InputRow>
        <InputRow label={inputs.sataInc.label} value={fmt(inputs.sataInc.v)} note={inputs.sataInc.note} ts={inputs.sataInc.ts}>
          <input
            type="number"
            value={inputs.sataInc.v}
            onChange={(event) => updateInput(setInputs, "sataInc", Number(event.target.value))}
            className={inputClass}
          />
        </InputRow>
        <InputRow label={inputs.payStatus.label} value={inputs.payStatus.v} note={inputs.payStatus.note} ts={inputs.payStatus.ts}>
          <select
            value={inputs.payStatus.v}
            onChange={(event) => updateInput(setInputs, "payStatus", event.target.value as PayStatus)}
            className="w-28 rounded-fund-md border border-border-strong bg-surface-primary px-2.5 py-1.5 text-[13px] text-text-primary outline-none transition-colors focus:border-text-primary"
          >
            <option value="paying">paying</option>
            <option value="deferred">deferred</option>
            <option value="impaired">impaired</option>
          </select>
        </InputRow>
      </div>
    </section>
  );
}
