# Performance — implemented and open

Consolidated from `EFFICIENCY_IMPROVEMENTS.md`, `EFFICIENCY_IMPLEMENTATION_SUMMARY.md`, and `ADDITIONAL_IMPROVEMENTS_SUMMARY.md` (archived).

> **Agents:** Implementation lives in `src/lib/api/api-cache.ts`, `src/lib/utils/memoize.ts`, `src/lib/utils/lazy-load.ts`, and `d2l-client.ts`. Do not add a second cache layer without cause.

---

## Implemented

| Item | Location | Notes |
|------|----------|--------|
| **API response cache** | `api-cache.ts` | TTL by key type; in-memory only |
| **Request deduplication** | `api-cache.ts` | In-flight promise sharing |
| **Cached Valence calls** | `d2l-client.ts` | Via `cachedApiCall` |
| **Retry + 429 backoff** | `withRetry()` in `d2l-client.ts` | Supports `AbortSignal` |
| **Batch parallel calls** | `batchApiCalls()` | Independent calls in parallel |
| **Memoization** | `memoize.ts` | Used in `uga-assignment` filtering |
| **Lazy load (viewport)** | `lazy-load.ts` | `uga-assignment` optional `enableLazyLoad` |
| **Optimistic UI** | `uga-rating` | Rollback on failure |

### AbortController — partial

Components that **use** `AbortController` in lifecycle (verify in source before claiming “all”):

- `uga-assignment`, `uga-instructor-card`, `uga-instructor-note`, `uga-rating`, `uga-duedate`
- `uga-quiz`, `uga-course-analytics` (and others — grep `AbortController` under `src/components/`)

**Reference only (not in bundle):** `src/archive/utils/abort-controller-mixin.ts`

### Rough impact (from Jan 2026 review)

- Multi-component pages: ~40–50% fewer duplicate Valence calls when cache warm
- Faster perceived load when lazy-load enabled on below-fold assignments

---

## Open

| Item | Priority | Notes |
|------|----------|--------|
| **AbortController on remaining components** | Medium | e.g. `uga-accordion`, `uga-slideshow`, `uga-footer`, `uga-video`, `uga-tabs`, `uga-course-calendar` — add only if they perform async Valence work |
| **Shared state / event bus** | Low | Optional single subscription for `getVersions` / classlist across siblings |
| **Performance monitoring** | Low | Timings, cache hit rate logging (dev-only) |
| **Debouncing / throttling** | Low | When search/filter UI is added |
| **Service worker cache** | Low | Unlikely for course-file bundle; offline not a goal today |
| **Virtual scrolling** | Low | Large tables — see [ROADMAP.md](ROADMAP.md) |
| **Wider memoization** | Low | Other heavy filters / sorts |

---

## Usage (maintainers)

```typescript
import { clearCache } from '../lib/api/api-cache.js';
import { memoize } from '../lib/utils/memoize.js';
import { observeLazyLoad } from '../lib/utils/lazy-load.js';
import { batchApiCalls, getVersions, getClasslist } from '../lib/api/d2l-client.js';

// After mutating course data from a component:
clearCache('assignments:12345');
```

---

## Testing

1. Multiple instances of `uga-assignment` / `uga-duedate` on one page — Network tab should show deduped `getVersions` / enrollment calls.
2. Unmount during in-flight request — no uncaught errors; request aborted where signal passed.
3. `enableLazyLoad` on assignment — no fetch until intersecting viewport.
4. Rating submit failure — UI rolls back.

---

## References

- [src/README.md](../../src/README.md)
- [archive/EFFICIENCY_IMPLEMENTATION_SUMMARY.md](archive/EFFICIENCY_IMPLEMENTATION_SUMMARY.md)
- [archive/ADDITIONAL_IMPROVEMENTS_SUMMARY.md](archive/ADDITIONAL_IMPROVEMENTS_SUMMARY.md)
