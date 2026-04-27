import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DATA_DIRECTORY, PEOPLE_FILE } from "../constants.js";
import type { Person, PersonName } from "../types/person.js";

const dataPath = path.join(process.cwd(), DATA_DIRECTORY);
const peoplePath = path.join(dataPath, PEOPLE_FILE);

const ensureStore = async (): Promise<void> => {
  await mkdir(dataPath, { recursive: true });
};

const readPeople = async (): Promise<Person[]> => {
  await ensureStore();

  try {
    const content = await readFile(peoplePath, "utf8");
    return JSON.parse(content) as Person[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
};

const writePeople = async (people: Person[]): Promise<void> => {
  await ensureStore();
  await writeFile(peoplePath, JSON.stringify(people, null, 2));
};

export const peopleRepository = {
  async list(): Promise<Person[]> {
    return readPeople();
  },

  async save(person: Person): Promise<Person> {
    const people = await readPeople();
    const savedPerson = { ...person, source: "saved" as const };
    const withoutDuplicate = people.filter((item) => item.id !== person.id);
    await writePeople([...withoutDuplicate, savedPerson]);
    return savedPerson;
  },

  async updateName(id: string, name: PersonName): Promise<Person | null> {
    const people = await readPeople();
    const index = people.findIndex((person) => person.id === id);

    if (index === -1) {
      return null;
    }

    const updated = { ...people[index], name };
    people[index] = updated;
    await writePeople(people);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const people = await readPeople();
    const nextPeople = people.filter((person) => person.id !== id);
    await writePeople(nextPeople);
    return nextPeople.length !== people.length;
  },
};
