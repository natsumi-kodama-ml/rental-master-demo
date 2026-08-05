"use client";

import { useSyncExternalStore } from "react";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  setFilters,
  resetFilters,
} from "@/lib/filterPrefsStore";

export function useFilterPrefs() {
  const filters = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { filters, setFilters, resetFilters };
}
