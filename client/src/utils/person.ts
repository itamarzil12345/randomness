import type { Person, PersonName, RandomUser } from "../types/person";

export const toFullName = (name: PersonName): string =>
  [name.title, name.first, name.last].join(" ");

export const getBirthYear = (date: string): number => {
  return new Date(date).getFullYear();
};

export const mapRandomUser = (user: RandomUser): Person => ({
  id: user.login.uuid,
  source: "random",
  gender: user.gender,
  name: user.name,
  email: user.email,
  phone: user.phone,
  picture: user.picture,
  location: {
    country: user.location.country,
    streetNumber: user.location.street.number,
    streetName: user.location.street.name,
    city: user.location.city,
    state: user.location.state,
  },
  dob: user.dob,
});

export const filterPeople = (
  people: Person[],
  nameFilter: string,
  countryFilter: string,
): Person[] => {
  const nameQuery = nameFilter.trim().toLowerCase();
  const countryQuery = countryFilter.trim().toLowerCase();

  return people.filter((person) => {
    const nameMatches = toFullName(person.name).toLowerCase().includes(nameQuery);
    const countryMatches = person.location.country
      .toLowerCase()
      .includes(countryQuery);

    return nameMatches && countryMatches;
  });
};
