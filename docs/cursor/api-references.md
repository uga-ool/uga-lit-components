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

## Google Drive (related widget)

Lit component `uga-elc-google-sync` and team specs live in the doc hub:

- [uga-online-cursor-docs — content-markdown-and-drive-sync](https://github.com/uga-ool/uga-online-cursor-docs/tree/main/docs/content-markdown-and-drive-sync)

Valence may still apply for course/template operations — use `elc-valence-api` skill.

## Team doc hub (optional)

Cross-topic guides: [uga-online-cursor-docs](https://github.com/uga-ool/uga-online-cursor-docs)
