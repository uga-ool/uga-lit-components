# Course Template Management Widget

Admin-only widget for managing course templates and live course files in eLC (D2L Brightspace). Placed in a live class and visible only to admins.

## Operations

1. **Export** – Export the original template for the live course to Google Drive
2. **Clear** – Clear the template contents
3. **Back-copy** – Back-copy the live course's files to the template

## Project Structure

```
template-manager/
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
