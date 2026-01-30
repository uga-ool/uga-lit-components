// CSV parser for D2L Brightspace question import format
// Converts D2L CSV format to uga-quiz JSON format

import type { QuizQuestion } from '../../components/uga-quiz.js';
import { QuestionType } from '../../components/uga-quiz.js';

/**
 * D2L CSV question types mapping
 */
enum D2LQuestionType {
  WR = 'WR', // Written Response
  SA = 'SA', // Short Answer
  M = 'M',   // Matching
  MC = 'MC', // Multiple Choice
  TF = 'TF', // True/False
  MS = 'MS', // Multi-Select
  O = 'O'    // Ordering
}

/**
 * Parsed CSV row structure
 */
interface CSVRow {
  col0: string;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
}

/**
 * Current question being parsed
 */
interface CurrentQuestion {
  type?: D2LQuestionType;
  id?: string;
  title?: string;
  questionText?: string;
  points?: number;
  difficulty?: number;
  image?: string;
  options?: Array<{ text: string; weight: number; feedback?: string }>;
  answers?: Array<{ text: string; weight: number; regexp?: boolean }>;
  choices?: Array<{ id: number; text: string }>;
  matches?: Array<{ id: number; text: string }>;
  items?: Array<{ text: string; isHtml: boolean; feedback?: string }>;
  trueFeedback?: string;
  falseFeedback?: string;
  hint?: string;
  feedback?: string;
  initialText?: string;
  answerKey?: string;
  inputBox?: { count: number; width: number };
  scoring?: string;
}

/**
 * Parse CSV content into array of rows
 */
function parseCSV(csvContent: string): CSVRow[] {
  const rows: CSVRow[] = [];
  const lines = csvContent.split('\n');
  
  for (const line of lines) {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('//')) {
      continue;
    }
    
    // Parse CSV line (handling quoted fields)
    const columns: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of column
        columns.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add last column
    columns.push(current.trim());
    
    // Ensure we have at least 5 columns
    while (columns.length < 5) {
      columns.push('');
    }
    
    rows.push({
      col0: columns[0] || '',
      col1: columns[1] || '',
      col2: columns[2] || '',
      col3: columns[3] || '',
      col4: columns[4] || ''
    });
  }
  
  return rows;
}

/**
 * Convert D2L question type to uga-quiz question type
 */
function convertQuestionType(d2lType: D2LQuestionType): QuestionType {
  switch (d2lType) {
    case D2LQuestionType.MC:
      return QuestionType.MULTIPLE_CHOICE;
    case D2LQuestionType.TF:
      return QuestionType.TRUE_FALSE;
    case D2LQuestionType.M:
      return QuestionType.MATCHING;
    case D2LQuestionType.SA:
    case D2LQuestionType.WR:
      return QuestionType.SHORT_ANSWER;
    default:
      // For MS (Multi-Select) and O (Ordering), we'll convert to multiple choice for now
      return QuestionType.MULTIPLE_CHOICE;
  }
}

/**
 * Convert D2L question to uga-quiz format
 */
function convertQuestion(d2lQuestion: CurrentQuestion): QuizQuestion | null {
  if (!d2lQuestion.type || !d2lQuestion.questionText) {
    return null;
  }
  
  const questionType = convertQuestionType(d2lQuestion.type);
  const id = d2lQuestion.id || `q${Date.now()}`;
  const points = d2lQuestion.points || 1;
  
  let correctAnswer: any;
  let options: string[] | undefined;
  let explanation = d2lQuestion.feedback || '';
  
  switch (d2lQuestion.type) {
    case D2LQuestionType.MC:
      // Multiple Choice: find option with weight 100 (or highest weight)
      if (!d2lQuestion.options || d2lQuestion.options.length === 0) {
        return null;
      }
      
      options = d2lQuestion.options.map(opt => opt.text);
      
      // Find correct answer (weight 100 or highest weight)
      let correctIndex = 0;
      let maxWeight = -1;
      for (let i = 0; i < d2lQuestion.options.length; i++) {
        if (d2lQuestion.options[i].weight >= 100) {
          correctIndex = i;
          break;
        }
        if (d2lQuestion.options[i].weight > maxWeight) {
          maxWeight = d2lQuestion.options[i].weight;
          correctIndex = i;
        }
      }
      
      correctAnswer = correctIndex;
      
      // Add option-specific feedback to explanation if available
      if (d2lQuestion.options[correctIndex]?.feedback) {
        explanation = d2lQuestion.options[correctIndex].feedback + (explanation ? ' ' + explanation : '');
      }
      break;
      
    case D2LQuestionType.TF:
      // True/False: check which has weight 100
      // In D2L CSV: TRUE,100,feedback means TRUE is correct
      //             FALSE,100,feedback means FALSE is correct
      if (d2lQuestion.trueFeedback !== undefined && d2lQuestion.trueFeedback !== null) {
        // TRUE is correct (has weight 100)
        correctAnswer = true;
        if (typeof d2lQuestion.trueFeedback === 'string' && d2lQuestion.trueFeedback) {
          explanation = d2lQuestion.trueFeedback + (explanation ? ' ' + explanation : '');
        }
      } else if (d2lQuestion.falseFeedback !== undefined && d2lQuestion.falseFeedback !== null) {
        // FALSE is correct (has weight 100)
        correctAnswer = false;
        if (typeof d2lQuestion.falseFeedback === 'string' && d2lQuestion.falseFeedback) {
          explanation = d2lQuestion.falseFeedback + (explanation ? ' ' + explanation : '');
        }
      } else {
        // Default to true if neither specified (shouldn't happen in valid CSV)
        correctAnswer = true;
      }
      break;
      
    case D2LQuestionType.M:
      // Matching: create object mapping choices to matches
      if (!d2lQuestion.choices || !d2lQuestion.matches) {
        return null;
      }
      
      options = d2lQuestion.matches.map(m => m.text);
      
      // Create mapping object
      const matchingAnswer: { [key: string]: string } = {};
      for (const choice of d2lQuestion.choices) {
        // Find matching match by ID
        const match = d2lQuestion.matches.find(m => m.id === choice.id);
        if (match) {
          matchingAnswer[choice.text] = match.text;
        }
      }
      
      correctAnswer = matchingAnswer;
      break;
      
    case D2LQuestionType.SA:
    case D2LQuestionType.WR:
      // Short Answer / Written Response: use first answer (weight 100) or answerKey
      if (d2lQuestion.answerKey) {
        correctAnswer = d2lQuestion.answerKey;
      } else if (d2lQuestion.answers && d2lQuestion.answers.length > 0) {
        // Find answer with weight 100
        const correctAnswerObj = d2lQuestion.answers.find(a => a.weight >= 100) || d2lQuestion.answers[0];
        correctAnswer = correctAnswerObj.text;
      } else {
        return null;
      }
      break;
      
    default:
      // Multi-Select and Ordering not fully supported yet
      return null;
  }
  
  const quizQuestion: QuizQuestion = {
    id,
    type: questionType,
    question: d2lQuestion.questionText,
    points,
    correctAnswer,
    explanation: explanation || undefined
  };
  
  if (options) {
    quizQuestion.options = options;
  }
  
  // For short answer, check if case sensitive (default to false)
  if (questionType === QuestionType.SHORT_ANSWER) {
    quizQuestion.caseSensitive = false;
  }
  
  return quizQuestion;
}

/**
 * Parse D2L CSV format and convert to uga-quiz JSON format
 */
export function parseD2LCSV(csvContent: string): { questions: QuizQuestion[] } {
  const rows = parseCSV(csvContent);
  const questions: QuizQuestion[] = [];
  let currentQuestion: CurrentQuestion | null = null;
  
  for (const row of rows) {
    const col0 = row.col0.trim();
    const col1 = row.col1.trim();
    const col2 = row.col2.trim();
    const col3 = row.col3.trim();
    const col4 = row.col4.trim();
    
    // Check for new question
    if (col0 === 'NewQuestion' && col1) {
      // Save previous question if exists
      if (currentQuestion) {
        const converted = convertQuestion(currentQuestion);
        if (converted) {
          questions.push(converted);
        }
      }
      
      // Start new question
      currentQuestion = {
        type: col1 as D2LQuestionType
      };
      continue;
    }
    
    if (!currentQuestion) {
      continue; // Skip rows before first question
    }
    
    // Parse question properties
    switch (col0) {
      case 'ID':
        currentQuestion.id = col1;
        break;
      case 'Title':
        currentQuestion.title = col1;
        break;
      case 'QuestionText':
        currentQuestion.questionText = col1;
        break;
      case 'Points':
        currentQuestion.points = parseInt(col1) || 1;
        break;
      case 'Difficulty':
        currentQuestion.difficulty = parseInt(col1) || 1;
        break;
      case 'Image':
        currentQuestion.image = col1;
        break;
      case 'Hint':
        currentQuestion.hint = col1;
        break;
      case 'Feedback':
        currentQuestion.feedback = col1;
        break;
      case 'InitialText':
        currentQuestion.initialText = col1;
        break;
      case 'AnswerKey':
        currentQuestion.answerKey = col1;
        break;
      case 'InputBox':
        currentQuestion.inputBox = {
          count: parseInt(col1) || 1,
          width: parseInt(col2) || 40
        };
        break;
      case 'Scoring':
        currentQuestion.scoring = col1;
        break;
      case 'Option':
        // Multiple Choice option
        if (!currentQuestion.options) {
          currentQuestion.options = [];
        }
        const weight = parseInt(col1) || 0;
        const optionText = col2;
        const optionFeedback = col4;
        currentQuestion.options.push({
          text: optionText,
          weight,
          feedback: optionFeedback || undefined
        });
        break;
      case 'Answer':
        // Short Answer answer
        if (!currentQuestion.answers) {
          currentQuestion.answers = [];
        }
        const answerWeight = parseInt(col1) || 0;
        const answerText = col2;
        const isRegexp = col3 === 'regexp';
        currentQuestion.answers.push({
          text: answerText,
          weight: answerWeight,
          regexp: isRegexp
        });
        break;
      case 'Choice':
        // Matching choice
        if (!currentQuestion.choices) {
          currentQuestion.choices = [];
        }
        const choiceId = parseInt(col1) || currentQuestion.choices.length + 1;
        const choiceText = col2;
        currentQuestion.choices.push({
          id: choiceId,
          text: choiceText
        });
        break;
      case 'Match':
        // Matching match
        if (!currentQuestion.matches) {
          currentQuestion.matches = [];
        }
        const matchId = parseInt(col1) || currentQuestion.matches.length + 1;
        const matchText = col2;
        currentQuestion.matches.push({
          id: matchId,
          text: matchText
        });
        break;
      case 'TRUE':
        // True/False TRUE option
        const trueWeight = parseInt(col1) || 0;
        if (trueWeight === 100) {
          currentQuestion.trueFeedback = col2 || '';
        }
        break;
      case 'FALSE':
        // True/False FALSE option
        const falseWeight = parseInt(col1) || 0;
        if (falseWeight === 100) {
          currentQuestion.falseFeedback = col2 || '';
        }
        break;
      case 'Item':
        // Ordering item
        if (!currentQuestion.items) {
          currentQuestion.items = [];
        }
        const itemText = col1;
        const isHtml = col2 === 'HTML';
        const itemFeedback = col3;
        currentQuestion.items.push({
          text: itemText,
          isHtml,
          feedback: itemFeedback || undefined
        });
        break;
    }
  }
  
  // Don't forget the last question
  if (currentQuestion) {
    const converted = convertQuestion(currentQuestion);
    if (converted) {
      questions.push(converted);
    }
  }
  
  return { questions };
}

// Note: loadCSVFile removed - components should use axios.get() directly
// and pass the content to parseD2LCSV()
