import { LitElement, html, css } from 'lit';
import { debounce } from '../utils/dom.js';
import { SCROLL_OFFSET } from '../utils/constants.js';
import { track } from '../services/telemetry.js';

export const UGAComponentsLoaded = true;

class UgaTabs extends LitElement {

	createRenderRoot() {
	  return this;
	}

	static get properties() {
		return {
		  tabs: {type: Array},
		  type: {type: String},
		  filename: {type: String},
		  program: {type: String},
		  loaded: {type: Boolean}
		}
	}

	constructor() {
		super();
		this.program = "";
		this.tabs = [];
		this.activeTab = 0;
		this.loaded = false;
	}

	setActiveTab(index) {
		this.activeTab = index;
		this.requestUpdate();
	  }

	async init() {
		await this.getDataFile()
	}
	
	async getDataFile() {
		let dataFile;
		if (this.type == 'local') {
			dataFile = await axios.get(this.filename);
		} else if (this.type == 'program') {
			dataFile = await axios.get('/shared/ugaonline/templates/' + this.program + '/data/' + this.filename);
		}
		this.tabs = dataFile.data.data;
		this.loaded = true;
		this.requestUpdate();
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

customElements.define('uga-tabs', UgaTabs)