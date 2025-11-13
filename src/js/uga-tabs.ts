import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

// Axios is available globally in Brightspace
declare const axios: any;

export const UGAComponentsLoaded = true;

interface Tab {
  title: string;
  body: string;
}

@customElement('uga-tabs')
class UgaTabs extends LitElement {

  @property({ type: Array }) tabs: Tab[] = [];
  @property({ type: String }) type = '';
  @property({ type: String }) filename = '';
  @property({ type: String }) program = '';
  @property({ type: Boolean }) loaded = false;

  private activeTab = 0;

  createRenderRoot() {
    return this;
  }

  setActiveTab(index: number): void {
    this.activeTab = index;
    this.requestUpdate();
  }

  async init(): Promise<void> {
    await this.getDataFile();
  }
  
  async getDataFile(): Promise<void> {
    let dataFile;
    if (this.type === 'local') {
      dataFile = await axios.get(this.filename);
    } else if (this.type === 'program') {
      dataFile = await axios.get('/shared/ugaonline/templates/' + this.program + '/data/' + this.filename);
    }
    if (dataFile) {
      this.tabs = dataFile.data.data;
      this.loaded = true;
      this.requestUpdate();
    }
  }

  render() {
		if (this.loaded) {
		  return html`
			<div class="cmp-tabs">
			  <div class="cmp-tabs__nav" role="tablist">
				${Array.isArray(this.tabs) && this.tabs.length > 0 ? this.tabs.map((tab, index) => html`
				<button class="cmp-tabs__nav-item ${this.activeTab === index ? 'cmp-tabs__nav-item--active' : ''}"
						data-tab="tab-${index}"
						role="tab"
						tabindex="${this.activeTab === index ? '0' : '-1'}"
						aria-selected="${this.activeTab === index ? 'true' : 'false'}"
						aria-controls="tab-${index}"
						@click="${() => this.setActiveTab(index)}">
				  ${tab.title}
				</button>
				`) : ''}
			  </div>
			  <div class="cmp-tabs__content">
				${Array.isArray(this.tabs) && this.tabs.length > 0 ? this.tabs.map((tab, index) => html`
				<div class="cmp-tabs__content-item ${this.activeTab === index ? 'cmp-tabs__content-item--active' : ''}"
					 id="tab-${index}"
					 role="tabpanel"
					 aria-labelledby="tab-${index}">
				  <p>${unsafeHTML(tab.body)}</p>
				</div>
				`) : ''}
			  </div>
			</div>
		  `;
		} else {
		  this.init();
		}
	  }
	}