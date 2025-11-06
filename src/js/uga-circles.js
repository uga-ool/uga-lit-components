import {LitElement, html, css} from 'lit';

class UgaCircles extends LitElement {

	createRenderRoot() {
	  return this;
	}

	static get properties() {
		return {
		  type: {type: String},
		  filename: {type: String},
		  program: {type: String},
		  loaded: {type: Boolean}
		}
	}

	constructor() {
		super();
		this.program = "";
		this.circles = [];
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
			dataFile = await axios.get('/shared/ugaonline/templates/' + this.program + '/data/' + this.filename);
		}
		this.circles = dataFile.data.data;
		this.loaded = true;
		this.requestUpdate();
	}

	getWideGridClass(count) {
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

	getNarrowGridClass(count) {
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
			console.log(this.circles)
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

customElements.define('uga-circles', UgaCircles)