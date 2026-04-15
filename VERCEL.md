# Vercel Deployment Instructions

To deploy this application to Vercel, follow these steps:

## 1. Environment Variables
You must add the following environment variables in your Vercel Project Settings:

- `GEMINI_API_KEY`: Your Google Gemini API Key.
- `VITE_GEMINI_API_KEY`: (Optional) If you want to use the key on the frontend (current implementation).
- `APP_URL`: The URL of your deployed Vercel app (e.g., `https://your-app.vercel.app`).

## 2. Firebase Configuration
- Go to the [Firebase Console](https://console.firebase.google.com/).
- Select your project.
- Go to **Authentication** > **Settings** > **Authorized Domains**.
- Add your Vercel deployment domain (e.g., `your-app.vercel.app`) to the list. This is required for Google Login to work.

## 3. Deployment
- Connect your GitHub repository to Vercel.
- Vercel will automatically detect the Vite project.
- The build command should be `npm run build`.
- The output directory should be `dist`.

## 4. Security
The chatbot currently uses a frontend-based integration for compatibility with the AI Studio preview environment. For a production deployment on Vercel, you may choose to move the Gemini API logic to a serverless function (e.g., in the `/api` directory) to further protect your `GEMINI_API_KEY`.
