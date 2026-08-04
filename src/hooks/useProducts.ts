"use client";

import { useSyncExternalStore } from "react";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/productsStore";

export function useProducts() {
  const products = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { products, getProduct, addProduct, updateProduct, deleteProduct };
}
