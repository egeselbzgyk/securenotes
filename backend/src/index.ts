import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

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

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "API is running!",
    timestamp: new Date(),
  });
});

app.listen(PORT, () => {
  console.log(`Server is running securely on http://localhost:${PORT}`);
});
