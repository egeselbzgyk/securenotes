import "express";

declare module "express-serve-static-core" {
  interface Request {
    auth?: {
      userId: string;
      sessionId: string;
    };
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export {};
