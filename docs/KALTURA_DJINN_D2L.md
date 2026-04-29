# Kaltura Djinn + `uga-video` in eLC

**Kaltura Djinn** is a separate service (repo **uga-kaltura-djinn**) that answers learner questions from video captions. The **`uga-video`** component calls Djinn from the browser when enabled.

## Server

Deploy Djinn on **HTTPS**, configure **`ALLOWED_ORIGINS`** for your Brightspace hostname(s), and set Kaltura + LLM secrets per [uga-kaltura-djinn `docs/D2L_READINESS.md`](https://github.com/uga-ool/uga-kaltura-djinn/blob/main/docs/D2L_READINESS.md) (or your fork).

## Markup

After building and loading **`uga-components.js`** as usual:

```html
<uga-video
  videoid="YOUR_ENTRY_ID"
  enable-djinn
  djinn-api-base="https://your-djinn-host.edu"
></uga-video>
```

If the Djinn server uses **`DJINN_API_KEY`**, add **`djinn-api-key="..."`** (sensitive).

## Attributes

| Attribute | Role |
|-----------|------|
| `enable-djinn` | Turns on the Djinn panel |
| `djinn-api-base` | Djinn API origin (no trailing slash) |
| `djinn-api-key` | Optional shared secret header |

Implementation: `src/components/uga-video.ts`.
