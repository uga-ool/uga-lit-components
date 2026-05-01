# Quiz Component: Using a JSON File

The **uga-quiz** component is a standalone Lit component used as embedded HTML. It has no association with eLC’s native quiz tool. It loads questions from a JSON file. This guide explains the JSON format and how to use it.

## Quick Start

1. **Create a JSON file** with a `questions` array (see format below).
2. **Upload the file** to your eLC course (same folder as your HTML page, or a path you can reference).
3. **Add the quiz component** to your HTML with `type="local"` and `filename` pointing to your file:

```html
<uga-quiz
  quiz-id="my-quiz"
  quiz-title="My Quiz"
  passing-score="70"
  type="local"
  filename="my-quiz.json"
>
</uga-quiz>
```

**Important:** `type="local"` and `filename` are required when using a JSON file. Use a relative path from the HTML page (e.g. `quiz/quiz-sample.json` when the JSON sits under `quiz/` next to the page), or a full path (e.g. `/shared/PublicFiles/my-quiz.json`) if stored in eLC Public Files.

## JSON File Structure

The JSON file must have a top-level `questions` array. An optional `title` field provides the quiz title (avoids duplicating it in the HTML `quiz-title` attribute). Each question is an object with required and optional fields:

```json
{
  "title": "My Quiz",
  "questions": [
    {
      "id": "Q1",
      "type": "multiple-choice",
      "question": "Your question text here",
      "points": 10,
      "options": ["Option A", "Option B", "Option C"],
      "correctAnswer": 0,
      "explanation": "Optional feedback shown after answering"
    }
  ]
}
```

### Required Fields (all question types)

| Field           | Type   | Description                                                |
| --------------- | ------ | ---------------------------------------------------------- |
| `id`            | string | Unique identifier for the question (e.g. "Q1", "QUIZ-001") |
| `type`          | string | Question type (see below)                                  |
| `question`      | string | The question text                                          |
| `points`        | number | Points for a correct answer                                |
| `correctAnswer` | varies | Correct answer format depends on question type             |

### Optional Fields

| Field           | Type    | Description                                                                |
| --------------- | ------- | -------------------------------------------------------------------------- |
| `explanation`   | string  | Feedback shown after the student answers                                   |
| `options`       | array   | Required for multiple-choice, true-false, multi-select, matching, ordering |
| `caseSensitive` | boolean | For short-answer only; default `false`                                     |

## Question Types and correctAnswer Format

| Type                | correctAnswer          | options                | Example                                          |
| ------------------- | ---------------------- | ---------------------- | ------------------------------------------------ |
| **multiple-choice** | number (0-based index) | Array of choices       | `0` = first option is correct                    |
| **true-false**      | 0 or 1                 | `["True","False"]`     | `0` = True, `1` = False                          |
| **short-answer**    | string                 | Not used               | `"Learning Management System"`                   |
| **multi-select**    | array of indices       | Array of choices       | `[0, 2]` = first and third options correct       |
| **ordering**        | `[0,1,2,...]`          | Array in correct order | `[0,1,2,3]` = options already in correct order   |
| **matching**        | object                 | Array of match options | `{"Choice A": "Match 1", "Choice B": "Match 2"}` |

## Complete Examples

### Multiple Choice

```json
{
  "id": "Q1",
  "type": "multiple-choice",
  "question": "What is the capital of Georgia?",
  "points": 10,
  "options": ["Atlanta", "Augusta", "Savannah", "Macon"],
  "correctAnswer": 0,
  "explanation": "Atlanta has been the state capital since 1868."
}
```

### True/False

```json
{
  "id": "Q2",
  "type": "true-false",
  "question": "The University of Georgia is located in Athens.",
  "points": 10,
  "options": ["True", "False"],
  "correctAnswer": 0,
  "explanation": "UGA's main campus is in Athens, Georgia."
}
```

### Short Answer

```json
{
  "id": "Q3",
  "type": "short-answer",
  "question": "What does LMS stand for?",
  "points": 10,
  "correctAnswer": "Learning Management System",
  "explanation": "LMS stands for Learning Management System.",
  "caseSensitive": false
}
```

### Multi-Select

```json
{
  "id": "Q4",
  "type": "multi-select",
  "question": "Which are primary colors? (Select all that apply.)",
  "points": 15,
  "options": ["Red", "Yellow", "Blue", "Green"],
  "correctAnswer": [0, 2],
  "explanation": "Primary colors (RYB) are Red, Blue, and Yellow."
}
```

### Ordering

```json
{
  "id": "Q5",
  "type": "ordering",
  "question": "Put these steps in the correct order:",
  "points": 15,
  "options": [
    "Open Assignments",
    "Find the assignment",
    "Upload your file",
    "Click Submit"
  ],
  "correctAnswer": [0, 1, 2, 3],
  "explanation": "Order: Open → Find → Upload → Submit."
}
```

### Matching

```json
{
  "id": "Q6",
  "type": "matching",
  "question": "Match the term with its description:",
  "points": 15,
  "options": [
    "Used during learning",
    "Used at the end",
    "Used to measure skills"
  ],
  "correctAnswer": {
    "Formative": "Used during learning",
    "Summative": "Used at the end",
    "Diagnostic": "Used to measure skills"
  },
  "explanation": "Formative=during; Summative=end; Diagnostic=skills."
}
```

## File Location and Paths

- **Relative to HTML:** Use `filename="quiz/quiz-sample.json"` when organized in a subfolder, or `filename="my-quiz.json"` when the file sits next to the page.
- **eLC Public Files:** Use `filename="/shared/PublicFiles/my-quiz.json"` (full path).
- **Course content folder:** Use the path relative to your HTML (e.g. `filename="../files/my-quiz.json"`).

**Tip:** Upload the JSON file to the same folder as your content page so the relative path works. If the quiz shows "JSON file not found," check that the path is correct and the file is uploaded.

## Sample Files

- **demo/quiz/quiz-sample.json** – All six question types (multiple-choice, true-false, short-answer, matching, multi-select, ordering)
- **demo/quiz/quiz10.json** – Multiple-choice only (4 questions)
- **demo/quiz/quiz20.json** – Multiple-choice only (8 questions)
- **demo/quiz/quiz-sample.csv** – Same six question types in eLC question-import CSV format (use with `type="csv"`)

## Using an eLC CSV file directly

You can skip the JSON conversion entirely and load an eLC question-import CSV with `type="csv"`:

```html
<uga-quiz
  quiz-id="my-quiz"
  quiz-title="My Quiz"
  passing-score="70"
  type="csv"
  filename="quiz/quiz-sample.csv">
</uga-quiz>
```

The CSV must follow eLC's question-import layout: each question is a block of rows starting with `NewQuestion,<type>` (`MC`, `TF`, `SA`/`WR`, `M`, `MS`, `O`) and including `QuestionText`, `Points`, and the type-specific rows (`Option`, `TRUE`/`FALSE`, `Answer`, `Choice`/`Match`, `Item`). Lines beginning with `//` are treated as comments. See `demo/quiz/quiz-sample.csv` for a complete template covering all six types.

## Converting from CSV (optional)

If you would rather store JSON in your course files, you can convert eLC CSV to JSON with the included script:

```bash
npx tsx scripts/csv-to-json.ts path/to/quiz.csv path/to/output.json
```

Both `type="csv"` (read CSV at runtime) and converting to JSON ahead of time produce the same quiz UI.

## See Also

- [Quiz demo](demo/quiz.html) – Full usage examples and options
- [D2L Quiz Dropbox](D2L_QUIZ_DROPBOX.md) – Submitting quiz results to an eLC assignment
