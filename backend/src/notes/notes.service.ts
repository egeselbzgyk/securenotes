import { prisma } from "../lib/prisma";
import { CreateNoteInput, UpdateNoteInput } from "./notes.schema";
import sanitizeMarkdown from "../shared/utils/markdownSanitizer";
import parserMarkdown from "../shared/utils/mardownParser";
import { NoteVisibility } from "../generated/client/enums";
import { Prisma } from "../generated/client/client";

export const createNote = async (input: CreateNoteInput, userId: string) => {
  const newNote = await prisma.note.create({
    data: {
      ...input,
      authorId: userId,
    },
  });

  // Generate and sanitize HTML content for the new note
  const parsedContent = await parserMarkdown(newNote.content);
  const sanitizedContent = sanitizeMarkdown(parsedContent);

  return {
    ...newNote,
    htmlContent: sanitizedContent,
  };
};

export const getNoteById = async (id: string, userId?: string) => {
  // Check if user is logged in
  if (!userId) {
    return null;
  }

  const note = await prisma.note.findUnique({
    where: { id },
  });

  if (!note) {
    return null;
  }

  const parsedContent = await parserMarkdown(note.content);
  const sanitizedContent = sanitizeMarkdown(parsedContent);

  return {
    ...note,
    htmlContent: sanitizedContent,
  };
};

export const getAllNotes = async (userId: string, filterType?: string) => {
  let whereCondition: Prisma.NoteWhereInput;

  if (filterType === "own") {
    // Only user's own notes (both PUBLIC and PRIVATE)
    whereCondition = { authorId: userId };
  } else if (filterType === "public") {
    // Only PUBLIC notes (from any user)
    whereCondition = { visibility: NoteVisibility.PUBLIC };
  } else {
    // Default: User's own notes OR all PUBLIC notes
    whereCondition = {
      OR: [
        { visibility: NoteVisibility.PUBLIC },
        { visibility: NoteVisibility.PRIVATE, authorId: userId },
      ],
    };
  }

  return await prisma.note.findMany({
    where: whereCondition,
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

export const updateNote = async (
  id: string,
  input: UpdateNoteInput,
  userId: string
) => {
  // First check if note exists and belongs to user
  const note = await prisma.note.findUnique({
    where: { id },
  });

  if (!note) {
    return null;
  }

  if (note.authorId !== userId) {
    return null;
  }

  const updatedNote = await prisma.note.update({
    where: { id },
    data: input,
  });

  // Generate and sanitize HTML content for the updated note
  const parsedContent = await parserMarkdown(updatedNote.content);
  const sanitizedContent = sanitizeMarkdown(parsedContent);

  return {
    ...updatedNote,
    htmlContent: sanitizedContent,
  };
};

export const deleteNote = async (id: string, userId: string) => {
  // First check if note exists and belongs to user
  const note = await prisma.note.findUnique({
    where: { id },
  });

  if (!note) {
    return false;
  }

  if (note.authorId !== userId) {
    return false;
  }

  await prisma.note.delete({
    where: { id },
  });

  return true;
};
