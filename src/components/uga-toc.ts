import { LitElement, html, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const DEFAULT_HEADINGS = 'h2,h3';
const VALID_HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

@customElement('uga-toc')
export class UGATableOfContents extends LitElement {
  /**
   * Comma-separated heading tags to include in the TOC (e.g. "h2,h3" or "h2,h3,h4").
   * Defaults to h2 and h3.
   */
  @property({ type: String }) headings = DEFAULT_HEADINGS;

  // Disable Shadow DOM so global styles and light-DOM behavior can take effect
  createRenderRoot() {
    return this;
  }

  // This lifecycle method runs after the component first renders
  firstUpdated(): void {
    // Wait for the full DOM to be ready before scanning for headings
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.buildTOC());
    } else {
      // DOM already loaded, build immediately
      this.buildTOC();
    }
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('headings') && changedProperties.get('headings') !== undefined) {
      this.buildTOC();
    }
  }

  /** Parse the headings attribute into a unique, ordered list of valid h1–h6 tags. */
  private parseHeadingSelectors(): string[] {
    const raw = (this.headings || DEFAULT_HEADINGS).trim() || DEFAULT_HEADINGS;
    const seen = new Set<string>();
    const selectors: string[] = [];

    for (const part of raw.split(',')) {
      const token = part.trim().toLowerCase();
      // Accept "h2" or bare "2"
      const tag = /^h[1-6]$/.test(token)
        ? token
        : /^[1-6]$/.test(token)
          ? `h${token}`
          : null;
      if (tag && VALID_HEADING_TAGS.has(tag) && !seen.has(tag)) {
        seen.add(tag);
        selectors.push(tag);
      }
    }

    return selectors.length > 0 ? selectors : ['h2', 'h3'];
  }

  private buildTOC(): void {
    // Since we're not using shadow DOM, grab the element from the light DOM
    const tocList = this.querySelector('#toc-list') as HTMLUListElement | null;
    if (!tocList) return;

    // Clear previous entries when rebuilding (e.g. headings attribute changed)
    tocList.replaceChildren();

    const selectors = this.parseHeadingSelectors();
    const headings = Array.from(
      document.querySelectorAll(selectors.join(', '))
    ) as HTMLHeadingElement[];
    const hasCategoryHeaders = document.querySelectorAll('.category-header h2').length > 0;
    let seenCategoryHeader = false;
    const usedIds = new Set<string>();
    // Seed with any existing IDs to guarantee uniqueness
    headings.forEach(h => { if (h.id) usedIds.add(h.id); });
    let rootLevel: number | null = null;
    const currentLists: { [key: number]: HTMLUListElement | null } = { 1: tocList };

    headings.forEach(heading => {
      // Skip the TOC's own heading to prevent self-reference
      if (heading.closest('#table-of-contents')) {
        return;
      }

      // Create a link to each heading
      const level = parseInt(heading.tagName[1]); // Get the heading level (1-6)
      const isCategoryHeader = Boolean(heading.closest('.category-header'));
      // Demo pages like index-all-in-one use h2 for both category headers and item headers.
      // Only treat non-category h2 headings as one level deeper AFTER the first category header
      // appears, so pre-category sections remain top-level entries.
      const normalizedLevel = hasCategoryHeaders && seenCategoryHeader && level === 2 && !isCategoryHeader ? 3 : level;
      if (isCategoryHeader) {
        seenCategoryHeader = true;
      }
      // Ensure heading has an id; generate slug if missing
      if (!heading.id) {
        const base = (heading.textContent || 'section')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
        let slug = base || 'section';
        let i = 2;
        while (usedIds.has(slug) || document.getElementById(slug)) {
          slug = `${base}-${i++}`;
        }
        heading.id = slug;
        usedIds.add(slug);
      }
      
      // Set root level based on first heading
      if (rootLevel === null) {
        rootLevel = normalizedLevel;
        currentLists[normalizedLevel] = tocList as HTMLUListElement;
      }

      const listItem = document.createElement('li');
      listItem.className = "util-margin-vert-sm";
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      listItem.appendChild(link);

      // Smooth scroll on click
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const target = document.getElementById(heading.id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });

      // Clear deeper nested lists when we go back to a higher level
      for (let i = normalizedLevel + 1; i <= 6; i++) {
        if (currentLists[i]) {
          delete currentLists[i];
        }
      }

      // If this is the root level, append directly to root list
      if (normalizedLevel === rootLevel) {
        currentLists[rootLevel].appendChild(listItem);
      }
      // If this is a deeper level, create nested lists as needed
      else if (normalizedLevel > rootLevel) {
        // Find the closest parent level that exists
        let parentLevel = normalizedLevel - 1;
        while (parentLevel >= rootLevel && !currentLists[parentLevel]) {
          parentLevel--;
        }

        // Create nested list if it doesn't exist for this level
        if (!currentLists[normalizedLevel]) {
          const newList = document.createElement('ul');
          // Append to the last item of the parent level
          const parentList = currentLists[parentLevel];
          if (parentList && parentList.lastElementChild) {
            parentList.lastElementChild.appendChild(newList);
            currentLists[normalizedLevel] = newList;
          }
        }

        // Append the list item to the appropriate level
        if (currentLists[normalizedLevel]) {
          currentLists[normalizedLevel].appendChild(listItem);
        }
      }
    });
  }

  render() {
    return html`
      <div
        class="util-pad-all-md util-margin-bottom-lg util-background-odyssey util-shadow-base util-radius-all-sm"
        id="table-of-contents"
        style="border: 1px solid #ccc;"
      >
        <h2>Contents</h2>
        <ul class="util-pad-left-lg util-delist" id="toc-list"></ul>
      </div>
    `;
  }
}
