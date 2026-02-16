/**
 * Template Manager API
 * Backend for Google Drive OAuth and D2L proxy operations.
 * 
 * Placeholder – implement:
 * - Google Drive OAuth or service account
 * - D2L Content/Managed Files proxy (list, download, upload, delete)
 * - Export (zip + upload to Drive)
 */

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'template-manager-api' });
});

app.listen(PORT, () => {
  console.log(`Template Manager API running on port ${PORT}`);
});
