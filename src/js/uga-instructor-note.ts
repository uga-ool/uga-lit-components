import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

// Axios is available globally in Brightspace
declare const axios: any;

export const UGAComponentsLoaded = true;

interface ApiVersions {
  [key: string]: string;
}

interface User {
  [key: string]: any;
}

@customElement('uga-instructor-note')
class UgaInstructorNote extends LitElement {

  @property({ type: Object }) versions: ApiVersions = {};
  @property({ type: Object }) currentUser: User = {};
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
    await this.getVersions();
    await this.getUser();
    this.getCourse();
    await this.getEnrollment();
    await this.getText();
  }

  async getVersions(): Promise<void> {
    const apiVer = await axios.get('/d2l/api/versions/');
    for (let i in apiVer.data) {
      this.versions[apiVer.data[i].ProductCode] = apiVer.data[i].LatestVersion;
    }
  }

  async getUser(): Promise<void> {
    const user = await axios.get('/d2l/api/lp/' + this.versions.lp + '/users/whoami');
    this.currentUser = user.data;
  }

  getCourse(): void {
    const currentLocation = window.location;
    const url = currentLocation.href;
    const a = url.split("/");
    const lastSegment = a[a.length-1];
    const attributes = lastSegment.split("&");

    for (var i=0; i<attributes.length; i++) {
	  // Works with New Content
      let attribute = attributes[i];
      if (attribute.slice(0,3) === "ou=") {
		const ou = attribute.slice(3);
		this.ou = ou;
      }
    }

	if (this.ou === "") {
	  // Works with old content
	  this.ou = attributes[0].split("?")[1].slice(3);
	}
  }

  async getEnrollment(): Promise<void> {
	const url = '/d2l/api/lp/' + this.versions.lp + '/enrollments/myenrollments/' + this.ou;
    const enrollment = await axios.get(url);
    this.enrollment = enrollment.data.Access.ClasslistRoleName;
  }

  async getText(): Promise<void> {
    if (this.filename !== "") {
      if (this.type === 'program') {
        const text = await axios.get('/shared/ugaonline/templates/' + this.program + '/data/' + this.filename);
        this.text = text.data;
        this.requestUpdate();
      } else if (this.type === 'local') {
        const text = await axios.get(this.filename);
        this.text = text.data;
        this.requestUpdate();
      }
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