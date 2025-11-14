import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
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

  async connectedCallback() {
    super.connectedCallback();
    // Kick off data load once when the element connects
    // Avoid side-effects in render()
    await this.getData();
  }

  async getData(): Promise<void> {
    if (this.type === 'local' || this.type === 'program') {
      const data = await loadData<AccordionData>(this.type, this.filename, this.program);
      this.accordionData = data;
      this.loaded = true;
      this.requestUpdate();
    }
  }

  render() {
    if (this.loaded) {
      for (let i in this.accordionData.data) {
        if (this.accordionData.data[i]['id'] === undefined) {
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
            <button id="${item.id ?? ''}" class="cmp-accordion__button js-toggler" aria-expanded="${item.ariaExpanded ?? false}" @click="${() => this.toggleItem(item)}">${item.title}</button>
          </dt>
          <dd class="cmp-accordion__content" aria-labelledby="${item.id ?? ''}" aria-hidden="${item.ariaHidden ?? true}">
            ${unsafeHTML(item.body)}
          </dd>
          `
        )}
      </dl>
      `
    }
    // Not loaded yet: render a minimal placeholder
    return html`<p>Loading...</p>`;
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
    if (item.id !== undefined) {
      const index = parseInt(item.id, 10);
      this.accordionData.data[index]['ariaHidden'] = !item['ariaHidden'];
      this.accordionData.data[index]['ariaExpanded'] = !item['ariaExpanded'];
      this.requestUpdate();
    }
  }
}