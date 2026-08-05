"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { useInventory } from "@/hooks/useInventory";
import { useCopies } from "@/hooks/useCopies";
import { useRentalLogs } from "@/hooks/useRentalLogs";
import { useReservations } from "@/hooks/useReservations";
import {
  Copy,
  CopyStatus,
  RETIRED_COPY_STATUSES,
  canSellDealType,
  canSellRetiredCopies,
  hasIndividualUnits,
  isBuybackEligible,
  isRentalDealType,
} from "@/lib/types";
import PublishStatusBadge from "./PublishStatusBadge";
import ReleaseStatusPill from "./ReleaseStatusPill";
import DealTypeBadge from "./DealTypeBadge";
import ProductImage from "./ProductImage";

function formatDateTime(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function isOverdue(dueDate: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate).getTime() < Date.now();
}

// レンタル個体を「取り消す」場合の行き先。売れるカテゴリは「レンタル落ち」
// (=中古販売の棚に並んだだけでまだ売れていない状態。コンディションは記録しない)
// を経由し、実際に売れたら改めて「販売済み」に変える。
// CD/コミックは販売経路自体がないため廃棄・返品のみ。
const RETIRE_STATUSES_BY_SELL: Record<"sell" | "noSell", CopyStatus[]> = {
  sell: ["廃棄", "返品", "レンタル落ち"],
  noSell: ["廃棄", "返品"],
};

// 個体がさらに操作可能な(まだ終端でない)状態。
const EDITABLE_FROM_STATUSES: CopyStatus[] = [
  "貸出可能",
  "点検中",
  "在庫",
  "レンタル落ち",
];

export default function ProductDetailView({ productId }: { productId: string }) {
  const router = useRouter();
  const { products, getProduct, addProduct } = useProducts();
  const { getInventory, upsertInventory } = useInventory();
  const { getCopiesForProduct, addCopy, updateCopyStatus, moveCopyToProduct } =
    useCopies();
  const { getOpenLogForCopy } = useRentalLogs();
  const { getReservationsForProduct, addReservation, deleteReservation } =
    useReservations();

  const product = getProduct(productId);
  const inventory = getInventory(productId);

  if (!product) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">商品が見つかりませんでした。</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-fit text-sm text-navy-700 hover:underline"
        >
          戻る
        </button>
      </div>
    );
  }

  const rentalEligible = isRentalDealType(product.dealType);
  const unitTracked = hasIndividualUnits(product.dealType);
  const buybackEligible = isBuybackEligible(product.category);
  const sellEligible = canSellDealType(product.dealType);
  const canSellUsedCopies = canSellRetiredCopies(product.category);
  const showSalePrice = sellEligible || canSellUsedCopies;
  const isDvd = product.category === "DVD・ブルーレイ";
  const isPreorder = product.publishStatus === "予約受付中";
  const reservations = getReservationsForProduct(productId);
  const copies = getCopiesForProduct(productId);
  const activeCount = copies.filter((c) => !RETIRED_COPY_STATUSES.includes(c.status)).length;
  const retireStatuses = canSellUsedCopies
    ? RETIRE_STATUSES_BY_SELL.sell
    : RETIRE_STATUSES_BY_SELL.noSell;

  // 個体ごとに現在の状態から選べる選択肢を出す。一度「在庫」「レンタル落ち」
  // (中古販売中)になった個体は、元がレンタル対象でも中古販売の選択肢に切り替わる。
  function getEditableStatusOptions(status: CopyStatus): CopyStatus[] {
    if (status === "レンタル落ち") {
      return ["レンタル落ち", "廃棄", "返品", "販売済み"];
    }
    if (status === "在庫") {
      return ["在庫", "点検中", "廃棄", "返品", "販売済み"];
    }
    return rentalEligible
      ? ["貸出可能", "点検中", ...retireStatuses]
      : ["在庫", "点検中", "廃棄", "返品", "販売済み"];
  }

  function canEditCopyStatus(status: CopyStatus): boolean {
    return EDITABLE_FROM_STATUSES.includes(status);
  }

  // レンタル落ちにした個体を移す先の中古商品行。既に同じ商品(JANコード)の中古行が
  // あればそれを使い、なければ新しく作る(ゲームの新品/中古行分割と同じ考え方)。
  const findOrCreateUsedCompanion = () => {
    const existing = products.find(
      (p) => p.janCode === product.janCode && p.dealType === "レンタル落ち" && p.id !== product.id
    );
    if (existing) return existing;
    const created = addProduct({
      name: product.name,
      code: `${product.code}B`,
      janCode: product.janCode,
      category: product.category,
      genre: product.genre,
      maker: product.maker,
      platform: product.platform,
      releaseDate: product.releaseDate,
      rentalStartDate: "",
      subtitleLanguages: product.subtitleLanguages,
      audioLanguages: product.audioLanguages,
      ageRating: product.ageRating,
      dealType: "レンタル落ち",
      publishStatus: product.publishStatus,
      releaseStatus: null,
      imageUrl: product.imageUrl,
      notes: "",
    });
    upsertInventory(created.id, {
      store: "本店",
      stock: 0,
      salePrice: inventory?.salePrice ?? 0,
      buybackPrice: 0,
      arrivedAt: new Date().toISOString().slice(0, 10),
    });
    return created;
  };

  function handleCopyStatusChange(copy: Copy, nextStatus: CopyStatus) {
    if (nextStatus === "在庫" && copy.status !== "在庫") {
      const condition =
        window.prompt(
          "コンディションを入力してください(例: 美品, 中古A)",
          copy.condition
        ) ?? copy.condition;
      updateCopyStatus(copy.id, nextStatus, condition.trim());
      return;
    }
    if (nextStatus === "レンタル落ち" && copy.status !== "レンタル落ち") {
      const companion = findOrCreateUsedCompanion();
      moveCopyToProduct(copy.id, companion.id, "レンタル落ち");
      window.alert(
        `${copy.copyCode} を中古商品「${companion.name}(${companion.code})」に移動しました。`
      );
      return;
    }
    updateCopyStatus(copy.id, nextStatus);
  }

  function handleReceiveUnits() {
    const input = window.prompt("入荷数を入力してください", "1");
    if (!input) return;
    const count = Number(input);
    if (!Number.isInteger(count) || count <= 0) {
      window.alert("1以上の整数を入力してください");
      return;
    }
    let condition = "";
    if (!rentalEligible) {
      condition = window.prompt("コンディションを入力してください(例: 美品, 中古A)", "") ?? "";
    }
    const startIndex = copies.length + 1;
    for (let i = 0; i < count; i++) {
      const seq = startIndex + i;
      addCopy({
        productId,
        copyCode: `${product?.code}-${String(seq).padStart(2, "0")}`,
        status: rentalEligible ? "貸出可能" : "在庫",
        condition,
      });
    }
  }

  function handleAddReservation() {
    const reservationNumber = window.prompt("予約番号を入力してください");
    if (!reservationNumber) return;
    const name = window.prompt("氏名をカタカナで入力してください(電話予約のため)");
    if (!name) return;
    const phoneNumber = window.prompt("電話番号を入力してください") ?? "";
    const memberId = window.prompt("会員IDを入力してください(会員でない場合は空欄)") ?? "";
    addReservation({
      productId,
      reservationNumber: reservationNumber.trim(),
      memberId: memberId.trim() === "" ? null : memberId.trim(),
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
    });
  }

  function handleCancelReservation(id: string) {
    const confirmed = window.confirm("この予約を取り消します。よろしいですか？");
    if (!confirmed) return;
    deleteReservation(id);
  }

  function handleReceiveStock() {
    if (!inventory) return;
    const input = window.prompt("入荷数を入力してください", "1");
    if (!input) return;
    const count = Number(input);
    if (!Number.isInteger(count) || count <= 0) {
      window.alert("1以上の整数を入力してください");
      return;
    }
    upsertInventory(productId, {
      store: inventory.store,
      stock: inventory.stock + count,
      salePrice: inventory.salePrice,
      buybackPrice: inventory.buybackPrice,
      arrivedAt: new Date().toISOString().slice(0, 10),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="w-fit text-sm font-medium text-navy-700 hover:underline"
      >
        ← 戻る
      </button>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <ProductImage
              imageUrl={product.imageUrl}
              category={product.category}
              alt={product.name}
              className="h-24 w-24 shrink-0 rounded-lg text-4xl"
            />
            <div>
              <div className="flex items-center gap-2">
                <PublishStatusBadge status={product.publishStatus} dealType={product.dealType} />
                <h1 className="text-xl font-bold text-navy-900">{product.name}</h1>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {product.code} ・ {product.category}
                {product.genre && ` ・ ${product.genre}`}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <DealTypeBadge dealType={product.dealType} />
                {rentalEligible && <ReleaseStatusPill status={product.releaseStatus} />}
                {product.ageRating !== "指定なし" && (
                  <span className="inline-flex items-center rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white">
                    {product.ageRating}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Link
            href={`/products/${product.id}/edit`}
            className="rounded-full bg-gold-400 px-5 py-2.5 text-sm font-bold text-navy-900 shadow-md transition hover:bg-gold-500"
          >
            編集
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="メーカー・発売元" value={product.maker || "-"} />
          <Stat label="対応機種・メディア" value={product.platform || "-"} />
          <Stat label="発売日" value={formatDateOnly(product.releaseDate)} />
          {rentalEligible && (
            <Stat label="レンタル開始日" value={formatDateOnly(product.rentalStartDate)} />
          )}
          {isDvd && (
            <>
              <Stat label="字幕対応言語" value={product.subtitleLanguages || "-"} />
              <Stat label="音声対応言語" value={product.audioLanguages || "-"} />
              <Stat label="年齢指定" value={product.ageRating} />
            </>
          )}
        </div>

        <dl className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-6 text-sm">
          <div>
            <dt className="font-medium text-gray-600">備考</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-800">
              {product.notes || "(なし)"}
            </dd>
          </div>
          <div className="flex gap-8">
            <div>
              <dt className="font-medium text-gray-600">登録日</dt>
              <dd className="mt-1 text-gray-800">{formatDateTime(product.createdAt)}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">更新日</dt>
              <dd className="mt-1 text-gray-800">{formatDateTime(product.updatedAt)}</dd>
            </div>
          </div>
        </dl>

        <div className="mt-6 border-t border-gray-100 pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy-900">在庫情報</h2>
            {!unitTracked && (
              <button
                type="button"
                onClick={handleReceiveStock}
                className="rounded-full border border-navy-300 px-3 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-50"
              >
                + 入荷登録
              </button>
            )}
          </div>
          {inventory ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat
                label="在庫数"
                value={String(unitTracked ? activeCount : inventory.stock)}
              />
              <Stat
                label={unitTracked ? "最終入荷日" : "入荷日"}
                value={formatDateOnly(inventory.arrivedAt)}
              />
              {showSalePrice && (
                <Stat
                  label="販売価格"
                  value={
                    inventory.salePrice > 0
                      ? `¥${inventory.salePrice.toLocaleString()}`
                      : "-"
                  }
                />
              )}
              {buybackEligible && (
                <Stat
                  label="買取価格"
                  value={
                    inventory.buybackPrice > 0
                      ? `¥${inventory.buybackPrice.toLocaleString()}`
                      : "-"
                  }
                />
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">在庫情報が未登録です。</p>
          )}
        </div>

        {isPreorder && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-navy-900">
                予約状況({reservations.length}件)
              </h2>
              <button
                type="button"
                onClick={handleAddReservation}
                className="rounded-full border border-navy-300 px-3 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-50"
              >
                + 予約を登録
              </button>
            </div>
            {reservations.length === 0 ? (
              <p className="text-sm text-gray-400">予約はまだありません。</p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-gray-200">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="bg-navy-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">予約番号</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">会員ID</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">氏名</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">電話番号</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reservations.map((reservation) => (
                      <tr key={reservation.id}>
                        <td className="px-3 py-2 font-medium text-navy-700">
                          {reservation.reservationNumber}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {reservation.memberId ? (
                            <Link
                              href={`/members/${encodeURIComponent(reservation.memberId)}`}
                              className="text-navy-700 hover:underline"
                            >
                              {reservation.memberId}
                            </Link>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-600">{reservation.name}</td>
                        <td className="px-3 py-2 text-gray-600">
                          {reservation.phoneNumber || "-"}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => handleCancelReservation(reservation.id)}
                            className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-500 hover:bg-rose-50"
                          >
                            取り消す
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {unitTracked && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-navy-900">
                在庫個体(1点ごとの管理)
              </h2>
              <button
                type="button"
                onClick={handleReceiveUnits}
                className="rounded-full border border-navy-300 px-3 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-50"
              >
                + 入荷登録
              </button>
            </div>
            {rentalEligible && (
              <p className="mb-3 text-xs text-gray-400">
                貸出・返却は接客時にレジ(POS)側で行う取引のため、ここでは行いません。ここでは個体の入荷登録と、廃棄・返品・レンタル落ち販売による取り消しのみ行います。
              </p>
            )}
            {copies.length === 0 ? (
              <p className="text-sm text-gray-400">在庫個体が未登録です。</p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-gray-200">
                <table className="w-full min-w-[480px] text-sm">
                  <thead className="bg-navy-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">個体番号</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">状態</th>
                      {rentalEligible ? (
                        <>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">貸出中の会員ID</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">返却予定日</th>
                        </>
                      ) : (
                        <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">コンディション</th>
                      )}
                      <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">入荷日</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {copies.map((copy) => {
                      const openLog = getOpenLogForCopy(copy.id);
                      return (
                        <tr key={copy.id}>
                          <td className="px-3 py-2 font-medium text-navy-700">
                            <Link
                              href={`/copies/${copy.id}`}
                              className="text-navy-700 hover:underline"
                            >
                              {copy.copyCode}
                            </Link>
                          </td>
                          <td className="px-3 py-2">
                            {canEditCopyStatus(copy.status) ? (
                              <select
                                value={copy.status}
                                onChange={(e) =>
                                  handleCopyStatusChange(copy, e.target.value as CopyStatus)
                                }
                                className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-navy-600 focus:outline-none"
                              >
                                {getEditableStatusOptions(copy.status).map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <CopyStatusBadge status={copy.status} />
                            )}
                          </td>
                          {rentalEligible ? (
                            <>
                              <td className="px-3 py-2 text-gray-600">
                                {openLog ? (
                                  <Link
                                    href={`/members/${encodeURIComponent(openLog.memberId)}`}
                                    className="text-navy-700 hover:underline"
                                  >
                                    {openLog.memberId}
                                  </Link>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="px-3 py-2">
                                {openLog ? (
                                  isOverdue(openLog.dueDate) ? (
                                    <span className="font-semibold text-rose-600">
                                      {formatDateOnly(openLog.dueDate)}(延滞)
                                    </span>
                                  ) : (
                                    <span className="text-gray-600">
                                      {formatDateOnly(openLog.dueDate)}
                                    </span>
                                  )
                                ) : (
                                  <span className="text-gray-600">-</span>
                                )}
                              </td>
                            </>
                          ) : (
                            <td className="px-3 py-2 text-gray-600">
                              {copy.condition || "-"}
                            </td>
                          )}
                          <td className="px-3 py-2 text-gray-600">
                            {formatDateOnly(copy.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-navy-50 p-3">
      <p className="text-xs text-navy-600">{label}</p>
      <p className="mt-1 text-sm font-semibold text-navy-900">{value}</p>
    </div>
  );
}

function CopyStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    在庫: "bg-emerald-100 text-emerald-700",
    レンタル落ち: "bg-amber-100 text-amber-700",
    貸出可能: "bg-emerald-100 text-emerald-700",
    貸出中: "bg-gold-400 text-navy-900",
    点検中: "bg-sky-100 text-sky-700",
    廃棄: "bg-gray-100 text-gray-500",
    返品: "bg-gray-100 text-gray-500",
    販売済み: "bg-purple-100 text-purple-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        styles[status] ?? "bg-gray-100 text-gray-500"
      }`}
    >
      {status}
    </span>
  );
}
