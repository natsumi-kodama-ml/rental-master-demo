"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { useInventory } from "@/hooks/useInventory";
import { useCopies } from "@/hooks/useCopies";
import { useRentalLogs } from "@/hooks/useRentalLogs";
import { isBuybackCategory, isRentalCategory } from "@/lib/types";
import PublishStatusBadge from "./PublishStatusBadge";
import ReleaseStatusPill from "./ReleaseStatusPill";
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

export default function ProductDetailView({ productId }: { productId: string }) {
  const router = useRouter();
  const { getProduct, deleteProduct } = useProducts();
  const { getInventory, deleteInventory } = useInventory();
  const {
    getCopiesForProduct,
    addCopy,
    updateCopyStatus,
    deleteCopiesForProduct,
  } = useCopies();
  const {
    getLogsForProduct,
    getOpenLogForCopy,
    checkoutCopy,
    returnCopy,
    deleteLogsForProduct,
  } = useRentalLogs();

  const product = getProduct(productId);
  const inventory = getInventory(productId);

  if (!product) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">商品が見つかりませんでした。</p>
        <Link href="/" className="text-sm text-navy-700 hover:underline">
          一覧に戻る
        </Link>
      </div>
    );
  }

  const rentalEligible = isRentalCategory(product.category);
  const buybackEligible = isBuybackCategory(product.category);
  const copies = getCopiesForProduct(productId);
  const logs = getLogsForProduct(productId);
  const closedLogs = logs
    .filter((l) => l.returnedAt !== null)
    .sort((a, b) => (a.rentedAt < b.rentedAt ? 1 : -1));
  const inStockCount = copies.filter((c) => c.status === "在庫中").length;

  function handleDelete() {
    if (!product) return;
    const confirmed = window.confirm(
      `「${product.name}」を削除します。この操作は取り消せません。よろしいですか？`
    );
    if (!confirmed) return;
    deleteCopiesForProduct(product.id);
    deleteLogsForProduct(product.id);
    deleteInventory(product.id);
    deleteProduct(product.id);
    router.push("/");
  }

  function handleAddCopy() {
    const nextNumber = copies.length + 1;
    const copyCode = `${product?.code}-${String(nextNumber).padStart(2, "0")}`;
    addCopy({ productId, copyCode, status: "在庫中", condition: "良好" });
  }

  function handleCheckout(copyId: string) {
    const borrowerName = window.prompt("借りる人の名前を入力してください");
    if (!borrowerName) return;
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 7);
    const dueDate = window.prompt(
      "返却予定日を入力してください (YYYY-MM-DD)",
      defaultDue.toISOString().slice(0, 10)
    );
    if (!dueDate) return;
    checkoutCopy(copyId, productId, borrowerName, dueDate);
    updateCopyStatus(copyId, "貸出中");
  }

  function handleReturn(copyId: string) {
    returnCopy(copyId);
    updateCopyStatus(copyId, "在庫中");
  }

  return (
    <div className="flex flex-col gap-4">
      <Link href="/" className="text-sm font-medium text-navy-700 hover:underline">
        ← 一覧に戻る
      </Link>

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
              <h1 className="text-xl font-bold text-navy-900">{product.name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {product.code} ・ {product.category}
                {product.genre && ` ・ ${product.genre}`}
              </p>
              {rentalEligible && (
                <div className="mt-2 flex items-center gap-2">
                  <ReleaseStatusPill status={inventory?.releaseStatus ?? null} />
                  <span className="text-xs text-gray-400">(手動設定)</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PublishStatusBadge status={product.publishStatus} />
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-500 transition hover:bg-rose-50"
            >
              削除
            </button>
            <Link
              href={`/products/${product.id}/edit`}
              className="rounded-full bg-gold-400 px-5 py-2.5 text-sm font-bold text-navy-900 shadow-md transition hover:bg-gold-500"
            >
              編集
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="メーカー・発売元" value={product.maker || "-"} />
          <Stat label="対応機種・メディア" value={product.platform || "-"} />
          <Stat label="発売日" value={formatDateOnly(product.releaseDate)} />
          <Stat label="新品/中古区分" value={product.conditionType} />
        </div>

        <div className="mt-6 border-t border-gray-100 pt-6">
          <h2 className="mb-3 text-sm font-bold text-navy-900">
            在庫情報(本店・別テーブル管理)
          </h2>
          {inventory ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {!rentalEligible && (
                <>
                  <Stat label="在庫数" value={String(inventory.stock)} />
                  <Stat label="商品状態" value={inventory.itemCondition || "-"} />
                </>
              )}
              {rentalEligible && (
                <Stat
                  label="在庫数(在庫中/総数)"
                  value={`${inStockCount} / ${copies.length}`}
                />
              )}
              <Stat label="入荷日" value={formatDateOnly(inventory.arrivedAt)} />
              <Stat label="販売価格" value={`¥${inventory.salePrice.toLocaleString()}`} />
              {buybackEligible && (
                <Stat
                  label="買取価格"
                  value={`¥${inventory.buybackPrice.toLocaleString()}`}
                />
              )}
              {rentalEligible && (
                <>
                  <Stat
                    label="新作料金"
                    value={
                      inventory.rentalPriceNew != null
                        ? `¥${inventory.rentalPriceNew.toLocaleString()}`
                        : "-"
                    }
                  />
                  <Stat
                    label="準新作料金"
                    value={
                      inventory.rentalPriceSemiNew != null
                        ? `¥${inventory.rentalPriceSemiNew.toLocaleString()}`
                        : "-"
                    }
                  />
                  <Stat
                    label="旧作料金"
                    value={
                      inventory.rentalPriceOld != null
                        ? `¥${inventory.rentalPriceOld.toLocaleString()}`
                        : "-"
                    }
                  />
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">在庫情報が未登録です。</p>
          )}
        </div>

        {rentalEligible && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-navy-900">
                在庫個体(1枚ごとの管理)
              </h2>
              <button
                type="button"
                onClick={handleAddCopy}
                className="rounded-full border border-navy-300 px-3 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-50"
              >
                + 個体を追加
              </button>
            </div>
            {copies.length === 0 ? (
              <p className="text-sm text-gray-400">在庫個体が未登録です。</p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-gray-200">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="bg-navy-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">個体番号</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">状態</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">コンディション</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">貸出中の相手/返却予定日</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {copies.map((copy) => {
                      const openLog = getOpenLogForCopy(copy.id);
                      return (
                        <tr key={copy.id}>
                          <td className="px-3 py-2 font-medium text-navy-700">
                            {copy.copyCode}
                          </td>
                          <td className="px-3 py-2">
                            <CopyStatusBadge status={copy.status} />
                          </td>
                          <td className="px-3 py-2 text-gray-600">{copy.condition}</td>
                          <td className="px-3 py-2 text-gray-600">
                            {openLog
                              ? `${openLog.borrowerName} / ${formatDateOnly(openLog.dueDate)}まで`
                              : "-"}
                          </td>
                          <td className="px-3 py-2">
                            {copy.status === "在庫中" && (
                              <button
                                type="button"
                                onClick={() => handleCheckout(copy.id)}
                                className="rounded-full bg-gold-400 px-3 py-1 text-xs font-bold text-navy-900 hover:bg-gold-500"
                              >
                                貸し出す
                              </button>
                            )}
                            {copy.status === "貸出中" && (
                              <button
                                type="button"
                                onClick={() => handleReturn(copy.id)}
                                className="rounded-full border border-navy-300 px-3 py-1 text-xs font-semibold text-navy-700 hover:bg-navy-50"
                              >
                                返却する
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <h3 className="mb-2 mt-6 text-xs font-bold text-gray-500">
              貸出履歴(返却済み)
            </h3>
            {closedLogs.length === 0 ? (
              <p className="text-xs text-gray-400">貸出履歴はまだありません。</p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-gray-200">
                <table className="w-full min-w-[480px] text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">個体番号</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">借主</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">貸出日</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">返却日</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {closedLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-3 py-2 text-gray-700">
                          {copies.find((c) => c.id === log.copyId)?.copyCode ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-gray-700">{log.borrowerName}</td>
                        <td className="px-3 py-2 text-gray-600">
                          {formatDateOnly(log.rentedAt)}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {formatDateOnly(log.returnedAt ?? "")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <dl className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-6 text-sm">
          <div>
            <dt className="font-medium text-gray-600">商品説明</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-800">
              {product.description || "(未入力)"}
            </dd>
          </div>
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
    在庫中: "bg-emerald-100 text-emerald-700",
    貸出中: "bg-gold-400 text-navy-900",
    修理中: "bg-sky-100 text-sky-700",
    廃棄: "bg-gray-100 text-gray-500",
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
