"use client";

import {
  CL,
  CLIENTS,
  TXNS,
  fd,
  fmt,
  fp,
  type Client,
  type Transaction,
} from "@/src/lib/data";
import ClientRedemption from "@/src/components/InvestorRedemption";
import ClientStatement from "@/src/components/InvestorStatement";

type ClientDashboardProps = {
  clientId: number;
};

const transactionBadgeClasses: Record<Transaction["type"], string> = {
  subscription: "bg-surface-success text-text-success",
  interest: "bg-surface-info text-text-info",
  redemption: "bg-surface-danger text-text-danger",
};

function Avatar({ client, size = 44 }: { client: Client; size?: number }) {
  const colors = CL[client.col] ?? CL.purple;

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
      {client.in}
    </span>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border-r border-border-subtle p-4 last:border-r-0">
      <div className="text-[10px] uppercase tracking-[.05em] text-text-secondary">{label}</div>
      <div className="mt-1 text-[19px] font-medium leading-[1.1]">{value}</div>
      {sub ? <div className="mt-[3px] text-[11px] text-text-secondary">{sub}</div> : null}
    </div>
  );
}

function transactionDescription(type: Transaction["type"]) {
  return {
    subscription: "Principal funded",
    redemption: "Redemption processed",
    interest: "Interest credited",
  }[type];
}

function transactionSign(type: Transaction["type"]) {
  return type === "redemption" ? "-" : "+";
}

function transactionTone(type: Transaction["type"]) {
  return type === "redemption"
    ? "text-text-danger"
    : type === "interest"
      ? "text-text-info"
      : "text-text-success";
}

export default function ClientDashboard({ clientId }: ClientDashboardProps) {
  const client = CLIENTS.find((item) => item.id === clientId) ?? CLIENTS[0];
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthProgress = Math.min(now.getDate() / daysInMonth, 1);
  const monthlyInterest = Math.round(client.principal * client.rate / 12);
  const accruedInterest = Math.round(monthlyInterest * monthProgress);
  const nextPayment = new Date(now.getFullYear(), now.getMonth() + 1, 28);
  const transactions = TXNS.filter((txn) => txn.clientId === client.id).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const interestTransactions = transactions.filter((txn) => txn.type === "interest");
  const allInterestPaid = interestTransactions.reduce((sum, txn) => sum + txn.amount, 0);
  const lastPayment = interestTransactions[0];

  return (
    <section className="p-5">
      <div className="mb-[3px] text-lg font-medium">Client Account</div>
      <div className="mb-5 text-[13px] text-text-secondary">
        Your client account as of today,{" "}
        {now.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </div>

      <div className="mb-5 rounded-fund-lg border border-border-subtle bg-surface-primary p-5">
        <div className="mb-5 flex items-center gap-3">
          <Avatar client={client} />
          <div>
            <div className="text-xl font-medium tracking-[-.02em]">{client.name}</div>
            <div className="mt-0.5 text-[13px] text-text-secondary">
              Client account opened {fd(client.subDate)}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="mb-0.5 text-[11px] text-text-secondary">Payment status</div>
            <div className="text-sm font-medium text-text-success">Paying</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-fund-md border border-border-subtle bg-surface-secondary">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Principal outstanding"
              value={fmt(client.principal)}
              sub="Client funded principal"
            />
            <MetricCard
              label="Target / stated yield"
              value={fp(client.rate)}
              sub="Per annum"
            />
            <MetricCard
              label="Monthly interest"
              value={fmt(monthlyInterest)}
              sub={`${fmt(accruedInterest)} accrued so far`}
            />
            <MetricCard
              label="Next payment"
              value={nextPayment.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              sub={`${fmt(monthlyInterest)} expected`}
            />
          </div>
          <div className="border-t border-border-subtle px-4 py-3">
            <div className="mb-1 flex justify-between text-[11px] text-text-secondary">
              <span>Interest accruing this month</span>
              <span className="font-medium">
                {fmt(accruedInterest)} of {fmt(monthlyInterest)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border-subtle">
              <div
                className="h-full rounded-full bg-text-info"
                style={{ width: `${Math.round(monthProgress * 100)}%` }}
              />
            </div>
            <div className="mt-[3px] text-[10px] text-text-secondary">
              Day {now.getDate()} of {daysInMonth} - {Math.round(monthProgress * 100)}% of month
              elapsed
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(118px,1fr))] gap-2">
        <div className="rounded-fund-md bg-surface-secondary p-3.5">
          <div className="mb-[3px] text-[10px] uppercase tracking-[.05em] text-text-secondary">
            Interest paid / credited
          </div>
          <div className="text-[19px] font-medium leading-[1.1] text-text-success">
            {fmt(allInterestPaid)}
          </div>
          <div className="mt-[3px] text-[11px] text-text-secondary">All time</div>
        </div>
        <div className="rounded-fund-md bg-surface-secondary p-3.5">
          <div className="mb-[3px] text-[10px] uppercase tracking-[.05em] text-text-secondary">
            Last payment
          </div>
          <div className="text-[19px] font-medium leading-[1.1]">
            {lastPayment ? fmt(lastPayment.amount) : "None"}
          </div>
          <div className="mt-[3px] text-[11px] text-text-secondary">
            {lastPayment ? fd(lastPayment.date) : "-"}
          </div>
        </div>
      </div>

      <div className="mb-[3px] text-lg font-medium">Payment history</div>
      <div className="mb-5 text-[13px] text-text-secondary">
        Interest payments credited to your account.
      </div>

      <div className="mb-5 rounded-fund-lg border border-border-subtle bg-surface-primary p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-medium">
              {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })} - current
            </div>
            <div className="mt-0.5 text-xs text-text-secondary">Accruing - not yet credited</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-medium text-text-info">{fmt(accruedInterest)}</div>
            <div className="text-[11px] text-text-secondary">of {fmt(monthlyInterest)} this month</div>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-border-subtle">
          <div
            className="h-full rounded-full bg-text-info"
            style={{ width: `${Math.round(monthProgress * 100)}%` }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-fund-lg border border-border-subtle bg-surface-primary">
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-2.5">
          <span className="text-[13px] font-medium">Transaction ledger</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="bg-surface-secondary px-5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary">
                  Date
                </th>
                <th className="bg-surface-secondary px-5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary">
                  Description
                </th>
                <th className="bg-surface-secondary px-5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary">
                  Amount
                </th>
                <th className="bg-surface-secondary px-5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary">
                  Type
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-surface-secondary">
                  <td className="border-t border-border-subtle px-5 py-2 align-middle">
                    {fd(txn.date)}
                  </td>
                  <td className="border-t border-border-subtle px-5 py-2 text-text-secondary align-middle">
                    {transactionDescription(txn.type)}
                  </td>
                  <td
                    className={`border-t border-border-subtle px-5 py-2 font-medium align-middle ${transactionTone(txn.type)}`}
                  >
                    {transactionSign(txn.type)}
                    {fmt(txn.amount)}
                  </td>
                  <td className="border-t border-border-subtle px-5 py-2 align-middle">
                    <span
                      className={`inline-block rounded-fund-md px-2 py-0.5 text-[10px] font-medium ${transactionBadgeClasses[txn.type]}`}
                    >
                      {txn.type}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="border-t border-border-subtle px-5 py-8 text-center text-xs text-text-secondary">
                    No transactions yet
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      <ClientRedemption client={client} />
      <ClientStatement client={client} />
    </section>
  );
}
