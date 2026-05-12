import { LitElement, html } from 'lit';
import type { PropertyValues } from 'lit';
import axios from 'axios';
import { customElement, property, state } from 'lit/decorators.js';
import { getVersions, getClasslist, getCurrentUserId, getXsrfToken } from '../lib/api/d2l-client.js';
import { getCourse, getTopicId } from '../lib/api/d2l-utils.js';
import { completeContentTopic } from '../lib/api/d2l-client-content.js';
import { sendVideoEvent } from '../lib/api/video-analytics-client.js';
import { loadData } from '../lib/data/data-loader.js';
import type { ApiVersions, ClasslistUser } from '../types/d2l.js';
import './uga-rating.js';

interface DjinnCitation {
  startMs: number;
  endMs?: number;
  text: string;
}

@customElement('uga-video')
class UgaVideo extends LitElement {

  @property({ type: String }) ou: string | null = null;
  @property({ type: Object }) videodata: any = { data: {} };
  @property({ type: String }) type = '';
  @property({ type: String }) filename = '';
  @property({ type: String }) program = '';
  @property({ type: Boolean }) loaded = false;
  @property({ type: String }) host = '';
  @property({ type: String }) videoid = '';
  @property({ type: String }) playerid = '';
  @property({ type: Object }) versions: ApiVersions = {};
  @property({ type: Array }) videos: string[] = [];
  @property({ type: Boolean }) includeRating = false;
  @property({ type: String }) name = '';
  @property({ type: String, attribute: 'topic-id' }) topicId = '';
  /** When true and `djinnApiBase` is set, show Kaltura Djinn Q&A (eLC + Djinn server). */
  @property({ type: Boolean, attribute: 'enable-djinn' }) enableDjinn = false;
  /** Base URL of Kaltura Djinn service (no trailing slash), e.g. https://djinn.example.edu */
  @property({ type: String, attribute: 'djinn-api-base' }) djinnApiBase = '';
  /** Optional shared secret; sent as X-Djinn-Api-Key if set */
  @property({ type: String, attribute: 'djinn-api-key' }) djinnApiKey = '';

  @state() private djinnLoadingVideoId: string | null = null;
  @state() private djinnQuestionDraft: Record<string, string> = {};
  @state() private djinnAnswerByVideo: Record<string, string> = {};
  @state() private djinnCitationsByVideo: Record<string, DjinnCitation[]> = {};
  @state() private djinnErrorByVideo: Record<string, string> = {};

  private uiconfid = '';
  private domain: string | null = null;
  private kalturaScriptLoaded = false;
  private playerInstances: Map<string, any> = new Map();
  private videoNames: Map<string, string> = new Map();
  private componentId: string = `video_${Math.random().toString(36).substr(2, 9)}`;
  private completedTopics: Set<string> = new Set();
  private lastTimeUpdateSent: Map<string, number> = new Map();
  private readonly TIME_UPDATE_THROTTLE_MS = 30000;
  private analyticsContext: { userId: string | null; leVersion: string; lpVersion: string } | null = null;

  createRenderRoot() {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.ou = getCourse();

    if (this.playerid === "") {
      // Default Kaltura player (uiConf); omit attribute to use this ID.
      this.playerid = "57494843";
      this.uiconfid = "57494843";
    } else {
      this.uiconfid = this.playerid;
    }

    if (this.videoid !== "") {  // If the videoid is specified, then use that videoid to generate the player. This is the most simple scenario.
      this.videos.push(this.videoid);  // Have to push to array to account for cases where a file loads multiple videos for an instructor.
      this.loaded = true;
      this.requestUpdate();
    } else {  // If we enter this loop, then no videoid was specified and we have to retrieve it via a json file
      this.getDataFile().then(() => { // Get the data file
        const videoData = this.videodata?.data;

        // Check if videoData is an array (simple structure - accessible to all)
        if (Array.isArray(videoData)) {
          // Simple array structure: just use all videos
          for (let i = 0; i < videoData.length; i++) {
            this.videos.push(videoData[i]);
          }
          this.loaded = true;
          this.requestUpdate();
        } else if (videoData && typeof videoData === 'object') {
          // Username-based structure (for backwards compatibility)
          getVersions().then((versions) => { // Get API versions
            this.addVersions(versions);

            if (!this.ou) {
              this.loaded = true;
              this.requestUpdate();
              return;
            }

            getClasslist(this.ou, this.versions.le).then((classlist) => { // Get the classlist
              for (let i in classlist) {
                if (classlist[i].Username in videoData && classlist[i].RoleId === 195) { // Check to see if the user from the classlist is an instructor and is in the video list
                  for (let video in videoData[classlist[i].Username]) {  // Iterate over all videos listed for the identified instructor
                    this.videos.push(videoData[classlist[i].Username][video]);  // Add the videos to the this.videos array
                  }
                }
              }

              this.loaded = true;
              this.requestUpdate();
            }).catch((error) => {
              console.error('Failed to get classlist:', error);
              this.loaded = true;
              this.requestUpdate();
            }); // End Get Classlist
          }).catch((error) => {
            console.error('Failed to get API versions:', error);
            this.loaded = true;
            this.requestUpdate();
          }); // End Get Versions
        } else {
          console.error('Invalid video data structure:', videoData);
          this.loaded = true;
          this.requestUpdate();
        }
      }).catch((error) => {
        console.error('Failed to load video data file:', error);
        this.loaded = true;
        this.requestUpdate();
      }); // End Get Data File
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    for (const [videoId, player] of this.playerInstances) {
      try {
        if (player && typeof player.destroy === 'function') {
          player.destroy();
        }
      } catch (_) {
        // ignore
      }
    }
    this.playerInstances.clear();
  }

  async getDataFile(): Promise<void> {
    if (this.type === 'local' || this.type === 'program') {
      this.videodata = await loadData<any>(this.type, this.filename, this.program);
      this.requestUpdate();
    }
  }

  /******
   * API Response Handlers go Here
   */

   addVersions(apiVersions: ApiVersions): void {
    for (let i in apiVersions) {
      this.versions[i] = apiVersions[i];
    }
  }

  /**
   * Dynamically load the KalturaPlayer script from CDN
   */
  private loadKalturaScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.kalturaScriptLoaded || (window as any).KalturaPlayer) {
        this.kalturaScriptLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://cdnapisec.kaltura.com/p/1727411/embedPlaykitJs/uiconf_id/${this.uiconfid}`;
      script.type = 'text/javascript';
      script.onload = () => {
        this.kalturaScriptLoaded = true;
        resolve();
      };
      script.onerror = () => {
        console.error('Failed to load KalturaPlayer script');
        reject(new Error('KalturaPlayer script failed to load'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize a Kaltura player for a specific video
   */
  private async initKalturaPlayer(videoId: string, containerId: string): Promise<void> {
    try {
      // Check if player already exists for this video
      if (this.playerInstances.has(videoId)) {
        return;
      }

      // Check if container element exists
      const containerElement = document.getElementById(containerId);
      if (!containerElement) {
        console.warn(`Container element not found for video ${videoId}, retrying...`);
        setTimeout(() => this.initKalturaPlayer(videoId, containerId), 100);
        return;
      }

      // Check if container already has a player (might exist from previous render)
      if (containerElement.hasChildNodes() && containerElement.children.length > 0) {
        // Container already has content, skip initialization
        return;
      }

      await this.loadKalturaScript();
      
      const kalturaPlayer = (window as any).KalturaPlayer.setup({
        targetId: containerId,
        provider: {
          partnerId: 1727411,
          uiConfId: this.uiconfid
        },
        ui: {
          components: {
            // Hide the Kaltura logo/watermark
            logo: {
              disabled: true
            }
          }
        }
      });

      kalturaPlayer.loadMedia({ entryId: videoId });
      this.playerInstances.set(videoId, kalturaPlayer);

      this.attachVideoAnalyticsListeners(kalturaPlayer, videoId);
    } catch (error) {
      console.error(`Failed to initialize Kaltura player for video ${videoId}:`, error);
      // If initialization fails, don't retry to avoid infinite loops
    }
  }

  /**
   * Attach event listeners for D2L completion and custom analytics backend.
   */
  private attachVideoAnalyticsListeners(player: any, videoId: string): void {
    const EventCore = player?.Event?.Core || {};
    const eventMap: Array<{ key: string; name: string }> = [
      { key: 'PLAY', name: 'play' },
      { key: 'PAUSE', name: 'pause' },
      { key: 'ENDED', name: 'ended' },
      { key: 'TIME_UPDATE', name: 'timeupdate' },
    ];

    for (const { key, name } of eventMap) {
      const eventName = EventCore[key] || name;
      player.addEventListener(eventName, (ev: any) => this.handleVideoEvent(player, videoId, name, ev));
    }
  }

  private async getAnalyticsContext(): Promise<{ userId: string | null; leVersion: string; lpVersion: string }> {
    if (this.analyticsContext) return this.analyticsContext;
    try {
      const versions = await getVersions();
      const leVersion = versions.le || '';
      const lpVersion = versions.lp || '';
      const userId = await getCurrentUserId(lpVersion);
      this.analyticsContext = { userId, leVersion, lpVersion };
      return this.analyticsContext;
    } catch (_) {
      return { userId: null, leVersion: '', lpVersion: '' };
    }
  }

  private async handleVideoEvent(
    player: any,
    videoId: string,
    eventType: string,
    ev: any
  ): Promise<void> {
    const currentTime = player?.currentTime ?? ev?.payload?.currentTime ?? 0;
    const duration = player?.duration ?? ev?.payload?.duration ?? 0;
    const percentWatched = duration > 0 ? (currentTime / duration) * 100 : 0;

    const topicId = getTopicId(this.topicId);
    const ou = this.ou;
    const ctx = await this.getAnalyticsContext();

    sendVideoEvent({
      entryId: videoId,
      topicId: topicId ?? undefined,
      ou: ou ?? undefined,
      userId: ctx.userId ?? undefined,
      eventType,
      timestamp: new Date().toISOString(),
      currentTime,
      duration,
      percentWatched,
    }).catch(() => {});

    if (eventType === 'timeupdate') {
      const last = this.lastTimeUpdateSent.get(videoId) ?? 0;
      if (Date.now() - last < this.TIME_UPDATE_THROTTLE_MS) return;
      this.lastTimeUpdateSent.set(videoId, Date.now());
    }

    const completionKey = `${videoId}:${topicId ?? 'none'}`;
    if (this.completedTopics.has(completionKey)) return;

    const shouldComplete = eventType === 'ended' || (eventType === 'timeupdate' && percentWatched >= 80);
    if (!shouldComplete || !topicId || !ou || !ctx.userId || !ctx.leVersion) return;

    this.completedTopics.add(completionKey);
    completeContentTopic(ou, ctx.leVersion, topicId, ctx.userId).catch(() => {
      this.completedTopics.delete(completionKey);
    });
  }

  /**
   * Get a short-lived Kaltura session (KS) using widget session for public access
   */
  private async getKalturaSession(): Promise<string | null> {
    try {
      const params = new URLSearchParams();
      // Widget ID format: _<partnerId>
      params.append('widgetId', `_1727411`);
      params.append('format', '1');
      const { data } = await axios.post(
        'https://www.kaltura.com/api_v3/service/session/action/startWidgetSession',
        params
      );
      return data?.ks ?? null;
    } catch (_) {
      return null;
    }
  }

  /**
   * Retrieve Kaltura media name by entryId via media.get
   */
  private async fetchKalturaName(entryId: string): Promise<string | null> {
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
    } catch (_) {
      return null;
    }
  }

  private async ensureVideoName(entryId: string): Promise<void> {
    if (this.videoNames.has(entryId)) return;
    const name = await this.fetchKalturaName(entryId);
    if (name) {
      this.videoNames.set(entryId, name);
      this.requestUpdate();
    }
  }

  private normalizeDjinnBase(): string {
    return (this.djinnApiBase || '').trim().replace(/\/$/, '');
  }

  private async submitDjinnQuestion(videoId: string): Promise<void> {
    const base = this.normalizeDjinnBase();
    if (!base) return;
    const q = (this.djinnQuestionDraft[videoId] || '').trim();
    if (!q) return;

    this.djinnLoadingVideoId = videoId;
    const nextErr = { ...this.djinnErrorByVideo };
    delete nextErr[videoId];
    this.djinnErrorByVideo = nextErr;
    this.requestUpdate();

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.djinnApiKey) {
      headers['X-Djinn-Api-Key'] = this.djinnApiKey;
    }
    try {
      const tok = await getXsrfToken();
      if (tok) headers['X-Csrf-Token'] = tok;
    } catch (_) {
      /* Xsrf optional when gateway does not require Brightspace session */
    }

    try {
      const res = await fetch(`${base}/v1/ask`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ entryId: videoId, question: q }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        answer?: string;
        citations?: DjinnCitation[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : res.statusText);
      }
      this.djinnAnswerByVideo = { ...this.djinnAnswerByVideo, [videoId]: data.answer ?? '' };
      this.djinnCitationsByVideo = {
        ...this.djinnCitationsByVideo,
        [videoId]: Array.isArray(data.citations) ? data.citations : [],
      };
    } catch (e) {
      this.djinnErrorByVideo = {
        ...this.djinnErrorByVideo,
        [videoId]: e instanceof Error ? e.message : 'Request failed',
      };
    } finally {
      this.djinnLoadingVideoId = null;
      this.requestUpdate();
    }
  }

  private seekDjinnCitation(videoId: string, startMs: number): void {
    const p = this.playerInstances.get(videoId);
    if (!p) return;
    try {
      p.currentTime = startMs / 1000;
      if (typeof p.play === 'function') {
        p.play().catch(() => {});
      }
    } catch (_) {
      /* ignore */
    }
  }

  kalturaCode(videoId: string) {
    const containerId = `kaltura_player_${this.componentId}_${videoId}`;
    // Kick off async name fetch for rating display
    this.ensureVideoName(videoId);

    const djinnBase = this.normalizeDjinnBase();
    const showDjinn = this.enableDjinn && djinnBase !== '';
    const embedCode = html`
      <style>
        .cmp-video::after {
          content: none !important;
          display: none !important;
          padding-top: 0 !important;
        }
        .cmp-video__row {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: flex-start;
        }
        .cmp-video__container {
          flex: 2;
          min-width: 280px;
          width: 100%;
          background: #000;
        }
        .cmp-video__container > div {
          width: 100%;
          height: auto;
        }
        .djinn-panel {
          flex: 1;
          min-width: 260px;
          max-width: 100%;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          background: #fafafa;
        }
        .djinn-panel h4 {
          margin: 0 0 0.5rem;
          font-size: 1rem;
          color: #333;
        }
        .djinn-panel textarea {
          width: 100%;
          min-height: 4rem;
          box-sizing: border-box;
          font: inherit;
          margin-bottom: 0.5rem;
        }
        .djinn-panel button.djinn-ask {
          background: #ba0c2f;
          color: #fff;
          border: none;
          padding: 0.4rem 1rem;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
        }
        .djinn-panel button.djinn-ask:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .djinn-answer {
          margin-top: 0.75rem;
          font-size: 0.95rem;
          line-height: 1.45;
          color: #222;
        }
        .djinn-cite {
          display: block;
          margin-top: 0.35rem;
          font-size: 0.85rem;
          color: #ba0c2f;
          text-decoration: underline;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          text-align: left;
        }
        .djinn-err {
          margin-top: 0.5rem;
          color: #b00020;
          font-size: 0.9rem;
        }
      </style>
      <div class="cmp-video util-margin-top-lg">
        <div class="cmp-video__row">
          <div class="cmp-video__container">
            <div id="${containerId}" style="width: 100%; aspect-ratio: 16 / 9;"></div>
          </div>
          ${showDjinn
            ? html`
                <div class="djinn-panel" aria-label="Kaltura Djinn">
                  <h4>Kaltura Djinn</h4>
                  <textarea
                    placeholder="Ask about this video (from captions)…"
                    .value=${this.djinnQuestionDraft[videoId] ?? ''}
                    @input=${(e: Event) => {
                      const t = e.target as HTMLTextAreaElement;
                      this.djinnQuestionDraft = { ...this.djinnQuestionDraft, [videoId]: t.value };
                    }}
                  ></textarea>
                  <button
                    type="button"
                    class="djinn-ask"
                    ?disabled=${this.djinnLoadingVideoId === videoId}
                    @click=${() => this.submitDjinnQuestion(videoId)}
                  >
                    ${this.djinnLoadingVideoId === videoId ? 'Asking…' : 'Ask'}
                  </button>
                  ${this.djinnErrorByVideo[videoId]
                    ? html`<div class="djinn-err">${this.djinnErrorByVideo[videoId]}</div>`
                    : null}
                  ${this.djinnAnswerByVideo[videoId]
                    ? html`
                        <div class="djinn-answer">${this.djinnAnswerByVideo[videoId]}</div>
                        ${(this.djinnCitationsByVideo[videoId] ?? []).map(
                          (c) => html`
                            <button
                              type="button"
                              class="djinn-cite"
                              @click=${() => this.seekDjinnCitation(videoId, c.startMs)}
                            >
                              Jump to ${(c.startMs / 1000).toFixed(1)}s — ${c.text.slice(0, 80)}${c.text.length > 80 ? '…' : ''}
                            </button>
                          `
                        )}
                      `
                    : null}
                </div>
              `
            : null}
        </div>
      </div>
      ${this.includeRating ? html`<uga-rating .contentId="${videoId}" contentType="video" .ou=${this.ou} .contentName=${this.videoNames.get(videoId) ?? this.name} contentPlatform="kaltura"></uga-rating>`:html``}
    `;
    return embedCode;
  }

  youtubeCode(videoId: string) {
    const embedCode = html`
      <style>
        /* Suppress the design-system .cmp-video::after padding-top hack so
           the YouTube iframe keeps its 16:9 aspect ratio. Without this the
           iframe distorts when no sibling Kaltura video is also on the page. */
        .cmp-video::after {
          content: none !important;
          display: none !important;
          padding-top: 0 !important;
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
        <div class="cmp-video__youtube-container">
          <iframe
            class="cmp-video__embed"
            src="https://www.youtube.com/embed/${videoId}"
            title="${this.name || `YouTube video ${videoId}`}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      </div>
      ${this.includeRating ? html`<uga-rating .contentId="${videoId}" contentType="video" .ou=${this.ou} .contentName=${this.name} contentPlatform="youtube"></uga-rating>` : html``}
    `;
    return embedCode;
  }

  /****** 
   * Render Function Goes here
  */
  render() {

    if (this.loaded) {

        const embedCodes = [];
        
        if (this.host === "" || this.host.toLowerCase() === "kaltura") {
            for (let v in this.videos) {
              embedCodes.push(this.kalturaCode(this.videos[v]));
            }
        } else if (this.host.toLowerCase() === "youtube") {
            for (let v in this.videos) {
              embedCodes.push(this.youtubeCode(this.videos[v]));
            }
        }

      if (embedCodes.length > 0) {
        return html`
          <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
          ${embedCodes.map((embedCode) => 
              html`${embedCode}`
            )}
        `;
      }
      
      // No videos found
      return html`<p>No videos available.</p>`;
    }
    
    // Not loaded yet
    return html`<p>Loading video...</p>`;
  }

  updated(changedProperties: PropertyValues<this>): void {
    // Initialize Kaltura players only when host is Kaltura (YouTube uses iframe, no init needed)
    const isKaltura = this.host === '' || this.host.toLowerCase() === 'kaltura';
    if (
      isKaltura &&
      (changedProperties.has('loaded') || changedProperties.has('videos')) &&
      this.loaded &&
      this.videos.length > 0
    ) {
      this.updateComplete.then(() => {
        this.videos.forEach((videoId) => {
          if (!this.playerInstances.has(videoId)) {
            const containerId = `kaltura_player_${this.componentId}_${videoId}`;
            this.initKalturaPlayer(videoId, containerId);
          }
        });
      });
    }
  }
}