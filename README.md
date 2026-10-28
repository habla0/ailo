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

## Editing businesses in Firebase
Submissions are final on the site, so all edits happen in the Firebase console (console edits are not limited by `firestore.rules`). Open Firestore Database > `businesses`, pick the business, then add or edit these string fields:

| Field | What it shows |
| --- | --- |
| `ownersPhoto` | The photo under "Meet the Owners" (see below) |
| `ownersIntro` | Text above the photo. Each line becomes its own paragraph. |
| `ownersCaption` | Larger text below the photo |
| `sticker` | The map pin: `navy`, `coral`, `cream` or `magenta` |

`ownersPhoto` accepts any of:
- **A file in this repo:** put the image in `public/owners/` (e.g. `public/owners/harbour-bean.jpg`), push to `main`, then set the field to `owners/harbour-bean.jpg`. Portrait photos (4:5) fit best; others are cropped to fill.
- **A link:** a full `https://` address of an image hosted elsewhere.
- **A photo uploaded with the submission:** stored as a long `data:image/jpeg…` value. Delete the field to remove it, or replace it with one of the options above.

Edit the About page in `src/pages/About.jsx`.