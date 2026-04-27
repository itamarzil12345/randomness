import { peopleRepository } from "../db/peopleRepository.js";
import type { Person, PersonName } from "../types/person.js";
import { NotFoundError } from "../utils/errors.js";
import { connectionService } from "./connectionService.js";
import { enrichmentService } from "./enrichmentService.js";

export const peopleService = {
  list(): Promise<Person[]> {
    return peopleRepository.list();
  },

  async save(person: Person): Promise<Person> {
    const saved = await peopleRepository.save(person);
    await connectionService.autoLinkOnSave(saved);
    return saved;
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

    await connectionService.deleteByPerson(id);
    await enrichmentService.deleteByPerson(id);
  },
};
