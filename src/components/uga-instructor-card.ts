// <uga-instructor-card> = <uga-instructor-card-classlist.js>
// Uses LE classlist API instead of LP enrollments
// Works for students, instructors, and admins

import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
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
  @state() private _instructor: Instructor | null = null;
  @state() private _loading: boolean = false;
  @state() private _error: string = '';
  @state() private _instructors: Array<{ userId: number; name: string }> = [];
  private abortController: AbortController | null = null;

  createRenderRoot() {
    // Light DOM so UGA Design System CSS applies
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.abortController = new AbortController();
    this._bootstrap();
  }
  
  disconnectedCallback(): void {
    super.disconnectedCallback();
    // Cancel all in-flight requests
    this.abortController?.abort();
    this.abortController = null;
  }

  render() {
    if (this._error) return html`<div class="error">${this._error}</div>`;
    if (this._loading) return html`<div class="loading">Loading instructor…</div>`;
    if (!this._instructor) return html`<div class="loading">No instructor found.</div>`;

    const i = this._instructor;

    const placeholderSvg = encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>
        <rect width='100%' height='100%' fill='#e5e7eb'/>
        <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle'
              font-family='system-ui,sans-serif' font-size='44' fill='#374151'>
          ${(i.name || '?')
            .split(/\s+/)
            .map((p: string) => p[0])
            .filter(Boolean)
            .slice(0, 2)
            .join('')
            .toUpperCase()}
        </text>
      </svg>
    `);

    return html`
      <div class="obj-flex">
        <figure
          class="obj-flex-item__sm util-align-center util-text-center util-pad-all-md util-margin-all-none util-background-white"
          style="border-radius:4px; box-shadow:0 10px 25px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.08);"
        >
          <img
            class="util-margin-bottom-md"
            loading="lazy"
            decoding="async"
            src=${i.imageSrc || `data:image/svg+xml,${placeholderSvg}`}
            alt=${`Instructor profile image for ${i.name}`}
            @error=${(e: Event) => this._fallbackMonogram(e, i.name)}
          />
          <span>${i.name}</span>
        </figure>
      </div>
    `;
  }

  // --------------------------------------------------
  // Main bootstrap
  // --------------------------------------------------
  async _bootstrap(): Promise<void> {
    this._loading = true;
    this._error = '';
    this._instructor = null;

    try {
      await this._getVersions();

      this.ou = getCourse();
      if (!this.ou) throw new Error("Unable to determine OrgUnitId.");

      // 🔁 NEW: use LE classlist
      const users = await this._fetchClasslist(this.ou);
      const instructors = this._pickInstructorsFromClasslist(users);
      if (instructors.length === 0) throw new Error("No instructor found.");

      // Use first instructor (can be extended to show multiple)
      const instructor = instructors[0];
      this._instructors = instructors; // Store all for potential future use

      const imageSrc = await this._resolveImageSrc(instructor.userId);

      this._instructor = {
        name: instructor.name,
        imageSrc,
      };

      console.log("✅ Instructor loaded:", this._instructor);

    } catch (err: any) {
      // Don't show error if request was aborted (component unmounted)
      if (err.message === 'Request aborted' || this.abortController?.signal.aborted) {
        return;
      }
      console.error("InstructorCard error:", err);
      this._error = err.message || "Failed to load instructor.";
    } finally {
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
  // Pick Banner Instructor (preferred) or Instructor
  // Supports multiple instructors
  // --------------------------------------------------
  _pickInstructorsFromClasslist(items: ClasslistUser[] = []): Array<{ userId: number; name: string }> {
    const norm = (s: string | undefined): string => String(s ?? "").toLowerCase();

    // Find all Banner Instructors first
    let picks = items.filter(
      (u: ClasslistUser) => norm(u.ClasslistRoleDisplayName).includes("banner instructor")
    );

    // If no Banner Instructors, find regular Instructors
    if (picks.length === 0) {
      picks = items.filter(
        (u: ClasslistUser) => norm(u.ClasslistRoleDisplayName).includes("instructor")
      );
    }

    return picks.map(pick => ({
      userId: Number(pick.Identifier || pick.UserId || 0),
      name: pick.DisplayName || `${pick.FirstName || ''} ${pick.LastName || ''}`.trim() || 'Unknown',
    }));
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
