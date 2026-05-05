# Deployment Instructions

This application is ready for deployment on **Vercel**, **Cloud Run**, or any other Node.js environment.

## 1. Vercel Deployment (Recommended)

1. Connect your repository to Vercel.
2. The `vercel.json` and `/api/notify.ts` files are already configured to handle backend logic as serverless functions.
3. Configure the following **Environment Variables** in the Vercel dashboard:
   - `TELEGRAM_BOT_TOKEN`: Your bot token from @BotFather.
   - `TELEGRAM_CHAT_ID`: Your chat ID (you can get this from @userinfobot).
   - `VITE_DOWNLOAD_URL`: The URL of the file to be downloaded (optional, defaults to preset URL).

## 2. Manual Server Deployment (Node.js/Docker)

If you are using a standard VPS or container:
1. Run `npm install`.
2. Run `npm run build`.
3. Start the server with `npm start`.
4. The server is configured to serve static files from the `dist/` directory in production.

## 3. Environment Variables
Make sure to set these in your hosting provider's settings:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `VITE_DOWNLOAD_URL`
