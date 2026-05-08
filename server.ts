import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add JSON parsing
  app.use(express.json());

  // Proxy ISS position with fallback
  app.get("/api/iss-position", async (req, res) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      let data;
      try {
        const response = await fetch("http://api.open-notify.org/iss-now.json", { signal: controller.signal });
        clearTimeout(timeout);
        if (!response.ok) throw new Error("open-notify not ok");
        data = await response.json();
      } catch (err) {
        clearTimeout(timeout);
        // Fallback to wheretheiss
        const fallbackRes = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
        if (!fallbackRes.ok) throw new Error("Fallback wheretheiss failed");
        const fallbackData = await fallbackRes.json();
        data = {
          message: "success",
          timestamp: fallbackData.timestamp,
          iss_position: {
            latitude: fallbackData.latitude.toString(),
            longitude: fallbackData.longitude.toString()
          }
        };
      }
      res.json(data);
    } catch (error: any) {
      console.error("ISS Position proxy error:", error);
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
      console.error("Astronauts proxy error:", error);
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
      console.error("News proxy error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy Reverse Geocode
  app.get("/api/reverse-geocode", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) return res.status(400).json({ error: "Missing lat/lon" });
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=3`, {
        headers: {
          "User-Agent": "SpaceDashApp/1.0",
          "Accept-Language": "en"
        }
      });
      if (!response.ok) throw new Error("Nominatim fetch failed");
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Reverse geocode proxy error:", error);
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
