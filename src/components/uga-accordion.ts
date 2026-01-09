import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

// Axios is available globally in eLC
declare const axios: any;

interface AccordionItem {
  id?: string;
  title: string;
  body: string;
  ariaExpanded?: boolean;
  ariaHidden?: boolean;
}

interface AccordionData {
  title: string;
  data: AccordionItem[];
}

@customElement('uga-accordion')
class UgaAccordion extends LitElement {

  @property({ type: Object }) accordionData: AccordionData = { title: '', data: [] };
  @property({ type: Boolean }) ariaHiddenAll = false;
  @property({ type: String }) allState = 'Open';
  @property({ type: String }) type = '';
  @property({ type: String }) filename = '';
  @property({ type: String }) program = '';
  @property({ type: Boolean }) loaded = false;

  createRenderRoot() {
    return this;
  }

  async init(): Promise<void> {
    await this.getDataFile();
  }

  async getDataFile(): Promise<void> {
    if (this.type === 'local') {
      const dataFile = await axios.get(this.filename);
      this.accordionData = dataFile.data;
      this.loaded = true;
      this.requestUpdate();
    } else if (this.type === 'program') {
      const dataFile = await axios.get('/shared/ugaonline/templates/' + this.program + '/data/' + this.filename);
      this.accordionData = dataFile.data;
      this.loaded = true;
      this.requestUpdate();
    }
  }

  render() {
    if (this.loaded) {
      for (let i in this.accordionData.data) {
        if (this.accordionData.data[i]['id'] == undefined) {
          this.accordionData.data[i]['id'] = i;
          this.accordionData.data[i]['ariaExpanded'] = false;
          this.accordionData.data[i]['ariaHidden'] = true;
        }
      }
      
      return html`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <button class="cmp-button cmp-accordion-toggle-all js-toggle-all" aria-controls="${this.accordionData.title}" aria-hidden="${this.ariaHiddenAll}" @click="${this.allToggle}">${this.allState} All</button>
      <dl id="${this.accordionData.title}" class="cmp-accordion">
        ${this.accordionData.data.map(
          (item) => html`
          <dt>
            <button id="${item.id}" class="cmp-accordion__button js-toggler" aria-expanded="${item.ariaExpanded}" @click="${() => this.toggleItem(item)}">
              ${item.title}
              <span class="icon"></span>
            </button>
          </dt>
          <dd class="cmp-accordion__content" aria-labelledby="${item.id}" aria-hidden="${item.ariaHidden}">
            ${unsafeHTML(item.body)}
          </dd>
          `
        )}
      </dl>
      `;
    } else {
      this.init();
    }
  }

  allToggle(): void {
    this.ariaHiddenAll = !this.ariaHiddenAll;

    if (this.allState === "Open") {
      this.allState = "Close";
      for (let i in this.accordionData.data) {
        this.accordionData.data[i]['ariaHidden'] = false;
        this.accordionData.data[i]['ariaExpanded'] = true;
      }
    } else {
      this.allState = "Open";
      for (let i in this.accordionData.data) {
        this.accordionData.data[i]['ariaHidden'] = true;
        this.accordionData.data[i]['ariaExpanded'] = false;
      }
    }
    
    this.requestUpdate();
  }

  toggleItem(item: AccordionItem): void {
    const index = this.accordionData.data.findIndex(i => i.id == item.id);
    if (index !== -1) {
      this.accordionData.data[index]['ariaHidden'] = !item['ariaHidden'];
      this.accordionData.data[index]['ariaExpanded'] = !item['ariaExpanded'];
      this.requestUpdate();
    }
  }
}