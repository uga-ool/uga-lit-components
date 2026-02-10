import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getVersions, getEnrollment, getAssignments, clearAssignmentsCache } from '../lib/api/d2l-client.js';
import { getCourse } from '../lib/api/d2l-utils.js';
import { syncQuizGradesFromDropbox } from '../lib/api/gradebook-utils.js';
import type { ApiVersions } from '../types/d2l.js';

/**
 * Instructor-only control to run "Automatic (instructor-run) sync from submissions to gradebook".
 * Place below the quiz on the page. Only visible to users whose role is not in excludedRoles
 * (e.g. instructors). Uses the same visibility pattern as uga-instructor-note.
 * Folder can be specified by dropbox-folder-id or by dropbox-assignment-name (lookup by name).
 */
@customElement('uga-quiz-grade-sync')
class UgaQuizGradeSync extends LitElement {
  @property({ type: Object }) versions: ApiVersions = {};
  @property({ type: String }) ou = '';
  @property({ type: String }) enrollment = 'Student';
  @property({ type: Array }) excludedRoles = ['Student', 'Demo Student'];
  /** D2L dropbox folder (assignment) ID. Use this or dropbox-assignment-name. */
  @property({ type: Number, attribute: 'dropbox-folder-id' }) dropboxFolderId: number = 0;
  /** Assignment name to look up folder ID (e.g. "Quiz Demo 2"). Use this or dropbox-folder-id. */
  @property({ type: String, attribute: 'dropbox-assignment-name' }) dropboxAssignmentName = '';

  @state() private _busy = false;
  @state() private _message = '';
  @state() private _isError = false;

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.init();
  }

  async init(): Promise<void> {
    const versions = await getVersions();
    this.versions = { ...versions };
    this.ou = getCourse() || '';
    if (this.ou && this.versions.lp) {
      try {
        const enrollmentData = await getEnrollment(this.ou, this.versions.lp, {
          fallbackToFirst: true,
          throwOnNotFound: false
        });
        // Only use role when it's for this course; otherwise show sync (instructor default)
        if (enrollmentData && enrollmentData.OrgUnit?.Id?.toString() === this.ou) {
          this.enrollment = enrollmentData.Role?.Name || 'Student';
        } else {
          this.enrollment = 'Instructor'; // Unknown/different course - show sync so instructors don't lose access
        }
      } catch {
        this.enrollment = 'Instructor'; // On error, show sync so instructors don't lose access
      }
    }
    this.requestUpdate();
  }

  /** Resolve folder ID from dropboxFolderId or by looking up dropboxAssignmentName. */
  private async _getFolderId(): Promise<number | 0> {
    if (this.dropboxFolderId && this.ou && this.versions.le) {
      return this.dropboxFolderId;
    }
    const name = this.dropboxAssignmentName?.trim();
    if (!name || !this.ou || !this.versions.le) return 0;
    clearAssignmentsCache(this.ou);
    const folders = await getAssignments(this.ou, this.versions.le);
    const list = (folders as { Name?: string; Id?: number }[]) || [];
    let match = list.find((f) => f.Name && f.Name.trim() === name);
    if (!match?.Id) {
      match = list.find((f) => f.Name && f.Name.trim().toLowerCase() === name.toLowerCase());
    }
    return match?.Id ?? 0;
  }

  private async _runSync(): Promise<void> {
    if (this._busy || !this.ou || !this.versions.le) return;
    const hasIdOrName = !!this.dropboxFolderId || !!this.dropboxAssignmentName?.trim();
    if (!hasIdOrName) {
      this._message = 'Set dropbox-folder-id or dropbox-assignment-name to enable sync.';
      this._isError = true;
      this.requestUpdate();
      return;
    }
    this._busy = true;
    this._message = '';
    this._isError = false;
    this.requestUpdate();
    try {
      const folderId = await this._getFolderId();
      if (!folderId) {
        this._message = `Assignment "${this.dropboxAssignmentName}" not found. Create it in eLC (Assignments) with that exact name and make it visible.`;
        this._isError = true;
        return;
      }
      const result = await syncQuizGradesFromDropbox(
        this.ou,
        this.versions.le,
        folderId,
        { activeOnly: true }
      );
      this._message = result.message;
      this._isError = result.failed > 0 || (result.success === 0 && result.skipped > 0 && !result.message.includes('linked'));
      if (result.errors.length) {
        this._message += ' ' + result.errors.slice(0, 3).join(' ');
      }
    } catch (e: unknown) {
      this._message = e instanceof Error ? e.message : 'Sync failed.';
      this._isError = true;
    } finally {
      this._busy = false;
      this.requestUpdate();
    }
  }

  render() {
    if (this.excludedRoles.includes(this.enrollment)) {
      return null;
    }
    const hasIdOrName = !!this.dropboxFolderId || !!this.dropboxAssignmentName?.trim();
    const canSync = hasIdOrName && !!this.ou && !!this.versions.le;
    return html`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <div class="obj-grid util-margin-top-md">
        <div class="obj-grid__full util-text-center">
          <button
            class="cmp-button cmp-button--primary"
            ?disabled=${this._busy || !canSync}
            @click=${this._runSync}
          >
            ${this._busy ? 'Syncing…' : 'Sync quiz grades to gradebook'}
          </button>
          ${!canSync && !this._message
            ? html`
                <p class="util-margin-top-sm util-font-size-sm util-text-red">
                  Set <code>dropbox-folder-id</code> or <code>dropbox-assignment-name</code> (e.g. the same name as the quiz’s assignment) to enable sync.
                </p>
              `
            : ''}
          ${this._message
            ? html`
                <p class="util-margin-top-sm util-font-size-sm ${this._isError ? 'util-text-red' : ''}">
                  ${this._message}
                </p>
              `
            : ''}
        </div>
      </div>
    `;
  }
}
