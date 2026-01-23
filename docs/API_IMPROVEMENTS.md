# D2L API Improvements Based on Routing Table Review

**Date:** January 2026  
**Based on:** D2L API Routing Table (Developer Platform, January 2026)

## Executive Summary

After reviewing the components against the official D2L API Routing Table, several improvements have been identified to enhance performance, reliability, and maintainability. The current implementation is generally correct but can be optimized using more efficient endpoints and better error handling.

---

## Current Implementation Analysis

### ✅ What's Working Well

1. **API Version Management**: Properly uses `/d2l/api/versions/` to get latest versions
2. **Endpoint Structure**: Correctly follows the pattern `/d2l/api/{service}/{version}/{orgUnitId}/...`
3. **Error Handling**: Basic error handling is in place
4. **Response Normalization**: Handles different response structures (arrays vs Items/Objects)

### ⚠️ Areas for Improvement

1. **Missing Paged Endpoints**: Not using paged endpoints for large datasets
2. **Inefficient Bulk Operations**: Fetching individual grade values instead of using bulk endpoints
3. **Missing User-Specific Endpoints**: Not using user-specific endpoints when querying single users
4. **No Query Parameter Support**: Missing sort, filter, and pageSize parameters
5. **Deprecated Endpoint Usage**: Some endpoints may have newer alternatives

---

## Recommended Improvements

### 1. Use Paged Endpoints for Large Datasets

**Current:**
```typescript
// Fetches all classlist users at once
const classlist = await axios.get(`/d2l/api/le/${leVersion}/${ou}/classlist/`);
```

**Recommended:**
```typescript
// Use paged endpoint for large classes
const classlist = await axios.get(`/d2l/api/le/${leVersion}/${ou}/classlist/paged/`, {
  params: { pageSize: 200 }
});
```

**Benefits:**
- Better performance for large classes (100+ students)
- Reduced memory usage
- More reliable for very large datasets

**Routing Table Reference:**
- `GET /d2l/api/le/(version)/(orgUnitId)/classlist/paged/` (line 244)

---

### 2. Use User-Specific Submission Endpoint

**Current:**
```typescript
// Fetches all submissions, then filters
const submissions = await getAssignmentSubmissions(ou, leVersion, assignmentId);
const userSubmission = submissions.find(sub => sub.UserId === userId);
```

**Recommended:**
```typescript
// Use user-specific endpoint when querying single user
export async function getUserSubmissionDirect(
  ou: string,
  leVersion: string,
  assignmentId: number,
  userId: number
): Promise<AssignmentSubmission | null> {
  try {
    const response = await axios.get(
      `/d2l/api/le/${leVersion}/${ou}/dropbox/folders/${assignmentId}/submissions/user/${userId}`
    );
    // Transform EntityDropbox to AssignmentSubmission
    return transformEntityDropboxToSubmission(response.data);
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}
```

**Benefits:**
- More efficient (only fetches one user's data)
- Faster response time
- Less network traffic

**Routing Table Reference:**
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/user/(userId)` (line 352)

---

### 3. Use Bulk Grade Values Endpoint

**Current:**
```typescript
// Fetches grade values for each assignment individually
for (const assignment of assignments) {
  const gradeValues = await getGradeValues(ou, leVersion, gradeObjectId);
  // Process...
}
```

**Recommended:**
```typescript
// Fetch all grade values at once using bulk endpoint
export async function getBulkGradeValues(
  ou: string,
  leVersion: string,
  options?: {
    modifiedSince?: string;
    pageSize?: number;
  }
): Promise<GradeValue[]> {
  const params: any = {};
  if (options?.modifiedSince) params.modifiedSince = options.modifiedSince;
  if (options?.pageSize) params.pageSize = Math.min(options.pageSize, 200);
  
  const response = await axios.get(
    `/d2l/api/le/${leVersion}/${ou}/grades/values/`,
    { params }
  );
  
  // Handle ObjectListPage response
  const data = response.data;
  const items = data.Items || data.Objects || [];
  return items.map((item: any) => ({
    ...item.GradeValue,
    UserId: item.User?.Identifier || item.User?.UserId || item.GradeValue?.UserId,
    OrgUnitId: ou,
    GradeObjectId: item.GradeValue?.GradeObjectIdentifier || item.GradeValue?.GradeObjectId
  }));
}
```

**Benefits:**
- Single API call instead of N calls (one per assignment)
- Faster overall export time
- Better for "Export All Assignments" feature

**Routing Table Reference:**
- `GET /d2l/api/le/(version)/(orgUnitId)/grades/values/` (line 400)

---

### 4. Add Query Parameter Support

**Current:**
```typescript
// No query parameters used
const gradeValues = await axios.get(`/d2l/api/le/${leVersion}/${ou}/grades/${gradeObjectId}/values/`);
```

**Recommended:**
```typescript
// Add support for query parameters
export async function getGradeValues(
  ou: string,
  leVersion: string,
  gradeObjectId: number,
  options?: {
    sort?: 'firstname' | 'lastname' | 'grade' | 'lastmodified' | '-firstname' | '-lastname' | '-grade' | '-lastmodified';
    pageSize?: number;
    isGraded?: boolean;
    searchText?: string;
  }
): Promise<GradeValue[]> {
  const params: any = {};
  if (options?.sort) params.sort = options.sort;
  if (options?.pageSize) params.pageSize = Math.min(options.pageSize, 200);
  if (options?.isGraded !== undefined) params.isGraded = options.isGraded;
  if (options?.searchText) params.searchText = options.searchText;
  
  const grades = await axios.get(
    `/d2l/api/le/${leVersion}/${ou}/grades/${gradeObjectId}/values/`,
    { params }
  );
  // ... rest of implementation
}
```

**Benefits:**
- Can sort results (e.g., by last name for CSV export)
- Can filter to only graded students
- Can search by name
- Better pagination control

**Routing Table Reference:**
- Grade values endpoint supports: `sort`, `pageSize`, `isGraded`, `searchText` (lines 921-989)

---

### 5. Use Paged Submissions Endpoint

**Current:**
```typescript
// Fetches all submissions at once
const submissions = await axios.get(`/d2l/api/le/${leVersion}/${ou}/dropbox/folders/${assignmentId}/submissions/`);
```

**Recommended:**
```typescript
// Use paged endpoint for large submission lists
export async function getAssignmentSubmissionsPaged(
  ou: string,
  leVersion: string,
  assignmentId: number,
  options?: {
    activeOnly?: boolean;
    pageSize?: number;
    bookmark?: string;
  }
): Promise<{ submissions: AssignmentSubmission[]; bookmark?: string }> {
  const params: any = {};
  if (options?.activeOnly !== undefined) params.activeOnly = options.activeOnly;
  if (options?.pageSize) params.pageSize = options.pageSize;
  if (options?.bookmark) params.bookmark = options.bookmark;
  
  const response = await axios.get(
    `/d2l/api/le/${leVersion}/${ou}/dropbox/folders/${assignmentId}/submissions/paged/`,
    { params }
  );
  
  // Handle ObjectListPage response
  const data = response.data;
  const items = data.Items || data.Objects || [];
  const submissions = transformEntityDropboxesToSubmissions(items);
  
  return {
    submissions,
    bookmark: data.Bookmark
  };
}
```

**Benefits:**
- Better for assignments with many submissions
- Can fetch in chunks
- Supports `activeOnly` filter

**Routing Table Reference:**
- `GET /d2l/api/le/(version)/(orgUnitId)/dropbox/folders/(folderId)/submissions/paged/` (line 348)

---

### 6. Add Error Handling for Deprecated Endpoints

**Current:**
```typescript
// No version checking
const assignment = await axios.get(`/d2l/api/le/${leVersion}/${ou}/dropbox/folders/${assignmentId}/`);
```

**Recommended:**
```typescript
// Check API version and use appropriate endpoint
export async function getAssignment(ou: string, leVersion: string, assignmentId: number): Promise<Assignment> {
  // Check if version supports newer endpoint
  const versionNum = parseFloat(leVersion);
  
  try {
    // Try newer endpoint first (if available)
    if (versionNum >= 1.82) {
      const assignment = await axios.get(`/d2l/api/le/${leVersion}/${ou}/dropbox/folders/${assignmentId}/`);
      return assignment.data;
    }
  } catch (error: any) {
    // Fallback to older endpoint or handle gracefully
    if (error.response?.status === 404 || error.response?.status === 400) {
      console.warn(`Endpoint not available for version ${leVersion}, using fallback`);
    } else {
      throw error;
    }
  }
  
  // Fallback endpoint
  const assignment = await axios.get(`/d2l/api/le/${leVersion}/${ou}/dropbox/folders/${assignmentId}/`);
  return assignment.data;
}
```

**Benefits:**
- Future-proof against API changes
- Better error messages
- Graceful degradation

---

### 7. Optimize "Export All Assignments"

**Current Implementation Issues:**
- Fetches grade values for each assignment sequentially
- No caching of gradebook data
- Multiple API calls per assignment

**Recommended:**
```typescript
async exportAllAssignments(): Promise<void> {
  // 1. Fetch all grade values at once using bulk endpoint
  const allGradeValues = await getBulkGradeValues(this.ou, this.versions.le, {
    pageSize: 200
  });
  
  // 2. Group by grade object ID
  const gradeValuesByObjectId = new Map<number, GradeValue[]>();
  for (const gv of allGradeValues) {
    const objectId = Number(gv.GradeObjectId);
    if (!gradeValuesByObjectId.has(objectId)) {
      gradeValuesByObjectId.set(objectId, []);
    }
    gradeValuesByObjectId.get(objectId)!.push(gv);
  }
  
  // 3. Process assignments (no additional API calls needed)
  for (const assignment of this.assignments) {
    const gradeObject = gradebook.find(g => g.Name === assignment.Name);
    if (gradeObject) {
      const gradeObjectId = getGradeObjectId(gradeObject);
      const gradeValues = gradeValuesByObjectId.get(gradeObjectId) || [];
      // Calculate stats from cached data
      const studentCount = gradeValues.length;
      const classAverage = calculateAverage(gradeValues);
      // ...
    }
  }
}
```

**Benefits:**
- Single bulk API call instead of N calls
- Much faster export (especially for many assignments)
- Reduced server load

---

## Implementation Priority

### High Priority (Immediate Impact)
1. **Use Bulk Grade Values Endpoint** - Dramatically improves "Export All Assignments" performance
2. **Add Query Parameter Support** - Enables sorting and filtering
3. **Use User-Specific Submission Endpoint** - More efficient for single-user queries

### Medium Priority (Performance Improvements)
4. **Use Paged Endpoints** - Better for large datasets
5. **Optimize Export All Assignments** - Better user experience

### Low Priority (Future-Proofing)
6. **Add Error Handling for Deprecated Endpoints** - Long-term maintainability
7. **Add Caching Layer** - Reduce redundant API calls

---

## Code Examples

### Example 1: Optimized Grade Export

```typescript
// Before: Multiple API calls
for (const assignment of assignments) {
  const gradeValues = await getGradeValues(ou, leVersion, gradeObjectId);
  // Process...
}

// After: Single bulk call
const allGradeValues = await getBulkGradeValues(ou, leVersion);
const gradeValuesByAssignment = groupByAssignment(allGradeValues, assignments);
// Process all at once
```

### Example 2: Efficient User Submission Lookup

```typescript
// Before: Fetch all, then filter
const allSubmissions = await getAssignmentSubmissions(ou, leVersion, assignmentId);
const userSubmission = allSubmissions.find(s => s.UserId === userId);

// After: Direct user endpoint
const userSubmission = await getUserSubmissionDirect(ou, leVersion, assignmentId, userId);
```

---

## Testing Recommendations

1. **Performance Testing**: Compare API call counts and response times before/after
2. **Large Dataset Testing**: Test with classes of 100+, 500+, 1000+ students
3. **Error Handling**: Test with invalid IDs, missing permissions, network errors
4. **Backward Compatibility**: Ensure changes work with different D2L versions

---

## Notes

- All endpoints referenced are from the D2L API Routing Table (January 2026)
- Query parameter limits (e.g., `pageSize` max 200) should be respected
- Some endpoints may require specific permissions - ensure proper error handling
- Consider rate limiting when making multiple API calls

---

## References

- D2L API Routing Table: `/docs/D2L_API_ROUTING_TABLE.md`
- Current Implementation: `/src/lib/api/d2l-client.ts`
- Component Usage: `/src/components/uga-assignment.ts`
