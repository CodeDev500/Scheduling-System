import { z } from "zod";

export const subjectSchema = z.object({
  subjectCode: z.string().nullable().optional(),
  subjectDescription: z.string().nullable().optional(),
  lec: z.number().int().nullable().optional(),
  lab: z.number().int().nullable().optional(),
  units: z.number().int().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Subject = z.infer<typeof subjectSchema>;
