import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getVersions, logApiVersionWarning } from '../lib/api/d2l-client.js';
import { getCourse } from '../lib/api/d2l-utils.js';
import { getCourseAnalytics } from '../lib/api/analytics-utils.js';
import type { ApiVersions, CourseAnalytics } from '../types/d2l.js';

@customElement('uga-course-analytics')
class UgaCourseAnalytics extends LitElement {
  // Light DOM: render into the page directly (eLC-friendly)
  createRenderRoot() {
    return this;
  }

  @property({ type: Object }) versions: ApiVersions = {};
  @property({ type: Boolean, attribute: 'show-content-stats' }) showContentStats = true;
  @property({ type: Boolean, attribute: 'show-assignments' }) showAssignments = true;
  @property({ type: Boolean, attribute: 'show-discussions' }) showDiscussions = true;
  @property({ type: String, attribute: 'group-by' }) groupBy: 'module' | 'topic' | 'all' = 'module';
  @property({ type: Boolean, attribute: 'compare-modules' }) compareModules = true;

  @state() private loading = true;
  @state() private errorMessage: string | null = null;
  @state() private analytics: CourseAnalytics | null = null;

  private ou: string | null = null;
  private abortController: AbortController | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    this.abortController = new AbortController();
    this.init();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.abortController?.abort();
    this.abortController = null;
  }

  async init(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    try {
      this.ou = getCourse();
      if (!this.ou) {
        this.errorMessage = 'Unable to determine course ID from URL. Make sure you are viewing this in an eLC course page.';
        this.loading = false;
        this.requestUpdate();
        return;
      }

      const versions = await getVersions();
      this.versions = versions;

      if (this.versions.le) {
        logApiVersionWarning(this.versions.le, 'getCourseAnalytics');
      }

      this.analytics = await getCourseAnalytics(
          this.ou,
          this.versions.le,
          this.versions.lp,
          {
            includeContent: this.showContentStats,
            includeAssignments: this.showAssignments,
            includeDiscussions: this.showDiscussions,
          }
        );
    } catch (error: any) {
      if (error.message === 'Request aborted' || this.abortController?.signal.aborted) {
        return;
      }
      console.error('Failed to load course analytics:', error);
      this.errorMessage = error.message || 'Failed to load course analytics';
    } finally {
      if (!this.abortController?.signal.aborted) {
        this.loading = false;
        this.requestUpdate();
      }
    }
  }

  render() {
    if (this.loading) {
      return html`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="obj-grid">
          <div class="obj-grid__full util-pad-all-md">
            <p>Loading course analytics...</p>
          </div>
        </div>
      `;
    }

    if (this.errorMessage) {
      return html`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="obj-grid">
          <div class="obj-grid__full util-background-light-gray util-pad-all-md" style="border-left: 4px solid #ba0c2f;">
            <p><strong>Error:</strong> ${this.errorMessage}</p>
          </div>
        </div>
      `;
    }

    if (!this.analytics) {
      return html`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="obj-grid">
          <div class="obj-grid__full util-pad-all-md">
            <p>No analytics data available.</p>
          </div>
        </div>
      `;
    }

    return html`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <style>
        .course-analytics {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .analytics-header {
          background-color: #f5f5f5;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }
        .analytics-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .summary-card {
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1rem;
        }
        .summary-card h3 {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          color: #666;
          font-weight: normal;
        }
        .summary-card .value {
          font-size: 2rem;
          font-weight: bold;
          color: #ba0c2f;
        }
        .analytics-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }
        .analytics-table th,
        .analytics-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }
        .analytics-table th {
          background-color: #f5f5f5;
          color: #000;
          font-weight: bold;
          position: sticky;
          top: 0;
        }
        .analytics-table tr:hover {
          background-color: #f9f9f9;
        }
        .module-name {
          font-weight: bold;
        }
        .stat-value {
          color: #333;
        }
        .stat-percentage {
          color: #666;
          font-size: 0.875rem;
        }
        .comparison-indicator {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 0.5rem;
        }
        .comparison-high {
          background-color: #4caf50;
        }
        .comparison-medium,
        .comparison-low {
          background-color: #ff9800;
        }
      </style>
      <div class="course-analytics">
        <div class="analytics-header">
          <h2 class="cmp-heading-4">Course Analytics</h2>
          <p>Module consumption and engagement statistics</p>
        </div>

        ${this.renderOverallStats()}
        ${this.renderModuleComparison()}
      </div>
    `;
  }

  private renderOverallStats() {
    if (!this.analytics?.overall) return html``;

    const overall = this.analytics.overall;

    return html`
      <div class="analytics-summary">
        <div class="summary-card">
          <h3>Total Modules</h3>
          <div class="value">${overall.totalModules}</div>
        </div>
        <div class="summary-card">
          <h3>Total Students</h3>
          <div class="value">${overall.totalStudents}</div>
        </div>
        ${overall.contentStats ? html`
          <div class="summary-card">
            <h3>Content Completion Rate</h3>
            <div class="value">${overall.contentStats.overallCompletionRate.toFixed(1)}%</div>
            <div class="stat-percentage">${overall.contentStats.totalCompletions} of ${overall.contentStats.totalRequired ?? overall.contentStats.totalTopics * overall.totalStudents} possible</div>
          </div>
        ` : ''}
        ${overall.assignmentStats ? html`
          <div class="summary-card">
            <h3>Assignment Submission Rate</h3>
            <div class="value">${overall.assignmentStats.overallSubmissionRate.toFixed(1)}%</div>
            <div class="stat-percentage">${overall.assignmentStats.totalSubmissions} submissions</div>
          </div>
        ` : ''}
        ${overall.discussionStats ? html`
          <div class="summary-card">
            <h3>Discussion Posts</h3>
            <div class="value">${overall.discussionStats.totalPosts}</div>
            <div class="stat-percentage">${overall.discussionStats.participatingStudents} students participating</div>
          </div>
        ` : ''}
        ${overall.objectivesStats && overall.objectivesStats.totalObjectives > 0 ? html`
          <div class="summary-card">
            <h3>Objectives Completion</h3>
            <div class="value">${overall.objectivesStats.completedObjectives > 0 ? `${overall.objectivesStats.completedObjectives}/${overall.objectivesStats.totalObjectives}` : overall.objectivesStats.totalObjectives}</div>
            <div class="stat-percentage">${overall.objectivesStats.completedObjectives > 0 ? `Completed: ${overall.objectivesStats.completedObjectives}/${overall.objectivesStats.totalObjectives}` : `${overall.objectivesStats.totalObjectives} objectives (completion not available via API)`}</div>
          </div>
        ` : ''}
        ${overall.loginStats ? html`
          <div class="summary-card">
            <h3>Login History (Last 30 days)</h3>
            <div class="value">${overall.loginStats.totalLogins}</div>
            <div class="stat-percentage">Logins (students only)</div>
          </div>
        ` : ''}
        ${overall.gradesStats ? html`
          <div class="summary-card">
            <h3>Grades Performance</h3>
            <div class="value">${overall.gradesStats.averageGrade.toFixed(0)}%</div>
            <div class="stat-percentage">${overall.gradesStats.gradedCount} students with grades</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderModuleComparison() {
    const rawModules = this.analytics?.modules;
    if (!rawModules || !this.compareModules) return html``;

    const modules = Array.isArray(rawModules) ? rawModules : [];

    // Calculate averages for comparison indicators
    const contentRates = modules.map(m => m.contentStats?.completionRate || 0).filter(r => r > 0);
    const assignmentRates = modules.map(m => m.assignmentStats?.submissionRate || 0).filter(r => r > 0);
    const avgContentRate = contentRates.length > 0 ? contentRates.reduce((a, b) => a + b, 0) / contentRates.length : 0;
    const avgAssignmentRate = assignmentRates.length > 0 ? assignmentRates.reduce((a, b) => a + b, 0) / assignmentRates.length : 0;

    const getComparisonClass = (value: number, average: number): string => {
      if (average === 0) return 'comparison-medium';
      const ratio = value / average;
      if (ratio >= 1.1) return 'comparison-high';
      if (ratio >= 0.7) return 'comparison-medium';
      return 'comparison-low';
    };

    return html`
      <h3 class="cmp-heading-5">Module Comparison</h3>
      <table class="analytics-table">
        <thead>
          <tr>
            <th>Module</th>
            ${this.showContentStats ? html`<th>Content Completion</th>` : ''}
            ${this.showAssignments ? html`<th>Assignment Submissions</th>` : ''}
            ${this.showDiscussions ? html`<th>Discussion Posts</th>` : ''}
          </tr>
        </thead>
        <tbody>
          ${modules.map(module => html`
            <tr>
              <td class="module-name">${module.moduleName}</td>
              ${this.showContentStats ? html`
                <td>
                  ${module.contentStats ? html`
                    <span class="comparison-indicator ${getComparisonClass(module.contentStats.completionRate, avgContentRate)}"></span>
                    <span class="stat-value">${module.contentStats.completionRate.toFixed(1)}%</span>
                    <span class="stat-percentage">(${module.contentStats.completedTopics}/${module.contentStats.totalTopics} topics)</span>
                  ` : html`<span class="stat-percentage">No data</span>`}
                </td>
              ` : ''}
              ${this.showAssignments ? html`
                <td>
                  ${module.assignmentStats ? html`
                    <span class="comparison-indicator ${getComparisonClass(module.assignmentStats.submissionRate, avgAssignmentRate)}"></span>
                    <span class="stat-value">${module.assignmentStats.submissionRate.toFixed(1)}%</span>
                    <span class="stat-percentage">(${module.assignmentStats.submittedAssignments}/${module.assignmentStats.totalAssignments} assignments)</span>
                    ${module.assignmentStats.averageScore > 0 ? html`
                      <br><span class="stat-percentage">Avg score: ${module.assignmentStats.averageScore.toFixed(1)}%</span>
                    ` : ''}
                  ` : html`<span class="stat-percentage">No data</span>`}
                </td>
              ` : ''}
              ${this.showDiscussions ? html`
                <td>
                  ${module.discussionStats ? html`
                    <span class="stat-value">${module.discussionStats.totalPosts}</span>
                    <span class="stat-percentage">posts</span>
                    <br><span class="stat-percentage">${module.discussionStats.participatingStudents} students</span>
                  ` : html`<span class="stat-percentage">No data</span>`}
                </td>
              ` : ''}
            </tr>
          `)}
        </tbody>
      </table>
    `;
  }
}
