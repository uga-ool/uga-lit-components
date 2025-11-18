import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';


@customElement('uga-toc')
export class UGATableOfContents extends LitElement {
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

  private buildTOC(): void {
    // Since we're not using shadow DOM, grab the element from the light DOM
    const tocList = this.querySelector('#toc-list');
    const headings = document.querySelectorAll('h2, h3');
    const idMap = new Map<string, boolean>();
    const currentLists: { [key: number]: HTMLUListElement | null } = { 1: tocList as HTMLUListElement };

    headings.forEach(heading => {
      // Ensure each heading has a unique ID
      if (!heading.id) {
        let baseId = heading.textContent
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        let uniqueId = baseId;
        let counter = 1;

        while (idMap.has(uniqueId)) {
          uniqueId = `${baseId}-${counter}`;
          counter++;
        }
        idMap.set(uniqueId, true);
        heading.id = uniqueId;
      }

      // Create a link to each heading
      const level = parseInt(heading.tagName[1]);
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

      // Reset child lists from current level down
      for (let i = level; i <= 4; i++) {
        if (currentLists[i]) {
          currentLists[i] = null;
        }
      }

      // Create a new nested <ul> if needed
      if (!currentLists[level]) {
        const parentLevel = level - 1;
        const parentList = currentLists[parentLevel] || (tocList as HTMLUListElement);
        const newList = document.createElement('ul');
        parentList.appendChild(newList);
        currentLists[level] = newList;
      }

      const targetList = currentLists[level];
      if (targetList) {
        targetList.appendChild(listItem);
      }
    });
  }

  render() {
    return html`
      <!-- Local styles for this element, now in the light DOM -->
      <style>
        #table-of-contents {
          border: 1px solid #ccc;
          box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
                      0 6px 20px 0 rgba(0, 0, 0, 0.19);
        }
      </style>

      <div class="util-pad-all-md util-margin-bottom-lg util-background-odyssey" id="table-of-contents">
        <h2>Contents</h2>
        <ul class="util-pad-left-lg util-delist" id="toc-list"></ul>
      </div>
    `;
  }
}
