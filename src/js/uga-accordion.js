import {LitElement, html, css} from 'lit';

class UgaAccordion extends LitElement {

  createRenderRoot() {
    return this;
  }

  static get properties() {
    return {
      accordionData: {type: Object},
      ariaHiddenAll: {type: Boolean},
      allState: {type: String},
      type: {type: String},
      filename: {type: String},
      program: {type: String},
      loaded: {type: Boolean}
    }
  }

  constructor() {
    super();
    this.ariaHiddenAll = false;
    this.allState = "Open";
    this.program = "";
    this.accordionData = {};
    this.loaded = false;
  }

  async init() {
    await this.getDataFile()
  }

  async getDataFile() {
    if (this.type == 'local') {
      const dataFile = await axios.get(this.filename)
      this.accordionData = dataFile.data
      this.loaded = true
      this.requestUpdate()
    } else if (this.type == 'program') {
      const dataFile = await axios.get('/shared/ugaonline/templates/' + this.program + '/data/' + this.filename)
      this.accordionData = dataFile.data
      this.loaded = true
      this.requestUpdate()
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
      <button class="cmp-button cmp-accordion-toggle-all js-toggle-all" aria-controls="${this.accordionData.title}" aria-hidden="${this.ariaHiddenAll}" @click="${this.allToggle}">${this.allState} All</button>
      <dl id="${this.accordionData.title}" class="cmp-accordion">
        ${this.accordionData.data.map(
          (item) => html`
          <dt>
            <button id="${item.id}" class="cmp-accordion__button js-toggler" aria-expanded="${item.ariaExpanded}" @click="${() => this.toggleItem(item)}">${item.title}</button>
          </dt>
          <dd class="cmp-accordion__content" aria-labelledby="${item.id}" aria-hidden="${item.ariaHidden}">
            ${unsafeHTML(item.body)}
          </dd>
          `
        )}
      </dl>
      `
    } else {
      this.init()
    }
  }

  allToggle() {
    this.ariaHiddenAll = !this.ariaHiddenAll;

    if (this.allState == "Open") {
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
    
    this.requestUpdate()
  }

  toggleItem(item) {
    this.accordionData.data[item.id]['ariaHidden'] = !item['ariaHidden']
    this.accordionData.data[item.id]['ariaExpanded'] = !item['ariaExpanded']
    this.requestUpdate()
  }
}

customElements.define('uga-accordion', UgaAccordion)