import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';


@customElement('uga-module-feedback')
class UgaModuleFeedback extends LitElement {
  // Light DOM: render into the page directly (eLC-friendly)
  createRenderRoot() {
    return this;
  }
  @property({ type: String }) parentUrl: string | null = null;
  @property({ type: String }) encodedParentUrl: string | null = null;
  @property({ type: Boolean }) loaded = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.parentUrl = this.getParentUrl();
    this.encodedParentUrl = this.getEncodedParentUrl();
    this.loaded = true;
  }

  /******
   * Other functions go here
   */
  getParentUrl(): string {
    const currentLocation = window.parent.parent.location;
    const url = currentLocation.href;
    return url;
  }

  getEncodedParentUrl(): string | null {
    if (this.parentUrl) {
      return encodeURIComponent(this.parentUrl);
    }
    return null;
  }

  static get styles() {
    return css`
      .cmp-qualtrics {
        width: 100%;
        min-height: 600px;
        height: 70vh;
        max-height: 1200px;
        border: none;
        overflow: auto;
      }

      .cmp-heading-2 {
        color: currentColor;
        font-family: "Oswald", sans-serif;
        font-size: 2.25em;
        font-weight: normal;
        line-height: 1.15;
        text-transform: uppercase;
        margin: 1em 0;
        position: relative;
      }
      .cmp-heading-2:first-child {
        margin-top: 10px;
      }
      .cmp-heading-2::after {
        content: "";
        display: block;
        height: 0.125rem;
        width: 3rem;
        position: absolute;
        top: calc(100% + 0.125rem);
        -webkit-print-color-adjust: exact;
        background-color: #ba0c2f;
      }
    `;
  }

  render() {
    return this.loaded
      ? html`
          <style>
            uga-module-feedback .cmp-qualtrics {
              width: 100%;
              min-height: 600px;
              height: 70vh;
              max-height: 1200px;
              border: none;
              overflow: auto;
            }
            uga-module-feedback .cmp-heading-2 {
              color: currentColor;
              font-family: "Oswald", sans-serif;
              font-size: 2.25em;
              font-weight: normal;
              line-height: 1.15;
              text-transform: uppercase;
              margin: 1em 0;
              position: relative;
            }
            uga-module-feedback .cmp-heading-2:first-child {
              margin-top: 10px;
            }
            uga-module-feedback .cmp-heading-2::after {
              content: "";
              display: block;
              height: 0.125rem;
              width: 3rem;
              position: absolute;
              top: calc(100% + 0.125rem);
              -webkit-print-color-adjust: exact;
              background-color: #ba0c2f;
            }
          </style>
          <div class="obj-grid">
            <div class="obj-grid__full">
              <div class="util-pad-all-xl">
                <h2 class="cmp-heading-2">Module Feedback Form</h2>
                <iframe
                  src="https://ugeorgia.ca1.qualtrics.com/jfe/form/SV_a4BRev9rAxLhSJ0?ParentUrl=${this
                    .encodedParentUrl}"
                  ?allowfullscreen=${true}
                  class="cmp-qualtrics"
                ></iframe>
              </div>
            </div>
          </div>
        `
      : html``;
  }
}
