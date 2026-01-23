import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getVersions, getEnrollment, getAssignments, getMyItemsDue, getForums, getTopics, getGradebook, getGradeValues } from '../lib/api/d2l-client.js';
import { getCourse, transformDate } from '../lib/api/d2l-utils.js';
import { getItemType, getTypesArray, shouldIncludeItem, DEFAULT_TYPES_STRING } from '../lib/data/item-type-utils.js';
import { exportGradesToGradebook, type GradeExport } from '../lib/api/gradebook-utils.js';
import type { ApiVersions, MyItemsDue, Enrollment, DiscussionTopicWithForum } from '../types/d2l.js';

interface AssignmentData {
  Name: string;
  Id?: number;
  TopicId?: number;
  ForumId?: number;
  ItemType?: string | number;
  Instructions?: {
    Html: string;
  };
  CustomInstructions?: {
    Html: string;
  };
  DueDate?: string | null;
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

  // Light DOM: render into the page directly (eLC-friendly)
  createRenderRoot() {
    return this;
  }
  @property({ type: String }) ou: string | null = null;
  @property({ type: Array }) assignments: AssignmentData[] = [];
  @property({ type: Array }) studentRoles = ['Student', 'Demo Student'];
  @property({ type: String }) errorMessage: string | null = null;
  @property({ type: String }) types = DEFAULT_TYPES_STRING; // Comma-separated list of types to include
  @property({ type: Boolean }) enableExport = false; // Enable grade export features for instructors
  @state() private exportInProgress = false;
  @state() private exportResults: { success: number; failed: number; errors: string[] } | null = null;

  private student: boolean | null = null;
  private loaded = false;

  connectedCallback(): void {
    super.connectedCallback();
    
    // Check if enable-export attribute is present
    if (this.hasAttribute('enable-export')) {
      this.enableExport = true;
    }
    
    this.ou = getCourse();
    
    if (!this.ou) {
      this.errorMessage = 'Unable to determine course ID from URL. Make sure you are viewing this in an eLC course page.';
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
          // Try the myItems/due endpoint first, fallback to assignments if it fails
          getMyItemsDue(this.ou!, this.versions.le).then((itemsData) => {
            // Map the myItems/due response to our assignment format
            const mappedItems = itemsData.map((item: MyItemsDue) => {
              const assignment = {
                Name: item.Name || item.Title || item.ItemName || 'Untitled',
                Id: item.Id || item.ItemId || item.AssignmentId,
                TopicId: item.TopicId,
                ForumId: item.ForumId,
                ItemType: item.ItemType || item.ContentType,
                Instructions: item.Instructions || item.Description,
                CustomInstructions: item.Instructions || item.Description,
                DueDate: item.DueDate || item.EndDate || null,
                Availability: item.Availability || {
                  StartDate: item.StartDate,
                  EndDate: item.EndDate
                },
                DropboxType: item.DropboxType || item.Type || 2,
                Assessment: item.Assessment
              };
              return assignment;
            });
            // Filter by types
            const allowedTypes = getTypesArray(this.types);
            this.assignments = mappedItems.filter(item => shouldIncludeItem(item, allowedTypes));
            this.loaded = true;
            this.requestUpdate();
          }).catch((error) => {
            // Fallback: fetch both assignments and discussions
            console.warn('myItems/due endpoint unavailable, falling back to assignments and discussions:', error.message);
            Promise.all([
              getAssignments(this.ou!, this.versions.le).catch(() => []),
              getForums(this.ou!, this.versions.le)
                .then(forums => {
                  // Get all topics for all forums
                  return Promise.all(
                    forums.map(forum => 
                      getTopics(this.ou!, this.versions.le, forum.ForumId)
                        .then(topics => topics.map(topic => ({ ...topic, ForumId: forum.ForumId } as DiscussionTopicWithForum)))
                        .catch(() => [] as DiscussionTopicWithForum[])
                    )
                  ).then(allTopics => allTopics.flat());
                })
                .catch(() => [])
            ]).then(([assignmentsData, topicsData]) => {
              // Map assignments
              const assignmentItems = assignmentsData.map(a => ({
                Name: a.Name,
                Id: a.Id,
                Instructions: a.Instructions,
                CustomInstructions: a.Instructions,
                DueDate: a.DueDate || null,
                Availability: {
                  StartDate: a.StartDate,
                  EndDate: a.EndDate
                },
                DropboxType: 2,
                Assessment: undefined
              }));
              
              // Map discussion topics with due dates
              const discussionItems = topicsData
                .filter((topic: DiscussionTopicWithForum) => topic.DueDate || topic.EndDate || topic.Availability?.EndDate)
                .map((topic: DiscussionTopicWithForum) => ({
                  Name: topic.Name,
                  Id: topic.TopicId,
                  TopicId: topic.TopicId,
                  ForumId: topic.ForumId,
                  ItemType: 'discussion',
                  Instructions: topic.Description,
                  CustomInstructions: topic.Description,
                  DueDate: topic.DueDate || topic.EndDate || topic.Availability?.EndDate || null,
                  Availability: topic.Availability || {
                    StartDate: topic.StartDate,
                    EndDate: topic.EndDate
                  },
                  DropboxType: undefined,
                  Assessment: undefined
                }));
              
              // Combine assignments and discussions
              const allItems = [...assignmentItems, ...discussionItems];
              // Filter by types
              const allowedTypes = getTypesArray(this.types);
              this.assignments = allItems.filter(item => shouldIncludeItem(item, allowedTypes));
              this.loaded = true;
              this.requestUpdate();
            }).catch((fallbackError) => {
              this.errorMessage = `Unable to load assignments and discussions: ${fallbackError.message}`;
              this.loaded = true;
              this.requestUpdate();
            });
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

  checkStudent(enrollment: Enrollment): void {
    const roleName = enrollment.Role?.Name;
    if (this.studentRoles.includes(roleName)) {
      this.student = true;
      console.log('🔵 User identified as student, role:', roleName);
    } else {
      this.student = false;
      console.log('🟢 User identified as instructor, role:', roleName);
    }
    // Force update to show/hide Actions column
    this.requestUpdate();
  }

  formatAssignmentType(assignment: AssignmentData): string {
    const itemType = getItemType(assignment);
    if (itemType === "discussion") return "Discussion";
    if (itemType === "quiz") return "Quiz";
    if (itemType === "content") return "Content";
    // Handle assignment types
    if (assignment.DropboxType === 1) return "Group";
    if (assignment.DropboxType === 2) return "Individual";
    return "Assignment";
  }

  getAssignmentLink(assignment: AssignmentData): string {
    // Handle discussion links
    if (getItemType(assignment) === 'discussion') {
      const topicId = assignment.TopicId || assignment.Id;
      if (!topicId || !this.domain || !this.ou) return '#';
      // D2L discussion topic URL format
      return `https://${this.domain}/d2l/lms/discussions/topic/${topicId}/view?ou=${this.ou}`;
    }
    
    // Handle assignment links
    const assignmentId = assignment.Id;
    if (!assignmentId || !this.domain || !this.ou) return '#';
    
    if (this.student) {
      return `https://${this.domain}/d2l/lms/dropbox/user/folder_submit_files.d2l?db=${assignmentId}&ou=${this.ou}`;
    } else {
      return `https://${this.domain}/d2l/lms/dropbox/admin/mark/folder_submissions_users.d2l?db=${assignmentId}&ou=${this.ou}`;
    }
  }

  /**
   * Export existing grades from gradebook for an assignment
   */
  async exportGrades(assignment: AssignmentData): Promise<void> {
    if (!assignment.Id || !this.ou || !this.versions.le) {
      console.error('❌ Missing required data:', { assignmentId: assignment.Id, ou: this.ou, leVersion: this.versions.le });
      return;
    }

    this.exportInProgress = true;
    this.exportResults = null;
    this.errorMessage = null;
    this.requestUpdate();

    try {
      // Get gradebook to find the grade object for this assignment
      const gradebook = await getGradebook(this.ou, this.versions.le);
      const gradeObject = gradebook.find(g => g.Name === assignment.Name);

      if (!gradeObject) {
        this.exportResults = {
          success: 0,
          failed: 0,
          errors: [`Grade object "${assignment.Name}" not found in gradebook. Please create it first.`]
        };
        this.exportInProgress = false;
        this.requestUpdate();
        return;
      }

      // Get existing grades from gradebook
      const existingGrades = await getGradeValues(this.ou, this.versions.le, gradeObject.GradeObjectId);

      if (existingGrades.length === 0) {
        this.exportResults = {
          success: 0,
          failed: 0,
          errors: [`No grades found for "${assignment.Name}" in gradebook.`]
        };
        this.exportInProgress = false;
        this.requestUpdate();
        return;
      }

      // Convert to GradeExport format (grades are already in gradebook, so this is just for display/verification)
      const grades: GradeExport[] = existingGrades.map(grade => ({
        userId: grade.UserId,
        pointsEarned: grade.PointsNumerator || 0,
        pointsPossible: grade.PointsDenominator || gradeObject.MaxPoints || 100,
        percentage: grade.PointsDenominator ? (grade.PointsNumerator / grade.PointsDenominator) * 100 : 0,
        comments: grade.Comments?.Text || ''
      }));

      // Export grades (this will update them, but since they're already there, it's essentially a sync operation)
      const results = await exportGradesToGradebook(
        this.ou,
        this.versions.le,
        gradeObject.GradeObjectId,
        grades
      );

      this.exportResults = results;
    } catch (error: any) {
      console.error('❌ Error exporting grades:', error);
      const errorMsg = error.message || 'Unknown error occurred during export';
      this.errorMessage = `Export failed: ${errorMsg}`;
      this.exportResults = {
        success: 0,
        failed: 1,
        errors: [errorMsg]
      };
    } finally {
      this.exportInProgress = false;
      this.requestUpdate();
    }
  }


  /**
   * Export all assignments with grades and due dates to CSV
   */
  async exportAllAssignments(): Promise<void> {
    if (!this.ou || !this.versions.le) {
      console.error('❌ Missing required data for export');
      return;
    }

    try {
      // Collect all assignment data with grades
      const exportData: Array<{
        assignmentName: string;
        dueDate: string;
        type: string;
        gradeObjectId?: number;
        gradeObjectName?: string;
        maxPoints?: number;
        studentCount?: number;
      }> = [];

      // Get gradebook to match assignments with grade objects
      const gradebook = await getGradebook(this.ou, this.versions.le);

      for (const assignment of this.assignments) {
        const isAssignment = getItemType(assignment) === 'assignment';
        if (!isAssignment) continue;

        const dueDate = assignment.DueDate ? transformDate(assignment.DueDate) : 'No Due Date';
        const assignmentType = this.formatAssignmentType(assignment);

        // Try to find matching grade object
        const gradeObject = gradebook.find(g => g.Name === assignment.Name);
        
        // Get student count from gradebook if grade object exists
        let studentCount = 0;
        if (gradeObject) {
          try {
            const gradeValues = await getGradeValues(this.ou, this.versions.le, gradeObject.GradeObjectId);
            studentCount = gradeValues.length;
          } catch (error) {
            // Ignore errors getting grade values
          }
        }

        exportData.push({
          assignmentName: assignment.Name,
          dueDate,
          type: assignmentType,
          gradeObjectId: gradeObject?.GradeObjectId,
          gradeObjectName: gradeObject?.Name,
          maxPoints: gradeObject?.MaxPoints,
          studentCount
        });
      }

      // Generate CSV
      const csvHeaders = ['Assignment Name', 'Due Date', 'Type', 'Grade Object ID', 'Grade Object Name', 'Max Points', 'Students Graded'];
      const csvRows = exportData.map(row => [
        `"${row.assignmentName}"`,
        `"${row.dueDate}"`,
        `"${row.type}"`,
        row.gradeObjectId?.toString() || '',
        `"${row.gradeObjectName || ''}"`,
        row.maxPoints?.toString() || '',
        row.studentCount?.toString() || '0'
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `assignments-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ Exported assignments to CSV');
    } catch (error: any) {
      console.error('❌ Error exporting assignments:', error);
      this.errorMessage = `Export failed: ${error.message}`;
      this.requestUpdate();
    }
  }


  render() {
    // Don't show error state if we have assignments loaded - show error inline instead

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
      <div class="util-margin-top-md">
        ${this.errorMessage ? html`
          <div class="util-pad-all-md util-margin-bottom-md util-background-light-gray" style="border-left: 4px solid #ba0c2f;">
            <p><strong>${this.errorMessage}</strong></p>
          </div>
        ` : ''}
        ${this.exportResults ? html`
          <div class="util-pad-all-md util-margin-bottom-md" style="background-color: ${this.exportResults.failed === 0 ? '#d4edda' : '#f8d7da'}; border-left: 4px solid ${this.exportResults.failed === 0 ? '#28a745' : '#dc3545'};">
            <p><strong>Export Results:</strong> ${this.exportResults.success} successful, ${this.exportResults.failed} failed</p>
            ${this.exportResults.errors.length > 0 ? html`
              <ul style="margin-top: 0.5rem;">
                ${this.exportResults.errors.map(error => html`<li>${error}</li>`)}
              </ul>
            ` : ''}
          </div>
        ` : ''}
        
        ${(this.student === false || this.student === null) && this.enableExport ? html`
          <div style="margin-bottom: 1rem; text-align: right;">
            <button 
              class="cmp-button cmp-button--primary"
              @click=${() => this.exportAllAssignments()}
              style="margin-left: 0.5rem;"
            >
              Export All Assignments (CSV)
            </button>
          </div>
        ` : ''}
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5; border-bottom: 2px solid #ba0c2f;">
              <th style="padding: 0.75rem; text-align: left; font-weight: bold; color: #000000;">Assignment</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: bold; color: #000000;">Type</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: bold; color: #000000;">Due Date</th>
              ${(this.student === false || this.student === null) && this.enableExport ? html`
                <th style="padding: 0.75rem; text-align: left; font-weight: bold; color: #000000;">Actions</th>
              ` : ''}
            </tr>
          </thead>
          <tbody>
            ${this.assignments.map((assignment) => {
              const dueDate = assignment.DueDate ? transformDate(assignment.DueDate) : 'No Due Date';
              const assignmentType = this.formatAssignmentType(assignment);
              const assignmentLink = this.getAssignmentLink(assignment);
              const isAssignment = getItemType(assignment) === 'assignment';

              return html`
                <tr style="border-bottom: 1px solid #e0e0e0;">
                  <td style="padding: 0.75rem;">
                    <a href="${assignmentLink}" target="_blank" style="color: #ba0c2f; text-decoration: none;">
                      ${assignment.Name}
                    </a>
                  </td>
                  <td style="padding: 0.75rem;">${assignmentType}</td>
                  <td style="padding: 0.75rem;">${dueDate}</td>
                  ${(this.student === false || this.student === null) && this.enableExport && isAssignment ? html`
                    <td style="padding: 0.75rem;">
                      <button 
                        class="cmp-button cmp-button--primary"
                        @click=${() => this.exportGrades(assignment)}
                        ?disabled=${this.exportInProgress}
                      >
                        ${this.exportInProgress ? 'Exporting...' : 'Export Grades'}
                      </button>
                    </td>
                  ` : (this.student === false || this.student === null) && this.enableExport ? html`
                    <td style="padding: 0.75rem;">—</td>
                  ` : ''}
                </tr>
              `;
            })}
          </tbody>
        </table>
      </div>
    `;
  }
}