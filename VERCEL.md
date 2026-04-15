# Vercel Deployment Instructions

To deploy this application to Vercel, follow these steps:

## 1. Environment Variables
You must add the following environment variables in your Vercel Project Settings:

- `GEMINI_API_KEY`: Your Google Gemini API Key.
- `APP_URL`: The URL of your deployed Vercel app (e.g., `https://your-app.vercel.app`).

## 2. Firebase Configuration
- Go to the [Firebase Console](https://console.firebase.google.com/).
- Select your project.
- Go to **Authentication** > **Settings** > **Authorized Domains**.
- Add your Vercel deployment domain (`flash-deals-01.vercel.app`) to the list. This is required for Google Login to work.

## 3. Deployment
- Connect your GitHub repository to Vercel.
- Vercel will automatically detect the Vite project.
- **Architecture**: This project uses a Full-Stack approach.
  - **Frontend**: Vite (React)
  - **Backend**: Vercel Serverless Functions (in `/api`)
- The build command should be `npm run build`.
- The output directory should be `dist`.

## 4. Security
The chatbot now uses a server-side integration via `/api/chat.ts`. This ensures your `GEMINI_API_KEY` is never exposed to the browser, making the application production-ready and secure.
