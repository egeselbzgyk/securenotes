import { prisma } from "../lib/prisma";
import { CreateNoteInput } from "./notes.schema";
import sanitizeMarkdown from "../shared/utils/markdownSanitizer";
import parserMarkdown from "../shared/utils/mardownParser";
import { NoteVisibility } from "../generated/client/enums";
import { Prisma } from "../generated/client/client";

export const createNote = async (input: CreateNoteInput, userId: string) => {
  return await prisma.note.create({
    data: {
      ...input,
      authorId: userId,
    },
  });
};

export const getNoteById = async (id: string) => {
  const note = await prisma.note.findUnique({
    where: { id },
  });

  if (!note) {
    return null;
  }

  const parsedContent = parserMarkdown(note.content);
  const sanitizedContent = sanitizeMarkdown(parsedContent);

  return {
    ...note,
    htmlContent: sanitizedContent,
  };
};

export const getAllNotes = async (userId: string) => {
  return await prisma.note.findMany({
    where: {
      OR: [
        { visibility: NoteVisibility.PUBLIC },
        { visibility: NoteVisibility.PRIVATE, authorId: userId },
      ],
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      visibility: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// filterType: 'own' | 'public' | undefined
export const searchNotes = async (
  query: string,
  userId: string,
  filterType?: string
) => {
  // Basic search condition (Search in title or content)
  const searchCondition = {
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
    ],
  };

  // Visibility condition
  let visibilityCondition: Prisma.NoteWhereInput;

  if (filterType === "own") {
    // Only user's own notes (Public or Private doesn't matter, it's mine enough)
    visibilityCondition = { authorId: userId };
  } else if (filterType === "public") {
    // Only Public notes (User's own or someone else's)
    visibilityCondition = { visibility: NoteVisibility.PUBLIC };
  } else {
    // Default: User's own notes OR Public notes
    visibilityCondition = {
      OR: [
        { visibility: NoteVisibility.PUBLIC },
        { visibility: NoteVisibility.PRIVATE, authorId: userId },
      ],
    };
  }
  return await prisma.note.findMany({
    where: {
      AND: [
        // @ts-expect-error: Prisma dynamic AND/OR types are complex and difficult to infer here.
        searchCondition,
        visibilityCondition,
      ],
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      visibility: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
