export const fmtDate = (iso, locale = navigator.language, opts = {}) =>
  new Date(iso).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short', ...opts });

export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
