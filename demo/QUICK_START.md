# Quick Start Guide: UGA Lit Components Demo

## What You Just Got

A comprehensive demo system with **15 dedicated pages** showcasing all UGA Lit components:

- ✅ **Navigation gallery** (`index.html`) with component cards organized by category
- ✅ **Individual demo pages** for each component with live examples
- ✅ **Setup guide** (`setup.html`) with deployment instructions and troubleshooting
- ✅ **Property documentation** tables for every component
- ✅ **Copy-paste ready** code snippets
- ✅ **Sample data files** for testing
- ✅ **Auto-generated table of contents** on main page

## Recent Updates (November 2025)

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
├── index.html                    # Main navigation gallery
├── setup.html                    # Setup & usage guide (NEW)
├── accordion.html                # Individual component demos
├── assignment.html
├── circles.html
├── code.html
├── duedate.html
├── footer.html
├── instructor-note.html
├── module-feedback.html
├── rating.html
├── return-to-top.html
├── slideshow.html
├── tabs.html
├── toc.html
├── video.html
├── index-all-in-one.html        # Original unified demo (preserved)
├── README.md                     # Detailed documentation
├── QUICK_START.md               # This file
├── accordion-demo.json           # Sample data files
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

Then open: `http://localhost:5173/demo/index.html`

**Navigate the demos:**

- Main gallery: `http://localhost:5173/demo/index.html`
- Individual component: `http://localhost:5173/demo/accordion.html`
- Setup guide: `http://localhost:5173/demo/setup.html`

### Production Preview (After Building)

```bash
npm run build
npm run preview
```

Then open: `http://localhost:4173/demo/index.html`

## Demo System Navigation

### Main Gallery (`index.html`)

- Browse all components organized by category
- Click component cards to view individual demos
- Includes comprehensive table of contents
- Links to setup guide and documentation

### Individual Component Pages

Each component has a dedicated demo page:

- Live working example
- Complete property documentation
- Sample code snippets
- "Back to All Components" navigation link

### Setup Guide (`setup.html`)

Comprehensive guide covering:

- D2L deployment steps
- Data file creation examples
- Component-specific setup notes
- Troubleshooting common issues
- Best practices and file organization

## Use in D2L (Brightspace)

### Step 1: Build

```bash
npm run build
```

This creates `dist/js/uga-components.js`

### Step 2: Upload to D2L

Go to: **D2L → Content → Manage Files → Public Files**

Upload:

- `dist/js/uga-components.js`
- All `demo/*.json` and `demo/*.html` files

### Step 3: Copy Demo HTML to eLC Content Page

1. Open `demo/index.html` in a text editor
2. Copy the entire `<body>` content (everything inside `<body>...</body>`)
3. In D2L, create a new Content page
4. Switch to HTML editor
5. Paste the content
6. Make sure the script tag points to: `/shared/PublicFiles/uga-components.js`

### Step 4: Update Data File Paths

In the D2L HTML editor, update file paths to:

```html
<uga-accordion
  type="local"
  filename="/shared/PublicFiles/accordion-demo.json"
></uga-accordion>
```

## Component Quick Reference

### Components That Need Data Files

- `<uga-accordion>` - accordion-demo.json
- `<uga-tabs>` - tabs-demo.json
- `<uga-circles>` - circles-demo.json
- `<uga-slideshow>` - slideshow-demo.json
- `<uga-footer>` - footer-demo.json
- `<uga-instructor-note>` - instructor-note-demo.html

### Components That Work Standalone

- `<uga-toc>` - Auto-generates from page headings
- `<uga-return-to-top>` - No configuration needed
- `<uga-code>` - Add code inline or via filename attribute

### Components That Need D2L API

- `<uga-video>` - Needs Kaltura video ID
- `<uga-assignment>` - Displays all course assignments automatically
- `<uga-duedate>` - Needs D2L assignment name
- `<uga-rating>` - Works in eLC environment
- `<uga-module-feedback>` - Works in eLC environment

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
7. **D2L Ready** - Designed for easy migration to Brightspace

## Next Steps

1. **Test Locally** - Run `npm run dev` and view the demo
2. **Customize** - Edit sample data files to match your needs
3. **Build** - Run `npm run build` when ready
4. **Upload to D2L** - Follow the D2L upload steps above
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
- Ensure files are uploaded to D2L Public Files

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
- **Demo Gallery**: `/demo/index.html` - All components with navigation
- **Individual Demos**: `/demo/[component].html` - Dedicated component pages
- **Copilot instructions**: `/.github/copilot-instructions.md` - Development guidelines
- **Component source**: `/src/components/*.ts` - Implementation details

## What Makes This Demo System Great?

1. **Modular Structure** - Individual pages for focused testing
2. **Navigation Gallery** - Quick overview with category organization
3. **Copy-Paste Ready** - Code samples work as-is
4. **Complete Documentation** - Properties, examples, troubleshooting
5. **Sample Data Included** - Working JSON files for immediate testing
6. **D2L Ready** - Designed for seamless Brightspace deployment
7. **Progressive Enhancement** - Works locally and in production

---

**You're all set!** 🎉

1. Browse the demo gallery: `npm run dev` → `http://localhost:5173/demo/index.html`
2. Review setup guide: `/demo/setup.html`
3. Test individual components: Click cards in the gallery
4. Check changelog: `/CHANGELOG.md` for recent updates
5. Build for D2L: `npm run build` when ready to deploy
