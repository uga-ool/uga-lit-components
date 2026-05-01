# Minimal Google Drive upload service

Supports **Phase 3** of the course template widget: keep **service account credentials** off the browser and upload an export **blob** to a configured Drive folder.

## Setup

```bash
cd server/drive-upload
npm install
cp .env.example .env
# Edit .env: GOOGLE_DRIVE_FOLDER_ID, and either GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS
npm start
```

## API

- `GET /health` – returns `{ ok: true }`
- `POST /upload` – raw body (`application/octet-stream`) is uploaded as a new file in the target folder  
  - Optional: `Authorization: Bearer <DRIVE_UPLOAD_TOKEN>` if `DRIVE_UPLOAD_TOKEN` is set in `.env`

The `uga-elc-google-sync` component can point `drive-upload-url` to `http://localhost:3847/upload` in development only.

## Production

Run behind HTTPS, restrict by network or OAuth at your gateway, and use a **Shared Drive** with least-privilege service account access.
