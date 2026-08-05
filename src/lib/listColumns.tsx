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

// レンタル対象のうち、今すぐ貸し出せる個体数。新品/中古はすべての在庫が
// そのまま店頭在庫になるため在庫総数と同じ値を返す。
export function getShelfStockCount(row: ProductRow): number {
  if (isRentalDealType(row.product.dealType)) {
    return row.copies.filter((c) => c.status === "貸出可能").length;
  }
  return getStockCount(row);
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
  | "totalStock"
  | "shelfStock"
  | "releaseStatus"
  | "updatedAt"
  | "publishStatus";

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
    render: (r) => <DealTypeBadge dealType={r.product.dealType} />,
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
    key: "totalStock",
    label: "在庫総数",
    align: "right",
    render: (r) => String(getStockCount(r)),
    sortValue: (r) => getStockCount(r),
  },
  {
    key: "shelfStock",
    label: "店頭在庫(貸出可能数)",
    align: "right",
    render: (r) => String(getShelfStockCount(r)),
    sortValue: (r) => getShelfStockCount(r),
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
  {
    key: "publishStatus",
    label: "公開状態",
    render: (r) => (
      <PublishStatusBadge status={r.product.publishStatus} dealType={r.product.dealType} />
    ),
    sortValue: (r) => r.product.publishStatus,
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
