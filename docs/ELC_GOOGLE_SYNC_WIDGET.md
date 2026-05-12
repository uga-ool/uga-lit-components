# eLC ⇄ Google Sync widget (`uga-elc-google-sync`)

Design reference for the admin-only widget described in [FEATURE_REQUESTS.md](../FEATURE_REQUESTS.md) (section 6). This document records **Phase 0 decisions** (institution-specific placeholders), **security/UX** expectations, and pointers to API research. Implementation details for Valence routes live in [COURSE_TEMPLATE_API_SPIKE.md](./COURSE_TEMPLATE_API_SPIKE.md).

## Product goals

1. **Export** – Archive a template snapshot or course files to **Google Drive** (or another store via backend).
2. **Clear** – Remove or reset **template** content/files per agreed rules (destructive).
3. **Back-copy** – Copy **live course** content/files into the **template** org unit.

## Phase 0 – Institutional decisions (fill in for UGA)

| Decision | Placeholder / default | Notes |
|----------|------------------------|--------|
| **Admin detection** | Component attributes `admin-role-names` and/or `admin-role-ids` | Match `Enrollment.Role.Name` / `Role.Id` from Valence enrollments. **Do not ship** with empty allowlists in production unless combined with `stub-mode` for demos only. |
| **Template ↔ live mapping** | Attributes `template-ou` (required for actions) and implicit **live** = current course from `getCourse()` unless `live-ou` is set | Alternative: org naming convention documented here: `________________`. |
| **Google Drive** | Service account or OAuth via **backend**; secrets never in `uga-components.js` | See [server/drive-upload/README.md](../server/drive-upload/README.md). |
| **“Clear” semantics** | Document whether Clear removes **Manage Files** only, **Content** topics only, or both; whether soft-delete is possible | Requires API spike confirmation. |

## Phase 2 – Security and UX (enforced in component)

- **Visibility:** Non-admins see **no actionable UI** (single line or empty; no leaked template OU in attributes for non-admins—prefer server-side gating for sensitive IDs if needed).
- **Confirmations:** Typed confirmation (e.g. course code) for **Clear** and **Back-copy** before calling APIs.
- **Audit:** Log actions to console in dev; production should use **server audit** if a backend exists.
- **Stub mode:** `stub-mode` attribute shows the UI for **demos and local HTML** without performing destructive operations.

## MVP (suggested rollout)

1. **Read-only preview** – Resolve live/template OUs, show content TOC summary (module counts) via existing Content API. **Implemented** as the first milestone in the component.
2. **Export to Drive** – Wire to backend upload endpoint after Phase 1 proves file payload.
3. **Back-copy** – After Valence spike confirms cross-org copy or import/export package flow.
4. **Clear** – Last, with mandatory backup and strongest guardrails.

## Related files

- Component: [src/components/uga-elc-google-sync.ts](../src/components/uga-elc-google-sync.ts)
- API helpers: [src/lib/api/d2l-client-elc-google-sync.ts](../src/lib/api/d2l-client-elc-google-sync.ts)
- Demo: [demo/elc-google-sync.html](../demo/elc-google-sync.html)
- Specification / open questions: [docs/ELC_GOOGLE_SYNC_SPEC.md](./ELC_GOOGLE_SYNC_SPEC.md)
- Full **Drive ↔ Manage Files** standalone app: **`uga-drive-elc-sync`** (separate repository), not duplicated under this package.
- Local **`uga-video`** analytics backend (Express on port 3001): [server/video-analytics/](../server/video-analytics/)
