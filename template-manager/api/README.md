# Template Manager API

Backend service for the Course Template Management Widget.

## Planned Endpoints

- `POST /api/d2l/proxy` – Proxy D2L API calls (auth from eLC session)
- `GET /api/drive/auth` – Initiate Google Drive OAuth
- `POST /api/export` – Export template to Google Drive (zip + upload)

## Setup

```bash
npm install
npm start
```

Set `PORT` in environment if needed.

## Environment Variables (future)

- `GOOGLE_CLIENT_ID` – OAuth client ID
- `GOOGLE_CLIENT_SECRET` – OAuth client secret
- `D2L_APP_ID` / `D2L_APP_KEY` – If server-side D2L calls needed
