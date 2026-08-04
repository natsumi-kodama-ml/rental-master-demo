"use client";

import { useSyncExternalStore } from "react";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  toggleColumn,
  resetColumns,
} from "@/lib/columnPrefsStore";
import { COLUMN_DEFS } from "@/lib/listColumns";

export function useColumnVisibility() {
  const visibleColumns = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  return { visibleColumns, toggleColumn, resetColumns, columnDefs: COLUMN_DEFS };
}
