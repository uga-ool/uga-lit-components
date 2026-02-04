import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getVersions, getEnrollment, getAssignments, getMyItemsDue, getForums, getTopics, getGradebook, getGradeValues, getBulkGradeValues, getClasslist, getAssignmentSubmissions } from '../lib/api/d2l-client.js';
import { getCourse, transformDate } from '../lib/api/d2l-utils.js';
import { getItemType, getTypesArray, shouldIncludeItem, DEFAULT_TYPES_STRING } from '../lib/data/item-type-utils.js';
import { memoize } from '../lib/utils/memoize.js';
import { observeLazyLoad } from '../lib/utils/lazy-load.js';
import type { ApiVersions, MyItemsDue, Enrollment, DiscussionTopicWithForum, ClasslistUser, AssignmentSubmission, GradeValue } from '../types/d2l.js';

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
  private abortController: AbortController | null = null;
  private lazyLoadCleanup: (() => void) | null = null;
  
  // Memoized filter function - caches filtered results
  private memoizedFilter = memoize(
    (items: AssignmentData[], allowedTypes: string[]) => {
      return items.filter(item => shouldIncludeItem(item, allowedTypes));
    },
    (items, allowedTypes) => `${items.length}:${allowedTypes.join(',')}`
  );

  connectedCallback(): void {
    super.connectedCallback();
    this.abortController = new AbortController();
    
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
            // Filter by types (using memoization)
            const allowedTypes = getTypesArray(this.types);
            this.assignments = this.memoizedFilter(mappedItems, allowedTypes);
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
              // Filter by types (using memoization)
              const allowedTypes = getTypesArray(this.types);
              this.assignments = this.memoizedFilter(allItems, allowedTypes);
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
    // Clean up lazy loading observer
    this.lazyLoadCleanup?.();
    this.lazyLoadCleanup = null;
  }
  
  /**
   * Enable lazy loading - only load data when component is visible
   * Call this method to enable lazy loading instead of loading immediately
   */
  enableLazyLoad(): void {
    if (this.lazyLoadCleanup) return; // Already enabled
    
    this.lazyLoadCleanup = observeLazyLoad(
      this,
      () => {
        // Component is now visible - trigger data loading
        if (!this.loaded && this.ou) {
          this.connectedCallback();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before visible
        once: true
      }
    );
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
   * Normalize smart quotes and apostrophes to regular ASCII equivalents
   * This helps prevent encoding issues in CSV files
   * @param text - Text to normalize
   * @returns Normalized text with regular quotes and apostrophes
   */
  private normalizeQuotes(text: string): string {
    return text
      // Smart apostrophes and single quotes
      .replace(/[''']/g, "'")  // Left/right single quote → regular apostrophe
      // Smart double quotes
      .replace(/[""]/g, '"')   // Left/right double quote → regular double quote
      // Other Unicode quote variants
      .replace(/[''‚‛]/g, "'")  // Various single quote variants
      .replace(/["„‟]/g, '"');  // Various double quote variants
  }

  private csvEscape(value: unknown): string {
    if (value === null || value === undefined) return '';
    let s = String(value);
    // Normalize smart quotes before escaping
    s = this.normalizeQuotes(s);
    // Quote if needed and escape quotes by doubling them
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  private normalizeRole(role?: string): string {
    return (role || '').toLowerCase().trim();
  }

  private isLikelyStudent(user: ClasslistUser): boolean {
    const role = this.normalizeRole(user.ClasslistRoleDisplayName);
    // Exclude common non-learner roles
    if (role.includes('instructor') || role.includes('teacher') || role.includes('admin') || role.includes('designer') || role.includes('ta')) {
      return false;
    }
    // Include common learner roles
    if (role.includes('student') || role.includes('learner')) {
      return true;
    }
    // Fallback: if we don't recognize the role, keep them (better to include than omit)
    return true;
  }

  /**
   * Export a per-assignment CSV that lists all students and their gradebook value.
   *
   * Note: A submission does NOT automatically create a gradebook value. If a student submitted
   * but hasn't been graded, they will appear with a blank/ungraded grade.
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
      console.log(`📚 Gradebook has ${gradebook.length} grade objects`);
      console.log(`🔍 Looking for grade object matching: "${assignment.Name}"`);
      
      const gradeObject =
        gradebook.find(g => g.Name === assignment.Name) ||
        gradebook.find(g => (g.Name || '').trim().toLowerCase() === (assignment.Name || '').trim().toLowerCase());

      if (!gradeObject) {
        console.warn(`❌ Grade object not found. Available grade objects:`, gradebook.map(g => g.Name));
        this.exportResults = {
          success: 0,
          failed: 0,
          errors: [`Grade object "${assignment.Name}" not found in gradebook. Available: ${gradebook.map(g => g.Name).join(', ')}`]
        };
        return;
      }

      // Handle different property name formats (GradeObjectId vs gradeObjectId vs Id)
      const gradeObjectId = (gradeObject as any).GradeObjectId || 
                           (gradeObject as any).gradeObjectId || 
                           (gradeObject as any).Id ||
                           (gradeObject as any).id;

      if (!gradeObjectId) {
        console.error(`❌ Grade object found but has no GradeObjectId:`, gradeObject);
        console.error(`Available properties:`, Object.keys(gradeObject));
        this.exportResults = {
          success: 0,
          failed: 0,
          errors: [`Grade object "${assignment.Name}" found but has no GradeObjectId. Available properties: ${Object.keys(gradeObject).join(', ')}`]
        };
        return;
      }

      console.log(`✅ Found grade object: "${gradeObject.Name}" (ID: ${gradeObjectId})`);

      // Fetch classlist (source of truth for "all students")
      const classlist = await getClasslist(this.ou, this.versions.le);
      const students = classlist.filter(u => this.isLikelyStudent(u));

      // Fetch grade values (may be empty if nothing has been graded yet)
      let gradeValues: GradeValue[] = [];
      try {
        gradeValues = await getGradeValues(this.ou, this.versions.le, gradeObjectId);
        console.log(`📊 Found ${gradeValues.length} grade values for "${assignment.Name}"`);
        if (gradeValues.length > 0) {
          console.log('Sample grade value structure:', gradeValues[0]);
          console.log('All grade value UserIds:', gradeValues.map(gv => ({
            userId: gv.UserId,
            userIdType: typeof gv.UserId,
            pointsNumerator: gv.PointsNumerator,
            pointsDenominator: gv.PointsDenominator
          })));
        }
      } catch (e: any) {
        console.warn('Unable to fetch grade values:', e?.message || e);
      }
      const gradeByUserId = new Map<number, GradeValue>();
      const gradeByUsername = new Map<string, GradeValue>();
      for (const gv of gradeValues) {
        // Handle UserId as either number or string (D2L API can return both)
        let userId: number | null = null;
        if (gv.UserId !== undefined && gv.UserId !== null) {
          if (typeof gv.UserId === 'string') {
            const parsed = Number(gv.UserId);
            if (Number.isFinite(parsed)) {
              userId = parsed;
            }
          } else if (typeof gv.UserId === 'number' && Number.isFinite(gv.UserId)) {
            userId = gv.UserId;
          }
        }
        
        if (userId !== null) {
          gradeByUserId.set(userId, gv);
        } else {
          console.warn(`⚠️ Grade value has invalid UserId:`, gv);
        }
      }

      // Fetch submissions (to show that a student submitted even if ungraded)
      let submissions: AssignmentSubmission[] = [];
      try {
        submissions = await getAssignmentSubmissions(this.ou, this.versions.le, assignment.Id);
        console.log(`📤 Found ${submissions.length} submissions for assignment "${assignment.Name}" (ID: ${assignment.Id})`);
        if (submissions.length > 0) {
          console.log('All submissions:', submissions.map(s => ({
            userId: s.UserId,
            username: s.UserName,
            displayName: s.DisplayName,
            submittedDate: s.SubmittedDate,
            submissionNumber: s.SubmissionNumber
          })));
        }
      } catch (e: any) {
        console.warn('Unable to fetch assignment submissions:', e?.message || e);
      }
      const submissionByUserId = new Map<number, AssignmentSubmission>();
      const submissionByUsername = new Map<string, AssignmentSubmission>();
      for (const s of submissions) {
        // Handle UserId as either number or string (D2L API can return both)
        let userId: number | null = null;
        if (s.UserId !== undefined && s.UserId !== null) {
          if (typeof s.UserId === 'string') {
            const parsed = Number(s.UserId);
            if (Number.isFinite(parsed)) {
              userId = parsed;
            }
          } else if (typeof s.UserId === 'number' && Number.isFinite(s.UserId)) {
            userId = s.UserId;
          }
        }
        
        if (userId !== null) {
          // Keep the latest submission by submission number
          const existing = submissionByUserId.get(userId);
          if (!existing || s.SubmissionNumber > existing.SubmissionNumber) {
            submissionByUserId.set(userId, s);
          }
        } else {
          console.warn(`⚠️ Submission has invalid UserId:`, s);
        }
        // Also index by username for fallback matching
        if (s.UserName) {
          submissionByUsername.set(s.UserName.toLowerCase(), s);
        }
      }

      // Debug: Log user ID matching issues
      console.log(`👥 Processing ${students.length} students from classlist`);
      console.log(`📋 Classlist UserIds:`, students.map(u => ({ name: u.DisplayName, username: u.Username, userId: u.UserId, identifier: u.Identifier })));
      console.log(`📤 Submission UserIds:`, submissions.map(s => ({ username: s.UserName, userId: s.UserId, displayName: s.DisplayName })));
      console.log(`📊 Grade UserIds:`, gradeValues.map(g => ({ userId: g.UserId, points: `${g.PointsNumerator}/${g.PointsDenominator}` })));
      
      // Check for UserId mismatches
      const classlistUserIds = new Set(students.map(u => u.UserId).filter(id => id !== undefined && id !== null));
      const submissionUserIds = new Set(submissions.map(s => s.UserId));
      const gradeUserIds = new Set(gradeValues.map(g => g.UserId));
      
      const submissionsNotInClasslist = Array.from(submissionUserIds).filter(id => !classlistUserIds.has(id));
      const gradesNotInClasslist = Array.from(gradeUserIds).filter(id => !classlistUserIds.has(id));
      
      if (submissionsNotInClasslist.length > 0) {
        console.warn(`⚠️ Found ${submissionsNotInClasslist.length} submission(s) from users not in classlist:`, submissionsNotInClasslist);
        console.warn(`   These submissions:`, submissions.filter(s => submissionsNotInClasslist.includes(s.UserId)));
      }
      if (gradesNotInClasslist.length > 0) {
        console.warn(`⚠️ Found ${gradesNotInClasslist.length} grade(s) for users not in classlist:`, gradesNotInClasslist);
        console.warn(`   These grades:`, gradeValues.filter(g => gradesNotInClasslist.includes(g.UserId)));
      }
      
      const studentsWithoutUserId = students.filter(u => !u.UserId && !u.Identifier);
      if (studentsWithoutUserId.length > 0) {
        console.warn(`⚠️ Found ${studentsWithoutUserId.length} students without UserId or Identifier:`, studentsWithoutUserId.map(u => u.DisplayName || u.Username));
      }

      const maxPoints = (gradeObject as any).MaxPoints ?? (gradeObject as any).maxPoints ?? '';

      // Build CSV
      const headers = [
        'Display Name',
        'Username',
        'User ID',
        'Role',
        'Submitted',
        'Submitted Date',
        'Points Earned',
        'Points Possible',
        'Comments'
      ];

      const rows = students.map((u) => {
        // Try UserId first, fallback to Identifier if UserId is missing
        let userId: number | null = null;
        if (u.UserId !== undefined && u.UserId !== null) {
          userId = Number(u.UserId);
          if (!Number.isFinite(userId)) userId = null;
        } else if (u.Identifier !== undefined && u.Identifier !== null) {
          const idNum = Number(u.Identifier);
          if (Number.isFinite(idNum)) {
            userId = idNum;
          }
        }

        // Try to find grade and submission by UserId first
        let gv = userId !== null ? gradeByUserId.get(userId) : undefined;
        let sub = userId !== null ? submissionByUserId.get(userId) : undefined;

        // Aggressive matching: try multiple strategies to find submission and grade
        if (u.Username) {
          const usernameLower = u.Username.toLowerCase();
          
          // Strategy 1: Try to find submission by username in the username map
          if (!sub && submissionByUsername.has(usernameLower)) {
            sub = submissionByUsername.get(usernameLower);
            // If we found submission by username, update userId from submission and try to get grade
            if (sub) {
              // Handle submission UserId as either number or string
              let submissionUserId: number | null = null;
              if (typeof sub.UserId === 'string') {
                const parsed = Number(sub.UserId);
                if (Number.isFinite(parsed)) submissionUserId = parsed;
              } else if (typeof sub.UserId === 'number' && Number.isFinite(sub.UserId)) {
                submissionUserId = sub.UserId;
              }
              
              // Use submission's UserId if it's different from classlist UserId
              if (submissionUserId && (!userId || submissionUserId !== userId)) {
                userId = submissionUserId;
                // Now try to get grade with this UserId from submission
                gv = gradeByUserId.get(userId);
              } else if (submissionUserId && !gv) {
                // If userIds match but we still don't have a grade, try again with the submission's userId
                gv = gradeByUserId.get(submissionUserId);
              }
            }
          }
          
          // Strategy 2: Search all submissions directly by username (more aggressive)
          if (!sub) {
            const matchingSubmissions = submissions.filter(s => {
              if (!s.UserName) return false;
              const subUsername = s.UserName.toLowerCase();
              return subUsername === usernameLower || 
                     subUsername.includes(usernameLower) || 
                     usernameLower.includes(subUsername);
            });
            
            if (matchingSubmissions.length > 0) {
              // Use the most recent submission
              sub = matchingSubmissions.reduce((latest, current) => {
                return (current.SubmissionNumber || 0) > (latest.SubmissionNumber || 0) ? current : latest;
              });
              
              // If we found a submission, try to get the grade using its UserId
              if (sub && !gv) {
                let submissionUserId: number | null = null;
                if (typeof sub.UserId === 'string') {
                  const parsed = Number(sub.UserId);
                  if (Number.isFinite(parsed)) submissionUserId = parsed;
                } else if (typeof sub.UserId === 'number' && Number.isFinite(sub.UserId)) {
                  submissionUserId = sub.UserId;
                }
                if (submissionUserId !== null) {
                  gv = gradeByUserId.get(submissionUserId);
                  // Also update userId if we found a valid submission UserId
                  if (!userId || submissionUserId !== userId) {
                    userId = submissionUserId;
                  }
                }
              }
            }
          }
          
          // Strategy 3: If we have a grade but no submission, search all submissions more aggressively
          // This handles cases where the grade exists but submission wasn't matched
          if (gv && !sub) {
            // Try matching by username in all submissions
            const matchingSubmissions = submissions.filter(s => {
              if (!s.UserName) return false;
              return s.UserName.toLowerCase() === usernameLower;
            });
            
            if (matchingSubmissions.length > 0) {
              // Use the most recent submission
              sub = matchingSubmissions.reduce((latest, current) => {
                return (current.SubmissionNumber || 0) > (latest.SubmissionNumber || 0) ? current : latest;
              });
            }
            
            // Also try matching by display name if username didn't work
            if (!sub && u.DisplayName) {
              const displayNameLower = u.DisplayName.toLowerCase();
              const matchingByDisplayName = submissions.filter(s => {
                if (!s.DisplayName) return false;
                return s.DisplayName.toLowerCase() === displayNameLower ||
                       s.DisplayName.toLowerCase().includes(displayNameLower) ||
                       displayNameLower.includes(s.DisplayName.toLowerCase());
              });
              
              if (matchingByDisplayName.length > 0) {
                sub = matchingByDisplayName.reduce((latest, current) => {
                  return (current.SubmissionNumber || 0) > (latest.SubmissionNumber || 0) ? current : latest;
                });
              }
            }
          }
          
          // Strategy 4: Also try to find grade by matching username in submissions (if we have submissions but no grade)
          if (!gv && sub) {
            // We already have the submission, so use its UserId to get the grade
            let submissionUserId: number | null = null;
            if (typeof sub.UserId === 'string') {
              const parsed = Number(sub.UserId);
              if (Number.isFinite(parsed)) submissionUserId = parsed;
            } else if (typeof sub.UserId === 'number' && Number.isFinite(sub.UserId)) {
              submissionUserId = sub.UserId;
            }
            if (submissionUserId !== null) {
              gv = gradeByUserId.get(submissionUserId);
            }
          }
        }

        // Debug logging for specific user if needed
        if (u.Username === 'cs78865' || (u.DisplayName && u.DisplayName.includes('Sparks'))) {
          console.log(`🔍 Debug for ${u.DisplayName || u.Username}:`, {
            classlistUserId: u.UserId,
            classlistIdentifier: u.Identifier,
            classlistUsername: u.Username,
            resolvedUserId: userId,
            hasGrade: !!gv,
            hasSubmission: !!sub,
            gradeValue: gv ? `${gv.PointsNumerator}/${gv.PointsDenominator}` : 'none',
            submissionDate: sub?.SubmittedDate || 'none',
            submissionUserId: sub?.UserId,
            submissionUsername: sub?.UserName,
            allSubmissionsForUser: submissions.filter(s => 
              s.UserId === userId || 
              (u.Username && s.UserName && s.UserName.toLowerCase() === u.Username.toLowerCase())
            ).map(s => ({
              userId: s.UserId,
              username: s.UserName,
              submittedDate: s.SubmittedDate,
              submissionNumber: s.SubmissionNumber
            })),
            allGradesForUser: gradeValues.filter(g => 
              g.UserId === userId
            ).map(g => ({
              userId: g.UserId,
              points: `${g.PointsNumerator}/${g.PointsDenominator}`
            }))
          });
        }

        // Extract points - handle both number and string types, and null/undefined
        let pointsEarned: string | number = '';
        let pointsPossible: string | number = '';
        
        if (gv) {
          // Handle PointsNumerator - can be number, string, or null/undefined
          if (gv.PointsNumerator !== null && gv.PointsNumerator !== undefined) {
            const num = typeof gv.PointsNumerator === 'string' ? Number(gv.PointsNumerator) : gv.PointsNumerator;
            pointsEarned = Number.isFinite(num) ? num : '';
          }
          
          // Handle PointsDenominator - can be number, string, or null/undefined
          if (gv.PointsDenominator !== null && gv.PointsDenominator !== undefined) {
            const den = typeof gv.PointsDenominator === 'string' ? Number(gv.PointsDenominator) : gv.PointsDenominator;
            pointsPossible = Number.isFinite(den) ? den : '';
          }
        }
        
        // Calculate percent only if we have valid numbers for both
        let percent: string | number = '';
        if (typeof pointsEarned === 'number' && typeof pointsPossible === 'number' && pointsPossible > 0) {
          percent = Math.round((pointsEarned / pointsPossible) * 10000) / 100;
        }

        // If student has a grade but no submission found, infer they submitted
        // (you can't have a grade without submitting)
        const hasSubmission = sub !== undefined || (gv !== undefined && (pointsEarned !== '' || pointsPossible !== ''));
        const submissionDate = sub?.SubmittedDate || '';
        
        return [
          this.csvEscape(u.DisplayName || ''),
          this.csvEscape(u.Username || ''),
          this.csvEscape(userId !== null ? userId : ''),
          this.csvEscape(u.ClasslistRoleDisplayName || ''),
          this.csvEscape(hasSubmission ? 'Yes' : 'No'),
          this.csvEscape(submissionDate),
          this.csvEscape(pointsEarned),
          this.csvEscape(pointsPossible),
          this.csvEscape(gv?.Comments?.Content || '')
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      // Add UTF-8 BOM for Excel compatibility (prevents encoding issues like "‚Äôs" instead of "'s")
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      const safeName = assignment.Name.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 80) || 'assignment';
      link.setAttribute('href', url);
      link.setAttribute('download', `${safeName}-grades-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.exportResults = { success: students.length, failed: 0, errors: [] };
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
      // Get total number of students from classlist
      let totalStudents = 0;
      try {
        const classlist = await getClasslist(this.ou, this.versions.le);
        // Count only students (role ID 195 is typically student, but we'll filter by role name)
        totalStudents = classlist.filter(u => {
          const roleName = (u.ClasslistRoleDisplayName || '').toLowerCase();
          return roleName.includes('student') || u.RoleId === 195;
        }).length;
      } catch (error) {
        console.warn('Could not fetch classlist for total student count:', error);
      }

      // Collect all assignment data with grades
      const exportData: Array<{
        assignmentName: string;
        dueDate: string;
        type: string;
        gradeObjectId?: number;
        gradeObjectName?: string;
        maxPoints?: number;
        studentCount?: number;
        classAverage?: number;
      }> = [];

      // Get gradebook to match assignments with grade objects
      const gradebook = await getGradebook(this.ou, this.versions.le);
      
      // Use bulk grade values endpoint for much better performance
      // This fetches all grade values in one API call instead of one per assignment
      let allGradeValues: GradeValue[] = [];
      try {
        allGradeValues = await getBulkGradeValues(this.ou, this.versions.le, {
          pageSize: 200 // Request larger page size for efficiency
        });
        console.log(`📊 Fetched ${allGradeValues.length} grade values in bulk for all assignments`);
      } catch (error) {
        console.warn('Could not fetch bulk grade values, falling back to per-assignment fetching:', error);
      }
      
      // Create a map of gradeObjectId -> grade values for quick lookup
      const gradeValuesByObjectId = new Map<number | string, GradeValue[]>();
      for (const gv of allGradeValues) {
        const gradeObjectId = gv.GradeObjectId;
        if (gradeObjectId !== null && gradeObjectId !== undefined) {
          const id = typeof gradeObjectId === 'string' ? Number(gradeObjectId) : gradeObjectId;
          if (Number.isFinite(id)) {
            if (!gradeValuesByObjectId.has(id)) {
              gradeValuesByObjectId.set(id, []);
            }
            gradeValuesByObjectId.get(id)!.push(gv);
          }
        }
      }

      for (const assignment of this.assignments) {
        const isAssignment = getItemType(assignment) === 'assignment';
        if (!isAssignment) continue;

        const dueDate = assignment.DueDate ? transformDate(assignment.DueDate) : 'No Due Date';
        const assignmentType = this.formatAssignmentType(assignment);

        // Try to find matching grade object
        const gradeObject =
          gradebook.find(g => g.Name === assignment.Name) ||
          gradebook.find(g => (g.Name || '').trim().toLowerCase() === (assignment.Name || '').trim().toLowerCase());
        
        // Get student count and calculate class average from bulk grade values if grade object exists
        let studentCount = 0;
        let classAverage: number | null = null;
        if (gradeObject) {
          try {
            const gradeObjectIdForExport = (gradeObject as any).GradeObjectId || 
                                          (gradeObject as any).gradeObjectId || 
                                          (gradeObject as any).Id ||
                                          (gradeObject as any).id;
            
            // Get grade values from bulk data if available, otherwise fetch individually
            let gradeValues: GradeValue[] = [];
            if (gradeObjectIdForExport && gradeValuesByObjectId.has(gradeObjectIdForExport)) {
              gradeValues = gradeValuesByObjectId.get(gradeObjectIdForExport)!;
            } else if (gradeObjectIdForExport && allGradeValues.length === 0) {
              // Fallback to individual fetch if bulk fetch failed
              gradeValues = await getGradeValues(this.ou, this.versions.le, gradeObjectIdForExport);
            }
            
            studentCount = gradeValues.length;
            
            // Calculate class average percentage
            if (gradeValues.length > 0) {
              const validGrades: number[] = [];
              for (const gv of gradeValues) {
                // Only include grades with valid numerator and denominator
                if (gv.PointsNumerator !== null && 
                    gv.PointsNumerator !== undefined && 
                    gv.PointsDenominator !== null && 
                    gv.PointsDenominator !== undefined) {
                  const numerator = typeof gv.PointsNumerator === 'string' ? Number(gv.PointsNumerator) : gv.PointsNumerator;
                  const denominator = typeof gv.PointsDenominator === 'string' ? Number(gv.PointsDenominator) : gv.PointsDenominator;
                  
                  if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator > 0) {
                    const percentage = (numerator / denominator) * 100;
                    validGrades.push(percentage);
                  }
                }
              }
              
              if (validGrades.length > 0) {
                const sum = validGrades.reduce((acc, val) => acc + val, 0);
                classAverage = Math.round((sum / validGrades.length) * 100) / 100; // Round to 2 decimal places
              }
            }
          } catch (error) {
            // Ignore errors getting grade values
          }
        }

        exportData.push({
          assignmentName: assignment.Name,
          dueDate,
          type: assignmentType,
          gradeObjectId: (gradeObject as any)?.GradeObjectId || (gradeObject as any)?.gradeObjectId || (gradeObject as any)?.Id || (gradeObject as any)?.id,
          gradeObjectName: gradeObject?.Name,
          maxPoints: gradeObject?.MaxPoints,
          studentCount,
          classAverage: classAverage !== null ? classAverage : undefined
        });
      }

      // Generate CSV
      const csvHeaders = ['Assignment Name', 'Due Date', 'Type', 'Grade Object ID', 'Max Points', 'Students Graded', 'Total Students', 'Class Average (%)'];
      const csvRows = exportData.map(row => [
        `"${row.assignmentName}"`,
        `"${row.dueDate}"`,
        `"${row.type}"`,
        row.gradeObjectId?.toString() || '',
        row.maxPoints?.toString() || '',
        row.studentCount?.toString() || '0',
        totalStudents.toString(),
        row.classAverage !== undefined ? row.classAverage.toFixed(2) : ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Create download link
      // Add UTF-8 BOM for Excel compatibility (prevents encoding issues like "‚Äôs" instead of "'s")
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
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