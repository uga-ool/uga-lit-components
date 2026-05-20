# Course calendar: JSON and CSV format (`uga-course-calendar`)

The **uga-course-calendar** component renders a week-by-week course calendar table from a JSON or CSV file. Put page titles and intro copy in your HTML; the data file drives the table body.

## Quick start

```html
<uga-course-calendar
  type="local"
  filename="course-calendar/course-calendar-demo.json"
></uga-course-calendar>
```

**CSV:**

```html
<uga-course-calendar
  type="csv"
  filename="course-calendar/course-calendar-demo.csv"
></uga-course-calendar>
```

Upload data files to **course files** (Manage Files). Use a path relative to the HTML page or a full course-files path.

**Samples in-repo:** `demo/course-calendar/course-calendar-demo.json`, `course-calendar-demo.csv`, and instructor starter `course-calendar-template.csv`. Demo: [`demo/course-calendar.html`](../demo/course-calendar.html).

## Component attributes

| Attribute | Values | Notes |
|-----------|--------|--------|
| `type` | `local`, `csv`, `program` | `local` = JSON in course files; `csv` = flat CSV; `program` = shared template path via `program` |
| `filename` | path string | Required. e.g. `course-calendar/course-calendar-demo.json` |
| `program` | abbreviated code | Used when `type="program"` (same pattern as `uga-footer`) |
| `sync-from-course` | boolean | When true, updates due-row dates from live eLC assignments (see below) |
| `sync-due-status` | boolean | Legacy alias for `sync-from-course` |
| `course-id` | OU id | Optional override for sync (defaults to current course) |
| `le-version` | e.g. `1.75` | Optional LE API version override for sync |

Optional table caption comes from JSON/CSV `caption` or `title` fields.

## JSON structure

Top-level shape (with or without wrapping `data` object — both work):

```json
{
  "data": {
    "title": "Optional table title",
    "caption": "Optional caption (preferred for accessibility)",
    "weeks": [
      {
        "label": "Week 1 - May 12-18 - Classes Begin",
        "rows": [
          {
            "type": "open",
            "date": "May 12",
            "day": "Tuesday",
            "moduleTitle": "Modules 00 and 01 Open",
            "moduleItems": ["M00: Welcome", "M01: Intro"],
            "moduleLink": "https://example.com/module",
            "event": "Classes Begin",
            "notes": "First day of instruction.",
            "noteHint": "Optional short hint",
            "rowDate": "2026-05-12"
          }
        ]
      }
    ]
  }
}
```

### Row types (`type`)

| Value | Typical use |
|-------|-------------|
| `open` | Module or content opens |
| `due` | Due date row (often with `dueTags`) |
| `holiday` | No class / university holiday |
| `deadline` | Hard deadline |
| `exam` | Exam or midterm |
| `final` | Final exam period |
| `lastday` | Last day of class |
| `admin` | Administrative note |

### Due rows and live sync

For rows that should reflect **live eLC assignment due dates**, include:

```json
{
  "type": "due",
  "date": "May 17",
  "day": "Sunday",
  "event": "Due: 11:59 PM",
  "rowDate": "2026-05-17",
  "dueTags": [
    { "label": "Module 1 Assignment", "folderId": "3439577" }
  ]
}
```

Enable sync on the component:

```html
<uga-course-calendar
  type="local"
  filename="course-calendar/course-calendar-demo.json"
  sync-from-course
></uga-course-calendar>
```

`folderId` is the eLC assignment (dropbox folder) ID. The component fetches assignments and replaces displayed dates when a match is found.

## CSV structure

Flat rows grouped by `weekLabel`. Required columns:

| Column | Required | Notes |
|--------|----------|--------|
| `weekLabel` | yes | Groups rows into weeks (e.g. `Week 1 - May 12-18`) |
| `rowType` | yes | Same values as JSON `type` |
| `date` | yes | Display date |
| `day` | yes | Day name |
| `event` | yes | Primary cell text |
| `moduleTitle` | no | |
| `moduleItems` | no | Pipe-separated list: `Item A\|Item B` |
| `notes` | no | |
| `noteHint` | no | |
| `rowDate` | no | ISO date for sync (`2026-05-17`) |
| `dueTags` | no | Pipe-separated labels |
| `folderIds` | no | Pipe-separated assignment folder IDs (pairs with `dueTags`) |

Example header (see `demo/course-calendar/course-calendar-template.csv`):

```csv
weekLabel,rowType,date,day,moduleTitle,moduleItems,event,notes,noteHint,rowDate,dueTags,folderIds
```

## Program template path

When `type="program"` and `program` is set (e.g. `msw`), data loads from the shared template path used by other OOL components (see `src/lib/data/data-loader.ts` and `uga-footer` program codes in demos).

## Related docs

- [demo/setup.html](../demo/setup.html) — deployment and file upload
- [QUIZ_DROPBOX_SETUP.md](QUIZ_DROPBOX_SETUP.md) — assignment folder IDs (same dropbox concept as quiz submissions)
