# Valence API backlog

Consolidated from `API_REVIEW_IMPROVEMENTS.md` and `COMPONENT_IMPROVEMENTS.md` (archived). Lists **open** integration work; implemented APIs are summarized so agents do not re-add them.

> **Verify in code:** [`src/lib/api/d2l-client.ts`](../../src/lib/api/d2l-client.ts), [`src/lib/api/d2l-client-content.ts`](../../src/lib/api/d2l-client-content.ts), [`src/types/d2l.ts`](../../src/types/d2l.ts).

---

## Implemented in `d2l-client` (reference only)

Do **not** re-implement from archived doc snippets without reading current code.

| Capability | Functions / notes |
|------------|-------------------|
| API caching + dedupe | `api-cache.ts`, `cachedApiCall` |
| Retry + AbortSignal | `withRetry()` |
| Paged classlist | `getClasslistPaged()`, `fetchPaged()`, `fetchAllPages()` |
| Paged dropbox submissions | `getAssignmentSubmissions()` uses `/submissions/paged/` with fallback |
| User submission | `getUserSubmission()`, `getMySubmission()` |
| Bulk grade values | `getBulkGradeValues()` |
| Grade values pagination | `getGradeValues()` |
| Final grades | `getFinalGradeValues()` |
| API version warnings | `logApiVersionWarning()` on major calls |
| Dropbox create / submit | `createDropboxFolder()`, `submitToDropbox()`, etc. |
| Discussions | forums, topics, posts paged |

**Archived (not in bundle):** `src/archive/api/d2l-client-quizzes.ts`, `d2l-client-groups.ts` — promote to `src/lib/api/` when building quiz-list or groups features.

---

## Open — API layer

| Item | Priority | Notes |
|------|----------|--------|
| **Group submission mapping** | Medium | `getAssignmentSubmissions` — ensure `EntityType: 'Group'` paths map to roster display correctly |
| **Feedback score in UI** | Medium | Feedback / `IsGraded` available in submission transform — expose in `uga-assignment` or export tools |
| **Content API in assignment list** | Medium | `getContentTOC` / topics with due dates — wire into `uga-assignment` or `uga-duedate` |
| **Quizzes API (native BS)** | Low | Un-archive `d2l-client-quizzes.ts` if listing Brightspace quizzes (not JSON `uga-quiz`) |
| **Groups API** | High | Un-archive `d2l-client-groups.ts` for `uga-groups` |
| **Type tightening** | Low | `EntityDropbox`, `DropboxFeedbackOut`, `UserGradeValue` in `d2l.ts` where still `any` |
| **Rubric CRUD** | Medium | For rubric import feature — not started |

---

## Open — per component

### `uga-instructor-card`

- [x] `getClasslistPaged` — in use
- [x] `logApiVersionWarning` — in use
- [ ] Show **multiple** instructors
- [ ] **withRetry** on profile image blob request
- [ ] Server-side role filter if Valence supports roleId on classlist (research)

### `uga-instructor-note`

- [ ] Richer **role gating** documentation in demo
- [ ] Consistent loading / error states (see ROADMAP cross-cutting)

### `uga-rating`

- [x] Optimistic update pattern — in `uga-rating`
- [ ] Aggregate ratings display (product decision)
- [ ] Rate-limit messaging for discussion create APIs

### `uga-duedate`

- [ ] Include **content** due dates (content client)
- [ ] Pagination if course has very large forum/topic sets

### `uga-assignment`

- [x] Lazy load utility — optional via `enableLazyLoad`
- [x] Memoized filter
- [ ] Use submission feedback for **graded** badge without extra grade call where possible
- [ ] **Group** assignments in list UI

### `uga-quiz` / `uga-quiz-grade-sync`

- [ ] Document release-condition limitations in [QUIZ_DROPBOX_SETUP.md](../QUIZ_DROPBOX_SETUP.md)
- [ ] No change to archived quiz Valence client unless adding native quiz discovery

### `uga-elc-google-sync`

- [ ] Complete Valence content routes per [COURSE_TEMPLATE_API_SPIKE.md](../COURSE_TEMPLATE_API_SPIKE.md)
- [ ] Admin role detection — institution-specific

### `uga-course-analytics`

- [ ] Align with latest Valence analytics endpoints (verify against tenant)

---

## Open — general patterns

| Pattern | Status |
|---------|--------|
| Consistent `try/catch` + user-facing error | Partial |
| Loading skeletons | Not standardized |
| Accessibility (ARIA, focus) | Per-component |
| `fetchAllPages` adoption | Available; not used everywhere |

---

## Testing checklist (Valence changes)

1. Test with **large class** (paged classlist + paged submissions).
2. Test **403** / missing enrollment (student vs instructor).
3. Confirm **XSRF** on write paths (discussions, dropbox submit, grade update).
4. Log **API version** warnings in console for deprecated LE versions.
5. After cache changes, call `clearCache()` where components mutate data (e.g. quiz submit).

---

## References

- [elc-valence-api skill](../../.cursor/skills/elc-valence-api/SKILL.md)
- [docs/cursor/api-references.md](../cursor/api-references.md)
- [archive/API_REVIEW_IMPROVEMENTS.md](archive/API_REVIEW_IMPROVEMENTS.md)
- [archive/COMPONENT_IMPROVEMENTS.md](archive/COMPONENT_IMPROVEMENTS.md)
