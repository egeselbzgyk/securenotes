import { Router, Request, Response, NextFunction } from "express";
import {
  createNoteHandler,
  getAllNotesHandler,
  getNoteByIdHandler,
  searchNotesHandler,
} from "./notes.controller";

const router = Router();

const mockAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.user = {
    id: "8e8d5e80-7fe5-408d-9ebb-d57625e5e7ac", //  user ID
  };
  next();
};

router.use(mockAuthMiddleware);

router.get("/", getAllNotesHandler);
router.post("/", createNoteHandler);
router.get("/search", searchNotesHandler);
router.get("/:id", getNoteByIdHandler);
export default router;
