import { Router } from "express";
import {
  createApiKeyHandler,
  listApiKeysHandler,
  revokeApiKeyHandler,
} from "./api-keys.controller";
import { authMiddleware } from "../shared/middlewares/auth.middleware";

const router = Router();

// Requires authentication for all routes
router.use(authMiddleware);

router.get("/", listApiKeysHandler);
router.post("/", createApiKeyHandler);
router.delete("/:id", revokeApiKeyHandler);

export default router;
