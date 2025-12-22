import { z } from "zod";
import { NoteVisibility } from "../generated/client/enums";

export const createNoteSchema = z
  .object({
    title: z.string().optional(),
    content: z.string(),
    visibility: z
      .enum([NoteVisibility.PUBLIC, NoteVisibility.PRIVATE])
      .default(NoteVisibility.PRIVATE),
  })
  .strict();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
