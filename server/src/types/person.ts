export type ProfileSource = "random" | "saved";

export type PersonName = {
  title: string;
  first: string;
  last: string;
};

export type PersonPicture = {
  thumbnail: string;
  large: string;
};

export type PersonLocation = {
  country: string;
  streetNumber: number;
  streetName: string;
  city: string;
  state: string;
};

export type PersonDob = {
  age: number;
  date: string;
};

export type Person = {
  id: string;
  source: ProfileSource;
  gender: string;
  name: PersonName;
  email: string;
  phone: string;
  picture: PersonPicture;
  location: PersonLocation;
  dob: PersonDob;
};

export type PersonNameUpdate = {
  name: PersonName;
};
