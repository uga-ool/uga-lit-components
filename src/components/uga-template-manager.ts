import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getVersions, getUser, getEnrollment, logApiVersionWarning } from '../lib/api/d2l-client.js';
import { getCourse } from '../lib/api/d2l-utils.js';
import { getTemplateManagerPreview, type TemplateManagerPreview } from '../lib/api/d2l-client-template.js';
import type { ApiVersions, Enrollment } from '../types/d2l.js';

/**
 * Admin-only course template management (export / clear / back-copy).
 * See docs/COURSE_TEMPLATE_WIDGET.md — destructive actions require API spike completion.
 */
@customElement('uga-template-manager')
export class UgaTemplateManager extends LitElement {
  createRenderRoot() {
    return this;
  }

  @property({ type: Object }) versions: ApiVersions = {};
  /** Target template org unit id (required for preview and actions). */
  @property({ type: String, attribute: 'template-ou' }) templateOu = '';
  /** Live course OU; defaults to current course from URL when empty. */
  @property({ type: String, attribute: 'live-ou' }) liveOu = '';
  /** Demo/local: show UI without enforcing admin roles; no destructive API calls. */
  @property({ type: Boolean, attribute: 'stub-mode' }) stubMode = false;
  /** Comma-separated Role.Name values allowed to see the widget (e.g. "Super Administrator"). */
  @property({ type: String, attribute: 'admin-role-names' }) adminRoleNames = '';
  /** Comma-separated Role.Id values allowed. */
  @property({ type: String, attribute: 'admin-role-ids' }) adminRoleIds = '';
  /** POST base URL for server/drive-upload (e.g. http://localhost:3847/upload). */
  @property({ type: String, attribute: 'drive-upload-url' }) driveUploadUrl = '';
  @property({ type: String, attribute: 'drive-upload-token' }) driveUploadToken = '';

  @state() private loading = true;
  @state() private errorMessage: string | null = null;
  @state() private enrollment: Enrollment | null = null;
  @state() private preview: TemplateManagerPreview | null = null;
  @state() private actionMessage: string | null = null;
  @state() private busy = false;

  connectedCallback(): void {
    super.connectedCallback();
    void this.init();
  }

  private parseNames(): string[] {
    return this.adminRoleNames
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private parseIds(): number[] {
    return this.adminRoleIds
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));
  }

  /** Returns true in stub mode, or when current role matches allowlists (both non-empty). */
  private isAllowedAdmin(): boolean {
    if (this.stubMode) return true;
    const names = this.parseNames();
    const ids = this.parseIds();
    if (names.length === 0 && ids.length === 0) return false;
    const roleName = this.enrollment?.Role?.Name || '';
    const roleId = this.enrollment?.Role?.Id ?? -1;
    if (names.includes(roleName)) return true;
    if (ids.includes(roleId)) return true;
    return false;
  }

  async init(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    this.actionMessage = null;
    try {
      if (this.stubMode) {
        this.liveOu = this.liveOu || getCourse() || 'demo-live-ou';
        try {
          const v = await getVersions();
          this.versions = { ...v };
        } catch {
          this.versions = { le: '1.55', lp: '1.46' } as ApiVersions;
        }
        if (this.templateOu && this.versions.le) {
          if (this.liveOu.startsWith('demo')) {
            this.preview = {
              liveOu: this.liveOu,
              templateOu: this.templateOu,
              liveModuleCount: 0,
              templateModuleCount: 0,
            };
          } else {
            this.preview = await getTemplateManagerPreview(this.liveOu, this.templateOu, this.versions.le);
          }
        }
        return;
      }

      const v = await getVersions();
      this.versions = { ...v };
      if (this.versions.lp) {
        logApiVersionWarning(this.versions.lp, 'getEnrollment');
      }
      await getUser(this.versions.lp);
      const ou = this.liveOu || getCourse() || '';
      this.liveOu = ou;
      if (!ou) {
        this.errorMessage = 'No course org unit (ou) in this context. Set live-ou or open inside a course.';
        return;
      }
      const en = await getEnrollment(ou, this.versions.lp, {
        fallbackToFirst: false,
        throwOnNotFound: false,
      });
      this.enrollment = en;

      if (this.isAllowedAdmin() && this.templateOu && this.versions.le) {
        this.preview = await getTemplateManagerPreview(ou, this.templateOu, this.versions.le);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.errorMessage = msg;
    } finally {
      this.loading = false;
      this.requestUpdate();
    }
  }

  private async onExport(): Promise<void> {
    this.actionMessage = null;
    if (!this.driveUploadUrl) {
      this.actionMessage =
        'Export: configure drive-upload-url and run server/drive-upload (see server/drive-upload/README.md). Course archive generation is not wired until the API spike delivers a file payload.';
      return;
    }
    this.busy = true;
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/octet-stream',
      };
      if (this.driveUploadToken) {
        headers.Authorization = `Bearer ${this.driveUploadToken}`;
      }
      const res = await fetch(this.driveUploadUrl, {
        method: 'POST',
        headers,
        body: new Uint8Array([0]), // placeholder; replace with real export bundle
      });
      const text = await res.text();
      if (!res.ok) {
        this.actionMessage = `Export failed: ${res.status} ${text}`;
        return;
      }
      try {
        const j = JSON.parse(text) as { url?: string };
        this.actionMessage = j.url ? `Uploaded: ${j.url}` : `Response: ${text}`;
      } catch {
        this.actionMessage = text;
      }
    } catch (e: unknown) {
      this.actionMessage = e instanceof Error ? e.message : String(e);
    } finally {
      this.busy = false;
      this.requestUpdate();
    }
  }

  private confirmDestructive(label: string): boolean {
    const live = this.liveOu || '';
    const typed = window.prompt(
      `Type the live course OU ${live} to confirm ${label} (or Cancel).`
    );
    return typed === live && live.length > 0;
  }

  private async onClear(): Promise<void> {
    this.actionMessage = null;
    if (!this.confirmDestructive('CLEAR template')) return;
    this.actionMessage =
      'Clear template: not implemented — requires Valence delete scope and agreed semantics (see docs/COURSE_TEMPLATE_API_SPIKE.md).';
  }

  private async onBackCopy(): Promise<void> {
    this.actionMessage = null;
    if (!this.confirmDestructive('BACK-COPY from live to template')) return;
    this.actionMessage =
      'Back-copy: not implemented — requires cross-org copy or import package flow from API spike.';
  }

  render() {
    if (this.loading) {
      return html`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="util-pad-all-md util-background-creamery__75" style="border: 1px solid #e0e0e0; border-radius: 8px;">
          <p>Loading template manager…</p>
        </div>
      `;
    }

    if (this.errorMessage) {
      return html`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="util-pad-all-md" style="border-left: 4px solid #ba0c2f; background: #fff5f5;">
          <p><strong>Template manager</strong></p>
          <p>${this.errorMessage}</p>
        </div>
      `;
    }

    if (!this.stubMode && !this.isAllowedAdmin()) {
      return html`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="util-pad-all-md util-font-size-sm" style="color: #666;">Access denied.</div>
      `;
    }

    const roleLabel = this.enrollment?.Role?.Name || 'Unknown';
    const canPreview = Boolean(this.templateOu && this.versions.le) && !this.preview?.error;

    return html`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <div
        class="util-pad-all-md util-background-creamery__75"
        style="border: 1px solid #e0e0e0; border-radius: 8px; max-width: 42rem;"
      >
        <h3 class="cmp-heading-3 util-margin-top-none">Course template manager</h3>
        ${this.stubMode
          ? html`<p class="util-font-size-sm" style="background: #fff3cd; padding: 0.5rem; border-radius: 4px;">
              <strong>Stub mode:</strong> for demos only. Admin roles are not enforced.
            </p>`
          : html`<p class="util-font-size-sm">Signed in as <strong>${roleLabel}</strong> (admin allowlist required).</p>`}
        <p class="util-font-size-sm">
          <strong>Live OU:</strong> ${this.liveOu || '—'}<br />
          <strong>Template OU:</strong> ${this.templateOu || '(set template-ou)'}
        </p>
        ${this.preview
          ? html`
              <div class="util-margin-vert-md util-pad-all-sm" style="background: #fff; border-radius: 4px;">
                <p class="util-margin-bottom-none"><strong>Content preview (TOC modules)</strong></p>
                ${this.preview.error
                  ? html`<p style="color: #b00020;">Preview error: ${this.preview.error}</p>`
                  : html`<ul class="util-margin-top-sm">
                      <li>Live course modules: ${this.preview.liveModuleCount}</li>
                      <li>Template modules: ${this.preview.templateModuleCount}</li>
                    </ul>`}
              </div>
            `
          : html`<p class="util-font-size-sm">Set <code>template-ou</code> to load a read-only preview.</p>`}
        <div class="util-margin-top-md" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          <button
            type="button"
            class="util-button util-button--primary"
            ?disabled=${this.busy || !canPreview}
            @click=${() => this.onExport()}
          >
            Export to Drive
          </button>
          <button
            type="button"
            class="util-button"
            ?disabled=${this.busy || !this.templateOu}
            @click=${() => this.onClear()}
          >
            Clear template
          </button>
          <button
            type="button"
            class="util-button"
            ?disabled=${this.busy || !this.templateOu}
            @click=${() => this.onBackCopy()}
          >
            Back-copy live → template
          </button>
        </div>
        ${this.actionMessage
          ? html`<p class="util-margin-top-md util-font-size-sm" style="color: #333;">${this.actionMessage}</p>`
          : null}
        <p class="util-margin-top-md util-font-size-sm" style="color: #555;">
          Documentation:
          <a href="../docs/COURSE_TEMPLATE_WIDGET.md" target="_blank" rel="noopener noreferrer">COURSE_TEMPLATE_WIDGET.md</a>
        </p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uga-template-manager': UgaTemplateManager;
  }
}
