import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email("Invalid email format")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    // .min(6, "Password must be at least 6 characters")
    // .max(50, "Password too long"),
});

export const registerSchema=z.object({
    name: z.string().min(2, "Name is too short"),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20),

  email: z.email("Invalid email format").toLowerCase().trim(),

  number: z
    .string()
    .regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),

  password: z
    .string()
    .min(6)
    .regex(/[A-Z]/, "Must include uppercase")
    .regex(/[a-z]/, "Must include lowercase")
    .regex(/[0-9]/, "Must include number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must include special character"),

  image: z.any().optional(),
})

export const addPostSchema = z.object({
  caption: z
    .string()
    .max(500, "Caption too long")
    .optional(),

  option: z.enum(["post", "story"], {
    errorMap: () => ({ message: "Invalid option (post/story only)" }),
  }),

  image: z.any(),
});

export const editProfileSchema = z.object({
  name: z.string().min(2, "Name too short").optional(),

  username: z.string().min(3, "Username too short").optional(),

  bio: z.string().max(150, "Bio too long").optional(),

  image: z.any().optional(),
});