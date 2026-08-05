import { ReactNode } from "react";
import {
  ACTIVE_COPY_STATUSES,
  Copy,
  Inventory,
  Product,
  hasIndividualUnits,
  isRentalDealType,
} from "./types";
import PublishStatusBadge from "@/components/PublishStatusBadge";
import ReleaseStatusPill from "@/components/ReleaseStatusPill";
import DealTypeBadge from "@/components/DealTypeBadge";

export interface ProductRow {
  product: Product;
  inventory: Inventory | undefined;
  copies: Copy[];
}

// レンタル対象は在庫個体(Copy)から集計し、それ以外は Inventory.stock を使う。
export function getStockCount(row: ProductRow): number {
  if (hasIndividualUnits(row.product.dealType)) {
    return row.copies.filter((c) => ACTIVE_COPY_STATUSES.includes(c.status)).length;
  }
  return row.inventory?.stock ?? 0;
}

// レンタル対象のうち、今すぐ貸し出せる個体数(在庫数のうちの内訳)。
export function getAvailableCount(row: ProductRow): number {
  return row.copies.filter((c) => c.status === "貸出可能").length;
}

// レンタル落ちで中古販売の棚に並んでいる個体数(まだ売れていないもの)。
export function getUsedForSaleCount(row: ProductRow): number {
  return row.copies.filter((c) => c.status === "在庫").length;
}

export type ColumnKey =
  | "code"
  | "category"
  | "dealType"
  | "platform"
  | "genre"
  | "maker"
  | "janCode"
  | "releaseDate"
  | "publishStatus"
  | "stock"
  | "releaseStatus"
  | "updatedAt";

interface ColumnDef {
  key: ColumnKey;
  label: string;
  align?: "left" | "right";
  render: (row: ProductRow) => ReactNode;
  sortValue?: (row: ProductRow) => string | number;
}

function formatDate(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ja-JP");
}

export const COLUMN_DEFS: ColumnDef[] = [
  {
    key: "code",
    label: "商品コード",
    render: (r) => r.product.code,
    sortValue: (r) => r.product.code,
  },
  {
    key: "category",
    label: "カテゴリ",
    render: (r) => r.product.category,
    sortValue: (r) => r.product.category,
  },
  {
    key: "dealType",
    label: "区分",
    render: (r) => (
      <div className="flex items-center gap-1">
        <DealTypeBadge dealType={r.product.dealType} />
        {isRentalDealType(r.product.dealType) && getUsedForSaleCount(r) > 0 && (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
            中古{getUsedForSaleCount(r)}点
          </span>
        )}
      </div>
    ),
    sortValue: (r) => r.product.dealType,
  },
  {
    key: "platform",
    label: "対応機種・メディア",
    render: (r) => r.product.platform || "-",
    sortValue: (r) => r.product.platform,
  },
  {
    key: "genre",
    label: "ジャンル",
    render: (r) => r.product.genre || "-",
    sortValue: (r) => r.product.genre,
  },
  {
    key: "maker",
    label: "メーカー・発売元",
    render: (r) => r.product.maker || "-",
    sortValue: (r) => r.product.maker,
  },
  {
    key: "janCode",
    label: "JANコード",
    render: (r) => r.product.janCode || "-",
    sortValue: (r) => r.product.janCode,
  },
  {
    key: "releaseDate",
    label: "発売日",
    render: (r) => formatDate(r.product.releaseDate),
    sortValue: (r) => r.product.releaseDate,
  },
  {
    key: "publishStatus",
    label: "公開状態",
    render: (r) => <PublishStatusBadge status={r.product.publishStatus} />,
    sortValue: (r) => r.product.publishStatus,
  },
  {
    key: "stock",
    label: "在庫数(レンタルは貸出可能/総数)",
    align: "right",
    render: (r) =>
      isRentalDealType(r.product.dealType)
        ? `${getAvailableCount(r)} / ${getStockCount(r)}`
        : String(getStockCount(r)),
    sortValue: (r) => getStockCount(r),
  },
  {
    key: "releaseStatus",
    label: "新作/準新作/旧作",
    render: (r) =>
      isRentalDealType(r.product.dealType) ? (
        <ReleaseStatusPill status={r.product.releaseStatus} />
      ) : (
        <span className="text-xs text-gray-300">(対象外)</span>
      ),
    sortValue: (r) => r.product.releaseStatus ?? "",
  },
  {
    key: "updatedAt",
    label: "更新日",
    render: (r) => formatDate(r.product.updatedAt),
    sortValue: (r) => r.product.updatedAt,
  },
];

export const DEFAULT_VISIBLE_COLUMNS: ColumnKey[] = [
  "code",
  "category",
  "dealType",
  "platform",
  "genre",
  "maker",
  "publishStatus",
];
