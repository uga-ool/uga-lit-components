// Gradebook utility functions for exporting grades to D2L

import { getGradebook, updateGradeValue, getGradeValues } from './d2l-client.js';
import type { GradeObject, GradeValue } from '../../types/d2l.js';

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
 * Export grades to D2L gradebook
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

  for (const grade of grades) {
    try {
      // Get existing grade value to preserve other fields
      const existingGrades = await getGradeValues(ou, leVersion, gradeObjectId);
      const existingGrade = existingGrades.find(g => g.UserId === grade.userId);

      // Calculate points numerator and denominator
      const pointsNumerator = grade.pointsEarned;
      const pointsDenominator = grade.pointsPossible;

      const gradeValue: Partial<GradeValue> = {
        OrgUnitId: parseInt(ou),
        UserId: grade.userId,
        GradeObjectId: gradeObjectId,
        PointsNumerator: pointsNumerator,
        PointsDenominator: pointsDenominator,
      };

      if (grade.comments) {
        gradeValue.Comments = {
          Text: grade.comments,
          Html: grade.comments.replace(/\n/g, '<br>')
        };
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

