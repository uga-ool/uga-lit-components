import { LitElement, html } from 'lit';
import type { PropertyValues } from 'lit';
import axios from 'axios';
import { customElement, property, state } from 'lit/decorators.js';
import { getVersions, getCurrentUserId } from '../lib/api/d2l-client.js';
import { getCourse, getTopicId } from '../lib/api/d2l-utils.js';
import { completeContentTopic } from '../lib/api/d2l-client-content.js';
import { loadData } from '../lib/data/data-loader.js';
import { loadKalturaPlayerBundle } from '../lib/utils/kaltura-player-loader.js';
import './uga-rating.js';

/** Data-file shape: `{"data": ["1_p658t55u", "1_icw0df6y"]}`. */
interface VideoData {
  data?: unknown;
}

interface AnalyticsContext {
  userId: string | null;
  leVersion: string;
  lpVersion: string;
}

/**
 * Versions + current user, resolved once per page rather than once per element. The promise
 * itself is memoized, not just its result: `timeupdate` fires several times a second, and
 * memoizing only the settled value let every event before the first resolution start its own
 * `whoami` request, which has neither caching nor in-flight dedupe in d2l-client.
 */
let analyticsContextPromise: Promise<AnalyticsContext> | null = null;

function analyticsContext(): Promise<AnalyticsContext> {
  if (!analyticsContextPromise) {
    analyticsContextPromise = (async () => {
      try {
        const versions = await getVersions();
        const lpVersion = versions.lp || '';
        return {
          userId: await getCurrentUserId(lpVersion),
          leVersion: versions.le || '',
          lpVersion,
        };
      } catch {
        return { userId: null, leVersion: '', lpVersion: '' };
      }
    })();
  }
  return analyticsContextPromise;
}

/** Kaltura widget session, shared by every entry on the page. */
let kalturaSessionPromise: Promise<string | null> | null = null;
/** entryId -> display name, shared so two elements showing one entry fetch it once. */
const kalturaNames = new Map<string, Promise<string | null>>();

/**
 * Container ids have to be unique document-wide, not merely within the element, because
 * Kaltura resolves `targetId` with `document.getElementById`.
 */
const PAGE_TOKEN = Math.random().toString(36).slice(2, 7);
let instanceSeq = 0;

@customElement('uga-video')
class UgaVideo extends LitElement {

  @property({ type: String }) ou: string | null = null;
  @property({ type: String }) type = '';
  @property({ type: String }) filename = '';
  @property({ type: String }) program = '';
  @property({ type: String }) host = '';
  @property({ type: String }) videoid = '';
  @property({ type: String }) playerid = '';
  @property({ type: Boolean }) includeRating = false;
  @property({ type: String }) name = '';
  @property({ type: String, attribute: 'topic-id' }) topicId = '';

  @state() private loaded = false;
  @state() private videos: string[] = [];

  /**
   * UGA's Kaltura account, and the player used when `playerid` is omitted. A uiConf ID is the
   * player: branding, skin and end cards all come from it.
   */
  private static readonly PARTNER_ID = 1727411;
  private static readonly DEFAULT_UICONF_ID = '57494843';

  /**
   * Shipped as the `playerid` default between 2026-09-08 and this change, when `playerid` was
   * wired to the container div id rather than the uiConf. It is not a player — Kaltura returns
   * 404 for it — so course HTML still carrying it falls back to the default.
   */
  private static readonly RETIRED_PLAYER_IDS = new Set(['660400380']);

  private readonly instanceKey = `${PAGE_TOKEN}${instanceSeq++}`;
  /** Bumped on teardown so remounts render into fresh, empty divs. */
  private generation = 0;
  private bootstrapped = false;
  private disposed = false;
  private mountedUiConfId = '';
  private playerInstances: Map<string, { entryId: string; player: any }> = new Map();
  private videoNames: Map<string, string> = new Map();
  private completedTopics: Set<string> = new Set();

  createRenderRoot() {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.disposed = false;

    if (this.ou === null) this.ou = getCourse();

    if (this.bootstrapped) {
      // Re-attached (D2L content panes and the tab/slideshow components move DOM). The players
      // were destroyed on disconnect, so mount them again rather than re-running the bootstrap.
      void this.remountPlayers();
      return;
    }
    this.bootstrapped = true;
    void this.bootstrap();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.disposed = true;
    this.teardownPlayers();
  }

  /** Resolve `videos` exactly once: an explicit videoid, else the data file. */
  private async bootstrap(): Promise<void> {
    try {
      if (this.videoid !== '') {
        this.videos = [this.videoid];
        return;
      }

      if (this.type !== 'local' && this.type !== 'program') {
        console.error('uga-video: set videoid, or type="local"/"program" with a filename.');
        return;
      }

      const payload = await loadData<VideoData>(this.type, this.filename, this.program || undefined);
      this.videos = this.readVideoIds(payload);
      if (this.videos.length === 0) {
        console.error('uga-video: no video ids found in', this.filename, payload);
      }
    } catch (error) {
      console.error('uga-video: failed to load video data file', this.filename, error);
    } finally {
      this.loaded = true;
    }
  }

  private readVideoIds(payload: VideoData | null | undefined): string[] {
    const entries = Array.isArray(payload?.data) ? payload.data : [];
    return entries
      .filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '')
      .map((entry) => entry.trim());
  }

  /**
   * `connectedCallback` only runs once, so it can't react to videoid/playerid changing on an
   * already-connected element. Handle that here, skipping the first update.
   */
  willUpdate(changedProperties: PropertyValues<this>): void {
    if (!this.hasUpdated) return;

    if (changedProperties.has('videoid') && this.videoid !== '') {
      this.videos = [this.videoid];
      this.loaded = true;
      this.teardownPlayers();
    } else if (changedProperties.has('playerid') && this.resolvedUiConfId() !== this.mountedUiConfId) {
      this.teardownPlayers();
    }
  }

  /**
   * The Kaltura player (uiConf ID) this element should use. Anything that isn't a plausible
   * uiConf falls back to the default, so a stale attribute degrades to the standard UGA player
   * rather than a dead video in a live course.
   */
  private resolvedUiConfId(): string {
    const requested = this.playerid.trim();
    if (requested === '') return UgaVideo.DEFAULT_UICONF_ID;

    if (!/^\d{6,12}$/.test(requested) || UgaVideo.RETIRED_PLAYER_IDS.has(requested)) {
      console.warn(
        `uga-video: playerid="${requested}" is not a Kaltura uiConf ID; using the default player ` +
          `(${UgaVideo.DEFAULT_UICONF_ID}). Copy the number after uiconf_id/ from the Kaltura embed code.`
      );
      return UgaVideo.DEFAULT_UICONF_ID;
    }
    return requested;
  }

  private getContainerId(index: number): string {
    return `kaltura_player_${this.instanceKey}_${this.generation}_${index}`;
  }

  private teardownPlayers(): void {
    for (const [containerId, { player }] of this.playerInstances) {
      try {
        void player?.destroy?.();
      } catch {
        // A player that won't destroy shouldn't block teardown of the rest.
      }
      this.querySelector<HTMLElement>(`#${containerId}`)?.replaceChildren();
    }
    this.playerInstances.clear();
    this.mountedUiConfId = '';
    // Every container id changes, so the next render emits divs Kaltura hasn't mounted into.
    this.generation++;
  }

  private async remountPlayers(): Promise<void> {
    // Teardown bumped the generation, so the DOM still holds the previous render's container
    // ids. Force a re-render first or mountPlayers would look for divs that don't exist yet.
    this.requestUpdate();
    await this.updateComplete;
    void this.mountPlayers();
  }

  private async mountPlayers(): Promise<void> {
    const uiConfId = this.resolvedUiConfId();

    for (const [index, entryId] of this.videos.entries()) {
      const containerId = this.getContainerId(index);
      if (this.playerInstances.has(containerId)) continue;

      const container = this.querySelector<HTMLElement>(`#${containerId}`);
      if (!container) continue;
      if (container.querySelector('.kaltura-player-container')) continue;

      // Claim the slot before awaiting; updated() can fire again while the bundle is in flight.
      this.playerInstances.set(containerId, { entryId, player: null });

      try {
        const bundle = await loadKalturaPlayerBundle(uiConfId, UgaVideo.PARTNER_ID);
        if (this.disposed || this.getContainerId(index) !== containerId) {
          this.playerInstances.delete(containerId);
          return;
        }

        const player = bundle.player.setup({
          targetId: containerId,
          provider: {
            partnerId: UgaVideo.PARTNER_ID,
            uiConfId,
          },
          ui: {
            components: {
              logo: { disabled: true },
            },
          },
        });

        player.loadMedia({ entryId });
        this.playerInstances.set(containerId, { entryId, player });
        this.mountedUiConfId = uiConfId;
        this.attachKalturaPlaybackListeners(player, entryId);

        const errorEventName = player?.Event?.Core?.ERROR || 'error';
        player.addEventListener(errorEventName, (ev: any) => {
          console.error(`uga-video: Kaltura player error (entry ${entryId}, uiConfId ${uiConfId}):`, ev);
          this.showVideoError(containerId);
        });
      } catch (error) {
        this.playerInstances.delete(containerId);
        console.error(`uga-video: Kaltura setup failed (entry ${entryId}, uiConfId ${uiConfId}):`, error);
        this.showVideoError(containerId);
      }
    }
  }

  private showVideoError(containerId: string): void {
    const container = this.querySelector<HTMLElement>(`#${containerId}`);
    if (!container) return;

    const message = document.createElement('p');
    message.setAttribute('role', 'alert');
    message.style.cssText = 'color: #fff; text-align: center; padding: 1rem;';
    message.textContent = 'This video failed to load. Please contact your instructor.';
    container.replaceChildren(message);
  }

  /** D2L topic completion when the video ends or reaches 80%. */
  private attachKalturaPlaybackListeners(player: any, entryId: string): void {
    const EventCore = player?.Event?.Core || {};
    const eventMap = [
      { key: 'ENDED', name: 'ended' },
      { key: 'TIME_UPDATE', name: 'timeupdate' },
    ];

    for (const { key, name } of eventMap) {
      const eventName = EventCore[key] || name;
      player.addEventListener(eventName, (ev: any) => this.handleVideoEvent(player, entryId, name, ev));
    }

    if (this.ou && getTopicId(this.topicId)) {
      // Warm the context now so the first qualifying event doesn't wait on it.
      void analyticsContext();
    }
  }

  private handleVideoEvent(player: any, entryId: string, eventType: string, ev: any): void {
    const topicId = getTopicId(this.topicId);
    const ou = this.ou;
    if (!topicId || !ou) return;

    const completionKey = `${entryId}:${topicId}`;
    if (this.completedTopics.has(completionKey)) return;

    if (eventType === 'timeupdate') {
      const currentTime = player?.currentTime ?? ev?.payload?.currentTime ?? 0;
      const duration = player?.duration ?? ev?.payload?.duration ?? 0;
      if (duration <= 0 || (currentTime / duration) * 100 < 80) return;
    } else if (eventType !== 'ended') {
      return;
    }

    // Claim before awaiting, so events arriving together can't each fire a completion.
    this.completedTopics.add(completionKey);
    void this.markTopicComplete(ou, topicId, completionKey);
  }

  private async markTopicComplete(ou: string, topicId: string, completionKey: string): Promise<void> {
    const ctx = await analyticsContext();
    if (!ctx.userId || !ctx.leVersion) {
      this.completedTopics.delete(completionKey);
      return;
    }

    try {
      await completeContentTopic(ou, ctx.leVersion, topicId, ctx.userId);
    } catch (error) {
      console.error('uga-video: failed to mark topic complete', topicId, error);
      this.completedTopics.delete(completionKey);
    }
  }

  private getKalturaSession(): Promise<string | null> {
    if (!kalturaSessionPromise) {
      kalturaSessionPromise = (async () => {
        try {
          const params = new URLSearchParams();
          params.append('widgetId', `_${UgaVideo.PARTNER_ID}`);
          params.append('format', '1');
          const { data } = await axios.post(
            'https://www.kaltura.com/api_v3/service/session/action/startWidgetSession',
            params
          );
          return data?.ks ?? null;
        } catch {
          return null;
        }
      })();
    }
    return kalturaSessionPromise;
  }

  private fetchKalturaName(entryId: string): Promise<string | null> {
    const cached = kalturaNames.get(entryId);
    if (cached) return cached;

    const pending = (async () => {
      try {
        const ks = await this.getKalturaSession();
        if (!ks) return null;
        const params = new URLSearchParams();
        params.append('entryId', entryId);
        params.append('ks', ks);
        params.append('format', '1');
        const { data } = await axios.post(
          'https://www.kaltura.com/api_v3/service/media/action/get',
          params
        );
        return data?.name ?? null;
      } catch {
        return null;
      }
    })();

    kalturaNames.set(entryId, pending);
    return pending;
  }

  /**
   * Only `uga-rating` uses the Kaltura-reported name, so this runs after render rather than
   * during it, and only when a rating will actually be shown.
   */
  private async ensureVideoNames(): Promise<void> {
    if (!this.includeRating || this.name !== '') return;

    for (const entryId of this.videos) {
      if (this.videoNames.has(entryId)) continue;
      const name = await this.fetchKalturaName(entryId);
      if (name && !this.disposed) {
        this.videoNames.set(entryId, name);
        this.requestUpdate();
      }
    }
  }

  private kalturaCode(entryId: string, index: number) {
    return html`
      <div class="cmp-video util-margin-top-lg">
        <div class="cmp-video__container">
          <div id="${this.getContainerId(index)}" style="width: 100%; aspect-ratio: 16 / 9;"></div>
        </div>
      </div>
      ${this.includeRating
        ? html`<uga-rating
            .contentId="${entryId}"
            contentType="video"
            .ou=${this.ou}
            .contentName=${this.videoNames.get(entryId) ?? this.name}
            contentPlatform="kaltura"
          ></uga-rating>`
        : html``}
    `;
  }

  private youtubeCode(entryId: string) {
    return html`
      <div class="cmp-video util-margin-top-lg">
        <div class="cmp-video__youtube-container">
          <iframe
            class="cmp-video__embed"
            src="https://www.youtube.com/embed/${entryId}"
            title="${this.name || `YouTube video ${entryId}`}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      </div>
      ${this.includeRating
        ? html`<uga-rating
            .contentId="${entryId}"
            contentType="video"
            .ou=${this.ou}
            .contentName=${this.name}
            contentPlatform="youtube"
          ></uga-rating>`
        : html``}
    `;
  }

  private isKalturaHost(): boolean {
    return this.host === '' || this.host.toLowerCase() === 'kaltura';
  }

  render() {
    if (!this.loaded) {
      return html`<p>Loading video...</p>`;
    }

    const isYouTube = this.host.toLowerCase() === 'youtube';
    if (!this.isKalturaHost() && !isYouTube) {
      console.error(`uga-video: unsupported host "${this.host}". Use "kaltura" or "youtube".`);
      return html`<p>No videos available.</p>`;
    }

    if (this.videos.length === 0) {
      return html`<p>No videos available.</p>`;
    }

    return html`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <style>
        /* Suppress the design-system .cmp-video::after padding-top hack so embeds keep 16:9. */
        .cmp-video::after {
          content: none !important;
          display: none !important;
          padding-top: 0 !important;
        }
        .cmp-video__container {
          width: 100%;
          background: #000;
        }
        .cmp-video__container > div {
          width: 100%;
          height: auto;
        }
        .cmp-video__youtube-container {
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #000;
        }
        .cmp-video__youtube-container iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      </style>
      ${isYouTube
        ? this.videos.map((entryId) => this.youtubeCode(entryId))
        : this.videos.map((entryId, index) => this.kalturaCode(entryId, index))}
    `;
  }

  // Untyped PropertyValues: `loaded` and `videos` are private, so they aren't in `keyof this`.
  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (!this.loaded || this.videos.length === 0) return;

    void this.ensureVideoNames();

    if (!this.isKalturaHost()) return;
    const relevantChange =
      changedProperties.has('loaded') ||
      changedProperties.has('videos') ||
      changedProperties.has('playerid');
    if (!relevantChange) return;

    void this.mountPlayers();
  }
}
