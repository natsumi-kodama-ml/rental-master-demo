export const CATEGORIES = ["ゲーム", "DVD・ブルーレイ", "CD", "コミック"] as const;

export type Category = (typeof CATEGORIES)[number];

export const CONDITION_TYPES = [
  "新品のみ",
  "中古のみ",
  "新品・中古両方",
] as const;

export type ConditionType = (typeof CONDITION_TYPES)[number];

export const PUBLISH_STATUSES = ["販売中", "予約受付中", "取扱終了"] as const;

export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export const RELEASE_STATUSES = ["新作", "準新作", "旧作"] as const;

export type ReleaseStatus = (typeof RELEASE_STATUSES)[number];

// レンタル対象になるのはDVD・ブルーレイ/CD/コミック。ゲームのみ販売専用。
export function isRentalCategory(category: Category): boolean {
  return category !== "ゲーム";
}

// 買取に対応するのはゲームのみ。
export function isBuybackCategory(category: Category): boolean {
  return category === "ゲーム";
}

// 販売という取引が存在するカテゴリ。ゲームは新品/中古で販売、
// DVD・ブルーレイはレンタル落ちのみ中古販売。CD/コミックは販売経路自体がない。
export function canSellCategory(category: Category): boolean {
  return category === "ゲーム" || category === "DVD・ブルーレイ";
}

// 商品マスタ: 「商品そのもの」の情報を持つ。在庫数・価格は持たない。
// 新作/準新作/旧作は商品全体のステータス。自動計算ではなく、人気度に応じて
// スタッフが手動で切り替える(店舗別の在庫状態とは別軸の情報)。
export interface Product {
  id: string;
  code: string;
  janCode: string;
  name: string;
  category: Category;
  genre: string;
  maker: string;
  platform: string;
  releaseDate: string;
  conditionType: ConditionType;
  publishStatus: PublishStatus;
  releaseStatus: ReleaseStatus | null;
  description: string;
  imageUrl: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

// 在庫: 「店舗ごとの価格」を持つ。商品マスタとは別の実体。
export interface Inventory {
  productId: string;
  store: string;
  stock: number;
  rentalPriceNew: number | null;
  rentalPriceSemiNew: number | null;
  rentalPriceOld: number | null;
  salePrice: number;
  buybackPrice: number;
  itemCondition: string;
  arrivedAt: string;
  updatedAt: string;
}

export type InventoryInput = Omit<Inventory, "productId" | "updatedAt">;

export const COPY_STATUSES = [
  "貸出可能",
  "貸出中",
  "点検中",
  "廃棄",
  "返品",
  "販売済み",
] as const;

export type CopyStatus = (typeof COPY_STATUSES)[number];

// 個体が実際に貸出可能な在庫として数えられる状態。
export const ACTIVE_COPY_STATUSES: CopyStatus[] = ["貸出可能", "貸出中", "点検中"];

// 個体が「引退」した(貸出・在庫カウントの対象外になった)状態。
export const RETIRED_COPY_STATUSES: CopyStatus[] = ["廃棄", "返品", "販売済み"];

// 個体(コピー): レンタル対象カテゴリの「1枚1枚」を管理する。
// 在庫数・貸出中数はここから集計するため、Inventory.stock とは別管理。
export interface Copy {
  id: string;
  productId: string;
  copyCode: string;
  status: CopyStatus;
  condition: string;
  createdAt: string;
}

export type CopyInput = Omit<Copy, "id" | "createdAt">;

// 貸出履歴: 個体単位で「誰に・いつ・いつまで」貸したかを記録する。
// returnedAt が null なら現在貸出中。
export interface RentalLog {
  id: string;
  copyId: string;
  productId: string;
  borrowerName: string;
  rentedAt: string;
  dueDate: string;
  returnedAt: string | null;
}
