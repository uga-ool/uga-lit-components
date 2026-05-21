# D2L Developer Platform reference (offline mirror)

These files are **copies of Brightspace Developer Platform documentation** (January 2026). They are **not** UGA Lit component guides.

## Prefer official docs

For Valence API work in this repo, use:

- [Valence API reference](https://docs.valence.desire2learn.com/reference.html)
- [HTTP scopes](https://docs.valence.desire2learn.com/http-scopestable.html)
- [`docs/cursor/api-references.md`](../../cursor/api-references.md) and the **`elc-valence-api`** Cursor skill

## When to use this folder

- Offline reading only
- Rare lookup of routing tables or OAuth2 setup for **separate** server/LTI apps (not course-file Lit components)

## Course-file Lit components

Embedded `uga-*` components run **inside eLC** with the user’s browser session and **bundled** `axios` in `uga-components.js`. They do **not** use OAuth2 Bearer tokens described in `D2L_OAUTH2.md` here.

## Files in this archive

| File | Topic |
|------|--------|
| `D2L_API_INDEX.md` | API type index |
| `D2L_API_ROUTING_TABLE.md` | HTTP routing table |
| `D2L_API_VERSIONS.md` | API versions |
| `D2L_AUTHENTICATION_SCOPES.md` | Auth scopes |
| `D2L_ILP_UI_INTEGRATION.md` | ILP UI integration |
| `D2L_OAUTH2.md` | OAuth 2.0 apps |
| `D2L_TYPOGRAPHICAL_CONVENTIONS.md` | Reference typography |
| `D2L_USER_AUTHENTICATION.md` | User authentication |

UGA-specific assignment/quiz workflow: [`../../QUIZ_DROPBOX_SETUP.md`](../../QUIZ_DROPBOX_SETUP.md).
