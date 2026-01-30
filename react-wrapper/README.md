# React Wrapper for uga-quiz Component

This directory contains a React wrapper component and example app for embedding the `uga-quiz` LitElement web component in React applications.

## Quick Start

### Option 1: Use the React Wrapper Component

1. **Copy the wrapper component** (`UgaQuiz.tsx`) into your React project

2. **Load the web component bundle** in your HTML:

   ```html
   <script type="module" src="/path/to/uga-components.js"></script>
   ```

3. **Use the component in your React app**:

   ```tsx
   import { UgaQuiz } from "./UgaQuiz";

   function MyQuizPage() {
     return (
       <UgaQuiz
         quizId="my-quiz"
         quizTitle="My Quiz"
         gradeObjectName="Quiz 1"
         apiEndpoint="https://api.example.com/api/quiz/submit"
         passingScore={70}
         onQuizComplete={(result) => {
           console.log("Quiz completed:", result);
         }}
       />
     );
   }
   ```

### Option 2: Use the Web Component Directly

You can also use the web component directly in React without the wrapper:

```tsx
function MyQuizPage() {
  return (
    <uga-quiz
      quiz-id="my-quiz"
      quiz-title="My Quiz"
      grade-object-name="Quiz 1"
      api-endpoint="https://api.example.com/api/quiz/submit"
      passing-score={70}
    />
  );
}
```

**Note:** When using the web component directly, you'll need to:

- Use kebab-case for attributes (e.g., `quiz-id` instead of `quizId`)
- Handle events via DOM event listeners
- TypeScript won't have full type checking

## Props

The `UgaQuiz` component accepts the following props:

| Prop                 | Type                           | Default     | Description                                 |
| -------------------- | ------------------------------ | ----------- | ------------------------------------------- |
| `quizId`             | `string`                       | `''`        | Unique identifier for the quiz              |
| `quizTitle`          | `string`                       | `''`        | Display title for the quiz                  |
| `questions`          | `string`                       | `''`        | JSON string of quiz questions               |
| `gradeObjectName`    | `string`                       | `''`        | Name of gradebook item for tracking         |
| `apiEndpoint`        | `string`                       | `''`        | External API endpoint for submitting grades |
| `passingScore`       | `number`                       | `70`        | Percentage required to pass                 |
| `allowRetry`         | `boolean`                      | `true`      | Allow students to retake the quiz           |
| `maxAttempts`        | `number`                       | `3`         | Maximum number of attempts                  |
| `showFeedback`       | `boolean`                      | `true`      | Show immediate feedback after answering     |
| `allowReset`         | `boolean`                      | `false`     | Allow manual reset (for instructors)        |
| `randomizeQuestions` | `boolean`                      | `false`     | Randomize question order                    |
| `timeLimit`          | `number`                       | `0`         | Time limit in minutes (0 = no limit)        |
| `autoSubmit`         | `boolean`                      | `false`     | Auto-submit when time expires               |
| `type`               | `'local' \| 'inline' \| 'csv'` | `'inline'`  | How to load questions                       |
| `filename`           | `string`                       | `''`        | Filename if type is 'local' or 'csv'        |
| `className`          | `string`                       | `undefined` | CSS class name                              |
| `style`              | `React.CSSProperties`          | `undefined` | Inline styles                               |
| `onQuizComplete`     | `(result) => void`             | `undefined` | Callback when quiz is completed             |
| `onGradebookSave`    | `(status, message) => void`    | `undefined` | Callback for gradebook save status          |

## Event Handlers

### `onQuizComplete`

Called when a student completes the quiz:

```tsx
onQuizComplete={(result) => {
  console.log('Points earned:', result.pointsEarned);
  console.log('Total points:', result.totalPoints);
  console.log('Percentage:', result.percentage);
  console.log('Passed:', result.passed);
  console.log('Attempt:', result.attemptCount);
}}
```

### `onGradebookSave`

Called when gradebook save status changes:

```tsx
onGradebookSave={(status, message) => {
  if (status === 'success') {
    console.log('Grade saved successfully!');
  } else if (status === 'error') {
    console.error('Error saving grade:', message);
  }
}}
```

## Example: Embedding in a React App

```tsx
import React, { useState } from "react";
import { UgaQuiz } from "./UgaQuiz";

function QuizPage() {
  const [result, setResult] = useState(null);

  return (
    <div>
      <h1>My Quiz</h1>
      <UgaQuiz
        quizId="quiz-1"
        quizTitle="Introduction Quiz"
        gradeObjectName="Introduction Quiz"
        apiEndpoint="https://api.example.com/api/quiz/submit"
        passingScore={70}
        onQuizComplete={(result) => {
          setResult(result);
          // Send to your analytics, update UI, etc.
        }}
      />
      {result && (
        <div>
          <h2>Results</h2>
          <p>
            Score: {result.pointsEarned} / {result.totalPoints}
          </p>
          <p>Percentage: {result.percentage.toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
}
```

## Example: Standalone React App

See the `example/` directory for a complete standalone React app example.

To run the example:

```bash
cd example
npm install
npm start
```

Make sure to:

1. Update the path to `uga-components.js` in `index.html`
2. Set `REACT_APP_API_ENDPOINT` environment variable if using external API

## TypeScript Support

The wrapper includes full TypeScript type definitions. Import types:

```tsx
import { UgaQuizProps } from "./UgaQuiz";

const props: UgaQuizProps = {
  quizId: "my-quiz",
  // ... other props
};
```

## Styling

The component uses UGA's base CSS. Make sure to include it:

```html
<link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
```

You can also add custom styles via the `className` or `style` props:

```tsx
<UgaQuiz
  className="my-custom-quiz"
  style={{ margin: "2rem 0" }}
  // ... other props
/>
```

## Integration with React Router

The component works seamlessly with React Router:

```tsx
import { Route } from "react-router-dom";
import { UgaQuiz } from "./UgaQuiz";

function App() {
  return <Route path="/quiz/:quizId" component={QuizPage} />;
}

function QuizPage({ match }) {
  return (
    <UgaQuiz
      quizId={match.params.quizId}
      // ... other props
    />
  );
}
```

## Building for Production

1. Build the web component bundle:

   ```bash
   npm run build
   ```

2. Copy `dist/js/uga-components.js` to your React app's public folder

3. Reference it in your HTML:

   ```html
   <script type="module" src="/uga-components.js"></script>
   ```

4. Build your React app as usual

## Troubleshooting

### Component not rendering

- Make sure `uga-components.js` is loaded **before** your React app
- Check browser console for errors
- Verify the component is registered: `customElements.get('uga-quiz')`

### TypeScript errors

- Make sure you have `@types/react` installed
- Check that the component props match the expected types

### Events not firing

- The wrapper uses MutationObserver to detect changes
- For more reliable event handling, consider using custom events emitted by the component

## Next Steps

- See the main README.md for component documentation
- Check `api-service/README.md` for API setup instructions
- Review `demo/quiz.html` for more usage examples
