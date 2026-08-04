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

// レンタル対象になるのはDVD・ブルーレイとCD。ゲーム・コミックは販売のみ。
export function isRentalCategory(category: Category): boolean {
  return category === "DVD・ブルーレイ" || category === "CD";
}

// 商品マスタ: 「商品そのもの」の情報のみを持つ。在庫数・価格は持たない。
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
  description: string;
  imageUrl: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

// 在庫: 「店舗ごとの在庫・価格・状態」を持つ。商品マスタとは別の実体。
// 新作/準新作/旧作は自動計算ではなく、人気度に応じてスタッフが手動で切り替える。
export interface Inventory {
  productId: string;
  store: string;
  stock: number;
  releaseStatus: ReleaseStatus | null;
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
