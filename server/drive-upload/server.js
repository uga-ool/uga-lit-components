/**
 * Minimal Google Drive upload endpoint for course export archives.
 * Run: cd server/drive-upload && npm install && cp .env.example .env && npm start
 *
 * POST /upload — raw body (application/octet-stream). Optional:
 *   Authorization: Bearer <DRIVE_UPLOAD_TOKEN>
 *
 * Returns JSON: { url, id, name }
 */
import { createServer } from 'node:http';
import { parse } from 'node:url';
import { google } from 'googleapis';

const PORT = process.env.PORT || 3847;

function getAuthFromEnv() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (json) {
    const creds = JSON.parse(json);
    return new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
  }
  return null;
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 */
async function handleUpload(req, res) {
  const auth = getAuthFromEnv();
  if (!auth) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Drive not configured: set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS' }));
    return;
  }

  const expected = process.env.DRIVE_UPLOAD_TOKEN;
  if (expected) {
    const authz = req.headers.authorization || '';
    const token = authz.replace(/^Bearer\s+/i, '');
    if (token !== expected) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
  }

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Set GOOGLE_DRIVE_FOLDER_ID' }));
    return;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks);
  if (!body.length) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Empty body' }));
    return;
  }

  const client = await auth.getClient();
  const drive = google.drive({ version: 'v3', auth: client });

  const name = `course-export-${Date.now()}.bin`;
  const resDrive = await drive.files.create({
    requestBody: {
      name,
      parents: [folderId],
    },
    media: {
      mimeType: 'application/octet-stream',
      body: body,
    },
    fields: 'id, name, webViewLink, webContentLink',
  });

  const data = resDrive.data;
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      id: data.id,
      name: data.name,
      url: data.webViewLink || data.webContentLink || `https://drive.google.com/file/d/${data.id}/view`,
    })
  );
}

const server = createServer(async (req, res) => {
  const u = parse(req.url || '', true);
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }
  if (req.method === 'POST' && u.pathname === '/upload') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      await handleUpload(req, res);
    } catch (e) {
      console.error(e);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: String(e?.message || e) }));
    }
    return;
  }
  if (req.method === 'GET' && u.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`drive-upload listening on http://localhost:${PORT} (POST /upload)`);
});
