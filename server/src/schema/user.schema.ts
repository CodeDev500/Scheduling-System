import { z } from "zod";
import { UserRoles, UserStatuses } from "../constants/constants";

export const registerUserSchema = z.object({
  image: z.string().nullable().optional(),
  firstname: z.string().min(1, { message: "First name is required" }),
  lastname: z.string().min(1, { message: "Last name is required" }),
  middleInitial: z.string().min(1, { message: "Middle initial is required" }),
  email: z
    .string()
    .email({ message: "Invalid email address e.g. sample@gmail.com" }),
  designation: z.string().min(1, { message: "Designation is required" }),
  department: z.string().min(1, { message: "Department is required" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  role: z.enum(UserRoles),
  status: z.enum(UserStatuses),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address e.g. sample@gmail.com" }),
  password: z.string().trim().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});

export type Register = z.infer<typeof registerUserSchema>;
export type Login = z.infer<typeof loginSchema>;
