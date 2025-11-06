import {LitElement, html, css} from 'lit';


class UgaRating extends LitElement {

  static get properties() {
    return {
      loaded: {type: Boolean},
      token: {type: String},
      xsrfRoute: {type: String},
      versions: {type: Object},
      forumName: {type: String},
      forumId: {type: String},
      topicName: {type: String},
      topicId: {type: String},
      options: {type: Array},
      contentId: {type: String},
      contentType: {type: String},
      contentName: {type: String},
      contentPlatform: {type: String},
      ou: {type: String},
      reviewExists: {type: Boolean},
      name: {type: String},
    }
  }

  constructor() {
    super();

    this.addEventListener('keypress', function (e) {     
      if (e.key == 'Enter') {
        if (this.shadowRoot.activeElement.id == "feedback-field") {
          e.preventDefault()

          if (this.selected != null && this.selected != "0") {
            this.submitRating()
          } else {
            this.error = true
            this.errorMessage = "Please select a rating"
            this.requestUpdate()
          }
        }
      }
    });

    this.loaded = true;
    this.token = null;
    this.xsrfRoute = "/d2l/lp/auth/xsrf-tokens";
    this.versions = {};
    this.forumName = null;
    this.forumId = null;
    this.topicName = null;
    this.topicId = null;
    this.postId = null;
    this.error = false;
    this.errorMessage = null;
    this.currentUser = {};
    this.selected = null;
    this.options = [{value: "0", text:"Please Select an Option"}, {value: "1", text: "Very Poor"}, {value: "2", text: "Poor"}, {value: "3", text: "Neutral"}, {value: "4", text: "Good"}, {value: "5", text: "Very Good"}]
    this.ou = null;
    this.contentId = "";
    this.contentType = "";
    this.contentPlatform = "";
    this.contentTitle = "";
    this.name = "";
    this.reviewExists = false;
  }

  async connectedCallback() {
    super.connectedCallback()
    
    if (this.forumId == null && this.forumName == null) {
      this.forumName = "Content Ratings"
    }

    if (this.topicId == null && this.topicName == null) {
      this.topicName = "Content Ratings"
    }

    if (this.ou == null) {
      this.ou = this.getCourse()
    }

    const versionsRoute = "/d2l/api/versions/"
    const versions = this.makeGetRequest(versionsRoute)
    await versions.then(data => { this.addVersions(data) })

    const whoAmIRoute = "/d2l/api/lp/" + this.versions.lp + "/users/whoami"
    const whoAmI = this.makeGetRequest(whoAmIRoute)
    await whoAmI.then(data => { this.addWhoAmI(data) })

    if (this.forumId == null) {
      const forumRoute = "/d2l/api/le/" + this.versions.le + "/" + this.ou + "/discussions/forums/"
      const forums = this.makeGetRequest(forumRoute)
      await forums.then(data => { this.findForum(data) })
    }

    if (this.topicId == null) {
      const topicRoute = "/d2l/api/le/" + this.versions.le + "/" + this.ou + "/discussions/forums/" + this.forumId + "/topics/"
      const topics = this.makeGetRequest(topicRoute)
      await topics.then(data => { this.findTopic(data) })
    }

    if (this.topicId == null || this.forumId == null) {
      this.error = true
    } else {
      const postsRoute = "/d2l/api/le/" + this.versions.le + "/" + this.ou + "/discussions/forums/" + this.forumId + "/topics/" + this.topicId + "/posts/"
      const posts = this.makeGetRequest(postsRoute)
      await posts.then(data => { this.findPost(data) })
    }
  }

  async getToken() {
    const token = this.makeGetRequest(this.xsrfRoute)
    await token.then(data => { this.token = data.referrerToken })
  }

  async makePostRequest(route, data) {
    const promise = axios.post(route, data, { headers: {"X-Csrf-Token": this.token}})
    const result = promise.then((response) => response.data)
    return result
  }

  makeGetRequest(route) {
    const promise = axios.get(route)
    const result = promise.then((response) => response.data)
    return result
  }

  /******
   * Handle Valence Responses Here
   */

  addVersions(apiVersions) {
    for (let i in apiVersions) {
      this.versions[apiVersions[i]['ProductCode']] = apiVersions[i]['LatestVersion'];
    }
  }

  findForum(forumData) {
    for (let i in forumData) {
      if (forumData[i]["Name"] == this.forumName) {
        this.forumId = forumData[i]["ForumId"];
      }
    }
  }

  findTopic(topicData) {
    for (let i in topicData) {
      if (topicData[i]["Name"] == this.topicName) {
        this.topicId = topicData[i]["TopicId"];
      }
    }
  }

  findPost(postData) {
    for (let i in postData) {
      if (!postData[i]["IsDeleted"] && postData[i]["PostingUserId"] == this.currentUser.userId) {
        let reviewedContentId = postData[i]['Subject'].split("|")[0]
        if (this.contentId == reviewedContentId) {
          this.reviewExists = true
          this.postId = postData[i]["PostId"]
          return
        }
      }
    }
  }

  addWhoAmI(data) {
    this.currentUser.firstName = data.FirstName
    this.currentUser.lastName = data.LastName
    this.currentUser.username = data.UniqueName
    this.currentUser.userId = data.Identifier
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

  async submitRating() {

    if (this.selected == null || this.selected == "0") {
      this.error = true
      this.errorMessage = "Please select a rating"
      this.requestUpdate()
    } else {
      const rating = this.selected
      const feedback = this.shadowRoot.querySelector('#feedback-field').value
      const result = rating.concat(feedback)

      if (this.ou == null) {
        await this.getCourse()
      }

      const route = "/d2l/api/le/" + this.versions.le + "/" + this.ou + "/discussions/forums/" + this.forumId + "/topics/" + this.topicId + "/posts/"

      const data = {
          "ParentPostId": null,
          "Subject": this.contentId + "|" + this.contentType + "|" + this.contentName + "|" + this.contentPlatform,
          "Message": { "Content": result, "Type": "Text" },
          "IsAnonymous": false
      }
      
      if (this.token == null) {
          await this.getToken()
      }

      if (this.token != null) {
          const postData = await this.makePostRequest(route, data)
          // const postCheck = await this.makeGetRequest(route)
          if (postData.ThreadId > 0) { // Make sure we get post data back with a thread ID
            this.reviewExists = true
            this.requestUpdate()
          } else {
            this.error = true
            this.errorMessage = "An error occurred saving your response. Please try again in a few minutes."
          }
      }
    }
  }

  changeRating(e) {
    this.selected = e.target.value

    if (this.error == true) {
      this.error = false
      this.errorMessage = ""
    }

    this.requestUpdate()
  }

  render() {
    if (this.reviewExists) {
      return html`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <div class="util-background-light-gray util-pad-all-sm util-display-none@print">
        <p class="cmp-paragraph util-margin-all-none">Thank you for giving feedback on this content.</p>
      </div>
      `
    } else {
      return html`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <form class="util-background-light-gray util-pad-all-sm util-pad-all-md@sm util-pad-all-lg@md util-display-none@print">
        <fieldset>
            <legend class="cmp-heading-5 util-margin-bottom-sm util-text-center util-full-width">Leave feedback for ${this.name}</legend>
            ${this.error ? html`<p class="util-text-center util-color-red">${this.errorMessage}</p>`: html``}
            <div class="obj-grid obj-grid--gap-md@md">
              <div class="obj-grid__full obj-grid__half@md">
                <div class="cmp-form-select">  
                  <label
                      for="rating-select"
                      class="cmp-form-label">
                      How beneficial was this video for your learning?
                  </label>                  
                  <div class="">
                      <select id="rating-select" class="cmp-form-select__dropdown" @change=${this.changeRating}>
                        ${this.options.map(option => html`
                          <option value="${option.value}">${option.text}</option>
                        `)}
                      </select>
                  </div>
                </div>
              </div>
              <div class="obj-grid__full obj-grid__half@md">
                <div class="cmp-form-field">
                    <label
                      for="feedback-field"
                      class="cmp-form-label">
                      Comment
                    </label>
                  <div class="">
                    <div class="util-position-relative">
                      <input id="feedback-field" class="cmp-form-field__input" type="search"
                        placeholder="Leave a Comment (Optional)" />
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </fieldset>
          <div class="obj-grid obj-grid--gap-md@sm util-margin-top-md">
            <div class="obj-grid__full obj-grid__quarter@md">
                <button class="cmp-button
                  cmp-button--full-width" id="submitButton" type="button" @click="${this.submitRating}">
                  Submit Feedback
                </button>
            </div>
          </div>
      </form>
      `
    }
  }
}

customElements.define('uga-rating', UgaRating)