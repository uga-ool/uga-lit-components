# Using an eLC Assignment to Collect Quiz Submissions (Audits & Tracking)

The **uga-quiz** component is a **standalone Lit component** used as embedded HTML. It has **no association with eLC’s native quiz tool**; it is a custom formative quiz that lives in HTML content. When results need to be recorded, they are submitted to an eLC **Assignment** (Dropbox).

Use an assignment with **All submissions are kept** (unlimited uploads) so every attempt is recorded for audits and tracking by students and teachers.

**Quiz questions:** The quiz loads questions from a JSON file. Set `type="local"` and `filename="your-quiz.json"` on the component. See [QUIZ_JSON_FORMAT.md](QUIZ_JSON_FORMAT.md) for the JSON format and usage.

## Why use an assignment?

- **Audits and tracking**: With **All submissions are kept**, every quiz attempt becomes a separate submission. Students and instructors can see full history in **Assignments**.
- **Students can submit**: Learners typically have permission to submit to assignments, so quiz data is collected in one place.
- **Single place for data**: All quiz results appear in the assignment; instructors see them like any other submission.
- **Structured data**: Each submission includes a JSON payload (score, attempt, timestamp, responses) in the comment and, for file submissions, as an attached file.
- **Works with Text or File submission**: If the assignment is **Text submission**, the component sends the full result in the submission comment. If **File submission** or **File or Text**, it sends a file plus the comment.

## Setup

The instructor **creates the assignment in eLC** (Assignments). Students do not create assignments; they only submit to an existing assignment. Use **dropbox-assignment-name** (exact title) or **dropbox-folder-id** so the component knows where to submit.

### 1. Create an assignment in the course (instructor, in eLC)

In eLC:

1. **Assignments** → **New Assignment**
2. Set **Assignment Title** (e.g. “Quiz Demo” or “Formative Quiz 1 – Results”).
3. Under **Submission & Completion**:
   - **Submissions**: choose **All submissions are kept** so every quiz attempt is recorded for audits and tracking.
   - **Submission Type**: **File submission** or **File or Text** (recommended for a downloadable JSON file), or **Text submission** (the component will send the full result in the submission comment).
4. **Make the assignment visible** to students (e.g. under **Restrictions** or **Visibility**). If the assignment is hidden, the quiz component cannot find it in the API and student submissions will not pass through.
5. Save. To use by ID, note the **assignment (folder) ID** from the URL or API.

To get the folder ID: open the assignment, then check the URL or use the API:

- `GET /d2l/api/le/{version}/{orgUnitId}/dropbox/folders/`  
  Find the folder whose `Name` matches your assignment; use its `Id` as the folder ID.

### 2. Add the attribute to uga-quiz

**By name** (recommended): set **dropbox-assignment-name** to the **exact** assignment title:

```html
<uga-quiz
  quiz-id="formative-quiz-1"
  quiz-title="Formative Quiz 1"
  dropbox-assignment-name="Quiz Demo"
  ...
>
</uga-quiz>
```

**By ID:** set **dropbox-folder-id** to the assignment’s folder ID (e.g. `12345678`) instead of **dropbox-assignment-name**.

### 3. Automating submission to the gradebook (instructor)

To push quiz results from the assignment into the eLC gradebook without manual entry:

1. **Link the assignment to a grade item** in eLC: open the assignment → **Edit** → **Grade** (or **Evaluation & Feedback** → **Grade**). Create or select a grade item so the assignment is tied to that gradebook column.
2. **Add the grade-sync component** to the same content page as the quiz (e.g. inside an instructor note or below the quiz):  
   `<uga-quiz-grade-sync dropbox-assignment-name="Quiz Demo 2"></uga-quiz-grade-sync>`  
   or `<uga-quiz-grade-sync dropbox-folder-id="FOLDER_ID"></uga-quiz-grade-sync>`  
   Use **dropbox-assignment-name** (exact assignment title) or **dropbox-folder-id** (from the assignment URL `db=...`). This component is visible only to instructors.
3. **Run the sync:** When logged in as an instructor, open the page and click **Sync quiz grades to gradebook**. The component reads all quiz submissions for that assignment and writes each student’s score into the linked grade item. **When synced, the most recent submission grade overwrites any current grade** for that student in that grade item. Run it whenever new submissions have come in.

There is no separate eLC setting to automate this—the one-click sync is the automation. Only instructors can run it; students do not write to the gradebook.

## What gets submitted

Each time a user completes the quiz, the component submits to the assignment:

- **Comment** (always): A one-line summary plus the **full quiz result JSON** (for audits and for **Text submission** assignments). Example summary: “Formative Quiz 1: 27/55 (49.1%) – Failed – Attempt 2”.
- **File** (when the assignment allows file submission): `quiz-result-{quizId}-attempt-{attemptCount}.json` containing the same JSON.

The JSON includes: `quizId`, `quizTitle`, `gradeObjectName`, `pointsEarned`, `totalPoints`, `percentage`, `passed`, `attemptCount`, `timestamp`, `userId`, `displayName`, and `responses` (question-by-question answers).

## API used

The component calls the eLC Dropbox “my submissions” endpoint:

- **Endpoint**: `POST /d2l/api/le/{version}/{orgUnitId}/dropbox/folders/{folderId}/submissions/mysubmissions/`
- **Body**: `multipart/mixed` with:
  1. A JSON part: submission comment (RichText: `Text`, `Html`).
  2. A file part: the quiz result JSON (required by the API).

Scope used: **dropbox:folders:write** (same as “submit to assignment”). Students are usually allowed to submit to assignments, so this works for them.

## Flow

1. Student completes the quiz in the browser.
2. If `dropbox-folder-id` or `dropbox-assignment-name` is set, the component builds the quiz result JSON and comment and submits (file + comment, or comment-only for Text submission assignments).
3. eLC creates a new submission in that assignment with the comment (and file when allowed). With **All submissions are kept**, each attempt is a separate submission for audits.
4. Instructor and student see submissions under **Assignments**; the comment and optional file contain the full result for tracking.

## Using the collected data

- **Manual**: Open each submission in Assignments and read the comment or attached JSON file.
- **Bulk**: Use the eLC APIs to list submissions and download files:
  - `GET .../dropbox/folders/{folderId}/submissions/paged/`
  - `GET .../dropbox/folders/{folderId}/submissions/{submissionId}/files/{fileId}/`

## Troubleshooting: Submissions not showing

If a student completes a quiz but their submission does not appear in the assignment:

1. **Check `dropbox-assignment-name`** – The quiz must have `dropbox-assignment-name` (or `dropbox-folder-id`) set. Without it, no submission is attempted. Inspect the quiz HTML in eLC and ensure the attribute matches your assignment title exactly (including spaces and capitalization).

2. **Assignment name must match exactly** – `dropbox-assignment-name` is matched against the eLC assignment title. "Quiz 20" ≠ "quiz20" ≠ "Quiz20". Use the exact title from eLC Assignments.

3. **Assignment must be visible** – If the assignment is hidden from students, the API may not return it and the component cannot find it. Make the assignment visible (e.g. under Restrictions) before students take the quiz.

4. **Check the completion screen** – After submitting, the quiz shows "✓ Results submitted to assignment" on success, or "✗ Could not submit to assignment" with an error message on failure. Ask the student what they saw.

5. **Use `dropbox-folder-id` if name lookup fails** – Open the assignment in eLC; the URL contains `db=` followed by the folder ID. Set `dropbox-folder-id="12345"` (use the actual ID) instead of `dropbox-assignment-name` to bypass name lookup.

## Troubleshooting: Feedback not showing after quiz

If students complete a quiz but see "Quiz Already Completed" without the question review (✓/✗ per question):

1. **Add `quiz-id`, `quiz-title`, or `filename`** – The component needs a stable ID to save and load results. You can use any of:
   - `quiz-id` (explicit, recommended)
   - `quiz-title` (derives ID from normalized title)
   - `filename` (derives ID from the JSON filename, e.g. `quiz10.json` → `quiz10`)
   Without any of these, the component falls back to a generated ID that can differ between loads, so saved feedback may not be found.

2. **Set `show-feedback="true"`** – The question review only appears when this attribute is set (it defaults to true, but ensure it is not overridden).

3. **Check the browser console** – Look for messages like "quizId was empty (no quizTitle)" or "Could not persist quiz results to localStorage". These indicate the cause.

## Summary

| Goal                          | Use                                                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audits and tracking           | Instructor creates assignment in eLC with **All submissions are kept**; set `dropbox-assignment-name` or `dropbox-folder-id` on the quiz.                |
| Point quiz at your assignment | Use `dropbox-assignment-name="Quiz Demo"` (exact title) or `dropbox-folder-id` with the folder ID. Students only submit; they do not create assignments. |
| **Automate grades in gradebook** | Link the assignment to a grade item in eLC; add `<uga-quiz-grade-sync dropbox-assignment-name="Quiz Demo 2">` (or `dropbox-folder-id="FOLDER_ID"`) below the quiz; instructors click **Sync quiz grades to gradebook** to push scores from submissions into the gradebook. The most recent grade overwrites any current grade per student. |
| Text submission assignment    | Supported: full result is sent in the submission comment.                                                                                                |
| File submission assignment   | Supported: comment + JSON file attached.                                                                                                                 |
