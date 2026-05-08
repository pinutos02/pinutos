import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });
  const PORT = 3000;

  app.use(express.json());

  // Live occupancy simulation for WebSocket demo
  let occupancy = 65;
  setInterval(() => {
    const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    occupancy = Math.max(40, Math.min(120, occupancy + change));
    io.emit("occupancy-update", { count: occupancy, max: 150 });
  }, 5000);

  io.on("connection", (socket) => {
    socket.emit("occupancy-update", { count: occupancy, max: 150 });
    
    socket.on("order-submitted", (data) => {
      // Broadcast to admin dashboard
      io.emit("new-order-alert", data);
    });
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Example API route for catering inquiries (could be handled via Firestore, but Express is good for server-side logic/emails)
  app.post("/api/inquiry", (req, res) => {
    // Logic for handling inquiry, maybe sending an email
    res.json({ message: "Inquiry received" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
