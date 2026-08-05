import { CATEGORIES, PUBLISH_STATUSES } from "@/lib/types";

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  genre: string;
  onGenreChange: (value: string) => void;
  genreOptions: string[];
  publishStatus: string;
  onPublishStatusChange: (value: string) => void;
}

export default function ProductFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  genre,
  onGenreChange,
  genreOptions,
  publishStatus,
  onPublishStatusChange,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="search" className="text-xs font-medium text-gray-600">
          検索(商品名・JANコード・個体番号)
        </label>
        <input
          id="search"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="バーコードスキャナーでも入力できます"
          className="w-64 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-navy-600 focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-xs font-medium text-gray-600">
          カテゴリ
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-navy-600 focus:outline-none"
        >
          <option value="all">すべて</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
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
          {genreOptions.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="publishStatus" className="text-xs font-medium text-gray-600">
          公開状態
        </label>
        <select
          id="publishStatus"
          value={publishStatus}
          onChange={(e) => onPublishStatusChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-navy-600 focus:outline-none"
        >
          <option value="active">取扱終了を除く</option>
          <option value="all">すべて(取扱終了を含む)</option>
          {PUBLISH_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
