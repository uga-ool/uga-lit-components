import { LitElement, html, css } from 'lit';
import { debounce } from '../utils/dom.js';
import { SCROLL_OFFSET } from '../utils/constants.js';
import { track } from '../services/telemetry.js';

export const UGAComponentsLoaded = true;

class UgaFooter extends LitElement {

	createRenderRoot() {
	  return this;
	}

	static get properties() {
		return {
		  type: {type: String},
		  filename: {type: String},
		  imagefile: {type: String},
		  program: {type: String},
		  loaded: {type: Boolean}
		}
	}

	constructor() {
		super();
		this.program = "";
		this.footerData = {};
		this.loaded = false;
	}

	async init() {
		await this.getDataFile()
	}
	
	async getDataFile() {
		let dataFile;
		if (this.type == 'local') {
			dataFile = await axios.get(this.filename);
		} else if (this.type == 'program') {
			dataFile = await axios.get('/shared/ugaonline/templates/' + this.program + '/data/footer.json');
		}
		this.footerData = dataFile.data.data;
		this.loaded = true;
		this.requestUpdate();
	}

	render() {
		if (this.loaded) {
			return html`
			<footer class="cmp-site-footer">
  				<div class="cmp-site-footer__container">
    				<div class="cmp-site-footer__logo">
						<a class="cmp-footer__logo-link" target="_blank" href="${this.footerData.link}">
						${this.type === 'program' ? html`
							<img src="/shared/ugaonline/templates/${this.program}/img/${this.imagefile}" class="util-display-none@print" alt="${this.footerData.alt}">
						` : html`
							<img src="${this.imagefile}" class="util-display-none@print" alt="${this.footerData.alt}">
						`}
						</a>
				  	</div>
				</div>
			</footer>
		  `;
		} else {
		  this.init();
		}
	  }
	}

customElements.define('uga-footer', UgaFooter)