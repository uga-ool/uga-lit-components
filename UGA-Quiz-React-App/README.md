# UGA Quiz React App

React app for embedding the **uga-quiz** component in D2L/eLC (Brightspace). This project is based on the **UGA-Brightspace-React-Apps** template developed by **James** for use as a starter for React apps in eLC.

## Credits

- **James** — Main developer; created the UGA-Brightspace-React-Apps template used as the basis for this project.
- **uga-lit-components** — Provides the `uga-quiz` web component and related D2L integration.
- **UGA Office of Online Learning** — Design system ([design.online.uga.edu](https://design.online.uga.edu/)).

## Prerequisites

- Node.js 18+

## Combined folder

This folder is **self-contained**: all necessary files from the workspace are copied here.

| Location                   | Contents                                                               |
| -------------------------- | ---------------------------------------------------------------------- |
| `public/uga-components.js` | Quiz web component bundle (from uga-lit-components build)              |
| `public/quiz-sample.csv`   | Sample quiz in D2L CSV format                                          |
| `public/quiz-demo.json`    | Sample quiz in JSON format                                             |
| `api-service/`             | Backend API for submitting grades to D2L (see `api-service/README.md`) |

You can run the app without the uga-lit-components repo.

## Quick Start

```bash
cd UGA-Quiz-React-App
npm install
npm run dev
```

Open [http://localhost:5174](http://localhost:5174).

To update the quiz component bundle from uga-lit-components (optional):

1. In **uga-lit-components**: `npm run build`
2. Copy `uga-lit-components/dist/js/uga-components.js` to this app’s `public/uga-components.js`
3. Or run `npm run postinstall` here if uga-lit-components is a sibling directory

### Optional: Gradebook API

To submit grades from the quiz to eLC (especially for students), use the API service included in this folder:

1. Set up and run the API service: `cd api-service`, then see `api-service/README.md` and `api-service/SETUP.md`.
2. Create `.env` in this app root:

   ```env
   VITE_QUIZ_API_ENDPOINT=https://your-api-domain.com/api/quiz/submit
   ```

3. Restart the dev server. The quiz page uses this endpoint when set.

## Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start dev server (port 5174) |
| `npm run build`   | Production build to `dist/`  |
| `npm run preview` | Preview production build     |

## Project Structure

```
UGA-Quiz-React-App/
├── api-service/            # Gradebook API (optional; for student grade submission)
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── README.md
│   └── SETUP.md
├── public/
│   ├── uga-components.js   # Quiz web component bundle
│   ├── quiz-sample.csv     # Sample quiz (D2L CSV format)
│   └── quiz-demo.json      # Sample quiz (JSON format)
├── scripts/
│   └── copy-uga-components.js
├── src/
│   ├── components/
│   │   └── UgaQuiz.tsx     # React wrapper for uga-quiz
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   └── QuizPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── README.md
```

## Deploying to a New Repo

1. Clone or create the new repo (e.g. `UGA-Quiz-React-App` or your preferred name).
2. Copy this entire folder into the repo root (or copy its contents into the repo root).
3. Do **not** commit `public/uga-components.js` if you want to keep the repo independent; add to `.gitignore` and document that users must copy it from uga-lit-components or run the postinstall script from a clone that has uga-lit-components as a sibling.
4. Commit and push:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: UGA Quiz React App (from UGA-Brightspace-React-Apps template)"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

## Embedding in eLC

- Build: `npm run build`. Output is in `dist/` with relative base (`base: './'`) for embedding.
- Upload `dist/` to your eLC Public Files or host it on a server and link from Content (e.g. iframe or link).
- Ensure the page that loads the app also loads `uga-components.js` before the app bundle (this app’s `index.html` already does that for the built assets).

## Template Reference

This app follows the structure and patterns of **UGA-Brightspace-React-Apps** (James). For new eLC React apps, start from that template; this repo is a concrete instance that adds the uga-quiz component and minimal routing/pages.

## License

Same as the UGA-Brightspace-React-Apps template and uga-lit-components (see their repos).
