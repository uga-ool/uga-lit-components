import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';
import { loadData } from '../lib/data/data-loader.js';
import { getAssignments, getEnrollment, getVersions } from '../lib/api/d2l-client.js';
import { getCourse } from '../lib/api/d2l-utils.js';

interface CalendarDueTag {
  label: string;
  folderId?: string;
}

type CalendarRowType = 'admin' | 'open' | 'due' | 'holiday' | 'deadline' | 'exam' | 'final' | 'lastday';

interface CalendarRow {
  type: CalendarRowType;
  date: string;
  day: string;
  moduleTitle?: string;
  moduleLink?: string;
  moduleItems?: string[];
  event: string;
  notes?: string;
  dueTags?: CalendarDueTag[];
  noteHint?: string;
  rowDate?: string;
  syncedDate?: string;
  syncedFrom?: string;
  isSynced?: boolean;
}

interface CalendarWeek {
  label: string;
  rows: CalendarRow[];
}

interface CalendarData {
  title?: string;
  caption?: string;
  weeks: CalendarWeek[];
}

interface CalendarDataResponse {
  data: CalendarData;
}

interface CsvCalendarRow {
  weekLabel: string;
  rowType: string;
  date: string;
  day: string;
  moduleTitle?: string;
  moduleItems?: string;
  event: string;
  notes?: string;
  noteHint?: string;
  rowDate?: string;
  dueTags?: string;
  folderIds?: string;
}

const VALID_ROW_TYPES: CalendarRowType[] = ['admin', 'open', 'due', 'holiday', 'deadline', 'exam', 'final', 'lastday'];

@customElement('uga-course-calendar')
class UgaCourseCalendar extends LitElement {
  @property({ type: String }) type: 'local' | 'program' | 'csv' = 'local';
  @property({ type: String }) filename = '';
  @property({ type: String }) program = '';
  @property({ type: Boolean }) loaded = false;
  @property({ type: Boolean, attribute: 'sync-due-status' }) syncDueStatus = false;
  @property({ type: Boolean, attribute: 'sync-from-course' }) syncFromCourse = false;
  @property({ type: String, attribute: 'course-id' }) courseId = '';
  @property({ type: String, attribute: 'le-version' }) leVersion = '';

  @state() private data: CalendarData | null = null;
  @state() private loading = false;
  @state() private loadError: string | null = null;
  @state() private syncMessage = '';

  createRenderRoot() {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (!this.loaded) {
      this.init();
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    const shouldReload =
      changedProperties.has('type')
      || changedProperties.has('filename')
      || changedProperties.has('program')
      || changedProperties.has('syncDueStatus')
      || changedProperties.has('syncFromCourse')
      || changedProperties.has('courseId')
      || changedProperties.has('leVersion');

    if (shouldReload && changedProperties.size > 0) {
      this.loaded = false;
      this.data = null;
      this.loadError = null;
      this.syncMessage = '';
      this.init();
    }
  }

  private async init(): Promise<void> {
    this.loading = true;
    this.loadError = null;

    try {
      if (!this.filename) {
        this.loadError = 'Missing filename. Use filename="course-calendar-demo.json" or "course-calendar-demo.csv".';
        return;
      }
      let loadedData: CalendarData;

      if (this.type === 'csv') {
        loadedData = await this.loadCsvData(this.filename);
      } else {
        const sourceType = this.type === 'program' ? 'program' : 'local';
        const payload = await loadData<CalendarDataResponse | CalendarData>(
          sourceType,
          this.filename,
          this.program || undefined
        );
        loadedData = (payload as CalendarDataResponse).data
          ? (payload as CalendarDataResponse).data
          : payload as CalendarData;
      }

      if (!loadedData?.weeks?.length) {
        this.loadError = this.type === 'csv'
          ? 'Calendar CSV loaded, but no valid week rows were found.'
          : 'Calendar JSON loaded, but no weeks were found.';
        return;
      }

      this.data = loadedData;

      if (this.isSyncEnabled()) {
        await this.applyLiveDueDateSync();
      }

      this.loaded = true;
    } catch (error: any) {
      this.loadError = error?.message || 'Failed to load calendar data.';
      this.loaded = true;
    } finally {
      this.loading = false;
      this.requestUpdate();
    }
  }

  private async loadCsvData(filename: string): Promise<CalendarData> {
    const response = await fetch(filename);
    if (!response.ok) {
      throw new Error(`CSV file not found: ${filename}`);
    }
    const csvText = await response.text();
    const rows = this.parseCsvRows(csvText);
    if (!rows.length) {
      throw new Error('CSV has no data rows.');
    }
    return this.mapCsvRowsToCalendarData(rows);
  }

  private parseCsvRows(csvText: string): CsvCalendarRow[] {
    const lines = csvText
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      throw new Error('CSV must include a header row and at least one data row.');
    }

    const headers = this.parseCsvLine(lines[0]).map(h => h.trim());
    const requiredHeaders = ['weekLabel', 'rowType', 'date', 'day', 'event'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length) {
      throw new Error(`CSV missing required columns: ${missingHeaders.join(', ')}`);
    }

    const rows: CsvCalendarRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      if (values.every(v => !v.trim())) continue;

      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = (values[idx] || '').trim();
      });

      const rowType = row.rowType as CalendarRowType;
      if (!VALID_ROW_TYPES.includes(rowType)) {
        throw new Error(`CSV row ${i + 1} has invalid rowType "${row.rowType}".`);
      }
      if (!row.weekLabel) {
        throw new Error(`CSV row ${i + 1} is missing weekLabel.`);
      }
      if (!row.date || !row.day || !row.event) {
        throw new Error(`CSV row ${i + 1} is missing required values (date/day/event).`);
      }

      rows.push({
        weekLabel: row.weekLabel,
        rowType: row.rowType,
        date: row.date,
        day: row.day,
        moduleTitle: row.moduleTitle || '',
        moduleItems: row.moduleItems || '',
        event: row.event,
        notes: row.notes || '',
        noteHint: row.noteHint || '',
        rowDate: row.rowDate || '',
        dueTags: row.dueTags || '',
        folderIds: row.folderIds || ''
      });
    }

    return rows;
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"' && inQuotes && next === '"') {
        current += '"';
        i++;
        continue;
      }
      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
        continue;
      }
      current += char;
    }
    values.push(current);
    return values;
  }

  private mapCsvRowsToCalendarData(rows: CsvCalendarRow[]): CalendarData {
    const weekMap = new Map<string, CalendarRow[]>();
    rows.forEach((row) => {
      const dueLabels = (row.dueTags || '')
        .split('|')
        .map(item => item.trim())
        .filter(Boolean);
      const folderIds = (row.folderIds || '')
        .split('|')
        .map(item => item.trim())
        .filter(Boolean);
      const dueTags = dueLabels.length
        ? dueLabels.map((label, idx) => ({ label, folderId: folderIds[idx] || '' }))
        : [];
      const moduleItems = (row.moduleItems || '')
        .split('|')
        .map(item => item.trim())
        .filter(Boolean);

      const mappedRow: CalendarRow = {
        type: row.rowType as CalendarRowType,
        date: row.date,
        day: row.day,
        moduleTitle: row.moduleTitle || '',
        moduleItems,
        event: row.event,
        notes: row.notes || '',
        noteHint: row.noteHint || '',
        rowDate: row.rowDate || '',
        dueTags
      };

      const existing = weekMap.get(row.weekLabel) || [];
      existing.push(mappedRow);
      weekMap.set(row.weekLabel, existing);
    });

    return {
      title: 'Course Calendar',
      caption: 'Course Calendar',
      introNote: 'Loaded from CSV template. Update title/notes in JSON mode if you need richer page metadata.',
      weeks: Array.from(weekMap.entries()).map(([label, weekRows]) => ({
        label,
        rows: weekRows
      }))
    };
  }

  private async applyLiveDueDateSync(): Promise<void> {
    if (!this.data) return;

    const currentOu = this.courseId || getCourse();
    if (!currentOu) {
      this.syncMessage = 'Live sync unavailable: course ID not detected. Showing static dates.';
      return;
    }

    try {
      const versions = await getVersions();
      const leVersion = this.leVersion || versions.le;
      if (!leVersion) {
        this.syncMessage = 'Live sync unavailable: LE API version not detected. Showing static dates.';
        return;
      }

      const studentRoleNames = ['Student', 'Demo Student'];
      let isStudent = false;
      if (versions.lp) {
        try {
          const enrollment = await getEnrollment(currentOu, versions.lp, {
            fallbackToFirst: true,
            throwOnNotFound: false
          });
          if (enrollment?.Role?.Name) {
            isStudent = studentRoleNames.includes(enrollment.Role.Name);
          }
        } catch (_) {
          // Default to instructor view if enrollment lookup fails.
        }
      }
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const buildAssignmentLink = (folderId: string): string => {
        const path = isStudent
          ? `/d2l/lms/dropbox/user/folder_submit_files.d2l?db=${encodeURIComponent(folderId)}&ou=${encodeURIComponent(currentOu)}`
          : `/d2l/lms/dropbox/admin/mark/folder_submissions_users.d2l?db=${encodeURIComponent(folderId)}&ou=${encodeURIComponent(currentOu)}`;
        return hostname ? `https://${hostname}${path}` : path;
      };

      const assignments = await getAssignments(currentOu, leVersion);
      const dueByFolderId = new Map<string, Date>();
      const assignmentByFolderId = new Map<string, any>();
      assignments.forEach((assignment) => {
        if (assignment.Id && assignment.DueDate) {
          dueByFolderId.set(String(assignment.Id), new Date(assignment.DueDate));
        }
        if (assignment.Id) {
          assignmentByFolderId.set(String(assignment.Id), assignment);
        }
      });
      const categoryNameById = new Map<string, string>();
      try {
        const categoriesRes = await fetch(`/d2l/api/le/${leVersion}/${currentOu}/dropbox/categories/`, { credentials: 'include' });
        if (categoriesRes.ok) {
          const categoriesRaw = await categoriesRes.json();
          const categories = Array.isArray(categoriesRaw) ? categoriesRaw : (categoriesRaw?.Items || []);
          categories.forEach((c: any) => {
            if (c?.Id != null && c?.Name) categoryNameById.set(String(c.Id), String(c.Name));
          });
        }
      } catch (_) {
        // Keep sync working even if categories endpoint is unavailable.
      }

      let syncedRows = 0;
      const updatedWeeks = this.data.weeks.map((week) => ({
        ...week,
        rows: week.rows.map((row) => {
          const folderIds = (row.dueTags || [])
            .map(tag => tag.folderId)
            .filter((id): id is string => Boolean(id));

          if (!folderIds.length) return row;

          const dueDates = folderIds
            .map(id => dueByFolderId.get(id))
            .filter((date): date is Date => Boolean(date));

          if (!dueDates.length) return row;

          const latestDue = new Date(Math.max(...dueDates.map(d => d.getTime())));
          const liveDate = this.formatMonthDayEastern(latestDue);
          const liveDay = this.formatWeekdayEastern(latestDue);
          const originalDate = row.date?.trim() || '';
          const matchedAssignment =
            folderIds
              .map(id => assignmentByFolderId.get(id))
              .find((a: any) => a && a.DueDate && new Date(a.DueDate).getTime() === latestDue.getTime())
            || folderIds.map(id => assignmentByFolderId.get(id)).find(Boolean);
          const assignmentName = matchedAssignment?.Name || row.moduleTitle || 'Assignment';
          const assignmentType = this.formatAssignmentType(matchedAssignment?.DropboxType);
          const assignmentCategory = matchedAssignment?.Category?.Name
            || (matchedAssignment?.CategoryId != null ? categoryNameById.get(String(matchedAssignment.CategoryId)) : undefined)
            || undefined;
          const assignmentMeta = assignmentCategory
            ? `Type: ${assignmentType}; Category: ${assignmentCategory}`
            : `Type: ${assignmentType}`;
          const enrichedNotes = assignmentMeta;

          const moduleLink = buildAssignmentLink(folderIds[0]);

          if (!originalDate || originalDate === liveDate) {
            return {
              ...row,
              day: liveDay,
              event: 'Assignment Due',
              moduleTitle: assignmentName,
              moduleLink,
              notes: enrichedNotes
            };
          }

          syncedRows += 1;
          return {
            ...row,
            syncedDate: liveDate,
            syncedFrom: originalDate,
            day: liveDay,
            event: 'Assignment Due',
            moduleTitle: assignmentName,
            moduleLink,
            notes: enrichedNotes,
            isSynced: true
          };
        })
      }));

      this.data = {
        ...this.data,
        weeks: updatedWeeks
      };

      this.syncMessage = syncedRows > 0
        ? `Live due-date sync updated ${syncedRows} row${syncedRows === 1 ? '' : 's'} from eLC.`
        : 'Live due-date sync checked eLC; no date changes were needed.';
    } catch (error) {
      this.syncMessage = 'Live due-date sync unavailable in this context. Showing static dates.';
    }
  }

  private isSyncEnabled(): boolean {
    return this.syncDueStatus || this.syncFromCourse;
  }

  private formatMonthDayEastern(date: Date): string {
    return date.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      month: 'long',
      day: 'numeric'
    });
  }

  private formatWeekdayEastern(date: Date): string {
    return date.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      weekday: 'long'
    });
  }

  private formatAssignmentType(dropboxType?: number): string {
    if (dropboxType === 1) return 'Group Assignment';
    if (dropboxType === 2) return 'Individual Assignment';
    return 'Assignment';
  }

  private renderModuleCell(row: CalendarRow) {
    const hasModule = row.moduleTitle || (row.moduleItems && row.moduleItems.length > 0);
    if (!hasModule) {
      return html``;
    }

    return html`
      ${row.moduleTitle
        ? html`<strong>${row.moduleLink
            ? html`<a href="${row.moduleLink}" target="_blank" rel="noopener noreferrer">${row.moduleTitle}</a>`
            : row.moduleTitle}</strong>`
        : ''}
      ${(row.moduleItems || []).map(item => html`${item}<br>`)}
    `;
  }

  render() {
    if (this.loading) {
      return html`<p>Loading course calendar...</p>`;
    }

    if (this.loadError) {
      return html`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css">
        <div class="util-pad-all-md util-background-light-gray" style="border-left: 4px solid #ba0c2f; margin: 1rem 0;">
          <p><strong>uga-course-calendar error:</strong> ${this.loadError}</p>
        </div>
      `;
    }

    if (!this.data) {
      return html``;
    }

    return html`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css">
      <style>
        uga-course-calendar .cal-scroll {
          overflow-x: auto;
        }
        uga-course-calendar .cal-key {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem 1.25rem;
          align-items: center;
          margin: 0 0 0.9rem;
          font-size: 0.8rem;
          color: #333;
        }
        uga-course-calendar .cal-key-label {
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 700;
          color: #666;
          margin-right: 0.1rem;
        }
        uga-course-calendar .cal-key-item {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          white-space: nowrap;
        }
        uga-course-calendar .cal-key-swatch {
          width: 0.85rem;
          height: 0.85rem;
          border-radius: 2px;
          border: 1px solid #ddd;
          box-sizing: border-box;
          flex-shrink: 0;
        }
        uga-course-calendar .swatch-open { background: #f5fbf7; border-color: #a8d8b0; }
        uga-course-calendar .swatch-exam { background: #fef0f2; border-color: #e8c8cc; }
        uga-course-calendar .swatch-final { background: #ba0c2f; border-color: #ba0c2f; }
        uga-course-calendar .swatch-due { background: #fffcfa; border-color: #e8c8c0; }
        uga-course-calendar .swatch-deadline { background: #fffaec; border-color: #e8d8a0; }
        uga-course-calendar .swatch-holiday { background: #f4f4f4; border-color: #ddd; }
        uga-course-calendar .swatch-lastday { background: #2c2c2c; border-color: #2c2c2c; }
        uga-course-calendar .cal-table {
          width: 100%;
          min-width: 650px;
          border-collapse: collapse;
          background: #fff;
          font-size: 0.88rem;
        }
        uga-course-calendar .cal-table caption {
          caption-side: top;
          text-align: left;
          font-size: 1.5rem;
          font-weight: 700;
          padding: 0 0 0.75rem;
        }
        uga-course-calendar .cal-table thead tr { background: #333; color: #fff; }
        uga-course-calendar .cal-table th {
          padding: 0.7rem 0.9rem;
          text-align: left;
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: none;
        }
        uga-course-calendar .cal-table td {
          padding: 0.6rem 0.9rem;
          border-bottom: 1px solid #e8e8e8;
          vertical-align: top;
          line-height: 1.5;
        }
        uga-course-calendar .col-date { white-space: nowrap; font-weight: 700; width: 82px; }
        uga-course-calendar .col-day { white-space: nowrap; color: #777; width: 88px; font-size: 0.83rem; }
        uga-course-calendar .col-mod { width: 30%; }
        uga-course-calendar .col-mod strong {
          display: block;
          font-size: 0.71rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #ba0c2f;
          margin-bottom: 0.18rem;
        }
        uga-course-calendar .col-event { font-weight: 700; width: 17%; }
        uga-course-calendar .col-notes { font-size: 0.83rem; color: #666; }
        uga-course-calendar .week-sep td {
          padding: 0.3rem 0.9rem;
          background: #333;
          color: rgba(255,255,255,0.7);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border-bottom: none;
        }
        uga-course-calendar .row-admin td { background: #f9f9f9; }
        uga-course-calendar .row-open td { background: #f5fbf7; }
        uga-course-calendar .row-open .col-event { color: #1a6640; }
        uga-course-calendar .row-due td { background: #fffcfa; }
        uga-course-calendar .row-due .col-date { color: #8e0924; }
        uga-course-calendar .row-holiday td { background: #f4f4f4; color: #999; }
        uga-course-calendar .row-holiday .col-date,
        uga-course-calendar .row-holiday .col-day { color: #bbb; }
        uga-course-calendar .row-holiday .col-event { color: #888; font-style: italic; }
        uga-course-calendar .row-deadline td { background: #fffaec; }
        uga-course-calendar .row-deadline .col-event { color: #8a6200; }
        uga-course-calendar .row-exam td { background: #fef0f2; border-bottom: 1px solid #e8c8cc; }
        uga-course-calendar .row-exam .col-date,
        uga-course-calendar .row-exam .col-event { color: #8e0924; }
        uga-course-calendar .row-lastday td { background: #2c2c2c; color: #fff; border-bottom: 1px solid #444; }
        uga-course-calendar .row-lastday .col-day { color: rgba(255,255,255,0.5); }
        uga-course-calendar .row-lastday .col-notes { color: rgba(255,255,255,0.75); }
        uga-course-calendar .row-final td { background: #ba0c2f; color: #fff; border-bottom: none; }
        uga-course-calendar .row-final .col-day { color: rgba(255,255,255,0.6); }
        uga-course-calendar .row-final .col-notes { color: rgba(255,255,255,0.85); }
        uga-course-calendar .tag {
          display: inline-block;
          font-size: 0.74rem;
          font-weight: 700;
          border-radius: 2px;
          padding: 0.08rem 0.4rem;
          margin: 0.1rem 0.06rem 0.1rem 0;
          white-space: nowrap;
        }
        uga-course-calendar .tag-due { background: #fef0f2; color: #8e0924; border: 1px solid #e8c0c4; }
        uga-course-calendar .tag-note {
          display: block;
          font-size: 0.76rem;
          color: #888;
          margin-top: 0.28rem;
          font-style: italic;
        }
        uga-course-calendar .row-final .tag-due,
        uga-course-calendar .row-lastday .tag-due {
          background: rgba(255,255,255,0.2);
          color: #fff;
          border-color: rgba(255,255,255,0.3);
        }
        uga-course-calendar .date-synced::after {
          content: " ↺";
          font-size: 0.65rem;
          color: #1a6640;
          opacity: 0.8;
          font-weight: 400;
        }
        uga-course-calendar .row-final .date-synced::after,
        uga-course-calendar .row-lastday .date-synced::after {
          color: rgba(255,255,255,0.75);
        }
      </style>

      <div class="cal-key" aria-label="Course calendar legend">
        <span class="cal-key-label">Key:</span>
        <span class="cal-key-item"><span class="cal-key-swatch swatch-open" aria-hidden="true"></span>Module Opens</span>
        <span class="cal-key-item"><span class="cal-key-swatch swatch-exam" aria-hidden="true"></span>Midterm</span>
        <span class="cal-key-item"><span class="cal-key-swatch swatch-final" aria-hidden="true"></span>Final Submissions Due</span>
        <span class="cal-key-item"><span class="cal-key-swatch swatch-due" aria-hidden="true"></span>Assignment Due</span>
        <span class="cal-key-item"><span class="cal-key-swatch swatch-deadline" aria-hidden="true"></span>Important Deadline</span>
        <span class="cal-key-item"><span class="cal-key-swatch swatch-holiday" aria-hidden="true"></span>No Class / Holiday</span>
        <span class="cal-key-item"><span class="cal-key-swatch swatch-lastday" aria-hidden="true"></span>Last Class Day</span>
      </div>

      <div class="cal-scroll util-scrollable-content util-radius-all-sm util-shadow-base">
          <table class="cal-table" aria-label="Course calendar table">
            ${(this.data.caption || this.data.title)
              ? html`<caption>${this.data.caption || this.data.title}</caption>`
              : ''}
            <thead>
              <tr>
                <th scope="col" class="col-date">Date</th>
                <th scope="col" class="col-day">Day</th>
                <th scope="col" class="col-mod">Module</th>
                <th scope="col" class="col-event">Event</th>
                <th scope="col" class="col-notes">Notes / Due Items</th>
              </tr>
            </thead>
            <tbody>
              ${this.data.weeks.map(week => html`
                <tr class="week-sep">
                  <td colspan="5">${week.label}</td>
                </tr>
                ${week.rows.map(row => html`
                  <tr class="row-${row.type}" data-row-date="${row.rowDate || ''}">
                    <td class="col-date ${row.isSynced ? 'date-synced' : ''}" title="${row.isSynced ? `Updated from eLC - was ${row.syncedFrom}` : ''}">
                      ${row.syncedDate || row.date}
                      ${row.isSynced ? html`<span class="util-visually-hidden">(updated from eLC)</span>` : ''}
                    </td>
                    <td class="col-day">${row.day}</td>
                    <td class="col-mod">${this.renderModuleCell(row)}</td>
                    <td class="col-event">${row.event}</td>
                    <td class="col-notes">
                      ${row.notes || ''}
                      ${row.isSynced ? '' : (row.dueTags || []).map(tag => html`<span class="tag tag-due">${tag.label}</span>`)}
                      ${row.noteHint ? html`<span class="tag-note">${row.noteHint}</span>` : ''}
                    </td>
                  </tr>
                `)}
              `)}
            </tbody>
          </table>
      </div>
    `;
  }
}
