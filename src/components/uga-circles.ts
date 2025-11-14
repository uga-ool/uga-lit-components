import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { loadData } from '../lib/data/data-loader.js';


interface CircleData {
	figure: string;
	caption: string;
}

interface CirclesResponse {
	data: CircleData[];
}

@customElement('uga-circles')
class UgaCircles extends LitElement {

	@property({ type: String }) type = '';
	@property({ type: String }) filename = '';
	@property({ type: String }) program = '';
	@property({ type: Boolean }) loaded = false;

	private circles: CircleData[] = [];

	createRenderRoot() {
		return this;
	}

	constructor() {
		super();
	}

  async init(): Promise<void> {
    await this.getDataFile();
  }
  
  async getDataFile(): Promise<void> {
    if (this.type === 'local' || this.type === 'program') {
      const dataFile = await loadData<CirclesResponse>(this.type, this.filename, this.program);
      this.circles = dataFile.data;
      this.loaded = true;
      this.requestUpdate();
    }
  }	getWideGridClass(count: number): string {
		switch (count) {
		  case 1:
			return 'obj-grid__12-12';
		  case 2:
			return 'obj-grid__6-12';
		  case 3:
			return 'obj-grid__4-12';
		  case 4:
			return 'obj-grid__3-12';
		  default:
			return 'obj-grid__12-12';
		}
	}

	getNarrowGridClass(count: number): string {
		switch (count) {
		  case 1:
			return 'obj-grid__12-12';
		  case 2:
			return 'obj-grid__6-12';
		  case 3:
			return 'obj-grid__6-12';
		  case 4:
			return 'obj-grid__6-12';
		  default:
			return 'obj-grid__12-12';
		}
	}

	render() {
		if (this.loaded) {
			const wideGridClass = this.getWideGridClass(this.circles.length);
			const narrowGridClass = this.getNarrowGridClass(this.circles.length);
			return html`
			  <div class="obj-grid obj-grid--gap-lg">
				${this.circles.map(circle => html`
				  <div class="${narrowGridClass} ${wideGridClass}@md util-align-center">
					<div class="circle-info">
					  <span class="circle-info__number">${circle.figure}</span>
					  <span class="circle-info__label">${circle.caption}</span>
					</div>
				  </div>
				`)}
			  </div>
			`;
		} else {
		  this.init();
		}
	}
}