import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Axios is available globally in Brightspace
declare const axios: any;

export const UGAComponentsLoaded = true;

interface ApiVersions {
  [key: string]: string;
}

interface AssignmentData {
  Name: string;
  DueDate?: string;
}

@customElement('uga-duedate')
class UgaDueDate extends LitElement {
  @property({ type: Object }) versions: ApiVersions = {};
  @property({ type: String }) ou: string | null = null;
  @property({ type: String }) name = '';
  @property({ type: Object }) assignmentData: AssignmentData = { Name: '' };
  @property({ type: String }) dueDate = 'LOADING';
  @property({ type: Array }) studentRoles: string[] = [];
  @property({ type: Boolean }) loaded = false;

  private domain: string | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    this.ou = this.getCourse();
    this.getVersions().then((versions) => {
      this.addVersions(versions);

      this.getAssignments().then((assignments) => {
        this.findAssignment(assignments);
        console.log(this.dueDate);
        this.loaded = true;
        this.requestUpdate();

      });  // End Find Assignments

    });  // End Get Versions
  }

  /******
   * API Calls Go Here
   */

   async getVersions(): Promise<ApiVersions> {
    const apiVer = await axios.get('/d2l/api/versions/');
    const result: ApiVersions = {};
    for (let i in apiVer.data) {
      result[apiVer.data[i].ProductCode] = apiVer.data[i].LatestVersion;
    }
    return result;
  }

  async getAssignments(): Promise<any> {
    const assignments = await axios.get('/d2l/api/le/' + this.versions.le + '/' + this.ou + '/dropbox/folders/');
    return assignments;
  }

  /******
   * API Response Handlers go Here
   */

  addVersions(apiVersions: ApiVersions): void {
    for (let i in apiVersions) {
      this.versions[i] = apiVersions[i];
    }
  }

  findAssignment(assignments: any): void {
    let assignmentFound = false;
    for (let i in assignments.data) {
      if (assignments.data[i].Name === this.name) {
        assignmentFound = true;
        this.assignmentData = assignments.data[i];
        console.log(this.assignmentData);
      }
    }

    if (assignmentFound) {  // If we find the assignment, then we check for specific attributes to use in the component.
      if (this.assignmentData.DueDate) {
        this.dueDate = this.transformDate(this.assignmentData.DueDate);
      } else {
        this.dueDate = "N/A";
      }
    }

    if (!assignmentFound) {
      this.dueDate = "Assignment Not Found";
    }

  }

  /******
   * Other functions go here
   */
  getCourse(): string | null {
    const currentLocation = window.location;
    const url = currentLocation.href;
    const a = url.split("/");
    this.domain = a[2];
    const lastSegment = a[a.length-1];
    const attributes = lastSegment.split("&");

    for (var i=0; i<attributes.length; i++) {
      let attribute = attributes[i];
      if (attribute.slice(0,3) === "ou=") {
        const ou = attribute.slice(3);
        return ou;
      }
    }
    return null;  // If this returns null, then the OU could not be determined
  }

  transformDate(apiDate: string): string {
    const date = new Date(apiDate);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return date.toLocaleDateString("en-US", options);
  }

  render() {
    return this.loaded ? html`<span>${this.dueDate}</span>` : html``;
  }
}