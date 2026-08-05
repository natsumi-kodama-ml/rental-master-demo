export const CATEGORIES = ["ゲーム", "DVD・ブルーレイ", "CD", "コミック"] as const;

export type Category = (typeof CATEGORIES)[number];

// 区分: この商品が新品販売/中古販売/レンタルのどれとして扱われるか。
// 同じタイトルでも新品と中古は別商品(別の行)として登録する。
export const DEAL_TYPES = ["新品", "中古", "レンタル"] as const;

export type DealType = (typeof DEAL_TYPES)[number];

export const PUBLISH_STATUSES = ["販売中", "予約受付中", "取扱終了"] as const;

export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export const RELEASE_STATUSES = ["新作", "準新作", "旧作"] as const;

export type ReleaseStatus = (typeof RELEASE_STATUSES)[number];

// レンタル対象(在庫個体での管理)かどうかは区分で決まる。
export function isRentalDealType(dealType: DealType): boolean {
  return dealType === "レンタル";
}

// 直接の販売価格を持つ(新品/中古として売る)商品かどうか。
export function canSellDealType(dealType: DealType): boolean {
  return dealType === "新品" || dealType === "中古";
}

// 買取に対応するのはゲームの中古品のみ。
export function isBuybackEligible(category: Category, dealType: DealType): boolean {
  return category === "ゲーム" && dealType === "中古";
}

// レンタル対象カテゴリのうち、引退した個体を中古販売できるカテゴリ。
// DVD・ブルーレイのみレンタル落ちを中古販売する。CD/コミックは販売経路自体がない。
export function canSellRetiredCopies(category: Category): boolean {
  return category === "DVD・ブルーレイ";
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
  dealType: DealType;
  publishStatus: PublishStatus;
  releaseStatus: ReleaseStatus | null;
  imageUrl: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

// 在庫: 「店舗ごとの価格」を持つ。商品マスタとは別の実体。
// レンタル料金(新作/準新作/旧作ごと)は全店舗共通の料金表で決まるため、
// 商品ごとには持たない。
export interface Inventory {
  productId: string;
  store: string;
  stock: number;
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
  createdAt: string;
}

export type CopyInput = Omit<Copy, "id" | "createdAt">;

// 貸出履歴: 個体単位で「誰に・いつ・いつまで」貸したかを記録する。
// returnedAt が null なら現在貸出中。
export interface RentalLog {
  id: string;
  copyId: string;
  productId: string;
  memberId: string;
  rentedAt: string;
  dueDate: string;
  returnedAt: string | null;
}
