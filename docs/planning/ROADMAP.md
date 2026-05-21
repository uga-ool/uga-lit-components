# Roadmap — open work

Consolidated from `FUTURE_IMPROVEMENTS_AND_COMPONENTS.md` and `QUICK_WINS_AND_SUGGESTIONS.md` (archived under [archive/](archive/)). **Open items only** — shipped work is listed for orientation, not as todos.

> **Agents:** Verify component existence in [`src/components/`](../../src/components/) and [`CHANGELOG.md`](../../CHANGELOG.md) before implementing.

---

## Already shipped (do not re-scaffold)

| Item | Component / doc |
|------|-----------------|
| In-page formative quizzes | `uga-quiz`, `uga-quiz-grade-sync` — [QUIZ_JSON_FORMAT.md](../QUIZ_JSON_FORMAT.md) |
| Course calendar | `uga-course-calendar` — [COURSE_CALENDAR_FORMAT.md](../COURSE_CALENDAR_FORMAT.md) |
| Template / Drive sync MVP | `uga-elc-google-sync` — [ELC_GOOGLE_SYNC_WIDGET.md](../ELC_GOOGLE_SYNC_WIDGET.md) |
| Course analytics | `uga-course-analytics` |
| API cache, retry, paged classlist/submissions | `d2l-client.ts`, `api-cache.ts` — [performance.md](performance.md) |

---

## Enhancements — existing components

### `uga-assignment`

- [ ] Surface **content topics** with due dates (`d2l-client-content.ts` — not wired into assignment list today)
- [ ] **Progress / status** UI (submitted vs graded) using submission + grade data
- [ ] **Filter/sort controls** in UI (beyond `types` attribute)
- [ ] **Loading skeletons** and clearer empty states
- [ ] Optional: list **native Brightspace quizzes** with due dates (Valence quizzes client is in [`src/archive/api/d2l-client-quizzes.ts`](../../src/archive/api/d2l-client-quizzes.ts); distinct from `uga-quiz` JSON quizzes)

### `uga-instructor-card`

- [ ] Display **all** instructors (not only first match)
- [ ] **Contact info** / office hours from profile (if available via Valence)
- [ ] **withRetry** on profile image blob fetch (see [valence-backlog.md](valence-backlog.md))

### `uga-rating`

- [ ] Show **aggregate** rating to students (if product wants it)
- [ ] **Star** UI instead of dropdown-only
- [ ] Instructor-facing **analytics** view

### `uga-duedate`

- [ ] **Calendar grid** view option
- [ ] **Countdown** / urgency **color coding**

### `uga-footer`

- [ ] Load footer copy from **course settings** / templates where possible
- [ ] Accessibility pass (landmarks, focus)

### `uga-video`

- [ ] In-video quiz hooks remain **out of scope** until LTI design (#4 in [FEATURE_REQUESTS.md](FEATURE_REQUESTS.md))

### Cross-cutting (all components)

- [ ] **Loading skeletons** and consistent **empty states**
- [ ] **Actionable error messages** (role, XSRF, 403)
- [ ] **Keyboard** shortcuts and **tooltips** where interactive
- [ ] **Print** styles for tables/lists
- [ ] Extend **AbortController** to components that still lack it — see [performance.md](performance.md)

---

## New components — not started or early

| Component | Priority | Notes |
|-----------|----------|--------|
| **`uga-groups`** | High | Feature request #5; revive [`d2l-client-groups.ts`](../../src/archive/api/d2l-client-groups.ts) into bundle |
| **`uga-rubric-upload`** | Medium | Feature request #3; likely needs backend for file parse |
| **`uga-autograder`** | Medium | Do not duplicate `uga-quiz` / grade-sync; [`src/archive/data/autograder.ts`](../../src/archive/data/autograder.ts) is reference only |
| **`uga-news`** | Low | News / announcements Valence |
| **`uga-checklist`** | Low | Checklist API |
| **`uga-grade-display`** | Low | Student-facing grade summary |
| **`uga-content-progress`** | Low | Uses content completion APIs |
| **`uga-discussion-thread`** | Low | Read-only thread embed |
| **`uga-survey`** | Low | Surveys API |
| **`uga-file-manager`** | Low | Manage Files–style UI (heavy; may belong in React app) |
| **`uga-announcement`** | Low | Banner |
| **`uga-student-list`** | Low | Roster / classlist display |
| **`uga-badge`**, **`uga-portfolio`**, **`uga-competency`** | Low | Nice-to-have |

**Do not build:** duplicate `uga-quiz`, `uga-course-calendar`, or full template manager in Lit — use existing components + `uga-drive-elc-sync`.

---

## Architecture and platform

| Area | Open ideas |
|------|------------|
| **Base class** | Shared `connectedCallback` / versions / abort / error pattern for Lit components |
| **Error boundary** | Wrapper custom element for failed child loads |
| **Shared state** | Optional pub/sub for classlist, versions (see [performance.md](performance.md)) |
| **Testing** | Unit tests for `d2l-client`, utilities; integration tests in eLC |
| **Storybook** | Component catalog for designers |
| **Dark mode** | Design-system alignment |
| **i18n** | If courses require non-English UI |
| **Virtual scrolling** | Large assignment/grade lists |
| **Code splitting** | Likely low value while bundle stays single-file for eLC |

---

## Quick wins (still open)

From archived quick-wins list — items **not** covered by shipped components:

1. Loading skeletons + empty states (all major data components)
2. Improve error copy (XSRF, permissions, network)
3. Keyboard accessibility on interactive widgets
4. Tooltips for dense tables (`uga-duedate`, `uga-assignment`)
5. Copy-to-clipboard on `uga-code` examples (if desired)

---

## Suggested order

1. **`uga-groups`** (feature request, archived API client exists)
2. **Assignment + content due dates** (high student-facing value)
3. **Cross-cutting UX** (skeletons, errors)
4. **Rubric upload** (needs API + parse strategy)
5. Architecture items as needed for maintainability

---

## References

- [FEATURE_REQUESTS.md](FEATURE_REQUESTS.md)
- [valence-backlog.md](valence-backlog.md)
- [performance.md](performance.md)
- [archive/FUTURE_IMPROVEMENTS_AND_COMPONENTS.md](archive/FUTURE_IMPROVEMENTS_AND_COMPONENTS.md) — full historical list
