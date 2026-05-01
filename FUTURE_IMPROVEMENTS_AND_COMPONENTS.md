# Future Improvements & New Component Suggestions

This document outlines additional improvements to existing components and suggestions for new Lit components based on feature requests, D2L API capabilities, and best practices.

---

## 🔧 Additional Improvements to Existing Components

### 1. **uga-assignment** - Additional Enhancements

#### 1.1 Add Quiz Support
**Current:** Only shows assignments and discussions  
**Enhancement:** Add quiz support using Quizzes API

```typescript
// Add quiz fetching
import { getQuizzes } from '../lib/api/d2l-client.js';

// In component:
const quizzes = await getQuizzes(this.ou, this.versions.le);
// Filter quizzes with due dates and add to assignments list
```

**Benefits:**
- Complete view of all graded items
- Better student experience
- More comprehensive due date tracking

#### 1.2 Add Content Module Support
**Current:** Shows assignments, discussions  
**Enhancement:** Show content topics/modules with due dates

```typescript
// Add content API support
import { getContentTOC, getContentTopics } from '../lib/api/d2l-client.js';
```

**Benefits:**
- Complete course overview
- Better visibility into all course requirements

#### 1.3 Add Progress Tracking
**Current:** Shows assignments  
**Enhancement:** Show completion status (submitted, graded, etc.)

**Benefits:**
- Students can see their progress
- Visual progress indicators
- Better engagement

#### 1.4 Add Filtering/Sorting UI
**Current:** Filter by type via attribute  
**Enhancement:** Add UI controls for filtering and sorting

**Benefits:**
- Better user experience
- More interactive component
- Easier to find specific items

---

### 2. **uga-instructor-card** - Enhancements

#### 2.1 Show Multiple Instructors
**Current:** Shows first instructor  
**Enhancement:** Display all instructors in a grid

**Benefits:**
- Better for team-taught courses
- More complete information

#### 2.2 Add Contact Information
**Enhancement:** Show email, office hours, etc.

**Benefits:**
- More useful for students
- Better communication

#### 2.3 Add Office Hours Display
**Enhancement:** Show office hours from instructor profile

**Benefits:**
- Convenient access to office hours
- Better student support

---

### 3. **uga-rating** - Enhancements

#### 3.1 Add Rating Display
**Current:** Only collects ratings  
**Enhancement:** Show average rating and count

**Benefits:**
- Students can see ratings before rating
- Better feedback visibility

#### 3.2 Add Rating Analytics
**Enhancement:** Show rating statistics to instructors

**Benefits:**
- Instructors can see feedback trends
- Better content improvement

#### 3.3 Add Star Rating UI
**Current:** Dropdown selection  
**Enhancement:** Visual star rating interface

**Benefits:**
- More intuitive UI
- Better user experience

---

### 4. **uga-duedate** - Enhancements

#### 4.1 Add Calendar View
**Current:** Table view  
**Enhancement:** Calendar grid view option

**Benefits:**
- Visual calendar representation
- Better time management

#### 4.2 Add Countdown Timer
**Enhancement:** Show time remaining until due date

**Benefits:**
- Urgency awareness
- Better time management

#### 4.3 Add Color Coding
**Enhancement:** Color-code by urgency (overdue, due soon, etc.)

**Benefits:**
- Quick visual scanning
- Better prioritization

---

### 5. **uga-footer** - Enhancements

#### 5.1 Add Dynamic Content
**Enhancement:** Load footer data from D2L course settings

**Benefits:**
- Automatic updates
- Less manual configuration

#### 5.2 Add Accessibility Improvements
**Enhancement:** Better ARIA labels, keyboard navigation

**Benefits:**
- WCAG compliance
- Better accessibility

---

## 🆕 New Component Suggestions

### High Priority (Based on Feature Requests)

### 1. **uga-quiz** - In-Page Formative Quizzes ⭐
**Priority:** HIGH  
**Requested by:** Chris Sparks

**Purpose:**
- Embed formative quizzes directly in content pages
- Trackable/completable for release conditions
- Multiple question types (MC, T/F, matching, short answer)

**Features:**
- Question types: Multiple choice, True/False, Matching, Short Answer, Fill-in-the-blank
- Completion tracking (store in D2L gradebook or custom data)
- Release condition integration
- Immediate feedback
- Retry attempts
- Question randomization
- Timer support

**API Requirements:**
- D2L Quizzes API (create quiz, submit responses)
- Gradebook API (store completion/grades)
- Release Conditions API (check completion)

**Implementation:**
- Lit component for simple quizzes
- React might be better for complex quiz builder
- Store completion in D2L gradebook or custom data store

**Example Usage:**
```html
<uga-quiz 
  quiz-id="quiz-1"
  questions='[
    {
      "type": "multiple-choice",
      "question": "What is 2+2?",
      "options": ["3", "4", "5", "6"],
      "correct": 1,
      "points": 10
    }
  ]'
  allow-retry="true"
  show-feedback="true">
</uga-quiz>
```

---

### 2. **uga-autograder** - Auto-Grading Component ⭐
**Priority:** HIGH  
**Requested by:** Stephanie

**Purpose:**
- Auto-grade assignments (MC, T/F, matching, etc.)
- Automatically export grades to D2L gradebook
- Link Groups tool in content pages

**Features:**
- Auto-grading for multiple question types
- Gradebook integration
- Bulk grading
- Grade export
- Feedback generation

**API Requirements:**
- D2L Gradebook API (update grades)
- Assignment Submissions API (read submissions)
- Groups API (for group assignments)

**Implementation:**
- Could extend `uga-assignment` component
- May need backend service for complex grading logic
- React might be better for grading interface

**Example Usage:**
```html
<uga-autograder 
  assignment-id="12345"
  auto-grade="true"
  export-to-gradebook="true">
</uga-autograder>
```

---

### 3. **uga-elc-google-sync** - eLC ⇄ Google Drive Course Template Sync ⭐
**Priority:** HIGH  
**Requested by:** Chris Sparks

**Purpose:**
- Admin-only widget for managing course templates
- Export template to Google Drive
- Clear template contents
- Back-copy live course files to template

**Features:**
- Admin role detection
- Template vs live course identification
- Google Drive integration
- File management (export, clear, copy)
- Batch operations

**API Requirements:**
- D2L Content API (list, download, upload, delete files)
- Course API (identify template course)
- Google Drive API (export files)
- Role detection API

**Implementation:**
- Lit component or React app/widget
- Requires significant D2L Content API integration
- May need backend service for Google Drive OAuth

**Example Usage:**
```html
<uga-elc-google-sync 
  course-id="12345"
  template-id="67890"
  google-drive-enabled="true">
</uga-elc-google-sync>
```

---

### 4. **uga-groups** - Groups Tool Integration
**Priority:** MEDIUM  
**Requested by:** Stephanie

**Purpose:**
- Link/embed Groups tool functionality in content pages
- Display group information, members, activities

**Features:**
- Display group members
- Show group activities
- Group assignment links
- Group discussion links
- Group file sharing

**API Requirements:**
- D2L Groups API
- Group membership API
- Group activities API

**Implementation:**
- Lit component should be sufficient
- Display group info, members, activities

**Example Usage:**
```html
<uga-groups 
  group-category-id="12345"
  show-members="true"
  show-activities="true">
</uga-groups>
```

---

### 5. **uga-rubric-upload** - Rubric Upload Tool
**Priority:** MEDIUM  
**Requested by:** Dee

**Purpose:**
- Upload rubrics from Word/Google Docs
- Parse rubric structure
- Create D2L rubric

**Features:**
- File upload (Word, PDF, Google Docs)
- Rubric parsing
- D2L Rubric creation
- Preview before creation
- Edit after upload

**API Requirements:**
- D2L Rubrics API
- File upload API
- File parsing (may need backend)

**Implementation:**
- React component for file upload interface
- Backend service needed for file parsing
- Integration with D2L Rubrics API

**Example Usage:**
```html
<uga-rubric-upload 
  course-id="12345"
  allow-edit="true">
</uga-rubric-upload>
```

---

### Medium Priority (Based on D2L API Capabilities)

### 6. **uga-calendar** - Course Calendar Component
**Purpose:**
- Display course calendar events
- Show due dates, events, deadlines
- Month/week/day views

**Features:**
- Calendar grid view
- Event filtering
- Due date integration
- Export to iCal
- Color coding by event type

**API Requirements:**
- D2L Calendar API
- Events API

**Example Usage:**
```html
<uga-calendar 
  view="month"
  show-due-dates="true"
  show-events="true">
</uga-calendar>
```

---

### 7. **uga-news** - News Feed Component
**Purpose:**
- Display course news items
- Filter by date, author
- Show attachments

**Features:**
- News feed display
- Filtering
- Attachment display
- Author information
- Date sorting

**API Requirements:**
- D2L News API

**Example Usage:**
```html
<uga-news 
  limit="10"
  show-attachments="true"
  filter-by-author="true">
</uga-news>
```

---

### 8. **uga-checklist** - Checklist Component
**Purpose:**
- Display course checklists
- Track completion
- Show progress

**Features:**
- Checklist display
- Completion tracking
- Progress indicators
- Category grouping

**API Requirements:**
- D2L Checklists API
- Completion tracking API

**Example Usage:**
```html
<uga-checklist 
  checklist-id="12345"
  show-progress="true"
  allow-completion="true">
</uga-checklist>
```

---

### 9. **uga-grade-display** - Grade Display Component
**Purpose:**
- Show student grades
- Display grade breakdown
- Show class statistics (for instructors)

**Features:**
- Grade display
- Category breakdown
- Class average (instructor)
- Grade distribution (instructor)
- Progress tracking

**API Requirements:**
- D2L Gradebook API
- Grade Values API

**Example Usage:**
```html
<!-- Student view -->
<uga-grade-display 
  view="student"
  show-breakdown="true">
</uga-grade-display>

<!-- Instructor view -->
<uga-grade-display 
  view="instructor"
  show-statistics="true"
  show-distribution="true">
</uga-grade-display>
```

---

### 10. **uga-content-progress** - Content Progress Tracker
**Purpose:**
- Show content completion progress
- Track module/topic completion
- Visual progress indicators

**Features:**
- Progress bars
- Completion tracking
- Module breakdown
- Time spent tracking

**API Requirements:**
- D2L Content Completions API
- Content API

**Example Usage:**
```html
<uga-content-progress 
  show-modules="true"
  show-topics="true"
  show-time-spent="true">
</uga-content-progress>
```

---

### 11. **uga-discussion-thread** - Discussion Thread Display
**Purpose:**
- Display discussion threads
- Show posts and replies
- Allow posting (if permissions allow)

**Features:**
- Thread display
- Post/reply interface
- User avatars
- Post formatting
- Attachment display

**API Requirements:**
- D2L Discussions API
- Posts API

**Example Usage:**
```html
<uga-discussion-thread 
  forum-id="12345"
  topic-id="67890"
  allow-posting="true"
  show-avatars="true">
</uga-discussion-thread>
```

---

### 12. **uga-survey** - Survey Component
**Purpose:**
- Display and collect survey responses
- Show survey results (for instructors)
- Anonymous surveys

**Features:**
- Survey display
- Response collection
- Results display (instructor)
- Anonymous option
- Multiple question types

**API Requirements:**
- D2L Surveys API
- Survey Attempts API

**Example Usage:**
```html
<uga-survey 
  survey-id="12345"
  allow-anonymous="true"
  show-results="false">
</uga-survey>
```

---

### 13. **uga-file-manager** - File Manager Component
**Purpose:**
- Display course files
- Allow file upload/download
- Organize files

**Features:**
- File listing
- File upload
- File download
- File organization
- Search/filter

**API Requirements:**
- D2L Content API
- File Management API

**Example Usage:**
```html
<uga-file-manager 
  folder-id="12345"
  allow-upload="true"
  allow-download="true">
</uga-file-manager>
```

---

### 14. **uga-announcement** - Announcement Banner
**Purpose:**
- Display course announcements
- Dismissible banners
- Priority levels

**Features:**
- Announcement display
- Dismissible
- Priority levels
- Expiration dates
- Styling options

**API Requirements:**
- D2L News API (or custom data)

**Example Usage:**
```html
<uga-announcement 
  type="warning"
  dismissible="true"
  priority="high">
  Important: Assignment due tomorrow!
</uga-announcement>
```

---

### 15. **uga-student-list** - Student Roster Component
**Purpose:**
- Display class roster
- Show student information
- Filter/search students

**Features:**
- Student list
- Search/filter
- Student profiles
- Contact information
- Role display

**API Requirements:**
- D2L Classlist API
- User API

**Example Usage:**
```html
<uga-student-list 
  show-profiles="true"
  allow-search="true"
  show-contact="false">
</uga-student-list>
```

---

### Low Priority / Nice to Have

### 16. **uga-badge** - Achievement Badge Display
**Purpose:**
- Display earned badges/awards
- Show badge requirements
- Progress tracking

**Features:**
- Badge display
- Requirements tracking
- Progress indicators
- Badge gallery

**API Requirements:**
- D2L Awards API

---

### 17. **uga-portfolio** - ePortfolio Integration
**Purpose:**
- Display ePortfolio artifacts
- Link to portfolios
- Show portfolio collections

**Features:**
- Portfolio display
- Artifact linking
- Collection views

**API Requirements:**
- D2L ePortfolio API

---

### 18. **uga-competency** - Competency Display
**Purpose:**
- Show learning competencies
- Track competency progress
- Display competency requirements

**Features:**
- Competency display
- Progress tracking
- Requirements display

**API Requirements:**
- D2L Competencies API

---

## 🏗️ Architectural Improvements

### 1. **Component Base Class**
Create a base class for common functionality:

```typescript
export abstract class BaseD2LComponent extends LitElement {
  protected abortController: AbortController | null = null;
  protected versions: ApiVersions = {};
  
  connectedCallback() {
    super.connectedCallback();
    this.abortController = new AbortController();
  }
  
  disconnectedCallback() {
    super.disconnectedCallback();
    this.abortController?.abort();
    this.abortController = null;
  }
  
  protected async initializeVersions() {
    this.versions = await getVersions();
  }
  
  protected getAbortSignal(): AbortSignal | undefined {
    return this.abortController?.signal;
  }
}
```

**Benefits:**
- Consistent AbortController handling
- Shared version management
- Less code duplication

---

### 2. **Error Boundary Component**
Create error boundary wrapper:

```typescript
@customElement('uga-error-boundary')
class UgaErrorBoundary extends LitElement {
  @property({ type: Boolean }) showDetails = false;
  
  // Catch errors from child components
  // Display user-friendly error messages
}
```

**Benefits:**
- Better error handling
- User-friendly error messages
- Debug information for developers

---

### 3. **Loading State Component**
Create reusable loading component:

```typescript
@customElement('uga-loading')
class UgaLoading extends LitElement {
  @property({ type: String }) message = 'Loading...';
  @property({ type: String }) size = 'medium'; // small, medium, large
}
```

**Benefits:**
- Consistent loading states
- Better UX
- Less code duplication

---

### 4. **Shared State Management**
Create shared state manager for common data:

```typescript
// src/lib/state/shared-state.ts
export class SharedState {
  private static instance: SharedState;
  private versions: ApiVersions | null = null;
  private courseId: string | null = null;
  private enrollment: Enrollment | null = null;
  
  // Singleton pattern
  // Components subscribe to updates
  // Automatic cache invalidation
}
```

**Benefits:**
- Single source of truth
- Automatic updates across components
- Reduced API calls

---

### 5. **Component Testing Utilities**
Create testing helpers:

```typescript
// src/lib/testing/test-helpers.ts
export function mockD2LAPI() { ... }
export function createTestComponent() { ... }
export function waitForUpdate() { ... }
```

**Benefits:**
- Easier testing
- Consistent test patterns
- Better test coverage

---

## 📊 Component Usage Analytics

### Suggestion: Add Usage Tracking
Track which components are used most:

```typescript
// Optional analytics
export function trackComponentUsage(componentName: string) {
  // Send to analytics service
  // Help prioritize improvements
}
```

**Benefits:**
- Data-driven decisions
- Identify popular components
- Prioritize improvements

---

## 🎨 UI/UX Improvements

### 1. **Dark Mode Support**
Add dark mode to all components:

```typescript
@property({ type: Boolean, attribute: 'dark-mode' }) darkMode = false;
```

**Benefits:**
- Better accessibility
- Modern UI
- User preference support

---

### 2. **Responsive Design Enhancements**
Improve mobile experience:

- Better touch targets
- Mobile-optimized layouts
- Swipe gestures

---

### 3. **Accessibility Improvements**
WCAG 2.1 AA compliance:

- Better ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

---

### 4. **Internationalization (i18n)**
Support multiple languages:

```typescript
@property({ type: String }) locale = 'en';
```

**Benefits:**
- Broader reach
- Better user experience
- Compliance requirements

---

## 🔒 Security Improvements

### 1. **Input Sanitization**
Sanitize all user inputs:

```typescript
import { sanitize } from '../lib/utils/sanitize.js';
```

**Benefits:**
- XSS prevention
- Security best practices
- Data integrity

---

### 2. **CSRF Token Management**
Centralized CSRF token handling:

```typescript
// Automatic token management
// Token refresh
// Token caching
```

**Benefits:**
- Better security
- Less code duplication
- Automatic token refresh

---

## 📈 Performance Improvements

### 1. **Virtual Scrolling**
For large lists (assignments, students, etc.):

**Benefits:**
- Better performance
- Faster rendering
- Lower memory usage

---

### 2. **Image Lazy Loading**
Already implemented, but can be enhanced:

**Benefits:**
- Faster page loads
- Reduced bandwidth
- Better performance

---

### 3. **Code Splitting**
Split components into separate bundles:

**Benefits:**
- Smaller initial bundle
- Faster load times
- Better caching

---

## 🧪 Testing Improvements

### 1. **Unit Tests**
Add unit tests for all components:

**Benefits:**
- Catch bugs early
- Better code quality
- Regression prevention

---

### 2. **Integration Tests**
Test component interactions:

**Benefits:**
- End-to-end testing
- Real-world scenarios
- Better confidence

---

### 3. **Visual Regression Tests**
Screenshot comparison:

**Benefits:**
- Catch visual bugs
- Design consistency
- Better QA

---

## 📚 Documentation Improvements

### 1. **Component Storybook**
Interactive component documentation:

**Benefits:**
- Better documentation
- Interactive examples
- Easier onboarding

---

### 2. **API Documentation**
Auto-generated API docs:

**Benefits:**
- Always up-to-date
- Better developer experience
- Type information

---

### 3. **Video Tutorials**
Create video tutorials:

**Benefits:**
- Better user adoption
- Easier learning
- Visual demonstrations

---

## 🎯 Priority Recommendations

### Immediate (Next Sprint)
1. ✅ **Fix enrollment error handling** (DONE)
2. ✅ **Add AbortController** (DONE)
3. ✅ **Add caching** (DONE)
4. **Add quiz support to uga-assignment**
5. **Create uga-groups component**

### Short Term (Next Quarter)
1. **Create uga-quiz component** (High priority feature request)
2. **Create uga-autograder component** (High priority feature request)
3. **Enhance uga-assignment with content/calendar**
4. **Create component base class**
5. **Add unit tests**

### Medium Term (Next 6 Months)
1. **Create uga-elc-google-sync** (High priority feature request)
2. **Create uga-rubric-upload** (Medium priority)
3. **Add dark mode support**
4. **Improve accessibility**
5. **Add component Storybook**

### Long Term (Next Year)
1. **Code splitting**
2. **Internationalization**
3. **Visual regression tests**
4. **Usage analytics**
5. **Advanced features**

---

## 💡 Quick Wins

These are easy improvements that provide immediate value:

1. **Add loading skeletons** to all components
2. **Add empty states** (no data messages)
3. **Improve error messages** (more helpful, actionable)
4. **Add keyboard shortcuts** (accessibility)
5. **Add tooltips** (better UX)
6. **Add copy-to-clipboard** for code examples
7. **Add print styles** (better printing)
8. **Add share buttons** (social sharing)

---

## 🔗 Related Resources

- [D2L API Documentation](https://docs.valence.desire2learn.com/)
- [Lit Documentation](https://lit.dev/)
- [UGA Design System](https://design.online.uga.edu/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated:** January 2026  
**Next Review:** March 2026
