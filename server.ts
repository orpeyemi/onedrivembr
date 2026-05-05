import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for Telegram notification
  app.post("/api/notify", async (req, res) => {
    const { email } = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!botToken || !chatId || botToken.includes("YOUR_BOT_TOKEN") || chatId.includes("YOUR_CHAT_ID")) {
      console.warn("Telegram Bot Token or Chat ID not properly configured.");
      return res.status(200).json({ 
        success: true, 
        message: "Demo Mode: Notification logged to console since Telegram keys are missing.",
        debug: `User ${email} is requesting download.`
      });
    }

    try {
      const message = `🚀 *Download Request Initialized*\n\n📧 *Email:* ${email}\n📅 *Time:* ${new Date().toISOString()}\n\nUser has requested access to the secure document.`;
      
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown"
      });

      res.status(200).json({ success: true, message: "Notification sent to Telegram." });
    } catch (error: any) {
      console.error("Telegram API Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to send Telegram notification." });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
