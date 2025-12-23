import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { prisma } from "./lib/prisma";
import notesRoutes from "./notes/notes.routes";
import authRoutes from "./auth/auth.routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Vite default
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Cookie transfer
  })
);

app.use(express.json({ limit: "10kb" }));
app.set("trust proxy", 1);

app.use("/notes", notesRoutes);
app.use("/auth", authRoutes);

app.get("/", async (req: Request, res: Response) => {
  try {
    const userCount = await prisma.user.count();
    res.json({
      message: "API is running!",
      database_status: "Connected",
      user_count: userCount,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Database Connection Error:", error);
    res.status(500).json({
      message: "API is running but Database connection failed.",
      error: String(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running securely on http://localhost:${PORT}`);
});
