/**
 * Video analytics client - sends playback events to custom backend.
 * Fire-and-forget with minimal error logging.
 */

import axios from 'axios';

declare global {
  interface Window {
    UGA_VIDEO_ANALYTICS_URL?: string;
    /** Set to true to disable custom event sending (use when relying on Kaltura's analytics only) */
    UGA_VIDEO_ANALYTICS_DISABLED?: boolean;
    /** Set to true to log analytics endpoint and request status (troubleshooting) */
    UGA_VIDEO_ANALYTICS_DEBUG?: boolean;
  }
}

const DEFAULT_ENDPOINT = '/api/video-analytics/events';
let defaultUrlWarningShown = false;

export interface VideoEventPayload {
  entryId: string;
  topicId?: string;
  ou?: string;
  userId?: string;
  eventType: string;
  timestamp: string;
  currentTime?: number;
  duration?: number;
  percentWatched?: number;
}

function getEndpoint(): string {
  if (typeof window !== 'undefined' && window.UGA_VIDEO_ANALYTICS_URL) {
    return window.UGA_VIDEO_ANALYTICS_URL;
  }
  return DEFAULT_ENDPOINT;
}

/**
 * Send a video playback event to the custom analytics backend.
 * Fire-and-forget; errors are logged but not surfaced to the user.
 * No-op when UGA_VIDEO_ANALYTICS_DISABLED is true (e.g. when using Kaltura analytics only).
 */
export async function sendVideoEvent(payload: VideoEventPayload): Promise<void> {
  if (typeof window !== 'undefined' && window.UGA_VIDEO_ANALYTICS_DISABLED) {
    return;
  }
  const url = getEndpoint();
  const isDefault = url === DEFAULT_ENDPOINT;
  const isLocalhost = typeof window !== 'undefined' && window.location?.hostname === 'localhost';

  if (window.UGA_VIDEO_ANALYTICS_DEBUG) {
    console.log('[UGA video analytics] endpoint:', url, '| configured:', !isDefault);
  }
  if (isDefault && !isLocalhost && !defaultUrlWarningShown) {
    defaultUrlWarningShown = true;
    console.warn(
      '[UGA video analytics] Using default /api/video-analytics/events. In D2L this resolves to the LMS and returns 404. Set window.UGA_VIDEO_ANALYTICS_URL before loading the script.'
    );
  }

  try {
    await axios.post(url, payload, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' },
    });
    if (window.UGA_VIDEO_ANALYTICS_DEBUG) {
      console.log('[UGA video analytics] event sent:', payload.eventType);
    }
  } catch (err) {
    console.warn('Video analytics: failed to send event', err);
    if (window.UGA_VIDEO_ANALYTICS_DEBUG) {
      console.warn('[UGA video analytics] URL was:', url);
    }
  }
}

export interface VideoAnalyticsAggregate {
  totalViews: number;
  byEntry: Record<string, { views: number; uniqueViewers: number }>;
}

/**
 * Get aggregated video analytics from custom backend.
 * @param ou - Course org unit ID
 * @param entryIds - Optional comma-separated entry IDs to filter
 */
export async function getVideoAnalyticsAggregate(
  ou: string,
  entryIds?: string[]
): Promise<VideoAnalyticsAggregate | null> {
  const baseUrl = typeof window !== 'undefined' && window.UGA_VIDEO_ANALYTICS_URL
    ? window.UGA_VIDEO_ANALYTICS_URL.replace(/\/events\/?$/, '')
    : '/api/video-analytics';
  const params = new URLSearchParams({ ou });
  if (entryIds && entryIds.length > 0) {
    params.set('entryIds', entryIds.join(','));
  }
  try {
    const { data } = await axios.get(`${baseUrl}/aggregate?${params}`, { timeout: 5000 });
    return data;
  } catch {
    return null;
  }
}
