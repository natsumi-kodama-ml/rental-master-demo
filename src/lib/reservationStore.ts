import { Reservation, ReservationInput } from "./types";
import { mockReservations } from "./mockData";

const STORAGE_KEY = "rental-reservations-v1";

let reservations: Reservation[] | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): Reservation[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return mockReservations;
  try {
    return JSON.parse(raw) as Reservation[];
  } catch {
    return mockReservations;
  }
}

function ensureLoaded(): Reservation[] {
  if (typeof window === "undefined") {
    return mockReservations;
  }
  if (reservations === null) {
    reservations = readFromStorage();
  }
  return reservations;
}

function persistAndNotify(next: Reservation[]) {
  reservations = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): Reservation[] {
  return ensureLoaded();
}

export function getServerSnapshot(): Reservation[] {
  return mockReservations;
}

export function getReservationsForProduct(productId: string): Reservation[] {
  return ensureLoaded()
    .filter((r) => r.productId === productId)
    .sort((a, b) => (a.reservedAt < b.reservedAt ? -1 : 1));
}

export function addReservation(input: ReservationInput): Reservation {
  const newReservation: Reservation = {
    ...input,
    id: crypto.randomUUID(),
    reservedAt: new Date().toISOString(),
  };
  persistAndNotify([...ensureLoaded(), newReservation]);
  return newReservation;
}

export function deleteReservation(id: string) {
  persistAndNotify(ensureLoaded().filter((r) => r.id !== id));
}

export function deleteReservationsForProduct(productId: string) {
  persistAndNotify(ensureLoaded().filter((r) => r.productId !== productId));
}
