"use client";

import { useState } from "react";

import ClientDashboard from "@/src/components/InvestorDashboard";
import ClientRegistry from "@/src/components/InvestorRegistry";
import SponsorStatements from "@/src/components/ManagerStatements";
import MorningWire from "@/src/components/MorningWire";
import Navbar, { type Role } from "@/src/components/Navbar";
import PositionInputs from "@/src/components/PositionInputs";
import RedemptionManager from "@/src/components/RedemptionManager";
import StressEngine from "@/src/components/StressEngine";
import Validation from "@/src/components/Validation";
import { CLIENTS, INP, type FundInputs } from "@/src/lib/data";

function cloneInputs(inputs: FundInputs): FundInputs {
  return Object.fromEntries(
    Object.entries(inputs).map(([key, input]) => [key, { ...input }]),
  ) as FundInputs;
}

export default function Home() {
  const [role, setRole] = useState<Role>("sponsor");
  const [selectedClientId, setSelectedClientId] = useState(CLIENTS[0].id);
  const [inputs, setInputs] = useState<FundInputs>(() => cloneInputs(INP));

  return (
    <main
      aria-label="High Yield Fund dashboard"
      className="mx-auto min-h-dvh w-full max-w-[var(--fund-dashboard-max-width)] bg-background"
    >
      <Navbar
        role={role}
        onRoleChange={setRole}
        selectedClientId={selectedClientId}
        onClientChange={setSelectedClientId}
      />
      {role === "sponsor" || role === "internal" || role === "investor" ? (
        <>
          {role === "investor" ? (
            <section className="p-5">
              <div className="mb-[3px] text-lg font-medium">Investor Portal</div>
              <div className="mb-5 text-[13px] text-text-secondary">
                Outside capital partner view. Investor capital waterfall and upside allocations are
                reflected in the sponsor dashboard metrics below.
              </div>
            </section>
          ) : null}
          <MorningWire inputs={inputs} />
          <PositionInputs inputs={inputs} setInputs={setInputs} />
          <StressEngine inputs={inputs} />
          <RedemptionManager inputs={inputs} />
          <ClientRegistry />
          <SponsorStatements />
          <Validation inputs={inputs} />
        </>
      ) : (
        <ClientDashboard clientId={selectedClientId} />
      )}
    </main>
  );
}
