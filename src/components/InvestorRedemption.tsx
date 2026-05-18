"use client";

import { useMemo, useState } from "react";

import { REDEMPTIONS, fd, fmt, tod, type Client, type Redemption } from "@/src/lib/data";

type ClientRedemptionProps = {
  client: Client;
};

const statusClasses = {
  requested: "bg-surface-info text-text-info",
  reviewed: "bg-surface-info text-text-info",
  approved: "bg-surface-success text-text-success",
  scheduled: "bg-surface-warning text-text-warning",
  completed: "bg-surface-success text-text-success",
  rejected: "bg-surface-danger text-text-danger",
  queued: "bg-surface-info text-text-info",
};

export default function ClientRedemption({ client }: ClientRedemptionProps) {
  const [amount, setAmount] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [note, setNote] = useState("");
  const [submittedRequests, setSubmittedRequests] = useState<Redemption[]>([]);
  const requestedAmount = Number(amount) || 0;
  const remainingBalance = Math.max(0, client.principal - requestedAmount);
  const exceedsPrincipal = requestedAmount > client.principal;
  const clientRequests = useMemo(
    () =>
      [...REDEMPTIONS.filter((request) => request.clientId === client.id), ...submittedRequests].sort(
        (a, b) => b.requested.localeCompare(a.requested),
      ),
    [client.id, submittedRequests],
  );

  function submitRequest() {
    if (!requestedAmount || exceedsPrincipal) {
      return;
    }

    const notes = [note, preferredDate ? `Preferred: ${fd(preferredDate)}` : ""]
      .filter(Boolean)
      .join(" / ");

    setSubmittedRequests((current) => [
      {
        id: Date.now(),
        clientId: client.id,
        iid: client.id,
        amount: requestedAmount,
        requested: tod(),
        status: "requested",
        notes,
        reviewedAt: null,
        approvedAt: null,
        scheduledDate: null,
        completedAt: null,
        proformaRun: false,
      },
      ...current,
    ]);
    setAmount("");
    setPreferredDate("");
    setNote("");
  }

  return (
    <section className="mt-5">
      <div className="mb-[3px] text-lg font-medium">Redemption request</div>
      <div className="mb-5 text-[13px] text-text-secondary">
        Request a full or partial return of client principal. Requests are reviewed by the sponsor.
      </div>

      <div className="mb-5 rounded-fund-lg border border-border-subtle bg-surface-primary p-5">
        <div className="mb-3.5 text-sm font-medium">Submit a redemption request</div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-[3px]">
            <span className="text-[11px] font-medium text-text-secondary">Amount requested ($)</span>
            <input
              type="number"
              min={0}
              max={client.principal}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="100000"
              className="w-full rounded-fund-md border border-border-strong bg-surface-primary px-2.5 py-1.5 text-[13px] text-text-primary outline-none transition-colors focus:border-text-primary"
            />
          </label>
          <label className="flex flex-col gap-[3px]">
            <span className="text-[11px] font-medium text-text-secondary">Preferred date</span>
            <input
              type="date"
              value={preferredDate}
              onChange={(event) => setPreferredDate(event.target.value)}
              className="w-full rounded-fund-md border border-border-strong bg-surface-primary px-2.5 py-1.5 text-[13px] text-text-primary outline-none transition-colors focus:border-text-primary"
            />
          </label>
          <label className="flex flex-col gap-[3px] md:col-span-2">
            <span className="text-[11px] font-medium text-text-secondary">Note (optional)</span>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Any relevant context for the sponsor"
              className="w-full rounded-fund-md border border-border-strong bg-surface-primary px-2.5 py-1.5 text-[13px] text-text-primary outline-none transition-colors focus:border-text-primary"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-2 text-xs text-text-secondary sm:grid-cols-3">
          <div>
            Principal outstanding: <strong className="text-text-primary">{fmt(client.principal)}</strong>
          </div>
          <div>
            Requested: <strong className={exceedsPrincipal ? "text-text-danger" : "text-text-primary"}>{fmt(requestedAmount)}</strong>
          </div>
          <div>
            Remaining balance: <strong className="text-text-primary">{fmt(remainingBalance)}</strong>
          </div>
        </div>

        {exceedsPrincipal ? (
          <div className="mt-3 rounded-fund-md border border-border-danger bg-surface-danger px-3 py-2 text-xs text-text-danger">
            Amount exceeds principal outstanding.
          </div>
        ) : null}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={!requestedAmount || exceedsPrincipal}
            onClick={submitRequest}
            className="rounded-fund-md border border-text-primary bg-text-primary px-3 py-1.5 text-xs font-medium text-surface-primary transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit Request
          </button>
        </div>

        <div className="mt-3 text-[11px] text-text-secondary">
          Requests are typically reviewed within 2-5 business days. Timing depends on fund liquidity.
        </div>
      </div>

      {clientRequests.length ? (
        <div className="overflow-hidden rounded-fund-lg border border-border-subtle bg-surface-primary">
          <div className="border-b border-border-subtle px-5 py-2.5 text-[13px] font-medium">
            My redemption requests
          </div>
          {clientRequests.map((request) => (
            <div key={request.id} className="border-t border-border-subtle px-5 py-3 first:border-t-0">
              <div className="mb-2 flex justify-between">
                <span className="text-[13px] font-medium">{fmt(request.amount)}</span>
                <span
                  className={`rounded-fund-md px-2 py-0.5 text-[11px] font-medium ${statusClasses[request.status]}`}
                >
                  {request.status}
                </span>
              </div>
              <div className="text-[11px] text-text-secondary">
                Requested {fd(request.requested)}
                {request.notes ? ` · ${request.notes}` : ""}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
