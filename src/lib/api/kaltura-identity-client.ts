/**
 * Client for kaltura-identity-service: mints a user-attributed, view-only Kaltura session (KS)
 * so a play can be attributed to the real student instead of showing anonymous/"Unknown" in
 * KMC. See that service's repo (kaltura-identity-service) for the minting side.
 */

export interface KalturaSession {
  ks: string;
  expiresAt: string;
}

const DEFAULT_IDENTITY_SERVICE_URL = 'https://n483yqlmig.execute-api.us-east-1.amazonaws.com';

declare global {
  interface Window {
    /** Overrides the compiled-in identity-service URL without needing a rebuild. */
    UGA_KALTURA_IDENTITY_SERVICE_URL?: string;
  }
}

/**
 * Requests a KS for the given user/course/entry. Plain `fetch`, not axios: this goes to a
 * completely different, non-D2L origin, so it shouldn't inherit axios defaults tuned for
 * same-origin D2L calls elsewhere in this codebase.
 */
export async function requestKalturaSession(params: {
  username: string;
  orgUnitId: string;
  entryId: string;
  timeoutMs?: number;
}): Promise<KalturaSession> {
  const base =
    (typeof window !== 'undefined' && window.UGA_KALTURA_IDENTITY_SERVICE_URL) ||
    DEFAULT_IDENTITY_SERVICE_URL;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), params.timeoutMs ?? 6000);
  try {
    const res = await fetch(`${base}/v1/kaltura-sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        username: params.username,
        orgUnitId: params.orgUnitId,
        entryId: params.entryId,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}) as { message?: string });
      throw new Error(body?.message || `kaltura-identity-service HTTP ${res.status}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}
