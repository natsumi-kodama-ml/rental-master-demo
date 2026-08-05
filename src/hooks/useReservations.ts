"use client";

import { useSyncExternalStore } from "react";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  getReservationsForProduct,
  addReservation,
  deleteReservation,
  deleteReservationsForProduct,
} from "@/lib/reservationStore";

export function useReservations() {
  const reservations = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    reservations,
    getReservationsForProduct,
    addReservation,
    deleteReservation,
    deleteReservationsForProduct,
  };
}
