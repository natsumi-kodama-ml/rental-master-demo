import { RentalLog } from "./types";
import { mockRentalLogs } from "./mockData";

const STORAGE_KEY = "rental-logs";

let logs: RentalLog[] | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): RentalLog[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return mockRentalLogs;
  try {
    return JSON.parse(raw) as RentalLog[];
  } catch {
    return mockRentalLogs;
  }
}

function ensureLoaded(): RentalLog[] {
  if (typeof window === "undefined") {
    return mockRentalLogs;
  }
  if (logs === null) {
    logs = readFromStorage();
  }
  return logs;
}

function persistAndNotify(next: RentalLog[]) {
  logs = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): RentalLog[] {
  return ensureLoaded();
}

export function getServerSnapshot(): RentalLog[] {
  return mockRentalLogs;
}

export function getLogsForProduct(productId: string): RentalLog[] {
  return ensureLoaded().filter((l) => l.productId === productId);
}

export function getOpenLogForCopy(copyId: string): RentalLog | undefined {
  return ensureLoaded().find((l) => l.copyId === copyId && l.returnedAt === null);
}

// 貸出・返却の記録自体は接客時のレジ(POS)側システムが作る想定で、
// この商品マスタ画面からは作成しない(表示のみ)。

export function deleteLogsForProduct(productId: string) {
  persistAndNotify(ensureLoaded().filter((l) => l.productId !== productId));
}
