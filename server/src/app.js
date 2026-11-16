import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import env from "./config/env.js";

import authRoutes from "./modules/auth/auth.routes.js";
import repositoryRoutes from "./modules/repository/repository.routes.js";
import scanRoutes from "./modules/scan/scan.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";

import {
  notFound,
  errorHandler,
} from "./middlewares/error.middleware.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes

app.use("/api/auth", authRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/scans", scanRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/chats", chatRoutes);

// Health check

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ShipSafe API is running!",
    timestamp: new Date().toISOString(),
  });
});

// Error handling

app.use(notFound);
app.use(errorHandler);

export default app;