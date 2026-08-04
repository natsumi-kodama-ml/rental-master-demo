import { GENRES, RELEASE_STATUSES } from "@/lib/types";

interface TitleFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  genre: string;
  onGenreChange: (value: string) => void;
  releaseStatus: string;
  onReleaseStatusChange: (value: string) => void;
  availability: string;
  onAvailabilityChange: (value: string) => void;
}

export default function TitleFilters({
  search,
  onSearchChange,
  genre,
  onGenreChange,
  releaseStatus,
  onReleaseStatusChange,
  availability,
  onAvailabilityChange,
}: TitleFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="search" className="text-xs font-medium text-gray-600">
          検索(タイトル名)
        </label>
        <input
          id="search"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="例: 宇宙漂流記"
          className="w-56 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-navy-600 focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="genre" className="text-xs font-medium text-gray-600">
          ジャンル
        </label>
        <select
          id="genre"
          value={genre}
          onChange={(e) => onGenreChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-navy-600 focus:outline-none"
        >
          <option value="all">すべて</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="releaseStatus" className="text-xs font-medium text-gray-600">
          新作/準新作/旧作
        </label>
        <select
          id="releaseStatus"
          value={releaseStatus}
          onChange={(e) => onReleaseStatusChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-navy-600 focus:outline-none"
        >
          <option value="all">すべて</option>
          {RELEASE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="availability" className="text-xs font-medium text-gray-600">
          取扱状態
        </label>
        <select
          id="availability"
          value={availability}
          onChange={(e) => onAvailabilityChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-navy-600 focus:outline-none"
        >
          <option value="all">すべて</option>
          <option value="available">取扱中</option>
          <option value="unavailable">取扱終了</option>
        </select>
      </div>
    </div>
  );
}
