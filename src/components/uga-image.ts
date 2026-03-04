import { LitElement, html, css } from 'lit';
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

  @state() private expanded = false;
  @state() private zoom = 1;
  @state() private panX = 0;
  @state() private panY = 0;
  private isPanning = false;
  private startX = 0;
  private startY = 0;
  private startPanX = 0;
  private startPanY = 0;

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
      margin: auto;
      border-radius: 15px;
      padding: 15px;
      cursor: pointer;
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }

    .cmp-image__container:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .cmp-image__img {
      display: block;
      width: 100%;
      height: auto;
      background: white;
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

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._boundKeydown);
  }

  private _boundKeydown: (e: KeyboardEvent) => void;

  private _handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.closeLightbox();
    }
  }

  openLightbox(): void {
    if (!this.src) return;
    this.expanded = true;
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    document.addEventListener('keydown', this._boundKeydown);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.expanded = false;
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    document.removeEventListener('keydown', this._boundKeydown);
    document.body.style.overflow = '';
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

  render() {
    const containerStyle = `
      max-width: ${this.maxWidth};
      border-radius: ${this.borderRadius}px;
      border: ${this.borderWidth}px solid ${this.borderColor};
      padding: ${this.padding}px;
    `;

    const imgTransform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;

    return html`
      <style>${UgaImage.styles}</style>
      <div class="cmp-image">
        <figure class="cmp-image__figure">
          <div
            class="cmp-image__container"
            style="${containerStyle}"
            role="button"
            tabindex="0"
            aria-label="Click to expand image"
            @click="${this.openLightbox}"
            @keydown="${(e: KeyboardEvent) => e.key === 'Enter' && this.openLightbox()}"
          >
            <img
              class="cmp-image__img"
              src="${this.src}"
              alt="${this.alt}"
              loading="lazy"
            />
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
                  >
                    <img
                      class="cmp-image__lightbox-img"
                      src="${this.src}"
                      alt="${this.alt}"
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
