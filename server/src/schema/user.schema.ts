import { z } from "zod";

export const userSchema = z.object({
  id: z.number().int().optional(),
  image: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  middleInitial: z.string(),
  email: z.string().email(),
  designation: z.string(),
  department: z.string(),
  password: z.string().min(8),
  role: z.enum(["CAMPUS_ADMIN", "REGISTRAR", "DEPARTMENT_HEAD", "FACULTY"]),
  status: z.enum(["PENDING", "VERIFIED", "APPROVED"]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof userSchema>;
