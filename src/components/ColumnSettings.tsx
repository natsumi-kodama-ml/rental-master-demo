"use client";

import { useState } from "react";
import { useColumnVisibility } from "@/hooks/useColumnVisibility";

export default function ColumnSettings() {
  const [open, setOpen] = useState(false);
  const { visibleColumns, toggleColumn, resetColumns, columnDefs } =
    useColumnVisibility();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-navy-200 bg-white px-4 py-1.5 text-sm text-navy-700 hover:bg-navy-50"
      >
        ⚙️ 表示項目
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
            <p className="mb-2 text-xs font-semibold text-gray-500">
              一覧に表示する項目
            </p>
            <p className="mb-2 text-xs text-gray-400">商品名は常に表示されます</p>
            <div className="flex flex-col gap-1.5">
              {columnDefs.map((col) => (
                <label
                  key={col.key}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col.key)}
                    onChange={() => toggleColumn(col.key)}
                    className="h-4 w-4 rounded border-gray-300 accent-navy-700"
                  />
                  {col.label}
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={resetColumns}
              className="mt-3 text-xs text-navy-700 hover:underline"
            >
              初期設定に戻す
            </button>
          </div>
        </>
      )}
    </div>
  );
}
