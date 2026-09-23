import type { ComplexAttributeConverter } from 'lit';

// Course HTML is hand-written by instructional designers who spell a disabled
// feature as attr="false". Lit's default Boolean converter reads presence only,
// so attr="false" would arrive as true and a property defaulting to true could
// never be turned off from markup.
export const booleanAttribute: ComplexAttributeConverter<boolean> = {
  fromAttribute: (value: string | null): boolean =>
    value !== null && value.toLowerCase() !== 'false',
  toAttribute: (value: boolean): string | null => (value ? '' : null),
};
