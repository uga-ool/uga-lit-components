# D2L API Routing Table
**Developer Platform (January 2026)**

This document contains the complete HTTP routing table for the D2L (Brightspace) API, organized by service area.

---

## API Properties

- `GET /d2l/api/(productCode)/versions/`
- `GET /d2l/api/(productCode)/versions/(version)`
- `GET /d2l/api/versions/`
- `POST /d2l/api/versions/check`
- `GET /d2l/auth/api/cancel`
- `GET /d2l/auth/api/token`

---

## Award Service (BAS)

### Awards
- `GET /d2l/api/bas/(version)/awards/`
- `POST /d2l/api/bas/(version)/awards/`
- `GET /d2l/api/bas/(version)/awards/(awardId)`
- `PUT /d2l/api/bas/(version)/awards/(awardId)`
- `DELETE /d2l/api/bas/(version)/awards/(awardId)`

### Associations
- `GET /d2l/api/bas/(version)/associations/availableToEarn/`
- `GET /d2l/api/bas/(version)/orgunits/(orgUnitId)/associations/`
- `POST /d2l/api/bas/(version)/orgunits/(orgUnitId)/associations/`
- `GET /d2l/api/bas/(version)/orgunits/(orgUnitId)/associations/(associationId)`
- `PUT /d2l/api/bas/(version)/orgunits/(orgUnitId)/associations/(associationId)`
- `DELETE /d2l/api/bas/(version)/orgunits/(orgUnitId)/associations/(associationId)`
- `GET /d2l/api/bas/(version)/orgunits/(orgUnitId)/associations/availableToManage/`

### Issued Awards
- `GET /d2l/api/bas/(version)/issued/users/(userId)/`
- `GET /d2l/api/bas/(version)/issued/certificates/(certificateId)`
- `GET /d2l/api/bas/(version)/issued/certificates/(issuedId)/pdf`
- `POST /d2l/api/bas/(version)/orgunits/(orgUnitId)/issued/`
- `PUT /d2l/api/bas/(version)/orgunits/(orgUnitId)/issued/(issuedId)`
- `DELETE /d2l/api/bas/(version)/issued/(issuedId)`
- `PUT /d2l/api/bas/(version)/issued/(issuedId)/sharing/profile`
- `DELETE /d2l/api/bas/(version)/issued/(issuedId)/sharing/profile`

### Library
- `GET /d2l/api/bas/(version)/library/icons/`
- `POST /d2l/api/bas/(version)/library/icons/`
- `GET /d2l/api/bas/(version)/library/icons/(fileName)`
- `DELETE /d2l/api/bas/(version)/library/icons/(fileName)`
- `GET /d2l/api/bas/(version)/library/templates/`
- `POST /d2l/api/bas/(version)/library/templates/`
- `GET /d2l/api/bas/(version)/library/templates/(fileName)`
- `DELETE /d2l/api/bas/(version)/library/templates/(fileName)`

### Organization Units
- `GET /d2l/api/bas/(version)/orgunits/(orgUnitId)/classlist/`
- `GET /d2l/api/bas/(version)/orgunits/(orgUnitId)/classlist/users/(userId)`
- `GET /d2l/api/bas/(version)/orgunits/(orgUnitId)/myConfiguration`
- `GET /d2l/api/bas/(version)/orgunits/(orgUnitId)/revocableawards/`
- `GET /d2l/api/bas/(version)/orgunits/(orgUnitId)/revocableawards/(userId)/`

### Credit Summary
- `GET /d2l/api/bas/(version)/creditSummary`

---

## Brightspace For Parents (BFP)

- `GET /d2l/api/bfp/(version)/relationships/(userId)`
- `PUT /d2l/api/bfp/(version)/relationships/`
- `DELETE /d2l/api/bfp/(version)/relationships/`

---

## EPortfolio (eP)

### Activity
- `GET /d2l/api/eP/(version)/activity/`
- `GET /d2l/api/eP/(version)/activity/filters/`
- `GET /d2l/api/eP/(version)/activity/my/`
- `GET /d2l/api/eP/(version)/activity/shared/`

### Artifacts
- `POST /d2l/api/eP/(version)/artifacts/file/new`
- `POST /d2l/api/eP/(version)/artifacts/file/upload`
- `POST /d2l/api/eP/(version)/artifacts/link/new`
- `GET /d2l/api/eP/(version)/artifact/(objectId)`
- `DELETE /d2l/api/eP/(version)/artifact/(objectId)`
- `GET /d2l/api/eP/(version)/artifact/file/(objectId)`
- `POST /d2l/api/eP/(version)/artifact/file/(objectId)`
- `DELETE /d2l/api/eP/(version)/artifact/file/(objectId)`
- `GET /d2l/api/eP/(version)/artifact/link/(objectId)`
- `POST /d2l/api/eP/(version)/artifact/link/(objectId)`
- `DELETE /d2l/api/eP/(version)/artifact/link/(objectId)`

### Collections
- `POST /d2l/api/eP/(version)/collections/new`
- `GET /d2l/api/eP/(version)/collection/(objectId)`
- `POST /d2l/api/eP/(version)/collection/(objectId)`
- `DELETE /d2l/api/eP/(version)/collection/(objectId)`
- `GET /d2l/api/eP/(version)/collection/(collectionId)/contents/`
- `POST /d2l/api/eP/(version)/collection/(collectionId)/add/(objectId)`
- `POST /d2l/api/eP/(version)/collection/(collectionId)/remove/(objectId)`

### Dashboard
- `GET /d2l/api/eP/(version)/dashboard/`
- `GET /d2l/api/eP/(version)/dashboard/filters/`

### Export/Import
- `POST /d2l/api/eP/(version)/export/new`
- `POST /d2l/api/eP/(version)/export/new/all`
- `GET /d2l/api/eP/(version)/export/(exportId)/status`
- `GET /d2l/api/eP/(version)/export/(exportId)/package`
- `POST /d2l/api/eP/(version)/import/new`
- `POST /d2l/api/eP/(version)/import/newwithdetails`
- `GET /d2l/api/eP/(version)/import/(importId)/status`

### Invites
- `GET /d2l/api/eP/(version)/invites/`
- `POST /d2l/api/eP/(version)/invites/new`
- `POST /d2l/api/eP/(version)/invites/delete`
- `POST /d2l/api/eP/(version)/invites/status`

### Learning Objectives
- `GET /d2l/api/eP/(version)/learningobjective/(objectiveId)`
- `POST /d2l/api/eP/(version)/learningobjective/(objectiveId)`
- `DELETE /d2l/api/eP/(version)/learningobjective/(objectiveId)`
- `POST /d2l/api/eP/(version)/learningobjective/(objectiveId)/association/(objectId)`
- `DELETE /d2l/api/eP/(version)/learningobjective/(objectiveId)/association/(objectId)`

### Newsfeed
- `GET /d2l/api/eP/(version)/newsfeed/`
- `GET /d2l/api/eP/(version)/newsfeed/filters/`

### Objects
- `GET /d2l/api/eP/(version)/object`
- `GET /d2l/api/eP/(version)/object/(objectId)`
- `GET /d2l/api/eP/(version)/object/(objectId)/content`
- `GET /d2l/api/eP/(version)/object/(objectId)/associations/`
- `GET /d2l/api/eP/(version)/object/(objectId)/comments/`
- `POST /d2l/api/eP/(version)/object/(objectId)/comments/new`
- `DELETE /d2l/api/eP/(version)/object/(objectId)/comment/(commentId)`
- `GET /d2l/api/eP/(version)/object/(objectId)/shares/`
- `POST /d2l/api/eP/(version)/object/(objectId)/share/new`
- `POST /d2l/api/eP/(version)/object/(objectId)/share/delete`
- `GET /d2l/api/eP/(version)/object/(objectId)/tags/`
- `POST /d2l/api/eP/(version)/object/(objectId)/tags/add`
- `POST /d2l/api/eP/(version)/object/(objectId)/tags/remove`
- `GET /d2l/api/eP/(version)/object/comments/`
- `POST /d2l/api/eP/(version)/object/comments/new`
- `DELETE /d2l/api/eP/(version)/object/comment/(commentId)`
- `GET /d2l/api/eP/(version)/object/content`
- `GET /d2l/api/eP/(version)/object/sharetargets`
- `GET /d2l/api/eP/(version)/object/sharetargets/my`
- `GET /d2l/api/eP/(version)/object/sharetargets/sharinggroups`
- `GET /d2l/api/eP/(version)/object/sharetargets/users`
- `GET /d2l/api/eP/(version)/object/thumbnail`
- `GET /d2l/api/eP/(version)/objects/my/`
- `GET /d2l/api/eP/(version)/objects/my/shared/modified/`
- `GET /d2l/api/eP/(version)/objects/shared/`
- `GET /d2l/api/eP/(version)/objects/(objectsFilter)/comments/(commentsFilter)`
- `GET /d2l/api/eP/(version)/objects/tags/`
- `POST /d2l/api/eP/(version)/objects/tags/add`
- `POST /d2l/api/eP/(version)/objects/tags/remove`

### Presentations
- `POST /d2l/api/eP/(version)/presentations/new`
- `GET /d2l/api/eP/(version)/presentation/(objectId)`
- `POST /d2l/api/eP/(version)/presentation/(objectId)`
- `DELETE /d2l/api/eP/(version)/presentation/(objectId)`

### Reflections
- `POST /d2l/api/eP/(version)/reflections/new`
- `GET /d2l/api/eP/(version)/reflection/(objectId)`
- `POST /d2l/api/eP/(version)/reflection/(objectId)`
- `DELETE /d2l/api/eP/(version)/reflection/(objectId)`
- `POST /d2l/api/eP/(version)/reflection/(reflectionId)/on/(objectId)`
- `DELETE /d2l/api/eP/(version)/reflection/(reflectionId)/on/(objectId)`

### Subscriptions
- `GET /d2l/api/eP/(version)/subscriptions/objects/`
- `POST /d2l/api/eP/(version)/subscriptions/objects/(objectId)`
- `DELETE /d2l/api/eP/(version)/subscriptions/objects/(objectId)`
- `GET /d2l/api/eP/(version)/subscriptions/objects/exists`
- `GET /d2l/api/eP/(version)/subscriptions/users/`
- `POST /d2l/api/eP/(version)/subscriptions/users/(userId)`
- `DELETE /d2l/api/eP/(version)/subscriptions/users/(userId)`
- `GET /d2l/api/eP/(version)/subscriptions/users/exists`

### Tags
- `POST /d2l/api/eP/(version)/tags/autocomplete`

### Users
- `GET /d2l/api/eP/(version)/users/sharing/`
- `GET /d2l/api/eP/(version)/ignoredusers/`
- `POST /d2l/api/eP/(version)/ignoredusers/add`
- `POST /d2l/api/eP/(version)/ignoredusers/remove`

---

## Learning Environment (LE)

### Assessment
- `GET /d2l/api/le/(version)/(orgUnitId)/assessment`
- `PUT /d2l/api/le/(version)/(orgUnitId)/assessment`

### Calendar
- `GET /d2l/api/le/(version)/(orgUnitId)/calendar/events/`
- `GET /d2l/api/le/(version)/(orgUnitId)/calendar/events/myEvents/`
- `GET /d2l/api/le/(version)/(orgUnitId)/calendar/events/myEvents/itemCount`
- `GET /d2l/api/le/(version)/(orgUnitId)/calendar/events/orgunits/`
- `GET /d2l/api/le/(version)/(orgUnitId)/calendar/events/user/`
- `POST /d2l/api/le/(version)/(orgUnitId)/calendar/event/`
- `GET /d2l/api/le/(version)/(orgUnitId)/calendar/event/(eventId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/calendar/event/(eventId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/calendar/event/(eventId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/calendar/event/(eventId)/access/`
- `POST /d2l/api/le/(version)/(orgUnitId)/calendar/event/(eventId)/presenter`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/calendar/event/(eventId)/presenter/(userId)`
- `GET /d2l/api/le/(version)/calendar/events/myEvents/`
- `GET /d2l/api/le/(version)/calendar/events/myEvents/itemCounts/`

### Checklists
- `GET /d2l/api/le/(version)/(orgUnitId)/checklists/`
- `POST /d2l/api/le/(version)/(orgUnitId)/checklists/`
- `GET /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/categories/`
- `POST /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/categories/`
- `GET /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/categories/(categoryId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/categories/(categoryId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/categories/(categoryId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/items/`
- `POST /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/items/`
- `GET /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/items/(checklistItemId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/items/(checklistItemId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/items/(checklistItemId)`

### Classlist
- `GET /d2l/api/le/(version)/(orgUnitId)/classlist/`
- `GET /d2l/api/le/(version)/(orgUnitId)/classlist/paged/`

### Competencies
- `GET /d2l/api/le/(version)/(orgUnitId)/competencies/structure`

### Content
- `GET /d2l/api/le/(version)/(orgUnitId)/content/root/`
- `POST /d2l/api/le/(version)/(orgUnitId)/content/root/`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/toc`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/bookmarks`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/recent`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/myItems/`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/myItems/itemCount`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/myItems/due/`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/myItems/due/itemCount`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/completions/`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/completions/mycount/`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/userprogress/`
- `POST /d2l/api/le/(version)/(orgUnitId)/content/userprogress/`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/userprogress/(topicId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/pacing`
- `PUT /d2l/api/le/(version)/(orgUnitId)/content/pacing`
- `PUT /d2l/api/le/(version)/(orgUnitId)/content/pacing/modules/(moduleId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/content/exemptions/users/(userId)/byFilter/`
- `POST /d2l/api/le/(version)/(orgUnitId)/content/exemptions/users/(userId)/byList/`
- `POST /d2l/api/le/(version)/(orgUnitId)/content/exemptions/users/(userId)/byList/delete/`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/modules/(moduleId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/content/modules/(moduleId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/content/modules/(moduleId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/modules/(moduleId)/access/`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/modules/(moduleId)/structure/`
- `POST /d2l/api/le/(version)/(orgUnitId)/content/modules/(moduleId)/structure/`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)/access/`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)/completions/`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)/completions/users/(userId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)/completions/users/(userId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)/file`
- `PUT /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)/file`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)/captions`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)/captions/(language)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)/captions/(language)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)/captions/(language)`
- `POST /d2l/api/le/(version)/(orgUnitId)/content/order/objectId/(objectId)`
- `GET /d2l/api/le/(version)/content/completions/(userId)/`
- `GET /d2l/api/le/(version)/content/items/(userId)`
- `GET /d2l/api/le/(version)/content/myItems/`
- `GET /d2l/api/le/(version)/content/myItems/completions/`
- `GET /d2l/api/le/(version)/content/myItems/completions/due/`
- `GET /d2l/api/le/(version)/content/myItems/due/`
- `GET /d2l/api/le/(version)/content/myItems/due/itemCounts/`
- `GET /d2l/api/le/(version)/content/myItems/itemCounts/`

### Discussions
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/`
- `POST /d2l/api/le/(version)/(orgUnitId)/discussions/forums/`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/access/`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/`
- `POST /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/access/`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/groupRestrictions/`
- `PUT /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/groupRestrictions/`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/groupRestrictions/`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/`
- `POST /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/(postId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/(postId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/(postId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/(postId)/Approval`
- `PUT /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/(postId)/Approval`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/(postId)/Flag`
- `PUT /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/(postId)/Flag`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/(postId)/Rating`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/(postId)/Rating/MyRating`
- `PUT /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/(postId)/Rating/MyRating`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/(postId)/Rating/MyRating`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/(postId)/ReadStatus`
- `PUT /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/(postId)/ReadStatus`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/(postId)/Votes`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/(postId)/Votes/MyVote`
- `PUT /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/(postId)/Votes/MyVote`

### Dropbox
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/categories/`
- `POST /d2l/api/le/(version)/(orgUnitId)/dropbox/categories/`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/categories/(categoryId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/dropbox/categories/(categoryId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/dropbox/categories/(categoryId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/`
- `POST /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/access/`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/attachments/(fileId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/paged/`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/(submissionId)/files/(fileId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/(submissionId)/files/(fileId)/markAsRead`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/(userId)/download`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/user/(userId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/group/(groupId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/group/(groupId)/`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/mysubmissions/`
- `POST /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/mysubmissions/`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/group-submissions/(groupId)/download`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/feedback/(entityType)/(entityId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/feedback/(entityType)/(entityId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/feedback/(entityType)/(entityId)/attach`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/feedback/(entityType)/(entityId)/attachments/(fileId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/feedback/(entityType)/(entityId)/attachments/(fileId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/feedback/(entityType)/(entityId)/links/(linkId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/feedback/(entityType)/(entityId)/upload`
- `PUT /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/entities/(entityId)/completion`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/specialaccess/`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/specialaccess/(userId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/specialaccess/(userId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/specialaccess/(userId)`
- `GET /d2l/api/le/(version)/dropbox/orgUnits/feedback/`

### Grades
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/`
- `POST /d2l/api/le/(version)/(orgUnitId)/grades/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/access/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/values/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/values/(userId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/values/(userId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/values/myGradeValue`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/exemptions/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/exemptions/(userId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/exemptions/(userId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/exemptions/(userId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/ipsis`
- `PUT /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/ipsis`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/statistics`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/categories/`
- `POST /d2l/api/le/(version)/(orgUnitId)/grades/categories/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/categories/(categoryId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/grades/categories/(categoryId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/categories/(categoryId)/ipsis`
- `PUT /d2l/api/le/(version)/(orgUnitId)/grades/categories/(categoryId)/ipsis`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/schemes/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/schemes/(gradeSchemeId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/setup/`
- `PUT /d2l/api/le/(version)/(orgUnitId)/grades/setup/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/values/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/values/(userId)/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/values/descendants/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/values/myGradeValues/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/exemptions/(userId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/grades/exemptions/(userId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/final/values/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/final/values/(userId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/grades/final/values/(userId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/final/values/myGradeValue`
- `POST /d2l/api/le/(version)/(orgUnitId)/grades/final/calculated/(userId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/grades/final/calculated/all`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/courseCompletion/`
- `POST /d2l/api/le/(version)/(orgUnitId)/grades/courseCompletion/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/courseCompletion/(completionId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/grades/courseCompletion/(completionId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/grades/courseCompletion/(completionId)`
- `GET /d2l/api/le/(version)/grades/courseCompletion/(userId)/`
- `GET /d2l/api/le/(version)/grades/final/values/myGradeValues/`
- `GET /d2l/api/le/(version)/grades/values/(userId)`

### Locker
- `GET /d2l/api/le/(version)/(orgUnitId)/locker/group/(groupId)/(path)`
- `POST /d2l/api/le/(version)/(orgUnitId)/locker/group/(groupId)/(path)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/locker/group/(groupId)/(path)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/locker/group/(groupId)/(path)`
- `GET /d2l/api/le/(version)/locker/myLocker/(path)`
- `POST /d2l/api/le/(version)/locker/myLocker/(path)`
- `PUT /d2l/api/le/(version)/locker/myLocker/(path)`
- `DELETE /d2l/api/le/(version)/locker/myLocker/(path)`
- `GET /d2l/api/le/(version)/locker/user/(userId)/(path)`
- `POST /d2l/api/le/(version)/locker/user/(userId)/(path)`
- `PUT /d2l/api/le/(version)/locker/user/(userId)/(path)`
- `DELETE /d2l/api/le/(version)/locker/user/(userId)/(path)`

### News
- `GET /d2l/api/le/(version)/(orgUnitId)/news/`
- `POST /d2l/api/le/(version)/(orgUnitId)/news/`
- `GET /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)/access/`
- `POST /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)/attachments/`
- `GET /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)/attachments/(fileId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)/attachments/(fileId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)/dismiss`
- `POST /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)/publish`
- `POST /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)/restore`
- `GET /d2l/api/le/(version)/(orgUnitId)/news/deleted/`
- `POST /d2l/api/le/(version)/(orgUnitId)/news/deleted/(newsItemId)/restore`
- `GET /d2l/api/le/(version)/(orgUnitId)/news/user/(userId)/`
- `GET /d2l/api/le/(version)/news/user/(userId)/`

### Overview
- `GET /d2l/api/le/(version)/(orgUnitId)/overview`
- `GET /d2l/api/le/(version)/(orgUnitId)/overview/attachment`

### Quizzes
- `GET /d2l/api/le/(version)/(orgUnitId)/quizzes/`
- `POST /d2l/api/le/(version)/(orgUnitId)/quizzes/`
- `GET /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)/access/`
- `GET /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)/attempts/`
- `GET /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)/attempts/(attemptId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)/questions/`
- `GET /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)/specialaccess/`
- `GET /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)/specialaccess/(userId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)/specialaccess/(userId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)/specialaccess/(userId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/quizzes/categories/`
- `POST /d2l/api/le/(version)/(orgUnitId)/quizzes/categories/`
- `GET /d2l/api/le/(version)/(orgUnitId)/quizzes/categories/(categoryId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/quizzes/categories/(categoryId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/quizzes/categories/(categoryId)`

### Rubrics
- `GET /d2l/api/le/(version)/(orgUnitId)/rubrics`

### Surveys
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/`
- `POST /d2l/api/le/(version)/(orgUnitId)/surveys/`
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)/access/`
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)/attempts/`
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)/attempts/(attemptId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)/questions/`
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)/specialaccess/`
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)/specialaccess/(userId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)/specialaccess/(userId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)/specialaccess/(userId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/categories/`
- `POST /d2l/api/le/(version)/(orgUnitId)/surveys/categories/`
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/categories/(categoryId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/surveys/categories/(categoryId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/surveys/categories/(categoryId)`

### Updates
- `GET /d2l/api/le/(version)/(orgUnitId)/updates/myUpdates`
- `GET /d2l/api/le/(version)/updates/myUpdates/`

### Accommodations
- `PUT /d2l/api/le/(version)/accommodations/`
- `GET /d2l/api/le/(version)/accommodations/(orgUnitId)/myaccommodations`
- `GET /d2l/api/le/(version)/accommodations/(orgUnitId)/users/(userId)`

### Auditing
- `GET /d2l/api/le/(version)/auditing/auditees/(auditeeId)`
- `GET /d2l/api/le/(version)/auditing/auditors/(auditorId)`
- `GET /d2l/api/le/(version)/auditing/auditors/(auditorId)/auditees/`
- `POST /d2l/api/le/(version)/auditing/auditors/(auditorId)/auditees/`
- `DELETE /d2l/api/le/(version)/auditing/auditors/(auditorId)/auditees/`

### CCB Logs
- `GET /d2l/api/le/(version)/ccb/logs`

### CPD (Continuing Professional Development)
- `GET /d2l/api/le/(version)/cpd/category/(categoryId)`
- `GET /d2l/api/le/(version)/cpd/method/(methodId)`
- `GET /d2l/api/le/(version)/cpd/question/(questionId)`
- `GET /d2l/api/le/(version)/cpd/record/(recordId)`
- `PUT /d2l/api/le/(version)/cpd/record/(recordId)`
- `GET /d2l/api/le/(version)/cpd/record/(recordId)/attachment/(attachmentId)`
- `POST /d2l/api/le/(version)/cpd/record/(recordId)/attachment/upload`
- `POST /d2l/api/le/(version)/cpd/record/(recordId)/attachments`
- `DELETE /d2l/api/le/(version)/cpd/record/(recordId)/attachments`
- `GET /d2l/api/le/(version)/cpd/record/user/(userId)`
- `GET /d2l/api/le/(version)/cpd/target/progress/user/(userId)`

### Import
- `POST /d2l/api/le/(version)/import/(orgUnitId)/copy/`
- `GET /d2l/api/le/(version)/import/(orgUnitId)/copy/(jobToken)`
- `POST /d2l/api/le/(version)/import/(orgUnitId)/imports/`
- `GET /d2l/api/le/(version)/import/(orgUnitId)/imports/(jobToken)`
- `GET /d2l/api/le/(version)/import/(orgUnitid)/imports/(jobToken)/logs/`

### LTI
- `GET /d2l/api/le/(version)/lti/link/(orgUnitId)/`
- `POST /d2l/api/le/(version)/lti/link/(orgUnitId)`
- `GET /d2l/api/le/(version)/lti/link/(orgUnitId)/(ltiLinkId)`
- `PUT /d2l/api/le/(version)/lti/link/(ltiLinkId)`
- `DELETE /d2l/api/le/(version)/lti/link/(ltiLinkId)`
- `GET /d2l/api/le/(version)/lti/link/(orgUnitId)/(linkId)/sharing/`
- `POST /d2l/api/le/(version)/lti/link/(orgUnitId)/(linkId)/sharing/`
- `DELETE /d2l/api/le/(version)/lti/link/(orgUnitId)/(linkId)/sharing/`
- `GET /d2l/api/le/(version)/lti/link/(orgUnitId)/(linkId)/sharing/(sharingOrgUnitId)`
- `PUT /d2l/api/le/(version)/lti/link/(orgUnitId)/(linkId)/sharing/(sharingOrgUnitId)`
- `DELETE /d2l/api/le/(version)/lti/link/(orgUnitId)/(linkId)/sharing/(sharingOrgUnitId)`
- `GET /d2l/api/le/(version)/lti/tp/(orgUnitId)/`
- `POST /d2l/api/le/(version)/lti/tp/(orgUnitId)`
- `GET /d2l/api/le/(version)/lti/tp/(orgUnitId)/(tpId)`
- `PUT /d2l/api/le/(version)/lti/tp/(tpId)`
- `DELETE /d2l/api/le/(version)/lti/tp/(tpId)`
- `GET /d2l/api/le/(version)/lti/tp/(orgUnitId)/(tpId)/sharing/`
- `POST /d2l/api/le/(version)/lti/tp/(orgUnitId)/(tpId)/sharing/`
- `DELETE /d2l/api/le/(version)/lti/tp/(orgUnitId)/(tpId)/sharing/`
- `GET /d2l/api/le/(version)/lti/tp/(orgUnitId)/(tpId)/sharing/(sharingOrgUnitId)`
- `PUT /d2l/api/le/(version)/lti/tp/(orgUnitId)/(tpId)/sharing/(sharingOrgUnitId)`
- `DELETE /d2l/api/le/(version)/lti/tp/(orgUnitId)/(tpId)/sharing/(sharingOrgUnitId)`
- `POST /d2l/api/le/(version)/lti/quicklink/(orgUnitId)/(ltiLinkId)`

### LTI Advantage
- `GET /d2l/api/le/(version)/ltiadvantage/deployment/`
- `POST /d2l/api/le/(version)/ltiadvantage/deployment/`
- `GET /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)`
- `PUT /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)`
- `DELETE /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)`
- `GET /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)/assetprocessors/`
- `GET /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)/links/summaries/`
- `GET /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)/sharing/`
- `POST /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)/sharing/`
- `DELETE /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)/sharing/`
- `GET /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)/sharing/(sharingOrgUnitId)`
- `PUT /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)/sharing/(sharingOrgUnitId)`
- `DELETE /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)/sharing/(sharingOrgUnitId)`
- `GET /d2l/api/le/(version)/ltiadvantage/links/organization/`
- `POST /d2l/api/le/(version)/ltiadvantage/links/organization/`
- `GET /d2l/api/le/(version)/ltiadvantage/links/organization/(linkId)`
- `PUT /d2l/api/le/(version)/ltiadvantage/links/organization/(linkId)`
- `DELETE /d2l/api/le/(version)/ltiadvantage/links/organization/(linkId)`
- `GET /d2l/api/le/(version)/ltiadvantage/links/orgunit/(orgUnitId)/`
- `POST /d2l/api/le/(version)/ltiadvantage/links/orgunit/(orgUnitId)/`
- `GET /d2l/api/le/(version)/ltiadvantage/links/orgunit/(orgUnitId)/(linkId)`
- `PUT /d2l/api/le/(version)/ltiadvantage/links/orgunit/(orgUnitId)/(linkId)`
- `DELETE /d2l/api/le/(version)/ltiadvantage/links/orgunit/(orgUnitId)/(linkId)`
- `GET /d2l/api/le/(version)/ltiadvantage/migration/jobs/`
- `POST /d2l/api/le/(version)/ltiadvantage/migration/jobs/`
- `GET /d2l/api/le/(version)/ltiadvantage/migration/jobs/(jobId)`
- `POST /d2l/api/le/(version)/ltiadvantage/migration/links/(linkId)`
- `GET /d2l/api/le/(version)/ltiadvantage/orgunit/(orgUnitId)/assetprocessors/`
- `GET /d2l/api/le/(version)/ltiadvantage/orgunit/(orgUnitId)/assetprocessor/(assetProcessorId)`
- `DELETE /d2l/api/le/(version)/ltiadvantage/orgunit/(orgUnitId)/assetprocessor/(assetProcessorId)`
- `PUT /d2l/api/le/(version)/ltiadvantage/orgunit/(orgUnitId)/assetprocessor/(assetProcessorId)/status`
- `GET /d2l/api/le/(version)/ltiadvantage/registration/`
- `POST /d2l/api/le/(version)/ltiadvantage/registration/`
- `GET /d2l/api/le/(version)/ltiadvantage/registration/(clientId)`
- `PUT /d2l/api/le/(version)/ltiadvantage/registration/(clientId)`
- `DELETE /d2l/api/le/(version)/ltiadvantage/registration/(clientId)`
- `GET /d2l/api/le/(version)/ltiadvantage/registration/(clientId)/legacydomains/`
- `POST /d2l/api/le/(version)/ltiadvantage/registration/(clientId)/legacydomains/`
- `PUT /d2l/api/le/(version)/ltiadvantage/registration/(clientId)/legacydomains/`
- `POST /d2l/api/le/(apiVersion)/ltiadvantage/quicklinks/orgunit/(orgUnitId)/link/(linkId)`

### Overdue Items
- `GET /d2l/api/le/(version)/overdueItems/`
- `GET /d2l/api/le/(version)/overdueItems/myItems`

### IPSIS
- `POST /d2l/api/le/{version}/ipsis/upload/{sourceSystemId}/signedurl`

---

## Learning Object Repository (LR)

### Objects
- `PUT /d2l/api/lr/(version)/objects/`
- `POST /d2l/api/lr/(version)/objects/(objectId)/`
- `GET /d2l/api/lr/(version)/objects/(objectId)/download/`
- `GET /d2l/api/lr/(version)/objects/(objectId)/downloadfile/`
- `GET /d2l/api/lr/(version)/objects/(objectId)/link/`
- `GET /d2l/api/lr/(version)/objects/(objectId)/properties/`
- `POST /d2l/api/lr/(version)/objects/(objectId)/properties/`
- `POST /d2l/api/lr/(version)/objects/(objectId)/delete/`
- `GET /d2l/api/lr/(version)/objects/(objectId)/(objectVersion)/download/`
- `GET /d2l/api/lr/(version)/objects/(objectId)/(objectVersion)/downloadfile/`
- `GET /d2l/api/lr/(version)/objects/(objectId)/(objectVersion)/link/`
- `GET /d2l/api/lr/(version)/objects/(objectId)/(objectVersion)/metadata/`
- `GET /d2l/api/lr/(version)/objects/(objectId)/(objectVersion)/properties/`
- `POST /d2l/api/lr/(version)/objects/(objectId)/(objectVersion)/properties/`
- `GET /d2l/api/lr/(version)/objects/search/`

### Repositories
- `GET /d2l/api/lr/(version)/repositories/all/`
- `GET /d2l/api/lr/(version)/repositories/(type)/`
- `GET /d2l/api/lr/(version)/repository/(repositoryId)/listorgUnittrusts/`

### Upload
- `POST /d2l/api/lr/(version)/(repositoryId)/upload`
- `POST /d2l/api/lr/(version)/(repositoryId)/upload/publish`
- `PUT /d2l/api/lr/(version)/(repositoryId)/upload/publish/(objectId)`

---

## Learning Platform (LP)

### Conditional Release
- `GET /d2l/api/lp/(version)/(orgUnitId)/conditionalRelease/conditions/(targetType)/(targetId)`
- `PUT /d2l/api/lp/(version)/(orgUnitId)/conditionalRelease/conditions/(targetType)/(targetId)`

### Group Categories
- `GET /d2l/api/lp/(version)/(orgUnitId)/groupcategories/`
- `POST /d2l/api/lp/(version)/(orgUnitId)/groupcategories/`
- `GET /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)`
- `PUT /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)`
- `DELETE /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)`
- `GET /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/`
- `POST /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/`
- `GET /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/(groupId)`
- `PUT /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/(groupId)`
- `DELETE /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/(groupId)`
- `GET /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/(groupId)/enrollments`
- `POST /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/(groupId)/enrollments/`
- `DELETE /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/(groupId)/enrollments/(userId)`
- `GET /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/(groupId)/noenrollments`
- `GET /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/enrollments`
- `GET /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/paged`
- `GET /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/locker`
- `POST /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/locker`
- `GET /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/status`

### Manage Files
- `GET /d2l/api/lp/(version)/(orgUnitId)/managefiles/`
- `GET /d2l/api/lp/(version)/(orgUnitId)/managefiles/file`
- `DELETE /d2l/api/lp/(version)/(orgUnitId)/managefiles/file`
- `POST /d2l/api/lp/(version)/(orgUnitId)/managefiles/file/save`
- `POST /d2l/api/lp/(version)/(orgUnitId)/managefiles/file/upload`
- `POST /d2l/api/lp/(version)/(orgUnitId)/managefiles/folder`
- `DELETE /d2l/api/lp/(version)/(orgUnitId)/managefiles/folder`

### Roles
- `GET /d2l/api/lp/(version)/(orgUnitId)/roles/`

### Sections
- `GET /d2l/api/lp/(version)/(orgUnitId)/sections/`
- `POST /d2l/api/lp/(version)/(orgUnitId)/sections/`
- `PUT /d2l/api/lp/(version)/(orgUnitId)/sections/`
- `GET /d2l/api/lp/(version)/(orgUnitId)/sections/(sectionId)`
- `PUT /d2l/api/lp/(version)/(orgUnitId)/sections/(sectionId)`
- `DELETE /d2l/api/lp/(version)/(orgUnitId)/sections/(sectionId)`
- `GET /d2l/api/lp/(version)/(orgUnitId)/sections/(sectionId)/enrollments/`
- `POST /d2l/api/lp/(version)/(orgUnitId)/sections/(sectionId)/enrollments/`
- `GET /d2l/api/lp/(version)/(orgUnitId)/sections/(sectionId)/noenrollments`
- `GET /d2l/api/lp/(version)/(orgUnitId)/sections/enrollments/`
- `GET /d2l/api/lp/(version)/(orgUnitId)/sections/mysections/`
- `GET /d2l/api/lp/(version)/(orgUnitId)/sections/paged`
- `GET /d2l/api/lp/(version)/(orgUnitId)/sections/settings`
- `POST /d2l/api/lp/(version)/(orgUnitId)/sections/settings`
- `PUT /d2l/api/lp/(version)/(orgUnitId)/sections/settings`

### Widget Data
- `GET /d2l/api/lp/(version)/(orgUnitId)/widgetdata/(customWidgetId)`
- `PUT /d2l/api/lp/(version)/(orgUnitId)/widgetdata/(customWidgetId)`
- `DELETE /d2l/api/lp/(version)/(orgUnitId)/widgetdata/(customWidgetId)`
- `GET /d2l/api/lp/(version)/(orgUnitId)/widgetdata/(customWidgetId)/(userId)`
- `PUT /d2l/api/lp/(version)/(orgUnitId)/widgetdata/(customWidgetId)/(userId)`
- `DELETE /d2l/api/lp/(version)/(orgUnitId)/widgetdata/(customWidgetId)/(userId)`
- `GET /d2l/api/lp/(version)/(orgUnitId)/widgetdata/(customWidgetId)/mydata`
- `PUT /d2l/api/lp/(version)/(orgUnitId)/widgetdata/(customWidgetId)/mydata`
- `DELETE /d2l/api/lp/(version)/(orgUnitId)/widgetdata/(customWidgetId)/mydata`

### Account Settings
- `GET /d2l/api/lp/(version)/accountSettings/(userId)/locale/`
- `PUT /d2l/api/lp/(version)/accountSettings/(userId)/locale/`
- `GET /d2l/api/lp/(version)/accountSettings/mySettings/locale/`
- `PUT /d2l/api/lp/(version)/accountSettings/mySettings/locale/`

### Alerts
- `GET /d2l/api/lp/(version)/alerts/user/(userId)`

### Attributes
- `GET /d2l/api/lp/(version)/attributes/schemas/`
- `GET /d2l/api/lp/(version)/attributes/users/(userId)`
- `PUT /d2l/api/lp/(version)/attributes/users/(userId)`
- `DELETE /d2l/api/lp/(version)/attributes/users/(userId)`

### Authentication
- `GET /d2l/api/lp/(version)/auth/soaptoken`

### Config Variables
- `GET /d2l/api/lp/(version)/configVariables/definitions/`
- `GET /d2l/api/lp/(version)/configVariables/(variableId)/definition`
- `GET /d2l/api/lp/(version)/configVariables/(variableId)/values`
- `GET /d2l/api/lp/(version)/configVariables/(variableId)/values/system`
- `PUT /d2l/api/lp/(version)/configVariables/(variableId)/values/system`
- `GET /d2l/api/lp/(version)/configVariables/(variableId)/values/org`
- `PUT /d2l/api/lp/(version)/configVariables/(variableId)/values/org`
- `GET /d2l/api/lp/(version)/configVariables/(variableId)/values/orgUnits/`
- `GET /d2l/api/lp/(version)/configVariables/(variableId)/values/orgUnits/(orgUnitId)`
- `PUT /d2l/api/lp/(version)/configVariables/(variableId)/values/orgUnits/(orgUnitId)`
- `GET /d2l/api/lp/(version)/configVariables/(variableId)/effectiveValues/orgUnits/(orgUnitId)`
- `GET /d2l/api/lp/(version)/configVariables/(variableId)/values/roles/`
- `GET /d2l/api/lp/(version)/configVariables/(variableId)/values/roles/(roleId)`
- `PUT /d2l/api/lp/(version)/configVariables/(variableId)/values/roles/(roleId)`
- `GET /d2l/api/lp/(version)/configVariables/(variableId)/resolver`
- `PUT /d2l/api/lp/(version)/configVariables/(variableId)/resolver`
- `DELETE /d2l/api/lp/(version)/configVariables/(variableId)/resolver`

### Courses
- `GET /d2l/api/lp/(version)/courses/parentorgunits`
- `GET /d2l/api/lp/(version)/courses/parents`
- `GET /d2l/api/lp/(version)/courses/schema`
- `POST /d2l/api/lp/(version)/courses/`
- `GET /d2l/api/lp/(version)/courses/(orgUnitId)`
- `PUT /d2l/api/lp/(version)/courses/(orgUnitId)`
- `DELETE /d2l/api/lp/(version)/courses/(orgUnitId)`
- `GET /d2l/api/lp/(version)/courses/(orgUnitId)/image`
- `PUT /d2l/api/lp/(version)/courses/(orgUnitId)/image`

### Course Templates
- `GET /d2l/api/lp/(version)/coursetemplates/schema`
- `POST /d2l/api/lp/(version)/coursetemplates/`
- `GET /d2l/api/lp/(version)/coursetemplates/(orgUnitId)`
- `PUT /d2l/api/lp/(version)/coursetemplates/(orgUnitId)`
- `DELETE /d2l/api/lp/(version)/coursetemplates/(orgUnitId)`

### Data Export
- `GET /d2l/api/lp/(version)/dataExport/version`
- `GET /d2l/api/lp/(version)/dataExport/list`
- `GET /d2l/api/lp/(version)/dataExport/list/(dataSetId)`
- `GET /d2l/api/lp/(version)/dataExport/jobs`
- `GET /d2l/api/lp/(version)/dataExport/jobs/(exportJobId)`
- `POST /d2l/api/lp/(version)/dataExport/create`
- `GET /d2l/api/lp/(version)/dataExport/download/(exportJobId)`
- `GET /d2l/api/lp/(version)/dataExport/bds/list`
- `GET /d2l/api/lp/(version)/dataExport/bds/(pluginid)/(identifier)`
- `GET /d2l/api/lp/(version)/dataExport/bds`
- `GET /d2l/api/lp/(version)/dataExport/bds/download/(pluginid)`

### Datasets
- `GET /d2l/api/lp/(version)/datasets/bds`
- `GET /d2l/api/lp/(version)/datasets/bds/(schemaId)/extracts`
- `GET /d2l/api/lp/(version)/datasets/bds/(schemaId)/plugins/(pluginId)/extracts`
- `GET /d2l/api/lp/(version)/datasets/bds/(schemaId)/plugins/(pluginId)/extracts/(extractId)`

### Demographics
- `GET /d2l/api/lp/(version)/demographics/dataTypes/`
- `GET /d2l/api/lp/(version)/demographics/dataTypes/(dataTypeId)`
- `GET /d2l/api/lp/(version)/demographics/fields/`
- `POST /d2l/api/lp/(version)/demographics/fields/`
- `GET /d2l/api/lp/(version)/demographics/fields/(fieldId)`
- `PUT /d2l/api/lp/(version)/demographics/fields/(fieldId)`
- `DELETE /d2l/api/lp/(version)/demographics/fields/(fieldId)`
- `GET /d2l/api/lp/(version)/demographics/users/`
- `GET /d2l/api/lp/(version)/demographics/users/(userId)`
- `PUT /d2l/api/lp/(version)/demographics/users/(userId)`
- `DELETE /d2l/api/lp/(version)/demographics/users/(userId)`
- `GET /d2l/api/lp/(version)/demographics/orgUnits/(orgUnitId)/users/`
- `GET /d2l/api/lp/(version)/demographics/orgUnits/(orgUnitId)/users/(userId)`

### Enrollments
- `GET /d2l/api/lp/(version)/enrollments/myenrollments/`
- `GET /d2l/api/lp/(version)/enrollments/myenrollments/(orgUnitId)`
- `GET /d2l/api/lp/(version)/enrollments/myenrollments/(orgUnitId)/access`
- `GET /d2l/api/lp/(version)/enrollments/myenrollments/(orgUnitId)/parentOrgUnits`
- `POST /d2l/api/lp/(version)/enrollments/myenrollments/(orgUnitId)/pin`
- `DELETE /d2l/api/lp/(version)/enrollments/myenrollments/(orgUnitId)/pin`
- `POST /d2l/api/lp/(version)/enrollments/`
- `POST /d2l/api/lp/(version)/enrollments/batch/`
- `GET /d2l/api/lp/(version)/enrollments/orgUnits/(orgUnitId)/users/`
- `GET /d2l/api/lp/(version)/enrollments/orgUnits/(orgUnitId)/users/(userId)`
- `DELETE /d2l/api/lp/(version)/enrollments/orgUnits/(orgUnitId)/users/(userId)`
- `GET /d2l/api/lp/(version)/enrollments/orgUnits/(orgUnitId)/users/(userId)/completion`
- `PUT /d2l/api/lp/(version)/enrollments/orgUnits/(orgUnitId)/users/(userId)/completion`
- `POST /d2l/api/lp/(version)/enrollments/orgUnits/(orgUnitId)/users/(userId)/pin`
- `DELETE /d2l/api/lp/(version)/enrollments/orgUnits/(orgUnitId)/users/(userId)/pin`
- `GET /d2l/api/lp/(version)/enrollments/users/(userId)/orgUnits/`
- `GET /d2l/api/lp/(version)/enrollments/users/(userId)/orgUnits/(orgUnitId)`
- `DELETE /d2l/api/lp/(version)/enrollments/users/(userId)/orgUnits/(orgUnitId)`

### Feed
- `GET /d2l/api/lp/(version)/feed/`

### Force Logout
- `PUT /d2l/api/lp/(version)/forceLogout/(userId)`

### Global User Mapping
- `GET /d2l/api/lp/(version)/globalusermapping/users/(userid)`
- `PUT /d2l/api/lp/(version)/globalusermapping/users/(userid)`
- `DELETE /d2l/api/lp/(version)/globalusermapping/users/(userid)`
- `GET /d2l/api/lp/(version)/globalusermapping/identifiers/(identifier)`

### IMS Config
- `GET /d2l/api/lp/(version)/imsconfig/roles/`
- `GET /d2l/api/lp/(version)/imsconfig/map/roles/`
- `GET /d2l/api/lp/(version)/imsconfig/map/roles/(roleId)`
- `PUT /d2l/api/lp/(version)/imsconfig/map/roles/(roleId)`

### Language
- `GET /d2l/api/lp/(version)/language`

### Local Authentication Security
- `GET /d2l/api/lp/(version)/localauthenticationsecurity/overrides/`
- `POST /d2l/api/lp/(version)/localauthenticationsecurity/overrides/`
- `DELETE /d2l/api/lp/(version)/localauthenticationsecurity/overrides/`

### Locales
- `GET /d2l/api/lp/(version)/locales/`
- `GET /d2l/api/lp/(version)/locales/(localeId)`

### Logging
- `GET /d2l/api/lp/(version)/logging/`
- `GET /d2l/api/lp/(version)/logging/(logMessageId)/`
- `GET /d2l/api/lp/(version)/logging/grouped/`

### Notifications
- `GET /d2l/api/lp/(version)/notifications/instant/carriers/`
- `GET /d2l/api/lp/(version)/notifications/instant/carriers/(carrierId)/subscriptions/`
- `GET /d2l/api/lp/(version)/notifications/instant/carriers/(carrierId)/subscriptions/(messageTypeId)`
- `PUT /d2l/api/lp/(version)/notifications/instant/carriers/(carrierId)/subscriptions/(messageTypeId)`
- `DELETE /d2l/api/lp/(version)/notifications/instant/carriers/(carrierId)/subscriptions/(messageTypeId)`
- `GET /d2l/api/lp/(version)/notifications/instant/carriers/(carrierId)/subscriptions/users/(userId)/`
- `PUT /d2l/api/lp/(version)/notifications/instant/carriers/(carrierId)/subscriptions/(messageTypeId)/users/(userId)`
- `DELETE /d2l/api/lp/(version)/notifications/instant/carriers/(carrierId)/subscriptions/(messageTypeId)/users/(userId)`
- `GET /d2l/api/lp/(version)/notifications/instant/users/(userId)/settings`
- `PUT /d2l/api/lp/(version)/notifications/instant/users/(userId)/settings`

### Organization
- `GET /d2l/api/lp/(version)/organization/info`
- `GET /d2l/api/lp/(version)/organization/primary-url`

### Org Structure
- `GET /d2l/api/lp/(version)/orgstructure/`
- `POST /d2l/api/lp/(version)/orgstructure/`
- `GET /d2l/api/lp/(version)/orgstructure/(orgUnitId)`
- `PUT /d2l/api/lp/(version)/orgstructure/(orgUnitId)`
- `GET /d2l/api/lp/(version)/orgstructure/(orgUnitId)/ancestors/`
- `GET /d2l/api/lp/(version)/orgstructure/(orgUnitId)/children/`
- `POST /d2l/api/lp/(version)/orgstructure/(orgUnitId)/children/`
- `DELETE /d2l/api/lp/(version)/orgstructure/(orgUnitId)/children/(childOrgUnitId)`
- `GET /d2l/api/lp/(version)/orgstructure/(orgUnitId)/children/paged/`
- `GET /d2l/api/lp/(version)/orgstructure/(orgUnitId)/colours`
- `PUT /d2l/api/lp/(version)/orgstructure/(orgUnitId)/colours`
- `GET /d2l/api/lp/(version)/orgstructure/(orgUnitId)/descendants/`
- `GET /d2l/api/lp/(version)/orgstructure/(orgUnitId)/descendants/paged/`
- `GET /d2l/api/lp/(version)/orgstructure/(orgUnitId)/parents/`
- `POST /d2l/api/lp/(version)/orgstructure/(orgUnitId)/parents/`
- `DELETE /d2l/api/lp/(version)/orgstructure/(orgUnitId)/parents/(parentOrgUnitId)`
- `GET /d2l/api/lp/(version)/orgstructure/childless/`
- `GET /d2l/api/lp/(version)/orgstructure/orphans/`
- `GET /d2l/api/lp/(version)/orgstructure/recyclebin/`
- `POST /d2l/api/lp/(version)/orgstructure/recyclebin/(orgUnitId)/recycle`
- `POST /d2l/api/lp/(version)/orgstructure/recyclebin/(orgUnitId)/restore`
- `DELETE /d2l/api/lp/(version)/orgstructure/recyclebin/(orgUnitId)`

### Org Unit Types
- `GET /d2l/api/lp/(version)/outypes/`
- `POST /d2l/api/lp/(version)/outypes/`
- `GET /d2l/api/lp/(version)/outypes/(orgUnitTypeId)`
- `POST /d2l/api/lp/(version)/outypes/(orgUnitTypeId)`
- `DELETE /d2l/api/lp/(version)/outypes/(orgUnitTypeId)`
- `GET /d2l/api/lp/(version)/outypes/department`
- `GET /d2l/api/lp/(version)/outypes/semester`

### Permissions
- `GET /d2l/api/lp/(version)/permissions/tools/(toolId)/capabilities/`
- `POST /d2l/api/lp/(version)/permissions/tools/(toolId)/capabilities/`
- `DELETE /d2l/api/lp/(version)/permissions/tools/(toolId)/capabilities/(capabilityId)`
- `GET /d2l/api/lp/(version)/permissions/tools/(toolId)/claims/`
- `GET /d2l/api/lp/(version)/permissions/tools/(toolId)/claims/allowed/`
- `GET /d2l/api/lp/(version)/permissions/tools/(toolId)/claims/allowed/(grantId)`
- `PUT /d2l/api/lp/(version)/permissions/tools/(toolId)/claims/allowed/(grantId)`
- `DELETE /d2l/api/lp/(version)/permissions/tools/(toolId)/claims/allowed/(grantId)`
- `GET /d2l/api/lp/(version)/permissions/tools/(toolId)/claims/metadata/`
- `GET /d2l/api/lp/(version)/permissions/tools/(toolId)/claims/metadata/(claimId)`

### Profile
- `GET /d2l/api/lp/(version)/profile/myProfile`
- `PUT /d2l/api/lp/(version)/profile/myProfile`
- `GET /d2l/api/lp/(version)/profile/myProfile/image`
- `POST /d2l/api/lp/(version)/profile/myProfile/image`
- `DELETE /d2l/api/lp/(version)/profile/myProfile/image`
- `GET /d2l/api/lp/(version)/profile/(profileId)`
- `PUT /d2l/api/lp/(version)/profile/(profileId)`
- `GET /d2l/api/lp/(version)/profile/(profileId)/image`
- `POST /d2l/api/lp/(version)/profile/(profileId)/image`
- `DELETE /d2l/api/lp/(version)/profile/(profileId)/image`
- `GET /d2l/api/lp/(version)/profile/user/(userId)`
- `PUT /d2l/api/lp/(version)/profile/user/(userId)`
- `GET /d2l/api/lp/(version)/profile/user/(userId)/image`
- `POST /d2l/api/lp/(version)/profile/user/(userId)/image`
- `DELETE /d2l/api/lp/(version)/profile/user/(userId)/image`

### Roles
- `GET /d2l/api/lp/(version)/roles/`
- `POST /d2l/api/lp/(version)/roles/`
- `GET /d2l/api/lp/(version)/roles/(roleId)`

### Sessions
- `DELETE /d2l/api/lp/(version)/sessions/(userId)`

### Source Courses
- `GET /d2l/api/lp/(version)/sourceCourses/(orgUnitId)/currentReofferedCourse`
- `GET /d2l/api/lp/(version)/sourceCourses/(orgUnitId)/reofferedCourses`
- `POST /d2l/api/lp/(version)/sourceCourses/(orgUnitId)/deploy`

### Timezones
- `GET /d2l/api/lp/(version)/timezones/`

### Tools
- `GET /d2l/api/lp/(version)/tools/org/`
- `GET /d2l/api/lp/(version)/tools/org/(toolId)`
- `PUT /d2l/api/lp/(version)/tools/org/(toolId)`
- `PUT /d2l/api/lp/(version)/tools/org/(toolId)/OUDefault`
- `PUT /d2l/api/lp/(version)/tools/org/(toolId)/OUDefault/override`
- `GET /d2l/api/lp/(version)/tools/orgUnits/(orgUnitId)`
- `GET /d2l/api/lp/(version)/tools/orgUnits/(orgUnitId)/(toolId)`
- `PUT /d2l/api/lp/(version)/tools/orgUnits/(orgUnitId)/(toolId)`
- `GET /d2l/api/lp/(version)/tools/orgUnits/(orgUnitId)/toolNames`

### Users
- `GET /d2l/api/lp/(version)/users/`
- `POST /d2l/api/lp/(version)/users/`
- `POST /d2l/api/lp/(version)/users/batch/`
- `GET /d2l/api/lp/(version)/users/(userId)`
- `PUT /d2l/api/lp/(version)/users/(userId)`
- `DELETE /d2l/api/lp/(version)/users/(userId)`
- `GET /d2l/api/lp/(version)/users/(userId)/activation`
- `PUT /d2l/api/lp/(version)/users/(userId)/activation`
- `GET /d2l/api/lp/(version)/users/(userId)/names`
- `PUT /d2l/api/lp/(version)/users/(userId)/names`
- `GET /d2l/api/lp/(version)/users/(userId)/password`
- `POST /d2l/api/lp/(version)/users/(userId)/password`
- `PUT /d2l/api/lp/(version)/users/(userId)/password`
- `DELETE /d2l/api/lp/(version)/users/(userId)/password`
- `GET /d2l/api/lp/(version)/users/whoami`
- `GET /d2l/api/lp/(version)/users/mypronouns`
- `PUT /d2l/api/lp/(version)/users/mypronouns`
- `GET /d2l/api/lp/(version)/users/mypronouns/visibility`
- `PUT /d2l/api/lp/(version)/users/mypronouns/visibility`

---

## GAE (Google Apps for Education)

- `POST /d2l/api/gae/(version)/linkuser`

---

## Notes

- All endpoints use the pattern `/d2l/api/{service}/{version}/...` where `{service}` is the service code (e.g., `le`, `lp`, `bas`, `eP`, `lr`, `bfp`, `gae`)
- `{version}` is typically a version number (e.g., `1.0`, `1.1`)
- `(orgUnitId)`, `(userId)`, etc. are path parameters that should be replaced with actual IDs
- HTTP methods (GET, POST, PUT, DELETE) are indicated for each endpoint
- This documentation is current as of January 2026

---

**Source:** HTTP Routing Table — Developer Platform (January 2026)
