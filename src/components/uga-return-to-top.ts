import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';


@customElement('uga-return-to-top')
class UgaReturnToTop extends LitElement {
  static styles = css``;

  // Light DOM: render into the page directly (D2L-friendly)
  createRenderRoot() {
    return this;
  }

  // Light DOM styles injected into the page
  private styleTag() {
    return html`<style>
      uga-return-to-top {
        position: fixed;
        right: 20px;
        bottom: 20px;
        width: 50px;
        height: 50px;
        background-color: rgba(0, 0, 0, 100);
        color: #FFFFFF;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 24px;
        text-align: center;
        line-height: 50px;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      uga-return-to-top button {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        width: 100%;
        height: 100%;
      }
    </style>`;
  }

  constructor() {
    super();
    this._scrollToTop = this._scrollToTop.bind(this);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this._scrollToTop);
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this._scrollToTop);
    super.disconnectedCallback();
  }

  _scrollToTop(): void {
    const scrollBehavior: ScrollToOptions = { top: 0, behavior: 'smooth' };

    // Check if the window is inside an iframe and determine where to scroll
    try {
      if (window.self !== window.top) {
        // We are inside an iframe, check the scroll height of the parent
        const parentDoc = window.parent.document;
        const parentScrollTop = parentDoc.documentElement.scrollTop || parentDoc.body.scrollTop;

        if (parentScrollTop > 0) {
          // Scroll the parent window
          window.parent.scrollTo(scrollBehavior);
        } else {
          // Scroll the iframe itself
          window.scrollTo(scrollBehavior);
        }
      } else {
        // Not in an iframe, scroll the current window
        window.scrollTo(scrollBehavior);
      }
    } catch (e) {
      // If any error occurs (e.g., cross-origin), fallback to scrolling the current window
      window.scrollTo(scrollBehavior);
    }
  }

  render() {
    return html`
      ${this.styleTag()}
      <button aria-label="Return to top">⇧</button>
    `;
  }
}
