# Template Manager App

React frontend for the Course Template Management Widget. Embed in eLC content; visible only to admins.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output in `dist/`. Deploy to eLC Public Files or host elsewhere and embed via iframe.

## Admin Visibility

The widget should be placed in content and hidden from non-admins. Options:

1. **Release condition** – eLC release condition: "Role is Administrator"
2. **Client-side** – Fetch enrollment, hide if role not admin (like `uga-instructor-note`)
3. **Separate admin page** – Link only in Course Admin or Tools
