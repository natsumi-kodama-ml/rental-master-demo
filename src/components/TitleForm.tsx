"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTitles } from "@/hooks/useTitles";
import {
  GENRES,
  MEDIA_TYPES,
  RELEASE_STATUSES,
  Genre,
  MediaType,
  ReleaseStatus,
} from "@/lib/types";
import { fileToResizedDataUrl } from "@/lib/resizeImage";
import TitleImage from "./TitleImage";

interface TitleFormProps {
  mode: "create" | "edit";
  titleId?: string;
}

interface FormState {
  name: string;
  genre: Genre;
  mediaType: MediaType;
  releaseDate: string;
  statusOverride: ReleaseStatus | "";
  rentalPrice: string;
  totalCopies: string;
  rentedCopies: string;
  available: boolean;
  imageUrl: string;
  synopsis: string;
  cast: string;
  notes: string;
}

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-navy-600 focus:outline-none";

const emptyForm: FormState = {
  name: "",
  genre: GENRES[0],
  mediaType: MEDIA_TYPES[0],
  releaseDate: new Date().toISOString().slice(0, 10),
  statusOverride: "",
  rentalPrice: "",
  totalCopies: "",
  rentedCopies: "0",
  available: true,
  imageUrl: "",
  synopsis: "",
  cast: "",
  notes: "",
};

export default function TitleForm({ mode, titleId }: TitleFormProps) {
  const router = useRouter();
  const { getTitle, addTitle, updateTitle } = useTitles();

  const existingTitle = mode === "edit" && titleId ? getTitle(titleId) : undefined;

  const [form, setForm] = useState<FormState>(() =>
    existingTitle
      ? {
          name: existingTitle.name,
          genre: existingTitle.genre,
          mediaType: existingTitle.mediaType,
          releaseDate: existingTitle.releaseDate,
          statusOverride: existingTitle.statusOverride ?? "",
          rentalPrice: String(existingTitle.rentalPrice),
          totalCopies: String(existingTitle.totalCopies),
          rentedCopies: String(existingTitle.rentedCopies),
          available: existingTitle.available,
          imageUrl: existingTitle.imageUrl,
          synopsis: existingTitle.synopsis,
          cast: existingTitle.cast,
          notes: existingTitle.notes,
        }
      : emptyForm
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [imageProcessing, setImageProcessing] = useState(false);
  const [imageError, setImageError] = useState("");

  if (mode === "edit" && !existingTitle) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">タイトルが見つかりませんでした。</p>
        <Link href="/" className="text-sm text-navy-700 hover:underline">
          一覧に戻る
        </Link>
      </div>
    );
  }

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
    if (form.name.trim() === "") nextErrors.name = "タイトル名を入力してください";
    if (form.releaseDate.trim() === "")
      nextErrors.releaseDate = "発売日を入力してください";

    const price = Number(form.rentalPrice);
    if (form.rentalPrice.trim() === "" || Number.isNaN(price) || price < 0) {
      nextErrors.rentalPrice = "0以上のレンタル料金を入力してください";
    }

    const total = Number(form.totalCopies);
    if (
      form.totalCopies.trim() === "" ||
      Number.isNaN(total) ||
      !Number.isInteger(total) ||
      total < 0
    ) {
      nextErrors.totalCopies = "0以上の整数を入力してください";
    }

    const rented = Number(form.rentedCopies);
    if (
      form.rentedCopies.trim() === "" ||
      Number.isNaN(rented) ||
      !Number.isInteger(rented) ||
      rented < 0
    ) {
      nextErrors.rentedCopies = "0以上の整数を入力してください";
    } else if (!Number.isNaN(total) && rented > total) {
      nextErrors.rentedCopies = "総コピー数を超えることはできません";
    }

    return nextErrors;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input = {
      name: form.name.trim(),
      genre: form.genre,
      mediaType: form.mediaType,
      releaseDate: form.releaseDate,
      statusOverride: form.statusOverride === "" ? null : form.statusOverride,
      rentalPrice: Number(form.rentalPrice),
      totalCopies: Number(form.totalCopies),
      rentedCopies: Number(form.rentedCopies),
      available: form.available,
      imageUrl: form.imageUrl,
      synopsis: form.synopsis.trim(),
      cast: form.cast.trim(),
      notes: form.notes.trim(),
    };

    if (mode === "create") {
      const created = addTitle(input);
      router.push(`/titles/${created.id}`);
    } else if (existingTitle) {
      updateTitle(existingTitle.id, input);
      router.push(`/titles/${existingTitle.id}`);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-navy-900">
        {mode === "create" ? "タイトルの新規登録" : "タイトルの編集"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 rounded-lg border border-gray-200 bg-white p-6"
      >
        <FormSection title="基本情報" description="タイトルを識別するための情報です">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="タイトル名" error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="発売日" error={errors.releaseDate}>
              <input
                type="date"
                value={form.releaseDate}
                onChange={(e) => update("releaseDate", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="ジャンル">
              <select
                value={form.genre}
                onChange={(e) => update("genre", e.target.value as Genre)}
                className={inputClass}
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="メディア種別">
              <select
                value={form.mediaType}
                onChange={(e) => update("mediaType", e.target.value as MediaType)}
                className={inputClass}
              >
                {MEDIA_TYPES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="ステータス手動指定"
              hint="通常は発売日から自動計算。例外時のみ指定"
            >
              <select
                value={form.statusOverride}
                onChange={(e) =>
                  update("statusOverride", e.target.value as ReleaseStatus | "")
                }
                className={inputClass}
              >
                <option value="">自動計算</option>
                {RELEASE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}に固定
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>

        <FormSection title="レンタル情報" description="料金・在庫・取扱可否を管理します">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="レンタル料金(円)" error={errors.rentalPrice}>
              <input
                type="number"
                value={form.rentalPrice}
                onChange={(e) => update("rentalPrice", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="総コピー数" error={errors.totalCopies}>
              <input
                type="number"
                value={form.totalCopies}
                onChange={(e) => update("totalCopies", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="貸出中数" error={errors.rentedCopies}>
              <input
                type="number"
                value={form.rentedCopies}
                onChange={(e) => update("rentedCopies", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => update("available", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-navy-700"
            />
            取扱中にする
          </label>
        </FormSection>

        <FormSection title="表示情報" description="一覧・詳細・店頭で見せる情報です">
          <div className="flex items-center gap-4">
            <TitleImage
              imageUrl={form.imageUrl}
              genre={form.genre}
              alt="パッケージ画像プレビュー"
              className="h-24 w-24 shrink-0 rounded-lg text-4xl"
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-navy-700">
                パッケージ画像
              </span>
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
            <Field label="あらすじ">
              <textarea
                value={form.synopsis}
                onChange={(e) => update("synopsis", e.target.value)}
                rows={3}
                className={inputClass}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="その他">
          <div className="flex flex-col gap-4">
            <Field label="出演者/監督">
              <input
                type="text"
                value={form.cast}
                onChange={(e) => update("cast", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="備考">
              <textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                rows={2}
                className={inputClass}
              />
            </Field>
          </div>
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
              mode === "edit" && existingTitle ? `/titles/${existingTitle.id}` : "/"
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
