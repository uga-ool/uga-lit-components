# Feature requests (instructional design)

Backlog from the instructional design team for **eLC** (UGA Brightspace) Lit components and related tooling.

> **Agents:** Update status here when shipping work; record releases in [`CHANGELOG.md`](../../CHANGELOG.md). Do not treat “React might be better” notes as blockers — several items are already implemented in Lit.

## Status legend

| Status | Meaning |
|--------|---------|
| **Shipped** | In bundle + docs; usable in courses |
| **MVP** | Early implementation; gaps documented |
| **Partial** | Some workflow covered; not full request |
| **Not started** | No component or doc spike yet |

---

## Current requests (January 2026)

### 1. Trackable in-page formative quizzes — **Partial** / **MVP**

| | |
|--|--|
| **Requested by** | Chris Sparks |
| **Priority** | High |
| **Status** | **`uga-quiz`** + [`docs/QUIZ_JSON_FORMAT.md`](../QUIZ_JSON_FORMAT.md); grade sync via **`uga-quiz-grade-sync`** + [`docs/QUIZ_DROPBOX_SETUP.md`](../QUIZ_DROPBOX_SETUP.md) |
| **Gaps** | Release conditions integration; broader question types; creator-style editor; confirm completion semantics vs native Brightspace quizzes |

**Notes:** UGA/USG does not have Creator+ in-page quizzes; custom JSON + dropbox submission is the current approach.

---

### 2. Autograding and gradebook export — **Partial**

| | |
|--|--|
| **Requested by** | Stephanie |
| **Priority** | High |
| **Status** | **`uga-quiz-grade-sync`** syncs scores to gradebook; **`uga-assignment`** / dropbox APIs in `d2l-client.ts` support submissions and grades |
| **Gaps** | Full autograding for arbitrary assignment types; groups-in-content (see #5) |

---

### 3. Rubric upload / import — **Not started**

| | |
|--|--|
| **Requested by** | Dee |
| **Priority** | Medium |
| **Status** | No `uga-rubric-upload`; Valence Rubrics API not wired in bundle |
| **Gaps** | File parsing (Word/PDF/Docs), schema validation, rubric create/update via Valence |

**Planning:** See [ROADMAP.md](ROADMAP.md) — `uga-rubric-upload`.

---

### 4. In-video quizzes (LTI) — **Not started**

| | |
|--|--|
| **Requested by** | Stephen |
| **Priority** | Medium |
| **Status** | **`uga-video`** embeds Kaltura; does not handle LTI in-video quiz overlays |
| **Gaps** | LTI + player timing; coordination with Kaltura LTI tools |

---

### 5. Groups tool in content — **Not started**

| | |
|--|--|
| **Requested by** | Stephanie |
| **Priority** | Medium (also mentioned in #2) |
| **Status** | Scaffold only: [`src/archive/api/d2l-client-groups.ts`](../../src/archive/api/d2l-client-groups.ts) (not in bundle) |
| **Gaps** | **`uga-groups`** component; enrollments UI |

**Planning:** See [ROADMAP.md](ROADMAP.md) and [valence-backlog.md](valence-backlog.md).

---

### 6. Course template management widget — **MVP**

| | |
|--|--|
| **Requested by** | Chris Sparks |
| **Priority** | High |
| **Status** | **`uga-elc-google-sync`** (Lit MVP) + [ELC_GOOGLE_SYNC_WIDGET.md](../ELC_GOOGLE_SYNC_WIDGET.md), [ELC_GOOGLE_SYNC_SPEC.md](../ELC_GOOGLE_SYNC_SPEC.md), [COURSE_TEMPLATE_API_SPIKE.md](../COURSE_TEMPLATE_API_SPIKE.md) |
| **Full product** | **`uga-drive-elc-sync`** repo (export / clear / back-copy at scale) |

**Open questions** (see spec docs): admin role detection, template vs live course identification, Drive auth model.

---

## Priority (product)

**High:** #1 (release conditions / completion), #2 (autograding breadth), #6 (template ops hardening)

**Medium:** #3, #4, #5

---

## Technology notes (updated)

| Approach | When to use |
|----------|-------------|
| **Lit (this repo)** | Course-file embeds, Valence from browser session, design-system HTML |
| **React app (`uga-drive-elc-sync`)** | Heavy file ops, multi-step admin workflows, Drive OAuth |
| **Backend / agent framework** | Secrets, LLM, long-running jobs |

---

## API touchpoints

| Request | Valence / other |
|---------|-----------------|
| #1 | Gradebook, dropbox, release conditions (research) |
| #2 | Gradebook, dropbox submissions |
| #3 | Rubrics API |
| #4 | LTI, Kaltura |
| #5 | Groups API (archived client) |
| #6 | Content / Manage Files, course copy, Google Drive |

Online reference: [Valence API](https://docs.valence.desire2learn.com/)

---

## Future institutional projects (non–eLC-component)

Broader ideas tracked in the archived [FEATURE_REQUESTS.md](archive/FEATURE_REQUESTS.md) — course transfer equivalency, virtual TA, faculty support agents, etc. Not scoped to this Lit bundle.

---

## References

- [docs/README.md](../README.md) — documentation index
- [planning/README.md](README.md) — planning folder for agents
- [ROADMAP.md](ROADMAP.md) — open component/enhancement ideas
