import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';

// Prism is available globally
declare const Prism: any;


@customElement('uga-code')
class UgaCode extends LitElement {
  @property({ type: String }) filename = '';
  @property({ type: String }) language = '';
  @property({ type: String }) code = '';

  createRenderRoot() {
    return this;
  }

  updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('filename')) {
      this.fetchCode();
    }
    if (changedProperties.has('code') || changedProperties.has('language')) {
      this.updateComplete.then(() => {
        this.runExternalScripts();
      });
    }
  }

  fetchCode(): void {
    if (this.filename) {
      fetch(this.filename)
        .then(response => response.text())
        .then(code => {
          this.code = code.trim();
        })
        .catch(error => console.error('Error fetching code:', error));
    }
  }

  copyCode(): void {
    const codeElement = this.querySelector('code');
    const code = codeElement?.textContent || '';

    navigator.clipboard.writeText(code).then(() => {
      const button = this.querySelector('button');
      if (button) {
        button.innerHTML = copiedIcon as unknown as string;

        setTimeout(() => {
          button.innerHTML = copyIcon as unknown as string;
        }, 2000);
      }
    }).catch((err) => {
      console.error('Failed to copy text: ', err);
    });
  }

  runExternalScripts(): void {
    // Prism is loaded and globally available in Brightspace
    Prism.highlightAllUnder(this);
  }

  render() {
    return html`
      <div class="cmp-code">
		<div class="cmp-code__container util-color-light-gray">
			<div class="obj-grid">
				<div class="obj-grid__12-12 util-background-sanford util-color-white util-pad-horiz-lg util-pad-vert-xs">
					<span class="util-margin-bottom-none util-margin-top-xs cmp-code__language-name">${this.language.charAt(0).toUpperCase() + this.language.slice(1)}</span>
					<button class="util-background-sanford util-color-light-gray util-pad-vert-xs util-pad-horiz-sm" @click="${this.copyCode}">
					${copyIcon}
					</button>
            	</div>
            	<div class="obj-grid__12-12 util-pad-left-lg util-pad-vert-md">
              		<pre><code class="language-${this.language}">${this.code}</code></pre>
            	</div>
          	</div>
        </div>
      </div>
    `;
  }
}

const copyIcon = html`
  <svg class="util-margin-right-xs" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-sm">
    <path fill="currentColor" fill-rule="evenodd" d="M7 5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h2zm2 2h5a3 3 0 0 1 3 3v5h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1zM5 9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1z" clip-rule="evenodd"></path>
  </svg>
  Copy Code
`;

const copiedIcon = html`
  <svg class="util-margin-right-xs" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-sm">
    <path fill="currentColor" fill-rule="evenodd" d="M20.285 6.288a1 1 0 0 1 0 1.414l-9 9a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 1 1 1.414-1.414L11 14.586l8.293-8.292a1 1 0 0 1 1.414 0z" clip-rule="evenodd"></path>
  </svg>
  Copied
`;
