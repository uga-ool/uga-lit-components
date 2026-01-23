# Feature Requests from Instructional Designers

This document tracks feature requests from the instructional design team for eLC/Brightspace components.

## Current Requests (January 2026)

### 1. Trackable In-Page Formative Quizzes ⭐ HIGH PRIORITY
**Requested by:** Chris Sparks  
**Description:** 
- Embed formative quizzes directly in content pages
- Must be trackable/completable so release conditions can be tied to them
- Use case: Students can't take summative assessments until they've completed embedded formative quizzes
- **Note:** Creator+ has in-page quizzes, but UGA/USG doesn't have this add-on. Would need custom solution.

**Technical Considerations:**
- Would need to track completion status in D2L
- Integration with D2L release conditions API
- May require React for complex quiz interactions
- Storage of quiz responses and completion data
- Question types: multiple choice, true/false, matching, short answer, etc.

**Implementation Approach:**
- Could build as Lit component for simple quizzes
- React might be better for complex quiz builder/editor
- Need to store completion data (possibly in D2L gradebook or custom data store)

### 2. Autograding and Gradebook Export for Assignments ⭐ HIGH PRIORITY
**Requested by:** Stephanie  
**Description:**
- Auto-grade assignments (multiple choice, true/false, matching, etc.)
- Automatically export grades to D2L gradebook
- Link Groups tool in content pages

**Technical Considerations:**
- Integration with D2L Gradebook API
- Assignment submission API
- Groups API integration for content linking
- Could potentially extend existing `uga-assignment` component
- Auto-grading logic for different question types

**Implementation Approach:**
- Could extend `uga-assignment` component
- May need backend service for complex grading logic
- React might be better for grading interface

### 3. Rubric Upload Tool
**Requested by:** Dee  
**Description:**
- Tool to upload rubrics created in a document file (Word, Google Docs, etc.)
- Parse rubric structure and create D2L rubric

**Technical Considerations:**
- File upload and parsing (Word, PDF, Google Docs)
- D2L Rubrics API integration
- Rubric structure parsing and mapping
- May require backend service for file processing
- OCR or text extraction for PDFs

**Implementation Approach:**
- React component for file upload interface
- Backend service needed for file parsing
- Integration with D2L Rubrics API

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
- D2L Groups API
- Group membership API
- Content embedding patterns
- Could be extension of existing components

**Implementation Approach:**
- Lit component should be sufficient
- Could create `uga-groups` component
- Display group info, members, activities

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
- D2L Valence/LP API access
- Appropriate permissions (instructor/admin level for most)
- Understanding of D2L data models (rubrics, gradebook, groups, quizzes, etc.)
- Release Conditions API (for #1)
- Gradebook API (for #2)
- Rubrics API (for #3)
- LTI integration (for #4)
- Groups API (for #5)

### Priority Assessment

**High Priority:**
1. Trackable In-Page Formative Quizzes (most requested, enables important workflow)
2. Autograding and Gradebook Export (directly impacts instructor workload)

**Medium Priority:**
3. Rubric Upload Tool (convenience feature)
4. In-Video Quizzes (LTI) (specific use case)
5. Groups Tool Integration (mentioned as part of #2)

## Next Steps

1. **Research D2L APIs:**
   - Quiz/Assessment APIs
   - Gradebook API
   - Rubrics API
   - Groups API
   - Release Conditions API
   - LTI integration options

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

## References

- D2L API Documentation: https://docs.valence.desire2learn.com/
- Brightspace Release Conditions: https://documentation.brightspace.com/
- LTI Specification: https://www.imsglobal.org/activity/learning-tools-interoperability
- D2L Gradebook API: https://docs.valence.desire2learn.com/res/gradebook.html
- D2L Rubrics API: https://docs.valence.desire2learn.com/res/rubrics.html
