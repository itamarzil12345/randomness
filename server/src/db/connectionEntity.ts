import { EntitySchema } from "typeorm";

export type StoredConnection = {
  id: string;
  sourceId: string;
  targetId: string;
  kind: string;
  label: string;
  weight: number;
  createdAt: Date;
};

export const connectionEntity = new EntitySchema<StoredConnection>({
  name: "Connection",
  tableName: "connections",
  columns: {
    id: {
      type: String,
      primary: true,
    },
    sourceId: {
      type: String,
      name: "source_id",
    },
    targetId: {
      type: String,
      name: "target_id",
    },
    kind: {
      type: String,
    },
    label: {
      type: String,
    },
    weight: {
      type: "float",
      default: 1,
    },
    createdAt: {
      type: Date,
      name: "created_at",
      createDate: true,
    },
  },
});
