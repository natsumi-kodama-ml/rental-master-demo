"use client";

import { useSyncExternalStore } from "react";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  getInventory,
  upsertInventory,
  deleteInventory,
} from "@/lib/inventoryStore";

export function useInventory() {
  const inventory = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { inventory, getInventory, upsertInventory, deleteInventory };
}
