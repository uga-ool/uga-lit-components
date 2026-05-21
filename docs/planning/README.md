# Planning docs (`uga-lit-components`)

**For Cursor agents:** Treat this folder as **backlog and history**, not implementation spec. Before changing code, verify against:

| Source of truth | Use for |
|-----------------|---------|
| [`../README.md`](../README.md) | Shipped components, build, deploy |
| [`../../CHANGELOG.md`](../../CHANGELOG.md) | What actually shipped |
| [`../src/README.md`](../src/README.md) | Source layout, `d2l-client`, utilities |
| [`../README.md`](../README.md) (docs index) | Feature docs (`QUIZ_*`, `ELC_GOOGLE_SYNC_*`, etc.) |

Do **not** copy long code blocks from archived January 2026 reviews without checking `src/lib/api/d2l-client.ts` first — many APIs are already implemented.

## Active planning files

| Doc | Purpose |
|-----|---------|
| [FEATURE_REQUESTS.md](FEATURE_REQUESTS.md) | Instructional design backlog with **status** per request |
| [ROADMAP.md](ROADMAP.md) | Open enhancements and **new** component ideas (not yet built) |
| [valence-backlog.md](valence-backlog.md) | Open Valence API / component integration work |
| [performance.md](performance.md) | Performance work: **implemented** vs **open** |

## Archived (January 2026 review)

Full originals (pre-consolidation) live in [archive/](archive/). Use only for historical context or grep; prefer the four active files above.

| Archived file | Superseded by |
|---------------|---------------|
| `FEATURE_REQUESTS.md` | [FEATURE_REQUESTS.md](FEATURE_REQUESTS.md) (this folder) |
| `FUTURE_IMPROVEMENTS_AND_COMPONENTS.md`, `QUICK_WINS_AND_SUGGESTIONS.md` | [ROADMAP.md](ROADMAP.md) |
| `API_REVIEW_IMPROVEMENTS.md`, `COMPONENT_IMPROVEMENTS.md` | [valence-backlog.md](valence-backlog.md) |
| `EFFICIENCY_*.md`, `ADDITIONAL_IMPROVEMENTS_SUMMARY.md` | [performance.md](performance.md) |

## Related repos

- **Course template / Drive sync (full app):** `uga-drive-elc-sync`
- **Team doc hub:** `uga-online-cursor-docs`
