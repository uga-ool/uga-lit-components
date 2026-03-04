// D2L Content API client methods
// Additional API functions for content-related components

import axios from 'axios';
import { cachedApiCall } from './api-cache.js';
import { withRetry, logApiVersionWarning, fetchAllPages } from './d2l-client.js';
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
 * ContentLearnerProgress from D2L aggregate completions API.
 * Same data source as Class Progress dashboard.
 */
export interface ContentLearnerProgress {
  UserId: string | number;
  OrgUnitId: string | number;
  RequiredItems: number;
  CompletedItems: number;
}

/**
 * Flatten nested D2L TOC structure. D2L returns { Modules: [...] } where each
 * module can have nested Modules and Topics. We flatten to a single array of modules.
 */
function flattenTocModules(modules: unknown[]): ContentModule[] {
  if (!Array.isArray(modules)) return [];
  const result: ContentModule[] = [];
  for (const m of modules) {
    const mod = m as Record<string, unknown>;
    result.push({
      ModuleId: mod.ModuleId as number,
      Title: (mod.Title as string) || '',
      Description: mod.Description as string | undefined,
      IsHidden: (mod.IsHidden as boolean) ?? false,
      Topics: Array.isArray(mod.Topics) ? (mod.Topics as ContentTopic[]) : [],
    });
    const childModules = mod.Modules;
    if (Array.isArray(childModules) && childModules.length > 0) {
      result.push(...flattenTocModules(childModules));
    }
  }
  return result;
}

/**
 * Get content table of contents (TOC)
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @returns Content TOC structure (flattened array of modules)
 */
export async function getContentTOC(
  ou: string,
  leVersion: string
): Promise<ContentModule[]> {
  logApiVersionWarning(leVersion, 'getContentTOC');
  
  return cachedApiCall(`contentTOC:${ou}:v2`, async () => {
    const toc = await withRetry(() => 
      axios.get(`/d2l/api/le/${leVersion}/${ou}/content/toc`)
    );
    const data = toc.data;
    // D2L returns { Modules: [...] }; some versions may return array directly
    const modules = Array.isArray(data) ? data : (data?.Modules ?? []);
    return flattenTocModules(modules);
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
 * Get content topic file/HTML body.
 * D2L stores HTML in topic files. The /file endpoint returns raw content.
 * Also checks topic Description.Html from the topic API when available.
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param topicId - Topic ID
 * @returns HTML or text content, or null if not available
 */
export async function getContentTopicHtml(
  ou: string,
  leVersion: string,
  topicId: number
): Promise<string | null> {
  // Try topic file first (common for HTML file topics)
  try {
    const res = await withRetry(() =>
      axios.get(`/d2l/api/le/${leVersion}/${ou}/content/topics/${topicId}/file`, {
        responseType: 'text',
      })
    );
    if (typeof res.data === 'string' && res.data.length > 0) {
      return res.data;
    }
  } catch {
    // File endpoint may not exist for all topic types
  }
  // Fallback: topic object may have Description.Html (D2L rich text)
  try {
    const topic = await getContentTopic(ou, leVersion, topicId);
    const desc = topic?.Description as { Html?: string; Text?: string } | undefined;
    if (desc && typeof desc === 'object') {
      if (desc.Html) return desc.Html;
      if (desc.Text) return desc.Text;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Extract Kaltura video entry IDs from HTML content.
 * Matches uga-video videoid="..." and videoid='...' and similar patterns.
 */
export function extractKalturaVideoIds(html: string | null): string[] {
  if (!html || typeof html !== 'string') return [];
  const ids = new Set<string>();
  // videoid="1_abc123" or videoid='1_abc123' or videoid=1_abc123
  const regex = /videoid\s*=\s*["']?([a-zA-Z0-9_-]+)["']?/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    const id = m[1]?.trim();
    if (id && /^[0-9]+_[a-zA-Z0-9]+/.test(id)) {
      ids.add(id);
    }
  }
  return [...ids];
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
      const data = completions.data;
      const arr = Array.isArray(data) ? data : (data?.Items ?? []);
      return Array.isArray(arr) ? arr : [];
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

/**
 * Get aggregate content completion for users (course-level).
 * Uses the same API as Class Progress dashboard - returns CompletedItems and RequiredItems per user.
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param userIds - User IDs (from classlist). Max 100 per request.
 */
export async function getContentCompletionsAggregate(
  ou: string,
  leVersion: string,
  userIds: number[]
): Promise<ContentLearnerProgress[]> {
  if (userIds.length === 0) return [];

  const sortedIds = [...userIds].sort((a, b) => a - b);
  const cacheKey = `contentCompletionsAggregate:${ou}:${sortedIds.join(',')}`;
  return cachedApiCall(cacheKey, async () => {
    const allProgress: ContentLearnerProgress[] = [];
    // API limits 100 users per request; batch if needed
    for (let i = 0; i < sortedIds.length; i += 100) {
      const batch = sortedIds.slice(i, i + 100);
      const userIdsCSV = batch.join(',');
      const { data } = await withRetry(() =>
        axios.get(`/d2l/api/le/${leVersion}/${ou}/content/completions/`, {
          params: { userIdsCSV, ignoreInvalid: true },
        })
      );
      const arr = Array.isArray(data) ? data : (data?.Items ?? data?.Objects ?? []);
      if (Array.isArray(arr)) allProgress.push(...arr);
    }
    return allProgress;
  });
}

/**
 * Mark a content topic as complete for a user.
 * Requires content:completions:write scope.
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param topicId - Topic ID
 * @param userId - User ID (D2L Identifier)
 */
export async function completeContentTopic(
  ou: string,
  leVersion: string,
  topicId: string | number,
  userId: string | number
): Promise<void> {
  logApiVersionWarning(leVersion, 'completeContentTopic');
  const topicIdStr = String(topicId);
  const userIdStr = String(userId);
  await axios.put(
    `/d2l/api/le/${leVersion}/${ou}/content/topics/${topicIdStr}/completions/users/${userIdStr}`,
    { CompletedDate: new Date().toISOString() }
  );
}
