import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  // Handle missing credentials gracefully for demo purposes
  if (!botToken || !chatId || botToken.includes("YOUR_BOT_TOKEN") || chatId.includes("YOUR_CHAT_ID")) {
    return res.status(200).json({ 
      success: true, 
      message: "Notification logged (Demo Mode).",
      debug: `User ${email} is requesting download.`
    });
  }

  try {
    const message = `🚀 *Download Request Initialized*\n\n📧 *Email:* ${email}\n📅 *Time:* ${new Date().toISOString()}\n\nUser has requested access to the secure document.`;
    
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Telegram Error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to send notification." });
  }
}
