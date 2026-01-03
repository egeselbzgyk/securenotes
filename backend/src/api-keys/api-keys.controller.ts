import { Request, Response } from "express";
import { ZodError } from "zod";
import { createApiKeySchema } from "./api-keys.schema";
import { generateApiKey, listUserKeys, revokeKey } from "./api-keys.service";

export const createApiKeyHandler = async (req: Request, res: Response) => {
  try {
    const validatedData = createApiKeySchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const apiKey = await generateApiKey(userId, validatedData);

    // 201 Created
    res.status(201).json(apiKey);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.issues });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const listApiKeysHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const keys = await listUserKeys(userId);
    res.json(keys);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const revokeApiKeyHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const success = await revokeKey(id, userId);

    if (!success) {
      res.status(404).json({ message: "API key not found" });
      return;
    }

    res.json({ message: "API key revoked" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
