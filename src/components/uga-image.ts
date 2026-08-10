import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

/**
 * UGA Image component with expandable lightbox.
 * Displays an image with optional caption. Click to expand in a modal
 * with zoom controls for viewing details.
 *
 * Based on instructional designer patterns: figure with styled container,
 * semantic figcaption, and UGA brand styling (#ba0c2f).
 */
@customElement('uga-image')
class UgaImage extends LitElement {
  @property({ type: String }) src = '';
  @property({ type: String }) alt = '';
  /** Optional srcset for responsive images (e.g. "image-400w.jpg 400w, image-800w.jpg 800w") */
  @property({ type: String }) srcset = '';
  /** Optional sizes for responsive images (e.g. "(max-width: 600px) 100vw, 450px") */
  @property({ type: String }) sizes = '';
  /** Optional low-res or blur placeholder URL to show while the main image loads */
  @property({ type: String }) placeholder = '';
  @property({ type: String }) caption = '';
  /** Max width of the thumbnail container (default: 450px) */
  @property({ type: String, attribute: 'max-width' }) maxWidth = '450px';
  /** Border radius in pixels (default: 15) */
  @property({ type: Number, attribute: 'border-radius' }) borderRadius = 15;
  /** Border color (default: UGA red #ba0c2f) */
  @property({ type: String, attribute: 'border-color' }) borderColor = '#ba0c2f';
  /** Border width in pixels (default: 2) */
  @property({ type: Number, attribute: 'border-width' }) borderWidth = 2;
  /** Padding in pixels (default: 15) */
  @property({ type: Number }) padding = 15;
  /** When true, disables the lightbox expand-on-click behavior */
  @property({ type: Boolean, attribute: 'lightbox-disabled' }) lightboxDisabled = false;
  /**
   * When true (and lightbox is enabled), applies Design System `.util-shadow-hover`
   * so the image lifts on hover as a click affordance. Opt-in so existing courses are unchanged.
   */
  @property({ type: Boolean, attribute: 'hover-shadow' }) hoverShadow = false;

  @state() private expanded = false;
  @state() private zoom = 1;
  @state() private panX = 0;
  @state() private panY = 0;
  @state() private loaded = false;
  private isPanning = false;
  private startX = 0;
  private startY = 0;
  private startPanX = 0;
  private startPanY = 0;
  private _triggerEl: HTMLElement | null = null;
  private _wheelHandler = (e: WheelEvent) => this._onLightboxWheel(e);

  createRenderRoot() {
    return this;
  }

  static styles = css`
    uga-image {
      display: block;
    }

    .cmp-image {
      margin: 1rem 0;
    }

    .cmp-image__figure {
      margin: 0;
    }

    .cmp-image__container {
      background-color: white;
      border-radius: 15px;
      padding: 15px;
      cursor: pointer;
    }

    .cmp-image__container--no-expand {
      cursor: default;
    }

    .cmp-image__img {
      display: block;
      width: 100%;
      height: auto;
      background: white;
    }

    .cmp-image__placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      background: #f5f5f5;
      color: #666;
      font-size: 0.9rem;
      text-align: center;
      padding: 2rem;
    }

    .cmp-image__placeholder-icon {
      font-size: 3rem;
      margin-bottom: 0.5rem;
      opacity: 0.5;
    }

    .cmp-image__skeleton {
      min-height: 200px;
      background: linear-gradient(
        90deg,
        #f0f0f0 25%,
        #e8e8e8 50%,
        #f0f0f0 75%
      );
      background-size: 200% 100%;
      animation: cmp-image-skeleton 1.5s ease-in-out infinite;
    }

    @keyframes cmp-image-skeleton {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .cmp-image__placeholder-img-wrap {
      position: relative;
      min-height: 200px;
    }

    .cmp-image__placeholder-img {
      display: block;
      width: 100%;
      height: auto;
      min-height: 200px;
      object-fit: cover;
      filter: blur(8px);
      opacity: 0.8;
    }

    .cmp-image__img-loading {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      pointer-events: none;
    }

    .cmp-image__figcaption {
      margin-top: 0.75rem;
      font-size: 0.95rem;
      line-height: 1.4;
      color: #333;
    }

    /* Lightbox overlay */
    .cmp-image__lightbox {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      animation: cmp-image-fade-in 0.2s ease;
    }

    @keyframes cmp-image-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .cmp-image__lightbox-backdrop {
      position: absolute;
      inset: 0;
      cursor: pointer;
    }

    .cmp-image__lightbox-content {
      position: relative;
      max-width: 95vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 1;
    }

    .cmp-image__lightbox-img-wrap {
      overflow: hidden;
      max-width: 95vw;
      max-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      user-select: none;
    }

    .cmp-image__lightbox-img-wrap:active {
      cursor: grabbing;
    }

    .cmp-image__lightbox-img {
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
      transition: transform 0.1s ease-out;
    }

    .cmp-image__lightbox-caption {
      margin-top: 1rem;
      padding: 0 1rem;
      color: white;
      text-align: center;
      max-width: 600px;
      font-size: 0.95rem;
    }

    .cmp-image__lightbox-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }

    .cmp-image__lightbox-btn {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      font-size: 1.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .cmp-image__lightbox-btn:hover {
      background: rgba(255, 255, 255, 0.35);
    }

    .cmp-image__lightbox-btn-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 44px;
      height: 44px;
      font-size: 1.5rem;
      background: rgba(255, 255, 255, 0.15);
    }

    .cmp-image__lightbox-zoom-label {
      color: white;
      font-size: 0.9rem;
      min-width: 4rem;
      text-align: center;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this._boundKeydown = this._handleKeydown.bind(this);
  }

  updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('src')) {
      this.loaded = false;
    }
    if (changedProperties.has('expanded')) {
      const wrap = this.querySelector('.cmp-image__lightbox-img-wrap');
      if (this.expanded) {
        wrap?.addEventListener('wheel', this._wheelHandler, { passive: false });
        requestAnimationFrame(() => {
          const closeBtn = this.querySelector<HTMLButtonElement>(
            '.cmp-image__lightbox-btn-close'
          );
          closeBtn?.focus();
        });
      } else {
        wrap?.removeEventListener('wheel', this._wheelHandler);
      }
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._boundKeydown);
  }

  private _boundKeydown: (e: KeyboardEvent) => void;

  private _handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.closeLightbox();
      return;
    }
    if (!this.expanded || e.key !== 'Tab') return;
    const lightbox = this.querySelector('.cmp-image__lightbox-content');
    if (!lightbox || !lightbox.contains(document.activeElement)) return;
    const focusable = Array.from(lightbox.querySelectorAll<HTMLElement>('button'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  private _onImageLoad(): void {
    this.loaded = true;
  }

  openLightbox(): void {
    if (!this.src || this.lightboxDisabled) return;
    this._triggerEl = this.querySelector<HTMLElement>('.cmp-image__container');
    this.expanded = true;
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    document.addEventListener('keydown', this._boundKeydown);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.querySelector('.cmp-image__lightbox-img-wrap')?.removeEventListener(
      'wheel',
      this._wheelHandler
    );
    this.expanded = false;
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    document.removeEventListener('keydown', this._boundKeydown);
    document.body.style.overflow = '';
    if (this._triggerEl) {
      this._triggerEl.focus();
      this._triggerEl = null;
    }
  }

  zoomIn(): void {
    this.zoom = Math.min(this.zoom + 0.25, 4);
  }

  zoomOut(): void {
    this.zoom = Math.max(this.zoom - 0.25, 0.5);
  }

  resetZoom(): void {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
  }

  private _onPanStart(e: MouseEvent | TouchEvent): void {
    if (this.zoom <= 1) return;
    this.isPanning = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    this.startX = clientX;
    this.startY = clientY;
    this.startPanX = this.panX;
    this.startPanY = this.panY;
  }

  private _onPanMove(e: MouseEvent | TouchEvent): void {
    if (!this.isPanning) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    this.panX = this.startPanX + (clientX - this.startX);
    this.panY = this.startPanY + (clientY - this.startY);
  }

  private _onPanEnd(): void {
    this.isPanning = false;
  }

  private _onLightboxClick(e: Event): void {
    if ((e.target as HTMLElement).classList.contains('cmp-image__lightbox-backdrop')) {
      this.closeLightbox();
    }
  }

  private _onLightboxWheel(e: WheelEvent): void {
    if (e.ctrlKey || e.metaKey || this.zoom > 1) {
      e.preventDefault();
      if (e.deltaY < 0) this.zoomIn();
      else if (e.deltaY > 0) this.zoomOut();
    }
  }

  private _onLightboxDblClick(): void {
    this.resetZoom();
  }

  private _onContainerClick(e: Event): void {
    if (!this.src || this.lightboxDisabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    this.openLightbox();
  }

  private _onContainerKeydown(e: KeyboardEvent): void {
    if (!this.src || this.lightboxDisabled) return;
    if (e.key === 'Enter') this.openLightbox();
  }

  render() {
    const figureStyle = `
      max-width: ${this.maxWidth};
      margin-left: auto;
      margin-right: auto;
    `;

    const containerStyle = `
      border-radius: ${this.borderRadius}px;
      border: ${this.borderWidth}px solid ${this.borderColor};
      padding: ${this.padding}px;
    `;

    const imgTransform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    const canExpand = Boolean(this.src) && !this.lightboxDisabled;
    const containerClasses = [
      'cmp-image__container',
      !canExpand ? 'cmp-image__container--no-expand' : '',
      this.hoverShadow && canExpand ? 'util-shadow-hover' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <style>${UgaImage.styles}</style>
      <div class="cmp-image">
        <figure class="cmp-image__figure" style="${figureStyle}">
          <div
            class="${containerClasses}"
            style="${containerStyle}"
            role="${!canExpand ? undefined : 'button'}"
            tabindex="${!canExpand ? -1 : 0}"
            aria-label="${!canExpand ? undefined : 'Click to expand image'}"
            @click="${this._onContainerClick}"
            @keydown="${this._onContainerKeydown}"
          >
            ${!this.src
              ? html`
                  <div class="cmp-image__placeholder">
                    <span class="cmp-image__placeholder-icon" aria-hidden="true">🖼️</span>
                    <span>No image specified</span>
                  </div>
                `
              : !this.loaded
                ? this.placeholder
                  ? html`
                      <div class="cmp-image__placeholder-img-wrap">
                        <img
                          class="cmp-image__placeholder-img"
                          src="${this.placeholder}"
                          alt=""
                          aria-hidden="true"
                        />
                        <img
                          class="cmp-image__img cmp-image__img-loading"
                          src="${this.src}"
                          alt="${this.alt}"
                          loading="lazy"
                          srcset="${this.srcset || nothing}"
                          sizes="${this.sizes || nothing}"
                          @load="${this._onImageLoad}"
                        />
                      </div>
                    `
                  : html`
                      <div class="cmp-image__placeholder-img-wrap">
                        <div class="cmp-image__skeleton"></div>
                        <img
                          class="cmp-image__img cmp-image__img-loading"
                          src="${this.src}"
                          alt="${this.alt}"
                          loading="lazy"
                          srcset="${this.srcset || nothing}"
                          sizes="${this.sizes || nothing}"
                          @load="${this._onImageLoad}"
                        />
                      </div>
                    `
                : html`
                    <img
                      class="cmp-image__img"
                      src="${this.src}"
                      alt="${this.alt}"
                      loading="lazy"
                      srcset="${this.srcset || nothing}"
                      sizes="${this.sizes || nothing}"
                      @load="${this._onImageLoad}"
                    />
                  `}
          </div>
          ${this.caption
            ? html`<figcaption class="cmp-image__figcaption">${this.caption}</figcaption>`
            : ''}
        </figure>

        ${this.expanded
          ? html`
              <div
                class="cmp-image__lightbox"
                role="dialog"
                aria-modal="true"
                aria-label="Expanded image view"
              >
                <div
                  class="cmp-image__lightbox-backdrop"
                  @click="${this._onLightboxClick}"
                ></div>
                <div class="cmp-image__lightbox-content">
                  <button
                    class="cmp-image__lightbox-btn cmp-image__lightbox-btn-close"
                    aria-label="Close"
                    @click="${this.closeLightbox}"
                  >
                    ×
                  </button>
                  <div
                    class="cmp-image__lightbox-img-wrap"
                    @mousedown="${this._onPanStart}"
                    @mousemove="${this._onPanMove}"
                    @mouseup="${this._onPanEnd}"
                    @mouseleave="${this._onPanEnd}"
                    @touchstart="${this._onPanStart}"
                    @touchmove="${this._onPanMove}"
                    @touchend="${this._onPanEnd}"
                    @dblclick="${this._onLightboxDblClick}"
                  >
                    <img
                      class="cmp-image__lightbox-img"
                      src="${this.src}"
                      alt="${this.alt}"
                      srcset="${this.srcset || nothing}"
                      sizes="${this.sizes || nothing}"
                      style="transform: ${imgTransform};"
                      draggable="false"
                    />
                  </div>
                  ${this.caption
                    ? html`<p class="cmp-image__lightbox-caption">${this.caption}</p>`
                    : ''}
                  <div class="cmp-image__lightbox-controls">
                    <button
                      class="cmp-image__lightbox-btn"
                      aria-label="Zoom out"
                      @click="${this.zoomOut}"
                    >
                      −
                    </button>
                    <span class="cmp-image__lightbox-zoom-label">${Math.round(this.zoom * 100)}%</span>
                    <button
                      class="cmp-image__lightbox-btn"
                      aria-label="Zoom in"
                      @click="${this.zoomIn}"
                    >
                      +
                    </button>
                    <button
                      class="cmp-image__lightbox-btn"
                      aria-label="Reset zoom"
                      @click="${this.resetZoom}"
                    >
                      ⟲
                    </button>
                  </div>
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }
}
