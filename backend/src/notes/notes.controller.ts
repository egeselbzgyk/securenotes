import { Request, Response } from "express";
import { ZodError } from "zod";
import { createNoteSchema } from "./notes.schema";
import {
  createNote,
  getAllNotes,
  getNoteById,
  searchNotes,
} from "./notes.service";

export const createNoteHandler = async (req: Request, res: Response) => {
  try {
    const validatedData = createNoteSchema.parse(req.body);

    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "User login has not been performed." });
      return;
    }

    const note = await createNote(validatedData, userId);

    res.status(201).json(note);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Invalid data",
        errors: error.issues,
      });
      return;
    }

    console.error("Note creation error:", error);
    res.status(500).json({ message: "Server error occurred." });
  }
};

export const getNoteByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const note = await getNoteById(id);

    if (!note) {
      res.status(404).json({ message: "Note not found." });
      return;
    }
    res.status(200).json(note);
  } catch (error) {
    console.error("Note retrieval error:", error);
    res.status(500).json({ message: "Server error occurred." });
  }
};

export const getAllNotesHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User login has not been performed." });
      return;
    }
    const notes = await getAllNotes(userId);
    res.status(200).json(notes);
  } catch (error) {
    console.error("Note retrieval error:", error);
    res.status(500).json({ message: "Server error occurred." });
  }
};

export const searchNotesHandler = async (req: Request, res: Response) => {
  try {
    const { query, type } = req.query;

    if (typeof query !== "string") {
      res.status(400).json({ message: "Invalid search term." });
      return;
    }

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      res.status(200).json([]);
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User login has not been performed." });
      return;
    }

    const notes = await searchNotes(trimmedQuery, userId, type as string);

    res.status(200).json(notes);
  } catch (error) {
    console.error("Note search error:", error);
    res.status(500).json({ message: "Server error occurred." });
  }
};
