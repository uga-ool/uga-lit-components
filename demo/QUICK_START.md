# Quick Start Guide: UGA Lit Components Demo

## What You Just Got

A comprehensive demo system with **17 dedicated pages** showcasing all UGA Lit components:

- ✅ **Main demo page** (`index-all-in-one.html`) - Comprehensive all-in-one scrollable demo with all components
- ✅ **15 individual demo pages** - One per component (including Quiz), perfect for eLC side navigation
- ✅ **Setup guide** (`setup.html`) - Deployment instructions and troubleshooting
- ✅ **Property documentation** tables for every component
- ✅ **Copy-paste ready** code snippets
- ✅ **Sample data files** with Google Drive links for easy sharing
- ✅ **Auto-generated table of contents** on main pages

## Recent Updates (January 2026)

### What's New

- 🎨 **Separated demos**: Each component now has its own HTML page for easier testing
- 🎬 **Enhanced video component**: Kaltura logo hiding, better player management
- 📂 **Accordion refactored**: Direct axios pattern, improved error handling
- 🗂️ **TOC filtering**: Now scans h2/h3 only for cleaner navigation
- 🐛 **Bug fixes**: Accordion icons, footer paths, axios errors

👉 See [../CHANGELOG.md](../CHANGELOG.md) for complete details

## Files Created

```
demo/
├── index-all-in-one.html        # Main comprehensive demo (all components)
├── setup.html                    # Setup & usage guide
├── accordion.html                # Individual component demos (14 pages)
├── assignment.html               #   Each shows one component in detail
├── circles.html                  #   Perfect for eLC side navigation
├── code.html
├── duedate.html
├── footer.html
├── instructor-note.html
├── module-feedback.html
├── quiz.html
├── quiz-sync-note.html
├── rating.html
├── return-to-top.html
├── slideshow.html
├── tabs.html
├── toc.html
├── video.html
├── QUICK_START.md               # This file
├── accordion-demo.json           # Sample data files (available on Google Drive)
├── tabs-demo.json
├── circles-demo.json
├── slideshow-demo.json
├── footer-demo.json
└── instructor-note-demo.html
```

## View the Demo Locally

### Quick Test (Development Mode)

```bash
npm run dev
```

Then open: `http://localhost:5173/demo/index-all-in-one.html`

**Navigate the demos:**

- Main demo: `http://localhost:5173/demo/index-all-in-one.html`
- Individual component: `http://localhost:5173/demo/accordion.html`
- Setup guide: `http://localhost:5173/demo/setup.html`

### Production Preview (After Building)

```bash
npm run build
npm run preview
```

Then open: `http://localhost:4173/demo/index-all-in-one.html`

## Demo System Navigation

### Main Demo Pages

**`index-all-in-one.html`** - Main comprehensive demo page:

- Comprehensive scrollable demo with all 14 components
- Organized by category (Content, Media, Interactive, Navigation, Instructor Tools)
- Auto-generated table of contents for quick navigation
- Live examples, property tables, and code snippets for each component
- Setup instructions at the bottom

### Individual Component Pages (14 files)

Each component has a dedicated demo page:

- **One component focus** - Single live example without distraction
- **Complete documentation** - Property tables and code samples
- **eLC-friendly** - Perfect for linking from eLC side navigation
- **"Back to All Components" link** - Returns to index-all-in-one.html

**When to use:**

- Link directly from eLC course navigation
- Share specific component examples with instructional designers
- Test one component in isolation

### Setup Guide (`setup.html`)

Comprehensive guide covering:

- eLC deployment steps
- Data file creation examples
- Component-specific setup notes
- Troubleshooting common issues
- Best practices and file organization

## Use in eLC

### Step 1: Build

```bash
npm run build
```

This creates `dist/js/uga-components.js` (~113 kB, 37 kB gzipped)

### Step 2: Upload to eLC

Go to: **eLC → Content → Manage Files → Public Files**

Upload:

- `dist/js/uga-components.js` (required - the component bundle)
- Demo pages you want to use (optional - for reference or direct linking)
- Sample JSON files (optional - customize and upload as needed)

### Step 3: Create eLC Content Page

**Option A: Full Component Showcase** (use `index-all-in-one.html` content)

1. Open `demo/index-all-in-one.html` in a text editor
2. Copy the entire `<body>` content
3. In eLC, create a new Content page
4. Switch to HTML editor
5. Paste the content
6. Update script path to: `/shared/PublicFiles/uga-components.js`

**Option B: Individual Component** (use specific demo page)

1. Open desired demo page (e.g., `demo/accordion.html`)
2. Copy the `<body>` content
3. Follow steps 3-6 from Option A

**Option C: Custom Page** (build from scratch)

1. Use code snippets from any demo page
2. Add component tags as needed
3. Load bundle at end: `<script type="module" src="/shared/PublicFiles/uga-components.js"></script>`

### Step 4: Update Data File Paths

In the eLC HTML editor, update file paths to:

```html
<uga-accordion
  type="local"
  filename="/shared/PublicFiles/accordion-demo.json"
></uga-accordion>
```

## Component Quick Reference

### Components That Need Data Files

**Download example files from Google Drive links in the demo pages, then customize:**

- `<uga-accordion>` - accordion-demo.json (expandable/collapsible sections)
- `<uga-tabs>` - tabs-demo.json (tabbed content navigation)
- `<uga-circles>` - circles-demo.json (circular statistics/figures)
- `<uga-slideshow>` - slideshow-demo.json (image carousel with controls)
- `<uga-footer>` - footer-demo.json (branded footer with logo)
- `<uga-instructor-note>` - instructor-note-demo.html (instructor-only notes)

**All example files include:**

- Complete JSON structure
- Sample data you can modify
- Comments explaining each field
- Ready to upload to eLC Public Files

### Components That Work Standalone

- `<uga-toc>` - Auto-generates from h2/h3 headings on page
- `<uga-return-to-top>` - Smooth scroll button (appears after scrolling)
- `<uga-code>` - Syntax-highlighted code with copy button

### Components That Need eLC API

- `<uga-video>` - Kaltura video ID required (hides logo by default)
- `<uga-assignment>` - Displays assignments, discussions, quizzes, and content with due dates. Filter by type using the `types` property (default: all types).
- `<uga-duedate>` - Displays due dates for assignments, discussions, quizzes, and content in a table. Filter by type using the `types` property (default: all types).
- `<uga-quiz>` - Embed formative quizzes (CSV); submit results to an eLC assignment. See [Quiz demo](quiz.html) and quiz-sample.csv.
- `<uga-quiz-grade-sync>` - Instructor-only: sync quiz submissions to the linked grade item. Use `dropbox-assignment-name` (e.g. "Quiz Demo 2") or `dropbox-folder-id`. Place below the quiz or inside `uga-instructor-note`.
- `<uga-rating>` - Collects user ratings via eLC forums

## Customization Tips

### Create Your Own Data Files

Follow the JSON structure in the sample files:

**Example: Custom Accordion**

```json
{
  "title": "My Custom FAQ",
  "data": [
    {
      "title": "Question 1?",
      "body": "<p>Answer with <strong>HTML</strong> formatting</p>"
    }
  ]
}
```

### Mix and Match Components

```html
<!-- Course overview with mixed components -->
<uga-toc></uga-toc>
<uga-accordion type="local" filename="module-overview.json"></uga-accordion>
<uga-video videoid="1_icw0df6y" includerating="true"></uga-video>
<uga-circles type="local" filename="course-stats.json"></uga-circles>
<uga-return-to-top></uga-return-to-top>

<script type="module" src="/shared/PublicFiles/uga-components.js"></script>
```

## What Makes This Structure Good?

1. **Single-Page Demo** - Everything in one place for easy reference
2. **Category Organization** - Components grouped by purpose
3. **Live Examples** - See components in action immediately
4. **Copy-Paste Ready** - Code samples work as-is
5. **Complete Documentation** - Properties, descriptions, use cases
6. **Sample Data** - Working JSON files for testing
7. **eLC Ready** - Designed for seamless eLC deployment

## Next Steps

1. **Test Locally** - Run `npm run dev` and view the demo
2. **Customize** - Edit sample data files to match your needs
3. **Build** - Run `npm run build` when ready
4. **Upload to eLC** - Follow the eLC upload steps above
5. **Create Content** - Start building course pages with components!

## Troubleshooting

**"Components not loading"**

- Check that `dist/js/uga-components.js` exists (run `npm run build`)
- Verify the script path in your HTML

**"Accordion icons not showing"**

- **Add `class="js"` to your `<html>` tag:** `<html lang="en" class="js">`
- This is required for UGA CSS pseudo-element icon styles

**"Data not showing"**

- Check JSON file paths are correct
- Validate JSON syntax at jsonlint.com
- Ensure files are uploaded to eLC Public Files

**"Styles look wrong"**

- Verify `base.css` is loading from design.online.uga.edu
- Check browser console (F12) for CSS errors

**"TOC showing wrong headings"**

- TOC now scans h2 and h3 only (changed from h1-h4)
- Use h2 for major sections, h3 for subsections

**"Video not playing"**

- Verify Kaltura video ID is correct
- Check browser console for script loading errors
- Ensure player ID matches your Kaltura configuration

## Important Notes

### CSS Requirement for Accordions

Pages using `uga-accordion` must have `class="js"` on the HTML element:

```html
<html lang="en" class="js"></html>
```

### TOC Behavior Change

The table of contents component now scans **h2 and h3 headings only** (previously h1-h4). This provides cleaner navigation by excluding h4 property tables.

## Support

- **Setup Guide**: `/demo/setup.html` - Comprehensive deployment and troubleshooting
- **Main README**: `/README.md` - Project overview and architecture
- **Changelog**: `/CHANGELOG.md` - Recent updates and migration notes
- **Demo Gallery**: `/demo/index-all-in-one.html` - All components with navigation
- **Individual Demos**: `/demo/[component].html` - Dedicated component pages
- **Copilot instructions**: `/.github/copilot-instructions.md` - Development guidelines
- **Component source**: `/src/components/*.ts` - Implementation details

## What Makes This Demo System Great?

1. **Modular Structure** - Individual pages for focused testing
2. **Navigation Gallery** - Quick overview with category organization
3. **Copy-Paste Ready** - Code samples work as-is
4. **Complete Documentation** - Properties, examples, troubleshooting
5. **Sample Data Included** - Working JSON files for immediate testing
6. **eLC Ready** - Designed for seamless eLC deployment
7. **Progressive Enhancement** - Works locally and in production

---

**You're all set!** 🎉

1. Browse the demo gallery: `npm run dev` → `http://localhost:5173/demo/index-all-in-one.html`
2. Review setup guide: `/demo/setup.html`
3. Test individual components: Click cards in the gallery
4. Check changelog: `/CHANGELOG.md` for recent updates
5. Build for eLC: `npm run build` when ready to deploy
