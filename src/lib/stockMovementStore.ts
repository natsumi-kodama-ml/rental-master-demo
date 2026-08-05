import { StockMovement, StockMovementInput } from "./types";
import { mockStockMovements } from "./mockData";

const STORAGE_KEY = "rental-stock-movements-v1";

let movements: StockMovement[] | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): StockMovement[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return mockStockMovements;
  try {
    return JSON.parse(raw) as StockMovement[];
  } catch {
    return mockStockMovements;
  }
}

function ensureLoaded(): StockMovement[] {
  if (typeof window === "undefined") {
    return mockStockMovements;
  }
  if (movements === null) {
    movements = readFromStorage();
  }
  return movements;
}

function persistAndNotify(next: StockMovement[]) {
  movements = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): StockMovement[] {
  return ensureLoaded();
}

export function getServerSnapshot(): StockMovement[] {
  return mockStockMovements;
}

export function getMovementsForProduct(productId: string): StockMovement[] {
  return ensureLoaded()
    .filter((m) => m.productId === productId)
    .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));
}

export function addStockMovement(input: StockMovementInput): StockMovement {
  const newMovement: StockMovement = {
    ...input,
    id: crypto.randomUUID(),
  };
  persistAndNotify([...ensureLoaded(), newMovement]);
  return newMovement;
}

export function deleteMovementsForProduct(productId: string) {
  persistAndNotify(ensureLoaded().filter((m) => m.productId !== productId));
}
