export type EntityKind = "person" | "organization" | "asset";

export type GraphEntity = {
  id: string;
  name: string;
  kind: EntityKind;
  role?: string;
  org?: string;
  country?: string;
  countryCode?: string;
  risk: number;
  status: "active" | "monitored" | "dormant" | "watchlist";
  lastSeen: string;
  aliases?: string[];
  signals?: { label: string; value: string; tone: "info" | "warning" | "danger" }[];
  avatar?: string;
};

export type GraphLink = {
  id: string;
  source: string;
  target: string;
  kind:
    | "communicates_with"
    | "associate"
    | "financial_link"
    | "family"
    | "employed_by"
    | "suspected_handoff";
  label?: string;
  weight: number;
  observedCount?: number;
  lastObserved?: string;
};

const av = (set: "men" | "women", n: number): string =>
  `https://randomuser.me/api/portraits/${set}/${n}.jpg`;

export const MOCK_ENTITIES: GraphEntity[] = [
  {
    id: "e-karim",
    name: "Karim Abadi",
    kind: "person",
    role: "Logistics broker",
    org: "Pelagic Holdings",
    country: "Morocco",
    countryCode: "MA",
    risk: 72,
    status: "monitored",
    lastSeen: "2024-08-12",
    aliases: ["K. Abadi", "Abadi.K"],
    avatar: av("men", 32),
    signals: [
      { label: "Comms volume (30d)", value: "412 sigs", tone: "warning" },
      { label: "Off-hours activity", value: "68%", tone: "warning" },
    ],
  },
  {
    id: "e-chenwei",
    name: "Chen Wei",
    kind: "person",
    role: "Field operative",
    country: "China",
    countryCode: "CN",
    risk: 88,
    status: "active",
    lastSeen: "2024-09-03",
    aliases: ["W. Chen"],
    avatar: av("men", 75),
    signals: [
      { label: "Travel: ZRH → IST", value: "3x", tone: "danger" },
      { label: "Burner devices", value: "2 detected", tone: "danger" },
    ],
  },
  {
    id: "e-marisol",
    name: "Marisol Vega",
    kind: "person",
    role: "Finance principal",
    org: "Helios Trust",
    country: "Spain",
    countryCode: "ES",
    risk: 41,
    status: "watchlist",
    lastSeen: "2024-07-29",
    avatar: av("women", 21),
    signals: [{ label: "Account opened", value: "Cyprus", tone: "info" }],
  },
  {
    id: "e-pelagic",
    name: "Pelagic Holdings",
    kind: "organization",
    role: "Shipping & freight",
    country: "Morocco",
    countryCode: "MA",
    risk: 55,
    status: "monitored",
    lastSeen: "2024-09-10",
  },
  {
    id: "e-helios",
    name: "Helios Trust",
    kind: "organization",
    role: "Financial vehicle",
    country: "Cyprus",
    countryCode: "CY",
    risk: 64,
    status: "monitored",
    lastSeen: "2024-09-01",
  },
  {
    id: "e-anya",
    name: "Anya Kovac",
    kind: "person",
    role: "Intermediary",
    country: "Serbia",
    countryCode: "RS",
    risk: 60,
    status: "monitored",
    lastSeen: "2024-08-22",
    avatar: av("women", 44),
  },
  {
    id: "e-rashid",
    name: "Rashid Halabi",
    kind: "person",
    role: "Family contact",
    country: "Lebanon",
    countryCode: "LB",
    risk: 22,
    status: "dormant",
    lastSeen: "2024-04-04",
    avatar: av("men", 12),
  },
  {
    id: "e-nori",
    name: "Nori Tanaka",
    kind: "person",
    role: "Procurement",
    org: "Aegis Optics",
    country: "Japan",
    countryCode: "JP",
    risk: 35,
    status: "monitored",
    lastSeen: "2024-08-30",
    avatar: av("women", 65),
  },
  {
    id: "e-aegis",
    name: "Aegis Optics",
    kind: "organization",
    role: "Dual-use components",
    country: "Japan",
    countryCode: "JP",
    risk: 47,
    status: "watchlist",
    lastSeen: "2024-09-05",
  },
  {
    id: "e-vault",
    name: "Vault-9 (numbered acct)",
    kind: "asset",
    role: "Bank account",
    country: "Cyprus",
    countryCode: "CY",
    risk: 78,
    status: "active",
    lastSeen: "2024-09-09",
  },
  {
    id: "e-lucas",
    name: "Lucas Brandt",
    kind: "person",
    role: "Courier",
    country: "Germany",
    countryCode: "DE",
    risk: 51,
    status: "monitored",
    lastSeen: "2024-08-19",
    avatar: av("men", 53),
  },
  {
    id: "e-helena",
    name: "Helena Storch",
    kind: "person",
    role: "Lawyer",
    org: "Storch & Co.",
    country: "Switzerland",
    countryCode: "CH",
    risk: 18,
    status: "dormant",
    lastSeen: "2024-05-11",
    avatar: av("women", 31),
  },
  {
    id: "e-iqbal",
    name: "Iqbal Rahman",
    kind: "person",
    role: "Driver",
    country: "Pakistan",
    countryCode: "PK",
    risk: 29,
    status: "monitored",
    lastSeen: "2024-08-14",
    avatar: av("men", 67),
  },
  {
    id: "e-yard",
    name: "Yard 14, Casablanca",
    kind: "asset",
    role: "Storage facility",
    country: "Morocco",
    countryCode: "MA",
    risk: 66,
    status: "active",
    lastSeen: "2024-09-07",
  },
];

export const MOCK_LINKS: GraphLink[] = [
  { id: "l1", source: "e-karim", target: "e-pelagic", kind: "employed_by", weight: 0.9, lastObserved: "2024-09-01" },
  { id: "l2", source: "e-karim", target: "e-chenwei", kind: "communicates_with", label: "encrypted · 412 sigs", weight: 0.85, observedCount: 412, lastObserved: "2024-09-08" },
  { id: "l3", source: "e-karim", target: "e-anya", kind: "associate", label: "co-traveled 3x", weight: 0.65, observedCount: 3, lastObserved: "2024-08-22" },
  { id: "l4", source: "e-chenwei", target: "e-vault", kind: "financial_link", label: "USD 1.4M (90d)", weight: 0.8, lastObserved: "2024-09-09" },
  { id: "l5", source: "e-marisol", target: "e-helios", kind: "employed_by", weight: 0.9, lastObserved: "2024-08-29" },
  { id: "l6", source: "e-helios", target: "e-vault", kind: "financial_link", label: "transfers in", weight: 0.7, lastObserved: "2024-09-09" },
  { id: "l7", source: "e-marisol", target: "e-karim", kind: "associate", label: "shared counsel", weight: 0.5, lastObserved: "2024-07-29" },
  { id: "l8", source: "e-anya", target: "e-lucas", kind: "communicates_with", label: "burner sms", weight: 0.6, observedCount: 86, lastObserved: "2024-08-30" },
  { id: "l9", source: "e-lucas", target: "e-yard", kind: "suspected_handoff", label: "Sep 7 · 02:14 UTC", weight: 0.85, lastObserved: "2024-09-07" },
  { id: "l10", source: "e-yard", target: "e-pelagic", kind: "associate", label: "registered to", weight: 0.7, lastObserved: "2024-09-07" },
  { id: "l11", source: "e-iqbal", target: "e-yard", kind: "associate", label: "deliveries", weight: 0.55, observedCount: 11, lastObserved: "2024-09-04" },
  { id: "l12", source: "e-iqbal", target: "e-chenwei", kind: "communicates_with", label: "voice · weekly", weight: 0.5, observedCount: 22, lastObserved: "2024-08-30" },
  { id: "l13", source: "e-nori", target: "e-aegis", kind: "employed_by", weight: 0.9, lastObserved: "2024-08-30" },
  { id: "l14", source: "e-aegis", target: "e-pelagic", kind: "financial_link", label: "invoices · €840k", weight: 0.65, lastObserved: "2024-09-05" },
  { id: "l15", source: "e-nori", target: "e-marisol", kind: "communicates_with", label: "introduction email", weight: 0.4, lastObserved: "2024-08-12" },
  { id: "l16", source: "e-rashid", target: "e-karim", kind: "family", label: "cousin", weight: 0.45 },
  { id: "l17", source: "e-helena", target: "e-helios", kind: "employed_by", label: "outside counsel", weight: 0.5, lastObserved: "2024-05-11" },
  { id: "l18", source: "e-helena", target: "e-marisol", kind: "associate", label: "long-standing client", weight: 0.45 },
  { id: "l19", source: "e-chenwei", target: "e-anya", kind: "suspected_handoff", label: "Belgrade · Aug 22", weight: 0.75, lastObserved: "2024-08-22" },
  { id: "l20", source: "e-pelagic", target: "e-helios", kind: "financial_link", label: "shell layer", weight: 0.6, lastObserved: "2024-09-01" },
];

export const positionForLayout = (
  layout: "force" | "radial" | "hierarchy",
  index: number,
  total: number,
  entity: GraphEntity,
): { x: number; y: number } => {
  if (layout === "radial") {
    const angle = (index / total) * Math.PI * 2;
    const radius = entity.kind === "organization" ? 180 : entity.kind === "asset" ? 280 : 380;
    return {
      x: Math.cos(angle) * radius + 480,
      y: Math.sin(angle) * radius + 360,
    };
  }
  if (layout === "hierarchy") {
    const lane = entity.kind === "organization" ? 0 : entity.kind === "asset" ? 2 : 1;
    const lanes = [0, 1, 2];
    const inLane = MOCK_ENTITIES.filter((e) => {
      const k = e.kind === "organization" ? 0 : e.kind === "asset" ? 2 : 1;
      return k === lane;
    });
    const indexInLane = inLane.findIndex((e) => e.id === entity.id);
    return {
      x: indexInLane * 220 + 80,
      y: lanes.indexOf(lane) * 240 + 80,
    };
  }
  // force-like deterministic spread
  const cols = 5;
  const col = index % cols;
  const row = Math.floor(index / cols);
  const jitterX = ((entity.id.charCodeAt(0) % 7) - 3) * 12;
  const jitterY = ((entity.id.charCodeAt(2) % 7) - 3) * 12;
  return {
    x: col * 220 + 80 + jitterX,
    y: row * 200 + 80 + jitterY,
  };
};

export const linkVisuals = (
  kind: GraphLink["kind"],
): { color: string; animated: boolean; dashed: boolean } => {
  switch (kind) {
    case "communicates_with":
      return { color: "#a855f7", animated: true, dashed: false };
    case "financial_link":
      return { color: "#10b981", animated: false, dashed: false };
    case "associate":
      return { color: "#3b82f6", animated: false, dashed: false };
    case "family":
      return { color: "#ec4899", animated: false, dashed: false };
    case "employed_by":
      return { color: "#94a3b8", animated: false, dashed: false };
    case "suspected_handoff":
      return { color: "#ef4444", animated: true, dashed: true };
    default:
      return { color: "#94a3b8", animated: false, dashed: false };
  }
};

export const LINK_KIND_LABELS: Record<GraphLink["kind"], string> = {
  communicates_with: "Communicates with",
  financial_link: "Financial link",
  associate: "Associate",
  family: "Family",
  employed_by: "Employed by",
  suspected_handoff: "Suspected handoff",
};
