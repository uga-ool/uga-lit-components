/**
 * Test Kaltura API: get play count for a video.
 *
 * Usage:
 *   npm run test:kaltura
 *   npm run test:kaltura -- 1_yourEntryId
 *
 * Requires kaltura-secrets.ts with partnerId and secret (see kaltura-secrets.example.ts).
 * Not used by the production uga-components.js bundle.
 */

import axios from 'axios';
import { KALTURA_SECRETS } from '../kaltura-secrets.js';
import { getKalturaMediaEntries, getKalturaAdminSession } from '../src/lib/api/kaltura-client.js';

const ENTRY_ID = process.argv[2] || '1_icw0df6y';

async function main() {
  console.log(`Fetching play count for video: ${ENTRY_ID}\n`);

  // Step 1: Check admin session (direct call to capture Kaltura error)
  const ks = await getKalturaAdminSession();
  if (!ks) {
    console.log('Admin session failed. Trying direct API call to capture error...\n');
    try {
      const params = new URLSearchParams();
      params.append('secret', KALTURA_SECRETS.secret);
      params.append('partnerId', String(KALTURA_SECRETS.partnerId));
      params.append('type', '2');
      params.append('format', '1');
      const { data } = await axios.post('https://www.kaltura.com/api_v3/service/session/action/start', params);
      console.log('API returned (no throw):', JSON.stringify(data, null, 2).slice(0, 500));
    } catch (err: unknown) {
      const e = err as { response?: { data?: unknown; status?: number }; message?: string };
      console.log('Kaltura API error:', e.response?.data ? JSON.stringify(e.response.data, null, 2) : e.message ?? err);
      if (e.response?.status) console.log('HTTP status:', e.response.status);
    }
    console.log('\nCheck kaltura-secrets.ts: partnerId and secret from KMC > Settings > Integration Settings');
    process.exit(1);
  }
  console.log('Admin session: OK\n');

  // Step 2: Get media entries with play counts
  const entries = await getKalturaMediaEntries([ENTRY_ID]);

  if (entries.length === 0) {
    console.log('No data returned from report.get or media.list.');
    console.log('The video may have 0 plays, or the API calls failed.');
    process.exit(1);
  }

  const entry = entries[0];
  console.log('Result:');
  console.log('  Entry ID:', entry.id);
  console.log('  Name:', entry.name ?? '(not fetched)');
  console.log('  Plays:', entry.plays ?? 0);
  console.log('  Views:', entry.views ?? 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
