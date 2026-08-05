"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { COLUMN_DEFS, ColumnKey, ProductRow } from "@/lib/listColumns";

type SortKey = ColumnKey | "name";
type SortDir = "asc" | "desc";

function SortableHeader({
  sortKeyValue,
  align,
  active,
  sortDir,
  onSort,
  children,
}: {
  sortKeyValue: SortKey;
  align?: "left" | "right";
  active: boolean;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  children: React.ReactNode;
}) {
  return (
    <th
      className={`whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-navy-700 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKeyValue)}
        className={`inline-flex items-center gap-1 hover:text-navy-900 ${
          align === "right" ? "flex-row-reverse" : ""
        }`}
      >
        {children}
        <span className={active ? "text-navy-900" : "text-navy-200"}>
          {active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}

export default function ProductTable({
  rows,
  visibleColumns,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: {
  rows: ProductRow[];
  visibleColumns: ColumnKey[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}) {
  const columns = COLUMN_DEFS.filter((col) => visibleColumns.includes(col.key));
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const allSelected =
    rows.length > 0 && rows.every((r) => selectedIds.has(r.product.id));
  const someSelected = rows.some((r) => selectedIds.has(r.product.id));
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const getValue: ((r: ProductRow) => string | number) | undefined =
      sortKey === "name"
        ? (r) => r.product.name
        : COLUMN_DEFS.find((c) => c.key === sortKey)?.sortValue;
    if (!getValue) return rows;
    return [...rows].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full min-w-[760px] divide-y divide-gray-200 text-sm">
        <thead className="bg-navy-50">
          <tr>
            <th className="w-10 px-4 py-2.5">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                aria-label="すべて選択"
                className="h-4 w-4 rounded border-gray-300 accent-gold-400"
              />
            </th>
            <SortableHeader
              sortKeyValue="name"
              active={sortKey === "name"}
              sortDir={sortDir}
              onSort={handleSort}
            >
              商品名
            </SortableHeader>
            {columns.map((col) =>
              col.sortValue ? (
                <SortableHeader
                  key={col.key}
                  sortKeyValue={col.key}
                  align={col.align}
                  active={sortKey === col.key}
                  sortDir={sortDir}
                  onSort={handleSort}
                >
                  {col.label}
                </SortableHeader>
              ) : (
                <th
                  key={col.key}
                  className={`whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-navy-700 ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.label}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedRows.map((row) => (
            <tr
              key={row.product.id}
              className={`hover:bg-navy-50/40 ${
                selectedIds.has(row.product.id) ? "bg-gold-50" : ""
              }`}
            >
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectedIds.has(row.product.id)}
                  onChange={() => onToggleSelect(row.product.id)}
                  aria-label={`${row.product.name}を選択`}
                  className="h-4 w-4 rounded border-gray-300 accent-gold-400"
                />
              </td>
              <td className="whitespace-nowrap px-4 py-2">
                <Link
                  href={`/products/${row.product.id}`}
                  className="font-medium text-navy-700 hover:underline"
                >
                  {row.product.name}
                </Link>
              </td>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`whitespace-nowrap px-4 py-2 text-gray-600 ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
