import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import axios from 'axios';
import { getVersions, getUser, getForums, getTopics, getPostsPaged, getXsrfToken, createForum, createTopic, createPost, logApiVersionWarning } from '../lib/api/d2l-client.js';
import { getCourse } from '../lib/api/d2l-utils.js';
import type { ApiVersions, DiscussionPost } from '../types/d2l.js';


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

  // Light DOM: render into the page directly (eLC-friendly)
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
  @state() private loading = false;
  private abortController: AbortController | null = null;

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
    this.abortController = new AbortController();
    
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
    
    // Check API versions for deprecation warnings
    if (this.versions.le) {
      logApiVersionWarning(this.versions.le, 'getForums');
      logApiVersionWarning(this.versions.le, 'getTopics');
      logApiVersionWarning(this.versions.le, 'getPostsPaged');
    }
    if (this.versions.lp) {
      logApiVersionWarning(this.versions.lp, 'getUser');
    }

    const whoAmI = await getUser(this.versions.lp);
    this.addWhoAmI(whoAmI);

    if (this.forumId === null) {
      try {
        const forums = await getForums(this.ou, this.versions.le);
        this.findForum(forums);
      } catch (error: any) {
        console.error('Error fetching forums:', error);
        this.error = true;
        this.errorMessage = `Failed to fetch forums: ${error.message || 'Unknown error'}`;
        return;
      }
      
      // Create forum if it doesn't exist
      if (this.forumId === null && this.forumName) {
        try {
          if (this.token === null) {
            await this.getToken();
          }
          if (this.token !== null) {
            const forum = await createForum(this.ou, this.versions.le, this.forumName, '');
            this.forumId = forum.ForumId.toString();
          }
        } catch (error: any) {
          console.error('Error creating forum:', error);
          this.error = true;
          this.errorMessage = `Failed to create rating forum: ${error.message || 'Unknown error'}`;
          return;
        }
      }
    }

    if (this.topicId === null && this.forumId) {
      try {
        const topics = await getTopics(this.ou, this.versions.le, parseInt(this.forumId, 10));
        this.findTopic(topics);
      } catch (error: any) {
        console.error('Error fetching topics:', error);
        this.error = true;
        this.errorMessage = `Failed to fetch topics: ${error.message || 'Unknown error'}`;
        return;
      }
      
      // Create topic if it doesn't exist
      if (this.topicId === null && this.topicName) {
        try {
          if (this.token === null) {
            await this.getToken();
          }
          if (this.token !== null) {
            const topic = await createTopic(this.ou, this.versions.le, parseInt(this.forumId, 10), this.topicName, '');
            this.topicId = topic.TopicId.toString();
          }
        } catch (error: any) {
          console.error('Error creating topic:', error);
          this.error = true;
          this.errorMessage = `Failed to create rating topic: ${error.message || 'Unknown error'}`;
          return;
        }
      }
    }

    if (this.topicId === null || this.forumId === null) {
      this.error = true;
      if (!this.errorMessage) {
        this.errorMessage = 'Failed to initialize rating system';
      }
    } else {
      try {
        // Use paged posts endpoint for better performance
        const posts = await getPostsPaged(
          this.ou,
          this.versions.le,
          parseInt(this.forumId, 10),
          parseInt(this.topicId, 10),
          { pageSize: 200 }
        );
        this.findPost(posts);
      } catch (error: any) {
        // Don't show error if request was aborted (component unmounted)
        if (error.message === 'Request aborted' || this.abortController?.signal.aborted) {
          return;
        }
        console.error('Error fetching posts:', error);
        // Don't set error state here - allow component to continue
        // Posts might not exist yet, which is fine
      }
    }
  }
  
  disconnectedCallback(): void {
    super.disconnectedCallback();
    // Cancel all in-flight requests
    this.abortController?.abort();
    this.abortController = null;
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

  findPost(postData: DiscussionPost[]): void {
    for (const post of postData) {
      // Type-safe access to post properties
      const postAny = post as any;
      if (!postAny.IsDeleted && postAny.PostingUserId === this.currentUser.userId) {
        const subject: string = postAny.Subject || '';
        const parts = subject.split('|').map((s: string) => s.trim());
        const reviewedContentId = parts.length > 0 ? parts[parts.length - 1] : '';
        if (this.contentId === reviewedContentId) {
          this.reviewExists = true;
          this.postId = postAny.PostId?.toString() || null;
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
      return;
    }
    
    this.loading = true;
    this.error = false;
    this.errorMessage = null;
    
    // Optimistic update - show success immediately
    const previousReviewExists = this.reviewExists;
    this.reviewExists = true;
    this.requestUpdate();
    
    try {
      const rating = this.selected;
      const feedbackField = this.querySelector('#feedback-field') as HTMLInputElement;
      const feedback = (feedbackField?.value || '').trim();
      const label = this.options.find(o => o.value === rating)?.text || '';
      const result = label ? `${rating} ${label} - ${feedback}` : `${rating} - ${feedback}`;

      if (this.ou === null) {
        this.ou = getCourse();
      }
      
      if (!this.ou || !this.forumId || !this.topicId) {
        throw new Error('Missing required information to submit rating');
      }

      const data = {
        "ParentPostId": null,
        // New subject format: "{contentName} | {contentId}"
        "Subject": `${this.contentName} | ${this.contentId}`,
        "Message": { "Content": result, "Type": "Text" },
        "IsAnonymous": false
      };
      
      if (this.token === null) {
        await this.getToken();
      }

      // Get token if needed (createPost will get it if not provided)
      if (this.token === null) {
        await this.getToken();
      }
      
      // Create post - createPost handles token internally if not provided
      const postData = await createPost(
        this.ou,
        this.versions.le,
        parseInt(this.forumId, 10),
        parseInt(this.topicId, 10),
        data.Subject,
        result,
        {
          xsrfToken: this.token || undefined,
          isAnonymous: false
        }
      );
      
      // Check if post was created successfully
      // DiscussionPost should have PostId and ThreadId properties
      // Accept any truthy PostId or ThreadId value (including 0, which is valid)
      const hasPostId = postData && typeof postData === 'object' && 'PostId' in postData;
      const hasThreadId = postData && typeof postData === 'object' && 'ThreadId' in postData;
      
      if (hasPostId || hasThreadId) {
        // Success - optimistic update was correct
        this.error = false;
        this.postId = postData.PostId?.toString() || null;
        console.log('✅ Rating submitted successfully:', { postId: postData.PostId, threadId: postData.ThreadId });
      } else {
        // Rollback optimistic update
        this.reviewExists = previousReviewExists;
        console.error('❌ Unexpected post response structure:', {
          postData,
          hasPostId,
          hasThreadId,
          type: typeof postData,
          keys: postData ? Object.keys(postData) : 'null/undefined'
        });
        throw new Error("Post was created but response was unexpected. Please refresh and try again.");
      }
    } catch (error: any) {
      // Rollback optimistic update on error
      this.reviewExists = previousReviewExists;
      console.error('Error submitting rating:', error);
      this.error = true;
      this.errorMessage = error.response?.data?.Message || error.message || 'An error occurred saving your response. Please try again in a few minutes.';
    } finally {
      this.loading = false;
      this.requestUpdate();
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
            <legend class="cmp-heading-5 util-margin-bottom-sm util-text-center util-full-width">Leave feedback for ${this.contentName}</legend>
            ${this.error ? html`<p class="util-text-center util-color-red" role="alert">${this.errorMessage}</p>`: html``}
            <div class="obj-grid obj-grid--gap-md@md">
              <div class="obj-grid__full obj-grid__half@md">
                <div class="cmp-form-select">  
                  <label
                      for="rating-select"
                      class="cmp-form-label">
                      How beneficial was this video for your learning?
                  </label>                  
                  <div class="">
                      <select id="rating-select" class="cmp-form-select__dropdown" @change=${this.changeRating} ?disabled=${this.loading}>
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
                        placeholder="Leave a Comment (Optional)" ?disabled=${this.loading} />
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </fieldset>
          <div class="obj-grid obj-grid--gap-md@sm util-margin-top-md">
            <div class="obj-grid__full obj-grid__quarter@md">
                <button class="cmp-button
                  cmp-button--full-width" id="submitButton" type="button" @click="${this.submitRating}" ?disabled=${this.loading}>
                  ${this.loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
            </div>
          </div>
      </form>
      `;
    }
  }
}