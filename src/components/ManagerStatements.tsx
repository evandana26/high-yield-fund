"use client";

import { useState } from "react";

import { CLIENTS, TXNS, fd, fmt, fp, tod } from "@/src/lib/data";

function yearStart() {
  return `${new Date().getFullYear()}-01-01`;
}

export default function SponsorStatements() {
  const [clientId, setClientId] = useState(CLIENTS[0].id);
  const [from, setFrom] = useState(yearStart());
  const [to, setTo] = useState(tod());
  const client = CLIENTS.find((item) => item.id === clientId) ?? CLIENTS[0];
  const transactions = TXNS.filter(
    (txn) => txn.clientId === client.id && txn.date >= from && txn.date <= to,
  ).sort((a, b) => a.date.localeCompare(b.date));
  const priorTransactions = TXNS.filter((txn) => txn.clientId === client.id && txn.date < from);
  const beginningPrincipal =
    priorTransactions
      .filter((txn) => txn.type === "subscription")
      .reduce((sum, txn) => sum + txn.amount, 0) -
    priorTransactions
      .filter((txn) => txn.type === "redemption")
      .reduce((sum, txn) => sum + txn.amount, 0);
  const newSubscriptions = transactions
    .filter((txn) => txn.type === "subscription")
    .reduce((sum, txn) => sum + txn.amount, 0);
  const redemptions = transactions
    .filter((txn) => txn.type === "redemption")
    .reduce((sum, txn) => sum + txn.amount, 0);
  const interestPaid = transactions
    .filter((txn) => txn.type === "interest")
    .reduce((sum, txn) => sum + txn.amount, 0);
  const monthlyInterest = Math.round(client.principal * client.rate / 12);

  return (
    <section className="px-5 pb-5">
      <div className="mb-[3px] text-lg font-medium">Client statements</div>
      <div className="mb-5 text-[13px] text-text-secondary">
        Beginning principal, subscriptions, redemptions, interest paid, accrued, and ending balance.
      </div>

      <div className="mb-5 rounded-fund-lg border border-border-subtle bg-surface-primary p-5">
        <div className="mb-3.5 text-[13px] font-medium">Generate statement</div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-[3px]">
            <span className="text-[11px] font-medium text-text-secondary">Client</span>
            <select
              value={clientId}
              onChange={(event) => setClientId(Number(event.target.value))}
              className="w-full rounded-fund-md border border-border-strong bg-surface-primary px-2.5 py-1.5 text-[13px] text-text-primary outline-none transition-colors focus:border-text-primary"
            >
              {CLIENTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-[3px]">
            <span className="text-[11px] font-medium text-text-secondary">From</span>
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="w-full rounded-fund-md border border-border-strong bg-surface-primary px-2.5 py-1.5 text-[13px] text-text-primary outline-none transition-colors focus:border-text-primary"
            />
          </label>
          <label className="flex flex-col gap-[3px]">
            <span className="text-[11px] font-medium text-text-secondary">To</span>
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="w-full rounded-fund-md border border-border-strong bg-surface-primary px-2.5 py-1.5 text-[13px] text-text-primary outline-none transition-colors focus:border-text-primary"
            />
          </label>
        </div>
      </div>

      <div className="rounded-fund-lg border border-border-subtle bg-surface-primary p-6">
        <div className="mb-5 border-b-2 border-border-prominent pb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-medium">Client statement</div>
              <div className="mt-0.5 text-xs text-text-secondary">
                {fd(from)} - {fd(to)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">High Yield Fund</div>
              <div className="text-[11px] text-text-secondary">
                Fixed-rate · {fp(client.rate)} stated yield p.a.
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-medium">{client.name}</div>
            <div className="text-xs text-text-secondary">{client.email}</div>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(118px,1fr))] gap-2">
          <Metric label="Beginning principal" value={fmt(beginningPrincipal)} />
          <Metric label="New principal" value={fmt(newSubscriptions)} tone="success" />
          <Metric label="Redemptions" value={fmt(redemptions)} tone="danger" />
          <Metric label="Interest paid" value={fmt(interestPaid)} tone="success" />
          <Metric label="Ending principal" value={fmt(client.principal)} />
          <Metric label="Accrued this month" value={fmt(monthlyInterest)} />
        </div>

        <div className="overflow-hidden rounded-fund-lg border border-border-subtle">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                {["Date", "Type", "Amount", "Reference", "Notes"].map((header) => (
                  <th
                    key={header}
                    className="bg-surface-secondary px-5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="border-t border-border-subtle px-5 py-2">{fd(txn.date)}</td>
                  <td className="border-t border-border-subtle px-5 py-2 capitalize">{txn.type}</td>
                  <td className="border-t border-border-subtle px-5 py-2 font-medium">
                    {txn.type === "redemption" ? "-" : "+"}
                    {fmt(txn.amount)}
                  </td>
                  <td className="border-t border-border-subtle px-5 py-2 text-text-secondary">
                    {txn.ref}
                  </td>
                  <td className="border-t border-border-subtle px-5 py-2 text-text-secondary">
                    {txn.notes}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="border-t border-border-subtle px-5 py-8 text-center text-xs text-text-secondary"
                  >
                    No transactions in this period
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "danger";
}) {
  return (
    <div className="rounded-fund-md bg-surface-secondary p-3.5">
      <div className="mb-[3px] text-[10px] uppercase tracking-[.05em] text-text-secondary">
        {label}
      </div>
      <div
        className={`text-[19px] font-medium leading-[1.1] ${
          tone === "success" ? "text-text-success" : tone === "danger" ? "text-text-danger" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
