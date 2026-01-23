# D2L API Review & Suggested Improvements

Based on the D2L API documentation (Dropboxes API and Grades API), here are suggested improvements for the components:

## 1. **Submissions API - Use Paged Endpoint for Large Classes**

### Current Implementation
- Uses `/dropbox/folders/{folderId}/submissions/` which returns all submissions at once
- May fail or be slow for large classes

### Recommended Improvement
```typescript
// Add support for paged submissions endpoint
export async function getAssignmentSubmissionsPaged(
  ou: string,
  leVersion: string,
  assignmentId: number,
  activeOnly: boolean = true
): Promise<AssignmentSubmission[]> {
  const allSubmissions: AssignmentSubmission[] = [];
  let bookmark: string | null = null;
  
  do {
    const params = new URLSearchParams();
    if (activeOnly) params.append('activeOnly', 'true');
    if (bookmark) params.append('bookmark', bookmark);
    
    const response = await axios.get(
      `/d2l/api/le/${leVersion}/${ou}/dropbox/folders/${assignmentId}/submissions/paged/?${params.toString()}`
    );
    
    const page = response.data;
    const entityDropboxes = page.Items || [];
    
    // Transform and add to allSubmissions...
    
    bookmark = page.Next || null;
  } while (bookmark);
  
  return allSubmissions;
}
```

**Benefits:**
- Handles large classes without timeout
- Supports `activeOnly` parameter to filter inactive students
- More efficient memory usage

---

## 2. **Grade Values API - Handle Pagination**

### Current Implementation
- Uses `/grades/{gradeObjectId}/values/` which may return paginated results
- Doesn't handle `ObjectListPage` structure with bookmarks

### Recommended Improvement
```typescript
export async function getGradeValues(
  ou: string,
  leVersion: string,
  gradeObjectId: number,
  options?: {
    isGraded?: boolean;
    sort?: string;
    pageSize?: number;
  }
): Promise<GradeValue[]> {
  const params = new URLSearchParams();
  if (options?.isGraded !== undefined) params.append('isGraded', options.isGraded.toString());
  if (options?.sort) params.append('sort', options.sort);
  if (options?.pageSize) params.append('pageSize', options.pageSize.toString());
  
  const grades = await axios.get(
    `/d2l/api/le/${leVersion}/${ou}/grades/${gradeObjectId}/values/?${params.toString()}`
  );
  
  // Handle ObjectListPage structure with pagination
  const data = grades.data;
  let userGradeValues: any[] = [];
  
  if (data.Items) {
    userGradeValues = data.Items;
    // If there's a Next bookmark, fetch additional pages
    // ... handle pagination
  } else if (Array.isArray(data)) {
    userGradeValues = data;
  }
  
  // ... rest of transformation logic
}
```

**Benefits:**
- Supports filtering by `isGraded` (graded vs ungraded students)
- Supports sorting (by name, grade value, etc.)
- Handles pagination for large classes
- Can request larger page sizes (up to 200)

---

## 3. **Submissions API - Use User-Specific Endpoint When Possible**

### Current Implementation
- Always fetches all submissions, then filters

### Recommended Improvement
```typescript
// For single-user lookups, use the user-specific endpoint
export async function getUserSubmission(
  ou: string,
  leVersion: string,
  assignmentId: number,
  userId: number
): Promise<AssignmentSubmission | null> {
  try {
    // Use the user-specific endpoint instead of fetching all
    const response = await axios.get(
      `/d2l/api/le/${leVersion}/${ou}/dropbox/folders/${assignmentId}/submissions/user/${userId}/`
    );
    
    // This returns EntityDropbox structure for the specific user
    const entityDropbox = response.data;
    // Transform to AssignmentSubmission...
    
    return transformedSubmission;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // User has no submission
    }
    throw error;
  }
}
```

**Benefits:**
- More efficient for single-user lookups
- Reduces API calls
- Better error handling (404 = no submission)

---

## 4. **Grade Values API - Use Bulk Endpoint for Multiple Assignments**

### Current Implementation
- Fetches grade values one assignment at a time

### Recommended Improvement
```typescript
// Add bulk grade values endpoint for "Export All Assignments"
export async function getBulkGradeValues(
  ou: string,
  leVersion: string,
  options?: {
    gradeObjectTypeId?: number; // Filter by type (1=Numeric, etc.)
    modifiedSince?: string; // UTC DateTime
    pageSize?: number;
  }
): Promise<GradeValue[]> {
  const params = new URLSearchParams();
  if (options?.gradeObjectTypeId) params.append('gradeObjectTypeId', options.gradeObjectTypeId.toString());
  if (options?.modifiedSince) params.append('modifiedSince', options.modifiedSince);
  if (options?.pageSize) params.append('pageSize', options.pageSize.toString());
  
  const response = await axios.get(
    `/d2l/api/le/${leVersion}/${ou}/grades/values/?${params.toString()}`
  );
  
  // This returns all grade values for all grade objects in the org unit
  // Already includes UserId in bulk grade values
  const data = response.data;
  // Handle ObjectListPage pagination...
  
  return gradeValues;
}
```

**Benefits:**
- Single API call for all assignments
- Much faster for "Export All Assignments"
- Supports filtering by grade object type
- Can filter by modification date

---

## 5. **Submissions API - Extract Feedback Score**

### Current Implementation
- Doesn't extract feedback/score from EntityDropbox structure

### Recommended Improvement
```typescript
// In getAssignmentSubmissions, also extract feedback scores
for (const entityDropbox of entityDropboxes) {
  // ... existing code ...
  
  // Extract feedback if available
  const feedback = entityDropbox.Feedback;
  if (feedback && feedback.Score !== null && feedback.Score !== undefined) {
    // Store feedback score with submission
    // This could be used to show graded status
  }
}
```

**Benefits:**
- Can show if assignment is graded directly from submissions API
- Reduces need to fetch grade values separately
- Feedback includes IsGraded flag

---

## 6. **Error Handling - Add Retry Logic for Rate Limiting**

### Current Implementation
- No retry logic for 429 (Too Many Requests) errors

### Recommended Improvement
```typescript
// Add retry utility function
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.response?.status === 429 && i < maxRetries - 1) {
        // Rate limited - wait and retry
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

// Use in API calls
export async function getGradeValues(...) {
  return withRetry(async () => {
    const grades = await axios.get(...);
    // ... process ...
  });
}
```

**Benefits:**
- Handles rate limiting gracefully
- Improves reliability
- Better user experience

---

## 7. **API Version Checking - Warn About Deprecated Versions**

### Current Implementation
- Uses latest version without checking deprecation

### Recommended Improvement
```typescript
// Check API version deprecation status
export async function checkApiVersion(version: string, endpoint: string): Promise<void> {
  // D2L API docs show deprecation info:
  // 1.82+ - Current
  // 1.75-81 - Deprecated as of LMS v20.26.1
  // 1.74- - Obsolete
  
  const versionNum = parseFloat(version);
  if (versionNum < 1.82) {
    console.warn(
      `⚠️ Using deprecated API version ${version} for ${endpoint}. ` +
      `Consider upgrading to 1.82+`
    );
  }
}
```

**Benefits:**
- Proactive deprecation warnings
- Helps plan migrations
- Better long-term maintainability

---

## 8. **Submissions API - Handle Group Submissions**

### Current Implementation
- Only handles individual submissions

### Recommended Improvement
```typescript
// In getAssignmentSubmissions, handle group submissions
for (const entityDropbox of entityDropboxes) {
  const entity = entityDropbox.Entity;
  
  if (entity.EntityType === 'Group') {
    // Handle group submissions differently
    // Group submissions have GroupId instead of UserId
    // May need to map to individual students
  } else if (entity.EntityType === 'User') {
    // Existing individual submission logic
  }
}
```

**Benefits:**
- Supports group assignments
- More complete feature coverage

---

## 9. **Grade Values API - Use Final Grade Endpoint for Course Averages**

### Current Implementation
- Calculates class average manually

### Recommended Improvement
```typescript
// Add function to get final grade statistics
export async function getFinalGradeValues(
  ou: string,
  leVersion: string,
  options?: {
    sort?: string;
    isGraded?: boolean;
    searchText?: string;
  }
): Promise<Array<{ User: User; GradeValue: GradeValue | null }>> {
  const params = new URLSearchParams();
  if (options?.sort) params.append('sort', options.sort);
  if (options?.isGraded !== undefined) params.append('isGraded', options.isGraded.toString());
  if (options?.searchText) params.append('searchText', options.searchText);
  
  const response = await axios.get(
    `/d2l/api/le/${leVersion}/${ou}/grades/final/values/?${params.toString()}`
  );
  
  // Returns ObjectListPage with UserGradeValue objects
  return response.data.Items || [];
}
```

**Benefits:**
- Can get course-level statistics
- Supports searching by student name
- More efficient than calculating manually

---

## 10. **Type Safety - Update Type Definitions**

### Current Implementation
- Some types allow `number | string` for IDs (correct per API)
- Missing some API response structures

### Recommended Improvement
```typescript
// Add missing types from API docs
export interface EntityDropbox {
  Entity: {
    EntityId: number | string;
    EntityType: 'User' | 'Group';
    DisplayName?: string;
    Name?: string; // For groups
  };
  Status: number; // ENTITYDROPBOXSTATUS_T
  Feedback?: DropboxFeedbackOut;
  Submissions: Submission[];
  CompletionDate?: string;
}

export interface DropboxFeedbackOut {
  Score: number | null;
  Feedback: RichText;
  IsGraded: boolean;
  Files: File[];
  Links: Link[];
  GradedSymbol?: string | null;
}

export interface UserGradeValue {
  User: User;
  GradeValue: GradeValue | null;
}
```

**Benefits:**
- Better type safety
- IDE autocomplete
- Catches errors at compile time

---

## Priority Recommendations

### High Priority
1. **Add pagination support** for grade values and submissions (items 1, 2)
2. **Use bulk grade values endpoint** for "Export All Assignments" (item 4)
3. **Add retry logic** for rate limiting (item 6)

### Medium Priority
4. **Extract feedback scores** from submissions API (item 5)
5. **Use user-specific submission endpoint** when possible (item 3)
6. **Update type definitions** (item 10)

### Low Priority
7. **Add API version checking** (item 7)
8. **Handle group submissions** (item 8)
9. **Use final grade endpoint** for statistics (item 9)

---

## Implementation Notes

- All improvements maintain backward compatibility
- Can be implemented incrementally
- Test each change with real D2L data
- Monitor API rate limits when adding bulk operations
