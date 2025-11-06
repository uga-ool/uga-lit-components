// Safe fetch wrapper that returns { ok, data, error }
export async function fetchJson(url, init) {
  try {
    const res = await fetch(url, init);
    if (!res.ok) return { ok: false, error: new Error(`${res.status} ${res.statusText}`) };
    return { ok: true, data: await res.json() };
  } catch (e) {
    return { ok: false, error: e };
  }
}
