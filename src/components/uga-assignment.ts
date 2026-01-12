import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { getVersions, getEnrollment, getAssignments, getMyItemsDue, getForums, getTopics } from '../lib/api/d2l-client.js';
import { getCourse, transformDate } from '../lib/api/d2l-utils.js';
import { getItemType, getTypesArray, shouldIncludeItem, DEFAULT_TYPES_STRING } from '../lib/data/item-type-utils.js';
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
  @property({ type: String }) flexClasses = 'obj-flex-item obj-flex-item__xs util-text-center util-background-light-gray util-pad-all-md';
  @property({ type: Array }) assignments: AssignmentData[] = [];
  @property({ type: Array }) studentRoles = ['Student', 'Demo Student'];
  @property({ type: String }) errorMessage: string | null = null;
  @property({ type: String }) types = DEFAULT_TYPES_STRING; // Comma-separated list of types to include

  private student: boolean | null = null;
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
    } else {
      this.student = false;
    }
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

  formatRubrics(assignment: AssignmentData): string | null {
    if (!assignment.Assessment || assignment.Assessment.Rubrics.length === 0) {
      return null;
    }

    const rubricLabel = assignment.Assessment.Rubrics.length > 1 ? "Rubrics" : "Rubric";
    const rubricNames = assignment.Assessment.Rubrics.map(r => r.Name).join("<br />");
    return `<span class="util-font-size-sm">${rubricLabel}</span><br />${rubricNames}`;
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

  render() {
    // Display error state
    if (this.errorMessage) {
      return html`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="obj-grid">
          <div class="obj-grid__12-12">
            <div class="util-pad-all-md util-background-light-gray" style="border-left: 4px solid #ba0c2f;">
              <p><strong>${this.errorMessage}</strong></p>
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
      <div class="util-margin-top-md">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5; border-bottom: 2px solid #ba0c2f;">
              <th style="padding: 0.75rem; text-align: left; font-weight: bold; color: #000000;">Assignment</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: bold; color: #000000;">Type</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: bold; color: #000000;">Due Date</th>
            </tr>
          </thead>
          <tbody>
            ${this.assignments.map((assignment) => {
              const dueDate = assignment.DueDate ? transformDate(assignment.DueDate) : 'No Due Date';
              const assignmentType = this.formatAssignmentType(assignment);
              const assignmentLink = this.getAssignmentLink(assignment);

              return html`
                <tr style="border-bottom: 1px solid #e0e0e0;">
                  <td style="padding: 0.75rem;">
                    <a href="${assignmentLink}" target="_blank" style="color: #ba0c2f; text-decoration: none;">
                      ${assignment.Name}
                    </a>
                  </td>
                  <td style="padding: 0.75rem;">${assignmentType}</td>
                  <td style="padding: 0.75rem;">${dueDate}</td>
                </tr>
              `;
            })}
          </tbody>
        </table>
      </div>
    `;
  }
}