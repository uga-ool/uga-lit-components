import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { loadData } from '../lib/data/data-loader.js';


interface FooterData {
  link: string;
  alt: string;
}

interface FooterResponse {
  data: FooterData;
}

@customElement('uga-footer')
class UgaFooter extends LitElement {

  @property({ type: String }) type = '';
  @property({ type: String }) filename = '';
  @property({ type: String }) imagefile = '';
  @property({ type: String }) program = '';
  @property({ type: Boolean }) loaded = false;

  private footerData: FooterData = { link: '', alt: '' };

  createRenderRoot() {
    return this;
  }

  async init(): Promise<void> {
    await this.getDataFile();
  }
  
  async getDataFile(): Promise<void> {
    if (this.type === 'local' || this.type === 'program') {
      const dataFile = await loadData<{ data: FooterData }>(this.type, this.type === 'program' ? 'footer.json' : this.filename, this.program);
      this.footerData = dataFile.data;
      this.loaded = true;
      this.requestUpdate();
    }
  }	render() {
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