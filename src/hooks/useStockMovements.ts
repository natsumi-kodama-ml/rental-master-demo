"use client";

import { useSyncExternalStore } from "react";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  getMovementsForProduct,
  addStockMovement,
  deleteMovementsForProduct,
} from "@/lib/stockMovementStore";

export function useStockMovements() {
  const movements = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    movements,
    getMovementsForProduct,
    addStockMovement,
    deleteMovementsForProduct,
  };
}
