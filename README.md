# Ailo
Local business map for good design practices using React + OpenLayers (OpenStreetMap tiles) & Firebase (Auth and Firestore).

## Run locally
    npm install
    npm run dev
With no `.env`, Ailo runs in demo mode (sample data, nothing saved). To use Firebase, copy `.env.example` to `.env` and fill it in.

## Firebase setup
1. Create a project at console.firebase.google.com, add a Web app, copy its config into `.env`.
2. Build > Authentication > Sign-in method: enable Anonymous. Under Settings > Authorized domains, add `YOUR-USERNAME.github.io`.
3. Build > Firestore Database: create a database, then paste `firestore.rules` into the Rules tab and publish.

## Deploy to GitHub Pages
1. Push to a GitHub repo on `main`.
2. Repo Settings > Secrets and variables > Actions: add `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`.
3. Settings > Pages > Source: GitHub Actions. Every push to `main` redeploys.

Edit the About page in `src/pages/About.jsx`.