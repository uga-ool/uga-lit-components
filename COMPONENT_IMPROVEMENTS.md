# Component Improvements Based on D2L API Documentation

This document provides improvement suggestions for all LTI components based on the D2L API documentation review and best practices.

---

## Overview

Based on the comprehensive D2L API documentation review, here are suggested improvements for components beyond `uga-assignment`:

---

## 1. **uga-instructor-card** Improvements

### Current Implementation
- Uses `getClasslist()` to fetch all users
- Filters for instructor role client-side
- Fetches profile image separately

### Recommended Improvements

#### 1.1 Use Paged Classlist Endpoint
```typescript
// Current: Uses non-paged endpoint
const users = await getClasslist(orgUnitId, this.versions.le);

// Improved: Use paged endpoint for large classes
export async function getClasslistPaged(
  ou: string,
  leVersion: string,
  options?: {
    pageSize?: number; // 1-200, default is 20
    searchText?: string; // Filter by name
  }
): Promise<ClasslistUser[]> {
  const allUsers: ClasslistUser[] = [];
  let bookmark: string | null = null;
  
  do {
    const params = new URLSearchParams();
    if (options?.pageSize) params.append('pageSize', options.pageSize.toString());
    if (options?.searchText) params.append('searchText', options.searchText);
    if (bookmark) params.append('bookmark', bookmark);
    
    const response = await withRetry(() => 
      axios.get(`/d2l/api/le/${leVersion}/${ou}/classlist/paged/?${params.toString()}`)
    );
    
    const data = response.data;
    const users = data.Items || data.Objects || [];
    allUsers.push(...users);
    bookmark = data.Next || null;
  } while (bookmark);
  
  return allUsers;
}
```

**Benefits:**
- Handles large classes without timeout
- Supports filtering by name (useful for finding specific instructors)
- More efficient memory usage

#### 1.2 Filter by Role on Server-Side
```typescript
// Add role filtering to classlist query
const instructors = await getClasslistPaged(this.ou, this.versions.le, {
  pageSize: 100,
  // Could add roleId filter if API supports it
});
```

#### 1.3 Add API Version Checking
```typescript
import { logApiVersionWarning } from '../lib/api/d2l-client.js';

async _fetchClasslist(orgUnitId: string): Promise<ClasslistUser[]> {
  if (!this.versions.le) {
    throw new Error("API versions not loaded");
  }
  
  // Warn about deprecated API versions
  logApiVersionWarning(this.versions.le, 'getClasslist');
  
  return await getClasslist(orgUnitId, this.versions.le);
}
```

#### 1.4 Add Retry Logic for Profile Image
```typescript
async _resolveImageSrc(userId: number): Promise<string> {
  if (!userId || !this.versions.lp) return "";
  try {
    const url = `/d2l/api/lp/${this.versions.lp}/profile/user/${userId}/image`;
    // Use withRetry for profile image fetch
    const res = await withRetry(() => 
      axios.get(url, { responseType: "blob" })
    );
    
    if (res?.data && res.headers["content-type"]?.startsWith("image/")) {
      return URL.createObjectURL(res.data);
    }
  } catch (err) {
    console.warn("No profile image available", err);
  }
  return "";
}
```

#### 1.5 Handle Multiple Instructors
```typescript
// Show all instructors, not just the first one
_pickInstructorsFromClasslist(items: ClasslistUser[] = []): Array<{ userId: number; name: string }> {
  const norm = (s: string | undefined): string => String(s ?? "").toLowerCase();
  
  // Find all Banner Instructors first
  let picks = items.filter(
    (u: ClasslistUser) => norm(u.ClasslistRoleDisplayName).includes("banner instructor")
  );
  
  // If no Banner Instructors, find regular Instructors
  if (picks.length === 0) {
    picks = items.filter(
      (u: ClasslistUser) => norm(u.ClasslistRoleDisplayName).includes("instructor")
    );
  }
  
  return picks.map(pick => ({
    userId: Number(pick.Identifier || pick.UserId || 0),
    name: pick.DisplayName || `${pick.FirstName || ''} ${pick.LastName || ''}`.trim() || 'Unknown',
  }));
}
```

---

## 2. **uga-instructor-note** Improvements

### Current Implementation
- Uses `getUser()` and `getEnrollment()` to check role
- No error handling for API failures
- No retry logic

### Recommended Improvements

#### 2.1 Add Retry Logic
```typescript
import { getVersions, getUser, getEnrollment } from '../lib/api/d2l-client.js';
// All API calls in d2l-client already use withRetry, but ensure error handling

async init(): Promise<void> {
  try {
    const versions = await getVersions();
    for (let key in versions) {
      this.versions[key] = versions[key];
    }

    this.currentUser = await getUser(this.versions.lp);
    this.ou = getCourse() || '';

    if (this.ou) {
      const enrollmentData = await getEnrollment(this.ou, this.versions.lp);
      this.enrollment = enrollmentData.Role?.Name || 'Student';
    }

    if (this.filename !== '' && this.type) {
      this.text = await loadData<string>(this.type as 'local' | 'program', this.filename, this.program);
      this.requestUpdate();
    }
  } catch (error: any) {
    console.error('Failed to initialize instructor note:', error);
    // Show error state to user
    this.errorMessage = error.message || 'Failed to load instructor note';
    this.requestUpdate();
  }
}
```

#### 2.2 Add API Version Checking
```typescript
import { logApiVersionWarning } from '../lib/api/d2l-client.js';

async init(): Promise<void> {
  const versions = await getVersions();
  
  // Check API versions
  if (versions.lp) {
    logApiVersionWarning(versions.lp, 'getUser');
  }
  if (versions.lp) {
    logApiVersionWarning(versions.lp, 'getEnrollment');
  }
  
  // ... rest of init
}
```

#### 2.3 Add Loading State
```typescript
@state() private loading = true;
@state() private errorMessage: string | null = null;

render() {
  if (this.loading) {
    return html`<div>Loading instructor note...</div>`;
  }
  
  if (this.errorMessage) {
    return html`<div class="error">${this.errorMessage}</div>`;
  }
  
  if (!this.excludedRoles.includes(this.enrollment)) {
    return html`...existing render...`;
  }
  
  return html``;
}
```

#### 2.4 Use More Specific Role Checking
```typescript
// Instead of just checking role name, also check role ID
// This is more reliable across different D2L instances
private isInstructorRole(enrollment: Enrollment): boolean {
  const roleName = enrollment.Role?.Name || '';
  const roleId = enrollment.Role?.Id;
  
  // Common instructor role IDs (may vary by institution)
  const instructorRoleIds = [170, 171, 172]; // Adjust based on your institution
  
  return (
    !this.excludedRoles.includes(roleName) ||
    (roleId !== undefined && instructorRoleIds.includes(roleId))
  );
}
```

---

## 3. **uga-rating** Improvements

### Current Implementation
- Uses discussions API to find forums, topics, and posts
- No pagination support
- No retry logic for API calls

### Recommended Improvements

#### 3.1 Add Pagination Support for Posts
```typescript
// Current: Fetches all posts at once
const postData = await axios.get(`/d2l/api/le/${leVersion}/${ou}/discussions/forums/${forumId}/topics/${topicId}/posts/`);

// Improved: Use paged endpoint
export async function getPostsPaged(
  ou: string,
  leVersion: string,
  forumId: number,
  topicId: number,
  options?: {
    pageSize?: number;
    searchText?: string;
  }
): Promise<DiscussionPost[]> {
  const allPosts: DiscussionPost[] = [];
  let bookmark: string | null = null;
  
  do {
    const params = new URLSearchParams();
    if (options?.pageSize) params.append('pageSize', options.pageSize.toString());
    if (options?.searchText) params.append('searchText', options.searchText);
    if (bookmark) params.append('bookmark', bookmark);
    
    const response = await withRetry(() =>
      axios.get(`/d2l/api/le/${leVersion}/${ou}/discussions/forums/${forumId}/topics/${topicId}/posts/paged/?${params.toString()}`)
    );
    
    const data = response.data;
    const posts = data.Items || data.Objects || [];
    allPosts.push(...posts);
    bookmark = data.Next || null;
  } while (bookmark);
  
  return allPosts;
}
```

#### 3.2 Add Retry Logic
```typescript
// Wrap all API calls with retry logic
async findForum(forumData: any): Promise<void> {
  try {
    const forums = await withRetry(() => 
      getForums(this.ou, this.versions.le)
    );
    
    for (let i in forums) {
      if (forums[i]["Name"] === this.forumName) {
        this.forumId = forums[i]["ForumId"];
        return;
      }
    }
  } catch (error: any) {
    console.error('Error finding forum:', error);
    this.errorMessage = `Failed to find forum: ${error.message}`;
  }
}
```

#### 3.3 Add API Version Checking
```typescript
import { logApiVersionWarning } from '../lib/api/d2l-client.js';

connectedCallback(): void {
  super.connectedCallback();
  
  getVersions().then((versions) => {
    this.versions = versions;
    
    // Check API versions
    if (versions.le) {
      logApiVersionWarning(versions.le, 'getForums');
      logApiVersionWarning(versions.le, 'getTopics');
      logApiVersionWarning(versions.le, 'getPosts');
    }
    
    // ... rest of initialization
  });
}
```

#### 3.4 Improve Error Handling
```typescript
@state() private errorMessage: string | null = null;
@state() private loading = false;

async submitRating(): Promise<void> {
  if (this.selected === null || this.selected === '0') {
    this.error = true;
    this.errorMessage = 'Please select a rating';
    this.requestUpdate();
    return;
  }
  
  this.loading = true;
  this.errorMessage = null;
  
  try {
    const rating = this.selected;
    const feedbackField = this.querySelector('#feedback-field') as HTMLInputElement;
    const feedback = feedbackField?.value || '';
    
    // Use withRetry for API call
    await withRetry(() => 
      createPost(this.ou, this.versions.le, this.forumId, this.topicId, 
        `Rating: ${rating} | ${this.contentId}`, feedback)
    );
    
    // Success handling
    this.reviewExists = true;
    this.error = false;
  } catch (error: any) {
    console.error('Error submitting rating:', error);
    this.error = true;
    this.errorMessage = error.response?.data?.Message || error.message || 'Failed to submit rating';
  } finally {
    this.loading = false;
    this.requestUpdate();
  }
}
```

---

## 4. **uga-duedate** Improvements

### Current Implementation
- Uses `getMyItemsDue()` endpoint (good!)
- Falls back to assignments and discussions if needed
- No pagination support in fallback

### Recommended Improvements

#### 4.1 Add Pagination for Fallback Endpoints
```typescript
// When falling back to assignments/discussions, use paged endpoints
if (allGradeValues.length === 0) {
  // Use paged assignments endpoint
  const assignments = await getAssignmentsPaged(this.ou, this.versions.le, {
    pageSize: 200
  });
  
  // Use paged discussions endpoint
  const forums = await getForumsPaged(this.ou, this.versions.le, {
    pageSize: 100
  });
}
```

#### 4.2 Add API Version Checking
```typescript
import { logApiVersionWarning } from '../lib/api/d2l-client.js';

connectedCallback(): void {
  super.connectedCallback();
  
  getVersions().then((versions) => {
    this.versions = versions;
    
    if (versions.le) {
      logApiVersionWarning(versions.le, 'getMyItemsDue');
      logApiVersionWarning(versions.le, 'getAssignments');
      logApiVersionWarning(versions.le, 'getForums');
    }
    
    // ... rest of initialization
  });
}
```

#### 4.3 Add Caching for Performance
```typescript
// Cache assignments/discussions data to avoid repeated API calls
private cachedAssignments: Assignment[] | null = null;
private cacheTimestamp: number = 0;
private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async getAssignmentsCached(): Promise<Assignment[]> {
  const now = Date.now();
  if (this.cachedAssignments && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
    return this.cachedAssignments;
  }
  
  this.cachedAssignments = await getAssignments(this.ou, this.versions.le);
  this.cacheTimestamp = now;
  return this.cachedAssignments;
}
```

---

## 5. **uga-footer** Improvements

### Current Implementation
- Loads JSON data from file
- No API calls (static component)
- Good error handling already

### Recommended Improvements

#### 5.1 Add Retry Logic for JSON Loading
```typescript
async getDataFile(): Promise<void> {
  this.loadError = null;
  
  try {
    let dataFile: FooterResponse | any;
    
    if (this.program) {
      const programFilename = 'footer.json';
      // Use withRetry for network requests
      dataFile = await withRetry(() => 
        loadData<FooterResponse>('program', programFilename, this.program)
      );
    } else {
      if (!this.filename) {
        this.loadError = 'Missing filename. Use filename="footer-demo.json" (or your JSON file).';
        this.loaded = true;
        this.requestUpdate();
        return;
      }
      const url = this.cacheBust ? `${this.filename}?t=${Date.now()}` : this.filename;
      // Use withRetry for network requests
      dataFile = await withRetry(() => 
        loadData<FooterResponse>('local', url)
      );
    }
    
    // ... rest of processing
  } catch (error: any) {
    // ... error handling
  }
}
```

#### 5.2 Add Loading State
```typescript
@state() private loading = false;

async getDataFile(): Promise<void> {
  this.loading = true;
  this.loadError = null;
  
  try {
    // ... load data
  } finally {
    this.loading = false;
    this.loaded = true;
    this.requestUpdate();
  }
}

render() {
  if (this.loading) {
    return html`<div>Loading footer...</div>`;
  }
  
  // ... rest of render
}
```

---

## 6. General Improvements for All Components

### 6.1 Add Consistent Error Handling Pattern
```typescript
// Create a base class or mixin for consistent error handling
interface ComponentError {
  message: string;
  code?: string;
  retryable?: boolean;
}

@state() protected error: ComponentError | null = null;
@state() protected loading = false;

protected handleError(error: any, context: string): void {
  console.error(`Error in ${context}:`, error);
  
  this.error = {
    message: error.response?.data?.Message || error.message || 'An unexpected error occurred',
    code: error.response?.status?.toString(),
    retryable: error.response?.status === 429 || error.response?.status >= 500
  };
  
  this.loading = false;
  this.requestUpdate();
}
```

### 6.2 Add API Version Checking Utility
```typescript
// Add to all components that use D2L APIs
import { logApiVersionWarning, checkApiVersion } from '../lib/api/d2l-client.js';

connectedCallback(): void {
  super.connectedCallback();
  
  getVersions().then((versions) => {
    this.versions = versions;
    
    // Check all API versions used by this component
    if (versions.le) {
      logApiVersionWarning(versions.le, 'ComponentName');
    }
    if (versions.lp) {
      logApiVersionWarning(versions.lp, 'ComponentName');
    }
    
    // ... rest of initialization
  });
}
```

### 6.3 Add Loading States
```typescript
// All components should have loading states
@state() private loading = false;

render() {
  if (this.loading) {
    return html`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <div class="util-pad-all-md">
        <p>Loading...</p>
      </div>
    `;
  }
  
  // ... rest of render
}
```

### 6.4 Add Accessibility Improvements
```typescript
// Add ARIA labels and roles
render() {
  return html`
    <div role="status" aria-live="polite" aria-busy="${this.loading}">
      ${this.loading ? html`<span aria-label="Loading content">Loading...</span>` : ''}
      ${this.error ? html`<div role="alert">${this.error.message}</div>` : ''}
      <!-- content -->
    </div>
  `;
}
```

### 6.5 Add Type Safety Improvements
```typescript
// Use proper types from d2l.ts instead of 'any'
import type { 
  ApiVersions, 
  ClasslistUser, 
  Enrollment, 
  User,
  DiscussionForum,
  DiscussionTopic,
  DiscussionPost
} from '../types/d2l.js';

// Instead of:
private currentUser: any = {};

// Use:
private currentUser: User | null = null;
```

---

## 7. New Utility Functions to Add

### 7.1 Pagination Helper
```typescript
// Add to d2l-client.ts
export async function fetchPaged<T>(
  url: string,
  options?: {
    pageSize?: number;
    bookmark?: string | null;
    [key: string]: any;
  }
): Promise<{ items: T[]; nextBookmark: string | null }> {
  const params = new URLSearchParams();
  if (options?.pageSize) params.append('pageSize', options.pageSize.toString());
  if (options?.bookmark) params.append('bookmark', options.bookmark);
  
  // Add other options as query params
  for (const [key, value] of Object.entries(options || {})) {
    if (key !== 'pageSize' && key !== 'bookmark' && value !== undefined) {
      params.append(key, String(value));
    }
  }
  
  const queryString = params.toString();
  const fullUrl = `${url}${queryString ? '?' + queryString : ''}`;
  
  const response = await withRetry(() => axios.get(fullUrl));
  const data = response.data;
  
  let items: T[] = [];
  let nextBookmark: string | null = null;
  
  if (Array.isArray(data)) {
    items = data;
  } else if (data && Array.isArray(data.Items)) {
    items = data.Items;
    nextBookmark = data.Next || null;
  } else if (data && Array.isArray(data.Objects)) {
    items = data.Objects;
    nextBookmark = data.Next || null;
  }
  
  return { items, nextBookmark };
}
```

### 7.2 Fetch All Pages Helper
```typescript
// Add to d2l-client.ts
export async function fetchAllPages<T>(
  url: string,
  options?: {
    pageSize?: number;
    [key: string]: any;
  }
): Promise<T[]> {
  const allItems: T[] = [];
  let bookmark: string | null = null;
  
  do {
    const result = await fetchPaged<T>(url, { ...options, bookmark });
    allItems.push(...result.items);
    bookmark = result.nextBookmark;
  } while (bookmark);
  
  return allItems;
}
```

---

## 8. Priority Recommendations

### High Priority
1. **Add retry logic** to all API calls (already done in d2l-client, but ensure all components use it)
2. **Add API version checking** to all components using D2L APIs
3. **Add pagination support** for components that fetch lists (instructor-card, rating, duedate)
4. **Add consistent error handling** across all components

### Medium Priority
5. **Add loading states** to all components
6. **Improve type safety** (replace `any` with proper types)
7. **Add caching** for frequently accessed data
8. **Add accessibility improvements** (ARIA labels, roles)

### Low Priority
9. **Add performance monitoring** (log API call times)
10. **Add unit tests** for API utility functions
11. **Add documentation** for each component's API usage

---

## 9. Implementation Notes

- All improvements maintain backward compatibility
- Can be implemented incrementally
- Test each change with real D2L data
- Monitor API rate limits when adding bulk operations
- Consider adding feature flags for new functionality

---

## 10. Testing Checklist

For each component improvement:
- [ ] Test with small classes (< 50 students)
- [ ] Test with large classes (> 200 students)
- [ ] Test with rate limiting (429 errors)
- [ ] Test with network failures
- [ ] Test with deprecated API versions
- [ ] Test with missing data (null/undefined)
- [ ] Test accessibility with screen readers
- [ ] Test loading states
- [ ] Test error states

---

**Source:** Based on D2L API documentation review and best practices (January 2026)
