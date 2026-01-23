// <uga-instructor-card> = <uga-instructor-card-classlist.js>
// Uses LE classlist API instead of LP enrollments
// Works for students, instructors, and admins

import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import axios from 'axios';
import { getVersions, getClasslist } from '../lib/api/d2l-client.js';
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

  createRenderRoot() {
    // Light DOM so UGA Design System CSS applies
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._bootstrap();
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
      const instructor = this._pickInstructorFromClasslist(users);
      if (!instructor) throw new Error("No instructor found.");

      const imageSrc = await this._resolveImageSrc(instructor.userId);

      this._instructor = {
        name: instructor.name,
        imageSrc,
      };

      console.log("✅ Instructor loaded:", this._instructor);

    } catch (err: any) {
      console.error("InstructorCard error:", err);
      this._error = err.message || "Failed to load instructor.";
    } finally {
      this._loading = false;
    }
  }

  // --------------------------------------------------
  // API versions
  // --------------------------------------------------
  async _getVersions(): Promise<void> {
    const versions = await getVersions();
    this.versions = versions;
  }

  // --------------------------------------------------
  // NEW: Fetch classlist (LE API — student-safe)
  // --------------------------------------------------
  async _fetchClasslist(orgUnitId: string): Promise<ClasslistUser[]> {
    if (!this.versions.le) {
      throw new Error("API versions not loaded");
    }
    return await getClasslist(orgUnitId, this.versions.le);
  }

  // --------------------------------------------------
  // Pick Banner Instructor (preferred) or Instructor
  // --------------------------------------------------
  _pickInstructorFromClasslist(items: ClasslistUser[] = []): { userId: number; name: string } | null {
    const norm = (s: string | undefined): string => String(s ?? "").toLowerCase();

    let pick = items.find(
      (u: ClasslistUser) => norm(u.ClasslistRoleDisplayName).includes("banner instructor")
    );

    if (!pick) {
      pick = items.find(
        (u: ClasslistUser) => norm(u.ClasslistRoleDisplayName).includes("instructor")
      );
    }

    if (!pick) return null;

    return {
      userId: Number(pick.Identifier || pick.UserId || 0),
      name: pick.DisplayName || `${pick.FirstName || ''} ${pick.LastName || ''}`.trim() || 'Unknown',
    };
  }

  // --------------------------------------------------
  // Fetch instructor profile image (may still fallback)
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
