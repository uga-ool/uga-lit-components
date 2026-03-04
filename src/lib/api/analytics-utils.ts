// Analytics utilities for aggregating course-wide data
// Aggregates data from content, assignments, discussions, and quizzes

import { getContentTOC, getContentCompletions, getContentCompletionsAggregate, type ContentModule, type ContentCompletion } from './d2l-client-content.js';
import { getAssignments, getAssignmentSubmissions, getClasslist, getForums, getTopics, getPostsPaged, getFinalGradeValues, getCompetenciesStructure, getLoginLogs, type Assignment, type DiscussionForum, type DiscussionTopic } from './d2l-client.js';
import type { ClasslistUser } from '../../types/d2l.js';
import type { CourseAnalytics, ModuleAnalytics, OverallStats } from '../../types/d2l.js';

/**
 * Get course-wide analytics aggregated by module
 */
export async function getCourseAnalytics(
  ou: string,
  leVersion: string,
  lpVersion: string,
  options?: {
    includeContent?: boolean;
    includeAssignments?: boolean;
    includeDiscussions?: boolean;
    includeObjectives?: boolean;
    includeLoginHistory?: boolean;
    includeGrades?: boolean;
  }
): Promise<CourseAnalytics> {
  const includeContent = options?.includeContent !== false;
  const includeAssignments = options?.includeAssignments !== false;
  const includeDiscussions = options?.includeDiscussions !== false;
  const includeObjectives = options?.includeObjectives !== false;
  const includeLoginHistory = options?.includeLoginHistory !== false;
  const includeGrades = options?.includeGrades !== false;

  // Get classlist for student count
  const classlistRaw = await getClasslist(ou, leVersion);
  const classlist = Array.isArray(classlistRaw) ? classlistRaw : [];
  const studentCount = classlist.length;

  // Get content TOC to structure modules
  const tocRaw = await getContentTOC(ou, leVersion);
  const toc = Array.isArray(tocRaw) ? tocRaw : [];
  
  // Initialize module analytics
  const moduleAnalytics: ModuleAnalytics[] = toc.map(module => ({
    moduleId: module.ModuleId,
    moduleName: module.Title || `Module ${module.ModuleId}`,
  }));

  // Aggregate data for each module
  const promises: Promise<void>[] = [];

  if (includeContent) {
    promises.push(aggregateContentStats(ou, leVersion, toc, moduleAnalytics, studentCount, classlist));
  }

  if (includeAssignments) {
    promises.push(aggregateAssignmentStats(ou, leVersion, toc, moduleAnalytics, studentCount));
  }

  if (includeDiscussions) {
    promises.push(aggregateDiscussionStats(ou, leVersion, toc, moduleAnalytics, studentCount));
  }

  await Promise.all(promises);

  // Get aggregate content completion (same API as Class Progress) for accurate overall rate
  let contentAggregate: { completedItems: number; requiredItems: number } | undefined;
  if (includeContent) {
    try {
      const userIds = classlist
        .map((u) => (u.UserId != null ? Number(u.UserId) : typeof u.Identifier === 'number' ? u.Identifier : parseInt(String(u.Identifier || ''), 10)))
        .filter((id) => !Number.isNaN(id));
      if (userIds.length > 0) {
        const progress = await getContentCompletionsAggregate(ou, leVersion, userIds);
        const completedItems = progress.reduce((sum, p) => sum + (p.CompletedItems || 0), 0);
        const requiredItems = progress.reduce((sum, p) => sum + (p.RequiredItems || 0), 0);
        if (requiredItems > 0) {
          contentAggregate = { completedItems, requiredItems };
        }
      }
    } catch (err) {
      console.warn('Could not fetch aggregate content completions:', err);
    }
  }

  // Fetch objectives, login history, grades (students only)
  let objectivesStats: { totalObjectives: number; completedObjectives: number } | undefined;
  let loginStats: { totalLogins: number } | undefined;
  let gradesStats: { averageGrade: number; gradedCount: number } | undefined;

  const studentUserIds = getStudentUserIds(classlist);

  if (includeObjectives) {
    try {
      objectivesStats = await fetchObjectivesStats(ou, leVersion);
    } catch (err) {
      console.warn('Could not fetch objectives stats:', err);
    }
  }

  if (includeLoginHistory && studentUserIds.length > 0) {
    try {
      loginStats = await fetchLoginStats(ou, lpVersion, studentUserIds);
    } catch (err) {
      console.warn('Could not fetch login stats:', err);
    }
  }

  if (includeGrades && studentUserIds.length > 0) {
    try {
      gradesStats = await fetchGradesStats(ou, leVersion, studentUserIds);
    } catch (err) {
      console.warn('Could not fetch grades stats:', err);
    }
  }

  // Calculate overall stats
  const overall = calculateOverallStats(moduleAnalytics, studentCount, {
    includeContent,
    includeAssignments,
    includeDiscussions,
    contentAggregate,
    objectivesStats,
    loginStats,
    gradesStats,
  });

  return {
    modules: moduleAnalytics,
    overall,
  };
}

/**
 * Aggregate content completion statistics by module
 */
async function aggregateContentStats(
  ou: string,
  leVersion: string,
  toc: ContentModule[],
  moduleAnalytics: ModuleAnalytics[],
  studentCount: number,
  classlist: ClasslistUser[] = []
): Promise<void> {
  // Get all completions (for all users)
  const allCompletions: ContentCompletion[] = [];
  
  for (const module of toc) {
    if (module.Topics) {
      for (const topic of module.Topics) {
        try {
          // Get completions for this topic (all users)
          const completions = await getContentCompletions(ou, leVersion, topic.TopicId);
          allCompletions.push(...completions);
        } catch (error) {
          // Skip topics that don't support completions
          console.warn(`Could not get completions for topic ${topic.TopicId}:`, error);
        }
      }
    }
  }

  // Group completions by module
  for (let i = 0; i < toc.length; i++) {
    const module = toc[i];
    const moduleAnalytic = moduleAnalytics[i];
    
    if (!module.Topics || module.Topics.length === 0) {
      moduleAnalytic.contentStats = {
        totalTopics: 0,
        completedTopics: 0,
        completionRate: 0,
        totalViews: 0,
        uniqueViewers: 0,
      };
      continue;
    }

    const topicIds = new Set(module.Topics.map(t => t.TopicId));
    const moduleCompletions = allCompletions.filter(c => topicIds.has(c.TopicId));
    
    // Count unique users who completed topics
    const completedUsers = new Set(moduleCompletions.map(c => c.UserId));
    const completedTopics = new Set(moduleCompletions.map(c => c.TopicId));
    
    moduleAnalytic.contentStats = {
      totalTopics: module.Topics.length,
      completedTopics: completedTopics.size,
      completionRate: studentCount > 0 ? (completedUsers.size / studentCount) * 100 : 0,
      totalViews: moduleCompletions.length,
      uniqueViewers: completedUsers.size,
    };
  }
}

/**
 * Aggregate assignment submission statistics by module
 */
async function aggregateAssignmentStats(
  ou: string,
  leVersion: string,
  toc: ContentModule[],
  moduleAnalytics: ModuleAnalytics[],
  studentCount: number
): Promise<void> {
  const assignmentsRaw = await getAssignments(ou, leVersion);
  const assignments = Array.isArray(assignmentsRaw) ? assignmentsRaw : [];
  
  // Map assignments to modules by TopicId (if assignments are linked to content topics)
  const moduleAssignments: Map<number, Assignment[]> = new Map();
  
  for (const assignment of assignments) {
    // Try to find which module this assignment belongs to
    // This is approximate - assignments may not be directly linked to modules
    // We'll group by first module for now, or could use assignment metadata
    if (moduleAnalytics.length > 0) {
      // For now, distribute assignments evenly across modules
      // In a real implementation, you'd use TopicId or other metadata
      const moduleIndex = assignments.indexOf(assignment) % moduleAnalytics.length;
      const moduleId = toc[moduleIndex]?.ModuleId;
      if (moduleId) {
        if (!moduleAssignments.has(moduleId)) {
          moduleAssignments.set(moduleId, []);
        }
        moduleAssignments.get(moduleId)!.push(assignment);
      }
    }
  }

  // Get submission stats for each module
  for (let i = 0; i < moduleAnalytics.length; i++) {
    const moduleId = toc[i].ModuleId;
    const moduleAssigns = moduleAssignments.get(moduleId) || [];
    
    if (moduleAssigns.length === 0) {
      moduleAnalytics[i].assignmentStats = {
        totalAssignments: 0,
        submittedAssignments: 0,
        submissionRate: 0,
        averageScore: 0,
        totalSubmissions: 0,
      };
      continue;
    }

    let totalSubmissions = 0;
    let totalScore = 0;
    let scoredSubmissions = 0;
    const submittedUsers = new Set<number>();

    for (const assignment of moduleAssigns) {
      try {
        const submissions = await getAssignmentSubmissions(ou, leVersion, assignment.Id, { activeOnly: true });
        totalSubmissions += submissions.length;
        
        for (const submission of submissions) {
          const userId = typeof submission.UserId === 'string' ? parseInt(submission.UserId, 10) : submission.UserId;
          if (userId) {
            submittedUsers.add(userId);
          }
          
          if (submission.FeedbackScore !== null && submission.FeedbackScore !== undefined) {
            totalScore += submission.FeedbackScore;
            scoredSubmissions++;
          }
        }
      } catch (error) {
        console.warn(`Could not get submissions for assignment ${assignment.Id}:`, error);
      }
    }

    const averageScore = scoredSubmissions > 0 ? totalScore / scoredSubmissions : 0;
    const submissionRate = studentCount > 0 ? (submittedUsers.size / studentCount) * 100 : 0;

    moduleAnalytics[i].assignmentStats = {
      totalAssignments: moduleAssigns.length,
      submittedAssignments: submittedUsers.size,
      submissionRate,
      averageScore,
      totalSubmissions,
    };
  }
}

/**
 * Aggregate discussion participation statistics by module
 */
async function aggregateDiscussionStats(
  ou: string,
  leVersion: string,
  toc: ContentModule[],
  moduleAnalytics: ModuleAnalytics[],
  studentCount: number
): Promise<void> {
  const forumsRaw = await getForums(ou, leVersion);
  const forums = Array.isArray(forumsRaw) ? forumsRaw : [];
  
  // Get all topics with their forum IDs
  const allTopics: Array<DiscussionTopic & { ForumId: number }> = [];
  for (const forum of forums) {
    try {
      const topicsRaw = await getTopics(ou, leVersion, forum.ForumId);
      const topics = Array.isArray(topicsRaw) ? topicsRaw : [];
      for (const topic of topics) {
        allTopics.push({ ...topic, ForumId: forum.ForumId });
      }
    } catch (error) {
      console.warn(`Could not get topics for forum ${forum.ForumId}:`, error);
    }
  }

  // Map discussions to modules (approximate - distribute evenly)
  const moduleTopics: Map<number, Array<DiscussionTopic & { ForumId: number }>> = new Map();
  for (let i = 0; i < allTopics.length; i++) {
    const topic = allTopics[i];
    const moduleIndex = i % moduleAnalytics.length;
    const moduleId = toc[moduleIndex]?.ModuleId;
    if (moduleId) {
      if (!moduleTopics.has(moduleId)) {
        moduleTopics.set(moduleId, []);
      }
      moduleTopics.get(moduleId)!.push(topic);
    }
  }

  // Get post stats for each module
  for (let i = 0; i < moduleAnalytics.length; i++) {
    const moduleId = toc[i].ModuleId;
    const topics = moduleTopics.get(moduleId) || [];
    
    if (topics.length === 0) {
      moduleAnalytics[i].discussionStats = {
        totalTopics: 0,
        totalPosts: 0,
        participatingStudents: 0,
        averagePostsPerStudent: 0,
      };
      continue;
    }

    let totalPosts = 0;
    const participatingUsers = new Set<number>();

    for (const topic of topics) {
      try {
        const posts = await getPostsPaged(ou, leVersion, topic.ForumId, topic.TopicId);
        totalPosts += posts.length;
        
        // Extract user IDs from posts (if available)
        // Note: DiscussionPost may not have UserId directly - this is approximate
        for (const post of posts) {
          // Posts may have user info in different fields depending on API version
          // This is a simplified approach
        }
      } catch (error) {
        console.warn(`Could not get posts for topic ${topic.TopicId}:`, error);
      }
    }

    // Estimate participating students (simplified - would need actual user data from posts)
    const estimatedParticipants = Math.min(Math.ceil(totalPosts / 2), studentCount);

    moduleAnalytics[i].discussionStats = {
      totalTopics: topics.length,
      totalPosts,
      participatingStudents: estimatedParticipants,
      averagePostsPerStudent: estimatedParticipants > 0 ? totalPosts / estimatedParticipants : 0,
    };
  }
}

/** Role display names to exclude from student counts (admin, instructors, etc.) */
const NON_STUDENT_ROLE_PATTERNS = /instructor|admin|teacher|ta|faculty|designer|auditor/i;

/**
 * Get user IDs for students only (exclude admin, instructors, teachers)
 */
function getStudentUserIds(classlist: ClasslistUser[]): number[] {
  return classlist
    .filter((u) => {
      const roleName = (u.ClasslistRoleDisplayName || '').trim();
      // Exclude admin, instructors, teachers; include Student, Demo Student, etc.
      return !NON_STUDENT_ROLE_PATTERNS.test(roleName);
    })
    .map((u) => {
      if (u.UserId != null) return Number(u.UserId);
      if (typeof u.Identifier === 'number') return u.Identifier;
      return parseInt(String(u.Identifier || ''), 10);
    })
    .filter((id) => !Number.isNaN(id));
}

/**
 * Count objectives from competencies structure (ObjectTypeId === 2)
 * D2L does not expose a reliable API for user objective completion; we show structure count
 */
async function fetchObjectivesStats(
  ou: string,
  leVersion: string
): Promise<{ totalObjectives: number; completedObjectives: number }> {
  const structure = await getCompetenciesStructure(ou, leVersion);
  const objects = structure?.Objects ?? [];
  let totalObjectives = 0;

  function countObjectives(items: Array<{ ObjectTypeId?: number; ChildrenPage?: { Objects?: unknown[] } }>) {
    for (const obj of items) {
      if (obj.ObjectTypeId === 2) totalObjectives++;
      const children = obj.ChildrenPage?.Objects;
      if (Array.isArray(children)) countObjectives(children as Array<{ ObjectTypeId?: number; ChildrenPage?: { Objects?: unknown[] } }>);
    }
  }
  countObjectives(objects);

  // D2L API does not expose user objective completion; use placeholder
  return { totalObjectives, completedObjectives: 0 };
}

/**
 * Fetch login count for students in last 30 days
 */
async function fetchLoginStats(
  ou: string,
  lpVersion: string,
  studentUserIds: number[]
): Promise<{ totalLogins: number }> {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const dateRangeStart = start.toISOString();
  const dateRangeEnd = end.toISOString();

  const logs = await getLoginLogs(lpVersion, dateRangeStart, dateRangeEnd);
  const studentIdSet = new Set(studentUserIds);
  const studentLogins = logs.filter((log) => {
    const uid = log.UserId ?? (log as { UserId?: string }).UserId;
    const id = typeof uid === 'string' ? parseInt(uid, 10) : uid;
    return id && studentIdSet.has(id);
  });
  return { totalLogins: studentLogins.length };
}

/**
 * Fetch average grade for students from final grades
 */
async function fetchGradesStats(
  ou: string,
  leVersion: string,
  studentUserIds: number[]
): Promise<{ averageGrade: number; gradedCount: number }> {
  const studentIdSet = new Set(studentUserIds);
  const allGrades = await getFinalGradeValues(ou, leVersion, { pageSize: 200 });
  let totalScore = 0;
  let gradedCount = 0;

  for (const { User, GradeValue } of allGrades) {
    const userId = User?.Identifier ?? User?.UserId ?? (User as { Id?: number }).Id;
    const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    if (!id || !studentIdSet.has(id)) continue;

    const gv = GradeValue;
    if (!gv || gv.PointsNumerator == null || gv.PointsDenominator == null || gv.PointsDenominator === 0) continue;
    totalScore += (gv.PointsNumerator / gv.PointsDenominator) * 100;
    gradedCount++;
  }

  return {
    averageGrade: gradedCount > 0 ? totalScore / gradedCount : 0,
    gradedCount,
  };
}

/**
 * Calculate overall course statistics
 */
function calculateOverallStats(
  modules: ModuleAnalytics[],
  studentCount: number,
  options: {
    includeContent?: boolean;
    includeAssignments?: boolean;
    includeDiscussions?: boolean;
    contentAggregate?: { completedItems: number; requiredItems: number };
    objectivesStats?: { totalObjectives: number; completedObjectives: number };
    loginStats?: { totalLogins: number };
    gradesStats?: { averageGrade: number; gradedCount: number };
  }
): OverallStats {
  const overall: OverallStats = {
    totalModules: modules.length,
    totalStudents: studentCount,
  };

  if (options.includeContent) {
    const totalTopics = modules.reduce((sum, m) => sum + (m.contentStats?.totalTopics || 0), 0);
    // Use aggregate API (same as Class Progress) when available for accurate rate
    if (options.contentAggregate && options.contentAggregate.requiredItems > 0) {
      const { completedItems, requiredItems } = options.contentAggregate;
      overall.contentStats = {
        totalTopics,
        totalCompletions: completedItems,
        overallCompletionRate: (completedItems / requiredItems) * 100,
        totalRequired: requiredItems,
      };
    } else {
      const totalCompletions = modules.reduce((sum, m) => sum + (m.contentStats?.totalViews || 0), 0);
      overall.contentStats = {
        totalTopics,
        totalCompletions,
        overallCompletionRate: studentCount > 0 && totalTopics > 0 ? (totalCompletions / (totalTopics * studentCount)) * 100 : 0,
      };
    }
  }

  if (options.includeAssignments) {
    const totalAssignments = modules.reduce((sum, m) => sum + (m.assignmentStats?.totalAssignments || 0), 0);
    const totalSubmissions = modules.reduce((sum, m) => sum + (m.assignmentStats?.totalSubmissions || 0), 0);
    const totalScore = modules.reduce((sum, m) => {
      const stats = m.assignmentStats;
      if (stats && stats.averageScore && stats.totalSubmissions) {
        return sum + (stats.averageScore * stats.totalSubmissions);
      }
      return sum;
    }, 0);
    const scoredSubmissions = modules.reduce((sum, m) => {
      const stats = m.assignmentStats;
      if (stats && stats.averageScore && stats.totalSubmissions) {
        return sum + stats.totalSubmissions;
      }
      return sum;
    }, 0);

    overall.assignmentStats = {
      totalAssignments,
      totalSubmissions,
      overallSubmissionRate: studentCount > 0 ? (totalSubmissions / (totalAssignments * studentCount)) * 100 : 0,
      overallAverageScore: scoredSubmissions > 0 ? totalScore / scoredSubmissions : 0,
    };
  }

  if (options.includeDiscussions) {
    const totalTopics = modules.reduce((sum, m) => sum + (m.discussionStats?.totalTopics || 0), 0);
    const totalPosts = modules.reduce((sum, m) => sum + (m.discussionStats?.totalPosts || 0), 0);
    const participatingStudents = modules.reduce((sum, m) => sum + (m.discussionStats?.participatingStudents || 0), 0);

    overall.discussionStats = {
      totalTopics,
      totalPosts,
      participatingStudents: Math.min(participatingStudents, studentCount),
    };
  }

  if (options.objectivesStats && options.objectivesStats.totalObjectives > 0) {
    overall.objectivesStats = options.objectivesStats;
  }

  if (options.loginStats) {
    overall.loginStats = options.loginStats;
  }

  if (options.gradesStats && options.gradesStats.gradedCount > 0) {
    overall.gradesStats = options.gradesStats;
  }

  return overall;
}
