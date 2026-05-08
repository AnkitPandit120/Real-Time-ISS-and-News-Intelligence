import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add JSON parsing
  app.use(express.json());

  // Proxy ISS position
  app.get("/api/iss-position", async (req, res) => {
    try {
      const response = await fetch("http://api.open-notify.org/iss-now.json");
      if (!response.ok) throw new Error("Failed to fetch ISS position");
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy ISS astronauts
  app.get("/api/astronauts", async (req, res) => {
    try {
      const response = await fetch("http://api.open-notify.org/astros.json");
      if (!response.ok) throw new Error("Failed to fetch astronauts");
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy News
  app.get("/api/news", async (req, res) => {
    try {
      const response = await fetch("https://api.spaceflightnewsapi.net/v4/articles/?limit=10");
      if (!response.ok) throw new Error("Failed to fetch news");
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Note: Use __dirname fallback since "type": "module" disables __dirname
    const currentDir = process.cwd();
    const distPath = path.join(currentDir, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
