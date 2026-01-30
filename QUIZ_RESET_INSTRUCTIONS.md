# How to Reset Quiz Attempts

This guide explains how to reset quiz attempts for students who have reached their maximum attempts or need to retake the quiz.

## Method 1: Using the Reset Button (Recommended)

If you've enabled the reset feature, instructors can reset attempts directly from the quiz interface:

1. **Enable Reset Feature:**
   Add `allow-reset="true"` to your quiz component:
   ```html
   <uga-quiz 
     quiz-id="quiz-1"
     quiz-title="Formative Quiz"
     type="csv"
     filename="quiz-sample.csv"
     grade-object-name="Formative Quiz 1"
     allow-reset="true">
   </uga-quiz>
   ```

2. **Reset from Quiz Interface:**
   - When viewing a completed quiz, click the "Reset All Attempts (Instructor Only)" button
   - This will:
     - Clear localStorage attempt tracking
     - Clear the gradebook entry (if `grade-object-name` is set)
     - Reset the quiz to allow new attempts

## Method 2: Manual Reset via Browser Console

If you need to reset for a specific student:

1. **Open Browser Console:**
   - Press F12 (or right-click → Inspect)
   - Go to the "Console" tab

2. **Clear localStorage:**
   ```javascript
   // Replace 'quiz-1' with your actual quiz-id
   // Replace 'USER_ID' with the student's user identifier
   const quizId = 'quiz-1';
   const userId = 'USER_ID'; // Get from gradebook or enrollment
   const storageKey = `uga-quiz-attempts-${quizId}-${userId}`;
   localStorage.removeItem(storageKey);
   console.log('✅ Cleared localStorage for quiz attempts');
   ```

3. **Clear Gradebook Entry:**
   - Go to your course Gradebook
   - Find the gradebook item (e.g., "Formative Quiz 1")
   - Find the student's row
   - Delete or clear their grade entry
   - Save changes

## Method 3: Reset via Gradebook (Recommended for Multiple Students)

1. **Go to Gradebook:**
   - Navigate to: Course → Grades → Enter Grades

2. **Select the Grade Item:**
   - Click on the gradebook item (e.g., "Formative Quiz 1")

3. **Clear Grades:**
   - Select the student(s) whose grades you want to clear
   - Delete the grade entry (set to blank/null)
   - Save changes

4. **Clear Browser Storage (if needed):**
   - Have the student clear their browser's localStorage:
     - Open browser console (F12)
     - Run: `localStorage.clear()` (clears ALL localStorage - use with caution)
     - Or use the specific key method from Method 2

## Method 4: Reset All Attempts for a Quiz (JavaScript)

Run this in the browser console to reset all attempts for a specific quiz:

```javascript
// Replace 'quiz-1' with your actual quiz-id
const quizId = 'quiz-1';
const keys = Object.keys(localStorage);
keys.forEach(key => {
  if (key.startsWith(`uga-quiz-attempts-${quizId}-`)) {
    localStorage.removeItem(key);
    console.log(`✅ Cleared: ${key}`);
  }
});
console.log('✅ All attempts cleared for quiz:', quizId);
```

## Method 5: Reset via Component Attribute

You can also temporarily change `max-attempts` to allow more attempts:

```html
<!-- Temporarily increase max attempts -->
<uga-quiz 
  quiz-id="quiz-1"
  max-attempts="10"
  ...>
</uga-quiz>
```

Then change it back after the student completes the quiz.

## Important Notes

1. **Gradebook Integration:**
   - If `grade-object-name` is set, you must clear the gradebook entry for the reset to work completely
   - The component checks the gradebook on load to determine completion status

2. **localStorage:**
   - Attempts are stored in browser localStorage
   - Each student's attempts are tracked separately
   - Clearing localStorage will reset attempts for that specific browser/device

3. **Multiple Devices:**
   - If a student uses multiple devices, you may need to clear localStorage on each device
   - Or clear the gradebook entry, which will reset the quiz regardless of device

4. **Instructor vs Student:**
   - The `allow-reset` feature should only be enabled for instructor/admin views
   - Students should not have access to reset buttons

## Troubleshooting

**Problem:** Student still sees "Maximum attempts reached" after clearing gradebook
- **Solution:** Clear browser localStorage (Method 2) or have student clear their browser cache

**Problem:** Reset button doesn't appear
- **Solution:** Make sure `allow-reset="true"` is set on the component

**Problem:** Grade still shows in gradebook after reset
- **Solution:** Manually delete the grade entry in the gradebook (Method 3)

## Best Practice

For production use:
1. Use `allow-reset="true"` only on instructor/admin pages
2. Clear gradebook entries manually for accurate records
3. Document when and why resets were performed
4. Consider using D2L's built-in quiz reset features for official records
