import { z } from "zod";

const reqString = z.string().trim().min(1, "Required");

export const signUpSchema = z.object({
  email: reqString.email("Invalid email address"),
  userName: reqString.regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only letters, numbers, - and _ allowed",
  ),
  password: reqString
    .min(8, "Must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).*$/,
      "Must contain at least 1 lowercase letter, 1 uppercase letter, and 1 special character",
    ),
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  userName: reqString,
  password: reqString,
});

export type LoginValues = z.infer<typeof loginSchema>;

export const createPostSchema = z.object({
  content: reqString,
});
