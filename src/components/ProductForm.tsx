"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import { useInventory } from "@/hooks/useInventory";
import { useCopies } from "@/hooks/useCopies";
import { fileToResizedDataUrl } from "@/lib/resizeImage";
import {
  CATEGORIES,
  CONDITION_TYPES,
  PUBLISH_STATUSES,
  RELEASE_STATUSES,
  Category,
  ConditionType,
  PublishStatus,
  ReleaseStatus,
  isRentalCategory,
  isBuybackCategory,
  canSellCategory,
} from "@/lib/types";
import ProductImage from "./ProductImage";

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
}

interface FormState {
  name: string;
  code: string;
  janCode: string;
  category: Category;
  genre: string;
  maker: string;
  platform: string;
  releaseDate: string;
  conditionType: ConditionType;
  publishStatus: PublishStatus;
  releaseStatus: ReleaseStatus | "";
  imageUrl: string;
  description: string;
  notes: string;
  stock: string;
  itemCondition: string;
  arrivedAt: string;
  salePrice: string;
  buybackPrice: string;
  rentalPriceNew: string;
  rentalPriceSemiNew: string;
  rentalPriceOld: string;
  initialStock: string;
}

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-navy-600 focus:outline-none";

const emptyForm: FormState = {
  name: "",
  code: "",
  janCode: "",
  category: CATEGORIES[0],
  genre: "",
  maker: "",
  platform: "",
  releaseDate: new Date().toISOString().slice(0, 10),
  conditionType: CONDITION_TYPES[0],
  publishStatus: PUBLISH_STATUSES[0],
  releaseStatus: "",
  imageUrl: "",
  description: "",
  notes: "",
  stock: "0",
  itemCondition: "",
  arrivedAt: "",
  salePrice: "0",
  buybackPrice: "0",
  rentalPriceNew: "",
  rentalPriceSemiNew: "",
  rentalPriceOld: "",
  initialStock: "0",
};

export default function ProductForm({ mode, productId }: ProductFormProps) {
  const router = useRouter();
  const { products, getProduct, addProduct, updateProduct } = useProducts();
  const { getInventory, upsertInventory } = useInventory();
  const { addCopy } = useCopies();

  const existingProduct =
    mode === "edit" && productId ? getProduct(productId) : undefined;
  const existingInventory =
    mode === "edit" && productId ? getInventory(productId) : undefined;

  const [form, setForm] = useState<FormState>(() =>
    existingProduct
      ? {
          name: existingProduct.name,
          code: existingProduct.code,
          janCode: existingProduct.janCode,
          category: existingProduct.category,
          genre: existingProduct.genre,
          maker: existingProduct.maker,
          platform: existingProduct.platform,
          releaseDate: existingProduct.releaseDate,
          conditionType: existingProduct.conditionType,
          publishStatus: existingProduct.publishStatus,
          releaseStatus: existingProduct.releaseStatus ?? "",
          imageUrl: existingProduct.imageUrl,
          description: existingProduct.description,
          notes: existingProduct.notes,
          stock: String(existingInventory?.stock ?? 0),
          itemCondition: existingInventory?.itemCondition ?? "",
          arrivedAt: existingInventory?.arrivedAt ?? "",
          salePrice: String(existingInventory?.salePrice ?? 0),
          buybackPrice: String(existingInventory?.buybackPrice ?? 0),
          rentalPriceNew:
            existingInventory?.rentalPriceNew != null
              ? String(existingInventory.rentalPriceNew)
              : "",
          rentalPriceSemiNew:
            existingInventory?.rentalPriceSemiNew != null
              ? String(existingInventory.rentalPriceSemiNew)
              : "",
          rentalPriceOld:
            existingInventory?.rentalPriceOld != null
              ? String(existingInventory.rentalPriceOld)
              : "",
          initialStock: "0",
        }
      : emptyForm
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [imageProcessing, setImageProcessing] = useState(false);
  const [imageError, setImageError] = useState("");

  if (mode === "edit" && !existingProduct) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">商品が見つかりませんでした。</p>
        <Link href="/" className="text-sm text-navy-700 hover:underline">
          一覧に戻る
        </Link>
      </div>
    );
  }

  const rentalEligible = isRentalCategory(form.category);
  const buybackEligible = isBuybackCategory(form.category);
  const sellEligible = canSellCategory(form.category);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImageError("");
    setImageProcessing(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      update("imageUrl", dataUrl);
    } catch {
      setImageError("画像の読み込みに失敗しました");
    } finally {
      setImageProcessing(false);
    }
  }

  function validate(): Partial<Record<keyof FormState, string>> {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim() === "") nextErrors.name = "商品名を入力してください";
    if (form.code.trim() === "") {
      nextErrors.code = "商品コードを入力してください";
    } else {
      const normalized = form.code.trim().toLowerCase();
      const isDuplicate = products.some(
        (p) =>
          p.code.trim().toLowerCase() === normalized &&
          p.id !== existingProduct?.id
      );
      if (isDuplicate) nextErrors.code = "この商品コードは既に使われています";
    }

    if (!rentalEligible) {
      const stock = Number(form.stock);
      if (
        form.stock.trim() === "" ||
        Number.isNaN(stock) ||
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        nextErrors.stock = "0以上の整数を入力してください";
      }
    }
    if (sellEligible) {
      const salePrice = Number(form.salePrice);
      if (form.salePrice.trim() === "" || Number.isNaN(salePrice) || salePrice < 0) {
        nextErrors.salePrice = "0以上の金額を入力してください";
      }
    }
    if (buybackEligible) {
      const buybackPrice = Number(form.buybackPrice);
      if (
        form.buybackPrice.trim() === "" ||
        Number.isNaN(buybackPrice) ||
        buybackPrice < 0
      ) {
        nextErrors.buybackPrice = "0以上の金額を入力してください";
      }
    }
    if (mode === "create" && rentalEligible) {
      const initialStock = Number(form.initialStock);
      if (
        form.initialStock.trim() === "" ||
        Number.isNaN(initialStock) ||
        !Number.isInteger(initialStock) ||
        initialStock < 0
      ) {
        nextErrors.initialStock = "0以上の整数を入力してください";
      }
    }

    return nextErrors;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const productInput = {
      name: form.name.trim(),
      code: form.code.trim(),
      janCode: form.janCode.trim(),
      category: form.category,
      genre: form.genre.trim(),
      maker: form.maker.trim(),
      platform: form.platform.trim(),
      releaseDate: form.releaseDate,
      conditionType: sellEligible ? form.conditionType : "中古のみ" as ConditionType,
      publishStatus: form.publishStatus,
      releaseStatus: rentalEligible
        ? (form.releaseStatus === "" ? null : form.releaseStatus)
        : null,
      imageUrl: form.imageUrl,
      description: form.description.trim(),
      notes: form.notes.trim(),
    };

    const inventoryInput = {
      store: "本店",
      // レンタル対象は在庫個体(Copy)から集計するため、ここでの stock は使わない
      stock: rentalEligible ? 0 : Number(form.stock),
      rentalPriceNew:
        rentalEligible && form.rentalPriceNew.trim() !== ""
          ? Number(form.rentalPriceNew)
          : null,
      rentalPriceSemiNew:
        rentalEligible && form.rentalPriceSemiNew.trim() !== ""
          ? Number(form.rentalPriceSemiNew)
          : null,
      rentalPriceOld:
        rentalEligible && form.rentalPriceOld.trim() !== ""
          ? Number(form.rentalPriceOld)
          : null,
      salePrice: sellEligible ? Number(form.salePrice) : 0,
      buybackPrice: buybackEligible ? Number(form.buybackPrice) : 0,
      itemCondition: rentalEligible ? "" : form.itemCondition.trim(),
      arrivedAt: form.arrivedAt,
    };

    if (mode === "create") {
      const created = addProduct(productInput);
      upsertInventory(created.id, inventoryInput);
      if (rentalEligible) {
        const count = Number(form.initialStock);
        for (let i = 1; i <= count; i++) {
          addCopy({
            productId: created.id,
            copyCode: `${created.code}-${String(i).padStart(2, "0")}`,
            status: "貸出可能",
            condition: "良好",
          });
        }
      }
      router.push(`/products/${created.id}`);
    } else if (existingProduct) {
      updateProduct(existingProduct.id, productInput);
      upsertInventory(existingProduct.id, inventoryInput);
      router.push(`/products/${existingProduct.id}`);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-navy-900">
        {mode === "create" ? "商品の新規登録" : "商品の編集"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 rounded-lg border border-gray-200 bg-white p-6"
      >
        <FormSection title="基本情報" description="商品を識別するための情報です">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="商品名" error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="商品コード" error={errors.code}>
              <input
                type="text"
                value={form.code}
                onChange={(e) => update("code", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="JANコード(バーコード)">
              <input
                type="text"
                value={form.janCode}
                onChange={(e) => update("janCode", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="カテゴリ">
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value as Category)}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="ジャンル" hint="例: RPG, 邦楽, 邦画など">
              <input
                type="text"
                value={form.genre}
                onChange={(e) => update("genre", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="商品詳細" description="メーカーや対応機種などの詳細情報です">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="メーカー・発売元">
              <input
                type="text"
                value={form.maker}
                onChange={(e) => update("maker", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="対応機種・メディア" hint="例: Switch, PS5, Blu-ray, DVD, CD">
              <input
                type="text"
                value={form.platform}
                onChange={(e) => update("platform", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="発売日">
              <input
                type="date"
                value={form.releaseDate}
                onChange={(e) => update("releaseDate", e.target.value)}
                className={inputClass}
              />
            </Field>
            {sellEligible && (
              <Field
                label="新品/中古取扱区分"
                hint={
                  rentalEligible
                    ? "レンタル対象はレンタル落ちの中古販売のみのため「中古のみ」固定です"
                    : undefined
                }
              >
                {rentalEligible ? (
                  <input type="text" value="中古のみ" disabled className={inputClass} />
                ) : (
                  <select
                    value={form.conditionType}
                    onChange={(e) =>
                      update("conditionType", e.target.value as ConditionType)
                    }
                    className={inputClass}
                  >
                    {CONDITION_TYPES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            )}
            <Field label="公開状態">
              <select
                value={form.publishStatus}
                onChange={(e) =>
                  update("publishStatus", e.target.value as PublishStatus)
                }
                className={inputClass}
              >
                {PUBLISH_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            {rentalEligible && (
              <Field
                label="新作/準新作/旧作"
                hint="人気度に応じてスタッフが手動で切り替えます(自動更新ではありません)"
              >
                <select
                  value={form.releaseStatus}
                  onChange={(e) =>
                    update("releaseStatus", e.target.value as ReleaseStatus | "")
                  }
                  className={inputClass}
                >
                  <option value="">未設定</option>
                  {RELEASE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </div>
        </FormSection>

        <FormSection
          title="在庫・価格情報"
          description="店舗ごとの在庫・価格です(商品マスタとは別テーブルで管理)"
        >
          {rentalEligible && mode === "edit" && (
            <p className="mb-4 text-xs text-gray-500">
              在庫数・商品状態は1枚ごとの「在庫個体」から集計します。個体の入荷・取り消しは商品詳細ページで行ってください。
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {!rentalEligible && (
              <>
                <Field label="在庫数" error={errors.stock}>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => update("stock", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="商品状態" hint="例: 新品, 中古A, ジャンクなど">
                  <input
                    type="text"
                    value={form.itemCondition}
                    onChange={(e) => update("itemCondition", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </>
            )}
            {rentalEligible && mode === "create" && (
              <Field
                label="初期入荷数"
                error={errors.initialStock}
                hint="登録と同時にこの数だけ在庫個体を作成します"
              >
                <input
                  type="number"
                  value={form.initialStock}
                  onChange={(e) => update("initialStock", e.target.value)}
                  className={inputClass}
                />
              </Field>
            )}
            <Field label="入荷日">
              <input
                type="date"
                value={form.arrivedAt}
                onChange={(e) => update("arrivedAt", e.target.value)}
                className={inputClass}
              />
            </Field>
            {sellEligible && (
              <Field label="販売価格(円)" error={errors.salePrice}>
                <input
                  type="number"
                  value={form.salePrice}
                  onChange={(e) => update("salePrice", e.target.value)}
                  className={inputClass}
                />
              </Field>
            )}
            {buybackEligible && (
              <Field label="買取価格(円)" error={errors.buybackPrice}>
                <input
                  type="number"
                  value={form.buybackPrice}
                  onChange={(e) => update("buybackPrice", e.target.value)}
                  className={inputClass}
                />
              </Field>
            )}
          </div>
        </FormSection>

        {rentalEligible && (
          <FormSection
            title="レンタル料金"
            description="ステータス(新作/準新作/旧作)ごとの1泊料金です"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="新作料金(1泊/円)">
                <input
                  type="number"
                  value={form.rentalPriceNew}
                  onChange={(e) => update("rentalPriceNew", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="準新作料金(1泊/円)">
                <input
                  type="number"
                  value={form.rentalPriceSemiNew}
                  onChange={(e) => update("rentalPriceSemiNew", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="旧作料金(1泊/円)">
                <input
                  type="number"
                  value={form.rentalPriceOld}
                  onChange={(e) => update("rentalPriceOld", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </FormSection>
        )}

        <FormSection title="表示情報" description="一覧・詳細で見せる情報です">
          <div className="flex items-center gap-4">
            <ProductImage
              imageUrl={form.imageUrl}
              category={form.category}
              alt="商品画像プレビュー"
              className="h-24 w-24 shrink-0 rounded-lg text-4xl"
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-navy-700">商品画像</span>
              <label className="w-fit cursor-pointer rounded-full border border-navy-300 px-4 py-1.5 text-sm text-navy-700 hover:bg-navy-50">
                画像を選択
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imageProcessing && (
                <span className="text-xs text-gray-500">変換中...</span>
              )}
              {imageError && (
                <span className="text-xs text-red-600">{imageError}</span>
              )}
              {form.imageUrl && !imageProcessing && (
                <button
                  type="button"
                  onClick={() => update("imageUrl", "")}
                  className="w-fit text-xs text-rose-500 hover:underline"
                >
                  画像を削除
                </button>
              )}
            </div>
          </div>
          <div className="mt-4">
            <Field label="商品説明">
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
                className={inputClass}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="その他">
          <Field label="備考">
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
              className={inputClass}
            />
          </Field>
        </FormSection>

        <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
          <button
            type="submit"
            className="rounded-full bg-gold-400 px-5 py-2.5 text-sm font-bold text-navy-900 shadow-md transition hover:bg-gold-500"
          >
            {mode === "create" ? "登録する" : "保存する"}
          </button>
          <Link
            href={
              mode === "edit" && existingProduct
                ? `/products/${existingProduct.id}`
                : "/"
            }
            className="text-sm text-gray-500 hover:underline"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-baseline gap-2 border-l-4 border-gold-400 pl-3">
        <h2 className="text-sm font-bold text-navy-900">{title}</h2>
        {description && <span className="text-xs text-gray-400">{description}</span>}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-gray-700">
      <span className="font-medium">{label}</span>
      {children}
      {hint && !error && <span className="text-xs text-gray-400">{hint}</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
