import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import "reflect-metadata";
import { DataSource } from "typeorm";
import {
  DATA_DIRECTORY,
  LEGACY_PEOPLE_FILE,
  SQLITE_FILE,
} from "../constants.js";
import type { Person } from "../types/person.js";
import { connectionEntity } from "./connectionEntity.js";
import { enrichmentEntity } from "./enrichmentEntity.js";
import { peopleEntity, type StoredPerson } from "./peopleEntity.js";
import { settingEntity } from "./settingEntity.js";

const dataPath = path.join(process.cwd(), DATA_DIRECTORY);
const sqlitePath = path.join(dataPath, SQLITE_FILE);
const legacyPeoplePath = path.join(dataPath, LEGACY_PEOPLE_FILE);

let dataSource: DataSource | null = null;

const readLegacyPeople = async (): Promise<Person[]> => {
  try {
    const content = await readFile(legacyPeoplePath, "utf8");
    return JSON.parse(content) as Person[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
};

const createDataSource = (): DataSource =>
  new DataSource({
    type: "sqljs",
    location: sqlitePath,
    autoSave: true,
    synchronize: true,
    entities: [peopleEntity, connectionEntity, enrichmentEntity, settingEntity],
  });

const migrateLegacyPeople = async (source: DataSource): Promise<void> => {
  const repository = source.getRepository<StoredPerson>("Person");
  const existingCount = await repository.count();

  if (existingCount > 0) {
    return;
  }

  const people = await readLegacyPeople();
  const storedPeople = people.map((person) => ({
    id: person.id,
    profileJson: JSON.stringify({ ...person, source: "saved" }),
  }));

  await repository.save(storedPeople);
};

export const getDataSource = async (): Promise<DataSource> => {
  if (dataSource?.isInitialized) {
    return dataSource;
  }

  await mkdir(dataPath, { recursive: true });
  dataSource = createDataSource();
  await dataSource.initialize();
  await migrateLegacyPeople(dataSource);
  return dataSource;
};
