import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { getVersions, getEnrollment, getAssignments } from '../lib/api/d2l-client.js';
import { getCourse, transformDate } from '../lib/api/d2l-utils.js';
import type { ApiVersions } from '../types/d2l.js';

// Axios is available globally in Brightspace
declare const axios: any;

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

  // Light DOM: render into the page directly (D2L-friendly)
  createRenderRoot() {
    return this;
  }
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
    
    // Check if axios is available (D2L environment)
    if (typeof axios === 'undefined') {
      this.assignmentData = {
        Name: this.name,
        CustomInstructions: { Html: '' },
        Error: 'This component requires D2L API access. It will only function within a Brightspace course.'
      };
      this.loaded = true;
      this.requestUpdate();
      return;
    }

    this.ou = getCourse();
    this.domain = window.location.hostname;
    
    getVersions().then((versions) => {
      this.addVersions(versions);

      if (!this.ou) return;

      getEnrollment(this.ou, this.versions.lp).then((enrollment) =>{
        this.checkStudent(enrollment);

        getAssignments(this.ou!, this.versions.le).then((assignments) => {
          this.findAssignment(assignments);
          this.loaded = true;
        });
      }).catch((error) => {
        this.assignmentData = {
          Name: this.name,
          CustomInstructions: { Html: '' },
          Error: `Unable to load enrollment data: ${error.message}`
        };
        this.loaded = true;
        this.requestUpdate();
      });
    }).catch((error) => {
      this.assignmentData = {
        Name: this.name,
        CustomInstructions: { Html: '' },
        Error: `Unable to load API versions: ${error.message}`
      };
      this.loaded = true;
      this.requestUpdate();
    });
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
    const roleName = enrollment.Role?.Name || enrollment.data?.Access?.ClasslistRoleName;
    if (this.studentRoles.includes(roleName)) {
      this.student = true;
    } else {
      this.student = false;
    }
  }

  findAssignment(assignments: any): void {
    let assignmentFound = false;
    const assignmentList = Array.isArray(assignments) ? assignments : assignments.data || [];
    for (let i in assignmentList) {
      if (assignmentList[i].Name === this.name) {
        assignmentFound = true;
        this.assignmentData = assignmentList[i];
      }
    }

    if (assignmentFound) {  // If we find the assignment, then we check for specific attributes to use in the component.
      if (this.assignmentData.DueDate) {
        this.dueDate = transformDate(this.assignmentData.DueDate);
      } else {
        this.dueDate = null;
      }

      if (this.assignmentData.Availability) {
        if(this.assignmentData.Availability.StartDate) {
          this.startDate = transformDate(this.assignmentData.Availability.StartDate);
        } else {
          this.startDate = null;
        }
  
        if(this.assignmentData.Availability.EndDate) {
          this.endDate = transformDate(this.assignmentData.Availability.EndDate);
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

  render() {
    // Display error state
    if (this.assignmentData.Error) {
      return html`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="obj-grid">
          <div class="obj-grid__12-12">
            <h1 class="cmp-heading-1 util-margin-vert-md">${this.assignmentData.Name}</h1>
            <div class="util-pad-all-md util-background-light-gray" style="border-left: 4px solid #ba0c2f;">
              <p><strong>Unable to load API versions: ${this.assignmentData.Error}</strong></p>
              <p><em>Note: Requires D2L API access to load assignment data</em></p>
            </div>
          </div>
        </div>
      `;
    }

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
            ${ this.student ? html`<a class="cmp-button cmp-button--full-width" href="https://${this.domain}/d2l/lms/dropbox/user/folder_submit_files.d2l?db=${this.assignmentData.Id}&ou=${this.ou}" target="_blank">Click to visit this assignment</a>` : html`<a class="cmp-button cmp-button--full-width" href="https://${this.domain}/d2l/lms/dropbox/admin/mark/folder_submissions_users.d2l?db=${this.assignmentData.Id}&ou=${this.ou}" target="_blank">Click to visit this assignment</a>`}
          </div>
        </div>
        ${this.loaded ? html`` : html`<div style="min-height: ${this.initialHeight}px"></div>`}
    `;
  }
}