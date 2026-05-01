/**
 * eLC ⇄ Google Sync API
 * Backend for Google Drive OAuth, D2L proxy, and video analytics.
 *
 * Video analytics: in-memory store for MVP. Use PostgreSQL or similar for production.
 */

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// In-memory store for video analytics events (MVP). Production: use PostgreSQL.
const videoEvents = [];

app.get('/', (req, res) => {
  res.json({
    service: 'elc-google-sync-api',
    status: 'ok',
    endpoints: {
      health: 'GET /health',
      videoAnalytics: {
        events: 'POST /api/video-analytics/events',
        aggregate: 'GET /api/video-analytics/aggregate?ou=...&entryIds=...',
      },
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'elc-google-sync-api' });
});

/**
 * POST /api/video-analytics/events
 * Accept single event or array of events.
 */
app.post('/api/video-analytics/events', (req, res) => {
  try {
    const body = req.body;
    const events = Array.isArray(body) ? body : [body];
    for (const ev of events) {
      if (ev && ev.entryId && ev.eventType && ev.timestamp) {
        videoEvents.push({
          ...ev,
          created_at: new Date().toISOString(),
        });
      }
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Video analytics POST error:', err);
    res.status(400).json({ error: 'Invalid request' });
  }
});

/**
 * GET /api/video-analytics/aggregate?ou=...&entryIds=...
 * Returns { totalViews: number, byEntry: { [entryId]: { views, uniqueViewers } } }
 */
app.get('/api/video-analytics/aggregate', (req, res) => {
  try {
    const { ou, entryIds } = req.query;
    let filtered = videoEvents;

    if (ou) {
      filtered = filtered.filter((e) => e.ou === ou);
    }
    const entryIdSet = entryIds ? new Set(String(entryIds).split(',').filter(Boolean)) : null;
    if (entryIdSet) {
      filtered = filtered.filter((e) => entryIdSet.has(e.entryId));
    }

    const byEntry = {};
    for (const ev of filtered) {
      const id = ev.entryId;
      if (!byEntry[id]) {
        byEntry[id] = { views: 0, uniqueViewers: new Set() };
      }
      byEntry[id].views += 1;
      if (ev.userId) byEntry[id].uniqueViewers.add(ev.userId);
    }

    const result = {
      totalViews: filtered.length,
      byEntry: Object.fromEntries(
        Object.entries(byEntry).map(([k, v]) => [
          k,
          { views: v.views, uniqueViewers: v.uniqueViewers.size },
        ])
      ),
    };
    res.json(result);
  } catch (err) {
    console.error('Video analytics GET error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`eLC ⇄ Google Sync API running on port ${PORT}`);
});
