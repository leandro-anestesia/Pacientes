const KEY = 'gestanest_records';

export function loadRecords() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecords(records) {
  try {
    localStorage.setItem(KEY, JSON.stringify(records));
  } catch {
    // storage quota exceeded – silently fail
  }
}
