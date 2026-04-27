export type ConnectionKind =
  | "shared_country"
  | "same_age_band"
  | "associate"
  | "co_signal";

export type Connection = {
  id: string;
  sourceId: string;
  targetId: string;
  kind: ConnectionKind;
  label: string;
  weight: number;
  createdAt: string;
};

export type ConnectionInput = {
  sourceId: string;
  targetId: string;
  kind: ConnectionKind;
  label: string;
  weight?: number;
};
