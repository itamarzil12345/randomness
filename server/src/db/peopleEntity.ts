import { EntitySchema } from "typeorm";

export type StoredPerson = {
  id: string;
  profileJson: string;
  createdAt: Date;
  updatedAt: Date;
};

export const peopleEntity = new EntitySchema<StoredPerson>({
  name: "Person",
  tableName: "people",
  columns: {
    id: {
      type: String,
      primary: true,
    },
    profileJson: {
      type: String,
      name: "profile_json",
    },
    createdAt: {
      type: Date,
      name: "created_at",
      createDate: true,
    },
    updatedAt: {
      type: Date,
      name: "updated_at",
      updateDate: true,
    },
  },
});
