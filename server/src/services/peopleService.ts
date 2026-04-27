import { peopleRepository } from "../db/peopleRepository.js";
import type { Person, PersonName } from "../types/person.js";
import { NotFoundError } from "../utils/errors.js";

export const peopleService = {
  list(): Promise<Person[]> {
    return peopleRepository.list();
  },

  save(person: Person): Promise<Person> {
    return peopleRepository.save(person);
  },

  async updateName(id: string, name: PersonName): Promise<Person> {
    const person = await peopleRepository.updateName(id, name);

    if (!person) {
      throw new NotFoundError("Person was not found");
    }

    return person;
  },

  async delete(id: string): Promise<void> {
    const deleted = await peopleRepository.delete(id);

    if (!deleted) {
      throw new NotFoundError("Person was not found");
    }
  },
};
