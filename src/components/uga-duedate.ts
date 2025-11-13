import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getVersions, getAssignments } from '../lib/api/d2l-client.js';
import { getCourse, transformDate } from '../lib/api/d2l-utils.js';
import type { ApiVersions } from '../types/d2l.js';

export const UGAComponentsLoaded = true;

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
    this.ou = getCourse();
    
    getVersions().then((versions) => {
      this.addVersions(versions);

      if (!this.ou) return;

      getAssignments(this.ou, this.versions.le).then((assignments) => {
        this.findAssignment(assignments);
        console.log(this.dueDate);
        this.loaded = true;
        this.requestUpdate();
      });
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

  findAssignment(assignments: any): void {
    let assignmentFound = false;
    const assignmentList = Array.isArray(assignments) ? assignments : assignments.data || [];
    for (let i in assignmentList) {
      if (assignmentList[i].Name === this.name) {
        assignmentFound = true;
        this.assignmentData = assignmentList[i];
        console.log(this.assignmentData);
      }
    }

    if (assignmentFound) {  // If we find the assignment, then we check for specific attributes to use in the component.
      if (this.assignmentData.DueDate) {
        this.dueDate = transformDate(this.assignmentData.DueDate);
      } else {
        this.dueDate = "N/A";
      }
    }

    if (!assignmentFound) {
      this.dueDate = "Assignment Not Found";
    }

  }

  render() {
    return this.loaded ? html`<span>${this.dueDate}</span>` : html``;
  }
}