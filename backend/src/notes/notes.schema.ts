import { z } from "zod";
import { NoteVisibility } from "../generated/client/enums";

export const createNoteSchema = z
  .object({
    title: z.string().optional(),
    content: z
      .string()
      .min(1, "Content must not be empty")
      .max(100000, "Content must not exceed 100,000 characters"),
    visibility: z
      .enum([NoteVisibility.PUBLIC, NoteVisibility.PRIVATE])
      .default(NoteVisibility.PRIVATE),
  })
  .strict();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = z
  .object({
    title: z.string().optional(),
    content: z
      .string()
      .min(1, "Content must not be empty")
      .max(100000, "Content must not exceed 100,000 characters")
      .optional(),
    visibility: z
      .enum([NoteVisibility.PUBLIC, NoteVisibility.PRIVATE])
      .optional(),
  })
  .strict();

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
