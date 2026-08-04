"use client";

import { useSyncExternalStore } from "react";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  getTitle,
  addTitle,
  updateTitle,
  deleteTitle,
} from "@/lib/titlesStore";

export function useTitles() {
  const titles = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { titles, getTitle, addTitle, updateTitle, deleteTitle };
}
