"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { useCopies } from "@/hooks/useCopies";
import { useRentalLogs } from "@/hooks/useRentalLogs";

function formatDateOnly(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function isOverdue(dueDate: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate).getTime() < Date.now();
}

export default function MemberHistoryView({ memberId }: { memberId: string }) {
  const router = useRouter();
  const { getProduct } = useProducts();
  const { getCopy } = useCopies();
  const { getLogsForMember } = useRentalLogs();

  const logs = getLogsForMember(memberId);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="w-fit text-sm font-medium text-navy-700 hover:underline"
      >
        ← 戻る
      </button>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="text-xl font-bold text-navy-900">会員 {memberId} の貸出履歴</h1>

        {logs.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">貸出履歴がありません。</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-navy-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">商品</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">個体番号</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">貸出日</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">返却予定日</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">返却日</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => {
                  const product = getProduct(log.productId);
                  const copy = getCopy(log.copyId);
                  return (
                    <tr key={log.id}>
                      <td className="px-3 py-2 text-navy-700">
                        {product ? (
                          <Link
                            href={`/products/${product.id}`}
                            className="font-medium hover:underline"
                          >
                            {product.name}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {copy ? (
                          <Link
                            href={`/copies/${copy.id}`}
                            className="text-navy-700 hover:underline"
                          >
                            {copy.copyCode}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {formatDateOnly(log.rentedAt)}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {!log.returnedAt && isOverdue(log.dueDate) ? (
                          <span className="font-semibold text-rose-600">
                            {formatDateOnly(log.dueDate)}(延滞)
                          </span>
                        ) : (
                          formatDateOnly(log.dueDate)
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {log.returnedAt ? formatDateOnly(log.returnedAt) : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
