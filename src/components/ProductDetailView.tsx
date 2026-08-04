"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { useInventory } from "@/hooks/useInventory";
import { isRentalCategory } from "@/lib/types";
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

  function handleDelete() {
    if (!product) return;
    const confirmed = window.confirm(
      `「${product.name}」を削除します。この操作は取り消せません。よろしいですか？`
    );
    if (!confirmed) return;
    deleteInventory(product.id);
    deleteProduct(product.id);
    router.push("/");
  }

  const rentalEligible = isRentalCategory(product.category);

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
              <Stat label="在庫数" value={String(inventory.stock)} />
              <Stat label="商品状態" value={inventory.itemCondition || "-"} />
              <Stat label="入荷日" value={formatDateOnly(inventory.arrivedAt)} />
              <Stat label="販売価格" value={`¥${inventory.salePrice.toLocaleString()}`} />
              <Stat label="買取価格" value={`¥${inventory.buybackPrice.toLocaleString()}`} />
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
