export interface FilterState {
  search: string;
  category: string;
  genre: string;
  publishStatus: string;
}

const STORAGE_KEY = "rental-list-filters";

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  category: "all",
  genre: "all",
  publishStatus: "active",
};

let filters: FilterState | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): FilterState {
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_FILTERS;
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_FILTERS, ...parsed };
  } catch {
    return DEFAULT_FILTERS;
  }
}

function ensureLoaded(): FilterState {
  if (typeof window === "undefined") {
    return DEFAULT_FILTERS;
  }
  if (filters === null) {
    filters = readFromStorage();
  }
  return filters;
}

function persistAndNotify(next: FilterState) {
  filters = next;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): FilterState {
  return ensureLoaded();
}

export function getServerSnapshot(): FilterState {
  return DEFAULT_FILTERS;
}

export function setFilters(partial: Partial<FilterState>) {
  persistAndNotify({ ...ensureLoaded(), ...partial });
}

export function resetFilters() {
  persistAndNotify(DEFAULT_FILTERS);
}
