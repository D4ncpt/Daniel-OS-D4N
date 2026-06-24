// Keep storage concerns behind one small API so a database adapter can replace it later.
const KEYS = ["tasks", "applications", "notes", "summaries", "dailyCards", "cfaProgress", "divinations"];

const parse = (value, fallback) => {
  try { return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
};

export const storage = {
  get(key) {
    if (!KEYS.includes(key)) throw new Error(`Unknown storage key: ${key}`);
    return parse(localStorage.getItem(`danielCenter.${key}`), key === "dailyCards" ? {} : []);
  },
  set(key, value) {
    if (!KEYS.includes(key)) throw new Error(`Unknown storage key: ${key}`);
    localStorage.setItem(`danielCenter.${key}`, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("daniel-center:change", { detail: { key } }));
    return value;
  },
  add(key, item) {
    const items = this.get(key);
    items.unshift(item);
    return this.set(key, items);
  },
  update(key, id, changes) {
    return this.set(key, this.get(key).map((item) => item.id === id ? { ...item, ...changes } : item));
  },
  remove(key, id) {
    return this.set(key, this.get(key).filter((item) => item.id !== id));
  }
};

export const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function initializeStorage() {
  KEYS.forEach((key) => {
    const fullKey = `danielCenter.${key}`;
    if (localStorage.getItem(fullKey) === null) storage.set(key, key === "dailyCards" ? {} : []);
  });
}
