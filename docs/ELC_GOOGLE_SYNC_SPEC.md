# eLC ⇄ Google Sync widget – specification

## Overview

Admin-only widget for eLC (Lit component **`uga-elc-google-sync`**) that enables:

1. **Export** – Archive template to Google Drive before clearing  
2. **Clear** – Clear template contents  
3. **Back-copy** – Copy live course files back to template  

For a **full** Drive ↔ **Manage Files** workflow (standalone app), use the **`uga-drive-elc-sync`** repository—not a duplicate React tree inside this repo.

## Open Questions (to resolve with UGA)

1. **Admin role detection** – What role name/ID indicates admin? (e.g., "Administrator", role ID 169?)
2. **Template vs live identification** – How does UGA identify which course is the template? (course code pattern, metadata, org unit type?)
3. **Course relationship** – How to find the template course associated with a live course?
4. **Google Drive auth** – Service account vs. user OAuth?

## D2L API Requirements

### Content / Course Files

- **List files** – D2L has LE Content API (`/content/toc`, modules, topics). For **Manage Files** (course file storage), different endpoints may apply. See:
  - [D2L File Upload](https://docs.valence.desire2learn.com/basic/fileupload.html)
  - [Course Files API](https://community.d2l.com/brightspace/discussion/2940/file-upload-using-new-course-files-apis)
- **Download files** – Fetch file content from content topics or managed files
- **Upload files** – Resumable upload API
- **Delete files** – Delete content/modules
- **Copy between courses** – May require iterate + download + upload pattern

### Org Unit / Course

- **Org Unit API** – Get course details, parent/child relationships
- **Template identification** – Org unit type, course code pattern, or custom property

### Roles

- **Enrollment API** – `getEnrollment(ou, lpVersion)` returns `Role.Name`, `Role.Id`
- **Admin roles** – Typically role IDs 169 (Admin), 170+ (Instructor variants). UGA to confirm.

## Google Drive API

- **OAuth 2.0** – User consent for Drive access (needs backend for token storage)
- **Service account** – Server-to-server, no user interaction (simpler for automation)
- **Operations** – Create folder, upload files, list/export

## Implementation Phases

### Phase 1: Proof of concept

- [x] Admin detection (reuse `uga-instructor-note` pattern)
- [x] Basic UI with three action buttons (Lit MVP + stubs)
- [x] D2L API: Get current course (ou), fetch content TOC
- [x] Read-only: List template/live files (if API allows)

### Phase 2: D2L file operations

- [ ] List course files (Manage Files or Content)
- [ ] Download file(s)
- [ ] Delete/clear (with confirmation)
- [ ] Copy files between courses (template ↔ live)

### Phase 3: Google Drive

- [ ] Backend OAuth or service account
- [ ] Export: Zip course files → Upload to Drive
- [ ] Optional: Create dated folder per export

### Phase 4: Template/live relationship

- [ ] Resolve how to identify template course from live course
- [ ] Wire Export/Clear/Back-copy to correct source/target
