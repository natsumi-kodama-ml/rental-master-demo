"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import { useInventory } from "@/hooks/useInventory";
import { useCopies } from "@/hooks/useCopies";
import { useRentalLogs } from "@/hooks/useRentalLogs";
import { useColumnVisibility } from "@/hooks/useColumnVisibility";
import { ProductRow } from "@/lib/listColumns";
import ProductFilters from "./ProductFilters";
import ProductTable from "./ProductTable";
import ColumnSettings from "./ColumnSettings";

export default function ProductListPage() {
  const { products, deleteProduct } = useProducts();
  const { inventory, deleteInventory } = useInventory();
  const { copies, deleteCopiesForProduct } = useCopies();
  const { deleteLogsForProduct } = useRentalLogs();
  const { visibleColumns } = useColumnVisibility();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [genre, setGenre] = useState("all");
  const [publishStatus, setPublishStatus] = useState("active");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const rows: ProductRow[] = useMemo(
    () =>
      products.map((product) => ({
        product,
        inventory: inventory.find((i) => i.productId === product.id),
        copies: copies.filter((c) => c.productId === product.id),
      })),
    [products, inventory, copies]
  );

  const genreOptions = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.genre).filter(Boolean))).sort(),
    [products]
  );

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows.filter(({ product, copies: productCopies }) => {
      const matchesKeyword =
        keyword === "" ||
        product.name.toLowerCase().includes(keyword) ||
        product.janCode.toLowerCase().includes(keyword) ||
        productCopies.some((c) => c.copyCode.toLowerCase().includes(keyword));
      const matchesCategory = category === "all" || product.category === category;
      const matchesGenre = genre === "all" || product.genre === genre;
      const matchesPublishStatus =
        publishStatus === "all" ||
        (publishStatus === "active" ? product.publishStatus !== "取扱終了" : product.publishStatus === publishStatus);
      return (
        matchesKeyword && matchesCategory && matchesGenre && matchesPublishStatus
      );
    });
  }, [rows, search, category, genre, publishStatus]);

  const isFiltered =
    search.trim() !== "" ||
    category !== "all" ||
    genre !== "all" ||
    publishStatus !== "active";

  function resetFilters() {
    setSearch("");
    setCategory("all");
    setGenre("all");
    setPublishStatus("active");
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const allSelected =
        filteredRows.length > 0 &&
        filteredRows.every((r) => prev.has(r.product.id));
      const next = new Set(prev);
      filteredRows.forEach((r) => {
        if (allSelected) {
          next.delete(r.product.id);
        } else {
          next.add(r.product.id);
        }
      });
      return next;
    });
  }

  function handleBulkDelete() {
    const confirmed = window.confirm(
      `選択した${selectedIds.size}件を削除します。この操作は取り消せません。よろしいですか？`
    );
    if (!confirmed) return;
    selectedIds.forEach((id) => {
      deleteCopiesForProduct(id);
      deleteLogsForProduct(id);
      deleteInventory(id);
      deleteProduct(id);
    });
    clearSelection();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">商品マスタ</h1>
        <Link
          href="/products/new"
          className="rounded-full bg-gold-400 px-5 py-2.5 text-sm font-bold text-navy-900 shadow-md transition hover:bg-gold-500"
        >
          + 新規登録
        </Link>
      </div>

      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        genre={genre}
        onGenreChange={setGenre}
        genreOptions={genreOptions}
        publishStatus={publishStatus}
        onPublishStatusChange={setPublishStatus}
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">{filteredRows.length}件表示中</p>
        <ColumnSettings />
      </div>

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gold-300 bg-gold-50 px-4 py-3 text-sm">
          <span className="font-semibold text-navy-800">
            {selectedIds.size}件選択中
          </span>
          <button
            type="button"
            onClick={handleBulkDelete}
            className="rounded-full bg-white px-3 py-1.5 font-medium text-rose-500 shadow-sm hover:bg-rose-50"
          >
            削除
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="ml-auto text-xs text-navy-700 hover:underline"
          >
            選択解除
          </button>
        </div>
      )}

      {filteredRows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">条件に一致する商品がありません</p>
          {isFiltered && (
            <>
              <p className="text-xs text-gray-400">
                キーワードや絞り込み条件を見直してみてください
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full bg-gold-400 px-4 py-2 text-xs font-bold text-navy-900 shadow-sm transition hover:bg-gold-500"
              >
                絞り込みをリセット
              </button>
            </>
          )}
        </div>
      ) : (
        <ProductTable
          rows={filteredRows}
          visibleColumns={visibleColumns}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
        />
      )}
    </div>
  );
}
