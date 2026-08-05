"use client";

import { useSyncExternalStore } from "react";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  getCopiesForProduct,
  getCopy,
  addCopy,
  updateCopyStatus,
  moveCopyToProduct,
  deleteCopiesForProduct,
} from "@/lib/copyStore";

export function useCopies() {
  const copies = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    copies,
    getCopiesForProduct,
    getCopy,
    addCopy,
    updateCopyStatus,
    moveCopyToProduct,
    deleteCopiesForProduct,
  };
}
