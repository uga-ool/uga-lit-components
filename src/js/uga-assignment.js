import {LitElement, html, css} from 'lit';

class UgaAssignment extends LitElement {

  static get properties() {
    return {
      versions: {type: Object},
      domain: {type: String},
      ou: {type: String},
      flexClasses: {this: String},
      name: {type: String},
      assignmentData: {type: Object},
      dueDate: {type: String},
      startDate: {type: String},
      endDate: {type: String},
      dropboxType: {type: String},
      initialHeight: {type: String},
      rubricString: {type: String},
      studentRoles: {type: Array},
      loading: {type: Boolean}
    }
  }

  constructor() {
    super();
    this.versions = {};
    this.assignmentData = {'Name': 'Loading', 'CustomInstructions': {'Html': 'Loading'}}
    this.flexClasses = "obj-flex-item obj-flex-item__xs util-text-center util-background-light-gray util-pad-all-md"
    this.domain = null
    this.ou = null
    this.dueDate = null
    this.startDate = null
    this.endDate = null
    this.dropboxType = null
    this.rubricString = null
    this.student = null
    this.studentRoles = ["Student", "Demo Student"]
    this.initialHeight = 0
    this.loaded = false
  }

  connectedCallback() {
    super.connectedCallback();
    this.ou = this.getCourse();
    this.getVersions().then((versions) => {
      this.addVersions(versions)

      this.getEnrollment().then((enrollment) =>{
        this.checkStudent(enrollment)

        this.getAssignments().then((assignments) => {
          this.findAssignment(assignments)
          this.loaded = true

        });  // End Find Assignments
      }); // End Get Enrollment
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

  async getEnrollment() {
    const enrollment = await axios.get('/d2l/api/lp/' + this.versions.lp + '/enrollments/myenrollments/' + this.ou)
    return enrollment
  }

  /******
   * API Response Handlers go Here
   */

  addVersions(apiVersions) {
    for (let i in apiVersions) {
      this.versions[i] = apiVersions[i]
    }
  }

  checkStudent(enrollment) {
    if (this.studentRoles.includes(enrollment.data.Access.ClasslistRoleName)) {
      this.student = true;
    } else {
      this.student = false;
    }
  }

  findAssignment(assignments) {
    let assignmentFound = false
    for (let i in assignments.data) {
      if (assignments.data[i].Name == this.name) {
        assignmentFound = true
        this.assignmentData = assignments.data[i]
      }
    }

    if (assignmentFound) {  // If we find the assignment, then we check for specific attributes to use in the component.
      if (this.assignmentData.DueDate) {
        this.dueDate = this.transformDate(this.assignmentData.DueDate)
      } else {
        this.dueDate = null
      }

      if (this.assignmentData.Availability) {
        if(this.assignmentData.Availability.StartDate) {
          this.startDate = this.transformDate(this.assignmentData.Availability.StartDate)
        } else {
          this.startDate = null
        }
  
        if(this.assignmentData.Availability.EndDate) {
          this.endDate = this.transformDate(this.assignmentData.Availability.EndDate)
        } else {
          this.endDate = null
        }
      }

      if (this.assignmentData.DropboxType == 1) {
        this.dropboxType = "Group"
      } else if (this.assignmentData.DropboxType == 2) {
        this.dropboxType = "Individual"
      } else {
        this.dropboxType = null
      }

      if (this.assignmentData.Assessment.Rubrics.length > 0) {
        this.rubricString = ""
        if (this.assignmentData.Assessment.Rubrics.length > 1) {
          this.rubricString += "<span class=\"util-font-size-sm\">Rubrics</span><br />"
        } else {
          this.rubricString += "<span class=\"util-font-size-sm\">Rubric</span><br />"
        }
  
        for (let i in this.assignmentData.Assessment.Rubrics) {
          if (i == 0) {
            this.rubricString += this.assignmentData.Assessment.Rubrics[i].Name
          } else {
            this.rubricString += "<br />" + this.assignmentData.Assessment.Rubrics[i].Name
          } 
        }
      } else {
        this.rubricString = null
      }
    }

    if (!assignmentFound) {
      this.assignmentData = {"Error": "Assignment Not Found"}
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
    return html`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="obj-grid">
          <div class="obj-grid__12-12">
            <h1 class="cmp-heading-1 util-margin-vert-md">${this.assignmentData.Name}</h1>
            ${unsafeHTML(this.assignmentData.CustomInstructions.Html)}
          </div>
          <div class="obj-grid__12-12">
            <div class="obj-flex">
              ${this.dropboxType ? html`<div class=${this.flexClasses}><span class="util-font-size-sm">Assignment Type</span><br />${this.dropboxType}</div>` : html``}
              ${this.dueDate ? html`<div class=${this.flexClasses}><span class="util-font-size-sm">Due Date</span><br/>${this.dueDate}</div>` : html``}
              ${this.rubricString ? html`<div class=${this.flexClasses}>${unsafeHTML(this.rubricString)}</div>` : html``}
              ${this.startDate ? html`<div class=${this.flexClasses}><span class="util-font-size-sm">Start Date</span><br />${this.startDate}</div>` : html``}
              ${this.endDate ? html`<div class=${this.flexClasses}><span class="util-font-size-sm">End Date</span><br />${this.endDate}</div>` : html``}
            </div>
            ${ this.student ? html`<a class="cmp-button cmp-button--full-width" href="https://${this.domain}/d2l/lms/dropbox/user/folder_submit_files.d2l?db=${this.assignmentData.Id}&ou=${this.ou}" target="_blank">Click to visit this assignment</a>` : html`<a class="cmp-button cmp-button--full-width" href="https://${this.domain}//d2l/lms/dropbox/admin/mark/folder_submissions_users.d2l?db=${this.assignmentData.Id}&ou=${this.ou}" target="_blank">Click to visit this assignment</a>`}
          </div>
        </div>
        ${this.loaded ? html`` : html`<div style="min-height: ${this.initialHeight}px"></div>`}
    `
  }
}

customElements.define('uga-assignment', UgaAssignment)