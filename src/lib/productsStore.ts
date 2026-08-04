import { Product, ProductInput } from "./types";
import { mockProducts } from "./mockData";

const STORAGE_KEY = "rental-products";

let products: Product[] | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): Product[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return mockProducts;
  try {
    return JSON.parse(raw) as Product[];
  } catch {
    return mockProducts;
  }
}

function ensureLoaded(): Product[] {
  if (typeof window === "undefined") {
    return mockProducts;
  }
  if (products === null) {
    products = readFromStorage();
  }
  return products;
}

function persistAndNotify(next: Product[]) {
  products = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): Product[] {
  return ensureLoaded();
}

export function getServerSnapshot(): Product[] {
  return mockProducts;
}

export function getProduct(id: string): Product | undefined {
  return ensureLoaded().find((p) => p.id === id);
}

export function addProduct(input: ProductInput): Product {
  const now = new Date().toISOString();
  const newProduct: Product = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  persistAndNotify([...ensureLoaded(), newProduct]);
  return newProduct;
}

export function updateProduct(id: string, input: ProductInput) {
  persistAndNotify(
    ensureLoaded().map((p) =>
      p.id === id ? { ...p, ...input, updatedAt: new Date().toISOString() } : p
    )
  );
}

export function deleteProduct(id: string) {
  persistAndNotify(ensureLoaded().filter((p) => p.id !== id));
}
