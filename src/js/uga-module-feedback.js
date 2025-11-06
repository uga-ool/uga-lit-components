import { LitElement, html, css } from 'lit';
import { debounce } from '../utils/dom.js';
import { SCROLL_OFFSET } from '../utils/constants.js';
import { track } from '../services/telemetry.js';

export const UGAComponentsLoaded = true;

class UgaModuleFeedback extends LitElement {
  static get properties() {
    return {
      parentUrl: { type: String },
      encodedParentUrl: { type: String },
      loaded: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.parentUrl = null;
    this.encodedParentUrl = null;
    this.loaded = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this.parentUrl = this.getParentUrl();
    this.encodedParentUrl = this.getEncodedParentUrl();
    this.loaded = true;
  }

  /******
   * Other functions go here
   */
  getParentUrl() {
    const currentLocation = window.parent.parent.location;
    const url = currentLocation.href;
    return url;
  }

  getEncodedParentUrl() {
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
          <div class="obj-grid">
            <div class="obj-grid__full">
              <div class="util-pad-all-xl">
                <h1 class="cmp-heading-2">Module Feedback Form</h1>
                <iframe
                  src="https://ugeorgia.ca1.qualtrics.com/jfe/form/SV_a4BRev9rAxLhSJ0?ParentUrl=${this
                    .encodedParentUrl}"
                  allowfullscreen="allowfullscreen"
                  class="cmp-qualtrics"
                ></iframe>
              </div>
            </div>
          </div>
        `
      : html``;
  }
}

customElements.define("uga-module-feedback", UgaModuleFeedback);
