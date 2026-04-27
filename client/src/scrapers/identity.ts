import type { Person } from "../types/person";
import type { IdentityEnrichment } from "../types/enrichment";

type GenderizeResponse = {
  name: string;
  gender: "male" | "female" | null;
  probability: number;
  count: number;
};

type AgifyResponse = {
  name: string;
  age: number | null;
  count: number;
};

export const runIdentityScraper = async (person: Person): Promise<IdentityEnrichment> => {
  const first = person.name.first;
  const [genderRes, ageRes] = await Promise.all([
    fetch(`https://api.genderize.io/?name=${encodeURIComponent(first)}`),
    fetch(`https://api.agify.io/?name=${encodeURIComponent(first)}`),
  ]);

  if (!genderRes.ok) throw new Error(`Genderize failed (${genderRes.status})`);
  if (!ageRes.ok) throw new Error(`Agify failed (${ageRes.status})`);

  const gender = (await genderRes.json()) as GenderizeResponse;
  const age = (await ageRes.json()) as AgifyResponse;

  const ageDelta =
    age.age != null ? Math.abs(age.age - person.dob.age) : null;

  let score = 0;
  let parts = 0;
  if (gender.gender != null) {
    parts += 1;
    score += gender.gender === person.gender ? gender.probability : 1 - gender.probability;
  }
  if (ageDelta != null) {
    parts += 1;
    score += Math.max(0, 1 - ageDelta / 20);
  }
  const consistency = parts > 0 ? Math.round((score / parts) * 100) : 0;

  return {
    firstName: first,
    reportedGender: person.gender,
    predictedGender: gender.gender,
    genderProbability: gender.probability,
    reportedAge: person.dob.age,
    predictedAge: age.age,
    ageDelta,
    consistencyScore: consistency,
  };
};
