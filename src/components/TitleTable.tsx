import Link from "next/link";
import { Title, computeReleaseStatus } from "@/lib/types";
import ReleaseStatusPill from "./ReleaseStatusPill";
import AvailabilityBadge from "./AvailabilityBadge";

export default function TitleTable({ titles }: { titles: Title[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full min-w-[720px] divide-y divide-gray-200 text-sm">
        <thead className="bg-navy-50">
          <tr>
            <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-navy-700">
              タイトル名
            </th>
            <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-navy-700">
              ジャンル
            </th>
            <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-navy-700">
              メディア
            </th>
            <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-navy-700">
              ステータス
            </th>
            <th className="whitespace-nowrap px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-navy-700">
              在庫(在庫中/総数)
            </th>
            <th className="whitespace-nowrap px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-navy-700">
              レンタル料金
            </th>
            <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-navy-700">
              取扱状態
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {titles.map((t) => {
            const inStock = t.totalCopies - t.rentedCopies;
            return (
              <tr key={t.id} className="hover:bg-navy-50/40">
                <td className="whitespace-nowrap px-4 py-2">
                  <Link
                    href={`/titles/${t.id}`}
                    className="font-medium text-navy-700 hover:underline"
                  >
                    {t.name}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-600">
                  {t.genre}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-600">
                  {t.mediaType}
                </td>
                <td className="whitespace-nowrap px-4 py-2">
                  <ReleaseStatusPill
                    status={computeReleaseStatus(t.releaseDate, t.statusOverride)}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-right text-gray-800">
                  {inStock} / {t.totalCopies}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-right text-gray-800">
                  ¥{t.rentalPrice.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-4 py-2">
                  <AvailabilityBadge available={t.available} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
