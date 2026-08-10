import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const CALLOUT_STYLE_ID = 'uga-callout-styles';
const VALID_TYPES = ['note', 'important', 'tip', 'example', 'warning'] as const;
const VALID_SIZES = ['small', 'medium', 'large', 'xlarge'] as const;
type CalloutType = (typeof VALID_TYPES)[number];
type CalloutSize = (typeof VALID_SIZES)[number];

/* Use uga-callout--* classes, not cmp-callout (base.css sets .cmp-callout { font-size: 5em }). */
const CALL_OUT_CSS = `
uga-callout {
  display: block;
}

.uga-callout {
  --callout-accent: #004e60;
  --callout-tint: rgba(0, 78, 96, 0.1);
  --callout-border: rgba(0, 0, 0, 0.14);
  margin: 1rem 0;
  padding: 0;
  border-left: 4px solid var(--callout-accent);
  border-top: 1px solid var(--callout-border);
  border-right: 1px solid var(--callout-border);
  border-bottom: 1px solid var(--callout-border);
  background-color: #fff;
  overflow: hidden;
  font-size: 1.08rem;
}

.uga-callout--small {
  font-size: 0.95rem;
}

.uga-callout--medium {
  font-size: 1.08rem;
}

.uga-callout--large {
  font-size: 1.18rem;
}

.uga-callout--xlarge {
  font-size: 1.3rem;
}

.uga-callout__label {
  margin: 0;
  font-size: 1em;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--callout-accent);
  line-height: 1.35;
  background-color: var(--callout-tint);
  font-family: inherit;
}

.uga-callout--small .uga-callout__label {
  padding: 0.5rem 0.75rem;
}

.uga-callout--medium .uga-callout__label {
  padding: 0.625rem 0.875rem;
}

.uga-callout--large .uga-callout__label {
  padding: 0.75rem 1rem;
}

.uga-callout--xlarge .uga-callout__label {
  padding: 0.875rem 1.125rem;
}

.uga-callout__body {
  background-color: #fff;
  font-size: 1em;
  font-family: inherit;
}

.uga-callout--small .uga-callout__body {
  padding: 0.625rem 0.75rem;
}

.uga-callout--medium .uga-callout__body {
  padding: 0.75rem 0.875rem;
}

.uga-callout--large .uga-callout__body {
  padding: 0.875rem 1rem;
}

.uga-callout--xlarge .uga-callout__body {
  padding: 1rem 1.125rem;
}

.uga-callout__body > *:first-child {
  margin-top: 0;
}

.uga-callout__body > *:last-child {
  margin-bottom: 0;
}

.uga-callout__body p,
.uga-callout__text,
.uga-callout__body-slot :where(p, li) {
  margin: 0;
  font-size: 1em;
  font-family: inherit;
  line-height: inherit;
}

.uga-callout__body:empty {
  display: none;
}

.uga-callout--note {
  --callout-accent: #004e60;
  --callout-tint: rgba(0, 78, 96, 0.1);
}

.uga-callout--important {
  --callout-accent: #e4002b;
  --callout-tint: rgba(228, 0, 43, 0.1);
}

.uga-callout--tip {
  --callout-accent: #00a3ad;
  --callout-tint: rgba(0, 163, 173, 0.1);
}

.uga-callout--example {
  --callout-accent: #66435a;
  --callout-tint: rgba(102, 67, 90, 0.1);
}

.uga-callout--warning {
  --callout-accent: #4d5500;
  --callout-tint: rgba(183, 191, 16, 0.2);
}
`;

function ensureCalloutStyles(): void {
  if (document.getElementById(CALLOUT_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = CALLOUT_STYLE_ID;
  style.textContent = CALL_OUT_CSS;
  document.head.appendChild(style);
}

@customElement('uga-callout')
export class UgaCallout extends LitElement {
  private static nextId = 0;
  private readonly calloutId = UgaCallout.nextId++;
  private pendingSlotNodes: Node[] = [];

  @property({ type: String }) type = 'note';
  @property({ type: String }) size = 'medium';
  @property({ type: String }) label = '';
  @property({ type: String }) body = '';

  createRenderRoot() {
    return this;
  }

  connectedCallback(): void {
    const hasBody = Boolean((this.body || '').trim());
    const pending = Array.from(this.childNodes);
    if (!hasBody && pending.length > 0) {
      this.pendingSlotNodes = pending;
      while (this.firstChild) {
        this.removeChild(this.firstChild);
      }
    }
    super.connectedCallback();
    ensureCalloutStyles();
  }

  protected firstUpdated(): void {
    if (this.pendingSlotNodes.length === 0) return;
    const target = this.querySelector('.uga-callout__body-slot');
    if (!target) return;
    for (const node of this.pendingSlotNodes) {
      target.appendChild(node);
    }
    this.pendingSlotNodes = [];
  }

  private normalizedType(): CalloutType {
    const normalized = (this.type || 'note').trim().toLowerCase();
    if (VALID_TYPES.includes(normalized as CalloutType)) {
      return normalized as CalloutType;
    }
    if (normalized) {
      console.warn(`uga-callout: unknown type "${this.type}". Falling back to "note".`);
    }
    return 'note';
  }

  private normalizedSize(): CalloutSize {
    const normalized = (this.size || 'medium').trim().toLowerCase();
    if (VALID_SIZES.includes(normalized as CalloutSize)) {
      return normalized as CalloutSize;
    }
    if (normalized) {
      console.warn(`uga-callout: unknown size "${this.size}". Falling back to "medium".`);
    }
    return 'medium';
  }

  render() {
    const type = this.normalizedType();
    const size = this.normalizedSize();
    const trimmedLabel = this.label.trim();
    const trimmedBody = (this.body || '').trim();
    const labelId = trimmedLabel ? `uga-callout-${this.calloutId}-label` : '';

    return html`
      <aside
        class="uga-callout uga-callout--${type} uga-callout--${size} util-radius-all-sm"
        aria-labelledby=${trimmedLabel ? labelId : nothing}
      >
        ${trimmedLabel ? html`<p id="${labelId}" class="uga-callout__label">${trimmedLabel}</p>` : nothing}
        <div class="uga-callout__body">
          ${trimmedBody ? html`<p class="uga-callout__text">${trimmedBody}</p>` : nothing}
          <div class="uga-callout__body-slot"></div>
        </div>
      </aside>
    `;
  }
}
