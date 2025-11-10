var kalturaVideoComponent = {
    props: ['url'],
    template: '<iframe id="kaltura_player_1574196844" title="Demo Kaltura Video" :src=url class="cmp-video__embed" width="560" height="315" allowfullscreen webkitallowfullscreen mozAllowFullScreen allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture; gyroscope" frameborder="0" itemprop="video" itemscope itemtype="http://schema.org/VideoObject"></iframe>'
}

var youtubeVideoComponent = {
    props: ['url'],
    template: '<iframe class="cmp-video__embed" width="560" height="315" :src=url frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" title="Commit to Georgia" allowfullscreen></iframe>'
}

var app = Vue.createApp({
    data() {
        return {
            ou: null,
            items: [],
            posts: {},
            versions: {},
            forumId: "",
            topicId: "",
            detailedView: false,
            detailedItem: {},
            titleSortState: "Sort Ascending",
            titleColClass: "cmp-sortable-cell__icon cmp-sortable-cell__icon--down cmp-sortable-cell__icon--inactive",
            avgSortState: "Sort Ascending",
            avgColClass: "cmp-sortable-cell__icon cmp-sortable-cell__icon--down cmp-sortable-cell__icon--inactive",
            loaded: false
        }
    },

    components: {
        'kalturavideo': kalturaVideoComponent,
        'youtubevideo': youtubeVideoComponent
    },

    created() {
        this.init()
    },

    methods: {
        async init() {
            this.getCourse();
            let versions = this.makeGetRequest('/d2l/api/versions/');
            await versions.then(data => { 
                for (let v in data.data) {
                    this.versions[data.data[v]["ProductCode"]] = data.data[v]["LatestVersion"]
                }
             })
        
            let forums = this.makeGetRequest('/d2l/api/le/' + this.versions.le + "/" + this.ou + "/discussions/forums/")
            await forums.then(data => {
                for (let f in data.data) {
                    if (data.data[f]["Name"] == "Content Ratings") {
                        this.forumId = data.data[f]["ForumId"]
                    }
                }
            })

            let topics = this.makeGetRequest('/d2l/api/le/' + this.versions.le + "/" + this.ou + "/discussions/forums/" + this.forumId + "/topics/")
            await topics.then(data => {
                for (let t in data.data) {
                    if (data.data[t]["Name"] == "Content Ratings") {
                        this.topicId = data.data[t]["TopicId"]
                    }
                }
            })

            let pageNum = 1
            await this.get_posts(pageNum)
        },

        
        async get_posts(pageNum) {
            let posts = this.makeGetRequest("/d2l/api/le/" + this.versions.le + "/" + this.ou + "/discussions/forums/" + this.forumId + "/topics/" + this.topicId + "/posts/?pageNumber=" + pageNum)
            await posts.then(data  => {
                let dataArrLength = data.data.length;
                for (let p in data.data) {
                    if (!data.data[p]['IsDeleted']) {
                        let postTitle = data.data[p]["Subject"]
                        let contentArray = postTitle.split("|")
                        let contentId = contentArray[0]

                        let contentType = contentArray[1]
                        if (contentType == "") {
                            contentType = "Unknown"
                        }

                        let contentTitle = contentArray[2]
                        if (contentTitle == "") {
                            contentTitle = "Untitled"
                        }

                        let contentPlatform = contentArray[3]
                        if (contentPlatform == "") {
                            contentPlatform = "Unknown"
                        }

                        let postMessage = data.data[p]["Message"]["Html"]
                        let postRating = parseInt(postMessage[0])
                        let postFeedback = ""

                        if (postMessage.length > 1) {
                            postFeedback = postMessage.substring(1)
                        }
                        
                        
                        if (this.posts.hasOwnProperty(contentId)) {
                            this.posts[contentId]["points"] += postRating
                            this.posts[contentId]["reviewCount"] += 1
                            this.posts[contentId]["feedback"].push(postFeedback)
                        } else {
                            this.posts[contentId] = {
                                "contentType": contentType,
                                "contentTitle": contentTitle,
                                "contentPlatform": contentPlatform,
                                "points": postRating,
                                "reviewCount": 1,
                                "feedback": [postFeedback],
                                "average": 0,
                                "percentRating": 0
                            }
                        }                        
                    }
                }

                if (dataArrLength == 1000) {
                    pageNum++
                    this.get_posts(pageNum)
                } else {
                    this.process_posts()
                }
            })
        },

        process_posts() {
            for (let entry in this.posts) {
                this.posts[entry]["average"] = Math.round((this.posts[entry]["points"] / this.posts[entry]["reviewCount"]) * 100) / 100
                this.posts[entry]["percentRating"] = Math.round((this.posts[entry]["average"] / 5) * 100) / 100

                this.items.push({
                    "contentId": entry,
                    "contentType": this.posts[entry]["contentType"],
                    "contentTitle": this.posts[entry]["contentTitle"],
                    "contentPlatform": this.posts[entry]["contentPlatform"],
                    "points": this.posts[entry]["rating"],
                    "reviewCount": this.posts[entry]["reviewCount"],
                    "feedback": this.posts[entry]["feedback"],
                    "showFeedback": false,
                    "average": this.posts[entry]["average"],
                    "percentRating": this.posts[entry]["percentRating"]
                })
            }

            const sorted = this.items.sort((a, b) => a.contentTitle.localeCompare(b.contentTitle))
            this.items = sorted
            this.loaded = true
        },

        sort_column(colName) {
            if (colName == "average") {
                if (this.avgSortState == "Sort Ascending") {
                    const sorted = this.items.sort((a, b) => (a.average > b.average) ? 1 : (a.contentTitle === b.contentTitle) ? ((a.contentId > b.contentId) ? 1 : -1) : -1 )
                    this.items = sorted
                    this.avgSortState = "Sort Descending"
                    this.avgColClass = "cmp-sortable-cell__icon cmp-sortable-cell__icon--down cmp-sortable-cell__icon--active"
                } else if (this.avgSortState == "Sort Descending") {
                    const sorted = this.items.sort((a, b) => (a.average < b.average) ? 1 : (a.contentTitle === b.contentTitle) ? ((a.contentId > b.contentId) ? 1 : -1) : -1 )
                    this.items = sorted
                    this.avgSortState = "Reset"
                    this.avgColClass = "cmp-sortable-cell__icon cmp-sortable-cell__icon--up cmp-sortable-cell__icon--active"
                } else if (this.avgSortState == "Reset") {
                    const sorted = this.items.sort((a, b) => a.contentTitle.localeCompare(b.contentTitle))
                    this.items = sorted
                    this.avgSortState = "Sort Ascending"
                    this.avgColClass = "cmp-sortable-cell__icon cmp-sortable-cell__icon--down cmp-sortable-cell__icon--inactive"
                }
            } else if (colName == "title") {
                if (this.titleSortState == "Sort Ascending") {
                    const sorted = this.items.sort((a, b) => a.contentTitle.localeCompare(b.contentTitle))
                    this.items = sorted
                    this.titleSortState = "Sort Descending"
                    this.titleColClass = "cmp-sortable-cell__icon cmp-sortable-cell__icon--down cmp-sortable-cell__icon--active"
                } else if (this.titleSortState == "Sort Descending") {
                    const sorted = this.items.sort((a, b) => b.contentTitle.localeCompare(a.contentTitle))
                    this.items = sorted
                    this.titleSortState = "Reset"
                    this.titleColClass = "cmp-sortable-cell__icon cmp-sortable-cell__icon--up cmp-sortable-cell__icon--active"
                } else if (this.titleSortState == "Reset") {
                    const sorted = this.items.sort((a, b) => a.contentTitle.localeCompare(b.contentTitle))
                    this.items = sorted
                    this.titleSortState = "Sort Ascending"
                    this.titleColClass = "cmp-sortable-cell__icon cmp-sortable-cell__icon--down cmp-sortable-cell__icon--inactive"
                }
            }
        },

        toggle_detail_view(itemId) {

            if (itemId == "reset") {
                this.detailedView = !this.detailedView
                this.detailedItem = {}
            } else {
                for (let i in this.items) {
                    if (this.items[i]['contentId'] == itemId) {
                        this.detailedItem = this.items[i]
                        
                        if (this.detailedItem.contentPlatform == "kaltura") {
                            let url = "https://cdnapisec.kaltura.com/p/1727411/sp/172741100/embedIframeJs/uiconf_id/40170611/partner_id/1727411?iframeembed=true&playerId=kaltura_player_1574196844&entry_id=" + this.detailedItem.contentId
                            this.detailedItem.videoSrc = url
                        } else if (this.detailedItem.contentPlatform == "youtube") {
                            let url = "https://www.youtube.com/embed/" + this.detailedItem.contentId
                            this.detailedItem.videoSrc = url
                        }
                    }
                }
                this.detailedView = !this.detailedView
            }
            
        },

        getCourse() {
            const currentLocation = window.location;
            const url = currentLocation.href;
            let ou = null
            const a = url.split("/");
            this.ou = a[6]
        },

        makeGetRequest(route) {
            return axios.get(route)
        }
    }
}).mount('#app')