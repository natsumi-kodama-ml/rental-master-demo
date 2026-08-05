"use client";

import { useSyncExternalStore } from "react";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  getLogsForProduct,
  getOpenLogForCopy,
  getLogsForMember,
  deleteLogsForProduct,
} from "@/lib/rentalLogStore";

export function useRentalLogs() {
  const logs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    logs,
    getLogsForProduct,
    getOpenLogForCopy,
    getLogsForMember,
    deleteLogsForProduct,
  };
}
