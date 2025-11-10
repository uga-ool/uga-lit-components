import { LitElement, html, css } from 'lit';
import { debounce } from '../utils/dom.js';
import { SCROLL_OFFSET } from '../utils/constants.js';
import { track } from '../services/telemetry.js';
import './uga-rating.js';

export const UGAComponentsLoaded = true;

class UgaVideo extends LitElement {

  createRenderRoot() {
    return this;
  }

  static get properties() {
    return {
      ou: {type: String},
      videodata: {type: Object},
      type: {type: String},
      filename: {type: String},
      program: {type: String},
      loaded: {type: Boolean},
      host: {type: String},
      videoid: {type: String},
      playerid: {type: String},
      versions: {type: Object},
      videos: {type: Array},
      includeRating: {type: Boolean},
      name: {type: String}
    }
  }

  constructor() {
    super();
    this.program = "";
    this.ou = null;
    this.versions = {};
    this.videodata = {};
    this.loaded = false;
    this.host = "";
    this.videoid = ""; // This is the value that can be specified as a property
    this.playerid = "";
    this.uiconfid = "";
    this.videos = [];  // This array is needed for cases where we need to load multiple videos for one instructor via a file
    this.includeRating = false;
    this.name = "";
  }

  connectedCallback() {
    super.connectedCallback();
    this.ou = this.getCourse();

    if (this.playerid == "") {  // If no playerid is specified, then we use the standard player. 
      this.playerid = "1574196844";
      this.uiconfid = "57494843"; // this value is different for the standard player, but matches the playerid in other players.
    } else {
      this.uiconfid = this.playerid;
    }

    if (this.videoid != "") {  // If the videoid is specified, then use that videoid to generate the player. This is the most simple scenario.

        this.videos.push(this.videoid)  // Have to push to array to account for cases where a file loads multiple videos for an instructor.
        this.loaded = true

    } else {  // If we enter this loop, then no videoid was specified and we have to retrieve it via a json file

        this.getDataFile().then((dataFile) => { // Get the data file
            const videoData = this.videodata.data;

            this.getVersions().then((versions) => { // Get API versions
              this.addVersions(versions)
              
              this.getClasslist().then((classlist) => { // Get the classlist

                for (let i in classlist) {
                  if (classlist[i].Username in videoData && classlist[i].RoleId == 195) { // Check to see if the user from the classlist is an instructor and is in the video list
                    for (let video in videoData[classlist[i].Username]) {  // Iterate over all videos listed for the identified instructor
                      this.videos.push(videoData[classlist[i].Username][video])  // Add the videos to the this.videos array
                    }
                  }
                }

                this.loaded = true;
                this.requestUpdate();

              }) // End Get Classlist
            }) // End Get Versions
        }) // End Get Data File
    }
    
  }

  async getDataFile() {
    if (this.type == 'local') {
      const dataFile = await axios.get(this.filename)
      this.videodata = dataFile.data
      this.requestUpdate()
    } else if (this.type == 'program') {
      const dataFile = await axios.get('/shared/ugaonline/templates/' + this.program + '/data/' + this.filename)
      this.videodata = dataFile.data
      this.requestUpdate()
    }
  }

  /******
   * API Calls Go Here
   */

   async getVersions() {
    const apiVer = await axios.get('/d2l/api/versions/');
    let result = {}
    for (let i in apiVer.data) {
      result[apiVer.data[i].ProductCode] = apiVer.data[i].LatestVersion
    }
    return result
  }

  async getClasslist() {
    const classlist = await axios.get('/d2l/api/le/' + this.versions.le + '/' + this.ou + '/classlist/');
    return classlist.data
  }

  /******
   * API Response Handlers go Here
   */

   addVersions(apiVersions) {
    for (let i in apiVersions) {
      this.versions[i] = apiVersions[i]
    }
  }


  /******
   * Other functions go here
   */
   getCourse() {
    const currentLocation = window.location;
    const url = currentLocation.href;
    let ou = null
    const a = url.split("/");
    this.domain = a[2]
    let attributes = a[a.length-1];
    attributes = attributes.split("&")

    for (var i=0; i<attributes.length; i++) {  // Try to get the URL attribute
      let attribute = attributes[i]
      if (attribute.slice(0,3) == "ou=") {
        ou = attribute.slice(3)
        return ou
      }
    }

    if (ou == null) {  // If URL attribute fails, parse from the folder structure in URL
      ou = a[5].split("-")[0]
      return ou
    }
  }

  kalturaCode(videoId) {
    const embedCode = html`
    <div class="cmp-video util-margin-top-lg">
        <iframe id="kaltura_player_${this.playerid}" title=${this.name} src="https://cdnapisec.kaltura.com/p/1727411/sp/172741100/embedIframeJs/uiconf_id/${this.uiconfid}/partner_id/1727411?iframeembed=true&playerId=kaltura_player_${this.playerid}&entry_id=${videoId}" class="cmp-video__embed" width="560" height="315" allowfullscreen webkitallowfullscreen mozAllowFullScreen allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture; gyroscope" frameborder="0" itemprop="video" itemscope itemtype="http://schema.org/VideoObject">
        </iframe>
    </div>
    ${this.includeRating ? html`<uga-rating .contentId="${videoId}" contentType="video" .ou=${this.ou} .contentName=${this.name} contentPlatform="kaltura"></uga-rating>`:html``}
    `
    return embedCode
  }

  youtubeCode(videoId) {
    const embedCode = html`
    <div class="cmp-video util-margin-top-lg">
        <iframe class="cmp-video__embed" width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
    ${this.includeRating ? html`<uga-rating .contentId="${videoId}" contentType="video" .ou=${this.ou} .contentName=${this.name} contentPlatform="youtube"></uga-rating>`:html``}
    `
    return embedCode
  }

  /****** 
   * Render Function Goes here
  */
  render() {

    if (this.loaded) {

        let embedCodes = []
        
        if (this.host == "" || this.host.toLowerCase() == "kaltura") {
            for (let v in this.videos) {
              embedCodes.push(this.kalturaCode(this.videos[v]))
            }
        } else if (this.host.toLowerCase() == "youtube") {
            for (let v in this.videos) {
              embedCodes.push(this.youtubeCode(this.videos[v]))
            }
        }

      if (embedCodes.length > 0) {
        return html`
          ${embedCodes.map((embedCode) => 
              html`${embedCode}`
            )}
        `
      }
    }
  }


}

customElements.define('uga-video', UgaVideo)