import { connectionRepository } from "../db/connectionRepository.js";
import { peopleRepository } from "../db/peopleRepository.js";
import type {
  Connection,
  ConnectionInput,
  ConnectionKind,
} from "../types/connection.js";
import type { Person } from "../types/person.js";
import { NotFoundError } from "../utils/errors.js";

const ageBand = (age: number): string => {
  if (age < 25) return "<25";
  if (age < 35) return "25-34";
  if (age < 50) return "35-49";
  if (age < 65) return "50-64";
  return "65+";
};

const titleCase = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const connectionService = {
  async list(): Promise<Connection[]> {
    return connectionRepository.list();
  },

  async create(input: ConnectionInput): Promise<Connection> {
    return connectionRepository.create(input);
  },

  async delete(id: string): Promise<void> {
    const deleted = await connectionRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError("Connection was not found");
    }
  },

  async autoLinkOnSave(person: Person): Promise<void> {
    const peers = await peopleRepository.list();

    for (const peer of peers) {
      if (peer.id === person.id) continue;

      if (peer.location.country === person.location.country) {
        const exists = await connectionRepository.existsBetween(
          person.id,
          peer.id,
          "shared_country",
        );
        if (!exists) {
          await connectionRepository.create({
            sourceId: person.id,
            targetId: peer.id,
            kind: "shared_country",
            label: `Shared origin: ${person.location.country}`,
            weight: 0.6,
          });
        }
      }

      if (ageBand(peer.dob.age) === ageBand(person.dob.age)) {
        const exists = await connectionRepository.existsBetween(
          person.id,
          peer.id,
          "same_age_band",
        );
        if (!exists) {
          await connectionRepository.create({
            sourceId: person.id,
            targetId: peer.id,
            kind: "same_age_band",
            label: `Same cohort: ${ageBand(person.dob.age)}`,
            weight: 0.3,
          });
        }
      }
    }
  },

  async synthesize(): Promise<Connection[]> {
    const people = await peopleRepository.list();

    for (let i = 0; i < people.length; i += 1) {
      for (let j = i + 1; j < people.length; j += 1) {
        const a = people[i];
        const b = people[j];

        const checks: Array<{ kind: ConnectionKind; label: string; weight: number; match: boolean }> = [
          {
            kind: "shared_country",
            label: `Shared origin: ${a.location.country}`,
            weight: 0.6,
            match: a.location.country === b.location.country,
          },
          {
            kind: "same_age_band",
            label: `Same cohort: ${ageBand(a.dob.age)}`,
            weight: 0.3,
            match: ageBand(a.dob.age) === ageBand(b.dob.age),
          },
          {
            kind: "co_signal",
            label: `Co-signal: ${titleCase(a.gender)} / ${titleCase(b.gender)}`,
            weight: 0.2,
            match: a.gender === b.gender && a.location.country === b.location.country,
          },
        ];

        for (const check of checks) {
          if (!check.match) continue;
          const exists = await connectionRepository.existsBetween(a.id, b.id, check.kind);
          if (exists) continue;
          await connectionRepository.create({
            sourceId: a.id,
            targetId: b.id,
            kind: check.kind,
            label: check.label,
            weight: check.weight,
          });
        }
      }
    }

    return connectionRepository.list();
  },

  async deleteByPerson(personId: string): Promise<void> {
    await connectionRepository.deleteByPerson(personId);
  },
};
