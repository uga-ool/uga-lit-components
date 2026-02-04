import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { getVersions, getUser, getEnrollment, logApiVersionWarning } from '../lib/api/d2l-client.js';
import { getCourse } from '../lib/api/d2l-utils.js';
import { loadData } from '../lib/data/data-loader.js';
import type { ApiVersions, Enrollment } from '../types/d2l.js';


@customElement('uga-instructor-note')
class UgaInstructorNote extends LitElement {

  @property({ type: Object }) versions: ApiVersions = {};

  // Light DOM: render into the page directly (eLC-friendly)
  createRenderRoot() {
    return this;
  }
  @property({ type: Object }) currentUser: any = {};
  @property({ type: String }) ou = '';
  @property({ type: String }) enrollment = 'Student';
  @property({ type: Array }) excludedRoles = ['Student', 'Demo Student'];
  @property({ type: String }) type = '';
  @property({ type: String }) filename = '';
  @property({ type: String }) program = '';
  @property({ type: String }) text = '';
  @state() private loading = true;
  @state() private errorMessage: string | null = null;
  private abortController: AbortController | null = null;

  constructor() {
    super();
  }
  
  connectedCallback(): void {
    super.connectedCallback();
    this.abortController = new AbortController();
    this.init();
  }
  
  disconnectedCallback(): void {
    super.disconnectedCallback();
    // Cancel all in-flight requests
    this.abortController?.abort();
    this.abortController = null;
  }

  async init(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    
    try {
      const versions = await getVersions();
      for (let key in versions) {
        this.versions[key] = versions[key];
      }

      // Check API versions for deprecation warnings
      if (this.versions.lp) {
        logApiVersionWarning(this.versions.lp, 'getUser');
        logApiVersionWarning(this.versions.lp, 'getEnrollment');
      }

      this.currentUser = await getUser(this.versions.lp);
      this.ou = getCourse() || '';

      if (this.ou) {
        try {
          // Try to get enrollment, but don't fail if not found
          // Use fallback to first enrollment if exact match not found
          const enrollmentData = await getEnrollment(this.ou, this.versions.lp, {
            fallbackToFirst: true,
            throwOnNotFound: false
          });
          
          if (enrollmentData && enrollmentData.OrgUnit?.Id?.toString() === this.ou) {
            this.enrollment = enrollmentData.Role?.Name || 'Student';
          } else {
            // No enrollment for this course (or fallback was for a different course) - show note so instructors don't lose access
            if (enrollmentData) {
              console.warn(`Enrollment returned for different course (${enrollmentData.OrgUnit?.Id}), defaulting to show instructor note for ou ${this.ou}`);
            } else {
              console.warn(`Could not find enrollment for course ${this.ou}, defaulting to show instructor note`);
            }
            this.enrollment = 'Instructor'; // Default to instructor to show the note
          }
        } catch (error: any) {
          // If enrollment lookup fails, default to showing note
          console.warn('Enrollment lookup failed, defaulting to show instructor note:', error.message);
          this.enrollment = 'Instructor'; // Default to instructor to show the note
        }
      } else {
        // No course ID found - default to showing note
        console.warn('No course ID found, defaulting to show instructor note');
        this.enrollment = 'Instructor'; // Default to instructor to show the note
      }

      if (this.filename !== '' && this.type) {
        this.text = await loadData<string>(this.type as 'local' | 'program', this.filename, this.program);
      }
    } catch (error: any) {
      // Don't show error if request was aborted (component unmounted)
      if (error.message === 'Request aborted' || this.abortController?.signal.aborted) {
        return;
      }
      console.error('Failed to initialize instructor note:', error);
      this.errorMessage = error.message || 'Failed to load instructor note';
    } finally {
      if (!this.abortController?.signal.aborted) {
        this.loading = false;
        this.requestUpdate();
      }
    }
  }
  
  /**
   * Check if user is an instructor based on role name and ID
   * More reliable than just checking role name
   */
  private isInstructorRole(enrollment: Enrollment): boolean {
    const roleName = enrollment.Role?.Name || '';
    const roleId = enrollment.Role?.Id;
    
    // Common instructor role IDs (may vary by institution)
    // These are typical D2L role IDs, but should be adjusted based on your institution
    const instructorRoleIds = [170, 171, 172, 173]; // Adjust based on your institution
    
    return (
      !this.excludedRoles.includes(roleName) ||
      (roleId !== undefined && instructorRoleIds.includes(roleId))
    );
  }

  render() {  // This will only render if the logged in user's role does not appear in the prohibited role array above
    if (this.loading) {
      return html`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="obj-grid">
          <div class="obj-grid__full util-pad-all-md">
            <p>Loading instructor note...</p>
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

    if (!this.excludedRoles.includes(this.enrollment)) {
      return html`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <div class="obj-grid">
        <div class="obj-grid__full util-background-odyssey util-text-center util-pad-all-md">
          <h1 class="cmp-heading-5">Instructor Note</h1>
          <div class="instructor-note-content">${unsafeHTML(this.text)}</div>
        </div>
      </div>
      `;
    }
    
    return html``;
  }
}