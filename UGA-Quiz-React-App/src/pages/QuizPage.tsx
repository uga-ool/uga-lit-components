import { useState } from "react";
import { Link } from "react-router-dom";
import { UgaQuiz } from "../components/UgaQuiz";

const SAMPLE_QUESTIONS = [
  {
    id: "q1",
    type: "multiple-choice",
    question: "What is eLC?",
    points: 10,
    options: [
      "UGA’s learning management system",
      "A programming language",
      "A type of quiz",
      "A design system",
    ],
    correctAnswer: 0,
    explanation:
      "eLC (eLearning Commons) is UGA’s instance of D2L Brightspace.",
  },
  {
    id: "q2",
    type: "true-false",
    question: "The uga-quiz component can submit grades to the D2L gradebook.",
    points: 10,
    options: ["True", "False"],
    correctAnswer: 0,
    explanation:
      "Yes. Use the API endpoint or direct D2L integration when the user has permissions.",
  },
  {
    id: "q3",
    type: "short-answer",
    question: "What does UGA stand for?",
    points: 10,
    correctAnswer: "University of Georgia",
    explanation: "University of Georgia.",
  },
];

export function QuizPage() {
  const [result, setResult] = useState<{
    totalPoints: number;
    pointsEarned: number;
    percentage: number;
    passed: boolean;
    attemptCount: number;
  } | null>(null);
  const [gradebookStatus, setGradebookStatus] = useState<string>("");

  const apiEndpoint = import.meta.env.VITE_QUIZ_API_ENDPOINT || "";

  return (
    <div className="quiz-page">
      <header className="app-header util-margin-vert-lg">
        <Link
          to="/"
          className="link"
          style={{ marginBottom: "0.5rem", display: "inline-block" }}
        >
          ← Back
        </Link>
        <h1>Example Quiz</h1>
        <p className="util-margin-vert-md">
          This quiz uses the uga-quiz component. Results can be sent to the
          gradebook when
          <code> grade-object-name</code> and optionally{" "}
          <code>api-endpoint</code> are set.
        </p>
      </header>

      {result && (
        <div
          className={`quiz-status ${result.passed ? "success" : "error"}`}
          role="status"
        >
          <h3>Quiz Result</h3>
          <p>
            <strong>Score:</strong> {result.pointsEarned} / {result.totalPoints}{" "}
            ({result.percentage.toFixed(1)}%)
          </p>
          <p>
            <strong>Status:</strong> {result.passed ? "Passed" : "Did not pass"}
          </p>
          <p>
            <strong>Attempt:</strong> {result.attemptCount}
          </p>
          {gradebookStatus && (
            <p>
              <strong>Gradebook:</strong> {gradebookStatus}
            </p>
          )}
        </div>
      )}

      <div className="quiz-container">
        <UgaQuiz
          quizId="elc-example-quiz"
          quizTitle="Example Quiz"
          gradeObjectName="Example Quiz"
          apiEndpoint={apiEndpoint}
          passingScore={70}
          allowRetry
          maxAttempts={3}
          showFeedback
          onQuizComplete={setResult}
          onGradebookSave={(status, message) =>
            setGradebookStatus(`${status}${message ? `: ${message}` : ""}`)
          }
          type="inline"
          questions={JSON.stringify(SAMPLE_QUESTIONS)}
        />
      </div>
    </div>
  );
}
