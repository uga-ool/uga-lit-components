---
name: kaltura-api
description: Kaltura video API and embed patterns for uga-lit-components. Use when working on uga-video, Kaltura player, entry_id, or media session calls.
---

# Kaltura API — Lit components

## Official documentation

- **API docs home:** https://developer.kaltura.com/api-docs/
- **Service index** (browse by service): https://developer.kaltura.com/api-docs/service/documents

Use the developer portal to confirm request/response fields for the service you need (session, media, etc.).

## UGA conventions (this repo)

- **Canonical implementation:** [`src/components/uga-video.ts`](../../src/components/uga-video.ts)
- **Embed (eLC pages):** KalturaPlayer via `embedPlaykitJs` from `cdnapisec.kaltura.com` (partner `1727411`, configurable `uiconf_id`).
- **API v3 examples in repo:** `session/action/startWidgetSession`, `media/action/get` — credentials must stay in **local/env only**, never committed.
- **Prefer** existing iframe / player lifecycle patterns (logo disabled in ui config, player instance map, cleanup on disconnect).
- **Do not** add Kaltura to non-video components.

## Workflow

1. Read `uga-video.ts` for embed vs API usage.
2. Check Kaltura docs for the specific action.
3. Keep secrets out of git; use gitignored config on the developer machine.
4. Update demo page under `demo/` when behavior is user-visible.

## Related team repos

- Caption/transcript pipelines: [uga-elc-kaltura-caption-import](https://github.com/uga-ool/uga-elc-kaltura-caption-import) (not this repo).

## Links

- [`docs/cursor/api-references.md`](../../docs/cursor/api-references.md)
