# Feature Requests from Instructional Designers

This document tracks feature requests from the instructional design team for **eLC** (UGA’s online learning environment; Brightspace-based) components.

## Current Requests (January 2026)

### 1. Trackable In-Page Formative Quizzes ⭐ HIGH PRIORITY
**Requested by:** Chris Sparks  
**Description:** 
- Embed formative quizzes directly in content pages
- Must be trackable/completable so release conditions can be tied to them
- Use case: Students can't take summative assessments until they've completed embedded formative quizzes
- **Note:** Creator+ has in-page quizzes, but UGA/USG doesn't have this add-on. Would need custom solution.

**Technical Considerations:**
- Would need to track completion status in eLC
- Integration with eLC release conditions API (Valence)
- May require React for complex quiz interactions
- Storage of quiz responses and completion data
- Question types: multiple choice, true/false, matching, short answer, etc.

**Implementation Approach:**
- Could build as Lit component for simple quizzes
- React might be better for complex quiz builder/editor
- Need to store completion data (possibly in the eLC gradebook or custom data store)

### 2. Autograding and Gradebook Export for Assignments ⭐ HIGH PRIORITY
**Requested by:** Stephanie  
**Description:**
- Auto-grade assignments (multiple choice, true/false, matching, etc.)
- Automatically export grades to the eLC gradebook
- Link Groups tool in content pages

**Technical Considerations:**
- Integration with the eLC gradebook API (Valence)
- Assignment submission API
- Groups API integration for content linking
- Could potentially extend existing `uga-assignment` component
- Auto-grading logic for different question types

**Implementation Approach:**
- Could extend `uga-assignment` component
- May need backend service for complex grading logic
- React might be better for grading interface

### 3. Rubric Upload / Import Tool
**Requested by:** Dee  
**Description:**
- Tool to upload rubrics created in a document file (Word, Google Docs, etc.)
- Import rubric definitions from external files (CSV/JSON)
- Parse rubric structure and create an eLC rubric

**Technical Considerations:**
- File upload and parsing (Word, PDF, Google Docs)
- CSV/JSON schema validation before import
- eLC Rubrics API integration (Valence)
- Rubric structure parsing and mapping
- May require backend service for file processing
- OCR or text extraction for PDFs

**Implementation Approach:**
- React component for file upload interface
- Backend service needed for file parsing
- Integration with the eLC Rubrics API (Valence)

### 4. In-Video Quizzes (LTI Use Cases)
**Requested by:** Stephen  
**Description:**
- Support for in-video quizzes when using LTI (Learning Tools Interoperability)
- Currently works via external learning tool, but problematic when inserted into HTML pages
- **Note:** `<uga-video>` component exists but doesn't solve LTI use cases

**Technical Considerations:**
- LTI integration
- Video player API hooks for quiz insertion points
- May require coordination with Kaltura LTI tools
- Complex interaction between video player and quiz overlay
- Timing/trigger points in video

**Implementation Approach:**
- Could extend `uga-video` component
- May need React for complex quiz overlay interactions
- LTI integration is complex - may need backend service

### 5. Groups Tool Integration in Content
**Requested by:** Stephanie  
**Description:**
- Link/embed Groups tool functionality in content pages
- Display group information, members, activities

**Technical Considerations:**
- eLC Groups API (Valence)
- Group membership API
- Content embedding patterns
- Could be extension of existing components

**Implementation Approach:**
- Lit component should be sufficient
- Could create `uga-groups` component
- Display group info, members, activities

### 6. Course Template Management Widget ⭐ HIGH PRIORITY
**Requested by:** Chris Sparks  
**Date:** January 2026  
**Description:**
- Admin-only widget for managing course templates and live course files
- Should be placed in a live class and only visible to admins
- When clicked, performs three operations:
  1. **Export:** Export the original template for the live course to Google Drive
  2. **Clear:** Clear the template contents
  3. **Back-copy:** Back-copy the live course's files to the template

**Use Case:**
- Administrators need to manage course templates
- Sync live course content back to templates
- Archive template versions to Google Drive before clearing

**Technical Considerations:**
- **Admin Role Detection:** Need to identify admin role names/codes in eLC
- **Template vs Live Course Identification:** How to determine which course is the template (course code pattern, metadata, property?)
- **Google Drive API Integration:** 
  - OAuth authentication or service account
  - File upload/export functionality
- **eLC Content API (Valence):** Need endpoints for:
  - Listing course files
  - Downloading files from course
  - Uploading files to course
  - Deleting files from course
  - Copying files between courses (template ↔ live)
- **Course Relationship:** Need to identify template course associated with live course

**Implementation Approach:**
- Could be Lit component (`uga-elc-google-sync`) or separate React app/widget
- Requires significant eLC Content API integration
- Google Drive API integration (may need backend service for OAuth)
- File management operations between courses
- Admin-only visibility (similar to `uga-instructor-note` role checking)

**Open Questions:**
1. What role name/code indicates admin? (e.g., "Administrator", "System Administrator", specific role ID?)
2. How to identify template course? (course code pattern, metadata field, configuration?)
3. Google Drive authentication: service account or user OAuth?
4. Should this be a Lit component or separate React app/widget?

## Implementation Notes

### Technology Stack Considerations

**Lit Components (Current Stack):**
- ✅ Good for: Display components, simple interactions, content embedding
- ❌ Limitations: Complex state management, file processing, heavy API integrations
- **Best for:** Groups integration, simple quiz display

**React (Alternative/Complementary):**
- ✅ Better for: Complex forms, quiz interactions, file uploads, state-heavy features
- ✅ Better for: Quiz builder/editor interfaces, grading interfaces
- **Best for:** In-page quizzes, rubric upload, autograding interface

**Hybrid Approach:**
- Use Lit for simple display components
- Use React for complex interactive features
- Both can coexist in the same bundle or separate bundles

### API Requirements

All features would require:
- eLC Valence/LP API access (Learning Platform API for Brightspace)
- Appropriate permissions (instructor/admin level for most)
- Understanding of eLC/Brightspace data models (rubrics, gradebook, groups, quizzes, etc.)
- Release Conditions API (for #1)
- Gradebook API (for #2)
- Rubrics API (for #4)
- LTI integration (for #5)
- Groups API (for #6)
- Content API (for #6 - template management)
- Google Drive API (for #6 - template export)

### Priority Assessment

**High Priority:**
1. Trackable In-Page Formative Quizzes (most requested, enables important workflow)
2. Autograding and Gradebook Export (directly impacts instructor workload)
3. Course Template Management Widget (admin workflow automation)

**Medium Priority:**
4. Rubric Upload Tool (convenience feature)
5. In-Video Quizzes (LTI) (specific use case)
6. Groups Tool Integration (mentioned as part of #2)

## Next Steps

1. **Research eLC (Valence) APIs:**
   - Quiz/Assessment APIs
   - Gradebook API
   - Rubrics API
   - Groups API
   - Release Conditions API
   - LTI integration options
   - Content API (for template management)
   - Course/Org Unit API (for template identification)

2. **Prototype Planning:**
   - Start with highest priority items
   - Determine if Lit or React is better fit
   - Plan API integration approach
   - Consider backend service needs

3. **Proof of Concept:**
   - Build minimal viable version
   - Test with instructional designers
   - Iterate based on feedback

## Related Existing Components

- `uga-assignment` - Displays assignments (could be extended for autograding)
- `uga-video` - Video embedding (already exists, but doesn't handle LTI quizzes)
- `uga-rating` - Feedback collection (similar pattern for quiz responses)

## Future Project List

Broader institutional projects and ideas for future development, beyond eLC component feature requests.

### Academic Operations
- **Course transfer equivalency processing** — Extracting transcript data, matching internal courses, updating student databases
- **HR policy and student handbook chat bots**
- **Transcript processing assistance for departments**

### Teaching & Learning
- **Virtual TA assistants** for 24/7 student support
- **Faculty tech support agents** that pull from multiple IT knowledge bases

### Student Services
- **Email coaching for student workers** — Feedback without (re)writing for them
- **Knowledge base creators** that research and compile topic materials

---

## References

- Valence API (Learning Platform API for eLC/Brightspace): https://docs.valence.desire2learn.com/
- Brightspace Release Conditions (eLC): https://documentation.brightspace.com/
- LTI Specification: https://www.imsglobal.org/activity/learning-tools-interoperability
- Gradebook API (Valence): https://docs.valence.desire2learn.com/res/gradebook.html
- Rubrics API (Valence): https://docs.valence.desire2learn.com/res/rubrics.html
