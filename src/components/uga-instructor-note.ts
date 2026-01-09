import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { getVersions, getUser, getEnrollment } from '../lib/api/d2l-client.js';
import { getCourse } from '../lib/api/d2l-utils.js';
import { loadData } from '../lib/data/data-loader.js';
import type { ApiVersions } from '../types/d2l.js';


@customElement('uga-instructor-note')
class UgaInstructorNote extends LitElement {

  @property({ type: Object }) versions: ApiVersions = {};

  // Light DOM: render into the page directly (eLC-friendly)
  createRenderRoot() {
    return this;
  }
  @property({ type: Object }) currentUser: any = {};
  @property({ type: String }) ou = '';
  @property({ type: String }) enrollment = 'Student';
  @property({ type: Array }) excludedRoles = ['Student', 'Demo Student'];
  @property({ type: String }) type = '';
  @property({ type: String }) filename = '';
  @property({ type: String }) program = '';
  @property({ type: String }) text = '';

  constructor() {
    super();
    this.init();
  }

  async init(): Promise<void> {
    const versions = await getVersions();
    for (let key in versions) {
      this.versions[key] = versions[key];
    }

    this.currentUser = await getUser(this.versions.lp);
    this.ou = getCourse() || '';

    if (this.ou) {
      const enrollmentData = await getEnrollment(this.ou, this.versions.lp);
      this.enrollment = enrollmentData.Role?.Name || 'Student';
    }

    if (this.filename !== '' && this.type) {
      this.text = await loadData<string>(this.type as 'local' | 'program', this.filename, this.program);
      this.requestUpdate();
    }
  }

  render() {  // This will only render if the logged in user's role does not appear in the prohibited role array above

    if (!this.excludedRoles.includes(this.enrollment)) {
      return html`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <div class="obj-grid">
        <div class="obj-grid__full util-background-odyssey util-text-center util-pad-all-md">
          <h1 class="cmp-heading-5">Instructor Note</h1>
          <p>${unsafeHTML(this.text)}</p>
        </div>
      </div>
      `;
    }
  }
}