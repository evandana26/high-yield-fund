"use client";

import {
  CL,
  CLIENTS,
  TXNS,
  fd,
  fmt,
  fp,
  type Client,
  type ClientStatus,
} from "@/src/lib/data";

const statusClasses: Record<ClientStatus, string> = {
  active: "bg-surface-success text-text-success",
  pending: "bg-surface-warning text-text-warning",
  rejected: "bg-surface-danger text-text-danger",
  queued: "bg-surface-info text-text-info",
};

function Avatar({ client, size = 28 }: { client: Client; size?: number }) {
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

function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span className={`inline-block rounded-fund-md px-2 py-0.5 text-[11px] font-medium ${statusClasses[status]}`}>
      {status}
    </span>
  );
}

function totalInterestPaid(clientId: number) {
  return TXNS.filter((txn) => txn.clientId === clientId && txn.type === "interest").reduce(
    (sum, txn) => sum + txn.amount,
    0,
  );
}

export default function ClientRegistry() {
  return (
    <section className="px-5 pb-5">
      <div className="mb-[3px] text-lg font-medium">Client Registry</div>
      <div className="mb-5 text-[13px] text-text-secondary">
        Principal outstanding, fixed target yields, and current client status.
      </div>

      <div className="overflow-hidden rounded-fund-lg border border-border-subtle bg-surface-primary">
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-2.5">
          <span className="text-[13px] font-medium">Principal registry</span>
          <span className="text-[11px] text-text-secondary">{CLIENTS.length} clients</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="bg-surface-secondary px-5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[.04em] text-text-secondary">
                  Client
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
              {CLIENTS.map((client) => {
                const monthlyInterest = client.principal * client.rate / 12;
                const paid = totalInterestPaid(client.id);

                return (
                  <tr key={client.id} className="hover:bg-surface-secondary">
                    <td className="border-t border-border-subtle px-5 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <Avatar client={client} />
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-[10px] text-text-secondary">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="border-t border-border-subtle px-5 py-2 font-medium align-middle">
                      {fmt(client.principal)}
                    </td>
                    <td className="border-t border-border-subtle px-5 py-2 align-middle">
                      {fp(client.rate)} fixed
                    </td>
                    <td className="border-t border-border-subtle px-5 py-2 align-middle">
                      {fmt(monthlyInterest)}
                    </td>
                    <td className="border-t border-border-subtle px-5 py-2 align-middle">
                      {fd(client.subDate)}
                    </td>
                    <td className="border-t border-border-subtle px-5 py-2 align-middle">
                      {fmt(paid)}
                    </td>
                    <td className="border-t border-border-subtle px-5 py-2 align-middle">
                      <StatusBadge status={client.status} />
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
