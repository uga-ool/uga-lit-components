import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getVersions, getAssignments } from '../lib/api/d2l-client.js';
import { getCourse, transformDate } from '../lib/api/d2l-utils.js';
import type { ApiVersions } from '../types/d2l.js';

interface AssignmentData {
  Name: string;
  DueDate?: string;
}

@customElement('uga-duedate')
class UgaDueDate extends LitElement {
  @property({ type: Object }) versions: ApiVersions = {};
  @property({ type: String }) ou: string | null = null;
  @property({ type: Array }) assignments: AssignmentData[] = [];
  @property({ type: String }) errorMessage: string | null = null;

  // Light DOM: render into the page directly (eLC-friendly)
  createRenderRoot() {
    return this;
  }

  private loaded = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.ou = getCourse();
    
    if (!this.ou) {
      this.errorMessage = 'Unable to determine course ID from URL. Make sure you are viewing this in an eLC course page.';
      this.loaded = true;
      this.requestUpdate();
      return;
    }
    
    getVersions().then((versions) => {
      this.addVersions(versions);

      getAssignments(this.ou!, this.versions.le).then((assignmentsData) => {
        // Filter to only assignments with due dates
        this.assignments = assignmentsData
          .filter(a => a.DueDate)
          .map(a => ({
            ...a,
            DueDate: transformDate(a.DueDate)
          }));
        this.loaded = true;
        this.requestUpdate();
      }).catch((error) => {
        this.errorMessage = `Unable to load assignments: ${error.message}`;
        this.loaded = true;
        this.requestUpdate();
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

  render() {
    if (this.errorMessage) {
      return html`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="util-pad-all-md util-background-light-gray" style="border-left: 4px solid #ba0c2f;">
          <p><strong>${this.errorMessage}</strong></p>
        </div>
      `;
    }

    if (!this.loaded) {
      return html`<span>Loading due dates...</span>`;
    }

    if (this.assignments.length === 0) {
      return html`<span>No assignments with due dates found in this course.</span>`;
    }

    return html`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <div class="util-margin-top-md">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5; border-bottom: 2px solid #ba0c2f;">
              <th style="padding: 0.75rem; text-align: left; font-weight: bold; color: #000000;">Assignment</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: bold; color: #000000;">Due Date</th>
            </tr>
          </thead>
          <tbody>
            ${this.assignments.map((assignment) => html`
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 0.75rem;">${assignment.Name}</td>
                <td style="padding: 0.75rem;">${assignment.DueDate || 'N/A'}</td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    `;
  }
}