/**
 * Kaltura API client for analytics
 *
 * Uses report.get with REPORT_TYPE_ENTRY_PLAYS for reliable analytics data.
 * Falls back to media.list if report API fails.
 * IMPORTANT: For production, consider calling Kaltura API from a backend proxy
 * to avoid exposing the secret in the client bundle.
 */

import axios from 'axios';
import { KALTURA_SECRETS } from '../../../kaltura-secrets.js';

const KALTURA_API = 'https://www.kaltura.com/api_v3';

/** KalturaReportType.ENTRY_PLAYS - play counts per media entry */
const REPORT_TYPE_ENTRY_PLAYS = 51;

export interface KalturaMediaEntry {
  id: string;
  name?: string;
  plays?: number;
  views?: number;
}

/**
 * Create an admin Kaltura session (KS) for API calls that require elevated privileges.
 * Requires secret in kaltura-secrets.ts (from KMC > Settings > Integration Settings).
 */
export async function getKalturaAdminSession(): Promise<string | null> {
  const { partnerId, secret } = KALTURA_SECRETS;
  if (!secret || !partnerId) {
    return null;
  }
  try {
    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('partnerId', String(partnerId));
    params.append('type', '2'); // ADMIN
    params.append('format', '1');
    const { data } = await axios.post(`${KALTURA_API}/service/session/action/start`, params);
    return (typeof data === 'string' ? data : data?.ks) ?? null;
  } catch (err) {
    console.warn('Kaltura admin session failed:', err);
    return null;
  }
}

/**
 * Parse report.get response into entry ID -> plays map.
 * Kaltura returns CSV-style data; columns and results may be in different formats.
 */
function parseReportResponse(data: unknown, entryIds: Set<string>): Map<string, number> {
  const result = new Map<string, number>();
  for (const id of entryIds) {
    result.set(id, 0);
  }

  if (!data) return result;

  let csvText = '';
  let headerLine = '';

  if (typeof data === 'string') {
    csvText = data;
  } else if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const columns = obj.columns as string | undefined;
    const results = obj.results ?? obj.data;
    if (typeof columns === 'string') headerLine = columns;
    if (typeof results === 'string') {
      csvText = results;
    } else if (Array.isArray(results)) {
      for (const row of results) {
        const r = typeof row === 'object' && row !== null ? (row as Record<string, unknown>) : {};
        const id = String(r.entry_id ?? r.entryId ?? r.object_id ?? r.id ?? '');
        // Prefer impressions/views (Player Impressions) over plays
        const count = Number(
          r.impressions ?? r.views ?? r.player_impressions ?? r.plays ?? r.total_plays ?? r.count_plays ?? r.totalPlays ?? 0
        ) || 0;
        if (id && entryIds.has(id)) {
          result.set(id, (result.get(id) ?? 0) + count);
        }
      }
      return result;
    }
  }

  if (!csvText) return result;

  const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return result;

  const firstLine = headerLine || lines[0];
  const colNames = firstLine.split(/[,\t]/).map((s) => s.trim().toLowerCase().replace(/^["']|["']$/g, ''));
  const startRow = headerLine ? 0 : 1;
  const idIdx = colNames.findIndex((c) => c === 'entry_id' || c === 'entryid' || c === 'object_id' || c === 'id');
  const countIdx = colNames.findIndex((c) =>
    ['impressions', 'views', 'player_impressions', 'plays', 'total_plays', 'count_plays', 'totalplays', 'countplays'].includes(c)
  );

  for (let i = startRow; i < lines.length; i++) {
    const vals = lines[i].split(/[,\t]/).map((s) => s.trim().replace(/^["']|["']$/g, ''));
    const id = idIdx >= 0 ? vals[idIdx] : vals[0];
    const count = countIdx >= 0 ? parseInt(vals[countIdx] ?? '0', 10) : parseInt(vals[vals.length - 1] ?? '0', 10);
    if (id && entryIds.has(id) && !Number.isNaN(count)) {
      result.set(id, (result.get(id) ?? 0) + count);
    }
  }

  return result;
}

/**
 * Get media entries by IDs with play/view counts.
 * Uses media.list first - KalturaPlayableEntry has views (Player Impressions) and plays directly.
 * Falls back to report.get if media.list returns no view data.
 */
export async function getKalturaMediaEntries(entryIds: string[]): Promise<KalturaMediaEntry[]> {
  if (entryIds.length === 0) return [];
  const ks = await getKalturaAdminSession();
  if (!ks) return [];

  const uniqueIds = [...new Set(entryIds)].filter(Boolean);
  if (uniqueIds.length === 0) return [];

  const entryIdSet = new Set(uniqueIds);

  // Try media.list first - KalturaPlayableEntry has views (Player Impressions) and plays on each entry
  try {
    const params = new URLSearchParams();
    params.append('ks', ks);
    params.append('format', '1');
    params.append('filter[objectType]', 'KalturaMediaEntryFilter');
    params.append('filter[entryIdIn]', uniqueIds.join(','));

    const { data } = await axios.post(`${KALTURA_API}/service/media/action/list`, params);
    const objects = Array.isArray(data?.objects) ? data.objects : [];
    const entries = objects.map((o: Record<string, unknown>) => {
      const plays = Number(o.plays ?? o.playCount ?? o.totalPlays ?? 0) || 0;
      // views = Player Impressions (times player was loaded); prefer over plays for "total views"
      const views = Number(o.views ?? o.viewCount ?? o.playerImpressions ?? o.impressions ?? 0) || 0;
      return {
        id: String(o.id ?? ''),
        name: o.name as string | undefined,
        plays,
        views: views || plays,
      };
    });
    if (entries.length > 0) {
      return entries;
    }
  } catch (err) {
    console.warn('Kaltura media.list failed, trying report.get:', err);
  }

  // Fallback: report.get with date range
  const toDate = Math.floor(Date.now() / 1000);
  const fromDate = toDate - 2 * 365 * 24 * 60 * 60;

  try {
    const params = new URLSearchParams();
    params.append('ks', ks);
    params.append('format', '1');
    params.append('reportType', String(REPORT_TYPE_ENTRY_PLAYS));
    params.append('objectIds', uniqueIds.join(','));
    params.append('fromDate', String(fromDate));
    params.append('toDate', String(toDate));
    params.append('order', 'totalPlays:desc');

    const { data } = await axios.post(`${KALTURA_API}/service/report/action/get`, params);
    const reportData = (data as Record<string, unknown>)?.report ?? data;
    const viewsByEntryId = parseReportResponse(reportData, entryIdSet);
    const hasData = [...viewsByEntryId.values()].some((v) => v > 0);

    if (hasData) {
      return uniqueIds.map((id) => ({
        id,
        plays: viewsByEntryId.get(id) ?? 0,
        views: viewsByEntryId.get(id) ?? 0,
      }));
    }
  } catch (err) {
    console.warn('Kaltura report.get failed:', err);
  }

  return uniqueIds.map((id) => ({ id, plays: 0, views: 0 }));
}

/**
 * Get play count for a specific user and video from Kaltura's stored analytics.
 * Uses userEntry.list with ViewHistoryUserEntry filter.
 *
 * Note: Kaltura may store one ViewHistoryUserEntry per user per entry (resume position)
 * rather than one per play. If you always get 0 or 1, consider using report.getTable
 * with a report type that includes user dimension, or verify how your KMC tracks viewers.
 *
 * @param entryId - Kaltura video entry ID (e.g. 1_icw0df6y)
 * @param userId - D2L user ID or Kaltura user identifier (must match how the player identifies viewers)
 * @returns Number of view-history records (plays if Kaltura creates one per play), or null on failure
 */
export async function getKalturaPlaysByUser(
  entryId: string,
  userId: string
): Promise<number | null> {
  if (!entryId || !userId) return null;
  const ks = await getKalturaAdminSession();
  if (!ks) return null;

  try {
    const params = new URLSearchParams();
    params.append('ks', ks);
    params.append('format', '1');
    params.append('filter[objectType]', 'KalturaViewHistoryUserEntryFilter');
    params.append('filter[userIdEqual]', userId);
    params.append('filter[entryIdEqual]', entryId);
    params.append('pager[pageSize]', '500');
    params.append('pager[pageIndex]', '1');

    const { data } = await axios.post(`${KALTURA_API}/service/userEntry/action/list`, params);
    const totalCount = data?.totalCount ?? 0;
    const objects = data?.objects ?? [];
    // totalCount is authoritative; if missing, use objects length
    return typeof totalCount === 'number' ? totalCount : objects.length;
  } catch (err) {
    console.warn('Kaltura userEntry.list (view history) failed:', err);
    return null;
  }
}
