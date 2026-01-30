import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import axios from 'axios';
import { getVersions, getUser, getEnrollment, getGradebook, createGradeObject, updateGradeValue, getGradeValues, logApiVersionWarning } from '../lib/api/d2l-client.js';
import { getCourse } from '../lib/api/d2l-utils.js';
import { parseD2LCSV } from '../lib/data/csv-parser.js';
import type { ApiVersions, User, GradeObject, Enrollment } from '../types/d2l.js';

/**
 * Question types supported by the quiz component
 */
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple-choice',
  TRUE_FALSE = 'true-false',
  MATCHING = 'matching',
  SHORT_ANSWER = 'short-answer',
  FILL_IN_BLANK = 'fill-in-blank'
}

/**
 * Quiz question structure
 */
export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  points: number;
  options?: string[]; // For multiple choice, true/false
  correctAnswer: string | number | string[] | { [key: string]: string }; // Answer(s) - varies by type
  explanation?: string; // Feedback/explanation shown after answering
  caseSensitive?: boolean; // For short answer and fill-in-blank
}

/**
 * Quiz attempt/response structure
 */
interface QuizAttempt {
  questionId: string;
  answer: any;
  isCorrect: boolean;
  pointsEarned: number;
  timestamp: string;
}

/**
 * Quiz result structure
 */
interface QuizResult {
  totalPoints: number;
  pointsEarned: number;
  percentage: number;
  passed: boolean;
  attempts: QuizAttempt[];
  completedAt: string;
}

@customElement('uga-quiz')
class UgaQuiz extends LitElement {
  // Light DOM: render into the page directly (eLC-friendly)
  createRenderRoot() {
    return this;
  }

  @property({ type: String }) quizId = '';
  @property({ type: String }) quizTitle = '';
  @property({ type: String }) questions: string = ''; // JSON string of questions
  @property({ type: String, attribute: 'grade-object-name' }) gradeObjectName = ''; // Name of gradebook item for tracking
  @property({ type: Boolean }) autoCreateGradeObject = true; // Automatically create gradebook item if it doesn't exist
  @property({ type: String, attribute: 'api-endpoint' }) apiEndpoint = ''; // External API endpoint for submitting grades (e.g., "https://your-api.com/api/quiz/submit")
  @property({ type: Number }) passingScore = 70; // Percentage required to pass
  @property({ type: Boolean }) allowRetry = true;
  @property({ type: Number }) maxAttempts = 3; // Maximum retry attempts
  @property({ type: Boolean }) showFeedback = true; // Show immediate feedback
  @property({ type: Boolean }) allowReset = false; // Allow manual reset (for instructors/admins)
  @property({ type: Boolean }) randomizeQuestions = false;
  @property({ type: Number }) timeLimit = 0; // Time limit in minutes (0 = no limit)
  @property({ type: Boolean }) autoSubmit = false; // Auto-submit when time expires
  @property({ type: String }) type: 'local' | 'inline' | 'csv' = 'inline'; // Load from file (JSON/CSV) or inline JSON
  @property({ type: String }) filename = ''; // Filename if type='local' or type='csv'

  @state() private parsedQuestions: QuizQuestion[] = [];
  @state() private currentQuestionIndex = 0;
  @state() private responses: { [questionId: string]: any } = {};
  @state() private results: QuizResult | null = null;
  @state() private isSubmitted = false;
  @state() private isStarted = false;
  @state() private loading = false;
  @state() private errorMessage: string | null = null;
  @state() private timeRemaining: number = 0; // Time remaining in seconds
  @state() private timerInterval: number | null = null;
  @state() private attemptCount = 0;
  @state() private completionStatus: 'not-started' | 'in-progress' | 'completed' | 'passed' | 'failed' = 'not-started';
  @state() private gradebookSaveStatus: 'idle' | 'saving' | 'success' | 'error' = 'idle';
  @state() private gradebookErrorMessage: string | null = null;

  private versions: ApiVersions = {};
  private ou: string | null = null;
  private currentUser: User | null = null;
  private currentEnrollment: Enrollment | null = null;
  private gradeObject: GradeObject | null = null;
  private abortController: AbortController | null = null;

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    this.abortController = new AbortController();

    // Debug: Log attribute values on initialization
    // Ensure quizId has a default value if not set
    if (!this.quizId || this.quizId.trim() === '') {
      // Generate a default quizId based on gradeObjectName or use a timestamp
      if (this.gradeObjectName) {
        this.quizId = `quiz-${this.gradeObjectName.toLowerCase().replace(/\s+/g, '-')}`;
      } else {
        this.quizId = `quiz-${Date.now()}`;
      }
      console.log(`ℹ️ quizId was empty, generated default: "${this.quizId}"`);
    }
    
    console.log('🔍 uga-quiz component initialized:', {
      quizId: this.quizId,
      gradeObjectName: this.gradeObjectName || '(not set)',
      hasGradeObjectNameAttribute: this.hasAttribute('grade-object-name'),
      gradeObjectNameAttribute: this.getAttribute('grade-object-name') || '(not found)'
    });

    this.ou = getCourse();
    if (!this.ou) {
      // For demo/testing purposes, allow component to work without course ID if questions are inline
      if (!this.questions && this.type !== 'local' && this.type !== 'csv') {
        this.errorMessage = 'Unable to determine course ID from URL. Make sure you are viewing this in an eLC course page, or provide questions inline.';
        this.loading = false;
        this.requestUpdate();
        return;
      }
      // If we have inline questions or file-based questions, we can still work (just won't be able to save to gradebook)
      console.warn('⚠️ No course ID found. Quiz will work but gradebook integration will be disabled.');
    }

    this.loading = true;
    this.requestUpdate();

    try {
      // Get API versions (only if we have a course ID)
      if (this.ou) {
        try {
          this.versions = await getVersions();
          if (this.versions.le) {
            logApiVersionWarning(this.versions.le, 'getGradebook');
            logApiVersionWarning(this.versions.le, 'updateGradeValue');
          }
          if (this.versions.lp) {
            logApiVersionWarning(this.versions.lp, 'getUser');
          }

          // Get current user
          this.currentUser = await getUser(this.versions.lp);

          // Get enrollment to get the correct user ID for gradebook
          try {
            this.currentEnrollment = await getEnrollment(this.ou, this.versions.lp, {
              fallbackToFirst: false, // Don't use wrong enrollment - better to use currentUser
              throwOnNotFound: false
            });
            if (this.currentEnrollment && this.currentEnrollment.User) {
              console.log('📋 Enrollment info:', {
                userId: this.currentEnrollment.User.Identifier,
                displayName: this.currentEnrollment.User.DisplayName,
                role: this.currentEnrollment.Role?.Name || 'Unknown'
              });
            } else {
              console.log('ℹ️ No enrollment found for this course. Will use currentUser.Identifier for gradebook operations.');
            }
          } catch (enrollmentError: any) {
            console.warn('⚠️ Could not get enrollment info:', enrollmentError);
            this.currentEnrollment = null; // Ensure it's null on error
          }

          // Check for existing completion/grade (and create grade object if needed)
          if (this.gradeObjectName) {
            await this.checkCompletionStatus();
            
            // Try to retry any pending gradebook saves from previous sessions
            // Do this AFTER user info is loaded to ensure we have userId
            // Use setTimeout to ensure it runs after component is fully initialized
            setTimeout(() => {
              this.retryPendingGradebookSaves().catch(err => {
                console.warn('⚠️ Background retry of pending gradebook save failed:', err);
                // Don't block page load if retry fails
              });
            }, 2000); // 2 second delay to ensure user info is fully loaded
            
            // If grade object doesn't exist and auto-create is enabled, try to create it now
            // This happens during initialization when an instructor/admin is likely viewing the page
            // Students won't have permissions, so this will fail gracefully for them
            if (!this.gradeObject && this.autoCreateGradeObject && this.parsedQuestions.length > 0) {
              try {
                const totalPoints = this.parsedQuestions.reduce((sum, q) => sum + q.points, 0);
                this.gradeObject = await createGradeObject(this.ou, this.versions.le, {
                  Name: this.gradeObjectName,
                  ShortName: this.gradeObjectName.substring(0, 20),
                  Type: 1, // Numeric
                  MaxPoints: totalPoints,
                  CanExceedMaxPoints: false,
                  IsBonus: false,
                  ExcludeFromFinalGrade: false,
                  CategoryId: 0,
                  GradeSchemeId: null,
                  Description: {
                    Content: `Auto-created by uga-quiz component for "${this.quizTitle || this.quizId}"`,
                    Type: 'Text'
                  }
                });
                console.log(`✅ Pre-created gradebook item "${this.gradeObjectName}" with ${totalPoints} max points`);
              } catch (createError: any) {
                // Silently fail during initialization - students don't have permissions
                // This is expected behavior. The gradebook item should be created by an instructor
                // before students take the quiz, or instructors can create it manually.
                if (createError.response?.status === 403) {
                  console.log(`ℹ️ Gradebook item "${this.gradeObjectName}" will need to be created by an instructor (student viewing page)`);
                } else {
                  console.warn('⚠️ Could not pre-create gradebook item:', createError);
                }
                // Don't fail - component can still function for inline quizzes
              }
            }
          }

          // Check for previous attempts
          await this.loadPreviousAttempts();
        } catch (apiError: any) {
          // If API calls fail, log but don't fail the component
          console.warn('⚠️ D2L API calls failed. Quiz will work but gradebook integration disabled:', apiError);
        }
      }

      // Load quiz questions (this should always work)
      await this.loadQuestions();

    } catch (error: any) {
      if (error.message === 'Request aborted' || this.abortController?.signal.aborted) {
        return;
      }
      console.error('Error initializing quiz:', error);
      this.errorMessage = `Failed to initialize quiz: ${error.message || 'Unknown error'}`;
    } finally {
      this.loading = false;
      this.requestUpdate();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.abortController?.abort();
    this.abortController = null;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Load quiz questions from JSON (inline or file) or CSV (D2L format)
   */
  private async loadQuestions(): Promise<void> {
    let questionsData: QuizQuestion[] = [];

    if (this.type === 'csv' && this.filename) {
      // Load from D2L CSV file
      try {
        const response = await axios.get(this.filename);
        const csvContent = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        const result = parseD2LCSV(csvContent);
        questionsData = result.questions;
        
        if (questionsData.length === 0) {
          throw new Error('No questions found in CSV file. Please check the file format.');
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          throw new Error(`CSV file not found: ${this.filename}. Please check the file path and ensure the file exists in your course files.`);
        } else if (error.response?.status) {
          throw new Error(`Failed to load CSV file (HTTP ${error.response.status}): ${error.message}`);
        } else {
          throw new Error(`Failed to load CSV file: ${error.message}`);
        }
      }
    } else if (this.type === 'local' && this.filename) {
      // Load from JSON file
      try {
        const response = await axios.get(this.filename);
        const data = response.data;
        questionsData = Array.isArray(data.questions) ? data.questions : (Array.isArray(data) ? data : []);
        
        if (questionsData.length === 0) {
          throw new Error('No questions found in JSON file. Please check the file format.');
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          throw new Error(`JSON file not found: ${this.filename}. Please check the file path and ensure the file exists in your course files.`);
        } else if (error.response?.status) {
          throw new Error(`Failed to load JSON file (HTTP ${error.response.status}): ${error.message}`);
        } else {
          throw new Error(`Failed to load JSON file: ${error.message}`);
        }
      }
    } else if (this.questions) {
      // Parse inline JSON
      try {
        const parsed = JSON.parse(this.questions);
        questionsData = Array.isArray(parsed.questions) ? parsed.questions : (Array.isArray(parsed) ? parsed : []);
        
        if (questionsData.length === 0) {
          throw new Error('No questions found in JSON. Please check the format.');
        }
      } catch (error: any) {
        if (error instanceof SyntaxError) {
          throw new Error(`Invalid quiz JSON format: ${error.message}. Please check your JSON syntax.`);
        } else {
          throw new Error(`Invalid quiz JSON: ${error.message}`);
        }
      }
    } else {
      throw new Error('No quiz questions provided. Use questions attribute, type="local" with filename, or type="csv" with filename.');
    }

    // Validate questions
    for (const q of questionsData) {
      if (!q.id || !q.type || !q.question || q.points === undefined || q.correctAnswer === undefined) {
        throw new Error(`Invalid question format: ${JSON.stringify(q)}`);
      }
    }

    // Randomize if requested
    if (this.randomizeQuestions) {
      questionsData = this.shuffleArray([...questionsData]);
    }

    this.parsedQuestions = questionsData;

    // Initialize responses
    this.responses = {};
    for (const q of this.parsedQuestions) {
      if (q.type === QuestionType.MATCHING) {
        this.responses[q.id] = {};
      } else if (q.type === QuestionType.MULTIPLE_CHOICE || q.type === QuestionType.TRUE_FALSE) {
        this.responses[q.id] = '';
      } else {
        this.responses[q.id] = '';
      }
    }
  }

  /**
   * Check if quiz is already completed (via gradebook)
   */
  private async checkCompletionStatus(): Promise<void> {
    if (!this.gradeObjectName || !this.ou || !this.versions.le) return;
    
    // Need at least one user identifier
    const userIdToCheck = this.currentEnrollment?.User?.Identifier || this.currentUser?.Identifier;
    if (!userIdToCheck) {
      console.log('ℹ️ Cannot check completion status: no user ID available yet');
      return;
    }

    try {
      const gradebook = await getGradebook(this.ou, this.versions.le);
      this.gradeObject = gradebook.find(g => g.Name === this.gradeObjectName);

      if (this.gradeObject && this.gradeObject.GradeObjectId) {
        const userIdNum = typeof userIdToCheck === 'string' ? parseInt(userIdToCheck) : userIdToCheck;
        
        try {
          const gradeValues = await getGradeValues(this.ou, this.versions.le, this.gradeObject.GradeObjectId);
          
          // Check for grade value - UserId can be number or string
          const userGrade = gradeValues.find(g => {
            const gUserId = typeof g.UserId === 'string' ? parseInt(g.UserId) : g.UserId;
            return gUserId === userIdNum;
          });

          if (userGrade && userGrade.PointsNumerator !== null && userGrade.PointsNumerator !== undefined) {
            // Quiz has been completed
            const percentage = userGrade.PointsDenominator && userGrade.PointsDenominator > 0
              ? (userGrade.PointsNumerator / userGrade.PointsDenominator) * 100
              : 0;
            
            this.completionStatus = percentage >= this.passingScore ? 'passed' : 'failed';
            this.isSubmitted = true;
            console.log(`ℹ️ Quiz already completed: ${percentage.toFixed(1)}% (${this.completionStatus})`);
          }
        } catch (gradeValuesError: any) {
          // Handle permission errors gracefully - students may not have permission to read grade values
          if (gradeValuesError.response?.status === 403) {
            console.log('ℹ️ Cannot check completion status: permission denied (403). This is normal for students. Quiz can proceed.');
          } else {
            console.warn('⚠️ Could not check completion status (grade values):', gradeValuesError.message || gradeValuesError);
          }
          // Don't fail - quiz can still proceed
        }
      }
    } catch (error: any) {
      // Handle permission errors gracefully
      if (error.response?.status === 403) {
        console.log('ℹ️ Cannot check completion status: permission denied (403). This is normal for students. Quiz can proceed.');
      } else {
        console.warn('⚠️ Could not check completion status:', error.message || error);
      }
      // Don't fail the quiz if we can't check status - students can still take it
    }
  }

  /**
   * Load previous attempts (for retry logic)
   */
  private async loadPreviousAttempts(): Promise<void> {
    // For now, we'll track attempts in localStorage
    // In production, you might want to store this in D2L custom data or gradebook comments
    const userId = this.currentUser?.Identifier || 'anonymous';
    const storageKey = `uga-quiz-attempts-${this.quizId}-${userId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.attemptCount = data.attemptCount || 0;
      } catch (error) {
        console.warn('Could not parse stored attempt data:', error);
      }
    }
  }

  /**
   * Start the quiz
   */
  private startQuiz(): void {
    this.isStarted = true;
    this.currentQuestionIndex = 0;
    this.isSubmitted = false;
    this.results = null;
    this.attemptCount++;

    // Start timer if time limit is set
    if (this.timeLimit > 0) {
      this.timeRemaining = this.timeLimit * 60; // Convert minutes to seconds
      this.startTimer();
    }

    this.requestUpdate();
  }

  /**
   * Start the countdown timer
   */
  private startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = window.setInterval(() => {
      this.timeRemaining--;
      
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }
        
        if (this.autoSubmit) {
          this.submitQuiz();
        } else {
          this.errorMessage = 'Time limit reached. Please submit your quiz.';
        }
      }
      
      this.requestUpdate();
    }, 1000);
  }

  /**
   * Format time remaining as MM:SS
   */
  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Handle answer selection
   */
  private handleAnswer(questionId: string, answer: any): void {
    if (this.isSubmitted) return;

    this.responses[questionId] = answer;
    this.requestUpdate();
  }

  /**
   * Grade a single question
   */
  private gradeQuestion(question: QuizQuestion, answer: any): QuizAttempt {
    let isCorrect = false;
    let pointsEarned = 0;

    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.TRUE_FALSE:
        isCorrect = String(answer) === String(question.correctAnswer);
        break;

      case QuestionType.SHORT_ANSWER:
      case QuestionType.FILL_IN_BLANK:
        const userAnswer = String(answer).trim();
        const correctAnswer = String(question.correctAnswer).trim();
        
        if (question.caseSensitive) {
          isCorrect = userAnswer === correctAnswer;
        } else {
          isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
        }
        break;

      case QuestionType.MATCHING:
        // For matching, correctAnswer is an object like { "A": "1", "B": "2" }
        // answer should be an object with the same structure
        if (typeof question.correctAnswer === 'object' && typeof answer === 'object') {
          const correct = question.correctAnswer as { [key: string]: string };
          let matches = 0;
          let totalMatches = 0;
          
          for (const key in correct) {
            totalMatches++;
            if (answer[key] === correct[key]) {
              matches++;
            }
          }
          
          isCorrect = matches === totalMatches;
          // Partial credit: award points proportionally
          pointsEarned = (matches / totalMatches) * question.points;
        } else {
          isCorrect = false;
        }
        break;
    }

    if (isCorrect && pointsEarned === 0) {
      pointsEarned = question.points;
    }

    return {
      questionId: question.id,
      answer,
      isCorrect,
      pointsEarned,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Submit and grade the quiz
   */
  private async submitQuiz(): Promise<void> {
    if (this.isSubmitted) return;

    // Stop timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.loading = true;
    this.requestUpdate();

    try {
      // Grade all questions
      const attempts: QuizAttempt[] = [];
      let totalPoints = 0;
      let pointsEarned = 0;

      for (const question of this.parsedQuestions) {
        totalPoints += question.points;
        const attempt = this.gradeQuestion(question, this.responses[question.id]);
        attempts.push(attempt);
        pointsEarned += attempt.pointsEarned;
      }

      const percentage = totalPoints > 0 ? (pointsEarned / totalPoints) * 100 : 0;
      const passed = percentage >= this.passingScore;

      this.results = {
        totalPoints,
        pointsEarned,
        percentage,
        passed,
        attempts,
        completedAt: new Date().toISOString()
      };

      this.isSubmitted = true;
      this.completionStatus = passed ? 'passed' : 'failed';

      // Save to gradebook if gradeObjectName is provided
      // We need at least a user ID - prefer enrollment User.Identifier, fallback to currentUser.Identifier
      const userIdToUse = this.currentEnrollment?.User?.Identifier || this.currentUser?.Identifier;
      
      // Comprehensive debug logging
      console.log('🔍 Gradebook save check:', {
        gradeObjectName: this.gradeObjectName || '(not set)',
        hasOU: !!this.ou,
        ou: this.ou,
        hasUserId: !!userIdToUse,
        userId: userIdToUse,
        userIdSource: this.currentEnrollment?.User?.Identifier ? 'enrollment' : 'currentUser',
        hasApiVersion: !!this.versions.le,
        apiVersion: this.versions.le,
        currentUser: this.currentUser?.DisplayName || 'unknown',
        enrollment: this.currentEnrollment?.User?.DisplayName || 'not found'
      });
      
      if (!this.gradeObjectName) {
        console.warn('⚠️ gradeObjectName is not set. Please add grade-object-name="Formative Quiz 1" to the uga-quiz component.');
      }
      
      if (this.gradeObjectName && this.ou && userIdToUse && this.versions.le) {
        this.gradebookSaveStatus = 'saving';
        this.requestUpdate();
        try {
          console.log('💾 Attempting to save quiz results to gradebook...', {
            user: this.currentUser?.DisplayName || 'Unknown',
            userId: userIdToUse,
            enrollmentUserId: this.currentEnrollment?.User?.Identifier,
            currentUserId: this.currentUser?.Identifier,
            gradeObjectName: this.gradeObjectName,
            points: `${pointsEarned}/${totalPoints}`,
            percentage: `${((pointsEarned / totalPoints) * 100).toFixed(1)}%`
          });
          await this.saveToGradebook(pointsEarned, totalPoints, passed);
          this.gradebookSaveStatus = 'success';
          this.gradebookErrorMessage = null;
          console.log('✅ Gradebook save completed successfully');
          
          // Remove any pending grade from localStorage since we successfully saved
          const userIdToUse = this.currentEnrollment?.User?.Identifier || this.currentUser?.Identifier;
          if (userIdToUse) {
            const pendingGradeKey = `uga-quiz-pending-grade-${this.quizId}-${userIdToUse}`;
            localStorage.removeItem(pendingGradeKey);
          }
        } catch (error: any) {
          this.gradebookSaveStatus = 'error';
          
          // Provide user-friendly error messages
          if (error.response?.status >= 500 && error.response?.status < 600) {
            this.gradebookErrorMessage = `D2L server error (${error.response.status}). The gradebook service is temporarily unavailable. Your quiz results have been saved locally. Please try again later or contact your instructor.`;
          } else {
            this.gradebookErrorMessage = error.message || 'Failed to save to gradebook';
          }
          
          console.error('❌ Gradebook save failed:', {
            error: error.message,
            response: error.response?.data,
            status: error.response?.status,
            statusText: error.response?.statusText,
            user: this.currentUser?.DisplayName || this.currentEnrollment?.User?.DisplayName,
            userId: userIdToUse,
            gradeObjectName: this.gradeObjectName,
            courseId: this.ou
          });
          
          // For server errors, log additional context
          if (error.response?.status >= 500 && error.response?.status < 600) {
            console.warn('⚠️ Server error occurred. The component automatically retried, but all attempts failed. This may be a temporary D2L service issue.');
          }
        }
        this.requestUpdate();
      } else {
        const missing = [];
        if (!this.gradeObjectName) missing.push('grade-object-name attribute');
        if (!this.ou) missing.push('course ID');
        if (!userIdToUse) missing.push('user ID');
        if (!this.versions.le) missing.push('API version');
        
        console.warn('⚠️ Gradebook save skipped. Missing:', missing.join(', '));
        console.warn('💡 To enable gradebook saving, add grade-object-name="Your Grade Item Name" to the uga-quiz component.');
      }

      // Save attempt count
      const storageKey = `uga-quiz-attempts-${this.quizId}-${this.currentUser?.Identifier || 'anonymous'}`;
      localStorage.setItem(storageKey, JSON.stringify({
        attemptCount: this.attemptCount,
        lastCompleted: new Date().toISOString()
      }));
      
      // If gradebook save failed, save the pending grade for retry
      if (this.gradebookSaveStatus === 'error' && this.gradeObjectName && this.ou) {
        const userIdToUse = this.currentEnrollment?.User?.Identifier || this.currentUser?.Identifier;
        if (userIdToUse) {
          const pendingGradeKey = `uga-quiz-pending-grade-${this.quizId}-${userIdToUse}`;
          const pendingGrade = {
            quizId: this.quizId,
            courseId: this.ou,
            userId: userIdToUse,
            gradeObjectName: this.gradeObjectName,
            pointsEarned: pointsEarned,
            totalPoints: totalPoints,
            percentage: percentage,
            passed: passed,
            timestamp: new Date().toISOString(),
            attemptCount: this.attemptCount
          };
          localStorage.setItem(pendingGradeKey, JSON.stringify(pendingGrade));
          console.log('💾 Saved pending grade to localStorage for retry:', pendingGrade);
        }
      }

    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      this.errorMessage = `Failed to submit quiz: ${error.message || 'Unknown error'}`;
    } finally {
      this.loading = false;
      this.requestUpdate();
    }
  }

  /**
   * Save quiz completion to gradebook
   */
  private async saveToGradebook(pointsEarned: number, totalPoints: number, passed: boolean): Promise<void> {
    // Get user ID - prefer enrollment User.Identifier, fallback to currentUser.Identifier
    const userIdToUse = this.currentEnrollment?.User?.Identifier || this.currentUser?.Identifier;
    
    if (!this.ou || !userIdToUse || !this.gradeObjectName || !this.versions.le) {
      const missing = [];
      if (!this.ou) missing.push('course ID');
      if (!userIdToUse) missing.push('user ID (neither enrollment nor currentUser available)');
      if (!this.gradeObjectName) missing.push('grade object name');
      if (!this.versions.le) missing.push('API version');
      throw new Error(`Missing required information for gradebook save: ${missing.join(', ')}`);
    }

    console.log('📊 Saving to gradebook:', {
      courseId: this.ou,
      userId: userIdToUse,
      userIdSource: this.currentEnrollment?.User?.Identifier ? 'enrollment' : 'currentUser',
      userName: this.currentUser?.DisplayName || this.currentEnrollment?.User?.DisplayName || 'Unknown',
      gradeObjectName: this.gradeObjectName,
      points: `${pointsEarned}/${totalPoints}`
    });

    // Find or get grade object
    let gradeObject: GradeObject | undefined = this.gradeObject;
    
    if (!gradeObject) {
      console.log('🔍 Looking up gradebook...');
      const gradebook = await getGradebook(this.ou, this.versions.le);
      console.log(`📋 Found ${gradebook.length} gradebook items:`, gradebook.map(g => g.Name));
      
      // Try exact match first
      gradeObject = gradebook.find(g => g.Name === this.gradeObjectName);
      
      // If not found, try case-insensitive match
      if (!gradeObject) {
        gradeObject = gradebook.find(g => g.Name.toLowerCase() === this.gradeObjectName.toLowerCase());
        if (gradeObject) {
          console.warn(`⚠️ Found grade object with case-insensitive match: "${gradeObject.Name}" (looking for "${this.gradeObjectName}")`);
        }
      }
      
      // If still not found, try trimming whitespace
      if (!gradeObject) {
        gradeObject = gradebook.find(g => g.Name.trim() === this.gradeObjectName.trim());
        if (gradeObject) {
          console.warn(`⚠️ Found grade object after trimming whitespace: "${gradeObject.Name}"`);
        }
      }
      
      // Cache the found grade object
      if (gradeObject) {
        this.gradeObject = gradeObject;
      }
    }

    if (!gradeObject) {
      // Grade object doesn't exist
      // Don't try to create it here - students don't have permissions
      // The gradebook item should have been created during initialization (when instructor viewed the page)
      // or needs to be created manually by an instructor
      const gradebook = await getGradebook(this.ou, this.versions.le);
      const availableNames = gradebook.map(g => `"${g.Name}"`).join(', ');
      
      throw new Error(
        `Gradebook item "${this.gradeObjectName}" not found. ` +
        `Please ask your instructor to create a gradebook item with the exact name "${this.gradeObjectName}" ` +
        `before taking this quiz. ` +
        `Available gradebook items: ${availableNames || 'none'}. ` +
        `Note: Instructors can enable auto-creation by viewing this page (the gradebook item will be created automatically).`
      );
    }

    // Validate grade object has required properties
    if (!gradeObject.GradeObjectId) {
      console.error('❌ Grade object found but missing GradeObjectId:', gradeObject);
      const gradebook = await getGradebook(this.ou, this.versions.le);
      console.error('❌ Full gradebook response:', gradebook);
      throw new Error(
        `Gradebook item "${this.gradeObjectName}" exists but is missing required ID (GradeObjectId). ` +
        `This may indicate a D2L API issue or the gradebook item is not fully initialized. ` +
        `Please try refreshing the page or contact support.`
      );
    }
    
    console.log('✅ Found grade object:', {
      id: gradeObject.GradeObjectId,
      name: gradeObject.Name,
      type: gradeObject.Type,
      maxPoints: gradeObject.MaxPoints
    });

    // Validate grade object type (should be numeric for points-based grading)
    // Handle undefined Type - some D2L instances don't return Type, but if it's in the gradebook as numeric, proceed
    if (gradeObject.Type !== undefined && gradeObject.Type !== 1) {
      console.warn(`⚠️ Grade object "${this.gradeObjectName}" is not a numeric type (Type: ${gradeObject.Type}). Results may not display correctly.`);
    } else if (gradeObject.Type === undefined) {
      console.log(`ℹ️ Grade object "${this.gradeObjectName}" Type is undefined. Assuming numeric type based on gradebook configuration.`);
      // Type is undefined but gradebook shows it as numeric - this is okay, proceed
    }

    // Validate max points match if specified
    if (gradeObject.MaxPoints && gradeObject.MaxPoints !== totalPoints) {
      console.warn(`⚠️ Grade object max points (${gradeObject.MaxPoints}) doesn't match quiz total points (${totalPoints}). Using quiz total points.`);
    }

    // Handle user ID - Use enrollment user ID if available (more reliable for gradebook)
    // Otherwise fall back to currentUser Identifier
    let userId: number;
    let userIdSource = 'currentUser.Identifier';
    
    if (this.currentEnrollment?.User?.Identifier) {
      // Prefer enrollment user ID as it's the correct ID for gradebook operations
      const enrollmentId = this.currentEnrollment.User.Identifier;
      userId = typeof enrollmentId === 'string' ? parseInt(enrollmentId) : enrollmentId;
      userIdSource = 'enrollment.User.Identifier';
    } else if (this.currentUser?.Identifier) {
      const identifierStr = String(this.currentUser.Identifier).trim();
      const parsedId = parseInt(identifierStr);
      if (!isNaN(parsedId) && String(parsedId) === identifierStr) {
        userId = parsedId;
      } else {
        throw new Error(`Invalid user ID format: ${identifierStr}. Expected numeric ID.`);
      }
    } else {
      throw new Error('No user ID available for gradebook save');
    }

    if (isNaN(userId) || userId <= 0) {
      throw new Error(`Invalid user ID: ${userId}. User ID must be a positive number.`);
    }

    console.log('👤 User info for gradebook:', {
      userId: userId,
      userIdSource: userIdSource,
      displayName: this.currentUser?.DisplayName || this.currentEnrollment?.User?.DisplayName || 'Unknown',
      enrollmentUserId: this.currentEnrollment?.User?.Identifier,
      currentUserIdentifier: this.currentUser?.Identifier
    });

    const percentage = this.results?.percentage || (totalPoints > 0 ? (pointsEarned / totalPoints) * 100 : 0);
    const attemptInfo = this.attemptCount > 1 ? ` (Attempt ${this.attemptCount})` : '';
    
    // D2L API requires PointsNumerator to be an integer (not a float)
    // Round to nearest integer to avoid "JSON Binding Error" 400 responses
    const roundedPointsEarned = Math.round(pointsEarned);
    
    // D2L API requires GradeObjectType in PUT requests (1 = Numeric, 2 = PassFail, 3 = SelectBox, 4 = Text)
    // Default to 1 (Numeric) if Type is undefined
    const gradeObjectType = gradeObject.Type !== undefined ? gradeObject.Type : 1;
    
    // D2L API: PUT request body should NOT include OrgUnitId, UserId, or GradeObjectId
    // These are in the URL path: /d2l/api/le/{version}/{orgUnitId}/grades/{gradeObjectId}/values/{userId}
    // Only include the grade value fields in the body
    // D2L API requires BOTH Comments and PrivateComments to be present (mandatory fields)
    const gradeValue: Partial<GradeValue> = {
      GradeObjectType: gradeObjectType, // Required for PUT requests (1 = Numeric)
      PointsNumerator: roundedPointsEarned,
      // PointsDenominator is optional - D2L will use the grade object's MaxPoints if not provided
      Comments: {
        Content: `<p><strong>Quiz "${this.quizTitle || this.quizId}"</strong> completed${attemptInfo}</p><p>Score: ${roundedPointsEarned}/${totalPoints} points (${percentage.toFixed(1)}%)</p><p>Status: ${passed ? '<strong style="color: green;">Passed</strong>' : '<strong style="color: red;">Failed</strong>'}</p><p>Completed: ${new Date().toLocaleString()}</p>`,
        Type: 'Html' as const
      },
      PrivateComments: {
        Content: '', // Empty string - D2L requires this field but it can be empty
        Type: 'Text' as const
      }
    };

    // If external API endpoint is configured, use it instead of direct D2L API
    // This allows students to submit grades even without direct D2L write permissions
    if (this.apiEndpoint && this.apiEndpoint.trim() !== '') {
      console.log('🌐 Using external API endpoint for grade submission:', this.apiEndpoint);
      
      try {
        const apiPayload = {
          courseId: this.ou,
          userId: userId,
          gradeObjectName: this.gradeObjectName,
          pointsEarned: pointsEarned,
          totalPoints: totalPoints,
          quizId: this.quizId,
          quizTitle: this.quizTitle,
          attemptCount: this.attemptCount,
          passed: passed,
          comments: gradeValue.Comments?.Content || ''
        };

        console.log('📤 Submitting to external API:', {
          endpoint: this.apiEndpoint,
          payload: apiPayload
        });

        const response = await axios.post(this.apiEndpoint, apiPayload, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        });

        console.log('✅ External API Response:', response.data);
        console.log(`✅ Successfully submitted quiz results via external API for user ${this.currentUser?.DisplayName || this.currentEnrollment?.User?.DisplayName || 'Unknown'} (ID: ${userId}): ${pointsEarned}/${totalPoints} (${percentage.toFixed(1)}%)`);
        
        // Return early - external API handles everything
        return;
      } catch (apiError: any) {
        console.error('❌ External API call failed:', {
          error: apiError,
          message: apiError?.message,
          response: apiError?.response?.data,
          status: apiError?.response?.status
        });
        
        // If external API fails, fall through to direct D2L API attempt (for instructors)
        console.log('⚠️ External API failed, falling back to direct D2L API...');
        // Continue to direct D2L API call below
      }
    }

    console.log('💾 Grade value payload to save:', {
      GradeObjectType: gradeValue.GradeObjectType,
      PointsNumerator: gradeValue.PointsNumerator,
      Comments: gradeValue.Comments,
      // Note: OrgUnitId, UserId, GradeObjectId are in URL path, not body
      urlPath: `/d2l/api/le/${this.versions.le}/${this.ou}/grades/${gradeObject.GradeObjectId}/values/${userId}`
    });

    try {
      console.log('🔄 Calling updateGradeValue API (direct D2L)...', {
        courseId: this.ou,
        gradeObjectId: gradeObject.GradeObjectId,
        userId: userId,
        pointsNumerator: roundedPointsEarned,
        pointsDenominator: totalPoints,
        originalPointsEarned: pointsEarned,
        roundedPointsEarned: roundedPointsEarned
      });
      
      // Call updateGradeValue with explicit error handling
      let result: GradeValue;
      try {
        result = await updateGradeValue(this.ou, this.versions.le, gradeObject.GradeObjectId, userId, gradeValue);
      } catch (apiError: any) {
        // Re-throw with more context
        console.error('❌ updateGradeValue API call failed:', {
          error: apiError,
          message: apiError?.message,
          response: apiError?.response?.data,
          status: apiError?.response?.status
        });
        throw apiError;
      }
      
      console.log('✅ API Response:', result);
      console.log(`✅ Successfully saved quiz results to gradebook for user ${this.currentUser?.DisplayName || this.currentEnrollment?.User?.DisplayName || 'Unknown'} (ID: ${userId}): ${pointsEarned}/${totalPoints} (${percentage.toFixed(1)}%)`);
    } catch (error: any) {
      console.error('❌ Gradebook save error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        userId: userId,
        gradeObjectId: gradeObject.GradeObjectId,
        courseId: this.ou
      });
      
      // Provide more detailed error information
      if (error.response?.status === 403) {
        // Students typically don't have permission to write grades in D2L
        // The grade will be saved to localStorage and can be retried when an instructor views the page
        const errorMsg = 'Permission denied (403). Students cannot directly save grades to the D2L gradebook. ' +
          'Your quiz results have been saved locally and will be automatically submitted when an instructor views this page. ' +
          'If you are an instructor, please check your course permissions.';
        console.warn('⚠️', errorMsg);
        throw new Error(errorMsg);
      } else if (error.response?.status === 404) {
        throw new Error(`Grade object (ID: ${gradeObject.GradeObjectId}) or user (ID: ${userId}) not found. Please verify the gradebook item "${this.gradeObjectName}" exists and the user is enrolled in the course.`);
      } else if (error.response?.status === 400) {
        const errorData = error.response?.data;
        throw new Error(`Invalid grade data (400). ${errorData ? JSON.stringify(errorData) : 'Please check that the grade object accepts numeric values and the points are valid.'}`);
      } else {
        throw new Error(`Failed to save to gradebook (${error.response?.status || 'unknown'}): ${error.message || JSON.stringify(error.response?.data || 'Unknown error')}`);
      }
    }
  }

  /**
   * Retry any pending gradebook saves from localStorage
   * This allows grades to be saved even if the server was unavailable during submission
   */
  private async retryPendingGradebookSaves(): Promise<void> {
    if (!this.ou || !this.versions.le || !this.gradeObjectName) {
      return; // Can't retry without course ID, API version, or grade object name
    }
    
    // Wait for user info to be available - retry might be called before user is loaded
    if (!this.currentUser && !this.currentEnrollment) {
      // Wait a bit for user info to load, then try again
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check again after waiting
      if (!this.currentUser && !this.currentEnrollment) {
        console.log('ℹ️ Cannot retry pending gradebook saves: user info not available yet');
        return;
      }
    }
    
    // Safely get user ID with proper null checks
    const enrollmentUserId = this.currentEnrollment?.User?.Identifier;
    const currentUserId = this.currentUser?.Identifier;
    const userIdToUse = enrollmentUserId || currentUserId;
    
    if (!userIdToUse) {
      console.log('ℹ️ Cannot retry pending gradebook saves: no user ID available');
      return; // Can't retry without user ID
    }
    
    // Ensure quizId is set before checking localStorage
    if (!this.quizId || this.quizId.trim() === '') {
      console.log('ℹ️ Cannot retry pending gradebook saves: quizId is not set');
      return;
    }
    
    const pendingGradeKey = `uga-quiz-pending-grade-${this.quizId}-${userIdToUse}`;
    const pendingGradeData = localStorage.getItem(pendingGradeKey);
    
    if (!pendingGradeData) {
      return; // No pending grades to retry
    }
    
    try {
      const pendingGrade = JSON.parse(pendingGradeData);
      
      // Verify this pending grade is for the current course and grade object
      if (pendingGrade.courseId !== this.ou || pendingGrade.gradeObjectName !== this.gradeObjectName) {
        console.log('ℹ️ Pending grade is for a different course/grade object, skipping retry');
        return;
      }
      
      // Only retry if we have all required data
      if (!pendingGrade.pointsEarned || !pendingGrade.totalPoints) {
        console.log('ℹ️ Pending grade is incomplete, removing from localStorage');
        localStorage.removeItem(pendingGradeKey);
        return;
      }
      
      console.log('🔄 Found pending gradebook save, attempting to retry...', pendingGrade);
      
      // Try to save to gradebook
      this.gradebookSaveStatus = 'saving';
      this.requestUpdate();
      
      // Ensure we have user info before calling saveToGradebook
      if (!this.currentUser && !this.currentEnrollment) {
        throw new Error('User information not available for gradebook save');
      }
      
      console.log('🔄 Retrying gradebook save for pending grade:', {
        quizId: pendingGrade.quizId,
        userId: pendingGrade.userId,
        pointsEarned: pendingGrade.pointsEarned,
        totalPoints: pendingGrade.totalPoints
      });
      
      await this.saveToGradebook(
        pendingGrade.pointsEarned,
        pendingGrade.totalPoints,
        pendingGrade.passed
      );
      
      // Success! Remove from localStorage
      localStorage.removeItem(pendingGradeKey);
      this.gradebookSaveStatus = 'success';
      this.gradebookErrorMessage = null;
      console.log('✅ Successfully retried pending gradebook save');
      
    } catch (error: any) {
      // Don't log as error if it's just user info not ready - will retry later
      if (error.message?.includes('User information not available')) {
        console.log('ℹ️ Cannot retry pending gradebook save yet: user info not loaded. Will retry on next page load.');
        return; // Exit silently, will retry next time
      }
      
      console.warn('⚠️ Failed to retry pending gradebook save:', error);
      // Keep it in localStorage for next time
      this.gradebookSaveStatus = 'error';
      this.gradebookErrorMessage = `Retry failed: ${error.message || 'Unknown error'}. Will try again next time.`;
      
      // If it's still a server error, we'll retry again later
      // For 403 errors, keep the pending grade - it will be retried when an instructor views the page
      // Students can't write grades, but instructors can retry these saves
      // For other non-retryable errors (like 404), remove the pending grade
      if (error.response?.status && error.response.status < 500 && error.response.status !== 403) {
        console.warn('⚠️ Non-retryable error (not 403), removing pending grade from localStorage');
        localStorage.removeItem(pendingGradeKey);
      } else if (error.response?.status === 403) {
        console.log('ℹ️ Permission denied (403). Grade saved to localStorage. An instructor viewing this page will automatically submit it to the gradebook.');
      }
    } finally {
      this.requestUpdate();
    }
  }

  /**
   * Reset quiz for retry
   */
  private resetQuiz(): void {
    if (!this.allowRetry) return;
    if (this.attemptCount >= this.maxAttempts) {
      this.errorMessage = `Maximum attempts (${this.maxAttempts}) reached.`;
      return;
    }

    this.isStarted = false;
    this.isSubmitted = false;
    this.results = null;
    this.currentQuestionIndex = 0;
    this.responses = {};
    this.gradebookSaveStatus = 'idle';
    this.gradebookErrorMessage = null;
    
    // Re-initialize responses
    for (const q of this.parsedQuestions) {
      if (q.type === QuestionType.MATCHING) {
        this.responses[q.id] = {};
      } else {
        this.responses[q.id] = '';
      }
    }

    this.errorMessage = null;
    this.requestUpdate();
  }

  /**
   * Clear all attempts and reset quiz completely (for instructors/admins)
   * This clears both localStorage and optionally the gradebook entry
   */
  private async clearAllAttempts(): Promise<void> {
    if (!this.allowReset) {
      console.warn('Reset not allowed. Set allow-reset="true" to enable.');
      return;
    }

    const userId = this.currentUser?.Identifier || 'anonymous';
    const storageKey = `uga-quiz-attempts-${this.quizId}-${userId}`;
    
    // Clear localStorage
    localStorage.removeItem(storageKey);
    this.attemptCount = 0;
    
    // Clear gradebook entry if gradeObjectName is set
    if (this.gradeObjectName && this.ou && this.currentUser && this.versions.le && this.gradeObject) {
      try {
        const userIdToUse = this.currentEnrollment?.User?.Identifier || this.currentUser?.Identifier;
        const userIdNum = typeof userIdToUse === 'string' ? parseInt(userIdToUse) : userIdToUse;
        
        if (!isNaN(userIdNum) && userIdNum > 0) {
          // Clear the grade by setting it to null
          const gradeValue: Partial<GradeValue> = {
            OrgUnitId: parseInt(this.ou),
            UserId: userIdNum,
            GradeObjectId: this.gradeObject.GradeObjectId,
            PointsNumerator: null,
            PointsDenominator: null,
            Comments: {
              Text: 'Quiz reset by instructor',
              Html: '<p>Quiz reset by instructor</p>'
            }
          };
          
          await updateGradeValue(this.ou, this.versions.le, this.gradeObject.GradeObjectId, userIdNum, gradeValue);
          console.log('✅ Cleared gradebook entry for quiz reset');
        }
      } catch (error: any) {
        console.error('⚠️ Could not clear gradebook entry:', error);
        // Continue with reset even if gradebook clear fails
      }
    }
    
    // Reset component state
    this.completionStatus = 'not-started';
    this.isSubmitted = false;
    this.isStarted = false;
    this.results = null;
    this.currentQuestionIndex = 0;
    this.responses = {};
    this.gradebookSaveStatus = 'idle';
    this.gradebookErrorMessage = null;
    this.errorMessage = null;
    
    // Re-initialize responses
    for (const q of this.parsedQuestions) {
      if (q.type === QuestionType.MATCHING) {
        this.responses[q.id] = {};
      } else {
        this.responses[q.id] = '';
      }
    }
    
    console.log('✅ Quiz reset complete. All attempts cleared.');
    this.requestUpdate();
  }

  /**
   * Navigate to next question
   */
  private nextQuestion(): void {
    if (this.currentQuestionIndex < this.parsedQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.requestUpdate();
    }
  }

  /**
   * Navigate to previous question
   */
  private previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.requestUpdate();
    }
  }

  /**
   * Shuffle array (for question randomization)
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Render question based on type
   */
  private renderQuestion(question: QuizQuestion): unknown {
    const currentAnswer = this.responses[question.id];
    const attempt = this.results?.attempts.find(a => a.questionId === question.id);
    const showFeedback = this.isSubmitted && this.showFeedback && attempt;

    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return html`
          <div class="quiz-question">
            <p class="quiz-question-text">${question.question}</p>
            <div class="quiz-options">
              ${question.options?.map((option, index) => html`
                <label class="quiz-option ${showFeedback && String(index) === String(question.correctAnswer) ? 'correct' : ''} ${showFeedback && String(index) === String(currentAnswer) && !attempt?.isCorrect ? 'incorrect' : ''}">
                  <input
                    type="radio"
                    name="question-${question.id}"
                    value="${index}"
                    .checked=${String(currentAnswer) === String(index)}
                    @change=${() => this.handleAnswer(question.id, index)}
                    ?disabled=${this.isSubmitted}
                  />
                  <span>${option}</span>
                </label>
              `)}
            </div>
            ${showFeedback ? html`
              <div class="quiz-feedback ${attempt?.isCorrect ? 'correct' : 'incorrect'}">
                ${attempt?.isCorrect 
                  ? html`<span class="feedback-icon">✓</span> Correct! ${question.explanation ? `- ${question.explanation}` : ''}`
                  : html`<span class="feedback-icon">✗</span> Incorrect. ${question.explanation ? `- ${question.explanation}` : ''}`
                }
                <div class="feedback-points">Points: ${attempt.pointsEarned}/${question.points}</div>
              </div>
            ` : ''}
          </div>
        `;

      case QuestionType.TRUE_FALSE:
        return html`
          <div class="quiz-question">
            <p class="quiz-question-text">${question.question}</p>
            <div class="quiz-options">
              <label class="quiz-option ${showFeedback && question.correctAnswer === true ? 'correct' : ''} ${showFeedback && currentAnswer === 'true' && !attempt?.isCorrect ? 'incorrect' : ''}">
                <input
                  type="radio"
                  name="question-${question.id}"
                  value="true"
                  .checked=${currentAnswer === 'true'}
                  @change=${() => this.handleAnswer(question.id, 'true')}
                  ?disabled=${this.isSubmitted}
                />
                <span>True</span>
              </label>
              <label class="quiz-option ${showFeedback && question.correctAnswer === false ? 'correct' : ''} ${showFeedback && currentAnswer === 'false' && !attempt?.isCorrect ? 'incorrect' : ''}">
                <input
                  type="radio"
                  name="question-${question.id}"
                  value="false"
                  .checked=${currentAnswer === 'false'}
                  @change=${() => this.handleAnswer(question.id, 'false')}
                  ?disabled=${this.isSubmitted}
                />
                <span>False</span>
              </label>
            </div>
            ${showFeedback ? html`
              <div class="quiz-feedback ${attempt?.isCorrect ? 'correct' : 'incorrect'}">
                ${attempt?.isCorrect 
                  ? html`<span class="feedback-icon">✓</span> Correct! ${question.explanation ? `- ${question.explanation}` : ''}`
                  : html`<span class="feedback-icon">✗</span> Incorrect. ${question.explanation ? `- ${question.explanation}` : ''}`
                }
                <div class="feedback-points">Points: ${attempt.pointsEarned}/${question.points}</div>
              </div>
            ` : ''}
          </div>
        `;

      case QuestionType.SHORT_ANSWER:
      case QuestionType.FILL_IN_BLANK:
        return html`
          <div class="quiz-question">
            <p class="quiz-question-text">${question.question}</p>
            <input
              type="text"
              class="quiz-text-input"
              .value=${currentAnswer || ''}
              @input=${(e: Event) => this.handleAnswer(question.id, (e.target as HTMLInputElement).value)}
              ?disabled=${this.isSubmitted}
              placeholder="Enter your answer"
            />
            ${showFeedback ? html`
              <div class="quiz-feedback ${attempt?.isCorrect ? 'correct' : 'incorrect'}">
                ${attempt?.isCorrect 
                  ? html`<span class="feedback-icon">✓</span> Correct! ${question.explanation ? `- ${question.explanation}` : ''}`
                  : html`<span class="feedback-icon">✗</span> Incorrect. ${question.explanation ? `- ${question.explanation}` : ''}`
                }
                <div class="feedback-points">Points: ${attempt.pointsEarned}/${question.points}</div>
              </div>
            ` : ''}
          </div>
        `;

      case QuestionType.MATCHING:
        const correctAnswers = question.correctAnswer as { [key: string]: string };
        const matchingOptions = question.options || [];
        return html`
          <div class="quiz-question">
            <p class="quiz-question-text">${question.question}</p>
            <div class="quiz-matching">
              ${Object.keys(correctAnswers).map(key => {
                const currentMatch = (currentAnswer as { [key: string]: string })?.[key] || '';
                return html`
                  <div class="matching-row">
                    <span class="matching-key">${key}</span>
                    <select
                      class="matching-select"
                      .value=${currentMatch}
                      @change=${(e: Event) => {
                        const newAnswer = { ...(currentAnswer as { [key: string]: string }) };
                        newAnswer[key] = (e.target as HTMLSelectElement).value;
                        this.handleAnswer(question.id, newAnswer);
                      }}
                      ?disabled=${this.isSubmitted}
                    >
                      <option value="">Select...</option>
                      ${matchingOptions.map(opt => html`
                        <option value="${opt}" ?selected=${currentMatch === opt}>${opt}</option>
                      `)}
                    </select>
                    ${showFeedback ? html`
                      <span class="matching-feedback ${currentMatch === correctAnswers[key] ? 'correct' : 'incorrect'}">
                        ${currentMatch === correctAnswers[key] ? '✓' : '✗'}
                      </span>
                    ` : ''}
                  </div>
                `;
              })}
            </div>
            ${showFeedback ? html`
              <div class="quiz-feedback ${attempt?.isCorrect ? 'correct' : 'incorrect'}">
                ${attempt?.isCorrect 
                  ? html`<span class="feedback-icon">✓</span> All matches correct! ${question.explanation ? `- ${question.explanation}` : ''}`
                  : html`<span class="feedback-icon">✗</span> Some matches incorrect. ${question.explanation ? `- ${question.explanation}` : ''}`
                }
                <div class="feedback-points">Points: ${attempt.pointsEarned}/${question.points}</div>
              </div>
            ` : ''}
          </div>
        `;

      default:
        return html`<p>Unsupported question type: ${question.type}</p>`;
    }
  }

  render() {
    if (this.loading && !this.isStarted) {
      return html`
        <div class="quiz-container">
          <div class="quiz-loading">Loading quiz...</div>
        </div>
      `;
    }

    if (this.errorMessage && !this.isStarted) {
      return html`
        <div class="quiz-container">
          <div class="quiz-error">${this.errorMessage}</div>
        </div>
      `;
    }

    // Show completion status if already completed
    if (this.completionStatus === 'passed' || this.completionStatus === 'failed') {
      return html`
        <div class="quiz-container">
          <div class="quiz-completed">
            <h3>Quiz Already Completed</h3>
            <p>You have already completed this quiz.</p>
            ${this.completionStatus === 'passed' 
              ? html`<p class="quiz-status passed">Status: Passed ✓</p>`
              : html`<p class="quiz-status failed">Status: Failed ✗</p>`
            }
            ${this.allowRetry && this.attemptCount < this.maxAttempts
              ? html`<button class="quiz-button" @click=${this.resetQuiz}>Retake Quiz</button>`
              : html`<p class="quiz-info">Maximum attempts reached.</p>`
            }
            ${this.allowReset
              ? html`<button class="quiz-button" style="margin-top: 1rem; background: #ff9800;" @click=${this.clearAllAttempts}>Reset All Attempts (Instructor Only)</button>`
              : ''}
          </div>
        </div>
      `;
    }

    // Show start screen
    if (!this.isStarted) {
      return html`
        <div class="quiz-container">
          <div class="quiz-start">
            <h3>${this.quizTitle || 'Quiz'}</h3>
            <div class="quiz-info">
              <p><strong>Questions:</strong> ${this.parsedQuestions.length}</p>
              <p><strong>Total Points:</strong> ${this.parsedQuestions.reduce((sum, q) => sum + q.points, 0)}</p>
              <p><strong>Passing Score:</strong> ${this.passingScore}%</p>
              ${this.timeLimit > 0 ? html`<p><strong>Time Limit:</strong> ${this.timeLimit} minutes</p>` : ''}
              ${this.allowRetry ? html`<p><strong>Max Attempts:</strong> ${this.maxAttempts}</p>` : html`<p><strong>Attempts:</strong> 1 (no retries)</p>`}
              ${this.attemptCount > 0 ? html`<p><strong>Previous Attempts:</strong> ${this.attemptCount}</p>` : ''}
            </div>
            <button class="quiz-button quiz-button-primary" @click=${this.startQuiz}>Start Quiz</button>
          </div>
        </div>
      `;
    }

    // Show quiz in progress
    const currentQuestion = this.parsedQuestions[this.currentQuestionIndex];
    const allAnswered = this.parsedQuestions.every(q => {
      if (q.type === QuestionType.MATCHING) {
        const answer = this.responses[q.id] as { [key: string]: string };
        return answer && Object.keys(answer).length > 0;
      }
      return this.responses[q.id] !== '' && this.responses[q.id] !== null && this.responses[q.id] !== undefined;
    });

    return html`
      <style>
        .quiz-container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 2rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fff;
        }
        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #ba0c2f;
        }
        .quiz-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #ba0c2f;
        }
        .quiz-timer {
          font-size: 1.2rem;
          font-weight: bold;
          color: ${this.timeRemaining < 60 ? '#d32f2f' : '#333'};
        }
        .quiz-progress {
          margin-bottom: 1rem;
        }
        .quiz-progress-bar {
          width: 100%;
          height: 20px;
          background: #f0f0f0;
          border-radius: 10px;
          overflow: hidden;
        }
        .quiz-progress-fill {
          height: 100%;
          background: #ba0c2f;
          transition: width 0.3s;
        }
        .quiz-question {
          margin-bottom: 2rem;
        }
        .quiz-question-text {
          font-size: 1.1rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .quiz-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .quiz-option {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          border: 2px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .quiz-option:hover:not(:has(input:disabled)) {
          background: #f5f5f5;
          border-color: #ba0c2f;
        }
        .quiz-option input[type="radio"] {
          margin-right: 0.5rem;
        }
        .quiz-option.correct {
          background: #e8f5e9;
          border-color: #4caf50;
        }
        .quiz-option.incorrect {
          background: #ffebee;
          border-color: #f44336;
        }
        .quiz-text-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        .quiz-matching {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .matching-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .matching-key {
          min-width: 100px;
          font-weight: bold;
        }
        .matching-select {
          flex: 1;
          padding: 0.5rem;
          border: 2px solid #ddd;
          border-radius: 4px;
        }
        .quiz-feedback {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 4px;
        }
        .quiz-feedback.correct {
          background: #e8f5e9;
          border-left: 4px solid #4caf50;
        }
        .quiz-feedback.incorrect {
          background: #ffebee;
          border-left: 4px solid #f44336;
        }
        .feedback-icon {
          font-weight: bold;
          margin-right: 0.5rem;
        }
        .feedback-points {
          margin-top: 0.5rem;
          font-weight: bold;
        }
        .quiz-navigation {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #ddd;
        }
        .quiz-button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .quiz-button-primary {
          background: #ba0c2f;
          color: white;
        }
        .quiz-button-primary:hover:not(:disabled) {
          background: #8a0a23;
        }
        .quiz-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .quiz-results {
          margin-top: 2rem;
          padding: 2rem;
          background: #f5f5f5;
          border-radius: 8px;
        }
        .quiz-score {
          font-size: 2rem;
          font-weight: bold;
          text-align: center;
          margin-bottom: 1rem;
        }
        .quiz-score.passed {
          color: #4caf50;
        }
        .quiz-score.failed {
          color: #f44336;
        }
        .quiz-loading, .quiz-error {
          padding: 2rem;
          text-align: center;
        }
        .quiz-error {
          color: #f44336;
        }
        .quiz-start {
          text-align: center;
        }
        .quiz-info {
          margin: 2rem 0;
          text-align: left;
          display: inline-block;
        }
        .quiz-info p {
          margin: 0.5rem 0;
        }
        .quiz-completed {
          text-align: center;
          padding: 2rem;
        }
        .quiz-status {
          font-size: 1.2rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        .quiz-status.passed {
          color: #4caf50;
        }
        .quiz-status.failed {
          color: #f44336;
        }
        .gradebook-status {
          background: #f9f9f9;
          border: 1px solid #ddd;
        }
        .gradebook-status p {
          margin: 0.25rem 0;
        }
      </style>

      <div class="quiz-container">
        <div class="quiz-header">
          <div class="quiz-title">${this.quizTitle || 'Quiz'}</div>
          ${this.timeLimit > 0 ? html`<div class="quiz-timer">Time: ${this.formatTime(this.timeRemaining)}</div>` : ''}
        </div>

        <div class="quiz-progress">
          <div class="quiz-progress-bar">
            <div class="quiz-progress-fill" style="width: ${((this.currentQuestionIndex + 1) / this.parsedQuestions.length) * 100}%"></div>
          </div>
          <p>Question ${this.currentQuestionIndex + 1} of ${this.parsedQuestions.length}</p>
        </div>

        ${!this.isSubmitted ? html`
          ${this.renderQuestion(currentQuestion)}

          <div class="quiz-navigation">
            <button 
              class="quiz-button" 
              @click=${this.previousQuestion}
              ?disabled=${this.currentQuestionIndex === 0}
            >
              Previous
            </button>
            ${this.currentQuestionIndex < this.parsedQuestions.length - 1
              ? html`<button class="quiz-button quiz-button-primary" @click=${this.nextQuestion}>Next</button>`
              : html`<button 
                  class="quiz-button quiz-button-primary" 
                  @click=${this.submitQuiz}
                  ?disabled=${!allAnswered || this.loading}
                >
                  ${this.loading ? 'Submitting...' : 'Submit Quiz'}
                </button>`
            }
          </div>
        ` : html`
          <div class="quiz-results">
            <div class="quiz-score ${this.results?.passed ? 'passed' : 'failed'}">
              Score: ${this.results?.pointsEarned}/${this.results?.totalPoints} (${this.results?.percentage.toFixed(1)}%)
            </div>
            <p style="text-align: center; font-size: 1.2rem;">
              ${this.results?.passed ? '✓ Passed!' : '✗ Failed'}
            </p>
            <p style="text-align: center;">
              Passing score: ${this.passingScore}%
            </p>
            
            ${this.gradeObjectName ? html`
              <div class="gradebook-status" style="margin-top: 1.5rem; padding: 1rem; border-radius: 4px; text-align: center;">
                ${this.gradebookSaveStatus === 'saving' ? html`
                  <p style="color: #666;">⏳ Saving results to gradebook...</p>
                ` : this.gradebookSaveStatus === 'success' ? html`
                  <p style="color: #4caf50; font-weight: bold;">✓ Results saved to gradebook successfully!</p>
                  <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">Gradebook item: "${this.gradeObjectName}"</p>
                ` : this.gradebookSaveStatus === 'error' ? html`
                  <p style="color: #f44336; font-weight: bold;">✗ Failed to save to gradebook</p>
                  <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">${this.gradebookErrorMessage || 'Unknown error'}</p>
                  <p style="color: #666; font-size: 0.85rem; margin-top: 0.5rem;">
                    ${this.gradebookErrorMessage?.includes('server error') || this.gradebookErrorMessage?.includes('temporarily unavailable') 
                      ? 'Your results have been saved locally and will be automatically synced to the gradebook when the server is available. You can refresh this page later to retry.' 
                      : `Please ensure the gradebook item "${this.gradeObjectName}" exists.`}
                  </p>
                ` : ''}
              </div>
            ` : ''}

            <h4>Question Review:</h4>
            ${this.parsedQuestions.map((q, index) => {
              const attempt = this.results?.attempts.find(a => a.questionId === q.id);
              return html`
                <div class="quiz-question">
                  <p><strong>Question ${index + 1}:</strong> ${q.question}</p>
                  <p><strong>Your Answer:</strong> ${JSON.stringify(this.responses[q.id])}</p>
                  <p><strong>Points:</strong> ${attempt?.pointsEarned || 0}/${q.points}</p>
                  ${this.renderQuestion(q)}
                </div>
              `;
            })}

            ${this.allowRetry && this.attemptCount < this.maxAttempts
              ? html`<button class="quiz-button quiz-button-primary" @click=${this.resetQuiz} style="margin-top: 1rem; width: 100%;">
                  Retake Quiz (Attempt ${this.attemptCount + 1}/${this.maxAttempts})
                </button>`
              : html`<p class="quiz-info">Maximum attempts reached.</p>`
            }
            
            ${this.allowReset
              ? html`<button class="quiz-button" style="margin-top: 1rem; width: 100%; background: #ff9800; color: white;" @click=${this.clearAllAttempts}>
                  Reset All Attempts (Instructor Only)
                </button>`
              : ''}
          </div>
        `}
      </div>
    `;
  }
}
