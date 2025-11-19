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
      // Skip the TOC's own heading to prevent self-reference
      if (heading.closest('#table-of-contents')) {
        return;
      }

      // Create a link to each heading
      const level = parseInt(heading.tagName[1]); // Get the heading level (1-6)
      
      // Set root level based on first heading
      if (rootLevel === null) {
        rootLevel = level;
        currentLists[level] = tocList as HTMLUListElement;
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
      for (let i = level + 1; i <= 6; i++) {
        if (currentLists[i]) {
          delete currentLists[i];
        }
      }

      // If this is the root level, append directly to root list
      if (level === rootLevel) {
        currentLists[rootLevel].appendChild(listItem);
      }
      // If this is a deeper level, create nested lists as needed
      else if (level > rootLevel) {
        // Find the closest parent level that exists
        let parentLevel = level - 1;
        while (parentLevel >= rootLevel && !currentLists[parentLevel]) {
          parentLevel--;
        }

        // Create nested list if it doesn't exist for this level
        if (!currentLists[level]) {
          const newList = document.createElement('ul');
          // Append to the last item of the parent level
          const parentList = currentLists[parentLevel];
          if (parentList && parentList.lastElementChild) {
            parentList.lastElementChild.appendChild(newList);
            currentLists[level] = newList;
          }
        }

        // Append the list item to the appropriate level
        if (currentLists[level]) {
          currentLists[level].appendChild(listItem);
        }
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
