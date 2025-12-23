import { Request, Response } from "express";
import { ZodError } from "zod";
import { createAuthSchema } from "./auth.schema";
import { authService } from "./auth.service";

export const createAuthHandler = async (req: Request, res: Response) => {
  try {
    const dto = createAuthSchema.parse(req.body);
    const user = await authService.register(dto);
    res.status(201).json({ id: user.id });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.issues });
      return;
    }
    console.error("Auth creation error:", error);
    res.status(500).json({ message: "Server error occurred." });
  }
};
