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
## 5. Troubleshooting: "Repository does not contain the requested branch"
If you see this error in Vercel or GitHub:
- **Empty Repository**: This usually means the code hasn't been pushed to the repository yet. If you are using the AI Studio "Export to GitHub" feature, ensure the export process completed successfully.
- **Branch Name**: Ensure your Vercel project is looking for the correct branch (usually `main`). You can check this in Vercel under **Settings > Git > Production Branch**.
- **Manual Push**: If you are pushing manually, ensure you have run:
  ```bash
  git add .
  git commit -m "Initial commit"
  git branch -M main
  git push -u origin main
  ```
