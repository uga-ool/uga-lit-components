/**
 * Loads Kaltura Playkit player bundles, one per uiConf ID.
 *
 * A uiConf ID *is* the player: branding, skin, plugins and end cards all come from the
 * bundle built for it, so a page showing two differently-branded videos has to load two
 * bundles. That is awkward, because each bundle is a UMD that assigns `window.KalturaPlayer`
 * and hard-overwrites `window.__kalturaplayerdata` with its own config. Whichever bundle
 * loads last would otherwise supply the config for every player on the page.
 *
 * Two things keep that from happening, both verified against Playkit productVersion 7.276:
 *   1. Each bundle's runtime is captured at onload, before a later bundle can replace the
 *      global, so setup() runs the right plugin code.
 *   2. Each bundle's config is published to `window.KalturaPlayers[uiConfId]`, which the
 *      bundle's own config resolver reads (but never writes) when a uiConf ID is set.
 *
 * Both are undocumented internals. They are written defensively — an existing registry entry
 * is never clobbered, and `__kalturaplayerdata` is only ever snapshotted, never read for
 * logic. If Kaltura drops the registry, this degrades to "last bundle's branding wins",
 * which is what the component did before any of this existed.
 */

export interface KalturaBundle {
  uiConfId: string;
  /** This bundle's own KalturaPlayer runtime, captured before a later bundle can replace it. */
  player: any;
}

const bundles = new Map<string, Promise<KalturaBundle>>();

/** Bundles execute one at a time so each onload capture sees its own globals. */
let loadChain: Promise<unknown> = Promise.resolve();

function bundleUrl(uiConfId: string, partnerId: number): string {
  return `https://cdnapisec.kaltura.com/p/${partnerId}/embedPlaykitJs/uiconf_id/${uiConfId}`;
}

function captureBundle(uiConfId: string): KalturaBundle {
  const win = window as any;
  const player = win.KalturaPlayer;

  const registry = (win.KalturaPlayers ||= {});
  if (!registry[uiConfId] && win.__kalturaplayerdata) {
    registry[uiConfId] = { config: win.__kalturaplayerdata };
  }

  return { uiConfId, player };
}

function injectBundle(uiConfId: string, partnerId: number): Promise<KalturaBundle> {
  return new Promise<KalturaBundle>((resolve, reject) => {
    const script = document.createElement('script');
    script.addEventListener('load', () => resolve(captureBundle(uiConfId)), { once: true });
    script.addEventListener(
      'error',
      () => reject(new Error(`Kaltura player bundle failed to load (uiConfId ${uiConfId})`)),
      { once: true }
    );

    script.dataset.ugaKalturaUiconf = uiConfId;
    script.type = 'text/javascript';
    script.async = false;
    script.src = bundleUrl(uiConfId, partnerId);
    document.head.appendChild(script);
  });
}

/**
 * Resolve the player runtime for `uiConfId`, loading its bundle if this is the first caller.
 * Concurrent callers for the same ID share one in-flight load.
 */
export function loadKalturaPlayerBundle(uiConfId: string, partnerId: number): Promise<KalturaBundle> {
  const cached = bundles.get(uiConfId);
  if (cached) return cached;

  const pending = loadChain
    .catch(() => undefined)
    .then(() => injectBundle(uiConfId, partnerId));

  loadChain = pending;
  bundles.set(
    uiConfId,
    pending.catch((error) => {
      // Let a later element retry rather than caching the failure for the page's lifetime.
      bundles.delete(uiConfId);
      throw error;
    })
  );

  return bundles.get(uiConfId)!;
}

/** Which player bundles this page has loaded. Handy when troubleshooting in the eLC console. */
export function getLoadedUiConfIds(): string[] {
  return [...bundles.keys()];
}
