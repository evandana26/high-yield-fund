"use client";

import { useState } from "react";

import InvestorDashboard from "@/src/components/InvestorDashboard";
import InvestorRegistry from "@/src/components/InvestorRegistry";
import ManagerStatements from "@/src/components/ManagerStatements";
import MorningWire from "@/src/components/MorningWire";
import Navbar, { type Role } from "@/src/components/Navbar";
import PositionInputs from "@/src/components/PositionInputs";
import StressEngine from "@/src/components/StressEngine";
import Validation from "@/src/components/Validation";
import { INP, INVESTORS, type FundInputs } from "@/src/lib/data";

function cloneInputs(inputs: FundInputs): FundInputs {
  return Object.fromEntries(
    Object.entries(inputs).map(([key, input]) => [key, { ...input }]),
  ) as FundInputs;
}

export default function Home() {
  const [role, setRole] = useState<Role>("manager");
  const [selectedInvestorId, setSelectedInvestorId] = useState(INVESTORS[0].id);
  const [inputs, setInputs] = useState<FundInputs>(() => cloneInputs(INP));

  return (
    <main
      aria-label="High Yield Fund dashboard"
      className="mx-auto min-h-dvh w-full max-w-[var(--fund-dashboard-max-width)] bg-background"
    >
      <Navbar
        role={role}
        onRoleChange={setRole}
        selectedInvestorId={selectedInvestorId}
        onInvestorChange={setSelectedInvestorId}
      />
      {role === "manager" ? (
        <>
          <MorningWire inputs={inputs} />
          <PositionInputs inputs={inputs} setInputs={setInputs} />
          <StressEngine inputs={inputs} />
          <InvestorRegistry />
          <ManagerStatements />
          <Validation inputs={inputs} />
        </>
      ) : (
        <InvestorDashboard investorId={selectedInvestorId} />
      )}
    </main>
  );
}
