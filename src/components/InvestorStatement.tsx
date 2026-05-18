"use client";

import { TXNS, fd, fmt, fp, tod, type Investor } from "@/src/lib/data";

type InvestorStatementProps = {
  investor: Investor;
};

export default function InvestorStatement({ investor }: InvestorStatementProps) {
  const year = new Date().getFullYear();
  const from = `${year}-01-01`;
  const to = tod();
  const transactions = TXNS.filter(
    (txn) => txn.iid === investor.id && txn.date >= from && txn.date <= to,
  ).sort((a, b) => a.date.localeCompare(b.date));
  const interestPaid = transactions
    .filter((txn) => txn.type === "interest")
    .reduce((sum, txn) => sum + txn.amount, 0);
  const monthlyInterest = Math.round(investor.principal * investor.rate / 12);

  return (
    <section className="mt-5 rounded-fund-lg border border-border-subtle bg-surface-primary p-6">
      <div className="mb-5 border-b-2 border-border-prominent pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-medium">Investor statement</div>
            <div className="mt-0.5 text-xs text-text-secondary">
              {fd(from)} - {fd(to)}
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">High Yield Fund</div>
            <div className="text-[11px] text-text-secondary">
              Fixed-rate · {fp(investor.rate)} stated yield p.a.
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className="text-sm font-medium">{investor.name}</div>
          <div className="text-xs text-text-secondary">{investor.email}</div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(118px,1fr))] gap-2">
        <div className="rounded-fund-md bg-surface-secondary p-3.5">
          <div className="mb-[3px] text-[10px] uppercase tracking-[.05em] text-text-secondary">
            Principal outstanding
          </div>
          <div className="text-[19px] font-medium leading-[1.1]">{fmt(investor.principal)}</div>
        </div>
        <div className="rounded-fund-md bg-surface-secondary p-3.5">
          <div className="mb-[3px] text-[10px] uppercase tracking-[.05em] text-text-secondary">
            Interest paid
          </div>
          <div className="text-[19px] font-medium leading-[1.1] text-text-success">
            {fmt(interestPaid)}
          </div>
        </div>
        <div className="rounded-fund-md bg-surface-secondary p-3.5">
          <div className="mb-[3px] text-[10px] uppercase tracking-[.05em] text-text-secondary">
            Accrued this month
          </div>
          <div className="text-[19px] font-medium leading-[1.1]">{fmt(monthlyInterest)}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-fund-lg border border-border-subtle">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="bg-surface-secondary px-5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary">
                Date
              </th>
              <th className="bg-surface-secondary px-5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary">
                Type
              </th>
              <th className="bg-surface-secondary px-5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary">
                Amount
              </th>
              <th className="bg-surface-secondary px-5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary">
                Reference
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td className="border-t border-border-subtle px-5 py-2">{fd(txn.date)}</td>
                <td className="border-t border-border-subtle px-5 py-2 capitalize">{txn.type}</td>
                <td className="border-t border-border-subtle px-5 py-2 font-medium">
                  {fmt(txn.amount)}
                </td>
                <td className="border-t border-border-subtle px-5 py-2 text-text-secondary">
                  {txn.ref}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
