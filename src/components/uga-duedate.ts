import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getVersions, getEnrollment, getAssignments, getMyItemsDue, getForums, getTopics, logApiVersionWarning } from '../lib/api/d2l-client.js';
import { getCourse, transformDate } from '../lib/api/d2l-utils.js';
import { getItemType, getTypesArray, shouldIncludeItem, formatItemType, DEFAULT_TYPES_STRING } from '../lib/data/item-type-utils.js';
import type { ApiVersions, MyItemsDue, Enrollment, DiscussionTopicWithForum } from '../types/d2l.js';

interface AssignmentData {
  Name: string;
  Id?: number;
  DueDate?: string;
  TopicId?: number;
  ForumId?: number;
  ItemType?: string | number;
}

@customElement('uga-duedate')
class UgaDueDate extends LitElement {
  @property({ type: Object }) versions: ApiVersions = {};
  @property({ type: String }) domain: string | null = null;
  @property({ type: String }) ou: string | null = null;
  @property({ type: Array }) assignments: AssignmentData[] = [];
  @property({ type: Array }) studentRoles = ['Student', 'Demo Student'];
  @property({ type: String }) errorMessage: string | null = null;
  @property({ type: String }) types = DEFAULT_TYPES_STRING; // Comma-separated list of types to include

  // Light DOM: render into the page directly (eLC-friendly)
  createRenderRoot() {
    return this;
  }

  private student: boolean | null = null;
  private loaded = false;
  private abortController: AbortController | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    this.abortController = new AbortController();
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
      
      // Check API versions for deprecation warnings
      if (this.versions.le) {
        logApiVersionWarning(this.versions.le, 'getMyItemsDue');
        logApiVersionWarning(this.versions.le, 'getAssignments');
        logApiVersionWarning(this.versions.le, 'getForums');
      }
      if (this.versions.lp) {
        logApiVersionWarning(this.versions.lp, 'getEnrollment');
      }

      // Try to get enrollment to determine student/instructor role, but don't fail if unavailable
      getEnrollment(this.ou!, this.versions.lp, {
        fallbackToFirst: true,
        throwOnNotFound: false
      })
        .then((enrollment) => {
          if (enrollment) {
            this.checkStudent(enrollment);
          } else {
            console.warn('Unable to determine enrollment, defaulting to instructor view');
            this.student = false; // Default to instructor view
          }
        })
        .catch((error) => {
          console.warn('Unable to determine enrollment, defaulting to instructor view:', error.message);
          this.student = false; // Default to instructor view
        })
        .finally(() => {

          // Try the myItems/due endpoint first, fallback to assignments if it fails
          getMyItemsDue(this.ou!, this.versions.le).then((itemsData) => {
            // Map and filter items with due dates
            const mappedItems = itemsData
              .filter((item: MyItemsDue) => item.DueDate || item.EndDate)
              .map((item: MyItemsDue) => ({
                Name: item.Name || item.Title || item.ItemName || 'Untitled',
                Id: item.Id || item.AssignmentId || item.ItemId,
                DueDate: transformDate(item.DueDate || item.EndDate!),
                TopicId: item.TopicId,
                ForumId: item.ForumId,
                ItemType: item.ItemType || item.ContentType
              }));
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
              // Map assignments with due dates
              const assignmentItems = assignmentsData
                .filter(a => a.DueDate)
                .map(a => ({
                  Name: a.Name,
                  Id: a.Id,
                  DueDate: transformDate(a.DueDate!),
                  ItemType: 'assignment'
                }));
              
              // Map discussion topics with due dates
              const discussionItems = topicsData
                .filter((topic: DiscussionTopicWithForum) => topic.DueDate || topic.EndDate || topic.Availability?.EndDate)
                .map((topic: DiscussionTopicWithForum) => ({
                  Name: topic.Name,
                  DueDate: transformDate(topic.DueDate || topic.EndDate || topic.Availability?.EndDate!),
                  TopicId: topic.TopicId,
                  ForumId: topic.ForumId,
                  ItemType: 'discussion'
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
      // Don't show error if request was aborted (component unmounted)
      if (error.message === 'Request aborted' || this.abortController?.signal.aborted) {
        return;
      }
      this.errorMessage = `Unable to load API versions: ${error.message}`;
      this.loaded = true;
      this.requestUpdate();
    });
  }
  
  disconnectedCallback(): void {
    super.disconnectedCallback();
    // Cancel all in-flight requests
    this.abortController?.abort();
    this.abortController = null;
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
    this.student = this.studentRoles.includes(enrollment.Role.Name);
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
              <th style="padding: 0.75rem; text-align: left; font-weight: bold; color: #000000;">Type</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: bold; color: #000000;">Due Date</th>
            </tr>
          </thead>
          <tbody>
            ${this.assignments.map((assignment) => {
              const assignmentLink = this.getAssignmentLink(assignment);
              return html`
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 0.75rem;">
                  <a href="${assignmentLink}" target="_blank" style="color: #ba0c2f; text-decoration: none;">
                    ${assignment.Name}
                  </a>
                </td>
                <td style="padding: 0.75rem;">${formatItemType(assignment)}</td>
                <td style="padding: 0.75rem;">${assignment.DueDate || 'No Due Date'}</td>
              </tr>
            `;
            })}
          </tbody>
        </table>
      </div>
    `;
  }
}