# API references (uga-lit-components)

Canonical **external** documentation for APIs used in this repo. Do not store API keys or secrets here.

## Primary APIs

| API | Official docs | Used in this repo |
|-----|---------------|------------------|
| **D2L Brightspace (Valence / eLC)** | [API reference](https://docs.valence.desire2learn.com/reference.html) · [Scopes](https://docs.valence.desire2learn.com/http-scopestable.html) | `src/lib/api/d2l-client.ts`, most data-driven components |
| **Kaltura** | [API docs](https://developer.kaltura.com/api-docs/) | `src/components/uga-video.ts` |

## Cursor skills

| Skill | When to use |
|-------|-------------|
| `elc-valence-api` | New or changed Brightspace/Valence calls |
| `kaltura-api` | Video embed, player, or Kaltura media/session |

Command: **`api-help`** in the Cursor palette for a quick pointer.

## UI (not a REST API)

| Resource | Docs |
|----------|------|
| **UGA Online Design System** | https://design.online.uga.edu/getting-started/installation/ |

Loaded on demo/host pages; see rule `uga-lit-demos.mdc`.

## In-repo feature docs (read these for UGA components)

| Doc | When to use |
|-----|-------------|
| [../README.md](../README.md) | Doc index and component overview |
| [../QUIZ_JSON_FORMAT.md](../QUIZ_JSON_FORMAT.md) | `uga-quiz` JSON / CSV questions |
| [../QUIZ_DROPBOX_SETUP.md](../QUIZ_DROPBOX_SETUP.md) | Quiz submissions and `uga-quiz-grade-sync` |
| [../COURSE_CALENDAR_FORMAT.md](../COURSE_CALENDAR_FORMAT.md) | `uga-course-calendar` JSON / CSV |
| [../ELC_GOOGLE_SYNC_WIDGET.md](../ELC_GOOGLE_SYNC_WIDGET.md) | `uga-elc-google-sync` widget |
| [../ELC_GOOGLE_SYNC_SPEC.md](../ELC_GOOGLE_SYNC_SPEC.md) | Drive sync product spec |
| [../COURSE_TEMPLATE_API_SPIKE.md](../COURSE_TEMPLATE_API_SPIKE.md) | Valence spike for template APIs |

**Do not** use [../archive/d2l-platform-reference/](../archive/d2l-platform-reference/) for routine Lit work — that folder is an offline D2L platform mirror; prefer Valence URLs above.

## Google Drive (related widget)

Lit component `uga-elc-google-sync` and team specs:

- [ELC_GOOGLE_SYNC_WIDGET.md](../ELC_GOOGLE_SYNC_WIDGET.md)
- [uga-online-cursor-docs — content-markdown-and-drive-sync](https://github.com/uga-ool/uga-online-cursor-docs/tree/main/docs/content-markdown-and-drive-sync)

Full Drive ↔ Manage Files app: **`uga-drive-elc-sync`** (separate repo). Valence may still apply for course/template operations — use `elc-valence-api` skill.

## Team doc hub (optional)

Cross-topic guides: [uga-online-cursor-docs](https://github.com/uga-ool/uga-online-cursor-docs)
