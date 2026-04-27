import { randomUUID } from "node:crypto";
import type { Connection, ConnectionInput } from "../types/connection.js";
import { connectionEntity, type StoredConnection } from "./connectionEntity.js";
import { getDataSource } from "./dataSource.js";

const toApi = (stored: StoredConnection): Connection => ({
  id: stored.id,
  sourceId: stored.sourceId,
  targetId: stored.targetId,
  kind: stored.kind as Connection["kind"],
  label: stored.label,
  weight: stored.weight,
  createdAt: stored.createdAt.toISOString(),
});

const getRepository = async () => {
  const dataSource = await getDataSource();
  return dataSource.getRepository(connectionEntity);
};

export const connectionRepository = {
  async list(): Promise<Connection[]> {
    const repository = await getRepository();
    const stored = await repository.find();
    return stored.map(toApi);
  },

  async create(input: ConnectionInput): Promise<Connection> {
    const repository = await getRepository();
    const stored: StoredConnection = {
      id: randomUUID(),
      sourceId: input.sourceId,
      targetId: input.targetId,
      kind: input.kind,
      label: input.label,
      weight: input.weight ?? 1,
      createdAt: new Date(),
    };
    await repository.save(stored);
    return toApi(stored);
  },

  async delete(id: string): Promise<boolean> {
    const repository = await getRepository();
    const result = await repository.delete({ id });
    return Boolean(result.affected);
  },

  async deleteByPerson(personId: string): Promise<void> {
    const repository = await getRepository();
    await repository
      .createQueryBuilder()
      .delete()
      .where("source_id = :id OR target_id = :id", { id: personId })
      .execute();
  },

  async existsBetween(sourceId: string, targetId: string, kind: string): Promise<boolean> {
    const repository = await getRepository();
    const found = await repository.findOne({
      where: [
        { sourceId, targetId, kind },
        { sourceId: targetId, targetId: sourceId, kind },
      ],
    });
    return Boolean(found);
  },
};
