"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTitles } from "@/hooks/useTitles";
import { computeReleaseStatus } from "@/lib/types";
import ReleaseStatusPill from "./ReleaseStatusPill";
import AvailabilityBadge from "./AvailabilityBadge";
import TitleImage from "./TitleImage";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(iso: string) {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function TitleDetailView({ titleId }: { titleId: string }) {
  const router = useRouter();
  const { getTitle, deleteTitle } = useTitles();
  const title = getTitle(titleId);

  if (!title) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">タイトルが見つかりませんでした。</p>
        <Link href="/" className="text-sm text-navy-700 hover:underline">
          一覧に戻る
        </Link>
      </div>
    );
  }

  function handleDelete() {
    if (!title) return;
    const confirmed = window.confirm(
      `「${title.name}」を削除します。この操作は取り消せません。よろしいですか？`
    );
    if (!confirmed) return;
    deleteTitle(title.id);
    router.push("/");
  }

  const inStock = title.totalCopies - title.rentedCopies;
  const status = computeReleaseStatus(title.releaseDate, title.statusOverride);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/" className="text-sm font-medium text-navy-700 hover:underline">
        ← 一覧に戻る
      </Link>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <TitleImage
              imageUrl={title.imageUrl}
              genre={title.genre}
              alt={title.name}
              className="h-24 w-24 shrink-0 rounded-lg text-4xl"
            />
            <div>
              <h1 className="text-xl font-bold text-navy-900">{title.name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {title.genre} ・ {title.mediaType}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <ReleaseStatusPill status={status} />
                {title.statusOverride && (
                  <span className="text-xs text-gray-400">(手動指定)</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AvailabilityBadge available={title.available} />
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-500 transition hover:bg-rose-50"
            >
              削除
            </button>
            <Link
              href={`/titles/${title.id}/edit`}
              className="rounded-full bg-gold-400 px-5 py-2.5 text-sm font-bold text-navy-900 shadow-md transition hover:bg-gold-500"
            >
              編集
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="レンタル料金" value={`¥${title.rentalPrice.toLocaleString()}`} />
          <Stat label="在庫(在庫中/総数)" value={`${inStock} / ${title.totalCopies}`} />
          <Stat label="貸出中数" value={String(title.rentedCopies)} />
          <Stat label="発売日" value={formatDateOnly(title.releaseDate)} />
        </div>

        <dl className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-6 text-sm">
          <div>
            <dt className="font-medium text-gray-600">あらすじ</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-800">
              {title.synopsis || "(未入力)"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-600">出演者/監督</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-800">
              {title.cast || "(未入力)"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-600">備考</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-800">
              {title.notes || "(なし)"}
            </dd>
          </div>
          <div className="flex gap-8">
            <div>
              <dt className="font-medium text-gray-600">登録日</dt>
              <dd className="mt-1 text-gray-800">{formatDate(title.createdAt)}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">更新日</dt>
              <dd className="mt-1 text-gray-800">{formatDate(title.updatedAt)}</dd>
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
