# Video analytics API (local / MVP)

Small Express service used by **`uga-video`** during local development: the Vite dev server proxies `/api/video-analytics` to **port 3001**.

## Endpoints

- `POST /api/video-analytics/events` — append view/session events (in-memory).
- `GET /api/video-analytics/aggregate?ou=...&entryIds=...` — aggregate counts for demos / course analytics.

## Setup

From repo root:

```bash
cd server/video-analytics && npm install && npm run dev
```

Set `PORT` if you need a port other than **3001** (and align `vite.config.ts` proxy `target` if so).

Production deployments should use a real datastore (not this in-memory process).
