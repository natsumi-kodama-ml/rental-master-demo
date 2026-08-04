import { ColumnKey, COLUMN_DEFS, DEFAULT_VISIBLE_COLUMNS } from "./listColumns";

const STORAGE_KEY = "rental-list-columns";

let visibleColumns: ColumnKey[] | null = null;
const listeners = new Set<() => void>();

function isColumnKey(value: string): value is ColumnKey {
  return COLUMN_DEFS.some((c) => c.key === value);
}

function readFromStorage(): ColumnKey[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_VISIBLE_COLUMNS;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_VISIBLE_COLUMNS;
    const filtered = parsed.filter(
      (v): v is ColumnKey => typeof v === "string" && isColumnKey(v)
    );
    return filtered.length > 0 ? filtered : DEFAULT_VISIBLE_COLUMNS;
  } catch {
    return DEFAULT_VISIBLE_COLUMNS;
  }
}

function ensureLoaded(): ColumnKey[] {
  if (typeof window === "undefined") {
    return DEFAULT_VISIBLE_COLUMNS;
  }
  if (visibleColumns === null) {
    visibleColumns = readFromStorage();
  }
  return visibleColumns;
}

function persistAndNotify(next: ColumnKey[]) {
  visibleColumns = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): ColumnKey[] {
  return ensureLoaded();
}

export function getServerSnapshot(): ColumnKey[] {
  return DEFAULT_VISIBLE_COLUMNS;
}

export function toggleColumn(key: ColumnKey) {
  const current = ensureLoaded();
  const next = current.includes(key)
    ? current.filter((k) => k !== key)
    : [...current, key];
  persistAndNotify(next);
}

export function resetColumns() {
  persistAndNotify(DEFAULT_VISIBLE_COLUMNS);
}
