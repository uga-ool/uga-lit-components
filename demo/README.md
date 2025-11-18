# UGA Lit Components Demo

This directory contains a comprehensive demonstration page showcasing all UGA Lit components.

## Files

- **index.html** - Main demo page with all components
- **accordion-demo.json** - Sample data for accordion component
- **tabs-demo.json** - Sample data for tabs component
- **circles-demo.json** - Sample data for circles component
- **slideshow-demo.json** - Sample data for slideshow component
- **footer-demo.json** - Sample data for footer component
- **instructor-note-demo.html** - Sample HTML for instructor note component

## Running the Demo Locally

### Option 1: Using Vite Dev Server (Recommended)

From the project root:

```bash
npm run dev
```

Then navigate to: `http://localhost:5173/demo/index.html`

### Option 2: Using Vite Preview (After Build)

Build the components first:

```bash
npm run build
```

Then start the preview server:

```bash
npm run preview
```

Navigate to: `http://localhost:4173/demo/index.html`

### Option 3: Using a Simple HTTP Server

If you prefer a different server, build first and then serve:

```bash
npm run build
npx serve .
```

## Using in D2L/Brightspace

### 1. Build the Bundle

```bash
npm run build
```

This creates `dist/js/uga-components.js`

### 2. Upload Files to D2L

Upload the following to **D2L → Content → Manage Files → Public Files**:

- `dist/js/uga-components.js` (the component bundle)
- All JSON/HTML data files from the `demo/` directory
- Any custom data files you create

### 3. Create Your Content Page

In D2L, create an HTML page with your components and load the bundle:

```html
<!-- Your components -->
<uga-accordion type="local" filename="accordion-demo.json"></uga-accordion>
<uga-video videoid="1_abc123de"></uga-video>

<!-- Load bundle at end -->
<script type="module" src="/shared/PublicFiles/uga-components.js"></script>
```

## Component Categories

### Content Components

- **Accordion** - Expandable/collapsible sections
- **Tabs** - Tabbed content navigation
- **Slideshow** - Image carousel
- **Table of Contents** - Auto-generated navigation

### Media Components

- **Video** - Kaltura video player (logo hidden by default)
- **Code** - Syntax-highlighted code blocks

### Interactive Components

- **Rating** - User rating collection
- **Circles** - Statistical/visual data display
- **Assignment** - D2L assignment details

### Navigation Components

- **Return to Top** - Smooth scroll to top button
- **Footer** - Branded footer

### Instructor Tools

- **Instructor Note** - Role-restricted content
- **Due Date** - Assignment due date display
- **Module Feedback** - Qualtrics survey embed

## Data File Formats

### Accordion Data

```json
{
  "title": "Section Title",
  "data": [
    {
      "title": "Item Title",
      "body": "<p>HTML content</p>"
    }
  ]
}
```

### Tabs Data

```json
{
  "data": [
    {
      "title": "Tab Title",
      "body": "<p>HTML content</p>"
    }
  ]
}
```

### Circles Data

```json
{
  "data": [
    {
      "figure": "85%",
      "caption": "Description"
    }
  ]
}
```

### Slideshow Data

```json
{
  "title": "Slideshow Title",
  "description": "Description",
  "id": "unique-id",
  "data": [
    {
      "src": "image-url.jpg",
      "alt": "Alt text",
      "title": "Slide Title",
      "description": "Slide description"
    }
  ]
}
```

### Footer Data

```json
{
  "data": {
    "link": "https://example.com",
    "alt": "Logo alt text"
  }
}
```

## Notes

- Some components (Assignment, Due Date, Rating, Instructor Note) require D2L API access
- The demo uses mock axios when not in D2L environment
- All components use Light DOM for compatibility with Brightspace
- External dependencies (Prism.js for code highlighting, Kaltura for video) are loaded via CDN

## Troubleshooting

**Components not loading:**

- Check that `dist/js/uga-components.js` exists
- Verify the script tag path is correct
- Check browser console for errors

**Data not displaying:**

- Verify JSON file paths are correct
- Check JSON syntax validity
- Ensure files are uploaded to correct location in D2L

**Styles not working:**

- Ensure `base.css` is loading: `https://design.online.uga.edu/css/base.css`
- Check that components are using Light DOM (`createRenderRoot() { return this; }`)

## Support

For issues or questions:

- Check the main project README
- Review component source code in `src/components/`
- Contact UGA Online Learning development team
