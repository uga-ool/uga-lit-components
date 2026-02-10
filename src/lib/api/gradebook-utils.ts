// Gradebook utility functions for exporting grades to D2L

import {
  getGradebook,
  updateGradeValue,
  getDropboxFolder,
  getDropboxSubmissions,
} from './d2l-client.js';
import type { GradeObject, GradeValue } from '../../types/d2l.js';

/** RichText from submission Comment */
type RichText = { Text?: string; Html?: string };

export interface GradeExport {
  userId: number;
  pointsEarned: number;
  pointsPossible: number;
  percentage: number;
  comments?: string;
}

/**
 * Find or create a grade object for an assignment
 */
export async function findOrCreateGradeObject(
  ou: string,
  leVersion: string,
  assignmentName: string,
  assignmentId: number,
  maxPoints: number
): Promise<GradeObject> {
  const gradebook = await getGradebook(ou, leVersion);
  
  // Try to find existing grade object by name
  let gradeObject = gradebook.find(g => g.Name === assignmentName);
  
  if (!gradeObject) {
    // Grade object doesn't exist - would need to create it
    // Note: Creating grade objects typically requires admin permissions
    // For now, we'll return an error or use a default
    throw new Error(`Grade object "${assignmentName}" not found. Please create it in the gradebook first.`);
  }
  
  return gradeObject;
}

/**
 * Export grades to D2L gradebook.
 * Fetches the grade object to scale quiz points to the grade item's MaxPoints
 * and builds the payload expected by the D2L API (Numeric: PointsNumerator only, etc.).
 */
export async function exportGradesToGradebook(
  ou: string,
  leVersion: string,
  gradeObjectId: number,
  grades: GradeExport[]
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  const gradebook = await getGradebook(ou, leVersion);
  const gradeObj = gradebook.find((g) => g.GradeObjectId === gradeObjectId);
  if (!gradeObj) {
    return {
      success: 0,
      failed: grades.length,
      errors: [`Grade object ${gradeObjectId} not found in gradebook.`],
    };
  }

  const gradeType = gradeObj.Type ?? 1; // 1 = Numeric
  const maxPoints = gradeObj.MaxPoints ?? null;

  for (const grade of grades) {
    try {
      // Scale quiz score to the grade item's MaxPoints (D2L Numeric expects PointsNumerator out of MaxPoints)
      const quizTotal = grade.pointsPossible > 0 ? grade.pointsPossible : 1;
      const effectiveMax = maxPoints ?? grade.pointsPossible;
      const scaledNumerator =
        effectiveMax != null
          ? Math.round((grade.pointsEarned / quizTotal) * effectiveMax * 100) / 100
          : grade.pointsEarned;

      // Build payload per D2L IncomingGradeValue: Numeric uses only PointsNumerator; omit PointsDenominator
      const gradeValue: Partial<GradeValue> = {
        OrgUnitId: parseInt(ou, 10),
        UserId: grade.userId,
        GradeObjectId: gradeObjectId,
        GradeObjectType: gradeType,
        PointsNumerator: scaledNumerator,
        Comments: { Content: grade.comments ?? '', Type: 'Text' },
        PrivateComments: { Content: '', Type: 'Text' },
      };

      // Numeric (1): do not send PointsDenominator; D2L uses the grade object's MaxPoints
      if (gradeType !== 1) {
        gradeValue.PointsDenominator = grade.pointsPossible;
      }

      await updateGradeValue(ou, leVersion, gradeObjectId, grade.userId, gradeValue);
      success++;
    } catch (error: any) {
      failed++;
      errors.push(`Failed to update grade for user ${grade.userId}: ${error.message}`);
      console.error(`Error updating grade for user ${grade.userId}:`, error);
    }
  }

  return { success, failed, errors };
}

/** Quiz result shape stored in dropbox submission comment (from uga-quiz). */
export interface QuizResultFromComment {
  userId?: number;
  pointsEarned?: number;
  totalPoints?: number;
  pointsPossible?: number;
}

function getCommentText(comment: RichText | undefined): string {
  if (!comment) return '';
  const raw = (comment.Text ?? comment.Html ?? '').trim();
  if (!raw) return '';
  if (raw.startsWith('<')) {
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.innerHTML = raw;
      return (div.textContent ?? div.innerText ?? '').trim();
    }
    return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  return raw;
}

/**
 * Parse quiz result from submission comment.
 * Supports: (1) JSON with pointsEarned/totalPoints; (2) human-readable format from uga-quiz (e.g. "Score: 35/75 (46.7%)").
 */
export function parseQuizResultFromComment(
  comment: RichText | undefined,
  entityUserId: number
): QuizResultFromComment | null {
  const text = getCommentText(comment);
  if (!text) return null;

  // Try JSON first (e.g. if comment ever includes raw JSON)
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const pointsEarned =
      typeof parsed.pointsEarned === 'number'
        ? parsed.pointsEarned
        : typeof parsed.pointsEarned === 'string'
          ? parseFloat(parsed.pointsEarned)
          : undefined;
    const totalPoints =
      typeof parsed.totalPoints === 'number'
        ? parsed.totalPoints
        : typeof parsed.pointsPossible === 'number'
          ? parsed.pointsPossible
          : typeof parsed.totalPoints === 'string'
            ? parseFloat(parsed.totalPoints)
            : undefined;
    const userId =
      typeof parsed.userId === 'number'
        ? parsed.userId
        : typeof parsed.userId === 'string'
          ? parseInt(parsed.userId, 10)
          : entityUserId;
    if (pointsEarned !== undefined && totalPoints !== undefined && totalPoints > 0) {
      return {
        userId: Number.isNaN(userId) ? entityUserId : userId,
        pointsEarned: pointsEarned ?? 0,
        totalPoints: totalPoints ?? 0,
      };
    }
  } catch {
    // Not JSON; fall through to human-readable parse
  }

  // Parse uga-quiz human-readable format: "Score: 35/75 (46.7%)" or "35/75 (46.7%)" in first lines
  const scoreLine = text.split(/\n/).find((line) => /Score:\s*\d+[\s/]\d+|\d+\s*\/\s*\d+\s*\([\d.]+%\)/.test(line)) || text;
  const scoreMatch = scoreLine.match(/Score:\s*(\d+)\s*\/\s*(\d+)|(\d+)\s*\/\s*(\d+)\s*\([\d.]+%\)/);
  const pointsEarned = scoreMatch ? parseInt(scoreMatch[1] ?? scoreMatch[3] ?? '0', 10) : NaN;
  const totalPoints = scoreMatch ? parseInt(scoreMatch[2] ?? scoreMatch[4] ?? '0', 10) : NaN;
  if (!Number.isNaN(pointsEarned) && !Number.isNaN(totalPoints) && totalPoints > 0) {
    return {
      userId: entityUserId,
      pointsEarned,
      totalPoints,
    };
  }
  return null;
}

export interface SyncQuizGradesResult {
  success: number;
  failed: number;
  errors: string[];
  skipped: number;
  message: string;
}

/**
 * Sync quiz grades from an assignment/dropbox folder to the linked grade item.
 * Fetches all submissions, parses quiz result JSON from each submission comment, and updates the grade item.
 */
export async function syncQuizGradesFromDropbox(
  ou: string,
  leVersion: string,
  folderId: number,
  options?: { activeOnly?: boolean }
): Promise<SyncQuizGradesResult> {
  const activeOnly = options?.activeOnly !== false;
  let skipped = 0;

  const [folder, submissions] = await Promise.all([
    getDropboxFolder(ou, leVersion, folderId),
    getDropboxSubmissions(ou, leVersion, folderId, activeOnly),
  ]);

  const gradeItemId = folder.GradeItemId;
  if (gradeItemId == null) {
    return {
      success: 0,
      failed: 0,
      errors: [],
      skipped: 0,
      message:
        'This assignment is not linked to a grade item. In eLC, link the assignment to a grade item, then run sync again.',
    };
  }

  const grades: GradeExport[] = [];
  for (const entityDropbox of submissions) {
    const entity = entityDropbox.Entity;
    if (entity.EntityType !== 'User') {
      skipped++;
      continue;
    }
    const entityUserId = typeof entity.EntityId === 'string' ? parseInt(entity.EntityId, 10) : entity.EntityId;
    const subs = entityDropbox.Submissions ?? [];
    const latest = subs.length > 0 ? subs[subs.length - 1] : null;
    const parsed = latest ? parseQuizResultFromComment(latest.Comment, entityUserId) : null;
    if (!parsed) {
      skipped++;
      continue;
    }
    grades.push({
      userId: parsed.userId!,
      pointsEarned: parsed.pointsEarned!,
      pointsPossible: parsed.totalPoints!,
      percentage: (parsed.pointsEarned! / parsed.totalPoints!) * 100,
    });
  }

  if (grades.length === 0) {
    return {
      success: 0,
      failed: 0,
      errors: [],
      skipped,
      message:
        'No quiz results found in submissions. Ensure students have submitted via the quiz component and that the submission comment contains the quiz result JSON.',
    };
  }

  const result = await exportGradesToGradebook(ou, leVersion, gradeItemId, grades);
  const message =
    result.failed > 0
      ? `Synced ${result.success} grade(s); ${result.failed} failed. ${result.errors.join(' ')}`
      : `Synced ${result.success} quiz grade(s) to the gradebook.`;

  return {
    success: result.success,
    failed: result.failed,
    errors: result.errors,
    skipped,
    message,
  };
}

