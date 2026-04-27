import { EntitySchema } from "typeorm";

export type StoredSetting = {
  key: string;
  value: string;
  updatedAt: Date;
};

export const settingEntity = new EntitySchema<StoredSetting>({
  name: "Setting",
  tableName: "settings",
  columns: {
    key: {
      type: String,
      primary: true,
    },
    value: {
      type: String,
    },
    updatedAt: {
      type: Date,
      name: "updated_at",
      updateDate: true,
      createDate: true,
    },
  },
});
