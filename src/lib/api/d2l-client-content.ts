// D2L Content API client methods
// Additional API functions for content-related components

import axios from 'axios';
import { cachedApiCall, withRetry, logApiVersionWarning, fetchAllPages } from './d2l-client.js';
import type { ApiVersions } from '../../types/d2l.js';

/**
 * Content module structure from D2L API
 */
export interface ContentModule {
  ModuleId: number;
  Title: string;
  Description?: string;
  IsHidden: boolean;
  Topics?: ContentTopic[];
}

/**
 * Content topic structure from D2L API
 */
export interface ContentTopic {
  TopicId: number;
  Title: string;
  Description?: string;
  Url?: string;
  IsHidden: boolean;
  CompletionType?: number;
  DueDate?: string | null;
  StartDate?: string | null;
  EndDate?: string | null;
}

/**
 * Content completion structure
 */
export interface ContentCompletion {
  TopicId: number;
  UserId: number;
  CompletedDate?: string | null;
  CompletionType: number;
}

/**
 * Get content table of contents (TOC)
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @returns Content TOC structure
 */
export async function getContentTOC(
  ou: string,
  leVersion: string
): Promise<ContentModule[]> {
  logApiVersionWarning(leVersion, 'getContentTOC');
  
  return cachedApiCall(`contentTOC:${ou}`, async () => {
    const toc = await withRetry(() => 
      axios.get(`/d2l/api/le/${leVersion}/${ou}/content/toc`)
    );
    return toc.data;
  });
}

/**
 * Get content module details
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param moduleId - Module ID
 * @returns Content module details
 */
export async function getContentModule(
  ou: string,
  leVersion: string,
  moduleId: number
): Promise<ContentModule> {
  logApiVersionWarning(leVersion, 'getContentModule');
  
  return cachedApiCall(`contentModule:${ou}:${moduleId}`, async () => {
    const module = await withRetry(() => 
      axios.get(`/d2l/api/le/${leVersion}/${ou}/content/modules/${moduleId}`)
    );
    return module.data;
  });
}

/**
 * Get content topic details
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param topicId - Topic ID
 * @returns Content topic details
 */
export async function getContentTopic(
  ou: string,
  leVersion: string,
  topicId: number
): Promise<ContentTopic> {
  logApiVersionWarning(leVersion, 'getContentTopic');
  
  return cachedApiCall(`contentTopic:${ou}:${topicId}`, async () => {
    const topic = await withRetry(() => 
      axios.get(`/d2l/api/le/${leVersion}/${ou}/content/topics/${topicId}`)
    );
    return topic.data;
  });
}

/**
 * Get content completions for a user
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param topicId - Topic ID (optional, if not provided returns all completions)
 * @param userId - User ID (optional, defaults to current user)
 * @returns Array of content completions
 */
export async function getContentCompletions(
  ou: string,
  leVersion: string,
  topicId?: number,
  userId?: number
): Promise<ContentCompletion[]> {
  logApiVersionWarning(leVersion, 'getContentCompletions');
  
  const cacheKey = topicId
    ? `contentCompletions:${ou}:${topicId}:${userId || 'current'}`
    : `contentCompletions:${ou}:all:${userId || 'current'}`;
  
  return cachedApiCall(cacheKey, async () => {
    if (topicId && userId) {
      const completion = await withRetry(() => 
        axios.get(`/d2l/api/le/${leVersion}/${ou}/content/topics/${topicId}/completions/users/${userId}`)
      );
      return completion.data ? [completion.data] : [];
    } else if (topicId) {
      const completions = await withRetry(() => 
        axios.get(`/d2l/api/le/${leVersion}/${ou}/content/topics/${topicId}/completions/`)
      );
      return completions.data.Items || completions.data || [];
    } else {
      // Get all completions - would need to iterate through topics
      // This is a simplified version
      const toc = await getContentTOC(ou, leVersion);
      const allCompletions: ContentCompletion[] = [];
      
      for (const module of toc) {
        if (module.Topics) {
          for (const topic of module.Topics) {
            try {
              const topicCompletions = await getContentCompletions(ou, leVersion, topic.TopicId, userId);
              allCompletions.push(...topicCompletions);
            } catch (error) {
              // Skip topics that don't support completions
              console.warn(`Could not get completions for topic ${topic.TopicId}:`, error);
            }
          }
        }
      }
      
      return allCompletions;
    }
  });
}
