/**
 * Example React App using uga-quiz component
 *
 * This demonstrates how to embed the uga-quiz component in a React application.
 */

import React, { useState } from "react";
import { UgaQuiz } from "../UgaQuiz";

const App: React.FC = () => {
  const [quizResult, setQuizResult] = useState<any>(null);
  const [gradebookStatus, setGradebookStatus] = useState<string>("");

  const handleQuizComplete = (result: {
    totalPoints: number;
    pointsEarned: number;
    percentage: number;
    passed: boolean;
    attemptCount: number;
  }) => {
    console.log("Quiz completed!", result);
    setQuizResult(result);
  };

  const handleGradebookSave = (
    status: "saving" | "success" | "error",
    message?: string,
  ) => {
    console.log("Gradebook save status:", status, message);
    setGradebookStatus(`${status}: ${message || ""}`);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>UGA Quiz Component - React Example</h1>

      <div
        style={{
          marginBottom: "2rem",
          padding: "1rem",
          background: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h2>Quiz Status</h2>
        {quizResult ? (
          <div>
            <p>
              <strong>Score:</strong> {quizResult.pointsEarned} /{" "}
              {quizResult.totalPoints}
            </p>
            <p>
              <strong>Percentage:</strong> {quizResult.percentage.toFixed(1)}%
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {quizResult.passed ? "✅ Passed" : "❌ Failed"}
            </p>
            <p>
              <strong>Attempt:</strong> {quizResult.attemptCount}
            </p>
          </div>
        ) : (
          <p>No quiz results yet.</p>
        )}
        {gradebookStatus && (
          <p>
            <strong>Gradebook:</strong> {gradebookStatus}
          </p>
        )}
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1rem",
        }}
      >
        <h2>Example Quiz</h2>
        <UgaQuiz
          quizId="react-example-quiz"
          quizTitle="React Example Quiz"
          gradeObjectName="React Example Quiz"
          apiEndpoint={process.env.REACT_APP_API_ENDPOINT || ""}
          passingScore={70}
          allowRetry={true}
          maxAttempts={3}
          showFeedback={true}
          onQuizComplete={handleQuizComplete}
          onGradebookSave={handleGradebookSave}
          type="inline"
          questions={JSON.stringify([
            {
              id: "q1",
              type: "multiple-choice",
              question: "What is React?",
              points: 10,
              options: [
                "A JavaScript library",
                "A programming language",
                "A database",
                "A framework",
              ],
              correctAnswer: 0,
              explanation:
                "React is a JavaScript library for building user interfaces.",
            },
            {
              id: "q2",
              type: "true-false",
              question: "React components can be written as functions.",
              points: 10,
              options: ["True", "False"],
              correctAnswer: 0,
              explanation:
                "Yes! React components can be written as function components or class components.",
            },
            {
              id: "q3",
              type: "short-answer",
              question: "What does JSX stand for?",
              points: 10,
              correctAnswer: "JavaScript XML",
              explanation:
                "JSX stands for JavaScript XML, a syntax extension for JavaScript.",
            },
          ])}
        />
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "#fff9e6",
          borderRadius: "8px",
        }}
      >
        <h3>Usage Instructions</h3>
        <ol>
          <li>
            Make sure the uga-components.js bundle is loaded in your HTML:
          </li>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "4px",
              overflow: "auto",
            }}
          >
            {`<script type="module" src="/path/to/uga-components.js"></script>`}
          </pre>
          <li>Import and use the UgaQuiz component in your React app</li>
          <li>
            Set the <code>api-endpoint</code> prop to enable external API grade
            submission
          </li>
          <li>Handle quiz completion and gradebook events via callbacks</li>
        </ol>
      </div>
    </div>
  );
};

export default App;
