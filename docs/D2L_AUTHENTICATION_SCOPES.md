# D2L Authentication Scopes Table
**Developer Platform (January 2026)**

This document maps OAuth 2.0 scopes to their associated API endpoints. Each scope follows the pattern `<resource-group>:<resource>:<action>`.

---

## Accommodations

### `accommodations:profile:manage`
- `PUT /d2l/api/le/(version)/accommodations/`

### `accommodations:profile:read`
- `GET /d2l/api/le/(version)/accommodations/(orgUnitId)/myaccommodations`
- `GET /d2l/api/le/(version)/accommodations/(orgUnitId)/users/(userId)`

---

## Account Settings

### `accountsettings:locale:read`
- `GET /d2l/api/lp/(version)/accountSettings/(userId)/locale/`

### `accountsettings:locale:update`
- `PUT /d2l/api/lp/(version)/accountSettings/(userId)/locale/`

---

## Alerts

### `alerts:alerts:read`
- `GET /d2l/api/lp/(version)/alerts/user/(userId)`

---

## Attributes

### `attributes:schemas:read`
- `GET /d2l/api/lp/(version)/attributes/schemas/`

### `attributes:users:delete`
- `DELETE /d2l/api/lp/(version)/attributes/users/(userId)`

### `attributes:users:read`
- `GET /d2l/api/lp/(version)/attributes/users/(userId)`

### `attributes:users:update`
- `PUT /d2l/api/lp/(version)/attributes/users/(userId)`

---

## Awards

### `awards:certificate:read`
- `GET /d2l/api/bas/(version)/issued/certificates/(certificateId)`
- `GET /d2l/api/bas/(version)/issued/certificates/(issuedId)/pdf`

---

## Calendar

### `calendar:access:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/calendar/event/(eventId)/access/`

---

## Checklists

### `checklists:checklist:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/checklists/`
- `GET /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/categories/`
- `GET /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/categories/(categoryId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/items/`
- `GET /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/items/(checklistItemId)`

### `checklists:checklist:read` + `checklists:checklist:write`
- `POST /d2l/api/le/(version)/(orgUnitId)/checklists/`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/categories/`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/categories/(categoryId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/categories/(categoryId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/items/`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/items/(checklistItemId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/checklists/(checklistId)/items/(checklistItemId)`

---

## Content

### `content:access:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/modules/(moduleId)/access/`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)/access/`

### `content:completions:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)/completions/`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)/completions/users/(userId)`

### `content:completions:write`
- `PUT /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)/completions/users/(userId)`

### `content:exemptions:delete`
- `POST /d2l/api/le/(version)/(orgUnitId)/content/exemptions/users/(userId)/byList/delete/`

### `content:exemptions:write`
- `POST /d2l/api/le/(version)/(orgUnitId)/content/exemptions/users/(userId)/byFilter/`
- `POST /d2l/api/le/(version)/(orgUnitId)/content/exemptions/users/(userId)/byList/`

### `content:file:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)/file`

### `content:file:write`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)/captions`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)/captions/(language)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)/captions/(language)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)/file`

### `content:modules:manage`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/content/modules/(moduleId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/content/modules/(moduleId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/content/modules/(moduleId)/structure/`
- `POST /d2l/api/le/(version)/(orgUnitId)/content/root/`

### `content:modules:manage` + `content:topics:manage`
- `POST /d2l/api/le/(version)/(orgUnitId)/content/order/objectId/(objectId)`

### `content:modules:readonly`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/modules/(moduleId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/modules/(moduleId)/structure/`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/root/`

### `content:toc:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/bookmarks`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/recent`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/toc`

### `content:topics:manage`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)`

### `content:topics:readonly`
- `GET /d2l/api/le/(version)/(orgUnitId)/content/topics/(topicId)`

---

## CPD (Continuing Professional Development)

### `cpd:fields:read`
- `GET /d2l/api/le/(version)/cpd/category/(categoryId)`
- `GET /d2l/api/le/(version)/cpd/method/(methodId)`
- `GET /d2l/api/le/(version)/cpd/question/(questionId)`

### `cpd:records:manage`
- `PUT /d2l/api/le/(version)/cpd/record/(recordId)`
- `POST /d2l/api/le/(version)/cpd/record/(recordId)/attachment/upload`
- `DELETE /d2l/api/le/(version)/cpd/record/(recordId)/attachments`
- `POST /d2l/api/le/(version)/cpd/record/(recordId)/attachments`

### `cpd:records:read`
- `GET /d2l/api/le/(version)/cpd/record/(recordId)`
- `GET /d2l/api/le/(version)/cpd/record/(recordId)/attachment/(attachmentId)`
- `GET /d2l/api/le/(version)/cpd/record/user/(userId)`

### `cpd:targets:read`
- `GET /d2l/api/le/(version)/cpd/target/progress/user/(userId)`

---

## Data Hub

### `datahub:dataexports:download`
- `GET /d2l/api/lp/(version)/dataExport/bds/(pluginid)/(identifier)`
- `GET /d2l/api/lp/(version)/dataExport/bds/download/(pluginid)`

### `datahub:dataexports:read`
- `GET /d2l/api/lp/(version)/dataExport/bds`
- `GET /d2l/api/lp/(version)/dataExport/bds/list`

---

## Datasets

### `datasets:bds:read`
- `GET /d2l/api/lp/(version)/datasets/bds`
- `GET /d2l/api/lp/(version)/datasets/bds/(schemaId)/extracts`
- `GET /d2l/api/lp/(version)/datasets/bds/(schemaId)/plugins/(pluginId)/extracts`
- `GET /d2l/api/lp/(version)/datasets/bds/(schemaId)/plugins/(pluginId)/extracts/(extractId)`

---

## Discussions

### `discussions:access:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/access/`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/access/`

### `discussions:forums:manage`
- `POST /d2l/api/le/(version)/(orgUnitId)/discussions/forums/`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)`

### `discussions:forums:readonly`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)`

### `discussions:posts:manage`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/(postId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/(postId)`

### `discussions:posts:readonly`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/`
- `POST /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)/posts/(postId)`

### `discussions:topics:manage`
- `POST /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)`

### `discussions:topics:readonly`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/`
- `GET /d2l/api/le/(version)/(orgUnitId)/discussions/forums/(forumId)/topics/(topicId)`

---

## Dropbox

### `dropbox:access:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/access/`

### `dropbox:folders:delete`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/dropbox/categories/(categoryId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/feedback/(entityType)/(entityId)/attachments/(fileId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/specialaccess/(userId)`

### `dropbox:folders:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/categories/`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/categories/(categoryId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/attachments/(fileId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/feedback/(entityType)/(entityId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/feedback/(entityType)/(entityId)/attachments/(fileId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/feedback/(entityType)/(entityId)/links/(linkId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/group-submissions/(groupId)/download`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/specialaccess/`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/specialaccess/(userId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/(submissionId)/files/(fileId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/(userId)/download`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/group/(groupId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/mysubmissions/`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/paged/`
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/user/(userId)`
- `GET /d2l/api/le/(version)/dropbox/orgUnits/feedback/`

### `dropbox:folders:write`
- `POST /d2l/api/le/(version)/(orgUnitId)/dropbox/categories/`
- `PUT /d2l/api/le/(version)/(orgUnitId)/dropbox/categories/(categoryId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/`
- `PUT /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/entities/(entityId)/completion`
- `POST /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/feedback/(entityType)/(entityId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/feedback/(entityType)/(entityId)/attach`
- `POST /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/feedback/(entityType)/(entityId)/upload`
- `PUT /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/specialaccess/(userId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/(submissionId)/files/(fileId)/markAsRead`
- `POST /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/group/(groupId)/`
- `POST /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/mysubmissions/`

---

## Enrollment

### `enrollment:completion:read`
- `GET /d2l/api/lp/(version)/enrollments/orgUnits/(orgUnitId)/users/(userId)/completion`

### `enrollment:completion:update`
- `PUT /d2l/api/lp/(version)/enrollments/orgUnits/(orgUnitId)/users/(userId)/completion`

### `enrollment:orgunit:create`
- `POST /d2l/api/lp/(version)/enrollments/`
- `POST /d2l/api/lp/(version)/enrollments/batch/`

### `enrollment:orgunit:delete`
- `DELETE /d2l/api/lp/(version)/enrollments/orgUnits/(orgUnitId)/users/(userId)`
- `DELETE /d2l/api/lp/(version)/enrollments/users/(userId)/orgUnits/(orgUnitId)`

### `enrollment:orgunit:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/classlist/`
- `GET /d2l/api/le/(version)/(orgUnitId)/classlist/paged/`
- `GET /d2l/api/lp/(version)/enrollments/orgUnits/(orgUnitId)/users/`
- `GET /d2l/api/lp/(version)/enrollments/orgUnits/(orgUnitId)/users/(userId)`
- `GET /d2l/api/lp/(version)/enrollments/users/(userId)/orgUnits/`
- `GET /d2l/api/lp/(version)/enrollments/users/(userId)/orgUnits/(orgUnitId)`

### `enrollment:own_enrollment:read`
- `GET /d2l/api/lp/(version)/courses/parentorgunits`
- `GET /d2l/api/lp/(version)/courses/parents`
- `GET /d2l/api/lp/(version)/enrollments/myenrollments/`
- `GET /d2l/api/lp/(version)/enrollments/myenrollments/(orgUnitId)`
- `GET /d2l/api/lp/(version)/enrollments/myenrollments/(orgUnitId)/access`
- `GET /d2l/api/lp/(version)/enrollments/myenrollments/(orgUnitId)/parentOrgUnits`

---

## Global User Mapping

### `globalusermapping:mapping:write`
- `PUT /d2l/api/lp/(version)/globalusermapping/users/(userid)`

---

## Grades

### `grades:access:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/access/`

### `grades:gradecategories:delete`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/grades/categories/(categoryId)`

### `grades:gradecategories:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/categories/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/categories/(categoryId)`

### `grades:gradecategories:write`
- `POST /d2l/api/le/(version)/(orgUnitId)/grades/categories/`

### `grades:gradeobjects:delete`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/exemptions/(userId)`

### `grades:gradeobjects:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/exemptions/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/exemptions/(userId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/ipsis`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/exemptions/(userId)`

### `grades:gradeobjects:write`
- `POST /d2l/api/le/(version)/(orgUnitId)/grades/`
- `PUT /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/exemptions/(userId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/ipsis`
- `POST /d2l/api/le/(version)/(orgUnitId)/grades/exemptions/(userId)`

### `grades:gradeschemes:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/schemes/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/schemes/(gradeSchemeId)`

### `grades:gradesettings:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/setup/`

### `grades:gradesettings:write`
- `PUT /d2l/api/le/(version)/(orgUnitId)/grades/setup/`

### `grades:gradestatistics:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/statistics`

### `grades:gradevalues:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/values/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/values/(userId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/final/values/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/final/values/(userId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/values/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/values/(userId)/`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/values/descendants/`
- `GET /d2l/api/le/(version)/grades/values/(userId)`

### `grades:gradevalues:write`
- `PUT /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/values/(userId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/grades/final/calculated/(userId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/grades/final/calculated/all`
- `PUT /d2l/api/le/(version)/(orgUnitId)/grades/final/values/(userId)`

### `grades:own_grades:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/values/myGradeValue`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/final/values/myGradeValue`
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/values/myGradeValues/`
- `GET /d2l/api/le/(version)/grades/final/values/myGradeValues/`

---

## Groups

### `groups:enrollment:create`
- `POST /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/(groupId)/enrollments/`

### `groups:enrollment:delete`
- `DELETE /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/(groupId)/enrollments/(userId)`

### `groups:group:create`
- `POST /d2l/api/lp/(version)/(orgUnitId)/groupcategories/`
- `POST /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/`

### `groups:group:delete`
- `DELETE /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)`
- `DELETE /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/(groupId)`

### `groups:group:read`
- `GET /d2l/api/lp/(version)/(orgUnitId)/groupcategories/`
- `GET /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)`
- `GET /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/`
- `GET /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/(groupId)`
- `GET /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/(groupId)/enrollments`
- `GET /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/(groupId)/noenrollments`
- `GET /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/enrollments`
- `GET /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/paged`
- `GET /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/status`

### `groups:group:update`
- `PUT /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)`
- `PUT /d2l/api/lp/(version)/(orgUnitId)/groupcategories/(groupCategoryId)/groups/(groupId)`

---

## Import

### `import:job:create`
- `POST /d2l/api/le/(version)/import/(orgUnitId)/imports/`

### `import:job:fetch`
- `GET /d2l/api/le/(version)/import/(orgUnitId)/imports/(jobToken)`

---

## IPSIS

### `ipsis:batch:upload`
- `POST /d2l/api/le/{version}/ipsis/upload/{sourceSystemId}/signedurl`

---

## Languages

### `languages:languages:read`
- `GET /d2l/api/lp/(version)/language`

---

## Local Authentication Security

### `localauthenticationsecurity:overrides:manage`
- `DELETE /d2l/api/lp/(version)/localauthenticationsecurity/overrides/`
- `POST /d2l/api/lp/(version)/localauthenticationsecurity/overrides/`

### `localauthenticationsecurity:overrides:read`
- `GET /d2l/api/lp/(version)/localauthenticationsecurity/overrides/`

---

## Learning Object Repository (LOR)

### `lor:object:create`
- `POST /d2l/api/lr/(version)/(repositoryId)/upload`

### `lor:object:write`
- `POST /d2l/api/lr/(version)/(repositoryId)/upload/publish`
- `PUT /d2l/api/lr/(version)/(repositoryId)/upload/publish/(objectId)`

---

## LTI

### `lti:links:create`
- `POST /d2l/api/le/(version)/lti/link/(orgUnitId)`

### `lti:links:delete`
- `DELETE /d2l/api/le/(version)/lti/link/(ltiLinkId)`

### `lti:links:read`
- `GET /d2l/api/le/(version)/lti/link/(orgUnitId)/`
- `GET /d2l/api/le/(version)/lti/link/(orgUnitId)/(ltiLinkId)`

### `lti:links:update`
- `PUT /d2l/api/le/(version)/lti/link/(ltiLinkId)`

---

## LTI Advantage

### `ltiadvantage:assetprocessors:delete`
- `DELETE /d2l/api/le/(version)/ltiadvantage/orgunit/(orgUnitId)/assetprocessor/(assetProcessorId)`

### `ltiadvantage:assetprocessors:read`
- `GET /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)/assetprocessors/`
- `GET /d2l/api/le/(version)/ltiadvantage/orgunit/(orgUnitId)/assetprocessor/(assetProcessorId)`
- `GET /d2l/api/le/(version)/ltiadvantage/orgunit/(orgUnitId)/assetprocessors/`

### `ltiadvantage:assetprocessors:update`
- `PUT /d2l/api/le/(version)/ltiadvantage/orgunit/(orgUnitId)/assetprocessor/(assetProcessorId)/status`

### `ltiadvantage:deployments:create`
- `POST /d2l/api/le/(version)/ltiadvantage/deployment/`

### `ltiadvantage:deployments:delete`
- `DELETE /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)`

### `ltiadvantage:deployments:read`
- `GET /d2l/api/le/(version)/ltiadvantage/deployment/`
- `GET /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)`
- `GET /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)/sharing/`

### `ltiadvantage:deployments:update`
- `PUT /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)`
- `DELETE /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)/sharing/`
- `POST /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)/sharing/`
- `DELETE /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)/sharing/(sharingOrgUnitId)`
- `PUT /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)/sharing/(sharingOrgUnitId)`

### `ltiadvantage:links:create`
- `POST /d2l/api/le/(version)/ltiadvantage/links/organization/`
- `POST /d2l/api/le/(version)/ltiadvantage/links/orgunit/(orgUnitId)/`

### `ltiadvantage:links:delete`
- `DELETE /d2l/api/le/(version)/ltiadvantage/links/organization/(linkId)`
- `DELETE /d2l/api/le/(version)/ltiadvantage/links/orgunit/(orgUnitId)/(linkId)`

### `ltiadvantage:links:read`
- `GET /d2l/api/le/(version)/ltiadvantage/deployment/(deploymentId)/links/summaries/`
- `GET /d2l/api/le/(version)/ltiadvantage/links/organization/`
- `GET /d2l/api/le/(version)/ltiadvantage/links/organization/(linkId)`
- `GET /d2l/api/le/(version)/ltiadvantage/links/orgunit/(orgUnitId)/`
- `GET /d2l/api/le/(version)/ltiadvantage/links/orgunit/(orgUnitId)/(linkId)`

### `ltiadvantage:links:update`
- `PUT /d2l/api/le/(version)/ltiadvantage/links/organization/(linkId)`
- `PUT /d2l/api/le/(version)/ltiadvantage/links/orgunit/(orgUnitId)/(linkId)`
- `POST /d2l/api/le/(version)/ltiadvantage/migration/links/(linkId)`

### `ltiadvantage:migrationjob:manage`
- `POST /d2l/api/le/(version)/ltiadvantage/migration/jobs/`

### `ltiadvantage:migrationjob:view`
- `GET /d2l/api/le/(version)/ltiadvantage/migration/jobs/`
- `GET /d2l/api/le/(version)/ltiadvantage/migration/jobs/(jobId)`

### `ltiadvantage:quicklinks:create`
- `POST /d2l/api/le/(apiVersion)/ltiadvantage/quicklinks/orgunit/(orgUnitId)/link/(linkId)`

### `ltiadvantage:registrations:create`
- `POST /d2l/api/le/(version)/ltiadvantage/registration/`

### `ltiadvantage:registrations:delete`
- `DELETE /d2l/api/le/(version)/ltiadvantage/registration/(clientId)`

### `ltiadvantage:registrations:read`
- `GET /d2l/api/le/(version)/ltiadvantage/registration/`
- `GET /d2l/api/le/(version)/ltiadvantage/registration/(clientId)`
- `GET /d2l/api/le/(version)/ltiadvantage/registration/(clientId)/legacydomains/`

### `ltiadvantage:registrations:update`
- `PUT /d2l/api/le/(version)/ltiadvantage/registration/(clientId)`
- `POST /d2l/api/le/(version)/ltiadvantage/registration/(clientId)/legacydomains/`
- `PUT /d2l/api/le/(version)/ltiadvantage/registration/(clientId)/legacydomains/`

---

## Manage Courses

### `manageCourses:deploy:manage`
- `POST /d2l/api/lp/(version)/sourceCourses/(orgUnitId)/deploy`

---

## Manage Files

### `managefiles:files:manage`
- `DELETE /d2l/api/lp/(version)/(orgUnitId)/managefiles/file`
- `POST /d2l/api/lp/(version)/(orgUnitId)/managefiles/file/save`
- `POST /d2l/api/lp/(version)/(orgUnitId)/managefiles/file/upload`

### `managefiles:files:read`
- `GET /d2l/api/lp/(version)/(orgUnitId)/managefiles/file`

### `managefiles:files:read` + `managefiles:folders:read`
- `GET /d2l/api/lp/(version)/(orgUnitId)/managefiles/`

### `managefiles:folders:manage`
- `DELETE /d2l/api/lp/(version)/(orgUnitId)/managefiles/folder`
- `POST /d2l/api/lp/(version)/(orgUnitId)/managefiles/folder`

---

## News

### `news:access:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)/access/`

### `news:newsitems:manage`
- `POST /d2l/api/le/(version)/(orgUnitId)/news/`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)/attachments/`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)/attachments/(fileId)`
- `POST /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)/dismiss`
- `POST /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)/publish`
- `POST /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)/restore`
- `POST /d2l/api/le/(version)/(orgUnitId)/news/deleted/(newsItemId)/restore`

### `news:newsitems:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/news/`
- `GET /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/news/(newsItemId)/attachments/(fileId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/news/deleted/`
- `GET /d2l/api/le/(version)/(orgUnitId)/news/user/(userId)/`
- `GET /d2l/api/le/(version)/news/user/(userId)/`

---

## Organizations

### `organizations:image:read`
- `GET /d2l/api/lp/(version)/courses/(orgUnitId)/image`

### `organizations:image:update`
- `PUT /d2l/api/lp/(version)/courses/(orgUnitId)/image`

### `organizations:organization:create`
- `POST /d2l/api/lp/(version)/orgstructure/`
- `POST /d2l/api/lp/(version)/orgstructure/(orgUnitId)/children/`
- `POST /d2l/api/lp/(version)/orgstructure/(orgUnitId)/parents/`
- `POST /d2l/api/lp/(version)/orgstructure/recyclebin/(orgUnitId)/recycle`
- `POST /d2l/api/lp/(version)/orgstructure/recyclebin/(orgUnitId)/restore`

### `organizations:organization:delete`
- `DELETE /d2l/api/lp/(version)/orgstructure/(orgUnitId)/children/(childOrgUnitId)`
- `DELETE /d2l/api/lp/(version)/orgstructure/(orgUnitId)/parents/(parentOrgUnitId)`
- `DELETE /d2l/api/lp/(version)/orgstructure/recyclebin/(orgUnitId)`

### `organizations:organization:read`
- `GET /d2l/api/lp/(version)/orgstructure/`
- `GET /d2l/api/lp/(version)/orgstructure/(orgUnitId)`
- `GET /d2l/api/lp/(version)/orgstructure/(orgUnitId)/ancestors/`
- `GET /d2l/api/lp/(version)/orgstructure/(orgUnitId)/children/`
- `GET /d2l/api/lp/(version)/orgstructure/(orgUnitId)/children/paged/`
- `GET /d2l/api/lp/(version)/orgstructure/(orgUnitId)/colours`
- `GET /d2l/api/lp/(version)/orgstructure/(orgUnitId)/descendants/`
- `GET /d2l/api/lp/(version)/orgstructure/(orgUnitId)/descendants/paged/`
- `GET /d2l/api/lp/(version)/orgstructure/(orgUnitId)/parents/`
- `GET /d2l/api/lp/(version)/orgstructure/childless/`
- `GET /d2l/api/lp/(version)/orgstructure/orphans/`
- `GET /d2l/api/lp/(version)/orgstructure/recyclebin/`

### `organizations:organization:update`
- `PUT /d2l/api/lp/(version)/orgstructure/(orgUnitId)`
- `PUT /d2l/api/lp/(version)/orgstructure/(orgUnitId)/colours`

---

## Org Units

### `orgunits:course:create`
- `POST /d2l/api/lp/(version)/courses/`

### `orgunits:course:delete`
- `DELETE /d2l/api/lp/(version)/courses/(orgUnitId)`

### `orgunits:course:read`
- `GET /d2l/api/lp/(version)/courses/(orgUnitId)`

### `orgunits:course:update`
- `PUT /d2l/api/lp/(version)/courses/(orgUnitId)`

### `orgunits:coursetemplate:create`
- `POST /d2l/api/lp/(version)/coursetemplates/`

### `orgunits:sourcecourses:read`
- `GET /d2l/api/lp/(version)/sourceCourses/(orgUnitId)/currentReofferedCourse`
- `GET /d2l/api/lp/(version)/sourceCourses/(orgUnitId)/reofferedCourses`

---

## Quizzing

### `quizzing:access:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)/access/`

### `quizzing:attempts:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)/attempts/`
- `GET /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)/attempts/(attemptId)`

### `quizzing:quizzes:delete`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)/specialaccess/(userId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/quizzes/categories/(categoryId)`

### `quizzing:quizzes:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/quizzes/`
- `GET /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)/specialaccess/`
- `GET /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)/specialaccess/(userId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/quizzes/categories/`
- `GET /d2l/api/le/(version)/(orgUnitId)/quizzes/categories/(categoryId)`

### `quizzing:quizzes:read` + `quizzing:quizzes:create`
- `POST /d2l/api/le/(version)/(orgUnitId)/quizzes/`
- `POST /d2l/api/le/(version)/(orgUnitId)/quizzes/categories/`

### `quizzing:quizzes:read` + `quizzing:quizzes:write`
- `PUT /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)`
- `PUT /d2l/api/le/(version)/(orgUnitId)/quizzes/categories/(categoryId)`

### `quizzing:quizzes:write`
- `PUT /d2l/api/le/(version)/(orgUnitId)/quizzes/(quizId)/specialaccess/(userId)`

---

## Reporting

### `reporting:dataset:fetch`
- `GET /d2l/api/lp/(version)/dataExport/list/(dataSetId)`

### `reporting:dataset:list`
- `GET /d2l/api/lp/(version)/dataExport/list`

### `reporting:job:create`
- `POST /d2l/api/lp/(version)/dataExport/create`

### `reporting:job:download`
- `GET /d2l/api/lp/(version)/dataExport/download/(exportJobId)`

### `reporting:job:fetch`
- `GET /d2l/api/lp/(version)/dataExport/jobs/(exportJobId)`

### `reporting:job:list`
- `GET /d2l/api/lp/(version)/dataExport/jobs`

---

## Role

### `role:detail:create`
- `POST /d2l/api/lp/(version)/roles/`

### `role:detail:read`
- `GET /d2l/api/lp/(version)/(orgUnitId)/roles/`
- `GET /d2l/api/lp/(version)/roles/`
- `GET /d2l/api/lp/(version)/roles/(roleId)`

---

## Sections

### `sections:enrollment:create`
- `POST /d2l/api/lp/(version)/(orgUnitId)/sections/(sectionId)/enrollments/`

### `sections:own_section:read`
- `GET /d2l/api/lp/(version)/(orgUnitId)/sections/mysections/`

### `sections:section:create`
- `POST /d2l/api/lp/(version)/(orgUnitId)/sections/`
- `POST /d2l/api/lp/(version)/(orgUnitId)/sections/settings`

### `sections:section:delete`
- `DELETE /d2l/api/lp/(version)/(orgUnitId)/sections/(sectionId)`

### `sections:section:read`
- `GET /d2l/api/lp/(version)/(orgUnitId)/sections/`
- `GET /d2l/api/lp/(version)/(orgUnitId)/sections/(sectionId)`
- `GET /d2l/api/lp/(version)/(orgUnitId)/sections/(sectionId)/enrollments/`
- `GET /d2l/api/lp/(version)/(orgUnitId)/sections/(sectionId)/noenrollments`
- `GET /d2l/api/lp/(version)/(orgUnitId)/sections/enrollments/`
- `GET /d2l/api/lp/(version)/(orgUnitId)/sections/paged`
- `GET /d2l/api/lp/(version)/(orgUnitId)/sections/settings`

### `sections:section:update`
- `PUT /d2l/api/lp/(version)/(orgUnitId)/sections/`
- `PUT /d2l/api/lp/(version)/(orgUnitId)/sections/(sectionId)`
- `PUT /d2l/api/lp/(version)/(orgUnitId)/sections/settings`

---

## Sessions

### `sessions:session:delete`
- `PUT /d2l/api/lp/(version)/forceLogout/(userId)`
- `DELETE /d2l/api/lp/(version)/sessions/(userId)`

---

## Surveys

### `surveys:access:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)/access/`

### `surveys:attempts:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)/attempts/`
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)/attempts/(attemptId)`

### `surveys:surveys:delete`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)/specialaccess/(userId)`
- `DELETE /d2l/api/le/(version)/(orgUnitId)/surveys/categories/(categoryId)`

### `surveys:surveys:read`
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/`
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)/questions/`
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)/specialaccess/`
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)/specialaccess/(userId)`
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/categories/`
- `GET /d2l/api/le/(version)/(orgUnitId)/surveys/categories/(categoryId)`

### `surveys:surveys:read` + `surveys:surveys:create`
- `POST /d2l/api/le/(version)/(orgUnitId)/surveys/`
- `POST /d2l/api/le/(version)/(orgUnitId)/surveys/categories/`

### `surveys:surveys:read` + `surveys:surveys:update`
- `PUT /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)`

### `surveys:surveys:update`
- `PUT /d2l/api/le/(version)/(orgUnitId)/surveys/(surveyId)/specialaccess/(userId)`

### `surveys:surveys:update` + `surveys:surveys:write`
- `PUT /d2l/api/le/(version)/(orgUnitId)/surveys/categories/(categoryId)`

---

## Users

### `users:activation:read`
- `GET /d2l/api/lp/(version)/users/(userId)/activation`

### `users:activation:update`
- `PUT /d2l/api/lp/(version)/users/(userId)/activation`

### `users:own_pronoun:read`
- `GET /d2l/api/lp/(version)/users/mypronouns`
- `GET /d2l/api/lp/(version)/users/mypronouns/visibility`

### `users:own_pronoun:update`
- `PUT /d2l/api/lp/(version)/users/mypronouns`
- `PUT /d2l/api/lp/(version)/users/mypronouns/visibility`

### `users:password:delete`
- `DELETE /d2l/api/lp/(version)/users/(userId)/password`

### `users:password:write`
- `POST /d2l/api/lp/(version)/users/(userId)/password`
- `PUT /d2l/api/lp/(version)/users/(userId)/password`

### `users:profile:manage`
- `PUT /d2l/api/lp/(version)/profile/user/(userId)`

### `users:profile:read` + `users:own_profile:read`
- `GET /d2l/api/lp/(version)/profile/(profileId)`
- `GET /d2l/api/lp/(version)/profile/(profileId)/image`
- `GET /d2l/api/lp/(version)/profile/myProfile`
- `GET /d2l/api/lp/(version)/profile/myProfile/image`
- `GET /d2l/api/lp/(version)/profile/user/(userId)`
- `GET /d2l/api/lp/(version)/profile/user/(userId)/image`
- `GET /d2l/api/lp/(version)/users/whoami`

### `users:userdata:create`
- `POST /d2l/api/lp/(version)/users/`
- `POST /d2l/api/lp/(version)/users/batch/`

### `users:userdata:delete`
- `DELETE /d2l/api/lp/(version)/users/(userId)`

### `users:userdata:read`
- `GET /d2l/api/lp/(version)/users/`
- `GET /d2l/api/lp/(version)/users/(userId)`
- `GET /d2l/api/lp/(version)/users/(userId)/names`

### `users:userdata:update`
- `PUT /d2l/api/lp/(version)/users/(userId)`
- `PUT /d2l/api/lp/(version)/users/(userId)/names`

---

## General Fallback Scope

### `core:*:*`
This is a general fallback scope for API actions that don't have specific scopes assigned yet. This scope does not appear in the scopes index or API reference documentation for individual API actions.

**Note:** As D2L continues to provide new specific scopes for API routes, you should use those scopes instead. However, if an API action used the general fallback scope in the past, it will continue to support that scope for access.

---

**Source:** Authentication Scopes Table — Developer Platform (January 2026)
