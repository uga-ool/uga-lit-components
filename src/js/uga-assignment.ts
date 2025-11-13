import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

// Axios is available globally in Brightspace
declare const axios: any;

export const UGAComponentsLoaded = true;

interface ApiVersions {
  [key: string]: string;
}

interface AssignmentData {
  Name: string;
  Id?: number;
  CustomInstructions: {
    Html: string;
  };
  DueDate?: string;
  Availability?: {
    StartDate?: string;
    EndDate?: string;
  };
  DropboxType?: number;
  Assessment?: {
    Rubrics: Array<{ Name: string }>;
  };
  Error?: string;
}

interface EnrollmentData {
  Access: {
    ClasslistRoleName: string;
  };
}

@customElement('uga-assignment')
class UgaAssignment extends LitElement {

  @property({ type: Object }) versions: ApiVersions = {};
  @property({ type: String }) domain: string | null = null;
  @property({ type: String }) ou: string | null = null;
  @property({ type: String }) flexClasses = 'obj-flex-item obj-flex-item__xs util-text-center util-background-light-gray util-pad-all-md';
  @property({ type: String }) name = '';
  @property({ type: Object }) assignmentData: AssignmentData = { Name: 'Loading', CustomInstructions: { Html: 'Loading' } };
  @property({ type: String }) dueDate: string | null = null;
  @property({ type: String }) startDate: string | null = null;
  @property({ type: String }) endDate: string | null = null;
  @property({ type: String }) dropboxType: string | null = null;
  @property({ type: String }) initialHeight = '0';
  @property({ type: String }) rubricString: string | null = null;
  @property({ type: Array }) studentRoles = ['Student', 'Demo Student'];
  @property({ type: Boolean }) loading = false;

  private student: boolean | null = null;
  private loaded = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.ou = this.getCourse();
    this.getVersions().then((versions) => {
      this.addVersions(versions);

      this.getEnrollment().then((enrollment) =>{
        this.checkStudent(enrollment);

        this.getAssignments().then((assignments) => {
          this.findAssignment(assignments);
          this.loaded = true;

        });  // End Find Assignments
      }); // End Get Enrollment
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

  async getEnrollment(): Promise<any> {
    const enrollment = await axios.get('/d2l/api/lp/' + this.versions.lp + '/enrollments/myenrollments/' + this.ou);
    return enrollment;
  }

  /******
   * API Response Handlers go Here
   */

  addVersions(apiVersions: ApiVersions): void {
    for (let i in apiVersions) {
      this.versions[i] = apiVersions[i];
    }
  }

  checkStudent(enrollment: any): void {
    if (this.studentRoles.includes(enrollment.data.Access.ClasslistRoleName)) {
      this.student = true;
    } else {
      this.student = false;
    }
  }

  findAssignment(assignments: any): void {
    let assignmentFound = false;
    for (let i in assignments.data) {
      if (assignments.data[i].Name === this.name) {
        assignmentFound = true;
        this.assignmentData = assignments.data[i];
      }
    }

    if (assignmentFound) {  // If we find the assignment, then we check for specific attributes to use in the component.
      if (this.assignmentData.DueDate) {
        this.dueDate = this.transformDate(this.assignmentData.DueDate);
      } else {
        this.dueDate = null;
      }

      if (this.assignmentData.Availability) {
        if(this.assignmentData.Availability.StartDate) {
          this.startDate = this.transformDate(this.assignmentData.Availability.StartDate);
        } else {
          this.startDate = null;
        }
  
        if(this.assignmentData.Availability.EndDate) {
          this.endDate = this.transformDate(this.assignmentData.Availability.EndDate);
        } else {
          this.endDate = null;
        }
      }

      if (this.assignmentData.DropboxType === 1) {
        this.dropboxType = "Group";
      } else if (this.assignmentData.DropboxType === 2) {
        this.dropboxType = "Individual";
      } else {
        this.dropboxType = null;
      }

      if (this.assignmentData.Assessment && this.assignmentData.Assessment.Rubrics.length > 0) {
        this.rubricString = "";
        if (this.assignmentData.Assessment.Rubrics.length > 1) {
          this.rubricString += "<span class=\"util-font-size-sm\">Rubrics</span><br />";
        } else {
          this.rubricString += "<span class=\"util-font-size-sm\">Rubric</span><br />";
        }
  
        for (let i in this.assignmentData.Assessment.Rubrics) {
          if (i === '0') {
            this.rubricString += this.assignmentData.Assessment.Rubrics[i].Name;
          } else {
            this.rubricString += "<br />" + this.assignmentData.Assessment.Rubrics[i].Name;
          } 
        }
      } else {
        this.rubricString = null;
      }
    }

    if (!assignmentFound) {
      this.assignmentData = { Name: "Assignment Not Found", CustomInstructions: { Html: "" }, Error: "Assignment Not Found" };
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
    return html`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="obj-grid">
          <div class="obj-grid__12-12">
            <h1 class="cmp-heading-1 util-margin-vert-md">${this.assignmentData.Name}</h1>
            ${unsafeHTML(this.assignmentData.CustomInstructions.Html)}
          </div>
          <div class="obj-grid__12-12">
            <div class="obj-flex">
              ${this.dropboxType ? html`<div class=${this.flexClasses}><span class="util-font-size-sm">Assignment Type</span><br />${this.dropboxType}</div>` : html``}
              ${this.dueDate ? html`<div class=${this.flexClasses}><span class="util-font-size-sm">Due Date</span><br/>${this.dueDate}</div>` : html``}
              ${this.rubricString ? html`<div class=${this.flexClasses}>${unsafeHTML(this.rubricString)}</div>` : html``}
              ${this.startDate ? html`<div class=${this.flexClasses}><span class="util-font-size-sm">Start Date</span><br />${this.startDate}</div>` : html``}
              ${this.endDate ? html`<div class=${this.flexClasses}><span class="util-font-size-sm">End Date</span><br />${this.endDate}</div>` : html``}
            </div>
            ${ this.student ? html`<a class="cmp-button cmp-button--full-width" href="https://${this.domain}/d2l/lms/dropbox/user/folder_submit_files.d2l?db=${this.assignmentData.Id}&ou=${this.ou}" target="_blank">Click to visit this assignment</a>` : html`<a class="cmp-button cmp-button--full-width" href="https://${this.domain}//d2l/lms/dropbox/admin/mark/folder_submissions_users.d2l?db=${this.assignmentData.Id}&ou=${this.ou}" target="_blank">Click to visit this assignment</a>`}
          </div>
        </div>
        ${this.loaded ? html`` : html`<div style="min-height: ${this.initialHeight}px"></div>`}
    `;
  }
}