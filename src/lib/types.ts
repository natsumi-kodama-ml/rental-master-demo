export const CATEGORIES = ["ゲーム", "DVD・ブルーレイ", "CD", "コミック"] as const;

export type Category = (typeof CATEGORIES)[number];

// 区分: この商品が新品販売/中古販売/レンタル/レンタル落ちのどれとして扱われるか。
// 同じタイトルでも新品と中古は別商品(別の行)として登録する。
// 「レンタル落ち」は中古と違い、レンタルから引退した個体をまとめて売る区分で、
// 個体ごとのコンディションは記録しない(中古は個体ごとに記録する)。
export const DEAL_TYPES = ["新品", "中古", "レンタル", "レンタル落ち"] as const;

export type DealType = (typeof DEAL_TYPES)[number];

// 発売前入荷: メーカーの発売日/レンタル開始日より前に店舗へ現物が届いている状態。
// 在庫はあるが、まだ店頭に出して売る/貸すことはできない。
export const PUBLISH_STATUSES = ["予約受付中", "発売前入荷", "販売中", "取扱終了"] as const;

export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export const RELEASE_STATUSES = ["新作", "準新作", "旧作"] as const;

export type ReleaseStatus = (typeof RELEASE_STATUSES)[number];

// 年齢指定: DVD・ブルーレイのみで使う映倫レーティング。それ以外のカテゴリは常に「指定なし」。
export const AGE_RATINGS = ["指定なし", "R15+", "R18+"] as const;

export type AgeRating = (typeof AGE_RATINGS)[number];

// シングル/アルバム: CDのみで使う。レンタル/買取価格の料金表が異なるため区別する。
export const CD_TYPES = ["シングル", "アルバム"] as const;

export type CdType = (typeof CD_TYPES)[number];

// レンタル対象(在庫個体での管理)かどうかは区分で決まる。
export function isRentalDealType(dealType: DealType): boolean {
  return dealType === "レンタル";
}

// 直接の販売価格を持つ(新品/中古/レンタル落ちとして売る)商品かどうか。
export function canSellDealType(dealType: DealType): boolean {
  return dealType === "新品" || dealType === "中古" || dealType === "レンタル落ち";
}

// 買取に対応するのはゲームのみ(新品・中古どちらの商品行でも買取自体は受け付ける)。
export function isBuybackEligible(category: Category): boolean {
  return category === "ゲーム";
}

// レンタル対象カテゴリのうち、引退した個体を中古販売できるカテゴリ。
// DVD・ブルーレイのみレンタル落ちを中古販売する。CD/コミックは販売経路自体がない。
export function canSellRetiredCopies(category: Category): boolean {
  return category === "DVD・ブルーレイ";
}

// 予約受付を行うのはゲームの新品予約のみ。DVD・CD・コミックは
// 発売前/レンタル開始前でも正式な予約受付は行わない。
export function canReserve(category: Category): boolean {
  return category === "ゲーム";
}

// 新品は個体ごとの差がないため個体管理は不要。中古は個体ごとにコンディションが
// 異なるため、レンタル対象と同様に個体(Copy)単位で管理する。
export function hasIndividualUnits(dealType: DealType): boolean {
  return dealType !== "新品";
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
  // レンタル開始日: 発売日と同時にレンタルを始めるとは限らないため別で持つ。
  // レンタル対象(dealType === "レンタル")以外では空文字。
  rentalStartDate: string;
  // 字幕・音声対応言語: DVD・ブルーレイのみで使う。それ以外では空文字。
  subtitleLanguages: string;
  audioLanguages: string;
  // DVD・ブルーレイ以外は常に"指定なし"。
  ageRating: AgeRating;
  // CD以外は null。
  cdType: CdType | null;
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
  arrivedAt: string;
  updatedAt: string;
}

export type InventoryInput = Omit<Inventory, "productId" | "updatedAt">;

// 「在庫」は中古販売個体(個体ごとにコンディションを持つ)、「レンタル落ち」は
// レンタルから引退して中古販売に回った個体(コンディションは一律で記録しない)、
// 「貸出可能」「貸出中」はレンタル個体で使う状態。
export const COPY_STATUSES = [
  "在庫",
  "レンタル落ち",
  "貸出可能",
  "貸出中",
  "点検中",
  "廃棄",
  "返品",
  "販売済み",
  "店舗振替",
] as const;

export type CopyStatus = (typeof COPY_STATUSES)[number];

// 個体が実際に在庫として数えられる状態。
export const ACTIVE_COPY_STATUSES: CopyStatus[] = [
  "在庫",
  "レンタル落ち",
  "貸出可能",
  "貸出中",
  "点検中",
];

// 個体が「引退」した(貸出・在庫カウントの対象外になった)状態。
export const RETIRED_COPY_STATUSES: CopyStatus[] = ["廃棄", "返品", "販売済み", "店舗振替"];

// 個体(コピー): レンタル対象・中古販売対象カテゴリの「1枚1枚」を管理する。
// 在庫数・貸出中数はここから集計するため、Inventory.stock とは別管理。
// condition(コンディション)は中古販売個体でのみ使う。レンタル個体では空文字。
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
  memberId: string;
  rentedAt: string;
  dueDate: string;
  returnedAt: string | null;
}

// 予約の進み具合。引き渡し済み/キャンセルは終端状態。
export const RESERVATION_STATUSES = ["予約中", "引き渡し待ち", "引き渡し済み", "キャンセル"] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

// 予約が完了・キャンセルのどちらでもなく、まだ対応が必要な状態かどうか。
export function isActiveReservationStatus(status: ReservationStatus): boolean {
  return status !== "引き渡し済み" && status !== "キャンセル";
}

// 予約: 予約受付中の商品に対する予約1件。会員でない予約者もいるため
// memberId は null を許容し、その場合は氏名・電話番号で本人確認する。
export interface Reservation {
  id: string;
  productId: string;
  reservationNumber: string;
  memberId: string | null;
  // 電話予約の聞き取りで記録するためカタカナ表記。
  name: string;
  phoneNumber: string;
  reservedAt: string;
  status: ReservationStatus;
}

export type ReservationInput = Omit<Reservation, "id" | "reservedAt" | "status">;

// 出庫理由: 販売そのものはレジ(POS)側の取引のためここでは扱わない。
// ここで管理するのは販売以外の理由で在庫が減る動き(店舗間振替・破損など)。
export const STOCK_OUT_REASONS = ["店舗振替", "破損", "その他"] as const;

export type StockOutReason = (typeof STOCK_OUT_REASONS)[number];

export const STOCK_MOVEMENT_TYPES = ["入荷", "出庫"] as const;

export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number];

// 在庫増減の履歴: 個体管理しない商品(新品)向けに、いつ何個入荷/出庫したかを記録する。
export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  // 出庫の場合のみ使う。入荷では空文字。
  reason: StockOutReason | "";
  occurredAt: string;
}

export type StockMovementInput = Omit<StockMovement, "id">;
