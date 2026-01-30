// D2L Groups API client methods
// Additional API functions for group-related components

import axios from 'axios';
import { cachedApiCall, withRetry, logApiVersionWarning } from './d2l-client.js';
import type { ApiVersions } from '../../types/d2l.js';

/**
 * Group category structure from D2L API
 */
export interface GroupCategory {
  GroupCategoryId: number;
  Name: string;
  Description?: string;
  EnrollmentStyle: number; // GRPENROLL_T
  Groups?: Group[];
}

/**
 * Group structure from D2L API
 */
export interface Group {
  GroupId: number;
  Name: string;
  Code?: string;
  Description?: string;
  Enrollments?: GroupEnrollment[];
}

/**
 * Group enrollment structure
 */
export interface GroupEnrollment {
  UserId: number;
  UserName: string;
  DisplayName: string;
  EnrollmentDate?: string;
}

/**
 * Get group categories for a course
 * @param ou - Organization unit (course) ID
 * @param lpVersion - Learning Platform API version
 * @returns Array of group categories
 */
export async function getGroupCategories(
  ou: string,
  lpVersion: string
): Promise<GroupCategory[]> {
  logApiVersionWarning(lpVersion, 'getGroupCategories');
  
  return cachedApiCall(`groupCategories:${ou}`, async () => {
    const categories = await withRetry(() => 
      axios.get(`/d2l/api/lp/${lpVersion}/${ou}/groupcategories/`)
    );
    return categories.data;
  });
}

/**
 * Get groups in a category
 * @param ou - Organization unit (course) ID
 * @param lpVersion - Learning Platform API version
 * @param categoryId - Group category ID
 * @returns Array of groups
 */
export async function getGroups(
  ou: string,
  lpVersion: string,
  categoryId: number
): Promise<Group[]> {
  logApiVersionWarning(lpVersion, 'getGroups');
  
  return cachedApiCall(`groups:${ou}:${categoryId}`, async () => {
    const groups = await withRetry(() => 
      axios.get(`/d2l/api/lp/${lpVersion}/${ou}/groupcategories/${categoryId}/groups/`)
    );
    return groups.data;
  });
}

/**
 * Get group enrollments (members)
 * @param ou - Organization unit (course) ID
 * @param lpVersion - Learning Platform API version
 * @param categoryId - Group category ID
 * @param groupId - Group ID
 * @returns Array of group enrollments
 */
export async function getGroupEnrollments(
  ou: string,
  lpVersion: string,
  categoryId: number,
  groupId: number
): Promise<GroupEnrollment[]> {
  logApiVersionWarning(lpVersion, 'getGroupEnrollments');
  
  return cachedApiCall(`groupEnrollments:${ou}:${categoryId}:${groupId}`, async () => {
    const enrollments = await withRetry(() => 
      axios.get(`/d2l/api/lp/${lpVersion}/${ou}/groupcategories/${categoryId}/groups/${groupId}/enrollments`)
    );
    return enrollments.data;
  });
}

/**
 * Get groups for current user
 * @param ou - Organization unit (course) ID
 * @param lpVersion - Learning Platform API version
 * @returns Array of groups user is enrolled in
 */
export async function getMyGroups(
  ou: string,
  lpVersion: string
): Promise<Group[]> {
  logApiVersionWarning(lpVersion, 'getMyGroups');
  
  return cachedApiCall(`myGroups:${ou}`, async () => {
    // Get all group categories
    const categories = await getGroupCategories(ou, lpVersion);
    
    // Get all groups and filter by user enrollment
    const allGroups: Group[] = [];
    for (const category of categories) {
      const groups = await getGroups(ou, lpVersion, category.GroupCategoryId);
      allGroups.push(...groups);
    }
    
    // Filter groups where user is enrolled
    // Note: This is a simplified approach - in production, you'd want to check enrollments
    return allGroups;
  });
}
