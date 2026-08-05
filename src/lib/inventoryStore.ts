import { Inventory, InventoryInput } from "./types";
import { mockInventory } from "./mockData";

const STORAGE_KEY = "rental-inventory-v2";

let inventory: Inventory[] | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): Inventory[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return mockInventory;
  try {
    return JSON.parse(raw) as Inventory[];
  } catch {
    return mockInventory;
  }
}

function ensureLoaded(): Inventory[] {
  if (typeof window === "undefined") {
    return mockInventory;
  }
  if (inventory === null) {
    inventory = readFromStorage();
  }
  return inventory;
}

function persistAndNotify(next: Inventory[]) {
  inventory = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): Inventory[] {
  return ensureLoaded();
}

export function getServerSnapshot(): Inventory[] {
  return mockInventory;
}

export function getInventory(productId: string): Inventory | undefined {
  return ensureLoaded().find((i) => i.productId === productId);
}

// 在庫は商品マスタと別テーブル(別レコード)として管理する。
// このデモは単一店舗のため productId につき1レコードで運用する。
export function upsertInventory(productId: string, input: InventoryInput) {
  const now = new Date().toISOString();
  const current = ensureLoaded();
  const exists = current.some((i) => i.productId === productId);
  const next = exists
    ? current.map((i) =>
        i.productId === productId ? { ...i, ...input, updatedAt: now } : i
      )
    : [...current, { ...input, productId, updatedAt: now }];
  persistAndNotify(next);
}

export function deleteInventory(productId: string) {
  persistAndNotify(ensureLoaded().filter((i) => i.productId !== productId));
}
