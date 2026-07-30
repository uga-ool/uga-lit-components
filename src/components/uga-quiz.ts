import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import axios from 'axios';
import { getVersions, getUser, getEnrollment, getAssignments, clearAssignmentsCache, submitToDropbox, submitToDropboxCommentOnly, getMySubmission, logApiVersionWarning } from '../lib/api/d2l-client.js';
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
  @property({ type: Boolean, attribute: 'allow-retry' }) allowRetry = true;
  @property({ type: Number, attribute: 'max-attempts' }) maxAttempts = 3; // Maximum retry attempts
  @property({ type: Boolean, attribute: 'show-feedback' }) showFeedback = true; // Show immediate feedback
  @property({ type: Boolean }) allowReset = false; // Reset button removed; kept for API compatibility
  @property({ type: Boolean, attribute: 'randomize-questions' }) randomizeQuestions = false;
  @property({ type: Boolean, attribute: 'randomize-answers' }) randomizeAnswers = false; // Randomize answer order within each question
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
  @state() private jsonTitle = ''; // Title from JSON file (takes precedence over quiz-title attribute)
  @state() private feedbackLoadStatus: 'idle' | 'loading' | 'loaded' | 'failed' = 'idle';
  @state() private fetchedFeedback: { results: QuizResult; responses: Record<string, unknown> } | null = null;
  /** True after Retake until Start; prevents showCompletedBlock from trapping the start screen. */
  @state() private isRetaking = false;

  private get displayTitle(): string {
    return this.jsonTitle || this.quizTitle || 'Quiz';
  }

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
        // Generate stable quizId from quizTitle (normalized for consistency)
        const normalizedTitle = this.quizTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        this.quizId = `quiz-${normalizedTitle}`;
        
        // Store this mapping persistently so the same quizTitle always gets the same quizId
        // This ensures attempt tracking works correctly across page loads
        const userId = this.currentUser?.Identifier || 'anonymous';
        const quizIdMappingKey = `uga-quiz-id-mapping-${normalizedTitle}-${userId}`;
        const storedQuizId = localStorage.getItem(quizIdMappingKey);
        
        if (storedQuizId) {
          // Use the stored quizId to maintain consistency with previous attempts
          this.quizId = storedQuizId;
          console.log(`ℹ️ quizId generated from quizTitle, using stored ID for consistency: "${this.quizId}"`);
        } else {
          // Store this quizId so future loads use the same ID
          localStorage.setItem(quizIdMappingKey, this.quizId);
          console.log(`ℹ️ quizId generated from quizTitle and stored: "${this.quizId}"`);
        }
      } else if (this.filename?.trim()) {
        // No quizTitle - derive stable quizId from filename (e.g. quiz10.json -> quiz-quiz10)
        const base = this.filename.replace(/\.(json|csv)$/i, '').replace(/[^a-z0-9_-]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'quiz';
        this.quizId = base.startsWith('quiz') ? base : `quiz-${base}`;
        console.log(`ℹ️ quizId derived from filename: "${this.quizId}"`);
      } else {
        // No quizTitle, no filename - use path-based fallback (currentUser is null here)
        const pathKey = typeof window !== 'undefined' && window.location?.pathname
          ? `uga-quiz-fallback-id-path-${window.location.pathname}`
          : null;
        const storedFallbackId = (pathKey && localStorage.getItem(pathKey)) || localStorage.getItem('uga-quiz-fallback-id-anonymous');
        if (storedFallbackId) {
          this.quizId = storedFallbackId;
          console.log(`ℹ️ quizId was empty (no quizTitle, no filename), using stored fallback: "${this.quizId}"`);
        } else {
          this.quizId = `quiz-${Date.now()}`;
          console.warn(`⚠️ quizId was empty (no quizTitle, no filename). Generated: "${this.quizId}". Add quiz-id, quiz-title, or filename for reliable feedback.`);
        }
        try {
          if (pathKey) localStorage.setItem(pathKey, this.quizId);
          localStorage.setItem('uga-quiz-fallback-id-anonymous', this.quizId);
        } catch {
          // ignore
        }
      }
    } else {
      // quizId is explicitly set - ensure it's stored for consistency checking
      if (this.quizTitle) {
        const userId = this.currentUser?.Identifier || 'anonymous';
        const normalizedTitle = this.quizTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const quizIdMappingKey = `uga-quiz-id-mapping-${normalizedTitle}-${userId}`;
        const storedQuizId = localStorage.getItem(quizIdMappingKey);
        
        if (storedQuizId && storedQuizId !== this.quizId) {
          // Conflict: quizTitle maps to a different quizId - use the stored one for attempt consistency
          console.warn(`⚠️ quizId "${this.quizId}" conflicts with stored ID "${storedQuizId}" for quizTitle "${this.quizTitle}". Using stored ID for attempt tracking consistency.`);
          this.quizId = storedQuizId;
        } else if (!storedQuizId) {
          // Store the mapping
          localStorage.setItem(quizIdMappingKey, this.quizId);
        }
      }
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

      // Restore previous completion results so feedback is shown when user returns to the page
      this.restorePreviousResults();

      // If still no results but we have attempts, try fetching from assignment (handles iframe/storage issues)
      if (!this.results && this.showFeedback && this.attemptCount > 0 && this.dropboxAssignmentName?.trim()) {
        const ok = await this.fetchFeedbackFromAssignment();
        if (ok) this.fetchedFeedback = { results: this.results!, responses: this.responses };
      }

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
        if (data && typeof data.title === 'string' && data.title.trim()) {
          this.jsonTitle = data.title.trim();
        }
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
        if (parsed && typeof parsed.title === 'string' && parsed.title.trim()) {
          this.jsonTitle = parsed.title.trim();
        }
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

    // Randomize questions if requested
    if (this.randomizeQuestions) {
      questionsData = this.shuffleArray([...questionsData]);
    }

    // Randomize answers within each question if requested
    if (this.randomizeAnswers) {
      questionsData = questionsData.map(q => {
        if (q.options && (q.type === QuestionType.MULTIPLE_CHOICE || q.type === QuestionType.MULTI_SELECT || q.type === QuestionType.TRUE_FALSE)) {
          // Create shuffled options and map correctAnswer to new index
          const shuffledIndices = this.shuffleArray(q.options.map((_, i) => i));
          const shuffledOptions = shuffledIndices.map(i => q.options![i]);
          
          // Map correctAnswer to new position
          let newCorrectAnswer: any;
          if (q.type === QuestionType.MULTIPLE_CHOICE || q.type === QuestionType.TRUE_FALSE) {
            const oldIndex = typeof q.correctAnswer === 'number' ? q.correctAnswer : parseInt(String(q.correctAnswer), 10);
            newCorrectAnswer = shuffledIndices.indexOf(oldIndex);
          } else if (q.type === QuestionType.MULTI_SELECT && Array.isArray(q.correctAnswer)) {
            newCorrectAnswer = (q.correctAnswer as number[]).map(oldIdx => shuffledIndices.indexOf(oldIdx)).sort((a, b) => a - b);
          } else {
            newCorrectAnswer = q.correctAnswer;
          }
          
          return { ...q, options: shuffledOptions, correctAnswer: newCorrectAnswer };
        }
        return q;
      });
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
   * Restore last completion results from localStorage so feedback is shown when user returns to the page.
   * Called after loadQuestions so parsedQuestions exists.
   * Tries specific keys first, then scans for any key matching the quizId (handles userId mismatches).
   */
  private restorePreviousResults(): void {
    if (!this.showFeedback) return;
    const persisted = this.getPersistedResults();
    if (persisted) {
      this.results = persisted.results;
      this.completionStatus = persisted.results.passed ? 'passed' : 'failed';
      this.responses = persisted.responses || {};
      this.isSubmitted = true;
      this.isStarted = true;
      this.dropboxSaveStatus = 'idle';
      this.dropboxErrorMessage = null;
    }
  }

  /**
   * Parse the human-readable "Responses:" section from a submission comment.
   * Format: "  • Quiz-001: Option text" or "  • Quiz-001:\n    • Option A"
   */
  private parseResponsesFromCommentText(commentText: string): { responses: Record<string, unknown>; totalPoints?: number; pointsEarned?: number; percentage?: number; passed?: boolean } | null {
    const responses: Record<string, unknown> = {};
    const respIdx = commentText.toLowerCase().indexOf('responses:');
    if (respIdx < 0) return null;
    const section = commentText.slice(respIdx);
    const lines = section.split(/\r?\n/);
    let currentQ: string | null = null;
    for (const line of lines) {
      const bulletMatch = line.match(/^\s*[•\-]\s*([^:]+):\s*(.*)$/);
      if (bulletMatch) {
        const qId = bulletMatch[1].trim();
        const val = bulletMatch[2].trim();
        if (this.parsedQuestions.some(q => q.id === qId)) {
          currentQ = qId;
          if (val) {
            const q = this.parsedQuestions.find(qq => qq.id === qId);
            const idx = q?.options?.findIndex(o => o === val);
            responses[qId] = idx >= 0 ? idx : val;
          }
        }
      } else if (currentQ && line.match(/^\s{2,}[•\-]\s/)) {
        const subMatch = line.match(/^\s+[•\-]\s*(.+)$/);
        if (subMatch) {
          const val = subMatch[1].trim();
          const q = this.parsedQuestions.find(qq => qq.id === currentQ);
          if (q?.type === QuestionType.MULTI_SELECT || q?.type === QuestionType.ORDERING) {
            const arr = (responses[currentQ!] as number[]) || [];
            const idx = q.options?.findIndex(o => o === val);
            if (idx >= 0) arr.push(idx);
            responses[currentQ!] = arr;
          }
        }
      }
    }
    if (Object.keys(responses).length === 0) return null;
    const scoreMatch = commentText.match(/Score:\s*(\d+)\s*\/\s*(\d+)/);
    const totalPoints = scoreMatch ? parseInt(scoreMatch[2], 10) : undefined;
    const pointsEarned = scoreMatch ? parseInt(scoreMatch[1], 10) : undefined;
    const passedMatch = commentText.match(/Status:\s*(Passed|Failed)/i);
    const passed = passedMatch ? passedMatch[1].toLowerCase() === 'passed' : undefined;
    return { responses, totalPoints, pointsEarned, percentage: totalPoints && pointsEarned != null ? (pointsEarned / totalPoints) * 100 : undefined, passed };
  }

  private rebuildAttemptsFromResponses(responses: Record<string, unknown>): QuizAttempt[] {
    const attempts: QuizAttempt[] = [];
    for (const q of this.parsedQuestions) {
      attempts.push(this.gradeQuestion(q, responses[q.id]));
    }
    return attempts;
  }

  /**
   * Fetch feedback from the assignment submission when localStorage/sessionStorage fails (e.g. iframe/origin).
   * Parses the ---UGA_QUIZ_FULL_JSON--- block or the human-readable Responses section from the submission comment.
   */
  private async fetchFeedbackFromAssignment(): Promise<boolean> {
    if (!this.showFeedback || !this.ou || !this.versions.le || !this.dropboxAssignmentName?.trim()) {
      if (this.showFeedback && this.attemptCount > 0) {
        console.warn('[uga-quiz] Cannot fetch feedback: missing dropbox-assignment-name, ou, or le version. Set dropbox-assignment-name to the exact eLC assignment title.');
      }
      return false;
    }
    try {
      clearAssignmentsCache(this.ou);
      const folders = await getAssignments(this.ou, this.versions.le);
      const want = this.dropboxAssignmentName.trim();
      const list = (folders as { Name?: string; Id?: number }[]) || [];
      const folder = list.find((f) => f.Name?.trim() === want) || list.find((f) => f.Name?.trim().toLowerCase() === want.toLowerCase());
      if (!folder?.Id) {
        console.warn('[uga-quiz] Cannot fetch feedback: assignment "' + want + '" not found. Available:', list.map((f) => f.Name).filter(Boolean));
        return false;
      }
      // Use getMySubmission (mysubmissions GET) - students can read their own submissions
      const userSub = await getMySubmission(this.ou, this.versions.le, folder.Id);
      const commentText = userSub?.TextSubmission ?? '';
      let data: { attempts?: Array<{ questionId: string; isCorrect: boolean; pointsEarned: number }>; responses?: Record<string, unknown>; totalPoints?: number; pointsEarned?: number; percentage?: number; passed?: boolean } | null = null;

      if (!commentText || commentText.length < 10) {
        console.warn('[uga-quiz] Cannot fetch feedback: submission comment empty or too short. (Student may lack permission to read own submission, or submission format differs.)');
        return false;
      }
      const idx = commentText.indexOf('---UGA_QUIZ_FULL_JSON---');
      const jsonStr = idx >= 0 ? commentText.slice(idx + 24).trim() : '';
      if (jsonStr) {
        try {
          data = JSON.parse(jsonStr) as typeof data;
        } catch {
          // ignore
        }
      }
      if (!data?.attempts || !data?.responses) {
        data = this.parseResponsesFromCommentText(commentText);
      }
      if (!data?.responses) {
        console.warn('[uga-quiz] Cannot fetch feedback: could not parse responses from submission comment.');
        return false;
      }
      const attempts = data.attempts ?? this.rebuildAttemptsFromResponses(data.responses);
      if (!attempts.length) return false;
      const totalPoints = data.totalPoints ?? this.parsedQuestions.reduce((s, q) => s + q.points, 0);
      const pointsEarned = data.pointsEarned ?? attempts.reduce((s, a) => s + (a.pointsEarned ?? 0), 0);
      const percentage = data.percentage ?? (totalPoints > 0 ? (pointsEarned / totalPoints) * 100 : 0);
      this.results = {
        totalPoints,
        pointsEarned,
        percentage,
        passed: data.passed ?? percentage >= this.passingScore,
        attempts,
        completedAt: new Date().toISOString()
      };
      this.responses = data.responses || {};
      this.completionStatus = this.results.passed ? 'passed' : 'failed';
      this.isSubmitted = true;
      this.isStarted = true;
      this.dropboxSaveStatus = 'idle';
      this.dropboxErrorMessage = null;
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const status = (err as { response?: { status?: number } })?.response?.status;
      console.warn('[uga-quiz] Fetch feedback failed:', msg, status ? `(HTTP ${status})` : '');
      return false;
    }
  }

  /**
   * Load persisted results from localStorage (synchronous). Used when we might show "Quiz Already Completed"
   * but want to display feedback from a previous completion.
   * Tries specific keys first, then scans for any key matching the quizId pattern (handles userId mismatches).
   */
  private static readonly COOKIE_KEY = 'uqa_r';
  private static readonly COOKIE_MAX_AGE = 300; // 5 min

  /** Read results from cookie (survives iframe document replacement when same-origin). */
  private getPersistedResultsFromCookie(): { results: QuizResult; responses: Record<string, unknown> } | null {
    try {
      if (typeof document === 'undefined' || !document.cookie) return null;
      const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + UgaQuiz.COOKIE_KEY + '=([^;]*)'));
      const val = match?.[1];
      if (!val) return null;
      const data = JSON.parse(decodeURIComponent(val)) as { results: QuizResult; responses: Record<string, unknown>; ts: number };
      if (!data?.results?.attempts || Date.now() - (data.ts || 0) > UgaQuiz.COOKIE_MAX_AGE * 1000) return null;
      const ourIds = new Set(this.parsedQuestions.map(q => q.id));
      const storedIds = new Set(data.results.attempts.map((a: { questionId: string }) => a.questionId));
      if (ourIds.size > 0 && ourIds.size === storedIds.size && [...ourIds].every(id => storedIds.has(id))) {
        console.debug('[uga-quiz] Restored feedback from cookie (document replacement fallback)');
        return { results: data.results, responses: data.responses || {} };
      }
    } catch {
      /* ignore */
    }
    return null;
  }

  /** Scan a Storage (localStorage or sessionStorage) for persisted results. */
  private getPersistedResultsFromStorage(storage: Storage): { results: QuizResult; responses: Record<string, unknown> } | null {
    const ourIds = new Set(this.parsedQuestions.map(q => q.id));
    if (ourIds.size > 0) {
      try {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith('uga-quiz-results-')) {
            const resultsStored = storage.getItem(key);
            if (!resultsStored) continue;
            try {
              const data = JSON.parse(resultsStored);
              if (!data.results?.attempts || (data.completionStatus !== 'passed' && data.completionStatus !== 'failed')) continue;
              const storedIds = new Set(data.results.attempts.map((a: { questionId: string }) => a.questionId));
              const match = ourIds.size === storedIds.size && [...ourIds].every(id => storedIds.has(id));
              if (match) return { results: data.results, responses: data.responses || {} };
            } catch {
              // ignore
            }
          }
        }
      } catch {
        // ignore
      }
    }
    const prefix = `uga-quiz-results-${this.quizId}-`;
    const userIds = [this.currentUser?.Identifier, 'anonymous'].filter(Boolean) as string[];
    if (userIds.length === 0) userIds.push('anonymous');
    for (const userId of userIds) {
      const resultsStored = storage.getItem(prefix + userId);
      if (!resultsStored) continue;
      try {
        const data = JSON.parse(resultsStored);
        if (data.results && (data.completionStatus === 'passed' || data.completionStatus === 'failed')) {
          return { results: data.results, responses: data.responses || {} };
        }
      } catch {
        // ignore
      }
    }
    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(prefix)) {
          const resultsStored = storage.getItem(key);
          if (resultsStored) {
            try {
              const data = JSON.parse(resultsStored);
              if (data.results && (data.completionStatus === 'passed' || data.completionStatus === 'failed')) {
                return { results: data.results, responses: data.responses || {} };
              }
            } catch {
              // ignore
            }
          }
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  private getPersistedResults(): { results: QuizResult; responses: Record<string, unknown> } | null {
    const tryPending = (useTop: boolean) => {
      try {
        const pending = useTop && typeof window !== 'undefined' && window.top
          ? (window.top as any).__ugaQuizPendingResults
          : (globalThis as any).__ugaQuizPendingResults;
        const data = pending as { results: QuizResult; responses: Record<string, unknown>; ts: number } | undefined;
        if (data && Date.now() - data.ts < 60000) {
          const ourIds = new Set(this.parsedQuestions.map(q => q.id));
          const storedIds = new Set(data.results?.attempts?.map((a: { questionId: string }) => a.questionId) ?? []);
          if (ourIds.size > 0 && ourIds.size === storedIds.size && [...ourIds].every(id => storedIds.has(id))) {
            if (useTop) console.debug('[uga-quiz] Restored feedback from window.top (iframe replacement fallback)');
            return { results: data.results, responses: data.responses || {} };
          }
        }
      } catch {
        /* ignore */
      }
      return null;
    };
    const fromTop = tryPending(true);
    if (fromTop) return fromTop;
    const fromGlobal = tryPending(false);
    if (fromGlobal) return fromGlobal;
    const fromCookie = this.getPersistedResultsFromCookie();
    if (fromCookie) return fromCookie;
    // Try sessionStorage first (same-tab refresh; can work when localStorage has iframe/origin issues)
    try {
      const fromSession = this.getPersistedResultsFromStorage(sessionStorage);
      if (fromSession) return fromSession;
    } catch {
      // ignore
    }
    return this.getPersistedResultsFromStorage(localStorage);
  }

  /**
   * Start the quiz
   */
  private startQuiz(): void {
    this.isRetaking = false;
    this.isStarted = true;
    this.currentQuestionIndex = 0;
    this.isSubmitted = false;
    this.results = null;
    this.attemptCount++;

    // Save attempt count immediately when quiz starts (not just on submission)
    // This ensures attempts are tracked even if the user doesn't complete the quiz
    const userId = this.currentUser?.Identifier || 'anonymous';
    const storageKey = `uga-quiz-attempts-${this.quizId}-${userId}`;
    localStorage.setItem(storageKey, JSON.stringify({
      attemptCount: this.attemptCount,
      lastStarted: new Date().toISOString()
    }));

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

      // Persist results IMMEDIATELY so feedback is shown when user returns to the page.
      // Do this before dropbox submit so we don't lose data if that fails.
      const userId = this.currentUser?.Identifier || 'anonymous';
      const resultsPayload = {
        completionStatus: this.completionStatus,
        results: this.results,
        responses: this.responses,
        dropboxSaveStatus: this.dropboxSaveStatus,
        dropboxErrorMessage: this.dropboxErrorMessage,
        timestamp: new Date().toISOString()
      };
      try {
        const storageKey = `uga-quiz-attempts-${this.quizId}-${userId}`;
        const resultsKey = `uga-quiz-results-${this.quizId}-${userId}`;
        const resultsStr = JSON.stringify(resultsPayload);
        localStorage.setItem(storageKey, JSON.stringify({ attemptCount: this.attemptCount, lastCompleted: new Date().toISOString() }));
        localStorage.setItem(resultsKey, resultsStr);
        sessionStorage.setItem(resultsKey, resultsStr);
      } catch (storageErr: any) {
        console.warn('⚠️ Could not persist quiz results:', storageErr?.message || storageErr);
      }

      // Store in window.top (survives iframe replacement) and globalThis (same-doc re-mount)
      const pending = { quizId: this.quizId, results: this.results, responses: this.responses, ts: Date.now() };
      try {
        (globalThis as any).__ugaQuizPendingResults = pending;
      } catch {
        /* ignore */
      }
      try {
        if (typeof window !== 'undefined' && window.top) {
          (window.top as any).__ugaQuizPendingResults = pending;
        }
      } catch {
        /* ignore - cross-origin iframe */
      }

      // Cookie fallback (survives iframe document replacement when same-origin; ~4KB limit)
      try {
        if (typeof document !== 'undefined' && document.cookie !== undefined) {
          const cookiePayload = { results: this.results, responses: this.responses, ts: Date.now() };
          const str = encodeURIComponent(JSON.stringify(cookiePayload));
          if (str.length < 3800) {
            document.cookie = `${UgaQuiz.COOKIE_KEY}=${str}; path=/; max-age=${UgaQuiz.COOKIE_MAX_AGE}; SameSite=Lax`;
          }
        }
      } catch {
        /* ignore */
      }

      // Render feedback immediately; don't block on dropbox submit (avoids losing feedback if submit triggers reload)
      this.requestUpdate();

      // Submit quiz result to eLC assignment if dropbox-folder-id or dropbox-assignment-name is set
      const useDropbox = (this.dropboxFolderId && this.ou && this.versions.le) ||
        (this.dropboxAssignmentName?.trim() && this.ou && this.versions.le);
      if (useDropbox) {
        this.saveToDropbox(pointsEarned, totalPoints, passed)
          .then(() => {
            this.dropboxSaveStatus = 'success';
            this.dropboxErrorMessage = null;
            console.log('✅ Quiz result submitted to assignment');
            try {
              const resultsKey = `uga-quiz-results-${this.quizId}-${userId}`;
              const stored = localStorage.getItem(resultsKey);
              if (stored) {
                const data = JSON.parse(stored);
                data.dropboxSaveStatus = 'success';
                data.dropboxErrorMessage = null;
                localStorage.setItem(resultsKey, JSON.stringify(data));
              }
            } catch {
              /* ignore */
            }
            this.requestUpdate();
          })
          .catch((err: any) => {
            const msg = err?.message || String(err);
            console.warn('⚠️ Assignment submission failed:', msg);
            this.dropboxSaveStatus = 'error';
            this.dropboxErrorMessage = msg.includes('not found')
              ? `The assignment "${this.dropboxAssignmentName || 'for submissions'}" was not found. Your instructor must create this assignment in eLC (Assignments) with the same name; then you can submit again.`
              : msg;
            try {
              const resultsKey = `uga-quiz-results-${this.quizId}-${userId}`;
              const stored = localStorage.getItem(resultsKey);
              if (stored) {
                const data = JSON.parse(stored);
                data.dropboxSaveStatus = 'error';
                data.dropboxErrorMessage = this.dropboxErrorMessage;
                localStorage.setItem(resultsKey, JSON.stringify(data));
              }
            } catch {
              /* ignore */
            }
            this.requestUpdate();
          });
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
      // Use fresh folder list at submit time (bypass cache) so new or recently renamed assignments are found
      clearAssignmentsCache(this.ou);
      const folders = await getAssignments(this.ou, this.versions.le);
      const want = this.dropboxAssignmentName.trim();
      const list = (folders as { Name?: string; Id?: number }[]) || [];
      let byName = list.find((f) => f.Name && f.Name.trim() === want);
      if (!byName?.Id) {
        byName = list.find((f) => f.Name && f.Name.trim().toLowerCase() === want.toLowerCase());
      }
      if (!byName?.Id) {
        const names = list.map((f) => (f.Name ? `"${String(f.Name).trim()}"` : '')).filter(Boolean);
        const hint = names.length ? ` Found assignments: ${names.join(', ')}.` : ' No assignments returned for this course (check course ID and dropbox:folders:read permission).';
        throw new Error(`Dropbox assignment "${this.dropboxAssignmentName}" not found. Create this assignment in eLC (Assignments) with the exact same name.${hint}`);
      }
      folderId = byName.Id;
    }
    if (!folderId) return;
    const percentage = totalPoints > 0 ? (pointsEarned / totalPoints) * 100 : 0;
    const userId = this.currentEnrollment?.User?.Identifier ?? this.currentUser?.Identifier;
    const attempts = this.results?.attempts ?? [];
    const payload = {
      quizId: this.quizId,
      quizTitle: this.displayTitle,
      gradeObjectName: '',
      pointsEarned: Math.round(pointsEarned),
      totalPoints,
      percentage: Math.round(percentage * 10) / 10,
      passed,
      attemptCount: this.attemptCount,
      timestamp: new Date().toISOString(),
      userId: userId ?? null,
      displayName: this.currentUser?.DisplayName ?? this.currentEnrollment?.User?.DisplayName ?? null,
      responses: this.responses,
      attempts
    };
    const fileName = `quiz-result-${this.quizId}-attempt-${this.attemptCount}.json`;
    const jsonStr = JSON.stringify(payload, null, 2);
    const summaryLine = `${this.displayTitle}: ${pointsEarned}/${totalPoints} (${percentage.toFixed(1)}%) – ${passed ? 'Passed' : 'Failed'} – Attempt ${this.attemptCount}`;
    const comment = this.formatSubmissionComment(payload, summaryLine, percentage);
    // Append parseable JSON for feedback recovery when localStorage fails (e.g. iframe/origin)
    const commentWithJson = {
      Text: (comment.Text || '') + '\n---UGA_QUIZ_FULL_JSON---\n' + jsonStr,
      Html: comment.Html
    };
    try {
      await submitToDropbox(
        this.ou,
        this.versions.le,
        folderId,
        commentWithJson,
        fileName,
        jsonStr,
        'application/json'
      );
    } catch (err: any) {
      // If assignment is "Text submission" only, file upload may be rejected; retry with comment only
      const status = err.response?.status;
      if ((status === 400 || status === 415 || status === 422) && err.response?.data) {
        await submitToDropboxCommentOnly(this.ou, this.versions.le, folderId, commentWithJson);
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

    // Re-randomize questions if requested
    if (this.randomizeQuestions) {
      this.parsedQuestions = this.shuffleArray([...this.parsedQuestions]);
    }

    // Re-randomize answers if requested
    if (this.randomizeAnswers) {
      this.parsedQuestions = this.parsedQuestions.map(q => {
        if (q.options && (q.type === QuestionType.MULTIPLE_CHOICE || q.type === QuestionType.MULTI_SELECT || q.type === QuestionType.TRUE_FALSE)) {
          const shuffledIndices = this.shuffleArray(q.options.map((_, i) => i));
          const shuffledOptions = shuffledIndices.map(i => q.options![i]);
          
          let newCorrectAnswer: any;
          if (q.type === QuestionType.MULTIPLE_CHOICE || q.type === QuestionType.TRUE_FALSE) {
            const oldIndex = typeof q.correctAnswer === 'number' ? q.correctAnswer : parseInt(String(q.correctAnswer), 10);
            newCorrectAnswer = shuffledIndices.indexOf(oldIndex);
          } else if (q.type === QuestionType.MULTI_SELECT && Array.isArray(q.correctAnswer)) {
            newCorrectAnswer = (q.correctAnswer as number[]).map(oldIdx => shuffledIndices.indexOf(oldIdx)).sort((a, b) => a - b);
          } else {
            newCorrectAnswer = q.correctAnswer;
          }
          
          return { ...q, options: shuffledOptions, correctAnswer: newCorrectAnswer };
        }
        return q;
      });
    }

    this.isRetaking = true;
    this.isStarted = false;
    this.isSubmitted = false;
    this.results = null;
    this.completionStatus = 'not-started';
    this.currentQuestionIndex = 0;
    this.responses = {};
    this.dropboxSaveStatus = 'idle';
    this.dropboxErrorMessage = null;
    this.feedbackLoadStatus = 'idle';
    this.fetchedFeedback = null;
    
    // Re-initialize responses
    for (const q of this.parsedQuestions) {
      if (q.type === QuestionType.MATCHING) {
        this.responses[q.id] = {};
      } else if (q.type === QuestionType.MULTI_SELECT) {
        this.responses[q.id] = [];
      } else if (q.type === QuestionType.ORDERING && q.options?.length) {
        this.responses[q.id] = this.shuffleArray(q.options.map((_, i) => i));
      } else {
        this.responses[q.id] = '';
      }
    }

    this.errorMessage = null;

    // Clear persisted results so we don't show old feedback on next visit
    const userId = this.currentUser?.Identifier || 'anonymous';
    localStorage.removeItem(`uga-quiz-results-${this.quizId}-${userId}`);

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
    localStorage.removeItem(`uga-quiz-results-${this.quizId}-${userId}`);
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
  private renderQuestion(question: QuizQuestion, forceShowFeedback: boolean = false, overrideResults?: QuizResult | null, overrideResponses?: Record<string, unknown>): unknown {
    const responses = overrideResponses ?? this.responses;
    const results = overrideResults ?? this.results;
    const currentAnswer = responses[question.id];
    const attempt = results?.attempts.find(a => a.questionId === question.id);
    // Show feedback if: (1) quiz is submitted AND showFeedback is enabled AND attempt exists, OR (2) forceShowFeedback is true
    const showFeedback = (this.isSubmitted && this.showFeedback && attempt) || (forceShowFeedback && this.showFeedback && attempt);

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

    // Show completion summary when we don't have full results in memory.
    // Also treat attemptCount > 0 as "completed" so we can try to load feedback from assignment when storage fails.
    // Exclude in-progress quizzes (isStarted) and intentional retakes (isRetaking) so Start/Retake are not trapped.
    const showCompletedBlock = !this.isRetaking && !this.isStarted && ((this.completionStatus === 'passed' || this.completionStatus === 'failed') || (this.attemptCount > 0 && this.showFeedback)) && !this.results;
    if (showCompletedBlock) {
      const persisted = this.showFeedback ? this.getPersistedResults() : null;
      if (persisted) {
        const { results: res, responses: resp } = persisted;
        return html`
          <div class="quiz-container">
            <div class="quiz-results" style="max-width: 800px; margin: 2rem auto; padding: 2rem; border: 1px solid #ddd; border-radius: 8px; background: #fff;">
              <div class="quiz-score ${res.passed ? 'passed' : 'failed'}">
                Score: ${res.pointsEarned}/${res.totalPoints} (${res.percentage.toFixed(1)}%)
              </div>
              <p style="text-align: center; font-size: 1.2rem;">
                ${res.passed ? '✓ Passed!' : '✗ Failed'}
              </p>
              <p style="text-align: center;">Passing score: ${this.passingScore}%</p>
              <h4>Question Review</h4>
              <p style="margin-bottom: 1rem; color: #666;">✓ = correct, ✗ = incorrect</p>
              ${this.parsedQuestions.map((q, index) => {
                const attempt = res.attempts.find(a => a.questionId === q.id);
                const isCorrect = attempt?.isCorrect ?? false;
                const answerText = this.responseToDisplayText(q, resp[q.id]);
                return html`
                  <div class="quiz-question" style="margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #e0e0e0; border-radius: 4px; background: ${isCorrect ? '#f1f8e9' : '#ffebee'};">
                    <p style="margin: 0 0 0.5rem 0;"><strong>${isCorrect ? '✓' : '✗'}</strong> <strong>Question ${index + 1}:</strong> ${q.question}</p>
                    <p style="margin: 0.25rem 0;"><strong>Your Answer:</strong> ${answerText || '—'}</p>
                    <p style="margin: 0.25rem 0;"><strong>Points:</strong> ${attempt?.pointsEarned ?? 0}/${q.points}</p>
                    ${this.renderQuestion(q, true, res, resp)}
                  </div>
                `;
              })}
              ${this.allowRetry && this.attemptCount < this.maxAttempts
                ? html`<button class="quiz-button quiz-button-primary" @click=${this.resetQuiz} style="margin-top: 1rem; width: 100%;">
                    Retake Quiz (Attempt ${this.attemptCount + 1}/${this.maxAttempts})
                  </button>`
                : this.attemptCount >= this.maxAttempts ? html`<p class="quiz-info">Maximum attempts reached.</p>` : ''
              }
            </div>
          </div>
        `;
      }
      // Retry restore and fetch from assignment when about to show minimal view
      if (this.showFeedback && this.feedbackLoadStatus === 'idle') {
        this.feedbackLoadStatus = 'loading';
        queueMicrotask(() => {
          this.restorePreviousResults();
          if (this.results) {
            this.feedbackLoadStatus = 'idle';
            this.requestUpdate();
            return;
          }
          this.fetchFeedbackFromAssignment().then((ok) => {
            if (ok) {
              this.fetchedFeedback = { results: this.results!, responses: this.responses };
              this.feedbackLoadStatus = 'loaded';
            } else {
              this.feedbackLoadStatus = 'failed';
            }
            this.requestUpdate();
          });
        });
      }
      const res = this.fetchedFeedback?.results;
      const resp = this.fetchedFeedback?.responses ?? {};
      return html`
        <div class="quiz-container">
          <div class="quiz-completed" style="max-width: 800px; margin: 0 auto;">
            <h3>Quiz Already Completed</h3>
            <p>You have already completed this quiz.</p>
            ${this.completionStatus === 'passed' 
              ? html`<p class="quiz-status passed">Status: Passed ✓</p>`
              : html`<p class="quiz-status failed">Status: Failed ✗</p>`
            }
            ${this.feedbackLoadStatus === 'loading' ? html`<p style="margin: 1rem 0; color: #666;">Loading feedback…</p>` : ''}
            ${this.feedbackLoadStatus === 'failed' ? html`
              <p style="margin: 1rem 0; color: #666;">Could not load feedback from assignment.</p>
              <button class="quiz-button" @click=${() => { this.feedbackLoadStatus = 'idle'; this.fetchedFeedback = null; this.requestUpdate(); }}>Retry loading feedback</button>
            ` : ''}
            ${res && resp && Object.keys(resp).length > 0 ? html`
              <div style="margin-top: 2rem; text-align: left; border-top: 1px solid #ddd; padding-top: 1.5rem;">
                <h4>Question Review</h4>
                <p style="margin-bottom: 1rem; color: #666;">✓ = correct, ✗ = incorrect</p>
                ${this.parsedQuestions.map((q, index) => {
                  const attempt = res.attempts.find(a => a.questionId === q.id);
                  const isCorrect = attempt?.isCorrect ?? false;
                  const answerText = this.responseToDisplayText(q, resp[q.id]);
                  return html`
                    <div class="quiz-question" style="margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #e0e0e0; border-radius: 4px; background: ${isCorrect ? '#f1f8e9' : '#ffebee'};">
                      <p style="margin: 0 0 0.5rem 0;"><strong>${isCorrect ? '✓' : '✗'}</strong> <strong>Question ${index + 1}:</strong> ${q.question}</p>
                      <p style="margin: 0.25rem 0;"><strong>Your Answer:</strong> ${answerText || '—'}</p>
                      <p style="margin: 0.25rem 0;"><strong>Points:</strong> ${attempt?.pointsEarned ?? 0}/${q.points}</p>
                    </div>
                  `;
                })}
              </div>
            ` : ''}
            ${this.allowRetry && this.attemptCount < this.maxAttempts
              ? html`<button class="quiz-button" @click=${this.resetQuiz} style="margin-top: 1rem;">Retake Quiz</button>`
              : this.attemptCount >= this.maxAttempts ? html`<p class="quiz-info">Maximum attempts reached.</p>` : ''
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
            <h3>${this.displayTitle}</h3>
            <div class="quiz-info">
              <p><strong>Questions:</strong> ${this.parsedQuestions.length}</p>
              <p><strong>Total Points:</strong> ${this.parsedQuestions.reduce((sum, q) => sum + q.points, 0)}</p>
              <p><strong>Passing Score:</strong> ${this.passingScore}%</p>
              ${this.timeLimit > 0 ? html`<p><strong>Time Limit:</strong> ${this.timeLimit} minutes</p>` : ''}
              ${this.allowRetry ? html`<p><strong>Max Attempts:</strong> ${this.maxAttempts}</p>` : html`<p><strong>Attempts:</strong> 1 (no retries)</p>`}
              ${this.attemptCount > 0 ? html`<p><strong>Previous Attempts:</strong> ${this.attemptCount}</p>` : ''}
            </div>
            ${this.attemptCount < this.maxAttempts || !this.allowRetry
              ? html`<button class="quiz-button quiz-button-primary" @click=${this.startQuiz}>Start Quiz</button>`
              : html`<p class="quiz-info">Maximum attempts reached. You cannot start this quiz again.</p>`
            }
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
          <div class="quiz-title">${this.displayTitle}</div>
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

            ${this.showFeedback ? html`
            <h4>Question Review</h4>
            <p style="margin-bottom: 1rem; color: #666;">✓ = correct, ✗ = incorrect</p>
            ${this.parsedQuestions.map((q, index) => {
              const attempt = this.results?.attempts.find(a => a.questionId === q.id);
              const isCorrect = attempt?.isCorrect ?? false;
              const answerText = this.responseToDisplayText(q, this.responses[q.id]);
              return html`
                <div class="quiz-question" style="margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #e0e0e0; border-radius: 4px; background: ${isCorrect ? '#f1f8e9' : '#ffebee'};">
                  <p style="margin: 0 0 0.5rem 0;"><strong>${isCorrect ? '✓' : '✗'}</strong> <strong>Question ${index + 1}:</strong> ${q.question}</p>
                  <p style="margin: 0.25rem 0;"><strong>Your Answer:</strong> ${answerText || '—'}</p>
                  <p style="margin: 0.25rem 0;"><strong>Points:</strong> ${attempt?.pointsEarned ?? 0}/${q.points}</p>
                  ${this.renderQuestion(q, true)}
                </div>
              `;
            })}
            ` : ''}

            ${this.allowRetry && this.attemptCount < this.maxAttempts
              ? html`<button class="quiz-button quiz-button-primary" @click=${this.resetQuiz} style="margin-top: 1rem; width: 100%;">
                  Retake Quiz (Attempt ${this.attemptCount + 1}/${this.maxAttempts})
                </button>`
              : this.attemptCount >= this.maxAttempts ? html`<p class="quiz-info">Maximum attempts reached.</p>` : ''
            }
          </div>
        `}
      </div>
    `;
  }
}
