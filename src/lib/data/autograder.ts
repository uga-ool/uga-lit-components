// Autograding utilities for assignment submissions
// Supports multiple choice, true/false, matching, and short answer questions

export interface AutogradeQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'matching' | 'short-answer';
  question: string;
  points: number;
  correctAnswer?: string | string[]; // For multiple choice, true/false, matching
  correctAnswers?: string[]; // For short answer (multiple acceptable answers)
  options?: string[]; // For multiple choice
  matchingPairs?: Array<{ left: string; right: string }>; // For matching
  caseSensitive?: boolean; // For short answer
}

export interface AutogradeResult {
  questionId: string;
  pointsEarned: number;
  pointsPossible: number;
  correct: boolean;
  feedback?: string;
}

export interface AutogradeSubmission {
  questionId: string;
  answer: string | string[] | Record<string, string>; // string for MC/TF/SA, string[] for multiple, Record for matching
}

/**
 * Grade a single question
 */
export function gradeQuestion(
  question: AutogradeQuestion,
  submission: AutogradeSubmission
): AutogradeResult {
  const { questionId, answer } = submission;

  if (question.id !== questionId) {
    return {
      questionId,
      pointsEarned: 0,
      pointsPossible: question.points,
      correct: false,
      feedback: 'Question ID mismatch'
    };
  }

  switch (question.type) {
    case 'multiple-choice':
      return gradeMultipleChoice(question, answer as string);
    
    case 'true-false':
      return gradeTrueFalse(question, answer as string);
    
    case 'matching':
      return gradeMatching(question, answer as Record<string, string>);
    
    case 'short-answer':
      return gradeShortAnswer(question, answer as string);
    
    default:
      return {
        questionId,
        pointsEarned: 0,
        pointsPossible: question.points,
        correct: false,
        feedback: 'Unknown question type'
      };
  }
}

/**
 * Grade multiple choice question
 */
function gradeMultipleChoice(question: AutogradeQuestion, answer: string): AutogradeResult {
  const correct = answer === question.correctAnswer;
  return {
    questionId: question.id,
    pointsEarned: correct ? question.points : 0,
    pointsPossible: question.points,
    correct,
    feedback: correct ? 'Correct!' : `Incorrect. The correct answer is: ${question.correctAnswer}`
  };
}

/**
 * Grade true/false question
 */
function gradeTrueFalse(question: AutogradeQuestion, answer: string): AutogradeResult {
  const normalizedAnswer = answer.toLowerCase().trim();
  const normalizedCorrect = String(question.correctAnswer).toLowerCase().trim();
  const correct = normalizedAnswer === normalizedCorrect || 
                  (normalizedAnswer === 'true' && normalizedCorrect === 't') ||
                  (normalizedAnswer === 'false' && normalizedCorrect === 'f');
  
  return {
    questionId: question.id,
    pointsEarned: correct ? question.points : 0,
    pointsPossible: question.points,
    correct,
    feedback: correct ? 'Correct!' : `Incorrect. The correct answer is: ${question.correctAnswer}`
  };
}

/**
 * Grade matching question
 */
function gradeMatching(question: AutogradeQuestion, answer: Record<string, string>): AutogradeResult {
  if (!question.matchingPairs) {
    return {
      questionId: question.id,
      pointsEarned: 0,
      pointsPossible: question.points,
      correct: false,
      feedback: 'Matching pairs not defined'
    };
  }

  let correctMatches = 0;
  const totalPairs = question.matchingPairs.length;
  const pointsPerMatch = question.points / totalPairs;

  for (const pair of question.matchingPairs) {
    const studentAnswer = answer[pair.left];
    if (studentAnswer && studentAnswer.trim().toLowerCase() === pair.right.trim().toLowerCase()) {
      correctMatches++;
    }
  }

  const pointsEarned = Math.round(correctMatches * pointsPerMatch * 100) / 100;
  const allCorrect = correctMatches === totalPairs;

  return {
    questionId: question.id,
    pointsEarned,
    pointsPossible: question.points,
    correct: allCorrect,
    feedback: `${correctMatches} out of ${totalPairs} matches correct`
  };
}

/**
 * Grade short answer question
 */
function gradeShortAnswer(question: AutogradeQuestion, answer: string): AutogradeResult {
  if (!question.correctAnswers || question.correctAnswers.length === 0) {
    // If no correct answers defined, can't autograde
    return {
      questionId: question.id,
      pointsEarned: 0,
      pointsPossible: question.points,
      correct: false,
      feedback: 'This question requires manual grading'
    };
  }

  const normalizedAnswer = question.caseSensitive 
    ? answer.trim() 
    : answer.trim().toLowerCase();

  const normalizedCorrect = question.correctAnswers.map(ca => 
    question.caseSensitive ? ca.trim() : ca.trim().toLowerCase()
  );

  const correct = normalizedCorrect.includes(normalizedAnswer);

  return {
    questionId: question.id,
    pointsEarned: correct ? question.points : 0,
    pointsPossible: question.points,
    correct,
    feedback: correct ? 'Correct!' : 'Incorrect. Please review your answer.'
  };
}

/**
 * Grade an entire assignment submission
 */
export function gradeAssignment(
  questions: AutogradeQuestion[],
  submissions: AutogradeSubmission[]
): {
  totalPointsEarned: number;
  totalPointsPossible: number;
  percentage: number;
  results: AutogradeResult[];
  feedback: string;
} {
  const results: AutogradeResult[] = [];
  let totalPointsEarned = 0;
  let totalPointsPossible = 0;

  for (const question of questions) {
    totalPointsPossible += question.points;
    const submission = submissions.find(s => s.questionId === question.id);
    
    if (submission) {
      const result = gradeQuestion(question, submission);
      results.push(result);
      totalPointsEarned += result.pointsEarned;
    } else {
      // No submission for this question
      results.push({
        questionId: question.id,
        pointsEarned: 0,
        pointsPossible: question.points,
        correct: false,
        feedback: 'No answer submitted'
      });
    }
  }

  const percentage = totalPointsPossible > 0 
    ? Math.round((totalPointsEarned / totalPointsPossible) * 100 * 100) / 100 
    : 0;

  const feedback = `You earned ${totalPointsEarned} out of ${totalPointsPossible} points (${percentage}%)`;

  return {
    totalPointsEarned,
    totalPointsPossible,
    percentage,
    results,
    feedback
  };
}
