// <uga-instructor-card> = <uga-instructor-card-classlist.js>
// Uses LE classlist API instead of LP enrollments
// Works for students, instructors, and admins

import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';
import axios from 'axios';
import { getVersions, getClasslist, getClasslistPaged, logApiVersionWarning } from '../lib/api/d2l-client.js';
import { getCourse } from '../lib/api/d2l-utils.js';
import type { ApiVersions, ClasslistUser } from '../types/d2l.js';

interface Instructor {
  name: string;
  imageSrc: string;
}

@customElement('uga-instructor-card')
class UgaInstructorCard extends LitElement {
  @property({ type: Object }) versions: ApiVersions = {};
  @property({ type: String }) ou: string | null = null;
  /** Comma-separated Brightspace usernames; when set, only those users are shown (after instructor detection). Pins users even if classlist role labels are hidden. Case-insensitive. */
  @property({ type: String }) username = '';
  /** When true, show a card for each matched instructor; when false, only the first match is shown. */
  @property({ type: Boolean, reflect: true }) multiple = false;
  @state() private _cards: Instructor[] = [];
  @state() private _loading: boolean = false;
  @state() private _error: string = '';
  private abortController: AbortController | null = null;
  private _bootstrapDone = false;

  createRenderRoot() {
    // Light DOM so UGA Design System CSS applies
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.abortController = new AbortController();
    queueMicrotask(() => this._bootstrap());
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._revokeProfileBlobs();
    this.abortController?.abort();
    this.abortController = null;
    this._bootstrapDone = false;
  }

  protected updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    if (!this._bootstrapDone || !this.abortController) return;

    let shouldRestart = false;
    if (changed.has('username')) {
      const prev = changed.get('username');
      if (!(prev === undefined && this.username === '')) shouldRestart = true;
    }
    if (changed.has('multiple')) {
      const prev = changed.get('multiple');
      if (!(prev === undefined && this.multiple === false)) shouldRestart = true;
    }
    if (shouldRestart) this._restartBootstrap();
  }

  render() {
    if (this._error) return html`<div class="error">${this._error}</div>`;
    if (this._loading) return html`<div class="loading">Loading instructor…</div>`;
    if (this._cards.length === 0) return html`<div class="loading">No instructor found.</div>`;

    return html`
      <div class="obj-flex util-margin-all-none" style="flex-wrap:wrap;gap:1rem;">
        ${this._cards.map(
          (i) => html`
            <figure
              class="obj-flex-item__sm util-align-center util-text-center util-pad-all-md util-margin-all-none util-background-white"
              style="border-radius:4px; box-shadow:0 10px 25px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.08);"
            >
              <img
                class="util-margin-bottom-md"
                loading="lazy"
                decoding="async"
                src=${i.imageSrc || `data:image/svg+xml,${this._placeholderDataUri(i.name)}`}
                alt=${`Instructor profile image for ${i.name}`}
                @error=${(e: Event) => this._fallbackMonogram(e, i.name)}
              />
              <span>${i.name}</span>
            </figure>
          `
        )}
      </div>
    `;
  }

  // --------------------------------------------------
  // Main bootstrap
  // --------------------------------------------------
  _restartBootstrap(): void {
    this._revokeProfileBlobs();
    this.abortController?.abort();
    this.abortController = new AbortController();
    queueMicrotask(() => this._bootstrap());
  }

  _revokeProfileBlobs(): void {
    for (const c of this._cards) {
      if (c.imageSrc?.startsWith('blob:')) URL.revokeObjectURL(c.imageSrc);
    }
  }

  _placeholderDataUri(name: string): string {
    const initials = (name || '?')
      .split(/\s+/)
      .map((p: string) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
    return encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>
        <rect width='100%' height='100%' fill='#e5e7eb'/>
        <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle'
              font-family='system-ui,sans-serif' font-size='44' fill='#374151'>
          ${initials}
        </text>
      </svg>
    `);
  }

  async _bootstrap(): Promise<void> {
    this._loading = true;
    this._error = '';
    this._revokeProfileBlobs();
    this._cards = [];

    try {
      await this._getVersions();

      this.ou = getCourse();
      if (!this.ou) throw new Error("Unable to determine OrgUnitId.");

      const users = await this._fetchClasslist(this.ou);
      let instructors = this._pickInstructorsFromClasslist(users);
      instructors = this._filterByUsername(instructors, this.username);
      if (instructors.length === 0) {
        throw new Error(
          this.username.trim()
            ? "No instructor matched the given username(s)."
            : "No instructor found."
        );
      }

      const selected = this.multiple ? instructors : [instructors[0]];
      const imageResults = await Promise.all(selected.map((row) => this._resolveImageSrc(row.userId)));

      this._cards = selected.map((row, idx) => ({
        name: row.name,
        imageSrc: imageResults[idx] || '',
      }));

      console.log('✅ Instructor card(s) loaded:', this._cards.map((c) => c.name));
    } catch (err: any) {
      if (err.message === 'Request aborted' || this.abortController?.signal.aborted) {
        return;
      }
      console.error('InstructorCard error:', err);
      this._error = err.message || 'Failed to load instructor.';
    } finally {
      this._bootstrapDone = true;
      if (!this.abortController?.signal.aborted) {
        this._loading = false;
      }
    }
  }

  // --------------------------------------------------
  // API versions
  // --------------------------------------------------
  async _getVersions(): Promise<void> {
    const versions = await getVersions();
    this.versions = versions;
    
    // Check API versions for deprecation warnings
    if (versions.le) {
      logApiVersionWarning(versions.le, 'uga-instructor-card');
    }
    if (versions.lp) {
      logApiVersionWarning(versions.lp, 'uga-instructor-card');
    }
  }

  // --------------------------------------------------
  // NEW: Fetch classlist (LE API — student-safe)
  // --------------------------------------------------
  async _fetchClasslist(orgUnitId: string): Promise<ClasslistUser[]> {
    if (!this.versions.le) {
      throw new Error("API versions not loaded");
    }
    
    // Check for deprecated API version
    logApiVersionWarning(this.versions.le, 'getClasslist');
    
    // Try paged endpoint first (better for large classes)
    try {
      return await getClasslistPaged(orgUnitId, this.versions.le, {
        pageSize: 200 // Request larger page size for efficiency
      });
    } catch (error: any) {
      // Fallback to non-paged endpoint if paged doesn't exist
      if (error.response?.status === 404) {
        console.warn('Paged classlist endpoint not available, falling back to non-paged');
        return await getClasslist(orgUnitId, this.versions.le);
      }
      throw error;
    }
  }

  // --------------------------------------------------
  // Instructor detection (classlist)
  // --------------------------------------------------
  _norm(s: string | undefined): string {
    return String(s ?? '').toLowerCase();
  }

  /** Stable key for deduping classlist rows */
  _classlistRowKey(u: ClasslistUser): string {
    const id = u.UserId != null ? Number(u.UserId) : NaN;
    if (Number.isFinite(id) && id > 0) return `id:${id}`;
    const un = String(u.Username ?? '').trim().toLowerCase();
    if (un) return `u:${un}`;
    return '';
  }

  _wantedUsernameList(): string[] {
    return this.username
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }

  /** Learner roles only — empty display names are not treated as students (see username pin). */
  _isLikelyStudentClasslist(u: ClasslistUser): boolean {
    const role = this._norm(u.ClasslistRoleDisplayName);
    return role.includes('student') || role.includes('learner');
  }

  /**
   * Teaching Assistant-style labels (Banner Instructor and Instructor are handled separately).
   */
  _roleLooksTeachingAssistant(roleNorm: string): boolean {
    if (!roleNorm) return false;
    if (roleNorm.includes('teaching assistant')) return true;
    if (roleNorm.includes('teaching-assistant')) return true;
    if (roleNorm.includes('teaching assistants')) return true;
    const tokens = roleNorm.split(/[\s,/;&]+/).filter(Boolean);
    return tokens.includes('ta');
  }

  /**
   * Only these classlist role families are shown: Banner Instructor, Instructor, Teaching Assistant.
   * Order for display: Banner Instructor → Instructor → Teaching Assistant.
   */
  _displayRoleCategory(roleNorm: string): 'banner' | 'instructor' | 'ta' | null {
    if (!roleNorm) return null;
    if (roleNorm.includes('banner instructor')) return 'banner';
    if (roleNorm.includes('instructor')) return 'instructor';
    if (this._roleLooksTeachingAssistant(roleNorm)) return 'ta';
    return null;
  }

  /**
   * Collect Banner Instructors, Instructors, and Teaching Assistants (merged; Banner rows listed first).
   */
  _pickInstructorsFromClasslist(
    items: ClasslistUser[] = []
  ): Array<{ userId: number; name: string; username: string }> {
    const keys = new Set<string>();
    const ordered: ClasslistUser[] = [];

    const push = (u: ClasslistUser) => {
      const k = this._classlistRowKey(u);
      if (!k || keys.has(k)) return;
      keys.add(k);
      ordered.push(u);
    };

    const categories: Array<'banner' | 'instructor' | 'ta'> = ['banner', 'instructor', 'ta'];
    for (const cat of categories) {
      for (const u of items) {
        const roleNorm = this._norm(u.ClasslistRoleDisplayName);
        if (this._displayRoleCategory(roleNorm) === cat) push(u);
      }
    }

    for (const w of this._wantedUsernameList()) {
      const found = items.find((u) => this._norm(u.Username) === w);
      if (!found || this._isLikelyStudentClasslist(found)) continue;
      const roleNorm = this._norm(found.ClasslistRoleDisplayName);
      if (roleNorm && this._displayRoleCategory(roleNorm) === null) continue;
      push(found);
    }

    return ordered.map((pick) => ({
      userId: pick.UserId != null ? Number(pick.UserId) : 0,
      name: pick.DisplayName || `${pick.FirstName || ''} ${pick.LastName || ''}`.trim() || 'Unknown',
      username: String(pick.Username ?? '').trim(),
    }));
  }

  /**
   * When `username` is set (comma-separated), keep only those accounts in the given order.
   * Matching is case-insensitive on Brightspace Username.
   */
  _filterByUsername(
    instructors: Array<{ userId: number; name: string; username: string }>,
    usernameProp: string
  ): Array<{ userId: number; name: string; username: string }> {
    const raw = usernameProp.trim();
    if (!raw) return instructors;

    const wanted = raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (wanted.length === 0) return instructors;

    const byUser = new Map(instructors.map((i) => [i.username.toLowerCase(), i]));
    const ordered: Array<{ userId: number; name: string; username: string }> = [];
    for (const w of wanted) {
      const row = byUser.get(w);
      if (row) ordered.push(row);
    }
    return ordered;
  }

  // --------------------------------------------------
  // Fetch instructor profile image (may still fallback)
  // Note: Profile image endpoint doesn't have retry wrapper,
  // but failures are handled gracefully with fallback
  // --------------------------------------------------
  async _resolveImageSrc(userId: number): Promise<string> {
    if (!userId || !this.versions.lp) return "";
    try {
      const url = `/d2l/api/lp/${this.versions.lp}/profile/user/${userId}/image`;
      const res = await axios.get(url, { responseType: "blob" });

      if (res?.data && res.headers["content-type"]?.startsWith("image/")) {
        return URL.createObjectURL(res.data);
      }
    } catch (err) {
      console.warn("No profile image available", err);
    }
    return "";
  }

  // --------------------------------------------------
  // Monogram fallback
  // --------------------------------------------------
  _fallbackMonogram(ev: Event, name: string): void {
    const target = ev.currentTarget as HTMLImageElement;
    if (!target) return;

    const initials = (name || "?")
      .split(/\s+/)
      .map((p: string) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    target.src = `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='112' height='112'>
        <rect width='100%' height='100%' fill='#e5e7eb'/>
        <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle'
              font-family='system-ui' font-size='44' fill='#374151'>${initials}</text>
      </svg>
    `)}`;
  }
}
