# Documentation index (`uga-lit-components`)

Use this map so humans and Cursor agents read the **right** doc first.

## Start here (agents and developers)

| Doc | Purpose |
|-----|---------|
| [../README.md](../README.md) | Project overview, component table, build and deploy |
| [cursor/README.md](cursor/README.md) | Cursor rules, skills, commit hooks |
| [cursor/api-references.md](cursor/api-references.md) | External APIs + links to in-repo feature docs below |
| [../.github/copilot-instructions.md](../.github/copilot-instructions.md) | AI agent patterns (light DOM, `d2l-client`, build commands) |
| [../WORKSPACE-HANDOFF.md](../WORKSPACE-HANDOFF.md) | Multi-repo workspace context (Lit + React apps) |
| [../demo/QUICK_START.md](../demo/QUICK_START.md) | Demo system layout and local URLs |
| [../scripts/README.md](../scripts/README.md) | npm scripts, git hooks, Kaltura/CSV utilities |
| [../src/README.md](../src/README.md) | Source layout, components, API modules (for agents) |

## Planning and backlog (not implementation spec)

| Doc | Purpose |
|-----|---------|
| [planning/README.md](planning/README.md) | Index for agents — start here for backlog |
| [planning/FEATURE_REQUESTS.md](planning/FEATURE_REQUESTS.md) | Instructional design requests with status |
| [planning/ROADMAP.md](planning/ROADMAP.md) | Open enhancements and new components |
| [planning/valence-backlog.md](planning/valence-backlog.md) | Open Valence / component API work |
| [planning/performance.md](planning/performance.md) | Performance: implemented vs open |

January 2026 review originals: [planning/archive/](planning/archive/).

## UGA feature docs (in-repo, authoritative)

| Doc | Component / topic |
|-----|-------------------|
| [QUIZ_JSON_FORMAT.md](QUIZ_JSON_FORMAT.md) | `uga-quiz` — JSON question file and CSV import |
| [QUIZ_DROPBOX_SETUP.md](QUIZ_DROPBOX_SETUP.md) | `uga-quiz` / `uga-quiz-grade-sync` — eLC assignment submissions and grade sync |
| [COURSE_CALENDAR_FORMAT.md](COURSE_CALENDAR_FORMAT.md) | `uga-course-calendar` — JSON and CSV calendar data |
| [ELC_GOOGLE_SYNC_WIDGET.md](ELC_GOOGLE_SYNC_WIDGET.md) | `uga-elc-google-sync` — widget design, security, MVP |
| [ELC_GOOGLE_SYNC_SPEC.md](ELC_GOOGLE_SYNC_SPEC.md) | Product spec and open questions |
| [COURSE_TEMPLATE_API_SPIKE.md](COURSE_TEMPLATE_API_SPIKE.md) | Valence API spike checklist for template export/clear/back-copy |

Demos: [`../demo/`](../demo/) (HTML) and [`../demo/setup.html`](../demo/setup.html) (deployment checklist).

## Cursor-only (`docs/cursor/`)

| Doc | Purpose |
|-----|---------|
| [cursor/where-to-edit.md](cursor/where-to-edit.md) | Allowed paths for changes |
| [cursor/how-to-commit.md](cursor/how-to-commit.md) | Commit message and rhythm |
| [cursor/secrets.md](cursor/secrets.md) | Secrets and FERPA |

## Archived — do not use for Lit course-file work

| Location | Notes |
|----------|--------|
| [archive/d2l-platform-reference/](archive/d2l-platform-reference/) | Offline mirror of D2L Developer Platform docs. Prefer [Valence online](https://docs.valence.desire2learn.com/reference.html) and `elc-valence-api` skill. |

## Related repos

- **Google Drive ↔ eLC (full app):** `uga-drive-elc-sync` (not duplicated in this package)
- **Team doc hub:** [uga-online-cursor-docs](https://github.com/uga-ool/uga-online-cursor-docs)
