import {LitElement, html, css} from 'lit';

class UgaInstructorNote extends LitElement {

  static get properties() {
    return {
      versions: {type: Object},
      currentUser: {type: Object},
      ou: {type: String},
      enrollment: {type: String},
      excludedRoles: {type: Array},
      type: {type: String},
      filename: {type: String},
      program: {type: String},
      text: {type: String}
    }
  }

  constructor() {
    super()
    this.versions = {}
    this.currentUser = {}
    this.ou = ""
    this.enrollment = "Student"
    this.excludedRoles= ['Student', 'Demo Student']
    this.program = ""
    this.text = ""
    this.init()
  }

  async init() {
    await this.getVersions()
    await this.getUser()
    this.getCourse()
    await this.getEnrollment()
    await this.getText()
  }

  async getVersions() {
    const apiVer = await axios.get('/d2l/api/versions/');
    for (let i in apiVer.data) {
      this.versions[apiVer.data[i].ProductCode] = apiVer.data[i].LatestVersion
    }
  }

  async getUser() {
    const user = await axios.get('/d2l/api/lp/' + this.versions.lp + '/users/whoami')
    this.currentUser = user.data
  }

  getCourse() {
    const currentLocation = window.location;;
    const url = currentLocation.href;
    const a = url.split("/");
    let attributes = a[a.length-1];
    attributes = attributes.split("&")

    for (var i=0; i<attributes.length; i++) {
	  // Works with New Content
      let attribute = attributes[i]
      if (attribute.slice(0,3) == "ou=") {
		const ou = attribute.slice(3)
		this.ou = ou
      }
    }

	if (this.ou == "") {
	  // Works with old content
	  this.ou = attributes[0].split("?")[1].slice(3)
	}
  }

  async getEnrollment() {
	const url = '/d2l/api/lp/' + this.versions.lp + '/enrollments/myenrollments/' + this.ou
    const enrollment = await axios.get(url)
    this.enrollment = enrollment.data.Access.ClasslistRoleName
  }

  async getText() {
    if (this.filename != "") {
      if (this.type == 'program') {
        const text = await axios.get('/shared/ugaonline/templates/' + this.program + '/data/' + this.filename)
        this.text = text.data
        this.requestUpdate()
      } else if (this.type == 'local') {
        const text = await axios.get(this.filename)
        this.text = text.data
        this.requestUpdate()
      }
    }
    
  }

  render() {  // This will only render if the logged in user's role does not appear in the prohibited role array above

    if (!this.excludedRoles.includes(this.enrollment)) {
      return html`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <div class="obj-grid">
        <div class="obj-grid__full util-background-odyssey util-text-center util-pad-all-md">
          <h1 class="cmp-heading-5">Instructor Note</h1>
          <p>${unsafeHTML(this.text)}</p>
        </div>
      </div
      `
    }
  }
}

customElements.define('uga-instructor-note', UgaInstructorNote);