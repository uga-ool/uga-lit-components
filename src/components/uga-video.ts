import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getVersions, getClasslist } from '../lib/api/d2l-client.js';
import { getCourse } from '../lib/api/d2l-utils.js';
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

  private uiconfid = '';
  private domain: string | null = null;
  private kalturaScriptLoaded = false;
  private playerInstances: Map<string, any> = new Map();

  createRenderRoot() {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.ou = getCourse();

    if (this.playerid === "") {  // If no playerid is specified, then we use the standard player. 
      this.playerid = "1574196844";
      this.uiconfid = "57494843"; // this value is different for the standard player, but matches the playerid in other players. 40170611
    } else {
      this.uiconfid = this.playerid;
    }

    if (this.videoid !== "") {  // If the videoid is specified, then use that videoid to generate the player. This is the most simple scenario.

        this.videos.push(this.videoid);  // Have to push to array to account for cases where a file loads multiple videos for an instructor.
        this.loaded = true;
        this.requestUpdate();

    } else {  // If we enter this loop, then no videoid was specified and we have to retrieve it via a json file

        this.getDataFile().then(() => { // Get the data file
            const videoData = this.videodata.data;

            getVersions().then((versions) => { // Get API versions
              this.addVersions(versions);
              
              if (!this.ou) return;

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

              }); // End Get Classlist
            }); // End Get Versions
        }); // End Get Data File
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
    } catch (error) {
      console.error(`Failed to initialize Kaltura player for video ${videoId}:`, error);
    }
  }

  kalturaCode(videoId: string) {
    const containerId = `kaltura_player_${videoId}`;
    
    // Schedule player initialization after the DOM is updated
    setTimeout(() => {
      this.initKalturaPlayer(videoId, containerId);
    }, 0);

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
      ${this.includeRating ? html`<uga-rating .contentId="${videoId}" contentType="video" .ou=${this.ou} .contentName=${this.name} contentPlatform="kaltura"></uga-rating>`:html``}
    `;
    return embedCode;
  }

  youtubeCode(videoId: string) {
    const embedCode = html`
    <div class="cmp-video util-margin-top-lg">
        <iframe class="cmp-video__embed" width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
    ${this.includeRating ? html`<uga-rating .contentId="${videoId}" contentType="video" .ou=${this.ou} .contentName=${this.name} contentPlatform="youtube"></uga-rating>`:html``}
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
}