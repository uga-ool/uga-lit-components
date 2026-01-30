/**
 * React Wrapper for uga-quiz Web Component
 *
 * This wrapper provides TypeScript types and React-friendly props
 * for the uga-quiz LitElement web component.
 */

import React, { useEffect, useRef } from "react";

export interface UgaQuizProps {
  quizId?: string;
  quizTitle?: string;
  questions?: string; // JSON string of questions
  gradeObjectName?: string;
  autoCreateGradeObject?: boolean;
  apiEndpoint?: string;
  passingScore?: number;
  allowRetry?: boolean;
  maxAttempts?: number;
  showFeedback?: boolean;
  allowReset?: boolean;
  randomizeQuestions?: boolean;
  timeLimit?: number; // Time limit in minutes (0 = no limit)
  autoSubmit?: boolean;
  type?: "local" | "inline" | "csv";
  filename?: string;
  className?: string;
  style?: React.CSSProperties;
  onQuizComplete?: (result: {
    totalPoints: number;
    pointsEarned: number;
    percentage: number;
    passed: boolean;
    attemptCount: number;
  }) => void;
  onGradebookSave?: (
    status: "saving" | "success" | "error",
    message?: string,
  ) => void;
}

/**
 * React component wrapper for uga-quiz web component
 *
 * @example
 * ```tsx
 * <UgaQuiz
 *   quizId="my-quiz"
 *   quizTitle="My Quiz"
 *   gradeObjectName="Quiz 1"
 *   apiEndpoint="https://api.example.com/api/quiz/submit"
 *   passingScore={70}
 *   onQuizComplete={(result) => console.log('Quiz completed:', result)}
 * />
 * ```
 */
export const UgaQuiz: React.FC<UgaQuizProps> = ({
  quizId,
  quizTitle,
  questions,
  gradeObjectName,
  autoCreateGradeObject,
  apiEndpoint,
  passingScore,
  allowRetry,
  maxAttempts,
  showFeedback,
  allowReset,
  randomizeQuestions,
  timeLimit,
  autoSubmit,
  type,
  filename,
  className,
  style,
  onQuizComplete,
  onGradebookSave,
}) => {
  const quizRef = useRef<
    HTMLElement & {
      results?: {
        totalPoints: number;
        pointsEarned: number;
        percentage: number;
        passed: boolean;
      };
      attemptCount?: number;
      gradebookSaveStatus?: "idle" | "saving" | "success" | "error";
      gradebookErrorMessage?: string | null;
    }
  >(null);

  useEffect(() => {
    const quizElement = quizRef.current;
    if (!quizElement) return;

    // Poll for quiz completion (since web components don't always emit events)
    // Check every 500ms for changes
    let lastAttemptCount = quizElement.attemptCount || 0;
    let lastStatus = quizElement.gradebookSaveStatus || "idle";

    const checkStatus = () => {
      if (!quizElement) return;

      // Check for quiz completion
      if (quizElement.results && onQuizComplete) {
        const currentAttemptCount = quizElement.attemptCount || 1;
        if (currentAttemptCount !== lastAttemptCount) {
          lastAttemptCount = currentAttemptCount;
          onQuizComplete({
            ...quizElement.results,
            attemptCount: currentAttemptCount,
          });
        }
      }

      // Check for gradebook save status changes
      if (onGradebookSave) {
        const currentStatus = quizElement.gradebookSaveStatus || "idle";
        if (currentStatus !== lastStatus && currentStatus !== "idle") {
          lastStatus = currentStatus;
          onGradebookSave(
            currentStatus as "saving" | "success" | "error",
            quizElement.gradebookErrorMessage || undefined,
          );
        }
      }
    };

    // Poll every 500ms
    const interval = setInterval(checkStatus, 500);

    // Also listen for custom events if the component emits them
    const handleQuizComplete = () => {
      if (quizElement.results && onQuizComplete) {
        onQuizComplete({
          ...quizElement.results,
          attemptCount: quizElement.attemptCount || 1,
        });
      }
    };

    const handleGradebookSave = () => {
      if (onGradebookSave && quizElement.gradebookSaveStatus !== "idle") {
        onGradebookSave(
          quizElement.gradebookSaveStatus as "saving" | "success" | "error",
          quizElement.gradebookErrorMessage || undefined,
        );
      }
    };

    quizElement.addEventListener(
      "quiz-complete",
      handleQuizComplete as EventListener,
    );
    quizElement.addEventListener(
      "gradebook-save",
      handleGradebookSave as EventListener,
    );

    return () => {
      clearInterval(interval);
      quizElement.removeEventListener(
        "quiz-complete",
        handleQuizComplete as EventListener,
      );
      quizElement.removeEventListener(
        "gradebook-save",
        handleGradebookSave as EventListener,
      );
    };
  }, [onQuizComplete, onGradebookSave]);

  // Convert props to kebab-case attributes
  const props: Record<string, any> = {};

  if (quizId !== undefined) props["quiz-id"] = quizId;
  if (quizTitle !== undefined) props["quiz-title"] = quizTitle;
  if (questions !== undefined) props.questions = questions;
  if (gradeObjectName !== undefined)
    props["grade-object-name"] = gradeObjectName;
  if (autoCreateGradeObject !== undefined)
    props["auto-create-grade-object"] = autoCreateGradeObject;
  if (apiEndpoint !== undefined) props["api-endpoint"] = apiEndpoint;
  if (passingScore !== undefined) props["passing-score"] = passingScore;
  if (allowRetry !== undefined) props["allow-retry"] = allowRetry;
  if (maxAttempts !== undefined) props["max-attempts"] = maxAttempts;
  if (showFeedback !== undefined) props["show-feedback"] = showFeedback;
  if (allowReset !== undefined) props["allow-reset"] = allowReset;
  if (randomizeQuestions !== undefined)
    props["randomize-questions"] = randomizeQuestions;
  if (timeLimit !== undefined) props["time-limit"] = timeLimit;
  if (autoSubmit !== undefined) props["auto-submit"] = autoSubmit;
  if (type !== undefined) props.type = type;
  if (filename !== undefined) props.filename = filename;

  // Use React.createElement to properly handle web component
  // Web components need special handling for refs
  const elementProps: any = {
    ...props,
  };

  // Add className and style if provided
  if (className) {
    elementProps.className = className;
  }
  if (style) {
    elementProps.style = style;
  }

  // Use a callback ref for web components
  const setRef = (element: HTMLElement | null) => {
    if (quizRef.current !== element) {
      quizRef.current = element as any;
    }
  };

  return React.createElement("uga-quiz", { ...elementProps, ref: setRef });
};

export default UgaQuiz;
