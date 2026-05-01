# eLC ⇄ Google Sync Widget

Admin-only widget for syncing course content between eLC (D2L Brightspace) templates and Google Drive. Placed in a live class and visible only to admins. Implemented as the `uga-elc-google-sync` Lit component (see [src/components/uga-elc-google-sync.ts](../src/components/uga-elc-google-sync.ts)) and an optional standalone React app + Node API in this folder.

## Operations

1. **Export** – Export the original template for the live course to Google Drive
2. **Clear** – Clear the template contents
3. **Back-copy** – Back-copy the live course's files to the template

## Project Structure

```
elc-google-sync/
├── app/          # React frontend (embedded in eLC content)
├── api/          # Node.js backend (Google Drive, D2L proxy)
├── SPEC.md       # Detailed specification and API requirements
└── README.md
```

## Tech Stack

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Node.js + Express (for OAuth, file operations)
- **D2L:** Valence/LP API (Content, Org Unit, Roles)
- **Google Drive:** Drive API (OAuth or service account)

## Setup

See `api/README.md` and `app/README.md` for setup instructions.

## Related

- Role detection pattern: `uga-instructor-note` (excludedRoles, instructor role IDs)
- D2L Content API: `src/lib/api/d2l-client-content.ts`
- Course ID: `getCourse()` from `d2l-utils.ts`
