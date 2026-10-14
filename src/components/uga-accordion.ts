import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { loadData } from '../lib/data/data-loader.js';

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

let accordionCount = 0;

@customElement('uga-accordion')
class UgaAccordion extends LitElement {

  @property({ type: Object }) accordionData: AccordionData = { title: '', data: [] };
  @property({ type: String }) allState = 'Open';
  @property({ type: String }) type = '';
  @property({ type: String }) filename = '';
  @property({ type: String }) program = '';
  @state() loaded = false;

  private readonly uid = `uga-accordion-${++accordionCount}`;

  createRenderRoot() {
    return this;
  }

  async init(): Promise<void> {
    await this.getDataFile();
  }

  async getDataFile(): Promise<void> {
    if (this.type !== 'local' && this.type !== 'program') {
      return;
    }
    if (this.type === 'program' && !this.program) {
      return;
    }
    this.accordionData = await loadData<AccordionData>(
      this.type,
      this.filename,
      this.program || undefined
    );
    this.loaded = true;
    this.requestUpdate();
  }

  render() {
    if (this.loaded) {
      for (let i in this.accordionData.data) {
        if (this.accordionData.data[i]['ariaExpanded'] == undefined) {
          this.accordionData.data[i]['ariaExpanded'] = false;
          this.accordionData.data[i]['ariaHidden'] = true;
        }
      }
      
      return html`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <button class="cmp-button cmp-accordion-toggle-all js-toggle-all" aria-controls="${this.uid}" @click="${this.allToggle}">${this.allState} All</button>
      <dl id="${this.uid}" class="cmp-accordion">
        ${this.accordionData.data.map(
          (item, i) => html`
          <dt>
            <button id="${this.uid}-button-${i}" class="cmp-accordion__button js-toggler" aria-expanded="${item.ariaExpanded}" aria-controls="${this.uid}-panel-${i}" @click="${() => this.toggleItem(i)}">
              ${item.title}
              <span class="icon"></span>
            </button>
          </dt>
          <dd id="${this.uid}-panel-${i}" class="cmp-accordion__content" aria-labelledby="${this.uid}-button-${i}" aria-hidden="${item.ariaHidden}">
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

  toggleItem(index: number): void {
    const item = this.accordionData.data[index];
    if (item) {
      item['ariaHidden'] = !item['ariaHidden'];
      item['ariaExpanded'] = !item['ariaExpanded'];
      this.requestUpdate();
    }
  }
}