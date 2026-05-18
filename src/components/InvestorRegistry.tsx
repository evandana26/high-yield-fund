"use client";

import {
  CL,
  INVESTORS,
  TXNS,
  fd,
  fmt,
  fp,
  type Investor,
  type InvestorStatus,
} from "@/src/lib/data";

const statusClasses: Record<InvestorStatus, string> = {
  active: "bg-surface-success text-text-success",
  pending: "bg-surface-warning text-text-warning",
  rejected: "bg-surface-danger text-text-danger",
  queued: "bg-surface-info text-text-info",
};

function Avatar({ investor, size = 28 }: { investor: Investor; size?: number }) {
  const colors = CL[investor.col] ?? CL.purple;

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-medium"
      style={{
        width: size,
        height: size,
        background: colors.bg,
        color: colors.tx,
        fontSize: Math.round(size * 0.38),
      }}
    >
      {investor.in}
    </span>
  );
}

function StatusBadge({ status }: { status: InvestorStatus }) {
  return (
    <span className={`inline-block rounded-fund-md px-2 py-0.5 text-[11px] font-medium ${statusClasses[status]}`}>
      {status}
    </span>
  );
}

function totalInterestPaid(investorId: number) {
  return TXNS.filter((txn) => txn.iid === investorId && txn.type === "interest").reduce(
    (sum, txn) => sum + txn.amount,
    0,
  );
}

export default function InvestorRegistry() {
  return (
    <section className="px-5 pb-5">
      <div className="mb-[3px] text-lg font-medium">Investor Registry</div>
      <div className="mb-5 text-[13px] text-text-secondary">
        Principal outstanding, target yields, and current investor status.
      </div>

      <div className="overflow-hidden rounded-fund-lg border border-border-subtle bg-surface-primary">
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-2.5">
          <span className="text-[13px] font-medium">Principal registry</span>
          <span className="text-[11px] text-text-secondary">{INVESTORS.length} investors</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="bg-surface-secondary px-5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary">
                  Investor
                </th>
                <th className="bg-surface-secondary px-5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary">
                  Principal
                </th>
                <th className="bg-surface-secondary px-5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary">
                  Target Yield
                </th>
                <th className="bg-surface-secondary px-5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary">
                  Monthly Interest
                </th>
                <th className="bg-surface-secondary px-5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary">
                  Subscribed
                </th>
                <th className="bg-surface-secondary px-5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary">
                  Total Interest Paid
                </th>
                <th className="bg-surface-secondary px-5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {INVESTORS.map((investor) => {
                const monthlyInterest = investor.principal * investor.rate / 12;
                const paid = totalInterestPaid(investor.id);

                return (
                  <tr key={investor.id} className="hover:bg-surface-secondary">
                    <td className="border-t border-border-subtle px-5 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <Avatar investor={investor} />
                        <div>
                          <div className="font-medium">{investor.name}</div>
                          <div className="text-[10px] text-text-secondary">{investor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="border-t border-border-subtle px-5 py-2 font-medium align-middle">
                      {fmt(investor.principal)}
                    </td>
                    <td className="border-t border-border-subtle px-5 py-2 align-middle">
                      {fp(investor.rate)} fixed
                    </td>
                    <td className="border-t border-border-subtle px-5 py-2 align-middle">
                      {fmt(monthlyInterest)}
                    </td>
                    <td className="border-t border-border-subtle px-5 py-2 align-middle">
                      {fd(investor.subDate)}
                    </td>
                    <td className="border-t border-border-subtle px-5 py-2 align-middle">
                      {fmt(paid)}
                    </td>
                    <td className="border-t border-border-subtle px-5 py-2 align-middle">
                      <StatusBadge status={investor.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
