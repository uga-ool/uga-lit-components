import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import axios from 'axios';
import { getVersions, getUser, getEnrollment, getAssignments, submitToDropbox, submitToDropboxCommentOnly, logApiVersionWarning } from '../lib/api/d2l-client.js';
import { getCourse } from '../lib/api/d2l-utils.js';
import { parseD2LCSV } from '../lib/data/csv-parser.js';
import type { ApiVersions, User, Enrollment } from '../types/d2l.js';

/**
 * Question types supported by the quiz component
 */
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple-choice',
  TRUE_FALSE = 'true-false',
  MATCHING = 'matching',
  MULTI_SELECT = 'multi-select',
  ORDERING = 'ordering',
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
  correctAnswer: string | number | string[] | number[] | { [key: string]: string }; // Answer(s) - varies by type (number[] for multi-select, ordering)
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
  @property({ type: Number, attribute: 'dropbox-folder-id' }) dropboxFolderId = 0; // eLC Dropbox (assignment) folder ID to submit quiz result as a file
  @property({ type: String, attribute: 'dropbox-assignment-name' }) dropboxAssignmentName = ''; // Name of existing assignment to submit to (instructor creates it in eLC)
  @property({ type: Number }) passingScore = 70; // Percentage required to pass
  @property({ type: Boolean }) allowRetry = true;
  @property({ type: Number }) maxAttempts = 3; // Maximum retry attempts
  @property({ type: Boolean }) showFeedback = true; // Show immediate feedback
  @property({ type: Boolean }) allowReset = false; // Reset button removed; kept for API compatibility
  @property({ type: Boolean }) randomizeQuestions = false;
  @property({ type: Number, attribute: 'time-limit' }) timeLimit = 0; // Time limit in minutes (0 = no limit)
  @property({ type: Boolean, attribute: 'auto-submit' }) autoSubmit = false; // Auto-submit when time expires
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
  @state() private dropboxSaveStatus: 'idle' | 'success' | 'error' = 'idle';
  @state() private dropboxErrorMessage: string | null = null;

  private versions: ApiVersions = {};
  private ou: string | null = null;
  private currentUser: User | null = null;
  private currentEnrollment: Enrollment | null = null;
  private abortController: AbortController | null = null;

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    this.abortController = new AbortController();

    // Debug: Log attribute values on initialization
    // Ensure quizId has a default value if not set
    if (!this.quizId || this.quizId.trim() === '') {
      if (this.quizTitle) {
        this.quizId = `quiz-${this.quizTitle.toLowerCase().replace(/\s+/g, '-')}`;
      } else {
        this.quizId = `quiz-${Date.now()}`;
      }
      console.log(`ℹ️ quizId was empty, generated default: "${this.quizId}"`);
    }
    
    console.log('🔍 uga-quiz component initialized:', { quizId: this.quizId, quizTitle: this.quizTitle || '(not set)' });

    this.ou = getCourse();
    if (!this.ou) {
      // For demo/testing purposes, allow component to work without course ID if questions are inline
      if (!this.questions && this.type !== 'local' && this.type !== 'csv') {
        this.errorMessage = 'Unable to determine course ID from URL. Make sure you are viewing this in an eLC course page, or provide questions inline.';
        this.loading = false;
        this.requestUpdate();
        return;
      }
      console.warn('⚠️ No course ID found. Quiz will work but assignment submission will be disabled.');
    }

    this.loading = true;
    this.requestUpdate();

    try {
      // Get API versions (only if we have a course ID)
      if (this.ou) {
        try {
          this.versions = await getVersions();
          if (this.versions.le) {
            logApiVersionWarning(this.versions.le, 'getAssignments');
          }
          if (this.versions.lp) {
            logApiVersionWarning(this.versions.lp, 'getUser');
          }

          // Get current user
          this.currentUser = await getUser(this.versions.lp);

          // Get enrollment for user identification
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
              console.log('ℹ️ No enrollment found for this course. Will use currentUser.Identifier for user identification.');
            }
          } catch (enrollmentError: any) {
            console.warn('⚠️ Could not get enrollment info:', enrollmentError);
            this.currentEnrollment = null; // Ensure it's null on error
          }

          // Check for previous attempts
          await this.loadPreviousAttempts();
        } catch (apiError: any) {
          // If API calls fail, log but don't fail the component
          console.warn('⚠️ eLC API calls failed. Quiz will work but assignment submission may be disabled:', apiError);
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
   * Load quiz questions from JSON (inline or file) or CSV (eLC format)
   */
  private async loadQuestions(): Promise<void> {
    let questionsData: QuizQuestion[] = [];

    if (this.type === 'csv' && this.filename) {
      // Load from eLC CSV file
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
      } else if (q.type === QuestionType.MULTI_SELECT) {
        this.responses[q.id] = [];
      } else if (q.type === QuestionType.ORDERING && q.options?.length) {
        this.responses[q.id] = this.shuffleArray(q.options.map((_, i) => i));
      } else if (q.type === QuestionType.MULTIPLE_CHOICE || q.type === QuestionType.TRUE_FALSE) {
        this.responses[q.id] = '';
      } else {
        this.responses[q.id] = '';
      }
    }
  }

  /**
   * Load previous attempts (for retry logic)
   */
  private async loadPreviousAttempts(): Promise<void> {
    // Track attempts in localStorage
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

      case QuestionType.MULTI_SELECT: {
        // correctAnswer is number[] (indices of correct options), answer is number[]
        const toIndices = (x: unknown): number[] =>
          Array.isArray(x) ? x.map(v => typeof v === 'number' ? v : parseInt(String(v), 10)).filter(n => !isNaN(n)).sort((a, b) => a - b) : [];
        const correctArr = toIndices(question.correctAnswer);
        const userArr = toIndices(answer);
        if (correctArr.length !== userArr.length) {
          isCorrect = false;
        } else {
          isCorrect = correctArr.every((v, i) => v === userArr[i]);
        }
        if (isCorrect) {
          pointsEarned = question.points;
        }
        break;
      }

      case QuestionType.ORDERING: {
        // correctAnswer is number[] (indices in correct order), answer is number[]
        const toOrder = (x: unknown): number[] =>
          Array.isArray(x) ? x.map(v => typeof v === 'number' ? v : parseInt(String(v), 10)).filter(n => !isNaN(n)) : [];
        const correctOrder = toOrder(question.correctAnswer);
        const userOrder = toOrder(answer);
        if (correctOrder.length !== userOrder.length) {
          isCorrect = false;
        } else {
          isCorrect = correctOrder.every((v, i) => v === userOrder[i]);
        }
        if (isCorrect) {
          pointsEarned = question.points;
        }
        break;
      }

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

      // Submit quiz result to eLC assignment if dropbox-folder-id or dropbox-assignment-name is set
      const useDropbox = (this.dropboxFolderId && this.ou && this.versions.le) ||
        (this.dropboxAssignmentName?.trim() && this.ou && this.versions.le);
      if (useDropbox) {
        try {
          await this.saveToDropbox(pointsEarned, totalPoints, passed);
          this.dropboxSaveStatus = 'success';
          this.dropboxErrorMessage = null;
          console.log('✅ Quiz result submitted to assignment');
        } catch (err: any) {
          const msg = err?.message || String(err);
          console.warn('⚠️ Assignment submission failed:', msg);
          this.dropboxSaveStatus = 'error';
          this.dropboxErrorMessage = msg.includes('not found')
            ? `The assignment "${this.dropboxAssignmentName || 'for submissions'}" was not found. Your instructor must create this assignment in eLC (Assignments) with the same name; then you can submit again.`
            : msg;
        }
      }

      // Save attempt count
      const storageKey = `uga-quiz-attempts-${this.quizId}-${this.currentUser?.Identifier || 'anonymous'}`;
      localStorage.setItem(storageKey, JSON.stringify({
        attemptCount: this.attemptCount,
        lastCompleted: new Date().toISOString()
      }));

    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      this.errorMessage = `Failed to submit quiz: ${error.message || 'Unknown error'}`;
    } finally {
      this.loading = false;
      this.requestUpdate();
    }
  }

  /**
   * Resolve a stored response value to human-readable text using the question definition.
   * e.g. multiple choice index 0 -> "Atlanta"; true/false -> "True" / "False".
   */
  private responseToDisplayText(question: QuizQuestion | undefined, value: unknown): string {
    if (question?.options && (question.type === QuestionType.MULTIPLE_CHOICE || question.type === QuestionType.TRUE_FALSE)) {
      const idx = typeof value === 'number' ? value : parseInt(String(value), 10);
      if (!isNaN(idx) && idx >= 0 && idx < question.options.length) {
        return question.options[idx];
      }
    }
    if (question?.options && question.type === QuestionType.MULTI_SELECT && Array.isArray(value)) {
      const indices = (value as number[]).filter(i => typeof i === 'number' && !isNaN(i) && i >= 0 && i < question!.options!.length);
      return indices.map(i => question!.options![i]).join(', ');
    }
    if (question?.options && question.type === QuestionType.ORDERING && Array.isArray(value)) {
      const indices = (value as number[]).filter(i => typeof i === 'number' && !isNaN(i) && i >= 0 && i < question!.options!.length);
      return indices.map((i, pos) => `${pos + 1}. ${question!.options![i]}`).join(' → ');
    }
    if (question?.type === QuestionType.TRUE_FALSE && (value === true || value === false || value === 'true' || value === 'false')) {
      return value === true || value === 'true' ? 'True' : 'False';
    }
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return Object.entries(value as Record<string, unknown>).map(([k, v]) => `${k}: ${String(v)}`).join('; ');
    }
    return String(value);
  }

  /**
   * Format submission as readable text and HTML for the assignment comment (instead of raw JSON).
   * Full JSON is still attached as the file for audit.
   */
  private formatSubmissionComment(
    payload: { quizTitle?: string; pointsEarned: number; totalPoints: number; percentage: number; passed: boolean; attemptCount: number; timestamp: string; userId: string | null; displayName: string | null; responses: Record<string, unknown> },
    summaryLine: string,
    percentage: number
  ): { Text: string; Html: string } {
    const submittedDate = payload.timestamp ? new Date(payload.timestamp).toLocaleString() : '—';
    const userLine = payload.displayName ? `${payload.displayName} (${payload.userId ?? '—'})` : (payload.userId ?? '—');

    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    // Plain text: clear sections
    const lines: string[] = [
      summaryLine,
      '',
      'Score: ' + payload.pointsEarned + '/' + payload.totalPoints + ' (' + percentage.toFixed(1) + '%)',
      'Status: ' + (payload.passed ? 'Passed' : 'Failed'),
      'Attempt: ' + payload.attemptCount,
      'Submitted: ' + submittedDate,
      'User: ' + userLine,
      ''
    ];
    if (payload.responses && Object.keys(payload.responses).length > 0) {
      lines.push('Responses:');
      for (const [qId, value] of Object.entries(payload.responses)) {
        const question = this.parsedQuestions.find(q => q.id === qId);
        const isDropdown = typeof value === 'object' && value !== null && !Array.isArray(value);
        const isMultiSelect = Array.isArray(value) && value.length > 0 && question?.type === QuestionType.MULTI_SELECT;
        const isOrdering = Array.isArray(value) && value.length > 0 && question?.type === QuestionType.ORDERING;
        if (isDropdown && Object.keys(value as object).length > 0) {
          lines.push('  • ' + qId + ':');
          for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            lines.push('    • ' + k + ': ' + String(v));
          }
        } else if (isMultiSelect || isOrdering) {
          lines.push('  • ' + qId + ':');
          const arr = value as number[];
          arr.forEach((idx, pos) => {
            const text = question?.options?.[idx] ?? String(idx);
            lines.push('    • ' + (isOrdering ? (pos + 1) + '. ' : '') + text);
          });
        } else {
          const display = this.responseToDisplayText(question, value);
          lines.push('  • ' + qId + ': ' + display);
        }
      }
    }

    // HTML: structured layout
    let html = '<div style="font-family: sans-serif; max-width: 36em;">';
    html += '<p style="font-size: 1.1em; font-weight: bold; margin-bottom: 0.5em;">' + esc(summaryLine) + '</p>';
    html += '<table style="border-collapse: collapse; margin-bottom: 1em;">';
    html += '<tr><td style="padding: 0.25em 0.75em 0.25em 0; font-weight: bold;">Score</td><td>' + esc(String(payload.pointsEarned)) + '/' + esc(String(payload.totalPoints)) + ' (' + percentage.toFixed(1) + '%)</td></tr>';
    html += '<tr><td style="padding: 0.25em 0.75em 0.25em 0; font-weight: bold;">Status</td><td>' + (payload.passed ? 'Passed' : 'Failed') + '</td></tr>';
    html += '<tr><td style="padding: 0.25em 0.75em 0.25em 0; font-weight: bold;">Attempt</td><td>' + esc(String(payload.attemptCount)) + '</td></tr>';
    html += '<tr><td style="padding: 0.25em 0.75em 0.25em 0; font-weight: bold;">Submitted</td><td>' + esc(submittedDate) + '</td></tr>';
    html += '<tr><td style="padding: 0.25em 0.75em 0.25em 0; font-weight: bold;">User</td><td>' + esc(userLine) + '</td></tr>';
    html += '</table>';
    if (payload.responses && Object.keys(payload.responses).length > 0) {
      html += '<p style="font-weight: bold; margin-bottom: 0.25em;">Responses</p><ul style="margin: 0 0 1em 1.25em;">';
      for (const [qId, value] of Object.entries(payload.responses)) {
        const question = this.parsedQuestions.find(q => q.id === qId);
        const isDropdown = typeof value === 'object' && value !== null && !Array.isArray(value);
        const isMultiSelect = Array.isArray(value) && value.length > 0 && question?.type === QuestionType.MULTI_SELECT;
        const isOrdering = Array.isArray(value) && value.length > 0 && question?.type === QuestionType.ORDERING;
        if (isDropdown && Object.keys(value as object).length > 0) {
          html += '<li><strong>' + esc(qId) + '</strong>:<ul style="margin: 0.25em 0 0 1em;">';
          for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            html += '<li>' + esc(k) + ': ' + esc(String(v)) + '</li>';
          }
          html += '</ul></li>';
        } else if (isMultiSelect || isOrdering) {
          html += '<li><strong>' + esc(qId) + '</strong>:<ul style="margin: 0.25em 0 0 1em;">';
          const arr = value as number[];
          arr.forEach((idx, pos) => {
            const text = question?.options?.[idx] ?? String(idx);
            html += '<li>' + (isOrdering ? esc(String(pos + 1)) + '. ' : '') + esc(text) + '</li>';
          });
          html += '</ul></li>';
        } else {
          const display = esc(this.responseToDisplayText(question, value));
          html += '<li><strong>' + esc(qId) + '</strong>: ' + display + '</li>';
        }
      }
      html += '</ul>';
    }
    html += '</div>';

    return {
      Text: lines.join('\n'),
      Html: html
    };
  }

  /**
   * Submit quiz result as a file to the eLC Dropbox (assignment folder).
   * Students typically have permission to submit to assignments; use this to collect quiz data.
   * Resolves folder by dropbox-folder-id or by dropbox-assignment-name (lookup by name).
   */
  private async saveToDropbox(pointsEarned: number, totalPoints: number, passed: boolean): Promise<void> {
    if (!this.ou || !this.versions.le) return;
    let folderId = this.dropboxFolderId;
    if (!folderId && this.dropboxAssignmentName?.trim()) {
      const folders = await getAssignments(this.ou, this.versions.le);
      const want = this.dropboxAssignmentName.trim();
      let byName = (folders as { Name?: string; Id?: number }[]).find(
        (f) => f.Name && f.Name.trim() === want
      );
      if (!byName?.Id) {
        byName = (folders as { Name?: string; Id?: number }[]).find(
          (f) => f.Name && f.Name.trim().toLowerCase() === want.toLowerCase()
        );
      }
      if (!byName?.Id) {
        throw new Error(`Dropbox assignment "${this.dropboxAssignmentName}" not found. The instructor must create this assignment in eLC (Assignments) with the same name.`);
      }
      folderId = byName.Id;
    }
    if (!folderId) return;
    const percentage = totalPoints > 0 ? (pointsEarned / totalPoints) * 100 : 0;
    const userId = this.currentEnrollment?.User?.Identifier ?? this.currentUser?.Identifier;
    const payload = {
      quizId: this.quizId,
      quizTitle: this.quizTitle || this.quizId,
      gradeObjectName: '', // Quiz results go to assignment only; no gradebook save
      pointsEarned: Math.round(pointsEarned),
      totalPoints,
      percentage: Math.round(percentage * 10) / 10,
      passed,
      attemptCount: this.attemptCount,
      timestamp: new Date().toISOString(),
      userId: userId ?? null,
      displayName: this.currentUser?.DisplayName ?? this.currentEnrollment?.User?.DisplayName ?? null,
      responses: this.responses
    };
    const fileName = `quiz-result-${this.quizId}-attempt-${this.attemptCount}.json`;
    const jsonStr = JSON.stringify(payload, null, 2);
    const summaryLine = `${this.quizTitle || this.quizId}: ${pointsEarned}/${totalPoints} (${percentage.toFixed(1)}%) – ${passed ? 'Passed' : 'Failed'} – Attempt ${this.attemptCount}`;
    const comment = this.formatSubmissionComment(payload, summaryLine, percentage);
    try {
      await submitToDropbox(
        this.ou,
        this.versions.le,
        folderId,
        comment,
        fileName,
        jsonStr,
        'application/json'
      );
    } catch (err: any) {
      // If assignment is "Text submission" only, file upload may be rejected; retry with comment only
      const status = err.response?.status;
      if ((status === 400 || status === 415 || status === 422) && err.response?.data) {
        await submitToDropboxCommentOnly(this.ou, this.versions.le, folderId, comment);
      } else {
        throw err;
      }
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
    this.dropboxSaveStatus = 'idle';
    this.dropboxErrorMessage = null;
    
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
   * Clears localStorage attempt count and component state
   */
  private async clearAllAttempts(): Promise<void> {
    if (!this.allowReset) {
      console.warn('Reset not allowed. Set allow-reset="true" on the quiz component to enable.');
      return;
    }

    const userId = this.currentUser?.Identifier || 'anonymous';
    const storageKey = `uga-quiz-attempts-${this.quizId}-${userId}`;
    
    localStorage.removeItem(storageKey);
    this.attemptCount = 0;
    
    // Reset component state
    this.completionStatus = 'not-started';
    this.isSubmitted = false;
    this.isStarted = false;
    this.results = null;
    this.currentQuestionIndex = 0;
    this.responses = {};
    this.dropboxSaveStatus = 'idle';
    this.dropboxErrorMessage = null;
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

      case QuestionType.MULTI_SELECT: {
        const selectedIndices = (Array.isArray(currentAnswer) ? currentAnswer as number[] : []);
        const correctIndices = (Array.isArray(question.correctAnswer)
          ? (question.correctAnswer as number[]).slice().sort((a, b) => a - b)
          : []);
        return html`
          <div class="quiz-question">
            <p class="quiz-question-text">${question.question}</p>
            <p class="quiz-question-hint">Select all that apply.</p>
            <div class="quiz-options">
              ${question.options?.map((option, index) => {
                const isSelected = selectedIndices.includes(index);
                const isCorrectOption = correctIndices.includes(index);
                const showCorrect = showFeedback && isCorrectOption;
                const showIncorrect = showFeedback && isSelected && !attempt?.isCorrect && !isCorrectOption;
                return html`
                  <label class="quiz-option ${showCorrect ? 'correct' : ''} ${showIncorrect ? 'incorrect' : ''}">
                    <input
                      type="checkbox"
                      name="question-${question.id}"
                      value="${index}"
                      .checked=${isSelected}
                      @change=${() => {
                        const cur = (this.responses[question.id] as number[]) || [];
                        const next = cur.includes(index)
                          ? cur.filter(i => i !== index).sort((a, b) => a - b)
                          : [...cur, index].sort((a, b) => a - b);
                        this.handleAnswer(question.id, next);
                      }}
                      ?disabled=${this.isSubmitted}
                    />
                    <span>${option}</span>
                  </label>
                `;
              })}
            </div>
            ${showFeedback ? html`
              <div class="quiz-feedback ${attempt?.isCorrect ? 'correct' : 'incorrect'}">
                ${attempt?.isCorrect
                  ? html`<span class="feedback-icon">✓</span> Correct! ${question.explanation ? `- ${question.explanation}` : ''}`
                  : html`<span class="feedback-icon">✗</span> Incorrect. ${question.explanation ? `- ${question.explanation}` : ''}`
                }
                <div class="feedback-points">Points: ${attempt!.pointsEarned}/${question.points}</div>
              </div>
            ` : ''}
          </div>
        `;
      }

      case QuestionType.ORDERING: {
        const orderIndices = (Array.isArray(currentAnswer) && currentAnswer.length === (question.options?.length ?? 0))
          ? (currentAnswer as number[])
          : (question.options?.map((_, i) => i) ?? []);
        const correctOrder = (Array.isArray(question.correctAnswer) ? (question.correctAnswer as number[]) : []);
        const move = (from: number, delta: number) => {
          const next = orderIndices.slice();
          const to = from + delta;
          if (to < 0 || to >= next.length) return;
          [next[from], next[to]] = [next[to], next[from]];
          this.handleAnswer(question.id, next);
        };
        return html`
          <div class="quiz-question">
            <p class="quiz-question-text">${question.question}</p>
            <p class="quiz-question-hint">Arrange the items in the correct order. Use the arrows to move items up or down.</p>
            <div class="quiz-ordering">
              ${orderIndices.map((optionIndex, position) => {
                const optionText = question.options?.[optionIndex] ?? '';
                const showCorrect = showFeedback && correctOrder[position] === optionIndex;
                const showIncorrect = showFeedback && !attempt?.isCorrect && correctOrder[position] !== optionIndex;
                return html`
                  <div class="ordering-item ${showCorrect ? 'correct' : ''} ${showIncorrect ? 'incorrect' : ''}">
                    <span class="ordering-number">${position + 1}.</span>
                    <span class="ordering-text">${optionText}</span>
                    <span class="ordering-buttons">
                      <button
                        type="button"
                        class="ordering-btn"
                        aria-label="Move up"
                        ?disabled=${this.isSubmitted || position === 0}
                        @click=${() => move(position, -1)}
                      >↑</button>
                      <button
                        type="button"
                        class="ordering-btn"
                        aria-label="Move down"
                        ?disabled=${this.isSubmitted || position === orderIndices.length - 1}
                        @click=${() => move(position, 1)}
                      >↓</button>
                    </span>
                  </div>
                `;
              })}
            </div>
            ${showFeedback ? html`
              <div class="quiz-feedback ${attempt?.isCorrect ? 'correct' : 'incorrect'}">
                ${attempt?.isCorrect
                  ? html`<span class="feedback-icon">✓</span> Correct order! ${question.explanation ? `- ${question.explanation}` : ''}`
                  : html`<span class="feedback-icon">✗</span> Incorrect order. ${question.explanation ? `- ${question.explanation}` : ''}`
                }
                <div class="feedback-points">Points: ${attempt!.pointsEarned}/${question.points}</div>
              </div>
            ` : ''}
          </div>
        `;
      }

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
      if (q.type === QuestionType.MULTI_SELECT) {
        const answer = this.responses[q.id] as number[] | undefined;
        return Array.isArray(answer) && answer.length > 0;
      }
      if (q.type === QuestionType.ORDERING) {
        const answer = this.responses[q.id] as number[] | undefined;
        return Array.isArray(answer) && answer.length === (q.options?.length ?? 0);
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
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #ba0c2f;
        }
        .quiz-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #ba0c2f;
          flex: 1;
          min-width: 0;
        }
        .quiz-timer {
          flex-shrink: 0;
          font-size: 1.2rem;
          font-weight: bold;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background: ${this.timeRemaining < 60 ? '#ffebee' : '#f5f5f5'};
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
        .quiz-option input[type="radio"],
        .quiz-option input[type="checkbox"] {
          margin-right: 0.5rem;
        }
        .quiz-question-hint {
          font-size: 0.9rem;
          color: #666;
          margin: -0.5rem 0 0.75rem 0;
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
        .quiz-ordering {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .ordering-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border: 2px solid #ddd;
          border-radius: 4px;
          background: #fff;
        }
        .ordering-item:hover:not(:has(.ordering-btn:disabled)) {
          border-color: #ba0c2f;
        }
        .ordering-number {
          min-width: 2em;
          font-weight: bold;
          color: #666;
        }
        .ordering-text {
          flex: 1;
        }
        .ordering-buttons {
          display: flex;
          gap: 0.25rem;
        }
        .ordering-btn {
          padding: 0.25rem 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: #f5f5f5;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
        }
        .ordering-btn:hover:not(:disabled) {
          background: #ba0c2f;
          color: #fff;
          border-color: #ba0c2f;
        }
        .ordering-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .ordering-item.correct {
          background: #e8f5e9;
          border-color: #4caf50;
        }
        .ordering-item.incorrect {
          background: #ffebee;
          border-color: #f44336;
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
      </style>

      <div class="quiz-container">
        <div class="quiz-header">
          <div class="quiz-title">${this.quizTitle || 'Quiz'}</div>
          ${this.timeLimit > 0 ? html`<div class="quiz-timer" role="timer" aria-live="polite">Time remaining: ${this.formatTime(this.timeRemaining)}</div>` : ''}
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
            
            ${(this.dropboxFolderId || this.dropboxAssignmentName?.trim()) ? html`
              <div class="assignment-status" style="margin-top: 1rem; padding: 1rem; border-radius: 4px; text-align: center;">
                ${this.dropboxSaveStatus === 'success' ? html`
                  <p style="color: #4caf50; font-weight: bold;">✓ Results submitted to assignment</p>
                ` : this.dropboxSaveStatus === 'error' ? html`
                  <p style="color: #f44336; font-weight: bold;">✗ Could not submit to assignment</p>
                  <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">${this.dropboxErrorMessage || 'Unknown error'}</p>
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
          </div>
        `}
      </div>
    `;
  }
}
