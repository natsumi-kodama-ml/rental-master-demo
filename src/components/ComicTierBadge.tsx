// コミックは新作/準新作/旧作の区別がなく全巻一律料金。それでも販売(新品/中古/
// レンタル落ち)とは違いレンタル料金区分は存在するため、"-"ではなく専用バッジで示す。
// 旧作・シングルと同じ「一律料金」の色にして、新作のような段階制ではないことを表す。
export default function ComicTierBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
      コミック
    </span>
  );
}
