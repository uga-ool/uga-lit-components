import {LitElement, html, css} from 'lit';

class UgaSlideshow extends LitElement {

  static get properties() {
    return {
      slideshowTitle: {type: String},
      slideshowId: {type: String},
      slideshowDescription: {type: String},
      slideshowData: {type: Object},
      filename: {type: String},
      activeImage: {type: Number},
      imageHeight: {type: String},
      initialLoadHeight: {type: String},
      loaded: {type: Boolean}
    }
  }

  constructor() {
    super();
    this.slideshowData = {}
    this.slideshowTitle = "Loading"
    this.filename = null
    this.slideshowDescription = null
    this.slideshowId = null
    this.activeImage = 0
    this.imageHeight = "500"
    this.initialLoadHeight = "700"
    this.loaded = false
  }

  connectedCallback() {
    super.connectedCallback()
    this.getDataFile().then((dataFile) => {
      this.addData(dataFile)
      this.loaded = true
    }) 
  }

  static styles = css`
    .cmp-slide {
      position: relative;
      order: -1;
    }

    .cmp-slide__controls {
      width: 100%;
      display: flex;
      justify-content: space-between;
      position: absolute;
      top: 45%;
      z-index: 100;
    }

    .cmp-slide__image {
      width: 100%;
      object-fit: cover;
      z-index: 99;
    }

    .cmp-slide__container {
      overflow: hidden;
      position: relative;
    }

    .cmp-slide__button {
      width: 50px;
      height: 70px;
      padding: 10px;
      border: none;
      cursor: pointer;
      background-color: #fff;
      font-size: 36px;
      opacity: 50%;
    }

    .cmp-slide__button:hover {
      background-color: #dedede;
    }
    
    .cmp-slide__button-next {
      border-radius: 3px 0 0 3px;
    }

    .cmp-slide__button-prev {
      border-radius: 0 3px 3px 0;      
    }

    .cmp-slide__dots {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .cmp-slide__dot {
      cursor: pointer;
      height: 20px;
      width: 20px;
      background-color: #DEDEDE;
      border-radius: 50%;
      border: none;
      display: inline-block;
      transition: background-color 0.6s ease;
    }

    .cmp-slide__dot-active {
      background-color: #9EA2A2;
    }

    .cmp-slide__dot:hover {
      background-color: #e4002b;
    }

    /* Fading animation */
    .fade {
      -webkit-animation-name: fade;
      -webkit-animation-duration: 1.5s;
      animation-name: fade;
      animation-duration: 1.5s;
    }
    @-webkit-keyframes fade {
      from {
        opacity: .4
      }
      to {
        opacity: 1
      }
    }
    @keyframes fade {
      from {
        opacity: .4
      }
      to {
        opacity: 1
      }
    }
  `

  async getDataFile() {
    let dataFile = await axios.get(this.filename)
    return dataFile
  }

  addData(dataFile) {
    this.slideshowTitle = dataFile.data.title
    this.slideshowDescription = dataFile.data.description
    this.slideshowId = dataFile.data.id
    this.slideshowData = dataFile.data.data
  }

  decrementActive() {
    if (this.activeImage == 0) {
      this.activeImage = this.slideshowData.length-1
    } else {
      this.activeImage = this.activeImage - 1 
    }
  }

  incrementActive() {
    if (this.activeImage == this.slideshowData.length-1) {
      this.activeImage = 0
    } else {
      this.activeImage = this.activeImage + 1
    }
  }

  jumpToItem(id) {
    this.activeImage = parseInt(id)
  }

  render() {
    if(this.loaded) {

      let count = 0


      for (let i in this.slideshowData) {
        this.slideshowData[i]['id'] = i

        if (count == this.activeImage) {
          this.slideshowData[i]['displayClass'] = "";
          this.slideshowData[i]['fadeClass'] = "fade";
        } else {
          this.slideshowData[i]['displayClass'] = "util-visually-hidden";
          this.slideshowData[i]['fadeClass'] = "";
        }
        count += 1
      }

      let images = this.slideshowData.map((image) => html`
          <div class="cmp-slide ${image.displayClass}" aria-hidden="${this.activeImage == image.id ? false : true}">
            <div class="cmp-slide__container" style="max-height:${this.imageHeight}px;">
              <div class="cmp-slide__controls">
                <button type="button" alt="Previous Image" class="cmp-slide__button cmp-slide__button-prev" @click="${this.decrementActive}">&#10094;</button>
                <button type="button" alt="Next Image" class="cmp-slide__button cmp-slide__button-next" @click="${this.incrementActive}">&#10095;</button>
              </div>
              <img class="cmp-slide__image ${image.fadeClass}" src="${image.src}" alt="${image.alt}" id="${image.id}"/>
            </div>
            <div class="cmp-slide__dots util-margin-bottom-md">
              ${this.slideshowData.map((image) => html`
                ${this.activeImage == image.id ? html`<button type="button" alt="image_${image.id}" class="cmp-slide__dot cmp-slide__dot-active util-margin-top-lg util-margin-horiz-sm"></button>` : html`<button type="button" alt="image_${image.id}" class="cmp-slide__dot util-margin-top-lg util-margin-horiz-sm" @click="${() => this.jumpToItem(image.id)}"></button>`}
              `)}
            </div>
            <div class="cmp-slide__content">
              <h2 class="cmp-heading-4 util-text-center">${image.title}</h2>
              <p>${unsafeHTML(image.description)}</p>
            </div>
          </div>
        `)

      return html`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="cmp-slideshow">
          <h1 class="cmp-heading-1 util-text-center">${this.slideshowTitle}</h1>
          ${images}
        </div>
      `
    } else {
      return html`<div style="min-height: ${this.initialLoadHeight}px"></div>`
    }
  }
}


customElements.define('uga-slideshow', UgaSlideshow)
