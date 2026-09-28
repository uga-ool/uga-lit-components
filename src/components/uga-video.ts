import { LitElement, html, nothing } from 'lit';
import type { PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getCurrentUsername } from '../lib/api/d2l-client.js';
import { getCourse } from '../lib/api/d2l-utils.js';
import { loadKalturaPlayerBundle, type KalturaBundle } from '../lib/utils/kaltura-player-loader.js';
import { requestKalturaSession } from '../lib/api/kaltura-identity-client.js';

type VideoState = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Container ids have to be unique document-wide, not merely within the element, because
 * Kaltura resolves `targetId` with `document.getElementById`.
 */
const PAGE_TOKEN = Math.random().toString(36).slice(2, 7);
let instanceSeq = 0;

@customElement('uga-video')
class UgaVideo extends LitElement {
  @property({ type: String }) ou: string | null = null;
  @property({ type: String }) host = '';
  @property({ type: String }) videoid = '';
  @property({ type: String }) playerid = '';
  @property({ type: String }) name = '';

  /**
   * Fully lazy: nothing is fetched or loaded (no whoami, no identity-service call, no Kaltura
   * script/player, no `loadMedia`) until the user actually clicks play. Until then a thumbnail +
   * play button is shown, so a page with videos nobody watches never mints unused sessions or
   * loads unused player bundles, and the first real play is already attributed.
   */
  @state() private videoState: VideoState = 'idle';
  @state() private thumbnailFailed = false;

  /**
   * UGA's Kaltura account, and the player used when `playerid` is omitted. A uiConf ID is the
   * player: branding, skin and end cards all come from it.
   */
  private static readonly PARTNER_ID = 1727411;
  private static readonly DEFAULT_UICONF_ID = '57494843';

  /**
   * Shipped as the `playerid` default between 2026-09-08 and an earlier change, when `playerid`
   * was wired to the container div id rather than the uiConf. It is not a player — Kaltura
   * returns 404 for it — so course HTML still carrying it falls back to the default.
   */
  private static readonly RETIRED_PLAYER_IDS = new Set(['660400380']);

  private readonly instanceKey = `${PAGE_TOKEN}${instanceSeq++}`;
  /** Bumped on teardown so remounts render into a fresh, empty div. */
  private generation = 0;
  private disposed = false;
  private player: any = null;
  private mountedUiConfId = '';
  private ks: { value: string | null; expiresAt: number | null } = { value: null, expiresAt: null };

  createRenderRoot() {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.disposed = false;
    if (this.ou === null) this.ou = getCourse();

    if (this.videoState === 'ready') {
      // Re-attached (D2L content panes and the tab/slideshow components move DOM without
      // destroying this element). The player was torn down on disconnect; resume it rather
      // than dropping back to the placeholder, reusing the KS if it hasn't expired.
      void this.remount();
    } else if (this.videoState === 'loading') {
      // A play click was in flight when this element was disconnected. The in-flight promise
      // chain guards itself against a stale generation, so it's safe to just let the user
      // click play again rather than trying to resume a mid-flight fetch.
      this.videoState = 'idle';
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.disposed = true;
    this.teardownPlayer();
  }

  /**
   * `connectedCallback` only runs once, so it can't react to videoid/playerid changing on an
   * already-connected element. Handle that here, skipping the first update.
   */
  willUpdate(changedProperties: PropertyValues<this>): void {
    if (!this.hasUpdated) return;

    if (changedProperties.has('videoid')) {
      this.teardownPlayer();
      this.videoState = 'idle';
      this.ks = { value: null, expiresAt: null };
      this.thumbnailFailed = false;
    } else if (
      changedProperties.has('playerid') &&
      this.resolvedUiConfId() !== this.mountedUiConfId &&
      this.videoState !== 'idle'
    ) {
      this.teardownPlayer();
      this.videoState = 'idle';
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

  private getContainerId(): string {
    return `kaltura_player_${this.instanceKey}_${this.generation}`;
  }

  private teardownPlayer(): void {
    const containerId = this.getContainerId();
    if (this.player) {
      try {
        void this.player.destroy?.();
      } catch {
        // A player that won't destroy shouldn't block teardown.
      }
      this.player = null;
    }
    this.querySelector<HTMLElement>(`#${containerId}`)?.replaceChildren();
    this.mountedUiConfId = '';
    // The container id changes, so the next render emits a div Kaltura hasn't mounted into.
    this.generation++;
  }

  private async handlePlayClick(): Promise<void> {
    if (this.videoState !== 'idle' && this.videoState !== 'error') return;

    this.videoState = 'loading';
    const startedGeneration = this.generation;
    const containerId = this.getContainerId();
    const uiConfId = this.resolvedUiConfId();

    try {
      const [bundle, ks] = await Promise.all([
        loadKalturaPlayerBundle(uiConfId, UgaVideo.PARTNER_ID),
        this.resolveKs(),
      ]);
      if (this.disposed || this.generation !== startedGeneration) return;

      this.videoState = 'ready';
      await this.updateComplete;
      this.setupPlayer(bundle, containerId, uiConfId, ks);
    } catch (error) {
      if (this.disposed || this.generation !== startedGeneration) return;
      console.error(`uga-video: failed to load Kaltura player (entry ${this.videoid}):`, error);
      this.videoState = 'error';
    }
  }

  /**
   * Re-mounts after a D2L-driven reconnect when the video was already playing. Reuses the
   * cached KS if it's still valid; only re-mints one in the rare case it expired mid-session.
   */
  private async remount(): Promise<void> {
    this.requestUpdate();
    await this.updateComplete;

    const startedGeneration = this.generation;
    const containerId = this.getContainerId();
    const uiConfId = this.resolvedUiConfId();

    try {
      const ksStillValid = this.ks.value && (this.ks.expiresAt === null || Date.now() < this.ks.expiresAt);
      const [bundle, ks] = await Promise.all([
        loadKalturaPlayerBundle(uiConfId, UgaVideo.PARTNER_ID),
        ksStillValid ? Promise.resolve(this.ks.value) : this.resolveKs(),
      ]);
      if (this.disposed || this.generation !== startedGeneration) return;

      this.setupPlayer(bundle, containerId, uiConfId, ks);
    } catch (error) {
      if (this.disposed || this.generation !== startedGeneration) return;
      console.error(`uga-video: failed to remount Kaltura player (entry ${this.videoid}):`, error);
      this.videoState = 'error';
    }
  }

  /**
   * Resolves a view-only, user-attributed KS from kaltura-identity-service. Never throws:
   * whoami failing, the identity-service call failing, or the org unit id being unresolvable
   * all degrade to anonymous playback rather than blocking the video — attribution is a
   * reporting nice-to-have, never a gate on watching.
   */
  private async resolveKs(): Promise<string | null> {
    try {
      const username = await getCurrentUsername();
      const orgUnitId = this.ou ?? getCourse();
      if (!username || !orgUnitId) return null;

      const session = await requestKalturaSession({ username, orgUnitId, entryId: this.videoid });
      this.ks = { value: session.ks, expiresAt: Date.parse(session.expiresAt) };
      return session.ks;
    } catch (err) {
      console.warn('uga-video: falling back to anonymous Kaltura playback:', err);
      return null;
    }
  }

  private setupPlayer(bundle: KalturaBundle, containerId: string, uiConfId: string, ks: string | null): void {
    try {
      // Don't trust the browser's ambient document.URL/referrer for course-level Kaltura
      // reporting: confirmed against a real course (D2L's "Smart Curriculum" content viewer is an
      // SPA shell whose top-level document.URL stays a generic, versioned app-shell path and
      // never reflects the actual content item), so Kaltura's own default referrer resolution
      // captures that generic URL, not anything with the org unit id in it. Build our own
      // referrer explicitly instead, from the org unit id we already reliably have (getCourse()
      // has its own fallback chain beyond raw URL parsing, e.g. a D2L context global) rather than
      // depending on whatever page happens to be showing. Real origin (accurate) + a synthetic,
      // always-parseable path in the same shape D2L's own content URLs use.
      const orgUnitId = this.ou ?? getCourse();
      const referrer = orgUnitId ? `${window.location.origin}/d2l/le/content/${orgUnitId}/` : undefined;

      const player = bundle.player.setup({
        targetId: containerId,
        provider: {
          partnerId: UgaVideo.PARTNER_ID,
          uiConfId,
        },
        plugins: {
          kava: { referrer },
        },
        // The user already clicked the placeholder's play button to get here, so start playing
        // immediately instead of requiring a second click on the player's own control. Rely on
        // Kaltura's own autoplay-policy handling (allowMutedAutoPlay defaults to true: if the
        // browser blocks unmuted autoplay, it starts muted and unmutes on the next interaction)
        // rather than calling player.play() ourselves, which the player can't distinguish from a
        // non-user-initiated call for autoplay-policy purposes.
        playback: {
          autoplay: true,
        },
        ui: {
          components: {
            logo: { disabled: true },
          },
        },
      });

      player.loadMedia(ks ? { entryId: this.videoid, ks } : { entryId: this.videoid });
      this.player = player;
      this.mountedUiConfId = uiConfId;

      const errorEventName = player?.Event?.Core?.ERROR || 'error';
      player.addEventListener(errorEventName, (ev: any) => {
        console.error(`uga-video: Kaltura player error (entry ${this.videoid}, uiConfId ${uiConfId}):`, ev);
        this.videoState = 'error';
      });
    } catch (error) {
      console.error(`uga-video: Kaltura setup failed (entry ${this.videoid}, uiConfId ${uiConfId}):`, error);
      this.videoState = 'error';
    }
  }

  private isKalturaHost(): boolean {
    return this.host === '' || this.host.toLowerCase() === 'kaltura';
  }

  private get thumbnailUrl(): string {
    return `https://cdnapisec.kaltura.com/p/${UgaVideo.PARTNER_ID}/thumbnail/entry_id/${this.videoid}/width/960/height/540`;
  }

  private renderKalturaStage() {
    if (this.videoState === 'ready') {
      return html`<div id="${this.getContainerId()}" class="cmp-video__player"></div>`;
    }

    return html`
      <div class="cmp-video__placeholder">
        ${!this.thumbnailFailed
          ? html`<img
              class="cmp-video__thumb"
              src="${this.thumbnailUrl}"
              alt=""
              loading="lazy"
              @error=${() => {
                this.thumbnailFailed = true;
              }}
            />`
          : nothing}
        ${this.videoState === 'idle'
          ? html`<button
              type="button"
              class="cmp-video__play-button"
              aria-label="${this.name ? `Play video: ${this.name}` : 'Play video'}"
              @click=${this.handlePlayClick}
            >
              <svg viewBox="0 0 68 48" aria-hidden="true" class="cmp-video__play-icon">
                <path
                  d="M66.52 7.74a8 8 0 0 0-5.62-5.66C55.79 0 34 0 34 0S12.21 0 7.1 2.08a8 8 0 0 0-5.62 5.66A83.5 83.5 0 0 0 0 24a83.5 83.5 0 0 0 1.48 16.26 8 8 0 0 0 5.62 5.66C12.21 48 34 48 34 48s21.79 0 26.9-2.08a8 8 0 0 0 5.62-5.66A83.5 83.5 0 0 0 68 24a83.5 83.5 0 0 0-1.48-16.26z"
                  fill="rgba(0,0,0,0.65)"
                />
                <path d="M45 24 27 14v20z" fill="#fff" />
              </svg>
            </button>`
          : nothing}
        ${this.videoState === 'loading'
          ? html`<div class="cmp-video__spinner" role="status">
              <span class="util-visually-hidden">Loading video…</span>
            </div>`
          : nothing}
        ${this.videoState === 'error'
          ? html`<div class="cmp-video__error-box">
              <p>This video couldn't be loaded.</p>
              <button type="button" @click=${this.handlePlayClick}>Try again</button>
            </div>`
          : nothing}
      </div>
    `;
  }

  private youtubeCode() {
    return html`
      <div class="cmp-video__youtube-container">
        <iframe
          class="cmp-video__embed"
          src="https://www.youtube.com/embed/${this.videoid}"
          title="${this.name || `YouTube video ${this.videoid}`}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
    `;
  }

  render() {
    const isYouTube = this.host.toLowerCase() === 'youtube';
    if (!this.isKalturaHost() && !isYouTube) {
      console.error(`uga-video: unsupported host "${this.host}". Use "kaltura" or "youtube".`);
      return html`<p>No video available.</p>`;
    }
    if (this.videoid === '') {
      console.error('uga-video: videoid is required.');
      return html`<p>No video available.</p>`;
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
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #000;
          overflow: hidden;
        }
        .cmp-video__player,
        .cmp-video__placeholder {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .cmp-video__thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .cmp-video__play-button {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: transparent;
          border: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        .cmp-video__play-icon {
          width: 68px;
          height: 48px;
        }
        .cmp-video__spinner {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cmp-video__spinner::before {
          content: '';
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          animation: uga-video-spin 0.8s linear infinite;
        }
        @keyframes uga-video-spin {
          to {
            transform: rotate(360deg);
          }
        }
        .cmp-video__error-box {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: #fff;
          text-align: center;
          padding: 1rem;
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
      <div class="cmp-video util-margin-top-lg">
        ${isYouTube ? this.youtubeCode() : html`<div class="cmp-video__container">${this.renderKalturaStage()}</div>`}
      </div>
    `;
  }
}
