import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getVersions, getUser, getForums, getTopics, getXsrfToken, createForum, createTopic, createPost } from '../lib/api/d2l-client.js';
import { getCourse } from '../lib/api/d2l-utils.js';
import type { ApiVersions } from '../types/d2l.js';

// Axios is available globally in Brightspace
declare const axios: any;


interface RatingOption {
  value: string;
  text: string;
}

interface CurrentUser {
  firstName?: string;
  lastName?: string;
  username?: string;
  userId?: string;
}

@customElement('uga-rating')
class UgaRating extends LitElement {

  // Light DOM: render into the page directly (D2L-friendly)
  createRenderRoot() {
    return this;
  }

  @property({ type: Boolean }) loaded = true;
  @property({ type: String }) token: string | null = null;
  @property({ type: String }) xsrfRoute = '/d2l/lp/auth/xsrf-tokens';
  @property({ type: Object }) versions: ApiVersions = {};
  @property({ type: String }) forumName: string | null = null;
  @property({ type: String }) forumId: string | null = null;
  @property({ type: String }) topicName: string | null = null;
  @property({ type: String }) topicId: string | null = null;
  @property({ type: Array }) options: RatingOption[] = [
    {value: '0', text: 'Please Select an Option'},
    {value: '1', text: 'Very Poor'},
    {value: '2', text: 'Poor'},
    {value: '3', text: 'Neutral'},
    {value: '4', text: 'Good'},
    {value: '5', text: 'Very Good'}
  ];
  @property({ type: String }) contentId = '';
  @property({ type: String }) contentType = '';
  @property({ type: String }) contentName = '';
  @property({ type: String }) contentPlatform = '';
  @property({ type: String }) ou: string | null = null;
  @property({ type: Boolean }) reviewExists = false;
  @property({ type: String }) name = '';

  private postId: string | null = null;
  private error = false;
  private errorMessage: string | null = null;
  private currentUser: CurrentUser = {};
  private selected: string | null = null;
  private contentTitle = '';
  private domain: string | null = null;

  constructor() {
    super();

    this.addEventListener('keypress', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const activeElement = this.querySelector('#feedback-field') as HTMLElement;
        if (activeElement?.id === 'feedback-field') {
          e.preventDefault();

          if (this.selected !== null && this.selected !== '0') {
            this.submitRating();
          } else {
            this.error = true;
            this.errorMessage = 'Please select a rating';
            this.requestUpdate();
          }
        }
      }
    });
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    
    if (this.forumId === null && this.forumName === null) {
      this.forumName = "Content Ratings";
    }

    if (this.topicId === null && this.topicName === null) {
      this.topicName = "Content Ratings";
    }

    if (this.ou === null) {
      this.ou = getCourse();
    }

    if (!this.ou) return;

    const versions = await getVersions();
    this.addVersions(versions);

    const whoAmI = await getUser(this.versions.lp);
    this.addWhoAmI(whoAmI);

    if (this.forumId === null) {
      const forums = await getForums(this.ou, this.versions.le);
      this.findForum(forums);
    }

    if (this.topicId === null && this.forumId) {
      const topics = await getTopics(this.ou, this.versions.le, parseInt(this.forumId, 10));
      this.findTopic(topics);
    }

    if (this.topicId === null || this.forumId === null) {
      this.error = true;
    } else {
      const postsRoute = "/d2l/api/le/" + this.versions.le + "/" + this.ou + "/discussions/forums/" + this.forumId + "/topics/" + this.topicId + "/posts/";
      const posts = await this.makeGetRequest(postsRoute);
      this.findPost(posts);
    }
  }

  async getToken(): Promise<void> {
    this.token = await getXsrfToken();
  }

  async makePostRequest(route: string, data: any): Promise<any> {
    const promise = axios.post(route, data, { headers: {"X-Csrf-Token": this.token}});
    const result = promise.then((response: any) => response.data);
    return result;
  }

  makeGetRequest(route: string): Promise<any> {
    const promise = axios.get(route);
    const result = promise.then((response: any) => response.data);
    return result;
  }

  /******
   * Handle Valence Responses Here
   */

  addVersions(apiVersions: ApiVersions): void {
    for (let key in apiVersions) {
      this.versions[key] = apiVersions[key];
    }
  }

  findForum(forumData: any): void {
    for (let i in forumData) {
      if (forumData[i]["Name"] === this.forumName) {
        this.forumId = forumData[i]["ForumId"];
      }
    }
  }

  findTopic(topicData: any): void {
    for (let i in topicData) {
      if (topicData[i]["Name"] === this.topicName) {
        this.topicId = topicData[i]["TopicId"];
      }
    }
  }

  findPost(postData: any): void {
    for (let i in postData) {
      if (!postData[i]["IsDeleted"] && postData[i]["PostingUserId"] === this.currentUser.userId) {
        let reviewedContentId = postData[i]['Subject'].split("|")[0];
        if (this.contentId === reviewedContentId) {
          this.reviewExists = true;
          this.postId = postData[i]["PostId"];
          return;
        }
      }
    }
  }

  addWhoAmI(data: any): void {
    this.currentUser.firstName = data.FirstName;
    this.currentUser.lastName = data.LastName;
    this.currentUser.username = data.UniqueName;
    this.currentUser.userId = data.Identifier;
  }

  /******
   * Other functions go here
   */

  async submitRating(): Promise<void> {

    if (this.selected === null || this.selected === '0') {
      this.error = true;
      this.errorMessage = 'Please select a rating';
      this.requestUpdate();
    } else {
      const rating = this.selected;
      const feedbackField = this.shadowRoot?.querySelector('#feedback-field') as HTMLInputElement;
      const feedback = feedbackField?.value || '';
      const result = rating.concat(feedback);

      if (this.ou === null) {
        this.ou = getCourse();
      }

      const route = "/d2l/api/le/" + this.versions.le + "/" + this.ou + "/discussions/forums/" + this.forumId + "/topics/" + this.topicId + "/posts/";

      const data = {
          "ParentPostId": null,
          "Subject": this.contentId + "|" + this.contentType + "|" + this.contentName + "|" + this.contentPlatform,
          "Message": { "Content": result, "Type": "Text" },
          "IsAnonymous": false
      };
      
      if (this.token === null) {
          await this.getToken();
      }

      if (this.token !== null) {
          const postData = await this.makePostRequest(route, data);
          // const postCheck = await this.makeGetRequest(route)
          if (postData.ThreadId > 0) { // Make sure we get post data back with a thread ID
            this.reviewExists = true;
            this.requestUpdate();
          } else {
            this.error = true;
            this.errorMessage = "An error occurred saving your response. Please try again in a few minutes.";
          }
      }
    }
  }

  changeRating(e: Event): void {
    const target = e.target as HTMLSelectElement;
    this.selected = target.value;

    if (this.error === true) {
      this.error = false;
      this.errorMessage = '';
    }

    this.requestUpdate();
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
      `;
    }
  }
}