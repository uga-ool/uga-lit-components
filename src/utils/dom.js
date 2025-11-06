// Shared DOM utilities
export const on = (el, evt, fn, opts) => (el.addEventListener(evt, fn, opts), () => el.removeEventListener(evt, fn, opts));
export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Simple debounce (for scroll/resize handlers, etc.)
export const debounce = (fn, wait = 150) => {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
};

// Visibility observer (used by “return to top”, lazy rendering, etc.)
export const onVisible = (el, cb, opts) => {
  const io = new IntersectionObserver((entries) => entries.forEach(e => e.isIntersecting && cb(e)), opts);
  io.observe(el); return () => io.disconnect();
};
