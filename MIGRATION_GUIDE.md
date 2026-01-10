# Migration Guide

This guide helps you migrate from the previous version to the updated branch with the restructured demo system and component improvements.

## Overview

The `feature/updated-video` branch includes:

- Restructured demo system with individual component pages
- Enhanced Kaltura video component
- Refactored accordion component
- TOC filtering improvements
- Bug fixes and documentation updates

## Breaking Changes

### ⚠️ IMPORTANT: Accordion CSS Requirement

**Action Required:** Pages using `uga-accordion` must add `class="js"` to the `<html>` element.

**Before:**

```html
<html lang="en"></html>
```

**After:**

```html
<html lang="en" class="js"></html>
```

**Why:** This enables UGA CSS pseudo-element styles (`.js .cmp-accordion__button::after`) for the expand/collapse icons. Without this class, accordion icons will not display.

**Impact:** All pages with accordion components need this update.

---

## Non-Breaking Changes

### Table of Contents Filtering

**Change:** `uga-toc` now scans h2 and h3 headings only (previously h1-h4). Additionally, the component now auto-generates IDs for headings without them.

**Impact:**

- TOC will exclude h4 headings (provides cleaner navigation)
- All h2/h3 headings will be navigable even if they lack manual IDs
- Navigation links work reliably across all demo pages

**Action:**

- ✅ No code changes required
- ✅ Review TOC output to ensure it meets your needs
- ✅ If you need h4 headings in navigation, contact the dev team

---

## Component Updates

### Accordion Component

**What Changed:**

- Internal refactor from data-loader abstraction to direct axios pattern
- Improved error handling and TypeScript type safety
- Better data structure validation
- Fixed icon display issues

**Migration:**

```html
<!-- No changes to component usage -->
<uga-accordion type="local" filename="accordion-data.json"></uga-accordion>

<!-- But add class="js" to HTML element -->
<html lang="en" class="js"></html>
```

**Benefits:**

- More transparent data loading
- Better error messages
- Improved performance with lazy loading

---

### Video Component

**What Changed:**

- Enhanced Kaltura player integration with script injection
- Logo/watermark hiding capability
- Better player lifecycle management
- Eliminated scrollbar issues

**Migration:**

```html
<!-- Previous usage still works -->
<uga-video videoid="1_abc123de" playerid="1574196844"></uga-video>

<!-- New properties available (optional) -->
<uga-video videoid="1_abc123de" playerid="57494843" includerating="false">
</uga-video>
```

**Benefits:**

- Kaltura logo completely hidden by default
- No more scrollbar issues
- Better video player performance
- Multiple videos support improved

---

### Footer Component

**What Changed:**

- Complete rewrite with full UGA footer structure
- Fixed logo image paths from `/img/` to `/images/`

**Migration:**

```html
<!-- Usage remains the same -->
<uga-footer
  type="local"
  filename="footer.json"
  imagefile="logo.png"
></uga-footer>
```

**Benefits:**

- Proper UGA footer structure
- Correct image paths (no broken logos)
- More maintainable code

---

### Assignment Component

**What Changed:**

- Added axios detection and graceful error handling
- Better error messages for demo environments

**Migration:**

```html
<!-- Before: Required assignment name -->
<uga-duedate name="Module 1 Assignment"></uga-duedate>

<!-- After: Automatically displays all assignments with due dates -->
<uga-duedate></uga-duedate>
```

**Benefits:**

- Works in both D2L and demo environments
- Friendly error messages when D2L APIs unavailable

---

## Demo System Changes

### New File Structure

```

demo/
├── index.html # NEW: Navigation gallery
├── setup.html # NEW: Setup guide
├── accordion.html # NEW: Individual demos
├── video.html # NEW
├── toc.html # NEW
├── ... # (15 demo pages total)
├── index-all-in-one.html # PRESERVED: Original demo
└── \*.json # UNCHANGED: Sample data

```

### What This Means for You

**If you reference demo files in documentation:**

- ✅ Original demo preserved as `index-all-in-one.html`
- ✅ New `index.html` is now a navigation gallery
- ✅ Each component has its own demo page

**If you use demo pages for testing:**

- ✅ Individual component pages are easier to work with
- ✅ Faster loading and focused testing
- ✅ All examples remain the same, just reorganized

---

## Migration Checklist

### For Existing Deployments

- [ ] **Review accordion usage**: Add `class="js"` to `<html>` tag in pages with accordions
- [ ] **Test accordion icons**: Verify expand/collapse icons display correctly
- [ ] **Check TOC output**: Confirm h2/h3-only scanning meets your needs
- [ ] **Update documentation**: Reference new demo structure if needed
- [ ] **Review video components**: Test Kaltura player functionality
- [ ] **Verify data files**: Ensure all JSON paths still work

### For New Deployments

- [ ] **Use new demo structure**: Reference `demo/index.html` for component gallery
- [ ] **Include `class="js"`**: Add to `<html>` tag for accordion support
- [ ] **Review setup guide**: Check `demo/setup.html` for deployment instructions
- [ ] **Test in D2L**: Verify components work in Brightspace environment
- [ ] **Check sample data**: Use provided JSON files as templates

---

## Testing Guide

### 1. Test Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open demo gallery
# http://localhost:5173/demo/index.html
```

### 2. Test Individual Components

Navigate to individual demo pages:

- `http://localhost:5173/demo/accordion.html`
- `http://localhost:5173/demo/video.html`
- etc.

**Verify:**

- ✅ Accordion icons display correctly
- ✅ Video players load without scrollbars
- ✅ TOC shows appropriate headings
- ✅ All data loads properly

### 3. Test Production Build

```bash
# Build bundle
npm run build

# Preview production build
npm run preview

# Test at http://localhost:4173/demo/index.html
```

**Verify:**

- ✅ Single bundle file created: `dist/js/uga-components.js`
- ✅ All components register correctly
- ✅ No console errors

### 4. Test in D2L

1. Upload `dist/js/uga-components.js` to Public Files
2. Create test content page with accordion component
3. **Add `class="js"` to HTML element in D2L editor**
4. Verify accordion icons display
5. Test video components with actual Kaltura IDs
6. Check D2L API components (assignment, duedate, etc.)

---

## Rollback Plan

If you encounter issues, you can stay on the previous version:

```bash
# Switch back to main branch
git checkout main

# Or use previous commit
git checkout <previous-commit-hash>

# Rebuild
npm run build
```

**Note:** The main branch remains unchanged. This update is in the `feature/updated-video` branch.

---

## Getting Help

### Resources

- **Changelog**: [CHANGELOG.md](./CHANGELOG.md) - Complete list of changes
- **Setup Guide**: [demo/setup.html](./demo/setup.html) - Deployment and troubleshooting
- **README**: [README.md](./README.md) - Project overview
- **Quick Start**: [demo/QUICK_START.md](./demo/QUICK_START.md) - Getting started

### Common Issues

**Problem:** Accordion icons not showing  
**Solution:** Add `class="js"` to `<html>` tag

**Problem:** TOC showing too many items  
**Solution:** Component now filters to h2/h3 - this is expected behavior

**Problem:** Video not loading  
**Solution:** Check browser console for errors, verify Kaltura video ID

**Problem:** Demo pages not loading  
**Solution:** Run `npm install` and `npm run dev`, then try again

### Contact

For additional support:

- Check the troubleshooting section in `demo/setup.html`
- Review error messages in browser console (F12)
- Contact UGA Online Learning development team

---

## Summary

### Key Takeaway

The most important change is adding `class="js"` to HTML elements for accordion components. Everything else is either backwards compatible or improves existing functionality.

### What's Better

✅ Individual demo pages for easier testing  
✅ Enhanced video component with logo hiding  
✅ Cleaner TOC navigation  
✅ Better error handling across components  
✅ Comprehensive setup and troubleshooting guides  
✅ Fixed bugs (footer logos, axios errors)

### Next Steps

1. Review CHANGELOG.md for complete details
2. Test accordion components with `class="js"` requirement
3. Explore new demo structure
4. Update any documentation references
5. Deploy when ready!
