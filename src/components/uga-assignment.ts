import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { getVersions, getEnrollment, getAssignments } from '../lib/api/d2l-client.js';
import { getCourse, transformDate } from '../lib/api/d2l-utils.js';
import type { ApiVersions } from '../types/d2l.js';

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
  @property({ type: Array }) assignments: AssignmentData[] = [];
  @property({ type: Array }) studentRoles = ['Student', 'Demo Student'];
  @property({ type: String }) errorMessage: string | null = null;

  private student: boolean | null = null;
  private loaded = false;

  connectedCallback(): void {
    super.connectedCallback();
    
    this.ou = getCourse();
    
    if (!this.ou) {
      this.errorMessage = 'Unable to determine course ID from URL. Make sure you are viewing this in a D2L course page.';
      this.loaded = true;
      this.requestUpdate();
      return;
    }
    
    this.domain = window.location.hostname;
    
    getVersions().then((versions) => {
      this.addVersions(versions);

      // Try to get enrollment to determine student/instructor role, but don't fail if unavailable
      getEnrollment(this.ou!, this.versions.lp)
        .then((enrollment) => {
          this.checkStudent(enrollment);
        })
        .catch((error) => {
          console.warn('Unable to determine enrollment, defaulting to instructor view:', error.message);
          this.student = false; // Default to instructor view
        })
        .finally(() => {
          // Load assignments regardless of enrollment status
          getAssignments(this.ou!, this.versions.le).then((assignmentsData) => {
            this.assignments = assignmentsData;
            this.loaded = true;
            this.requestUpdate();
          }).catch((error) => {
            this.errorMessage = `Unable to load assignments: ${error.message}`;
            this.loaded = true;
            this.requestUpdate();
          });
        });
    }).catch((error) => {
      this.errorMessage = `Unable to load API versions: ${error.message}`;
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
    const roleName = enrollment.Role?.Name;
    if (this.studentRoles.includes(roleName)) {
      this.student = true;
    } else {
      this.student = false;
    }
  }

  formatAssignmentType(dropboxType?: number): string | null {
    if (dropboxType === 1) return "Group";
    if (dropboxType === 2) return "Individual";
    return null;
  }

  formatRubrics(assignment: AssignmentData): string | null {
    if (!assignment.Assessment || assignment.Assessment.Rubrics.length === 0) {
      return null;
    }

    const rubricLabel = assignment.Assessment.Rubrics.length > 1 ? "Rubrics" : "Rubric";
    const rubricNames = assignment.Assessment.Rubrics.map(r => r.Name).join("<br />");
    return `<span class="util-font-size-sm">${rubricLabel}</span><br />${rubricNames}`;
  }

  getAssignmentLink(assignmentId?: number): string {
    if (!assignmentId || !this.domain || !this.ou) return '#';
    
    if (this.student) {
      return `https://${this.domain}/d2l/lms/dropbox/user/folder_submit_files.d2l?db=${assignmentId}&ou=${this.ou}`;
    } else {
      return `https://${this.domain}/d2l/lms/dropbox/admin/mark/folder_submissions_users.d2l?db=${assignmentId}&ou=${this.ou}`;
    }
  }

  render() {
    // Display error state
    if (this.errorMessage) {
      return html`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="obj-grid">
          <div class="obj-grid__12-12">
            <div class="util-pad-all-md util-background-light-gray" style="border-left: 4px solid #ba0c2f;">
              <p><strong>${this.errorMessage}</strong></p>
              <p><em>Note: Requires D2L API access to load assignment data</em></p>
            </div>
          </div>
        </div>
      `;
    }

    // Display loading state
    if (!this.loaded) {
      return html`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="obj-grid">
          <div class="obj-grid__12-12">
            <p>Loading assignments...</p>
          </div>
        </div>
      `;
    }

    // Display no assignments found
    if (this.assignments.length === 0) {
      return html`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="obj-grid">
          <div class="obj-grid__12-12">
            <p>No assignments found in this course.</p>
          </div>
        </div>
      `;
    }

    return html`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <div class="obj-grid">
        ${this.assignments.map(assignment => {
          const dueDate = assignment.DueDate ? transformDate(assignment.DueDate) : null;
          const startDate = assignment.Availability?.StartDate ? transformDate(assignment.Availability.StartDate) : null;
          const endDate = assignment.Availability?.EndDate ? transformDate(assignment.Availability.EndDate) : null;
          const assignmentType = this.formatAssignmentType(assignment.DropboxType);
          const rubricString = this.formatRubrics(assignment);

          return html`
            <div class="obj-grid__12-12" style="margin-bottom: 3rem;">
              <h2 class="cmp-heading-2 util-margin-vert-md">${assignment.Name}</h2>
              ${assignment.CustomInstructions?.Html ? unsafeHTML(assignment.CustomInstructions.Html) : html``}
              
              <div class="obj-flex util-margin-top-md">
                ${assignmentType ? html`<div class=${this.flexClasses}><span class="util-font-size-sm">Assignment Type</span><br />${assignmentType}</div>` : html``}
                ${dueDate ? html`<div class=${this.flexClasses}><span class="util-font-size-sm">Due Date</span><br/>${dueDate}</div>` : html``}
                ${rubricString ? html`<div class=${this.flexClasses}>${unsafeHTML(rubricString)}</div>` : html``}
                ${startDate ? html`<div class=${this.flexClasses}><span class="util-font-size-sm">Start Date</span><br />${startDate}</div>` : html``}
                ${endDate ? html`<div class=${this.flexClasses}><span class="util-font-size-sm">End Date</span><br />${endDate}</div>` : html``}
              </div>
              
              <a class="cmp-button cmp-button--full-width util-margin-top-md" 
                 href="${this.getAssignmentLink(assignment.Id)}" 
                 target="_blank">
                Click to visit this assignment
              </a>
            </div>
          `;
        })}
      </div>
    `;
  }
}