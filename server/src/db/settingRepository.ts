import { settingEntity, type StoredSetting } from "./settingEntity.js";
import { getDataSource } from "./dataSource.js";

const getRepository = async () => {
  const dataSource = await getDataSource();
  return dataSource.getRepository(settingEntity);
};

export const settingRepository = {
  async list(): Promise<StoredSetting[]> {
    const repository = await getRepository();
    return repository.find();
  },

  async get(key: string): Promise<StoredSetting | null> {
    const repository = await getRepository();
    return repository.findOneBy({ key });
  },

  async upsert(key: string, value: string): Promise<StoredSetting> {
    const repository = await getRepository();
    const existing = await repository.findOneBy({ key });
    if (existing) {
      existing.value = value;
      existing.updatedAt = new Date();
      await repository.save(existing);
      return existing;
    }
    const created: StoredSetting = { key, value, updatedAt: new Date() };
    await repository.save(created);
    return created;
  },
};
