// eLC API client methods
// Centralized API calls used across multiple components

import axios from 'axios';
import type { ApiVersions, ClasslistUser, Enrollment, User, Assignment, DiscussionForum, DiscussionTopic, DiscussionPost, MyItemsDue, GradeObject, GradeValue, AssignmentSubmission } from '../../types/d2l.js';

/**
 * Get eLC API versions
 * @returns Object mapping product codes to version numbers
 */
export async function getVersions(): Promise<ApiVersions> {
  const apiVer = await axios.get('/d2l/api/versions/');
  const result: ApiVersions = {};
  for (let i in apiVer.data) {
    result[apiVer.data[i].ProductCode] = apiVer.data[i].LatestVersion;
  }
  return result;
}

/**
 * Get classlist for a course
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @returns Array of classlist users
 */
export async function getClasslist(ou: string, leVersion: string): Promise<ClasslistUser[]> {
  const classlist = await axios.get(`/d2l/api/le/${leVersion}/${ou}/classlist/`);
  return classlist.data;
}

/**
 * Get enrollment information for current user in a course
 * @param ou - Organization unit (course) ID
 * @param lpVersion - Learning Platform API version
 * @returns Enrollment details
 */
export async function getEnrollment(ou: string, lpVersion: string): Promise<Enrollment> {
  const myEnrollment = await axios.get(`/d2l/api/lp/${lpVersion}/enrollments/myenrollments/?orgUnitTypeId=3`);
  const items: Enrollment[] = myEnrollment.data.Items || [];
  
  for (let i in items) {
    if (items[i].OrgUnit.Id.toString() === ou) {
      return items[i];
    }
  }
  
  // Helpful error message with available course IDs
  const availableIds = items.map((item: Enrollment) => item.OrgUnit.Id).join(', ');
  throw new Error(`Enrollment not found for course ID ${ou}. Available enrollments: ${availableIds || 'none'}`);
}

/**
 * Get current user information
 * @param lpVersion - Learning Platform API version
 * @returns User details
 */
export async function getUser(lpVersion: string): Promise<User> {
  const whoAmI = await axios.get(`/d2l/api/lp/${lpVersion}/users/whoami`);
  return whoAmI.data;
}

/**
 * Get assignments for a course
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @returns Array of assignments
 */
export async function getAssignments(ou: string, leVersion: string): Promise<Assignment[]> {
  const assignments = await axios.get(`/d2l/api/le/${leVersion}/${ou}/dropbox/folders/`);
  return assignments.data;
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
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @returns Array of items with due dates
 */
export async function getMyItemsDue(ou: string, leVersion: string): Promise<MyItemsDue[]> {
  const myItems = await axios.get(`/d2l/api/le/${leVersion}/${ou}/content/myItems/due/`);
  return myItems.data;
}

/**
 * Get discussion forums for a course
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @returns Array of discussion forums
 */
export async function getForums(ou: string, leVersion: string): Promise<DiscussionForum[]> {
  const forums = await axios.get(`/d2l/api/le/${leVersion}/${ou}/discussions/forums/`);
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
  const topics = await axios.get(`/d2l/api/le/${leVersion}/${ou}/discussions/forums/${forumId}/topics/`);
  return topics.data;
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
 * @returns Created post
 */
export async function createPost(
  ou: string,
  leVersion: string,
  forumId: number,
  topicId: number,
  subject: string,
  message: string
): Promise<DiscussionPost> {
  const postData = {
    ParentPostId: null,
    Subject: subject,
    Message: {
      Content: message,
      Type: 'Text'
    }
  };
  const post = await axios.post(
    `/d2l/api/le/${leVersion}/${ou}/discussions/forums/${forumId}/topics/${topicId}/posts/`,
    postData
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
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @returns Array of grade objects
 */
export async function getGradebook(ou: string, leVersion: string): Promise<GradeObject[]> {
  const gradebook = await axios.get(`/d2l/api/le/${leVersion}/${ou}/grades/`);
  const data = gradebook.data;
  // Some Brightspace tenants return arrays; others wrap in Items.
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.Items)) return data.Items;
  if (data && Array.isArray(data.Objects)) return data.Objects;
  return [];
}

/**
 * Get grade values for a specific grade object
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param gradeObjectId - Grade object ID
 * @returns Array of grade values with UserId attached
 */
export async function getGradeValues(ou: string, leVersion: string, gradeObjectId: number): Promise<GradeValue[]> {
  const grades = await axios.get(`/d2l/api/le/${leVersion}/${ou}/grades/${gradeObjectId}/values/`);
  const data = grades.data;
  
  // The API returns an ObjectListPage containing UserGradeValue objects
  // Each UserGradeValue has: { User: {...}, GradeValue: {...} | null }
  let userGradeValues: any[] = [];
  
  // Handle different response structures
  if (Array.isArray(data)) {
    userGradeValues = data;
  } else if (data && Array.isArray(data.Items)) {
    userGradeValues = data.Items;
  } else if (data && Array.isArray(data.Objects)) {
    userGradeValues = data.Objects;
  }
  
  // Transform UserGradeValue[] to GradeValue[] by extracting GradeValue and adding UserId
  const gradeValues: GradeValue[] = [];
  
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
    
    gradeValues.push(gv);
  }
  
  return gradeValues;
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
 * @returns Array of assignment submissions
 */
export async function getAssignmentSubmissions(
  ou: string,
  leVersion: string,
  assignmentId: number
): Promise<AssignmentSubmission[]> {
  const response = await axios.get(`/d2l/api/le/${leVersion}/${ou}/dropbox/folders/${assignmentId}/submissions/`);
  const entityDropboxes = Array.isArray(response.data) ? response.data : (response.data.Items || response.data.Objects || []);
  
  // Transform EntityDropbox[] to AssignmentSubmission[]
  // Each EntityDropbox contains Entity (user info), Submissions[], and Feedback
  const flatSubmissions: AssignmentSubmission[] = [];
  
  // Get classlist to look up usernames by UserId
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
  
  for (const entityDropbox of entityDropboxes) {
    const entity = entityDropbox.Entity;
    const entityId = entity?.EntityId;
    const entityDisplayName = entity?.DisplayName || '';
    
    // Skip if not a User entity or no entity ID
    if (!entity || entity.EntityType !== 'User' || !entityId) {
      continue;
    }
    
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
    
    for (const submission of submissions) {
      const submittedBy = submission.SubmittedBy || {};
      const submissionId = submission.Id;
      const submissionDate = submission.SubmissionDate || '';
      const files = submission.Files || [];
      
      // SubmittedBy.Id might be a username string, but we prefer classlist lookup
      const submissionUsername = username || (typeof submittedBy.Id === 'string' ? submittedBy.Id : '');
      
      flatSubmissions.push({
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
        TextSubmission: submission.Comment?.Text || submission.TextSubmission
      });
    }
  }
  
  return flatSubmissions;
}

/**
 * Get a specific user's submission for an assignment
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param assignmentId - Assignment folder ID
 * @param userId - User ID
 * @returns User's submission or null
 */
export async function getUserSubmission(
  ou: string,
  leVersion: string,
  assignmentId: number,
  userId: number
): Promise<AssignmentSubmission | null> {
  try {
    const submissions = await getAssignmentSubmissions(ou, leVersion, assignmentId);
    const userSubmission = submissions.find(sub => sub.UserId === userId);
    return userSubmission || null;
  } catch (error) {
    console.error('Error fetching user submission:', error);
    return null;
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
