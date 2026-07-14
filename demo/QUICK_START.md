# Quick Start Guide: UGA Lit Components Demo

## What You Just Got

A comprehensive demo system with **multiple HTML pages** (hub, per-component demos, setup, and quiz variants) showcasing UGA Lit components:

- ✅ **Main demo page** (`index-all-in-one.html`) - Comprehensive all-in-one scrollable demo with all components
- ✅ **20 individual demo pages** - One HTML file per component showcase (**21** components in the bundle; `uga-quiz-grade-sync` is demonstrated on `quiz.html`). Plus `quiz/quiz10.html` and `quiz/quiz20.html` variants.
- ✅ **Setup guide** (`setup.html`) - Deployment instructions and troubleshooting
- ✅ **Property documentation** tables for every component
- ✅ **Copy-paste ready** code snippets
- ✅ **Sample data files** with Google Drive links for easy sharing
- ✅ **Auto-generated table of contents** on main pages

## Recent updates

See [../CHANGELOG.md](../CHANGELOG.md) for component changes (callout, course calendar, eLC Google Sync, quiz grade sync, footer program codes, and more). Demo pages use the production bundle path `/shared/ugaonline/js/uga-components.js` and link to [setup.html](setup.html) for deployment steps.

## Demo files layout

```
demo/
├── index-all-in-one.html         # All components on one scrollable page
├── setup.html                    # Deployment, data files, troubleshooting
├── QUICK_START.md                # This file
├── accordion.html                # Per-component demo pages (20 total)
├── assignment.html
├── callout.html
├── circles.html
├── code.html
├── course-analytics.html
├── course-calendar.html
├── duedate.html
├── elc-google-sync.html          # uga-elc-google-sync (admin / stub-mode demo)
├── footer.html
├── image.html
├── instructor-card.html
├── instructor-note.html
├── quiz.html
├── rating.html
├── return-to-top.html
├── slideshow.html
├── tabs.html
├── toc.html
├── video.html
├── accordion/accordion-demo.json
├── tabs/tabs-demo.json
├── circles/circles-demo.json
├── slideshow/slideshow-demo.json
├── footer/footer-demo.json
├── instructor-note/instructor-note-demo.html
├── videos/videos-demo.json
├── image/demo_image.jpg          # Sample image for uga-image demos
├── course-calendar/
│   ├── course-calendar-demo.json
│   ├── course-calendar-demo.csv
│   └── course-calendar-template.csv
└── quiz/
    ├── quiz10.html               # Smaller quiz demo page
    ├── quiz20.html               # Larger quiz demo page
    ├── quiz10.json
    ├── quiz20.json
    ├── quiz-sample.json          # All six question types (JSON)
    ├── quiz-sample.csv           # Same types in eLC question-import CSV format
    ├── quiz-demo.json            # Extra template
    ├── quiz-sync-note.html       # Wraps uga-quiz-grade-sync for instructors
    └── quiz-sync-note-basic.html
```

Repo root [`index.html`](../index.html) links to the all-in-one demo, setup guide, and a few focused pages.

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

- Comprehensive scrollable demo with all components
- Organized by category (Content, Media, Interactive, Navigation, Instructor Tools)
- Auto-generated table of contents for quick navigation
- Live examples, property tables, and code snippets for each component
- Setup instructions at the bottom

### Individual component pages

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

This creates `dist/js/uga-components.js` (run `npm run build` to see current size; recently ~301 kB, ~83 kB gzipped)

### Step 2: Upload to eLC

Deploy the bundle so it is available at **`/shared/ugaonline/js/uga-components.js`** (production path used by instructional designers). Upload location may be eLC Manage Files or your institution’s shared storage; ensure the final URL is `/shared/ugaonline/js/uga-components.js`.

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
6. Update script path to: `/shared/ugaonline/js/uga-components.js` (production path for instructional designers)

**Option B: Individual Component** (use specific demo page)

1. Open desired demo page (e.g., `demo/accordion.html`)
2. Copy the `<body>` content
3. Follow steps 3-6 from Option A

**Option C: Custom Page** (build from scratch)

1. Use code snippets from any demo page
2. Add component tags as needed
3. Load bundle at end: `<script type="module" src="/shared/ugaonline/js/uga-components.js"></script>`

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

- `<uga-quiz>` - e.g. `quiz/quiz-sample.json`, `quiz/quiz10.json`, or `quiz/quiz20.json` for JSON, or `quiz/quiz-sample.csv` for the eLC question-import CSV format. Set `type="local"` (JSON) or `type="csv"` (CSV) and point `filename` at the relative or Manage Files path. See [docs/QUIZ_JSON_FORMAT.md](../docs/QUIZ_JSON_FORMAT.md) for the JSON format and CSV usage notes.
- `<uga-accordion>` - `accordion/accordion-demo.json` (expandable/collapsible sections)
- `<uga-tabs>` - `tabs/tabs-demo.json` (tabbed content navigation)
- `<uga-circles>` - `circles/circles-demo.json` (circular statistics/figures)
- `<uga-slideshow>` - `slideshow/slideshow-demo.json` (image carousel with controls)
- `<uga-footer>` - `footer/footer-demo.json` (course file), or `program` / `name` (built-in logo/link); optional `data-file="footer.json"` for shared template data
- `<uga-instructor-note>` - `instructor-note/instructor-note-demo.html` (instructor-only notes)
- `<uga-course-calendar>` - `course-calendar/course-calendar-demo.json` or `.csv` (`type="local"` or `type="csv"`); starter template `course-calendar-template.csv`. Optional `sync-from-course` when rows use `dueTags[].folderId`. See [Course Calendar demo](course-calendar.html) and [docs/COURSE_CALENDAR_FORMAT.md](../docs/COURSE_CALENDAR_FORMAT.md).

**All example files include:**

- Complete JSON structure
- Sample data you can modify
- Comments explaining each field
- Ready to upload to eLC Public Files

### Components That Work Standalone

- `<uga-callout>` - Semantic callout/aside with fixed type-to-color styles (`note`, `important`, `tip`, `example`, `warning`), optional `label`, optional `body` attribute (plain text), and slot content for richer HTML. See [Callout demo](callout.html).
- `<uga-image>` - Displays an image with optional caption in a styled container. Click to expand in a lightbox with zoom/pan. Use `src` (image path), `alt` (required), and optional `caption`. When the image is in an `image/` folder next to your HTML page, use `src="image/your-image.jpg"`. In eLC, use the full path from Manage Files (right-click file → Copy Path). See [Image demo](image.html).
- `<uga-toc>` - Auto-generates from h2/h3 headings on page
- `<uga-return-to-top>` - Smooth scroll button (appears after scrolling)
- `<uga-code>` - Syntax-highlighted code with copy button

### Components That Need eLC API

- `<uga-video>` - Kaltura `videoid` required; optional `topic-id` for D2L completion tracking. See [Video demo](video.html).
- `<uga-assignment>` - Assignments, discussions, quizzes, and content with due dates. Filter with `types`. See [Assignment demo](assignment.html).
- `<uga-duedate>` - Due-date table for the same activity types. See [Due date demo](duedate.html).
- `<uga-instructor-card>` - Instructor photos/names from the classlist API; optional `username` pin list. See [Instructor card demo](instructor-card.html).
- `<uga-quiz>` - Formative quizzes from JSON (`type="local"`) or eLC question-import CSV (`type="csv"`). See [Quiz demo](quiz.html), [docs/QUIZ_JSON_FORMAT.md](../docs/QUIZ_JSON_FORMAT.md), and [docs/QUIZ_DROPBOX_SETUP.md](../docs/QUIZ_DROPBOX_SETUP.md) for assignment submission.
- `<uga-quiz-grade-sync>` - Instructor-only: sync quiz submissions to the linked grade item via `dropbox-assignment-name` or `dropbox-folder-id`. See quiz sync snippets in [quiz.html](quiz.html).
- `<uga-rating>` - Collects user ratings via eLC forums. See [Rating demo](rating.html).
- `<uga-course-analytics>` - Aggregated content, assignment, and discussion analytics. Hide the page from students with release conditions. See [Course analytics demo](course-analytics.html).
- `<uga-elc-google-sync>` - Admin-only template / Google Drive sync widget (MVP: read-only preview; use `stub-mode` in demos). See [eLC Google Sync demo](elc-google-sync.html) and [docs/ELC_GOOGLE_SYNC_WIDGET.md](../docs/ELC_GOOGLE_SYNC_WIDGET.md).

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

<script type="module" src="/shared/ugaonline/js/uga-components.js"></script>
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

- Verify Google Fonts, `base.css`, and `scripts.js` load from design.online.uga.edu (see [installation](https://design.online.uga.edu/getting-started/installation/))
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

- **Documentation index**: `/docs/README.md` - UGA feature docs vs archived D2L reference
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
