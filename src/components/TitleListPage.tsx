"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTitles } from "@/hooks/useTitles";
import { computeReleaseStatus } from "@/lib/types";
import TitleFilters from "./TitleFilters";
import TitleTable from "./TitleTable";

export default function TitleListPage() {
  const { titles } = useTitles();
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("all");
  const [releaseStatus, setReleaseStatus] = useState("all");
  const [availability, setAvailability] = useState("all");

  const filteredTitles = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return titles.filter((t) => {
      const matchesKeyword =
        keyword === "" || t.name.toLowerCase().includes(keyword);
      const matchesGenre = genre === "all" || t.genre === genre;
      const matchesReleaseStatus =
        releaseStatus === "all" ||
        computeReleaseStatus(t.releaseDate, t.statusOverride) === releaseStatus;
      const matchesAvailability =
        availability === "all" ||
        (availability === "available" && t.available) ||
        (availability === "unavailable" && !t.available);
      return (
        matchesKeyword && matchesGenre && matchesReleaseStatus && matchesAvailability
      );
    });
  }, [titles, search, genre, releaseStatus, availability]);

  const isFiltered =
    search.trim() !== "" ||
    genre !== "all" ||
    releaseStatus !== "all" ||
    availability !== "all";

  function resetFilters() {
    setSearch("");
    setGenre("all");
    setReleaseStatus("all");
    setAvailability("all");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">
          レンタル商品マスタ
        </h1>
        <Link
          href="/titles/new"
          className="rounded-full bg-gold-400 px-5 py-2.5 text-sm font-bold text-navy-900 shadow-md transition hover:bg-gold-500"
        >
          + 新規登録
        </Link>
      </div>

      <TitleFilters
        search={search}
        onSearchChange={setSearch}
        genre={genre}
        onGenreChange={setGenre}
        releaseStatus={releaseStatus}
        onReleaseStatusChange={setReleaseStatus}
        availability={availability}
        onAvailabilityChange={setAvailability}
      />

      <p className="text-xs text-gray-400">{filteredTitles.length}件表示中</p>

      {filteredTitles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            条件に一致するタイトルがありません
          </p>
          {isFiltered && (
            <>
              <p className="text-xs text-gray-400">
                キーワードや絞り込み条件を見直してみてください
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full bg-gold-400 px-4 py-2 text-xs font-bold text-navy-900 shadow-sm transition hover:bg-gold-500"
              >
                絞り込みをリセット
              </button>
            </>
          )}
        </div>
      ) : (
        <TitleTable titles={filteredTitles} />
      )}
    </div>
  );
}
