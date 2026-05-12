# Changelog

All notable changes to this project will be documented in this file.


## [Unreleased] - 2026-01-09

### Repository

- Removed **`elc-google-sync/`** (standalone React “Course Template Manager” duplicate of Drive sync). Canonical app: **`uga-drive-elc-sync`**. Video analytics Express API moved to [server/video-analytics/](server/video-analytics/); widget spec moved to [docs/ELC_GOOGLE_SYNC_SPEC.md](docs/ELC_GOOGLE_SYNC_SPEC.md).

### uga-video

- Default Kaltura player / uiConf ID is **57494843** when `playerid` is not set (aligned `playerid` internal default with the loaded uiConf; demos and setup docs updated)

### uga-callout

- Added new `uga-callout` component for semantic callout blocks rendered as `<aside>` with slot content
- Supports five fixed callout types with consistent brand-color mapping: `note`, `important`, `tip`, `example`, `warning`
- Added optional `label` property rendered as a bold `<p>` pseudo-heading (not an h2/h3, so TOC heading scans are unaffected)
- Added demos in `demo/callout.html` and `demo/index-all-in-one.html`, plus setup/reference docs in `demo/setup.html`, `demo/QUICK_START.md`, and `README.md`

### uga-course-calendar

- Added new `uga-course-calendar` component for rendering full week-by-week course calendars from JSON (static or program data source)
- Supports row types (`open`, `due`, `holiday`, `deadline`, `exam`, `final`, `lastday`, `admin`), legend metadata, due tags, and optional embedded `uga-duedate`
- Added optional `sync-due-status` mode to reconcile calendar date cells with live eLC assignment due dates by matching `dueTags[].folderId`
- Added demo assets: `demo/course-calendar.html` and `demo/course-calendar-demo.json`
- Updated docs in `demo/index-all-in-one.html`, `demo/setup.html`, and `README.md`
- Added CSV input support with `type="csv"` using flat rows grouped by `weekLabel`
- Added instructor CSV starter template `demo/course-calendar-template.csv` and sample `demo/course-calendar-demo.csv`

### uga-elc-google-sync (eLC ⇄ Google Drive sync widget — MVP)

- New **admin-only** component `uga-elc-google-sync` (formerly `uga-template-manager`): read-only **content preview** (TOC module counts for live + template OU), stub mode for local demos, gated by `admin-role-names` / `admin-role-ids`
- Docs: [docs/ELC_GOOGLE_SYNC_WIDGET.md](docs/ELC_GOOGLE_SYNC_WIDGET.md), [docs/COURSE_TEMPLATE_API_SPIKE.md](docs/COURSE_TEMPLATE_API_SPIKE.md); minimal Drive upload service under [server/drive-upload/](server/drive-upload/)
- Demo: [demo/elc-google-sync.html](demo/elc-google-sync.html); listed in README and setup.html. Export / Clear / Back-copy actions are placeholders until Valence spike completes
- Companion folder `elc-google-sync/` (formerly `template-manager/`) previously held the standalone React app + Node API and SPEC.md—**removed**; see **Repository** under [Unreleased] for replacements

### Demo pages (instructional designers)

- Reviewed demo HTML for eLC terminology, consistent production script path (<code>/shared/ugaonline/js/uga-components.js</code>), and clearer quiz/course file path guidance (prefer same-folder filenames or full paths from Manage Files)
- Added <code>demo/demo-inline-code.css</code> and linked it from demos so inline <code>&lt;code&gt;</code> in descriptions matches paragraph size
- Added “For instructional designers” setup blurb + link to `demo/setup.html` on standalone demos; expanded hub intro on `demo/index-all-in-one.html`
- <code>course-analytics.html</code>: back navigation, localhost vs production script note, whitespace fix
- <code>setup.html</code>: quiz data format clarified (JSON default; CSV optional)

### uga-footer — Abbreviated program codes

- **Program attribute now uses abbreviated codes** (e.g. `msw`, `acct`, `envgeology`, `general`, `ool`) instead of full names
- Template data path: `/shared/ugaonline/templates/{program}/data/footer.json`; logo paths configured per program in component
- Programs with logo: **acct**, **envgeology**, **general**, **msw**, **ool**. Programs without footer logo: cvle, datascience, highered, publichealth
- Added `PROGRAM_DISPLAY_NAMES` for accessible logo alt text. Docs updated in `footer.html`, `setup.html`, `index-all-in-one.html`

### ✅ Quiz & Grade Sync (Quiz Demo 2)

- **Quiz submission and grade sync confirmed working** with eLC assignment "Quiz Demo 2" and linked grade item
- **uga-quiz-grade-sync** supports **dropbox-assignment-name** (e.g. "Quiz Demo 2") as well as **dropbox-folder-id** for resolving the assignment
- Grade export now scales quiz points to the grade item's **MaxPoints** and sends the correct D2L **IncomingGradeValue** payload (Numeric type), resolving 400 errors when updating grades
- **Documentation and demos updated**: README components table, `docs/D2L_QUIZ_DROPBOX.md`, `demo/setup.html`, `demo/QUICK_START.md`; instructions aligned on making the assignment visible, Text or File submissions, and using dropbox-assignment-name or dropbox-folder-id

### 🎨 Branding Updates

- **Rebranded all D2L/Brightspace references to eLC** across components, demos, and documentation
- Removed "Note: Requires D2L API access" callouts from demo pages and component error displays
- Updated comments, error messages, and user-facing text to use eLC terminology

### 📚 Documentation Enhancements

- **Added Google Drive links for example JSON files** in demo documentation
- Components with example files: accordion, tabs, slideshow, circles, footer, instructor-note, videos
- Standardized link format: "Download [filename] to modify and upload it to your course files"
- Updated both `index-all-in-one.html` and individual component demo pages
- **Updated `index-all-in-one.html` to match individual demo files**:
  - Split video section into "Single Video" and "Multiple Videos from JSON File" sections
  - Updated assignment and due date code examples with comprehensive filtering examples
  - Added Google Drive links to all JSON file examples in setup section (videos-demo.json)
  - Updated setup section structure to match `setup.html`
  - Added Component-Specific Setup section with eLC API components information
  - Changed setup instructions to match `setup.html` format (removed "Upload the Bundle" step, added full HTML template)

### 🐛 Bug Fixes

#### uga-toc

- **Fixed missing `rootLevel` variable** declaration causing runtime errors
- **Implemented auto-ID generation** for headings without IDs
- Added slug generation algorithm with collision detection
- Ensures all TOC links navigate correctly even when headings lack manual IDs
- Type-safe null checking for tocList and heading elements

#### uga-video

- **Fixed multiple video player initialization issue** by adding unique component IDs to container elements
- Prevents "target id already in use" errors when the same video ID appears in multiple components on the same page
- Uses Lit's `updated` lifecycle method for more reliable player initialization timing

### 🔧 Component Improvements

#### uga-duedate

- **Assignment names are now hyperlinked** (matching Assignment component behavior)
- Users can click directly to assignments or discussions from the due date table
- Added enrollment checking to generate appropriate student/instructor links
- Implemented `getAssignmentLink()` method for consistent link generation

## [Unreleased] - 2025-11-18

### 🎉 Major Updates

#### Demo System Restructure

- **Separated component demos into individual HTML files** for easier testing and reference
- Created 15 dedicated demo pages (one per component + setup guide)
- Maintained comprehensive `index.html` as component gallery with navigation cards
- Preserved original unified demo as `index-all-in-one.html` for reference

#### New Demo Pages

- `accordion.html` - Accordion component demo
- `assignment.html` - Assignment component demo
- `circles.html` - Circles component demo
- `code.html` - Code block component demo
- `duedate.html` - Due date component demo
- `footer.html` - Footer component demo
- `instructor-note.html` - Instructor note component demo

- `rating.html` - Rating component demo
- `return-to-top.html` - Return to top component demo
- `slideshow.html` - Slideshow component demo
- `tabs.html` - Tabs component demo
- `toc.html` - Table of contents component demo
- `video.html` - Video component demo
- `setup.html` - **NEW** Comprehensive setup and usage guide

### 🔧 Component Improvements

#### uga-accordion

- **Refactored to match original JavaScript pattern** from data-loader abstraction
- Changed to direct `axios.get()` calls for better transparency
- Added lazy loading: `init()` only called when component renders
- Fixed TypeScript compilation issues with array indexing using `findIndex()`
- **Added `<span class="icon"></span>` inside button elements** for +/- icon support
- Improved error handling and data structure validation

#### uga-video

- **Enhanced Kaltura player integration** with script injection pattern
- Added logo/watermark hiding capability: `logo: { disabled: true }` in UI config
- Eliminated scrollbar issues by using direct DOM container instead of iframe
- Implemented player instance caching to prevent multiple script loads
- Added proper cleanup and player lifecycle management
- Improved aspect ratio handling with `aspect-ratio: 16 / 9`

#### uga-assignment

- **Added axios detection and graceful degradation**
- Display friendly error message when D2L APIs unavailable (demo mode)
- Better error handling for missing assignment data

#### uga-footer

- **Complete rewrite with full UGA footer structure**
- Fixed logo image paths from `/img/` to `/images/` on design.online.uga.edu
- Self-contained implementation with embedded HTML structure

#### uga-toc

- **Modified heading scanning to h2 and h3 only** (previously h1-h4)
- Reduces clutter by excluding h4 "Properties" headings from table of contents
- Better navigation focus on major sections and subsections

### 📝 Documentation Updates

#### README.md

- Updated to reflect demo system restructure
- Added Kaltura video integration details
- Clarified component architecture patterns
- Enhanced troubleshooting section

#### QUICK_START.md

- Updated file structure to include all new demo pages
- Added instructions for individual component demos
- Clarified local development vs. D2L deployment workflow

#### New: CHANGELOG.md

- This file! Comprehensive record of all changes

#### Demo Documentation

- All demo pages include "Back to All Components" navigation link
- Updated index.html with links to individual component demos
- Added comprehensive setup.html with troubleshooting and best practices
- Updated TOC documentation to reflect h2/h3 scanning behavior

### 🐛 Bug Fixes

#### Critical Fixes

- **Fixed accordion icon display issue**: Added `class="js"` requirement to `<html>` tag in demo pages
  - Required for UGA CSS `.js .cmp-accordion__button::after` pseudo-element styles
  - Applied to accordion.html and index.html
- **Fixed footer logo path**: Changed from `/img/` to `/images/` on design.online.uga.edu domain
- **Fixed assignment component axios errors**: Added detection and graceful fallback for demo mode
- **Fixed TOC clutter**: Reduced heading scan to h2/h3 to exclude repetitive h4 "Properties" entries

#### TypeScript Fixes

- Fixed accordion array indexing with proper `findIndex()` usage instead of string index
- Improved type safety throughout refactored components

### 🎨 Styling & UX

- Maintained consistent styling across all demo pages
- Added category-based navigation cards to index.html
- Improved code block syntax highlighting with Prism.js
- Enhanced property documentation tables with better formatting
- Added visual hierarchy with category headers (Content, Media, Interactive, Navigation, Instructor Tools)

### 🏗️ Architecture

#### Build System

- No changes to Vite configuration (single bundle output maintained)
- All components still register via `src/all.ts` entry point
- Build output: `dist/js/uga-components.js` (unchanged)

#### Component Patterns

- **Light DOM rendering maintained** across all components: `createRenderRoot() { return this; }`
- **Direct axios pattern** now preferred over data-loader abstraction (see accordion refactor)
- **Lazy loading pattern** implemented in accordion for better performance
- **Script injection pattern** for Kaltura player provides full configuration control

### 📁 File Structure Changes

```
demo/
├── index.html                    # Main navigation gallery (updated)
├── index-all-in-one.html        # Original comprehensive demo (preserved)
├── setup.html                    # NEW: Setup and usage guide
├── accordion.html                # NEW: Individual demo pages
├── assignment.html               # NEW
├── circles.html                  # NEW
├── code.html                     # NEW
├── duedate.html                  # NEW
├── footer.html                   # NEW
├── instructor-note.html          # NEW
├── module-feedback.html          # NEW
├── rating.html                   # NEW
├── return-to-top.html            # NEW
├── slideshow.html                # NEW
├── tabs.html                     # NEW
├── toc.html                      # NEW
├── video.html                    # NEW
├── QUICK_START.md                # Updated
├── README.md                     # Updated
└── *.json                        # Demo data files (unchanged)
```

### 🔄 Migration Notes

#### For Existing Users

1. **No breaking changes to component APIs** - all existing usage continues to work
2. **Demo restructure is additive** - original demo preserved as `index-all-in-one.html`
3. **Accordion refactor is internal** - same external API, improved implementation
4. **Video component enhancements** are backwards compatible

#### CSS Requirement for Accordions

- **Action Required**: Add `class="js"` to `<html>` tag in pages using uga-accordion
- Example: `<html lang="en" class="js">`
- This enables UGA CSS icon styles for expand/collapse indicators

#### TOC Behavior Change

- **Table of Contents now scans h2 and h3 only** (previously h1-h4)
- Review TOC output if you rely on h4 headings appearing in navigation
- This change improves navigation clarity by focusing on major sections

### 🚀 What's Next

#### Recommended Actions

1. Review individual component demo pages for updated usage patterns
2. Read `setup.html` for comprehensive deployment guide
3. Test accordion components with `class="js"` on HTML element
4. Update any accordion implementations to use direct axios pattern (optional)
5. Check TOC components to ensure h2/h3 filtering meets your needs

#### Known Limitations

- D2L API components (assignment, duedate, rating, instructor-note) require Brightspace environment
- Kaltura video component requires valid video IDs and player configuration
- Mock axios in demo mode has limited functionality compared to Brightspace global axios

---

## Version History

**Current:** Unreleased (feature/updated-video branch)  
**Previous:** 1.0 baseline (main branch)
