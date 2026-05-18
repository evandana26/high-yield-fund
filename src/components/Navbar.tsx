"use client";

import { Shield } from "lucide-react";
import { useState } from "react";

import { CLIENTS } from "@/src/lib/data";

export type Role = "client" | "investor" | "sponsor" | "internal";

type NavItem = {
  id: string;
  label: string;
  badge?: string;
};

type NavbarProps = {
  role?: Role;
  onRoleChange?: (role: Role) => void;
  selectedClientId?: number;
  onClientChange?: (clientId: number) => void;
};

const sponsorNavItems: NavItem[] = [
  { id: "wire", label: "Morning Wire" },
  { id: "inp", label: "Position Inputs" },
  { id: "str", label: "Stress Engine" },
  { id: "reg", label: "Client Registry" },
  { id: "stmt", label: "Client Statements" },
  { id: "val", label: "Validation" },
];

const clientNavItems: NavItem[] = [
  { id: "acct", label: "Client Account" },
  { id: "hist", label: "Payment History" },
  { id: "red", label: "Redemption" },
  { id: "stmtI", label: "Statement" },
];

const navItemBase =
  "flex shrink-0 items-center border-b-2 border-transparent px-2.5 py-3.5 text-xs text-text-secondary transition-colors hover:text-text-primary";

const roleButtonBase =
  "rounded-[6px] border border-transparent px-2.5 py-1 text-[11px] leading-none text-text-secondary transition-colors hover:text-text-primary";

const roleOptions: Array<{ id: Role; label: string }> = [
  { id: "sponsor", label: "Sponsor" },
  { id: "client", label: "Client View" },
  { id: "investor", label: "Investor Portal" },
  { id: "internal", label: "Internal" },
];

function RoleToggle({ role, onRoleChange }: { role: Role; onRoleChange: (role: Role) => void }) {
  return (
    <div className="flex gap-0.5 rounded-fund-md bg-surface-secondary p-[3px]">
      {roleOptions.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onRoleChange(option.id)}
          className={`${roleButtonBase} ${
            role === option.id
              ? "border-border-subtle bg-surface-primary font-medium text-text-primary"
              : ""
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function Navbar({
  role,
  onRoleChange,
  selectedClientId,
  onClientChange,
}: NavbarProps) {
  const [internalRole, setInternalRole] = useState<Role>("sponsor");
  const [activeSponsorPage, setActiveSponsorPage] = useState("wire");
  const [activeClientPage, setActiveClientPage] = useState("acct");
  const [internalClientId, setInternalClientId] = useState(CLIENTS[0].id);
  const currentRole = role ?? internalRole;
  const currentClientId = selectedClientId ?? internalClientId;

  function handleRoleChange(nextRole: Role) {
    if (role === undefined) {
      setInternalRole(nextRole);
    }

    onRoleChange?.(nextRole);
  }

  function handleClientChange(clientId: number) {
    if (selectedClientId === undefined) {
      setInternalClientId(clientId);
    }

    onClientChange?.(clientId);
  }

  if (currentRole === "client") {
    return (
      <nav
        id="client-nav"
        aria-label="Client navigation"
        className="sticky top-0 z-30 flex h-[46px] items-center overflow-x-auto border-b border-border-subtle bg-surface-primary px-5"
      >
        <div className="flex shrink-0 items-center pr-3 text-[13px] font-normal tracking-[-0.01em] text-text-primary">
          High Yield Fund
        </div>

        {clientNavItems.map((item) => {
          const isActive = item.id === activeClientPage;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveClientPage(item.id)}
              className={`${navItemBase} ${
                isActive ? "border-text-primary font-medium text-text-primary" : ""
              }`}
            >
              {item.label}
            </button>
          );
        })}

        <div className="ml-auto flex shrink-0 items-center gap-2 pl-3">
          <select
            aria-label="Select client"
            value={currentClientId}
            onChange={(event) => handleClientChange(Number(event.target.value))}
            className="rounded-fund-md border border-border-strong bg-surface-primary px-2 py-1 text-xs text-text-primary outline-none transition-colors focus:border-text-primary"
          >
            {CLIENTS.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          <RoleToggle role={currentRole} onRoleChange={handleRoleChange} />
        </div>
      </nav>
    );
  }

  return (
    <nav
      id="sponsor-nav"
      aria-label={`${currentRole === "internal" ? "Internal" : currentRole === "investor" ? "Investor portal" : "Sponsor"} navigation`}
      className="sticky top-0 z-30 flex h-[46px] items-center overflow-x-auto border-b border-border-subtle bg-surface-primary px-5"
    >
      <div className="mr-3 flex shrink-0 items-center gap-1.5 border-r border-border-subtle pr-4 text-[13px] font-semibold tracking-[-0.01em] text-text-primary">
        <Shield aria-hidden="true" className="size-3.5" strokeWidth={2} />
        High Yield Fund
      </div>

      {sponsorNavItems.map((item) => {
        const isActive = item.id === activeSponsorPage;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveSponsorPage(item.id)}
            className={`${navItemBase} ${
              isActive ? "border-text-primary font-medium text-text-primary" : ""
            }`}
          >
            {item.label}
            {item.badge ? (
              <span className="ml-1 rounded-full bg-surface-danger px-1.5 text-[10px] font-semibold text-text-danger">
                {item.badge}
              </span>
            ) : null}
          </button>
        );
      })}

      <div className="ml-auto flex shrink-0 items-center gap-2 pl-3">
        <RoleToggle role={currentRole} onRoleChange={handleRoleChange} />
      </div>
    </nav>
  );
}
