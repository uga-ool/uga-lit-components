import { LitElement, html } from 'lit';
import type { PropertyValues } from 'lit';
import axios from 'axios';
import { customElement, property } from 'lit/decorators.js';
import { getVersions, getClasslist, getCurrentUserId } from '../lib/api/d2l-client.js';
import { getCourse, getTopicId } from '../lib/api/d2l-utils.js';
import { completeContentTopic } from '../lib/api/d2l-client-content.js';
import { loadData } from '../lib/data/data-loader.js';
import type { ApiVersions, ClasslistUser } from '../types/d2l.js';
import './uga-rating.js';

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

  /**
   * UGA's Kaltura account and player configuration. These are fixed for every embed —
   * only `videoid` (the entry) and `playerid` (the div/target id) vary per instance.
   */
  private static readonly PARTNER_ID = 1727411;
  private static readonly UICONF_ID = '52620262';

  private domain: string | null = null;
  private kalturaScriptLoaded = false;
  private playerInstances: Map<string, any> = new Map();
  private videoNames: Map<string, string> = new Map();
  private completedTopics: Set<string> = new Set();
  private analyticsContext: { userId: string | null; leVersion: string; lpVersion: string } | null = null;

  createRenderRoot() {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.ou = getCourse();

    if (this.playerid === "") {
      // Default player id for the embed container; omit the attribute to use this one.
      this.playerid = "660400380";
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
    this.destroyPlayers();
  }

  private destroyPlayers(): void {
    for (const [, player] of this.playerInstances) {
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

  /**
   * connectedCallback() only runs once, so it can't react to videoid/playerid being changed
   * on an already-connected element (e.g. a page swapping the attribute at runtime). Handle
   * that here — skip the very first update since connectedCallback already set things up.
   */
  willUpdate(changedProperties: PropertyValues<this>): void {
    if (!this.hasUpdated) return;

    // A new playerid means a new container id, so existing players have to be torn down
    // and rebuilt into the new element.
    if (changedProperties.has('playerid')) {
      this.destroyPlayers();
    }

    if (changedProperties.has('videoid') && this.videoid !== '') {
      this.videos = [this.videoid];
      this.loaded = true;
    }
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
      script.src = `https://cdnapisec.kaltura.com/p/${UgaVideo.PARTNER_ID}/embedPlaykitJs/uiconf_id/${UgaVideo.UICONF_ID}`;
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
   * Show a visible fallback message in place of a player that failed to load or errored,
   * since a bad uiConf ID (e.g. `playerid` set to the wrong number) fails without throwing.
   */
  private showVideoError(containerId: string): void {
    const containerElement = document.getElementById(containerId);
    if (containerElement) {
      containerElement.innerHTML = '<p style="color: #fff; text-align: center; padding: 1rem;">This video failed to load. Please contact your instructor.</p>';
    }
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
        entryTitle: this.kalturaVideoTitle(videoId),
        provider: {
          partnerId: UgaVideo.PARTNER_ID,
          uiConfId: UgaVideo.UICONF_ID
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

      this.attachKalturaPlaybackListeners(kalturaPlayer, videoId);

      const errorEventName = kalturaPlayer?.Event?.Core?.ERROR || 'error';
      kalturaPlayer.addEventListener(errorEventName, (ev: any) => {
        console.error(`Kaltura player error for video ${videoId} (playerid: ${this.playerid}):`, ev);
        this.showVideoError(containerId);
      });
    } catch (error) {
      console.error(`Failed to initialize Kaltura player for video ${videoId} (playerid: ${this.playerid}):`, error);
      this.showVideoError(containerId);
      // If initialization fails, don't retry to avoid infinite loops
    }
  }

  /**
   * Kaltura playback listeners: D2L topic completion when the video ends or reaches 80%.
   */
  private attachKalturaPlaybackListeners(player: any, videoId: string): void {
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
      params.append('widgetId', `_${UgaVideo.PARTNER_ID}`);
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

  private kalturaVideoTitle(videoId: string): string {
    return this.name || this.videoNames.get(videoId) || `Kaltura video ${videoId}`;
  }

  /**
   * The div id KalturaPlayer.setup() mounts into, matching Kaltura's own embed code
   * (`kaltura_player_<playerid>`). When one element renders several videos from a data
   * file, the entry id is appended so the ids stay unique on the page.
   */
  private getContainerId(videoId: string): string {
    const base = `kaltura_player_${this.playerid}`;
    return this.videos.length > 1 ? `${base}_${videoId}` : base;
  }

  kalturaCode(videoId: string) {
    const containerId = this.getContainerId(videoId);
    this.ensureVideoName(videoId);

    const embedCode = html`
      <style>
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
      </style>
      <div class="cmp-video util-margin-top-lg">
        <div class="cmp-video__container">
          <div id="${containerId}" style="width: 100%; aspect-ratio: 16 / 9;"></div>
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
    const isKaltura = this.host === '' || this.host.toLowerCase() === 'kaltura';
    const relevantChange =
      changedProperties.has('loaded') ||
      changedProperties.has('videos');

    if (isKaltura && relevantChange && this.loaded && this.videos.length > 0) {
      this.updateComplete.then(() => {
        this.videos.forEach((videoId) => {
          if (!this.playerInstances.has(videoId)) {
            this.initKalturaPlayer(videoId, this.getContainerId(videoId));
          }
        });
      });
    }
  }
}