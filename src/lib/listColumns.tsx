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
import CdTierBadge from "@/components/CdTierBadge";
import ComicTierBadge from "@/components/ComicTierBadge";

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

// レンタル対象のうち、今すぐ貸し出せる個体数。販売(新品/中古/レンタル落ち)は
// 「貸出可能数」という概念自体が存在しないため対象外(null)。
export function getShelfStockCount(row: ProductRow): number | null {
  if (!isRentalDealType(row.product.dealType)) return null;
  return row.copies.filter((c) => c.status === "貸出可能").length;
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

// 列の並び順は「どのくらい頻繁に必要になるか」で決めている。
// - 商品コード/公開状態: 一覧をスキャンして稼働中かどうかを最初に見るための列。
// - カテゴリ/区分/料金区分/対応機種・メディア/ジャンル/メーカー・発売元:
//   店内のどの棚に置いてあるか(新作コーナーか通常棚か等)を特定するための情報。
//   料金区分(新作/準新作/旧作、CDのアルバム新作/旧作/シングル)は棚の配置自体に
//   直結するため、単なる料金情報ではなくこのグループに含める。
// - JANコード/発売日: 上記より使う頻度は低いが一覧に残す。
// - 在庫総数: お客様からよく聞かれる+続き物で何巻まで貸出中か横断で見たいため
//   一覧に置く。
// - 更新日/店頭在庫(貸出可能数): レンタル商品限定など参照頻度が低い情報。
// 販売価格・買取価格・対応言語・返却日などのさらに突っ込んだ情報は、聞かれる
// 頻度が低いため一覧には出さず商品詳細ページのみに置く。
export const COLUMN_DEFS: ColumnDef[] = [
  {
    key: "code",
    label: "商品コード",
    render: (r) => r.product.code,
    sortValue: (r) => r.product.code,
  },
  {
    key: "publishStatus",
    label: "公開状態",
    render: (r) => (
      <PublishStatusBadge status={r.product.publishStatus} dealType={r.product.dealType} />
    ),
    sortValue: (r) => r.product.publishStatus,
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
    key: "releaseStatus",
    label: "料金区分",
    render: (r) => {
      if (r.product.cdType) return <CdTierBadge cdType={r.product.cdType} />;
      if (r.product.category === "コミック" && isRentalDealType(r.product.dealType)) {
        return <ComicTierBadge />;
      }
      return isRentalDealType(r.product.dealType) ? (
        <ReleaseStatusPill status={r.product.releaseStatus} />
      ) : (
        <span className="text-xs text-gray-300">-</span>
      );
    },
    sortValue: (r) => r.product.cdType ?? r.product.releaseStatus ?? "",
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
    key: "updatedAt",
    label: "更新日",
    render: (r) => formatDate(r.product.updatedAt),
    sortValue: (r) => r.product.updatedAt,
  },
  {
    key: "shelfStock",
    label: "店頭在庫(貸出可能数)",
    align: "right",
    render: (r) => {
      const count = getShelfStockCount(r);
      return count === null ? (
        <span className="text-gray-300">-</span>
      ) : (
        String(count)
      );
    },
    sortValue: (r) => getShelfStockCount(r) ?? -1,
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
