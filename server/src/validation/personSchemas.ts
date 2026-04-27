import { z } from "zod";

export const nameSchema = z.object({
  title: z.string().trim().min(1),
  first: z.string().trim().min(1),
  last: z.string().trim().min(1),
});

export const personSchema = z.object({
  id: z.string().trim().min(1),
  source: z.enum(["random", "saved"]),
  gender: z.string().trim().min(1),
  name: nameSchema,
  email: z.string().trim().email(),
  phone: z.string().trim().min(1),
  picture: z.object({
    thumbnail: z.string().trim().url(),
    large: z.string().trim().url(),
  }),
  location: z.object({
    country: z.string().trim().min(1),
    streetNumber: z.number(),
    streetName: z.string().trim().min(1),
    city: z.string().trim().min(1),
    state: z.string().trim().min(1),
  }),
  dob: z.object({
    age: z.number(),
    date: z.string().trim().min(1),
  }),
});

export const updateNameSchema = z.object({
  name: nameSchema,
});
