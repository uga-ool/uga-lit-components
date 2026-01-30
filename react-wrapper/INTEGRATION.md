# Integration Guide: Using uga-quiz in React

This guide explains how to embed the `uga-quiz` component in React applications.

## Overview

The `uga-quiz` component is a **LitElement web component**, which means it can be used in **any framework** including React, Vue, Angular, or plain HTML. Web components are framework-agnostic and work everywhere.

## Two Approaches

### Approach 1: React Wrapper Component (Recommended)

Use the provided `UgaQuiz.tsx` wrapper component for:

- ✅ Full TypeScript support
- ✅ React-friendly props (camelCase)
- ✅ Event handlers as callbacks
- ✅ Better IDE autocomplete

### Approach 2: Direct Web Component Usage

Use the web component directly for:

- ✅ Simpler setup (no wrapper needed)
- ✅ Smaller bundle size
- ⚠️ Less TypeScript support
- ⚠️ Need to use kebab-case attributes

## Setup Steps

### 1. Load the Web Component Bundle

**Critical:** The web component bundle must be loaded **before** your React app initializes.

#### Option A: In your HTML file

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
  </head>
  <body>
    <div id="root"></div>

    <!-- Load web component bundle FIRST -->
    <script type="module" src="/path/to/uga-components.js"></script>

    <!-- Then load React app -->
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

#### Option B: In your React app entry point

```tsx
// src/main.tsx
import "/path/to/uga-components.js"; // Import before React
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### 2. Use the Component

#### With React Wrapper (Recommended)

```tsx
import { UgaQuiz } from "./UgaQuiz";

function App() {
  return (
    <UgaQuiz
      quizId="my-quiz"
      quizTitle="My Quiz"
      gradeObjectName="Quiz 1"
      apiEndpoint="https://api.example.com/api/quiz/submit"
      passingScore={70}
      onQuizComplete={(result) => {
        console.log("Quiz completed!", result);
      }}
    />
  );
}
```

#### Direct Web Component Usage

```tsx
function App() {
  const quizRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const quiz = quizRef.current;
    if (!quiz) return;

    const handleComplete = () => {
      console.log("Quiz completed!");
    };

    quiz.addEventListener("quiz-complete", handleComplete);
    return () => quiz.removeEventListener("quiz-complete", handleComplete);
  }, []);

  return (
    <uga-quiz
      ref={quizRef}
      quiz-id="my-quiz"
      quiz-title="My Quiz"
      grade-object-name="Quiz 1"
      api-endpoint="https://api.example.com/api/quiz/submit"
      passing-score={70}
    />
  );
}
```

## Complete Example: Create React App

### 1. Create a new React app

```bash
npx create-react-app my-quiz-app --template typescript
cd my-quiz-app
```

### 2. Copy the web component bundle

```bash
# Copy uga-components.js to public folder
cp /path/to/uga-lit-components/dist/js/uga-components.js public/
```

### 3. Update `public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
    <title>My Quiz App</title>
  </head>
  <body>
    <div id="root"></div>

    <!-- Load web component bundle -->
    <script type="module" src="%PUBLIC_URL%/uga-components.js"></script>
  </body>
</html>
```

### 4. Copy the React wrapper

```bash
# Copy UgaQuiz.tsx to src/components/
mkdir -p src/components
cp /path/to/uga-lit-components/react-wrapper/UgaQuiz.tsx src/components/
```

### 5. Use in your app

```tsx
// src/App.tsx
import React from "react";
import { UgaQuiz } from "./components/UgaQuiz";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>My Quiz App</h1>
      </header>
      <main>
        <UgaQuiz
          quizId="intro-quiz"
          quizTitle="Introduction Quiz"
          gradeObjectName="Introduction Quiz"
          apiEndpoint={process.env.REACT_APP_API_ENDPOINT}
          passingScore={70}
          onQuizComplete={(result) => {
            console.log("Quiz completed:", result);
          }}
        />
      </main>
    </div>
  );
}

export default App;
```

### 6. Run the app

```bash
npm start
```

## Embedding in Existing React Apps

### Next.js

1. Copy `uga-components.js` to `public/`
2. Add to `pages/_document.tsx`:

```tsx
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <link
          rel="stylesheet"
          href="https://design.online.uga.edu/css/base.css"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        <script type="module" src="/uga-components.js"></script>
      </body>
    </Html>
  );
}
```

3. Use the component in any page:

```tsx
import { UgaQuiz } from "../components/UgaQuiz";

export default function QuizPage() {
  return <UgaQuiz quizId="quiz-1" quizTitle="My Quiz" />;
}
```

### Gatsby

1. Copy `uga-components.js` to `static/`
2. Add to `gatsby-ssr.js`:

```js
export const onRenderBody = ({ setPostBodyComponents }) => {
  setPostBodyComponents([
    <script key="uga-components" type="module" src="/uga-components.js" />,
  ]);
};
```

### Vite + React

1. Copy `uga-components.js` to `public/`
2. Add to `index.html`:

```html
<script type="module" src="/uga-components.js"></script>
```

## TypeScript Declarations

If using the web component directly, add type declarations:

```tsx
// src/types/web-components.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    "uga-quiz": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        "quiz-id"?: string;
        "quiz-title"?: string;
        "grade-object-name"?: string;
        "api-endpoint"?: string;
        "passing-score"?: number;
        // ... other props
      },
      HTMLElement
    >;
  }
}
```

## Styling

The component uses UGA's base CSS. You can override styles:

```css
/* Custom styles */
uga-quiz {
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}
```

## Troubleshooting

### Component not rendering

1. **Check bundle is loaded:**

   ```js
   console.log(customElements.get("uga-quiz")); // Should not be undefined
   ```

2. **Check for errors in console**

3. **Verify script tag:**
   - Must be `<script type="module">`
   - Must load before React app

### TypeScript errors

- Install `@types/react` if missing
- Use the React wrapper component for better types

### Events not working

- Use the React wrapper's callback props
- Or attach event listeners via `useEffect`

## Next Steps

- See `README.md` for component API documentation
- Check `api-service/README.md` for API setup
- Review `demo/quiz.html` for more examples
