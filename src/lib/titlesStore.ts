import { Title, TitleInput } from "./types";
import { mockTitles } from "./mockData";

const STORAGE_KEY = "rental-titles";

let titles: Title[] | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): Title[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return mockTitles;
  try {
    return JSON.parse(raw) as Title[];
  } catch {
    return mockTitles;
  }
}

function ensureLoaded(): Title[] {
  if (typeof window === "undefined") {
    return mockTitles;
  }
  if (titles === null) {
    titles = readFromStorage();
  }
  return titles;
}

function persistAndNotify(next: Title[]) {
  titles = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): Title[] {
  return ensureLoaded();
}

export function getServerSnapshot(): Title[] {
  return mockTitles;
}

export function getTitle(id: string): Title | undefined {
  return ensureLoaded().find((t) => t.id === id);
}

export function addTitle(input: TitleInput): Title {
  const now = new Date().toISOString();
  const newTitle: Title = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  persistAndNotify([...ensureLoaded(), newTitle]);
  return newTitle;
}

export function updateTitle(id: string, input: TitleInput) {
  persistAndNotify(
    ensureLoaded().map((t) =>
      t.id === id ? { ...t, ...input, updatedAt: new Date().toISOString() } : t
    )
  );
}

export function deleteTitle(id: string) {
  persistAndNotify(ensureLoaded().filter((t) => t.id !== id));
}
