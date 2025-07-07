import express from "express";
import cors from "cors";
import { createServer as createHttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import { handleDemo } from "./routes/demo";
import { authRoutes } from "./routes/auth";
import { boardRoutes } from "./routes/boards";
import { User } from "@shared/types";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export function createServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Authentication middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      req.user = user;
      next();
    });
  };

  // API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "CollabBoard API is running!" });
  });

  app.get("/api/demo", handleDemo);
  app.use("/api/auth", authRoutes);
  app.use("/api/boards", authenticateToken, boardRoutes);

  // Socket.IO for real-time collaboration
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return next(new Error("Authentication error"));
      }
      (socket as any).user = user as User;
      next();
    });
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user;
    console.log(`User ${user.name} connected`);

    // Join board room
    socket.on("board:join", ({ boardId, user }) => {
      socket.join(`board:${boardId}`);
      socket.to(`board:${boardId}`).emit("user:joined", user);
    });

    // Leave board room
    socket.on("board:leave", ({ boardId, userId }) => {
      socket.leave(`board:${boardId}`);
      socket.to(`board:${boardId}`).emit("user:left", userId);
    });

    // Card operations
    socket.on("card:create", (data) => {
      socket.to(`board:${data.card.columnId}`).emit("card:create", data.card);
    });

    socket.on("card:update", (data) => {
      socket.to(`board:${data.card.columnId}`).emit("card:update", data.card);
    });

    socket.on("card:move", (data) => {
      socket.to(`board:${data.boardId}`).emit("card:move", data);
    });

    // Cursor tracking
    socket.on("cursor:move", (data) => {
      socket.to(`board:${data.boardId}`).emit("cursor:move", {
        ...data,
        userId: user.id,
        userName: user.name,
      });
    });

    socket.on("disconnect", () => {
      console.log(`User ${user.name} disconnected`);
    });
  });

  return { app, httpServer, io };
}
