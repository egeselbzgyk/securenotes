import { Router } from "express";
import {
  createNoteHandler,
  getAllNotesHandler,
  getNoteByIdHandler,
  searchNotesHandler,
  updateNoteHandler,
  deleteNoteHandler,
} from "./notes.controller";
import { authMiddleware } from "../shared/middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getAllNotesHandler);
router.post("/", createNoteHandler);
router.get("/search", searchNotesHandler);
router.get("/:id", getNoteByIdHandler);
router.put("/:id", updateNoteHandler);
router.delete("/:id", deleteNoteHandler);
export default router;
