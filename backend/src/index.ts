import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { createRateLimiter } from "./shared/middlewares/rateLimit";
import { prisma } from "./lib/prisma";
import notesRoutes from "./notes/notes.routes";
import authRoutes from "./auth/auth.routes";
import apiKeysRoutes from "./api-keys/api-keys.routes";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;

// Apply rate limiting to prevent DDoS attacks
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(apiLimiter);

// Helmet with security headers including CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://*.ytimg.com"],
        frameSrc: [
          "https://www.youtube.com",
          "https://www.youtube-nocookie.com",
          "https://youtu.be",
        ],
        connectSrc: ["'self'", "ws://localhost:*"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
      },
    },
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Vite default
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Cookie transfer
  })
);

app.use(cookieParser());

app.use(express.json({ limit: "10kb" }));
app.set("trust proxy", 1);

app.use("/notes", notesRoutes);
app.use("/auth", authRoutes);
app.use("/api-keys", apiKeysRoutes);

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
    res.status(500).json({
      message: "API is running but Database connection failed.",
      error: String(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running securely on http://localhost:${PORT}`);
});
