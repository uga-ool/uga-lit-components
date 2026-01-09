// D2L/Brightspace API client methods
// Centralized API calls used across multiple components

import axios from 'axios';
import type { ApiVersions, ClasslistUser, Enrollment, User, Assignment, DiscussionForum, DiscussionTopic, DiscussionPost } from '../../types/d2l.js';

/**
 * Get D2L API versions
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
  const items = myEnrollment.data.Items || [];
  
  for (let i in items) {
    if (items[i].OrgUnit.Id.toString() === ou) {
      return items[i];
    }
  }
  
  // Helpful error message with available course IDs
  const availableIds = items.map((item: any) => item.OrgUnit.Id).join(', ');
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
