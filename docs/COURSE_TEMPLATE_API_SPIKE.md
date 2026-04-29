# Course template management – API spike checklist

**Purpose:** Validate which **Valence (LE/LP)** operations are available to your **admin** user in the eLC tenant before implementing Export / Clear / Back-copy.

## Already used in this repo

| Capability | Endpoint pattern (relative to site) | Code |
|------------|--------------------------------------|------|
| Content TOC | `GET /d2l/api/le/{version}/{ou}/content/toc` | [d2l-client-content.ts](../src/lib/api/d2l-client-content.ts) `getContentTOC` |
| Topic metadata | `GET .../content/topics/{topicId}` | `getContentTopic` |
| Topic file body | `GET .../content/topics/{topicId}/file` | `getContentTopicHtml` |

## To verify in sandbox (admin user)

Use Brightspace **Valence documentation** (Learning Environment + Learning Platform) for your exact API version.

1. **Manage Files / file repository**  
   - List and download **managed files** for an org unit (paths often under `file-management` or `content` depending on version).  
   - **Spike:** confirm `GET`/`POST`/`DELETE` for files under both **live** and **template** OUs.

2. **Cross-org copy**  
   - Check for **import package**, **export package**, **copy course**, or **content object** copy APIs.  
   - **Spike:** many tenants use **native** course copy tools; a browser-only widget may not have permission—backend may be required.

3. **Destructive delete**  
   - Enumerate modules/topics before delete; confirm **batch** limits and **XSRF** headers (same pattern as [d2l-client.ts](../src/lib/api/d2l-client.ts)).

4. **Permissions**  
   - Document which **scopes** or **role permissions** the test user has. If calls fail with 403, record whether an **app registration** or **server-to-server** token is needed.

## Deliverable

A short appendix (table) of: **HTTP method + path + status (200/403) + notes** for each operation attempted. Attach to the Phase 0 design review when promoting past MVP.
