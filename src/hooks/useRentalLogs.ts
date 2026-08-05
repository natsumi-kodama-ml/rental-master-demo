"use client";

import { useSyncExternalStore } from "react";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  getLogsForProduct,
  getOpenLogForCopy,
  deleteLogsForProduct,
} from "@/lib/rentalLogStore";

export function useRentalLogs() {
  const logs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    logs,
    getLogsForProduct,
    getOpenLogForCopy,
    deleteLogsForProduct,
  };
}
