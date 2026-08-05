import { Copy, CopyInput } from "./types";
import { mockCopies } from "./mockData";

const STORAGE_KEY = "rental-copies-v2";

let copies: Copy[] | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): Copy[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return mockCopies;
  try {
    return JSON.parse(raw) as Copy[];
  } catch {
    return mockCopies;
  }
}

function ensureLoaded(): Copy[] {
  if (typeof window === "undefined") {
    return mockCopies;
  }
  if (copies === null) {
    copies = readFromStorage();
  }
  return copies;
}

function persistAndNotify(next: Copy[]) {
  copies = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): Copy[] {
  return ensureLoaded();
}

export function getServerSnapshot(): Copy[] {
  return mockCopies;
}

export function getCopiesForProduct(productId: string): Copy[] {
  return ensureLoaded().filter((c) => c.productId === productId);
}

export function getCopy(copyId: string): Copy | undefined {
  return ensureLoaded().find((c) => c.id === copyId);
}

export function addCopy(input: CopyInput): Copy {
  const newCopy: Copy = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  persistAndNotify([...ensureLoaded(), newCopy]);
  return newCopy;
}

export function updateCopyStatus(
  copyId: string,
  status: Copy["status"],
  condition?: string
) {
  persistAndNotify(
    ensureLoaded().map((c) =>
      c.id === copyId
        ? { ...c, status, ...(condition !== undefined ? { condition } : {}) }
        : c
    )
  );
}

export function deleteCopiesForProduct(productId: string) {
  persistAndNotify(ensureLoaded().filter((c) => c.productId !== productId));
}
