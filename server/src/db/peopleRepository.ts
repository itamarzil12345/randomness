import type { Person, PersonName } from "../types/person.js";
import { getDataSource } from "./dataSource.js";
import type { StoredPerson } from "./peopleEntity.js";

const entityName = "Person";

const serializePerson = (person: Person): StoredPerson => ({
  id: person.id,
  profileJson: JSON.stringify(person),
  createdAt: new Date(),
  updatedAt: new Date(),
});

const parsePerson = (storedPerson: StoredPerson): Person => {
  return JSON.parse(storedPerson.profileJson) as Person;
};

const getRepository = async () => {
  const dataSource = await getDataSource();
  return dataSource.getRepository<StoredPerson>(entityName);
};

export const peopleRepository = {
  async list(): Promise<Person[]> {
    const repository = await getRepository();
    const storedPeople = await repository.find();
    return storedPeople.map(parsePerson);
  },

  async save(person: Person): Promise<Person> {
    const repository = await getRepository();
    const savedPerson = { ...person, source: "saved" as const };
    const existingPerson = await repository.findOneBy({ id: person.id });
    const storedPerson = serializePerson(savedPerson);

    await repository.save({
      ...storedPerson,
      createdAt: existingPerson?.createdAt ?? storedPerson.createdAt,
    });

    return savedPerson;
  },

  async updateName(id: string, name: PersonName): Promise<Person | null> {
    const repository = await getRepository();
    const storedPerson = await repository.findOneBy({ id });

    if (!storedPerson) {
      return null;
    }

    const updatedPerson = { ...parsePerson(storedPerson), name };
    await repository.save({
      ...storedPerson,
      profileJson: JSON.stringify(updatedPerson),
      updatedAt: new Date(),
    });

    return updatedPerson;
  },

  async delete(id: string): Promise<boolean> {
    const repository = await getRepository();
    const result = await repository.delete({ id });
    return Boolean(result.affected);
  },
};
