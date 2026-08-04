"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import { useInventory } from "@/hooks/useInventory";
import { useCopies } from "@/hooks/useCopies";
import { useColumnVisibility } from "@/hooks/useColumnVisibility";
import { ProductRow } from "@/lib/listColumns";
import ProductFilters from "./ProductFilters";
import ProductTable from "./ProductTable";
import ColumnSettings from "./ColumnSettings";

export default function ProductListPage() {
  const { products } = useProducts();
  const { inventory } = useInventory();
  const { copies } = useCopies();
  const { visibleColumns } = useColumnVisibility();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [genre, setGenre] = useState("all");
  const [publishStatus, setPublishStatus] = useState("all");

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
    return rows.filter(({ product }) => {
      const matchesKeyword =
        keyword === "" ||
        product.name.toLowerCase().includes(keyword) ||
        product.janCode.toLowerCase().includes(keyword);
      const matchesCategory = category === "all" || product.category === category;
      const matchesGenre = genre === "all" || product.genre === genre;
      const matchesPublishStatus =
        publishStatus === "all" || product.publishStatus === publishStatus;
      return (
        matchesKeyword && matchesCategory && matchesGenre && matchesPublishStatus
      );
    });
  }, [rows, search, category, genre, publishStatus]);

  const isFiltered =
    search.trim() !== "" ||
    category !== "all" ||
    genre !== "all" ||
    publishStatus !== "all";

  function resetFilters() {
    setSearch("");
    setCategory("all");
    setGenre("all");
    setPublishStatus("all");
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
        <ProductTable rows={filteredRows} visibleColumns={visibleColumns} />
      )}
    </div>
  );
}
