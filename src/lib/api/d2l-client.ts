// eLC API client methods
// Centralized API calls used across multiple components

import axios from 'axios';
import { cachedApiCall } from './api-cache.js';
import type { ApiVersions, ClasslistUser, Enrollment, User, Assignment, DiscussionForum, DiscussionTopic, DiscussionPost, MyItemsDue, GradeObject, GradeValue, AssignmentSubmission } from '../../types/d2l.js';

/**
 * Retry wrapper for API calls that handles rate limiting (429 errors)
 * Supports AbortController for request cancellation
 * @param fn - Function that returns a Promise
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay in milliseconds before retry (default: 1000)
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Promise that resolves with the function result
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  signal?: AbortSignal
): Promise<T> {
  // Check if already aborted
  if (signal?.aborted) {
    throw new Error('Request aborted');
  }
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      // Check if aborted
      if (signal?.aborted || error.name === 'AbortError') {
        throw new Error('Request aborted');
      }
      
      const isRateLimit = error.response?.status === 429;
      const isLastAttempt = attempt === maxRetries - 1;
      
      if (isRateLimit && !isLastAttempt) {
        // Rate limited - wait with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        const retryAfter = error.response?.headers?.['retry-after'];
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay;
        
        console.warn(`⚠️ Rate limited (429). Retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})...`);
        
        // Wait with abort support
        await new Promise<void>((resolve, reject) => {
          if (signal?.aborted) {
            reject(new Error('Request aborted'));
            return;
          }
          
          const timeout = setTimeout(resolve, waitTime);
          signal?.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new Error('Request aborted'));
          });
        });
        continue;
      }
      
      // Not rate limited, or last attempt - throw the error
      throw error;
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw new Error('Max retries exceeded');
}

/**
 * Batch multiple API calls in parallel
 * Useful when you need multiple independent API calls
 * @param calls - Array of functions that return Promises
 * @returns Promise that resolves with array of results
 */
export async function batchApiCalls<T>(calls: Array<() => Promise<T>>): Promise<T[]> {
  return Promise.all(calls.map(call => call()));
}

/**
 * Get eLC API versions
 * Cached for 30 minutes (versions rarely change)
 * @returns Object mapping product codes to version numbers
 */
export async function getVersions(): Promise<ApiVersions> {
  return cachedApiCall('versions', async () => {
    const apiVer = await withRetry(() => axios.get('/d2l/api/versions/'));
    const result: ApiVersions = {};
    for (let i in apiVer.data) {
      result[apiVer.data[i].ProductCode] = apiVer.data[i].LatestVersion;
    }
    return result;
  }, 30 * 60 * 1000); // 30 minutes
}

/**
 * Check if an API version is deprecated or obsolete
 * Based on D2L API documentation:
 * - 1.82+ - Current (as of LMS v20.25.1)
 * - 1.75-81 - Deprecated as of LMS v20.26.1
 * - 1.74- - Obsolete as of LMS v20.26.1
 * @param version - API version string (e.g., "1.82")
 * @param endpoint - Endpoint name for context in warning message
 * @returns Object with deprecation status
 */
export function checkApiVersion(version: string, endpoint: string): {
  isDeprecated: boolean;
  isObsolete: boolean;
  status: 'current' | 'deprecated' | 'obsolete';
  message?: string;
} {
  const versionNum = parseFloat(version);
  
  if (isNaN(versionNum)) {
    return {
      isDeprecated: false,
      isObsolete: false,
      status: 'current',
      message: `⚠️ Could not parse API version "${version}" for ${endpoint}`
    };
  }
  
  if (versionNum >= 1.82) {
    return {
      isDeprecated: false,
      isObsolete: false,
      status: 'current'
    };
  } else if (versionNum >= 1.75) {
    return {
      isDeprecated: true,
      isObsolete: false,
      status: 'deprecated',
      message: `⚠️ Using deprecated API version ${version} for ${endpoint}. Consider upgrading to 1.82+ (deprecated as of LMS v20.26.1)`
    };
  } else {
    return {
      isDeprecated: true,
      isObsolete: true,
      status: 'obsolete',
      message: `⚠️ Using obsolete API version ${version} for ${endpoint}. Please upgrade to 1.82+ (obsolete as of LMS v20.26.1)`
    };
  }
}

/**
 * Log API version deprecation warnings
 * @param leVersion - Learning Environment API version
 * @param endpoint - Endpoint name for context
 */
export function logApiVersionWarning(leVersion: string, endpoint: string): void {
  const check = checkApiVersion(leVersion, endpoint);
  if (check.message) {
    console.warn(check.message);
  }
}

/**
 * Generic pagination helper for D2L API endpoints
 * @param url - Base API URL
 * @param options - Optional parameters including pageSize and bookmark
 * @returns Object with items array and nextBookmark
 */
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
    if (key !== 'pageSize' && key !== 'bookmark' && value !== undefined && value !== null) {
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

/**
 * Fetch all pages from a paginated endpoint
 * @param url - Base API URL
 * @param options - Optional parameters
 * @returns Array of all items from all pages
 */
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

/**
 * Get classlist for a course
 * Cached for 5 minutes
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @returns Array of classlist users
 */
export async function getClasslist(ou: string, leVersion: string): Promise<ClasslistUser[]> {
  // Check for deprecated API version
  logApiVersionWarning(leVersion, 'getClasslist');
  
  return cachedApiCall(`classlist:${ou}`, async () => {
    const classlist = await withRetry(() => axios.get(`/d2l/api/le/${leVersion}/${ou}/classlist/`));
    return classlist.data;
  });
}

/**
 * Get classlist for a course using paged endpoint (better for large classes)
 * Cached for 5 minutes
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param options - Optional parameters for filtering and pagination
 * @returns Array of classlist users
 */
export async function getClasslistPaged(
  ou: string,
  leVersion: string,
  options?: {
    pageSize?: number; // 1-200, default is 20
    searchText?: string; // Filter by name
  }
): Promise<ClasslistUser[]> {
  // Check for deprecated API version
  logApiVersionWarning(leVersion, 'getClasslistPaged');
  
  // Create cache key that includes options
  const cacheKey = `classlist:${ou}:paged:${JSON.stringify(options || {})}`;
  
  return cachedApiCall(cacheKey, async () => {
    return fetchAllPages<ClasslistUser>(
      `/d2l/api/le/${leVersion}/${ou}/classlist/paged/`,
      options
    );
  });
}

/**
 * Get enrollment information for current user in a course
 * Cached for 10 minutes (enrollment can change)
 * @param ou - Organization unit (course) ID
 * @param lpVersion - Learning Platform API version
 * @param options - Optional parameters
 * @returns Enrollment details
 */
export async function getEnrollment(
  ou: string,
  lpVersion: string,
  options?: {
    fallbackToFirst?: boolean; // If true, return first enrollment if exact match not found
    throwOnNotFound?: boolean; // If false, returns null instead of throwing (default: true)
  }
): Promise<Enrollment | null> {
  // Check for deprecated API version
  logApiVersionWarning(lpVersion, 'getEnrollment');
  
  return cachedApiCall(`enrollment:${ou}`, async () => {
    const myEnrollment = await withRetry(() => axios.get(`/d2l/api/lp/${lpVersion}/enrollments/myenrollments/?orgUnitTypeId=3`));
    const items: Enrollment[] = myEnrollment.data.Items || [];
    
    // Try exact match first
    for (let i in items) {
      if (items[i].OrgUnit.Id.toString() === ou) {
        return items[i];
      }
    }
    
    // Fallback: return first enrollment if requested
    if (options?.fallbackToFirst && items.length > 0) {
      console.warn(`Enrollment not found for course ID ${ou}, using first available enrollment: ${items[0].OrgUnit.Id}`);
      return items[0];
    }
    
    // If throwOnNotFound is false, return null instead of throwing
    if (options?.throwOnNotFound === false) {
      console.warn(`Enrollment not found for course ID ${ou}. Available enrollments: ${items.map(item => item.OrgUnit.Id).join(', ') || 'none'}`);
      return null;
    }
    
    // Helpful error message with available course IDs
    const availableIds = items.map((item: Enrollment) => item.OrgUnit.Id).join(', ');
    throw new Error(`Enrollment not found for course ID ${ou}. Available enrollments: ${availableIds || 'none'}`);
  });
}

/**
 * Get current user information
 * @param lpVersion - Learning Platform API version
 * @returns User details
 */
export async function getUser(lpVersion: string): Promise<User> {
  // Check for deprecated API version
  logApiVersionWarning(lpVersion, 'getUser');
  
  const whoAmI = await withRetry(() => axios.get(`/d2l/api/lp/${lpVersion}/users/whoami`));
  return whoAmI.data;
}

/**
 * Get assignments for a course
 * Cached for 2 minutes (assignments change frequently)
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @returns Array of assignments
 */
export async function getAssignments(ou: string, leVersion: string): Promise<Assignment[]> {
  // Check for deprecated API version
  logApiVersionWarning(leVersion, 'getAssignments');
  
  return cachedApiCall(`assignments:${ou}`, async () => {
    const assignments = await withRetry(() => axios.get(`/d2l/api/le/${leVersion}/${ou}/dropbox/folders/`));
    return assignments.data;
  });
}

/**
 * Get a specific assignment by ID
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param assignmentId - Assignment folder ID
 * @returns Assignment details
 */
export async function getAssignment(ou: string, leVersion: string, assignmentId: number): Promise<Assignment> {
  try {
    // Try the assignments endpoint first (provides more complete data including IsHidden)
    const assignment = await axios.get(`/d2l/api/le/${leVersion}/${ou}/assignments/folders/${assignmentId}/`);
    return assignment.data;
  } catch (error: any) {
    // Fall back to dropbox endpoint if assignments endpoint fails
    console.warn('Assignments API endpoint failed, falling back to dropbox/folders:', error.message);
    const assignment = await axios.get(`/d2l/api/le/${leVersion}/${ou}/dropbox/folders/${assignmentId}/`);
    return assignment.data;
  }
}

/**
 * Get my items with due dates for a course
 * Cached for 2 minutes (items change frequently)
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @returns Array of items with due dates
 */
export async function getMyItemsDue(ou: string, leVersion: string): Promise<MyItemsDue[]> {
  // Check for deprecated API version
  logApiVersionWarning(leVersion, 'getMyItemsDue');
  
  return cachedApiCall(`myItemsDue:${ou}`, async () => {
    const myItems = await withRetry(() => axios.get(`/d2l/api/le/${leVersion}/${ou}/content/myItems/due/`));
    return myItems.data;
  });
}

/**
 * Get discussion forums for a course
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @returns Array of discussion forums
 */
export async function getForums(ou: string, leVersion: string): Promise<DiscussionForum[]> {
  // Check for deprecated API version
  logApiVersionWarning(leVersion, 'getForums');
  
  const forums = await withRetry(() => axios.get(`/d2l/api/le/${leVersion}/${ou}/discussions/forums/`));
  return forums.data;
}

/**
 * Create a new discussion forum
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param name - Forum name
 * @param description - Forum description
 * @returns Created forum
 */
export async function createForum(
  ou: string,
  leVersion: string,
  name: string,
  description: string = ''
): Promise<DiscussionForum> {
  const forumData = {
    Name: name,
    Description: {
      Content: description,
      Type: 'Text'
    }
  };
  const forum = await axios.post(`/d2l/api/le/${leVersion}/${ou}/discussions/forums/`, forumData);
  return forum.data;
}

/**
 * Get topics for a discussion forum
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param forumId - Forum ID
 * @returns Array of discussion topics
 */
export async function getTopics(ou: string, leVersion: string, forumId: number): Promise<DiscussionTopic[]> {
  // Check for deprecated API version
  logApiVersionWarning(leVersion, 'getTopics');
  
  const topics = await withRetry(() => axios.get(`/d2l/api/le/${leVersion}/${ou}/discussions/forums/${forumId}/topics/`));
  return topics.data;
}

/**
 * Get posts for a discussion topic with pagination support
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param forumId - Forum ID
 * @param topicId - Topic ID
 * @param options - Optional parameters for filtering and pagination
 * @returns Array of discussion posts
 */
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
  // Check for deprecated API version
  logApiVersionWarning(leVersion, 'getPostsPaged');
  
  // Try paged endpoint first, fallback to non-paged if not available
  try {
    return await fetchAllPages<DiscussionPost>(
      `/d2l/api/le/${leVersion}/${ou}/discussions/forums/${forumId}/topics/${topicId}/posts/paged/`,
      options
    );
  } catch (error: any) {
    // Fallback to non-paged endpoint if paged doesn't exist
    if (error.response?.status === 404) {
      const posts = await withRetry(() => 
        axios.get(`/d2l/api/le/${leVersion}/${ou}/discussions/forums/${forumId}/topics/${topicId}/posts/`)
      );
      return posts.data;
    }
    throw error;
  }
}

/**
 * Create a new discussion topic
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param forumId - Forum ID
 * @param name - Topic name
 * @param description - Topic description
 * @returns Created topic
 */
export async function createTopic(
  ou: string,
  leVersion: string,
  forumId: number,
  name: string,
  description: string = ''
): Promise<DiscussionTopic> {
  const topicData = {
    Name: name,
    Description: {
      Content: description,
      Type: 'Text'
    }
  };
  const topic = await axios.post(
    `/d2l/api/le/${leVersion}/${ou}/discussions/forums/${forumId}/topics/`,
    topicData
  );
  return topic.data;
}

/**
 * Create a post in a discussion topic
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param forumId - Forum ID
 * @param topicId - Topic ID
 * @param subject - Post subject
 * @param message - Post message
 * @param options - Optional parameters including XSRF token
 * @returns Created post
 */
export async function createPost(
  ou: string,
  leVersion: string,
  forumId: number,
  topicId: number,
  subject: string,
  message: string,
  options?: {
    xsrfToken?: string;
    isAnonymous?: boolean;
  }
): Promise<DiscussionPost> {
  // Check for deprecated API version
  logApiVersionWarning(leVersion, 'createPost');
  
  const postData: any = {
    ParentPostId: null,
    Subject: subject,
    Message: {
      Content: message,
      Type: 'Text'
    }
  };
  
  // Add IsAnonymous if provided
  if (options?.isAnonymous !== undefined) {
    postData.IsAnonymous = options.isAnonymous;
  }
  
  // Get XSRF token if not provided
  let token = options?.xsrfToken;
  if (!token) {
    token = await getXsrfToken();
  }
  
  const headers: Record<string, string> = {};
  if (token) {
    headers['X-Csrf-Token'] = token;
  }
  
  const post = await withRetry(() =>
    axios.post(
      `/d2l/api/le/${leVersion}/${ou}/discussions/forums/${forumId}/topics/${topicId}/posts/`,
      postData,
      { headers }
    )
  );
  
  return post.data;
}

/**
 * Get XSRF token for authenticated requests
 * @returns XSRF token string
 */
export async function getXsrfToken(): Promise<string> {
  const xsrfToken = await axios.get('/d2l/lp/auth/xsrf-tokens');
  return xsrfToken.data.referrerToken;
}

/**
 * Get gradebook for a course
 * Cached for 2 minutes (grades change frequently)
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @returns Array of grade objects
 */
export async function getGradebook(ou: string, leVersion: string): Promise<GradeObject[]> {
  // Check for deprecated API version
  logApiVersionWarning(leVersion, 'getGradebook');
  
  return cachedApiCall(`gradebook:${ou}`, async () => {
    const gradebook = await withRetry(() => axios.get(`/d2l/api/le/${leVersion}/${ou}/grades/`));
    const data = gradebook.data;
    // Some Brightspace tenants return arrays; others wrap in Items.
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.Items)) return data.Items;
    if (data && Array.isArray(data.Objects)) return data.Objects;
    return [];
  });
}

/**
 * Get grade values for a specific grade object
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param gradeObjectId - Grade object ID
 * @param options - Optional parameters for filtering and pagination
 * @returns Array of grade values with UserId attached
 */
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
  // Check for deprecated API version
  logApiVersionWarning(leVersion, 'getGradeValues');
  
  const allGradeValues: GradeValue[] = [];
  let bookmark: string | null = null;
  
  do {
    const params = new URLSearchParams();
    if (options?.isGraded !== undefined) {
      params.append('isGraded', options.isGraded.toString());
    }
    if (options?.sort) {
      params.append('sort', options.sort);
    }
    if (options?.pageSize) {
      params.append('pageSize', options.pageSize.toString());
    }
    if (bookmark) {
      params.append('bookmark', bookmark);
    }
    
    const queryString = params.toString();
    const url = `/d2l/api/le/${leVersion}/${ou}/grades/${gradeObjectId}/values/${queryString ? '?' + queryString : ''}`;
    const grades = await withRetry(() => axios.get(url));
    const data = grades.data;
    
    // The API returns an ObjectListPage containing UserGradeValue objects
    // Each UserGradeValue has: { User: {...}, GradeValue: {...} | null }
    let userGradeValues: any[] = [];
    
    // Handle different response structures
    if (Array.isArray(data)) {
      userGradeValues = data;
      bookmark = null; // Array response means no pagination
    } else if (data && Array.isArray(data.Items)) {
      userGradeValues = data.Items;
      bookmark = data.Next || null; // Check for next page bookmark
    } else if (data && Array.isArray(data.Objects)) {
      userGradeValues = data.Objects;
      bookmark = data.Next || null;
    } else {
      bookmark = null; // No more pages
    }
    
    // Transform UserGradeValue[] to GradeValue[] by extracting GradeValue and adding UserId
    for (const userGradeValue of userGradeValues) {
      // Extract User and GradeValue from UserGradeValue
      const user = userGradeValue.User;
      const gradeValue = userGradeValue.GradeValue;
      
      // Skip if no grade value (ungraded)
      if (!gradeValue) continue;
      
      // Extract UserId from User object
      // User object can have Identifier (string D2LID) or UserId (number)
      let userId: number | string | null = null;
      if (user) {
        if (user.Identifier !== undefined && user.Identifier !== null) {
          // Identifier is typically a string D2LID
          userId = user.Identifier;
        } else if (user.UserId !== undefined && user.UserId !== null) {
          userId = user.UserId;
        } else if (user.Id !== undefined && user.Id !== null) {
          userId = user.Id;
        }
      }
      
      // If we still don't have a userId, try to get it from the gradeValue itself (for bulk grade values)
      if (userId === null && gradeValue.UserId !== undefined && gradeValue.UserId !== null) {
        userId = gradeValue.UserId;
      }
      
      // Create GradeValue with UserId attached
      const gv: GradeValue = {
        ...gradeValue,
        UserId: userId !== null ? userId : gradeValue.UserId,
        OrgUnitId: gradeValue.OrgUnitId || ou,
        GradeObjectId: gradeValue.GradeObjectId || gradeValue.GradeObjectIdentifier || gradeObjectId
      };
      
      allGradeValues.push(gv);
    }
  } while (bookmark);
  
  return allGradeValues;
}

/**
 * Get all grade values in bulk for every user in a particular org unit
 * This is more efficient than calling getGradeValues for each grade object
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param options - Optional parameters for filtering
 * @returns Array of grade values with UserId attached
 */
export async function getBulkGradeValues(
  ou: string,
  leVersion: string,
  options?: {
    gradeObjectTypeId?: number; // Filter by type (1=Numeric, 2=PassFail, 3=SelectBox, 4=Text)
    modifiedSince?: string; // UTC DateTime - only grades modified after this date
    pageSize?: number; // 1-200, default is smaller
  }
): Promise<GradeValue[]> {
  // Check for deprecated API version (bulk endpoint requires 1.85+)
  if (parseFloat(leVersion) < 1.85) {
    console.warn(`⚠️ Bulk grade values endpoint requires API version 1.85+, but using ${leVersion}. Feature may not work correctly.`);
  }
  
  const allGradeValues: GradeValue[] = [];
  let bookmark: string | null = null;
  
  do {
    const params = new URLSearchParams();
    if (options?.gradeObjectTypeId) {
      params.append('gradeObjectTypeId', options.gradeObjectTypeId.toString());
    }
    if (options?.modifiedSince) {
      params.append('modifiedSince', options.modifiedSince);
    }
    if (options?.pageSize) {
      params.append('pageSize', options.pageSize.toString());
    }
    if (bookmark) {
      params.append('bookmark', bookmark);
    }
    
    const queryString = params.toString();
    const url = `/d2l/api/le/${leVersion}/${ou}/grades/values/${queryString ? '?' + queryString : ''}`;
    
    const response = await withRetry(() => axios.get(url));
    const data = response.data;
    
    // The API returns an ObjectListPage containing bulk grade values
    // Bulk grade values already include UserId and OrgUnitId
    let gradeValues: any[] = [];
    
    // Handle different response structures
    if (Array.isArray(data)) {
      gradeValues = data;
      bookmark = null; // Array response means no pagination
    } else if (data && Array.isArray(data.Items)) {
      gradeValues = data.Items;
      bookmark = data.Next || null; // Check for next page bookmark
    } else if (data && Array.isArray(data.Objects)) {
      gradeValues = data.Objects;
      bookmark = data.Next || null;
    } else {
      bookmark = null; // No more pages
    }
    
    // Bulk grade values already have UserId, but we need to ensure proper type handling
    for (const gv of gradeValues) {
      // Ensure UserId is properly set (bulk values should already have it)
      const gradeValue: GradeValue = {
        ...gv,
        UserId: gv.UserId !== undefined && gv.UserId !== null ? gv.UserId : null,
        OrgUnitId: gv.OrgUnitId || ou,
        GradeObjectId: gv.GradeObjectId || gv.GradeObjectIdentifier || null
      };
      
      allGradeValues.push(gradeValue);
    }
  } while (bookmark);
  
  return allGradeValues;
}

/**
 * Update a grade value
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param gradeObjectId - Grade object ID
 * @param userId - User ID
 * @param gradeValue - Grade value to update
 * @returns Updated grade value
 */
export async function updateGradeValue(
  ou: string,
  leVersion: string,
  gradeObjectId: number,
  userId: number,
  gradeValue: Partial<GradeValue>
): Promise<GradeValue> {
  const token = await getXsrfToken();
  const grade = await axios.put(
    `/d2l/api/le/${leVersion}/${ou}/grades/${gradeObjectId}/values/${userId}`,
    gradeValue,
    { headers: { "X-Csrf-Token": token } }
  );
  return grade.data;
}

/**
 * Get submissions for an assignment
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param assignmentId - Assignment folder ID
 * @param options - Optional parameters (activeOnly for filtering)
 * @returns Array of assignment submissions
 */
export async function getAssignmentSubmissions(
  ou: string,
  leVersion: string,
  assignmentId: number,
  options?: {
    activeOnly?: boolean;
  }
): Promise<AssignmentSubmission[]> {
  // Check for deprecated API version
  logApiVersionWarning(leVersion, 'getAssignmentSubmissions');
  
  const allSubmissions: AssignmentSubmission[] = [];
  let bookmark: string | null = null;
  
  // Get classlist to look up usernames by UserId (only need to fetch once)
  let classlist: ClasslistUser[] = [];
  try {
    classlist = await getClasslist(ou, leVersion);
  } catch (error) {
    console.warn('Could not fetch classlist for username lookup:', error);
  }
  
  // Create a map of UserId -> Username from classlist
  const userIdToUsername = new Map<number, string>();
  for (const user of classlist) {
    if (user.UserId !== undefined && user.Username) {
      userIdToUsername.set(user.UserId, user.Username);
    } else if (user.Identifier !== undefined && user.Username) {
      const idNum = typeof user.Identifier === 'string' ? Number(user.Identifier) : user.Identifier;
      if (Number.isFinite(idNum)) {
        userIdToUsername.set(idNum, user.Username);
      }
    }
  }
  
  // Use paged endpoint for better performance with large classes
  do {
    const params = new URLSearchParams();
    if (options?.activeOnly !== undefined) {
      params.append('activeOnly', options.activeOnly.toString());
    }
    if (bookmark) {
      params.append('bookmark', bookmark);
    }
    
    const queryString = params.toString();
    const url = `/d2l/api/le/${leVersion}/${ou}/dropbox/folders/${assignmentId}/submissions/paged/${queryString ? '?' + queryString : ''}`;
    
    let response;
    try {
      // Try paged endpoint first (available in API v1.82+)
      response = await withRetry(() => axios.get(url));
    } catch (error: any) {
      // Fall back to non-paged endpoint if paged endpoint doesn't exist
      if (error.response?.status === 404 && !bookmark) {
        // Only try fallback on first request
        response = await withRetry(() => axios.get(`/d2l/api/le/${leVersion}/${ou}/dropbox/folders/${assignmentId}/submissions/`));
        bookmark = null; // No pagination for non-paged endpoint
      } else {
        throw error;
      }
    }
    
    const data = response.data;
    let entityDropboxes: any[] = [];
    
    // Handle different response structures
    if (Array.isArray(data)) {
      entityDropboxes = data;
      bookmark = null; // Array response means no pagination
    } else if (data && Array.isArray(data.Items)) {
      entityDropboxes = data.Items;
      bookmark = data.Next || null; // Check for next page bookmark
    } else if (data && Array.isArray(data.Objects)) {
      entityDropboxes = data.Objects;
      bookmark = data.Next || null;
    } else {
      bookmark = null; // No more pages
    }
    
    // Transform EntityDropbox[] to AssignmentSubmission[]
    // Each EntityDropbox contains Entity (user info), Submissions[], and Feedback
    for (const entityDropbox of entityDropboxes) {
      const entity = entityDropbox.Entity;
      const entityId = entity?.EntityId;
      const entityType = entity?.EntityType;
      const entityDisplayName = entity?.DisplayName || entity?.Name || '';
      
      // Handle both User and Group entities
      if (!entity || !entityId || (entityType !== 'User' && entityType !== 'Group')) {
        continue;
      }
      
      // For group submissions, we need to map to individual students
      // Groups don't have a direct UserId, so we'll use the EntityId as a placeholder
      // and note it's a group submission
      if (entityType === 'Group') {
        // Group submissions: create submission entries for the group
        // Note: In a real implementation, you might want to fetch group members
        // and create individual entries, but for now we'll create one entry per group
        const submissions = entityDropbox.Submissions || [];
        const feedback = entityDropbox.Feedback;
        const feedbackScore = feedback?.Score !== undefined && feedback?.Score !== null ? feedback.Score : undefined;
        const isGraded = feedback?.IsGraded || false;
        const feedbackText = feedback?.Feedback?.Text || feedback?.Feedback?.Html || undefined;
        
        for (const submission of submissions) {
          const submittedBy = submission.SubmittedBy || {};
          const submissionId = submission.Id;
          const submissionDate = submission.SubmissionDate || '';
          const files = submission.Files || [];
          
          // For groups, use group name as display name and note it's a group
          allSubmissions.push({
            SubmissionId: submissionId,
            SubmissionNumber: submission.SubmissionNumber || 0,
            UserId: entityId, // Use EntityId (GroupId) - will need special handling
            UserName: `GROUP:${entityId}`, // Prefix to identify as group
            DisplayName: entityDisplayName || `Group ${entityId}`,
            SubmittedDate: submissionDate,
            IsRetracted: submission.IsRetracted || false,
            Files: files.map((f: any) => ({
              FileId: f.FileId,
              FileName: f.FileName,
              FileSize: f.Size || f.FileSize || 0
            })),
            TextSubmission: submission.Comment?.Text || submission.TextSubmission,
            FeedbackScore: feedbackScore,
            IsGraded: isGraded,
            FeedbackText: feedbackText,
            // Mark as group submission
            IsGroupSubmission: true,
            GroupId: entityId
          });
        }
        continue; // Skip individual user processing for groups
      }
      
      // Process individual User entities (existing logic)
      
      // Convert entityId to number if it's a string
      let userId: number | null = null;
      if (typeof entityId === 'string') {
        const parsed = Number(entityId);
        if (Number.isFinite(parsed)) userId = parsed;
      } else if (typeof entityId === 'number' && Number.isFinite(entityId)) {
        userId = entityId;
      }
      
      if (userId === null) continue;
      
      // Look up username from classlist
      const username = userIdToUsername.get(userId) || '';
      
      // Get submissions for this entity
      const submissions = entityDropbox.Submissions || [];
      
      // Extract feedback information from EntityDropbox (if available)
      const feedback = entityDropbox.Feedback;
      const feedbackScore = feedback?.Score !== undefined && feedback?.Score !== null ? feedback.Score : undefined;
      const isGraded = feedback?.IsGraded || false;
      const feedbackText = feedback?.Feedback?.Text || feedback?.Feedback?.Html || undefined;
      
      for (const submission of submissions) {
        const submittedBy = submission.SubmittedBy || {};
        const submissionId = submission.Id;
        const submissionDate = submission.SubmissionDate || '';
        const files = submission.Files || [];
        
        // SubmittedBy.Id might be a username string, but we prefer classlist lookup
        const submissionUsername = username || (typeof submittedBy.Id === 'string' ? submittedBy.Id : '');
        
        allSubmissions.push({
          SubmissionId: submissionId,
          SubmissionNumber: submission.SubmissionNumber || 0,
          UserId: userId, // Use EntityId from Entity (converted to number)
          UserName: submissionUsername,
          DisplayName: submittedBy.DisplayName || entityDisplayName,
          SubmittedDate: submissionDate,
          IsRetracted: submission.IsRetracted || false,
          Files: files.map((f: any) => ({
            FileId: f.FileId,
            FileName: f.FileName,
            FileSize: f.Size || f.FileSize || 0
          })),
          TextSubmission: submission.Comment?.Text || submission.TextSubmission,
          // Include feedback information if available
          FeedbackScore: feedbackScore,
          IsGraded: isGraded,
          FeedbackText: feedbackText
        });
      }
    }
  } while (bookmark);
  
  return allSubmissions;
}

/**
 * Get a specific user's submission for an assignment
 * Uses the user-specific endpoint for better efficiency
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param assignmentId - Assignment folder ID
 * @param userId - User ID
 * @param options - Optional parameters
 * @returns User's submission or null
 */
export async function getUserSubmission(
  ou: string,
  leVersion: string,
  assignmentId: number,
  userId: number,
  options?: {
    ignoreFeedback?: boolean;
  }
): Promise<AssignmentSubmission | null> {
  try {
    // Use the user-specific endpoint (more efficient than fetching all submissions)
    const params = new URLSearchParams();
    if (options?.ignoreFeedback) {
      params.append('ignoreFeedback', 'true');
    }
    
    const queryString = params.toString();
    const url = `/d2l/api/le/${leVersion}/${ou}/dropbox/folders/${assignmentId}/submissions/user/${userId}/${queryString ? '?' + queryString : ''}`;
    
    const response = await withRetry(() => axios.get(url));
    const entityDropbox = response.data;
    
    // If no submission found, API returns 404, but axios throws, so we catch it
    if (!entityDropbox || !entityDropbox.Entity) {
      return null;
    }
    
    const entity = entityDropbox.Entity;
    const entityId = entity?.EntityId;
    
    // Verify this is the correct user
    let entityUserId: number | null = null;
    if (typeof entityId === 'string') {
      const parsed = Number(entityId);
      if (Number.isFinite(parsed)) entityUserId = parsed;
    } else if (typeof entityId === 'number' && Number.isFinite(entityId)) {
      entityUserId = entityId;
    }
    
    if (entityUserId !== userId) {
      return null;
    }
    
    // Get classlist to look up username
    let username = '';
    try {
      const classlist = await getClasslist(ou, leVersion);
      const user = classlist.find(u => {
        if (u.UserId === userId) return true;
        if (u.Identifier !== undefined) {
          const idNum = typeof u.Identifier === 'string' ? Number(u.Identifier) : u.Identifier;
          return Number.isFinite(idNum) && idNum === userId;
        }
        return false;
      });
      username = user?.Username || '';
    } catch (error) {
      // Username lookup failed, continue without it
    }
    
    // Extract feedback information
    const feedback = entityDropbox.Feedback;
    const feedbackScore = feedback?.Score !== undefined && feedback?.Score !== null ? feedback.Score : undefined;
    const isGraded = feedback?.IsGraded || false;
    const feedbackText = feedback?.Feedback?.Text || feedback?.Feedback?.Html || undefined;
    
    // Get the most recent submission
    const submissions = entityDropbox.Submissions || [];
    if (submissions.length === 0) {
      return null;
    }
    
    // Use the most recent submission by submission number
    const latestSubmission = submissions.reduce((latest: any, current: any) => {
      return (current.SubmissionNumber || 0) > (latest.SubmissionNumber || 0) ? current : latest;
    });
    
    const submittedBy = latestSubmission.SubmittedBy || {};
    const files = latestSubmission.Files || [];
    
    return {
      SubmissionId: latestSubmission.Id,
      SubmissionNumber: latestSubmission.SubmissionNumber || 0,
      UserId: userId,
      UserName: username || (typeof submittedBy.Id === 'string' ? submittedBy.Id : ''),
      DisplayName: submittedBy.DisplayName || entity.DisplayName || '',
      SubmittedDate: latestSubmission.SubmissionDate || '',
      IsRetracted: latestSubmission.IsRetracted || false,
      Files: files.map((f: any) => ({
        FileId: f.FileId,
        FileName: f.FileName,
        FileSize: f.Size || f.FileSize || 0
      })),
      TextSubmission: latestSubmission.Comment?.Text || latestSubmission.TextSubmission,
      FeedbackScore: feedbackScore,
      IsGraded: isGraded,
      FeedbackText: feedbackText
    };
  } catch (error: any) {
    // 404 means user has no submission
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching user submission:', error);
    // Fallback to fetching all submissions if user-specific endpoint fails
    try {
      const submissions = await getAssignmentSubmissions(ou, leVersion, assignmentId);
      const userSubmission = submissions.find(sub => {
        const subUserId = typeof sub.UserId === 'string' ? Number(sub.UserId) : sub.UserId;
        return subUserId === userId;
      });
      return userSubmission || null;
    } catch (fallbackError) {
      return null;
    }
  }
}

/**
 * Download a submission file from D2L
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param assignmentId - Assignment folder ID
 * @param submissionId - Submission ID
 * @param fileId - File ID
 * @returns Blob containing the file data
 */
export async function downloadSubmissionFile(
  ou: string,
  leVersion: string,
  assignmentId: number,
  submissionId: number,
  fileId: number
): Promise<Blob> {
  const response = await axios.get(
    `/d2l/api/le/${leVersion}/${ou}/dropbox/folders/${assignmentId}/submissions/${submissionId}/files/${fileId}/`,
    { responseType: 'blob' }
  );
  return response.data;
}

/**
 * Get final grade values for all users in an org unit
 * Useful for course-level statistics and averages
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param options - Optional parameters for filtering and sorting
 * @returns Array of UserGradeValue objects containing User and GradeValue
 */
export async function getFinalGradeValues(
  ou: string,
  leVersion: string,
  options?: {
    sort?: string; // 'firstname', 'lastname', 'grade', 'lastmodified', or with '-' prefix for descending
    pageSize?: number; // 1-200, default is 20
    isGraded?: boolean; // Filter to only graded or ungraded users
    searchText?: string; // Filter by first/last name
  }
): Promise<Array<{ User: User; GradeValue: GradeValue | null }>> {
  // Check for deprecated API version
  logApiVersionWarning(leVersion, 'getFinalGradeValues');
  
  const allResults: Array<{ User: User; GradeValue: GradeValue | null }> = [];
  let bookmark: string | null = null;
  
  do {
    const params = new URLSearchParams();
    if (options?.sort) {
      params.append('sort', options.sort);
    }
    if (options?.pageSize) {
      params.append('pageSize', options.pageSize.toString());
    }
    if (options?.isGraded !== undefined) {
      params.append('isGraded', options.isGraded.toString());
    }
    if (options?.searchText) {
      params.append('searchText', options.searchText);
    }
    if (bookmark) {
      params.append('bookmark', bookmark);
    }
    
    const queryString = params.toString();
    const url = `/d2l/api/le/${leVersion}/${ou}/grades/final/values/${queryString ? '?' + queryString : ''}`;
    
    const response = await withRetry(() => axios.get(url));
    const data = response.data;
    
    // The API returns an ObjectListPage containing UserGradeValue objects
    let userGradeValues: any[] = [];
    
    // Handle different response structures
    if (Array.isArray(data)) {
      userGradeValues = data;
      bookmark = null; // Array response means no pagination
    } else if (data && Array.isArray(data.Items)) {
      userGradeValues = data.Items;
      bookmark = data.Next || null; // Check for next page bookmark
    } else if (data && Array.isArray(data.Objects)) {
      userGradeValues = data.Objects;
      bookmark = data.Next || null;
    } else {
      bookmark = null; // No more pages
    }
    
    // Transform to our expected format
    for (const userGradeValue of userGradeValues) {
      const user = userGradeValue.User;
      const gradeValue = userGradeValue.GradeValue;
      
      // Extract UserId from User object for GradeValue if needed
      let userId: number | string | null = null;
      if (user) {
        if (user.Identifier !== undefined && user.Identifier !== null) {
          userId = user.Identifier;
        } else if (user.UserId !== undefined && user.UserId !== null) {
          userId = user.UserId;
        } else if (user.Id !== undefined && user.Id !== null) {
          userId = user.Id;
        }
      }
      
      // Ensure GradeValue has UserId if it's missing
      let gv: GradeValue | null = null;
      if (gradeValue) {
        gv = {
          ...gradeValue,
          UserId: gradeValue.UserId || userId || null,
          OrgUnitId: gradeValue.OrgUnitId || ou
        };
      }
      
      allResults.push({
        User: user,
        GradeValue: gv
      });
    }
  } while (bookmark);
  
  return allResults;
}
