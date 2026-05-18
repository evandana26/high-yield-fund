export type PayStatus = "paying" | "deferred" | "impaired";

export type InputUnit = "$" | "%" | "status";

export type InputValue = number | PayStatus;

export type FundInput<T extends InputValue = InputValue> = {
  v: T;
  ts: string;
  label: string;
  unit: InputUnit;
  note: string;
};

export type FundInputs = {
  strcMV: FundInput<number>;
  sataMV: FundInput<number>;
  brokerCash: FundInput<number>;
  marginDebt: FundInput<number>;
  maintPct: FundInput<number>;
  sponsorLiq: FundInput<number>;
  pendingRed: FundInput<number>;
  strcInc: FundInput<number>;
  sataInc: FundInput<number>;
  margIntAnn: FundInput<number>;
  opexAnn: FundInput<number>;
  payStatus: FundInput<PayStatus>;
  impairRecov: FundInput<number>;
  investorSplitPct: FundInput<number>;
};

export type InputKey = keyof FundInputs;

export type ClientColor = "purple" | "teal" | "blue" | "coral" | "amber" | "pink";

export type ClientStatus = "active" | "pending" | "rejected" | "queued";

export type Client = {
  id: number;
  name: string;
  email: string;
  in: string;
  col: ClientColor;
  principal: number;
  rate: number;
  subDate: string;
  status: ClientStatus;
};

export type InvestorColor = ClientColor;
export type InvestorStatus = ClientStatus;
export type Investor = Client;

export type TransactionType = "subscription" | "interest" | "redemption";

export type Transaction = {
  id: number;
  clientId: number;
  /** @deprecated Use clientId. */
  iid: number;
  type: TransactionType;
  amount: number;
  date: string;
  ref: string;
  notes: string;
};

export type RedemptionStatus =
  | "requested"
  | "reviewed"
  | "approved"
  | "scheduled"
  | "completed"
  | "rejected"
  | "queued";

export type Redemption = {
  id: number;
  clientId: number;
  /** @deprecated Use clientId. */
  iid: number;
  amount: number;
  requested: string;
  status: RedemptionStatus;
  notes: string;
  reviewedAt: string | null;
  approvedAt: string | null;
  scheduledDate: string | null;
  completedAt: string | null;
  proformaRun: boolean;
};

export type Sponsor = {
  name: string;
  firstLoss: number;
};

export type Freshness = "fresh" | "stale" | "old";

export type ClientColorToken = {
  bg: string;
  tx: string;
};

export const CL: Record<ClientColor, ClientColorToken> = {
  purple: { bg: "#EEEDFE", tx: "#3C3489" },
  teal: { bg: "#E1F5EE", tx: "#085041" },
  blue: { bg: "#E6F1FB", tx: "#0C447C" },
  coral: { bg: "#FAECE7", tx: "#712B13" },
  amber: { bg: "#FAEEDA", tx: "#633806" },
  pink: { bg: "#FBEAF0", tx: "#72243E" },
};

export const CK = Object.keys(CL) as ClientColor[];

const NOW = new Date().toISOString();
const H24 = new Date(Date.now() - 25 * 3_600_000).toISOString();

export const INP: FundInputs = {
  strcMV: {
    v: 8_000_000,
    ts: NOW,
    label: "STRC market value",
    unit: "$",
    note: "STRC shares x current price",
  },
  sataMV: {
    v: 8_000_000,
    ts: NOW,
    label: "SATA market value",
    unit: "$",
    note: "SATA shares x current price",
  },
  brokerCash: {
    v: 500_000,
    ts: NOW,
    label: "Brokerage cash",
    unit: "$",
    note: "Uninvested cash held at broker",
  },
  marginDebt: {
    v: 10_000_000,
    ts: NOW,
    label: "Margin debt outstanding",
    unit: "$",
    note: "Total margin loan balance",
  },
  maintPct: {
    v: 0.35,
    ts: NOW,
    label: "Maintenance margin requirement",
    unit: "%",
    note: "Blended broker maint. margin (%)",
  },
  sponsorLiq: {
    v: 500_000,
    ts: H24,
    label: "Sponsor external liquidity",
    unit: "$",
    note: "Cash sponsor can wire today",
  },
  pendingRed: {
    v: 0,
    ts: NOW,
    label: "Pending redemptions",
    unit: "$",
    note: "Approved redemptions due this cycle",
  },
  strcInc: {
    v: 920_000,
    ts: NOW,
    label: "STRC annual income",
    unit: "$",
    note: "Gross coupon received (annualised)",
  },
  sataInc: {
    v: 1_040_000,
    ts: NOW,
    label: "SATA annual income",
    unit: "$",
    note: "Gross coupon received (annualised)",
  },
  margIntAnn: {
    v: 750_000,
    ts: NOW,
    label: "Annual margin interest",
    unit: "$",
    note: "Margin debt x borrow rate",
  },
  opexAnn: {
    v: 60_000,
    ts: NOW,
    label: "Annual operating expenses",
    unit: "$",
    note: "Admin, legal, accounting",
  },
  payStatus: {
    v: "paying",
    ts: NOW,
    label: "STRC/SATA payment status",
    unit: "status",
    note: "paying | deferred | impaired",
  },
  impairRecov: {
    v: 0.25,
    ts: NOW,
    label: "Impaired recovery assumption",
    unit: "%",
    note: "Economic income recovery rate when impaired (0-100%)",
  },
  investorSplitPct: {
    v: 70,
    ts: NOW,
    label: "Investor profit split",
    unit: "%",
    note: "Investor Capital waterfall share; Sponsor Investment Capital remains 100% sponsor-owned",
  },
};

export const CLIENTS: Client[] = [
  {
    id: 1,
    name: "James Delgado",
    email: "jdelgado@hvfund.com",
    in: "JD",
    col: "purple",
    principal: 1_500_000,
    rate: 0.09,
    subDate: "2022-03-15",
    status: "active",
  },
  {
    id: 2,
    name: "Sarah Chen",
    email: "schen@hvfund.com",
    in: "SC",
    col: "teal",
    principal: 800_000,
    rate: 0.09,
    subDate: "2022-06-01",
    status: "active",
  },
  {
    id: 3,
    name: "Robert Okafor",
    email: "rokafor@hvfund.com",
    in: "RO",
    col: "blue",
    principal: 1_200_000,
    rate: 0.09,
    subDate: "2022-01-20",
    status: "active",
  },
  {
    id: 4,
    name: "Maria Santos",
    email: "msantos@hvfund.com",
    in: "MS",
    col: "coral",
    principal: 800_000,
    rate: 0.095,
    subDate: "2023-02-10",
    status: "active",
  },
  {
    id: 5,
    name: "David Park",
    email: "dpark@hvfund.com",
    in: "DP",
    col: "amber",
    principal: 700_000,
    rate: 0.09,
    subDate: "2023-08-05",
    status: "active",
  },
];

/** @deprecated Fixed-yield account holders are now Clients. Use CLIENTS. */
export const INVESTORS = CLIENTS;

export const TXNS: Transaction[] = [
  { id: 1, clientId: 1, iid: 1, type: "subscription", amount: 1_500_000, date: "2022-03-15", ref: "SUB-001", notes: "Initial principal funded" },
  { id: 2, clientId: 2, iid: 2, type: "subscription", amount: 800_000, date: "2022-06-01", ref: "SUB-002", notes: "Initial principal funded" },
  { id: 3, clientId: 3, iid: 3, type: "subscription", amount: 1_200_000, date: "2022-01-20", ref: "SUB-003", notes: "Initial principal funded" },
  { id: 4, clientId: 4, iid: 4, type: "subscription", amount: 800_000, date: "2023-02-10", ref: "SUB-004", notes: "Initial principal funded" },
  { id: 5, clientId: 5, iid: 5, type: "subscription", amount: 700_000, date: "2023-08-05", ref: "SUB-005", notes: "Initial principal funded" },
  { id: 6, clientId: 1, iid: 1, type: "interest", amount: 11_250, date: "2024-01-31", ref: "INT-2024-01", notes: "Jan 2024 interest at 9%" },
  { id: 7, clientId: 2, iid: 2, type: "interest", amount: 6_000, date: "2024-01-31", ref: "INT-2024-01", notes: "Jan 2024 interest at 9%" },
  { id: 8, clientId: 3, iid: 3, type: "interest", amount: 9_000, date: "2024-01-31", ref: "INT-2024-01", notes: "Jan 2024 interest at 9%" },
  { id: 9, clientId: 4, iid: 4, type: "interest", amount: 6_333, date: "2024-01-31", ref: "INT-2024-01", notes: "Jan 2024 interest at 9.5%" },
  { id: 10, clientId: 5, iid: 5, type: "interest", amount: 5_250, date: "2024-01-31", ref: "INT-2024-01", notes: "Jan 2024 interest at 9%" },
  { id: 11, clientId: 1, iid: 1, type: "interest", amount: 11_250, date: "2024-02-29", ref: "INT-2024-02", notes: "Feb 2024 interest at 9%" },
  { id: 12, clientId: 2, iid: 2, type: "interest", amount: 6_000, date: "2024-02-29", ref: "INT-2024-02", notes: "Feb 2024 interest at 9%" },
  { id: 13, clientId: 3, iid: 3, type: "interest", amount: 9_000, date: "2024-02-29", ref: "INT-2024-02", notes: "Feb 2024 interest at 9%" },
  { id: 14, clientId: 4, iid: 4, type: "interest", amount: 6_333, date: "2024-02-29", ref: "INT-2024-02", notes: "Feb 2024 interest at 9.5%" },
  { id: 15, clientId: 5, iid: 5, type: "interest", amount: 5_250, date: "2024-02-29", ref: "INT-2024-02", notes: "Feb 2024 interest at 9%" },
  { id: 16, clientId: 1, iid: 1, type: "interest", amount: 11_250, date: "2024-03-31", ref: "INT-2024-03", notes: "Mar 2024 interest at 9%" },
  { id: 17, clientId: 2, iid: 2, type: "interest", amount: 6_000, date: "2024-03-31", ref: "INT-2024-03", notes: "Mar 2024 interest at 9%" },
  { id: 18, clientId: 3, iid: 3, type: "interest", amount: 9_000, date: "2024-03-31", ref: "INT-2024-03", notes: "Mar 2024 interest at 9%" },
  { id: 19, clientId: 4, iid: 4, type: "interest", amount: 6_333, date: "2024-03-31", ref: "INT-2024-03", notes: "Mar 2024 interest at 9.5%" },
  { id: 20, clientId: 5, iid: 5, type: "interest", amount: 5_250, date: "2024-03-31", ref: "INT-2024-03", notes: "Mar 2024 interest at 9%" },
];

export const REDEMPTIONS: Redemption[] = [
  {
    id: 1,
    clientId: 2,
    iid: 2,
    amount: 100_000,
    requested: "2024-05-10",
    status: "requested",
    notes: "Client request - property purchase",
    reviewedAt: null,
    approvedAt: null,
    scheduledDate: null,
    completedAt: null,
    proformaRun: false,
  },
];

export const SPONSOR: Sponsor = {
  name: "Fund Sponsor",
  firstLoss: 500_000,
};

export const fmt = (n: number) => `$${Math.round(Math.abs(n)).toLocaleString()}`;

export const fmts = (n: number) => `${n < 0 ? "-" : ""}${fmt(n)}`;

export const fp = (n: number) => `${(n * 100).toFixed(2)}%`;

export const fp1 = (n: number) => `${(n * 100).toFixed(1)}%`;

export const fx = (n: number, d = 2) => `${n.toFixed(d)}x`;

export const fd = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const tod = () => new Date().toISOString().split("T")[0];

export const nowStr = () =>
  new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const getClient = (id: number, clients: Client[] = CLIENTS) =>
  clients.find((client) => client.id === id);

/** @deprecated Use getClient. */
export const gi = getClient;

export const getClientAvatarStyle = (client: Client, size = 28) => {
  const colors = CL[client.col] ?? CL.purple;

  return {
    width: `${size}px`,
    height: `${size}px`,
    background: colors.bg,
    color: colors.tx,
    fontSize: `${Math.round(size * 0.38)}px`,
    initials: client.in,
  };
};

/** @deprecated Use getClientAvatarStyle. */
export const getInvestorAvatarStyle = getClientAvatarStyle;

export function fresh(ts?: string | null): Freshness {
  if (!ts) {
    return "old";
  }

  const hours = (Date.now() - new Date(ts).getTime()) / 3_600_000;
  return hours < 24 ? "fresh" : hours < 48 ? "stale" : "old";
}

export function freshColor(ts?: string | null) {
  return {
    fresh: "var(--tsuc)",
    stale: "var(--twrn)",
    old: "var(--tdan)",
  }[fresh(ts)];
}

export function freshBg(ts?: string | null) {
  return {
    fresh: "var(--bsuc)",
    stale: "var(--bwrn)",
    old: "var(--bdan)",
  }[fresh(ts)];
}

export function freshLabel(ts?: string | null) {
  const freshness = fresh(ts);

  if (freshness === "fresh") {
    return "Updated today";
  }

  const hours = ts ? Math.round((Date.now() - new Date(ts).getTime()) / 3_600_000) : 0;
  return `${hours}h ago${freshness === "stale" ? " (update recommended)" : " (stale - update required)"}`;
}

export const allFresh = (inputs: FundInputs = INP) =>
  Object.values(inputs).every((input) => fresh(input.ts) === "fresh");

export const anyStale = (inputs: FundInputs = INP) =>
  Object.values(inputs).some((input) => fresh(input.ts) !== "fresh");

export function markUpdated<K extends InputKey>(
  inputs: FundInputs,
  key: K,
  value?: FundInputs[K]["v"],
): FundInputs {
  return {
    ...inputs,
    [key]: {
      ...inputs[key],
      v: value ?? inputs[key].v,
      ts: new Date().toISOString(),
    },
  };
}
