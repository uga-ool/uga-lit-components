---
name: elc-valence-api
description: D2L Brightspace Valence (eLC) API guidance for uga-lit-components. Use when adding or fixing LMS API calls, enrollments, grades, content, quizzes, or dropbox features in Lit components.
---

# eLC Valence API (Brightspace) — Lit components

## Official documentation

- **Reference index:** https://docs.valence.desire2learn.com/reference.html
- **Scopes (permissions):** https://docs.valence.desire2learn.com/http-scopestable.html
- **Common resources:** [content](https://docs.valence.desire2learn.com/res/content.html), [grades](https://docs.valence.desire2learn.com/res/grade.html), [enrollments](https://docs.valence.desire2learn.com/res/enroll.html), [quizzes](https://docs.valence.desire2learn.com/res/quiz.html), [dropbox](https://docs.valence.desire2learn.com/res/dropbox.html)

Read the **resource page** for the API you need before inventing request shapes.

## UGA conventions (this repo)

- **Do not** hand-roll raw `fetch` to random `/d2l/api/...` paths without checking Valence docs.
- **Use** [`src/lib/api/d2l-client.ts`](../../src/lib/api/d2l-client.ts) and [`src/lib/api/d2l-utils.ts`](../../src/lib/api/d2l-utils.ts).
- **URL patterns:** `/d2l/api/le/{leVersion}/{ou}/...` and `/d2l/api/lp/{lpVersion}/{ou}/...`.
- **Types:** extend [`src/types/d2l.ts`](../../src/types/d2l.ts) when adding response shapes.
- **Org unit:** pass `ou` from component attributes or `getCourse()` — never hard-code production OU IDs in source.
- **HTTP:** use `d2l-client.ts` (`import axios from 'axios'`); axios is **bundled** in `uga-components.js` (see `.github/copilot-instructions.md`).
- **Rate limits:** use `withRetry` / caching in `d2l-client` where already applied.

## Workflow

1. Identify the Valence **resource** (e.g. grades, classlist, content).
2. Open the matching page on docs.valence.desire2learn.com.
3. Add or extend a helper in `d2l-client.ts` if multiple components need the same call.
4. Wire the component via `loadData` or direct client calls; update demo if needed.
5. Test in eLC or mock `window.D2L` locally per copilot instructions (bundled axios works in `npm run dev`).

## Not in scope here

- Kaltura video APIs — use skill `kaltura-api`.
- Manage Files multipart upload — see React Apps / drive-elc-sync patterns in team docs if needed.

## Links

- [`docs/cursor/api-references.md`](../../docs/cursor/api-references.md)
