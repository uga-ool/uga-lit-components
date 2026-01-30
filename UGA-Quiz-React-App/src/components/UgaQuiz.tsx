/**
 * React wrapper for the uga-quiz web component.
 * The web component is provided by uga-components.js (loaded in index.html).
 *
 * From uga-lit-components; used in UGA-Brightspace-React-Apps style projects.
 */

import React, { useEffect, useRef } from "react";

export interface UgaQuizProps {
  quizId?: string;
  quizTitle?: string;
  questions?: string;
  gradeObjectName?: string;
  autoCreateGradeObject?: boolean;
  apiEndpoint?: string;
  passingScore?: number;
  allowRetry?: boolean;
  maxAttempts?: number;
  showFeedback?: boolean;
  allowReset?: boolean;
  randomizeQuestions?: boolean;
  timeLimit?: number;
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
    const el = quizRef.current;
    if (!el) return;

    let lastAttemptCount = el.attemptCount ?? 0;
    let lastStatus = el.gradebookSaveStatus ?? "idle";

    const check = () => {
      if (!el) return;
      if (el.results && onQuizComplete) {
        const n = el.attemptCount ?? 1;
        if (n !== lastAttemptCount) {
          lastAttemptCount = n;
          onQuizComplete({ ...el.results, attemptCount: n });
        }
      }
      if (onGradebookSave) {
        const s = el.gradebookSaveStatus ?? "idle";
        if (s !== lastStatus && s !== "idle") {
          lastStatus = s;
          onGradebookSave(
            s as "saving" | "success" | "error",
            el.gradebookErrorMessage ?? undefined,
          );
        }
      }
    };

    const interval = setInterval(check, 500);

    const onComplete = () => {
      if (el?.results && onQuizComplete) {
        onQuizComplete({
          ...el.results,
          attemptCount: el.attemptCount ?? 1,
        });
      }
    };

    const onSave = () => {
      if (
        onGradebookSave &&
        el?.gradebookSaveStatus &&
        el.gradebookSaveStatus !== "idle"
      ) {
        onGradebookSave(
          el.gradebookSaveStatus as "saving" | "success" | "error",
          el.gradebookErrorMessage ?? undefined,
        );
      }
    };

    el.addEventListener("quiz-complete", onComplete as EventListener);
    el.addEventListener("gradebook-save", onSave as EventListener);

    return () => {
      clearInterval(interval);
      el.removeEventListener("quiz-complete", onComplete as EventListener);
      el.removeEventListener("gradebook-save", onSave as EventListener);
    };
  }, [onQuizComplete, onGradebookSave]);

  const attrs: Record<string, unknown> = {};
  if (quizId != null) attrs["quiz-id"] = quizId;
  if (quizTitle != null) attrs["quiz-title"] = quizTitle;
  if (questions != null) attrs.questions = questions;
  if (gradeObjectName != null) attrs["grade-object-name"] = gradeObjectName;
  if (autoCreateGradeObject != null)
    attrs["auto-create-grade-object"] = autoCreateGradeObject;
  if (apiEndpoint != null) attrs["api-endpoint"] = apiEndpoint;
  if (passingScore != null) attrs["passing-score"] = passingScore;
  if (allowRetry != null) attrs["allow-retry"] = allowRetry;
  if (maxAttempts != null) attrs["max-attempts"] = maxAttempts;
  if (showFeedback != null) attrs["show-feedback"] = showFeedback;
  if (allowReset != null) attrs["allow-reset"] = allowReset;
  if (randomizeQuestions != null)
    attrs["randomize-questions"] = randomizeQuestions;
  if (timeLimit != null) attrs["time-limit"] = timeLimit;
  if (autoSubmit != null) attrs["auto-submit"] = autoSubmit;
  if (type != null) attrs.type = type;
  if (filename != null) attrs.filename = filename;
  if (className) attrs.className = className;
  if (style) attrs.style = style;

  const setRef = (node: HTMLElement | null) => {
    (quizRef as React.MutableRefObject<HTMLElement | null>).current = node;
  };

  return React.createElement("uga-quiz", { ...attrs, ref: setRef });
};

export default UgaQuiz;
