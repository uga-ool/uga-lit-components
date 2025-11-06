import { LitElement, html, css } from 'lit';
import { debounce } from '../utils/dom.js';
import { SCROLL_OFFSET } from '../utils/constants.js';
import { track } from '../services/telemetry.js';

export const UGAComponentsLoaded = true;

class UgaDueDate extends LitElement {
  static get properties() {
    return {
      versions: {type: Object},
      ou: {type: String},
      name: {type: String},
      assignmentData: {type: Object},
      dueDate: {type: String},
      studentRoles: {type: Array},
      loaded: {type: Boolean}
    }
  }

  constructor() {
    super();
    this.versions = {};
    this.assignmentData = {}
    this.ou = null
    this.dueDate = "LOADING"
    this.loaded = false
  }

  connectedCallback() {
    super.connectedCallback();
    this.ou = this.getCourse();
    this.getVersions().then((versions) => {
      this.addVersions(versions)

      this.getAssignments().then((assignments) => {
        this.findAssignment(assignments)
        console.log(this.dueDate)
        this.loaded = true
        this.requestUpdate()

      });  // End Find Assignments

    });  // End Get Versions
  }

  /******
   * API Calls Go Here
   */

   async getVersions() {
    const apiVer = await axios.get('/d2l/api/versions/');
    let result = {}
    for (let i in apiVer.data) {
      result[apiVer.data[i].ProductCode] = apiVer.data[i].LatestVersion
    }
    return result
  }

  async getAssignments() {
    const assignments = await axios.get('/d2l/api/le/' + this.versions.le + '/' + this.ou + '/dropbox/folders/');
    return assignments
  }

  /******
   * API Response Handlers go Here
   */

  addVersions(apiVersions) {
    for (let i in apiVersions) {
      this.versions[i] = apiVersions[i]
    }
  }

  findAssignment(assignments) {
    let assignmentFound = false
    for (let i in assignments.data) {
      if (assignments.data[i].Name == this.name) {
        assignmentFound = true
        this.assignmentData = assignments.data[i]
        console.log(this.assignmentData)
      }
    }

    if (assignmentFound) {  // If we find the assignment, then we check for specific attributes to use in the component.
      if (this.assignmentData.DueDate) {
        this.dueDate = this.transformDate(this.assignmentData.DueDate)
      } else {
        this.dueDate = "N/A"
      }
    }

    if (!assignmentFound) {
      this.dueDate = "Assignment Not Found"
    }

  }

  /******
   * Other functions go here
   */
  getCourse() {
    const currentLocation = window.location;
    const url = currentLocation.href;
    const a = url.split("/");
    this.domain = a[2]
    let attributes = a[a.length-1];
    attributes = attributes.split("&")

    for (var i=0; i<attributes.length; i++) {
      let attribute = attributes[i]
      if (attribute.slice(0,3) == "ou=") {
        const ou = attribute.slice(3)
        return ou
      }
    }
    return false  // If this returns false, then the OU could not be determined
  }

  transformDate(apiDate) {
    let date = new Date(apiDate)
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return date.toLocaleDateString("en-US", options)
  }

  render() {
    return this.loaded ? html`<span>${this.dueDate}</span>` : html``
  }
}

customElements.define('uga-duedate', UgaDueDate)