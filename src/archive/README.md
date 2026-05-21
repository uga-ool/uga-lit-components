# Archived source (not in `uga-components.js`)

These files are **not imported** by any component or `src/all.ts`. Vite does not include them in `dist/js/uga-components.js`. They are kept for reference or future features.

| File | Notes |
|------|--------|
| `api/d2l-client-quizzes.ts` | Quiz Valence scaffold; use `d2l-client.ts` for new dropbox/quiz work. |
| `api/d2l-client-groups.ts` | Groups API scaffold; unused. |
| `data/autograder.ts` | Planned `uga-autograder`; grading lives in `uga-quiz.ts` today. |
| `utils/abort-controller-mixin.ts` | Reference mixin; components use inline `AbortController` instead. |

Do not import from `src/archive/` in production components without an explicit team decision and bundle review.
