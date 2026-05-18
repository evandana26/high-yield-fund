"use client";

import { Shield } from "lucide-react";
import { useState } from "react";

import { INVESTORS } from "@/src/lib/data";

export type Role = "manager" | "investor";

type NavItem = {
  id: string;
  label: string;
  badge?: string;
};

type NavbarProps = {
  role?: Role;
  onRoleChange?: (role: Role) => void;
  selectedInvestorId?: number;
  onInvestorChange?: (investorId: number) => void;
};

const managerNavItems: NavItem[] = [
  { id: "wire", label: "Morning Wire" },
  { id: "inp", label: "Position Inputs" },
  { id: "str", label: "Stress Engine" },
  { id: "reg", label: "Investor Registry" },
  { id: "stmt", label: "Statements" },
  { id: "val", label: "Validation" },
];

const investorNavItems: NavItem[] = [
  { id: "acct", label: "My Account" },
  { id: "hist", label: "Payment history" },
  { id: "red", label: "Redemption" },
  { id: "stmtI", label: "Statement" },
];

const navItemBase =
  "flex shrink-0 items-center border-b-2 border-transparent px-2.5 py-3.5 text-xs text-text-secondary transition-colors hover:text-text-primary";

const roleButtonBase =
  "rounded-[6px] border border-transparent px-2.5 py-1 text-[11px] leading-none text-text-secondary transition-colors hover:text-text-primary";

function RoleToggle({ role, onRoleChange }: { role: Role; onRoleChange: (role: Role) => void }) {
  return (
    <div className="flex gap-0.5 rounded-fund-md bg-surface-secondary p-[3px]">
      <button
        type="button"
        onClick={() => onRoleChange("manager")}
        className={`${roleButtonBase} ${
          role === "manager"
            ? "border-border-subtle bg-surface-primary font-medium text-text-primary"
            : ""
        }`}
      >
        Manager
      </button>
      <button
        type="button"
        onClick={() => onRoleChange("investor")}
        className={`${roleButtonBase} ${
          role === "investor"
            ? "border-border-subtle bg-surface-primary font-medium text-text-primary"
            : ""
        }`}
      >
        {role === "manager" ? "Investor view" : "Investor"}
      </button>
    </div>
  );
}

export default function Navbar({
  role,
  onRoleChange,
  selectedInvestorId,
  onInvestorChange,
}: NavbarProps) {
  const [internalRole, setInternalRole] = useState<Role>("manager");
  const [activeManagerPage, setActiveManagerPage] = useState("wire");
  const [activeInvestorPage, setActiveInvestorPage] = useState("acct");
  const [internalInvestorId, setInternalInvestorId] = useState(INVESTORS[0].id);
  const currentRole = role ?? internalRole;
  const currentInvestorId = selectedInvestorId ?? internalInvestorId;

  function handleRoleChange(nextRole: Role) {
    if (role === undefined) {
      setInternalRole(nextRole);
    }

    onRoleChange?.(nextRole);
  }

  function handleInvestorChange(investorId: number) {
    if (selectedInvestorId === undefined) {
      setInternalInvestorId(investorId);
    }

    onInvestorChange?.(investorId);
  }

  if (currentRole === "investor") {
    return (
      <nav
        id="inv-nav"
        aria-label="Investor navigation"
        className="sticky top-0 z-30 flex h-[46px] items-center overflow-x-auto border-b border-border-subtle bg-surface-primary px-5"
      >
        <div className="flex shrink-0 items-center pr-3 text-[13px] font-normal tracking-[-0.01em] text-text-primary">
          High Yield Fund
        </div>

        {investorNavItems.map((item) => {
          const isActive = item.id === activeInvestorPage;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveInvestorPage(item.id)}
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
            aria-label="Select investor"
            value={currentInvestorId}
            onChange={(event) => handleInvestorChange(Number(event.target.value))}
            className="rounded-fund-md border border-border-strong bg-surface-primary px-2 py-1 text-xs text-text-primary outline-none transition-colors focus:border-text-primary"
          >
            {INVESTORS.map((investor) => (
              <option key={investor.id} value={investor.id}>
                {investor.name}
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
      id="mgr-nav"
      aria-label="Manager navigation"
      className="sticky top-0 z-30 flex h-[46px] items-center overflow-x-auto border-b border-border-subtle bg-surface-primary px-5"
    >
      <div className="mr-3 flex shrink-0 items-center gap-1.5 border-r border-border-subtle pr-4 text-[13px] font-semibold tracking-[-0.01em] text-text-primary">
        <Shield aria-hidden="true" className="size-3.5" strokeWidth={2} />
        High Yield Fund
      </div>

      {managerNavItems.map((item) => {
        const isActive = item.id === activeManagerPage;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveManagerPage(item.id)}
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
