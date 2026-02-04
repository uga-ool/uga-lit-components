// D2L Quizzes API client methods
// Additional API functions for quiz-related components

import axios from 'axios';
import { cachedApiCall, logApiVersionWarning } from './d2l-client.js';
import type { ApiVersions } from '../../types/d2l.js';

// Import withRetry helper (it's not exported, so we'll use axios directly with retry logic)
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error.response?.status === 429;
      const isLastAttempt = attempt === maxRetries - 1;
      
      if (isRateLimit && !isLastAttempt) {
        const delay = baseDelay * Math.pow(2, attempt);
        const retryAfter = error.response?.headers?.['retry-after'];
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Quiz data structure from D2L API
 */
export interface Quiz {
  QuizId: number;
  Name: string;
  Description?: {
    Text: string;
    Html: string;
  };
  DueDate?: string | null;
  StartDate?: string | null;
  EndDate?: string | null;
  IsActive: boolean;
  IsRetakeable: boolean;
  AttemptsAllowed?: number;
  TimeLimit?: number;
  Questions?: QuizQuestion[];
}

/**
 * Quiz question structure
 */
export interface QuizQuestion {
  QuestionId: number;
  QuestionText: string;
  QuestionType: number; // QUESTION_T enum
  Points: number;
  Options?: QuizQuestionOption[];
  CorrectAnswer?: any;
}

/**
 * Quiz question option (for multiple choice, etc.)
 */
export interface QuizQuestionOption {
  OptionId: number;
  Text: string;
  IsCorrect: boolean;
}

/**
 * Quiz attempt structure
 */
export interface QuizAttempt {
  AttemptId: number;
  UserId: number;
  QuizId: number;
  StartDate: string;
  EndDate?: string | null;
  TimeSpent?: number;
  Score?: number;
  IsGraded: boolean;
}

/**
 * Get quizzes for a course
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @returns Array of quizzes
 */
export async function getQuizzes(
  ou: string,
  leVersion: string
): Promise<Quiz[]> {
  logApiVersionWarning(leVersion, 'getQuizzes');
  
  return cachedApiCall(`quizzes:${ou}`, async () => {
    const quizzes = await withRetry(() => 
      axios.get(`/d2l/api/le/${leVersion}/${ou}/quizzes/`)
    );
    return quizzes.data;
  });
}

/**
 * Get a specific quiz by ID
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param quizId - Quiz ID
 * @returns Quiz details
 */
export async function getQuiz(
  ou: string,
  leVersion: string,
  quizId: number
): Promise<Quiz> {
  logApiVersionWarning(leVersion, 'getQuiz');
  
  return cachedApiCall(`quiz:${ou}:${quizId}`, async () => {
    const quiz = await withRetry(() => 
      axios.get(`/d2l/api/le/${leVersion}/${ou}/quizzes/${quizId}`)
    );
    return quiz.data;
  });
}

/**
 * Get quiz attempts for a user
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param quizId - Quiz ID
 * @param userId - User ID (optional, defaults to current user)
 * @returns Array of quiz attempts
 */
export async function getQuizAttempts(
  ou: string,
  leVersion: string,
  quizId: number,
  userId?: number
): Promise<QuizAttempt[]> {
  logApiVersionWarning(leVersion, 'getQuizAttempts');
  
  const cacheKey = userId 
    ? `quizAttempts:${ou}:${quizId}:${userId}`
    : `quizAttempts:${ou}:${quizId}:current`;
  
  return cachedApiCall(cacheKey, async () => {
    const url = userId
      ? `/d2l/api/le/${leVersion}/${ou}/quizzes/${quizId}/attempts/?userId=${userId}`
      : `/d2l/api/le/${leVersion}/${ou}/quizzes/${quizId}/attempts/`;
    
    const attempts = await withRetry(() => axios.get(url));
    return attempts.data;
  });
}
