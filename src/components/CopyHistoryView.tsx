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

export default function CopyHistoryView({ copyId }: { copyId: string }) {
  const router = useRouter();
  const { getProduct } = useProducts();
  const { getCopy } = useCopies();
  const { getLogsForCopy } = useRentalLogs();

  const copy = getCopy(copyId);
  const product = copy ? getProduct(copy.productId) : undefined;
  const logs = getLogsForCopy(copyId);

  if (!copy) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">個体が見つかりませんでした。</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-fit text-sm text-navy-700 hover:underline"
        >
          ← 戻る
        </button>
      </div>
    );
  }

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
        <h1 className="text-xl font-bold text-navy-900">{copy.copyCode} の貸出履歴</h1>
        <p className="mt-1 text-sm text-gray-500">
          {product ? product.name : "-"} ・ 状態: {copy.status}
          {copy.condition && ` ・ コンディション: ${copy.condition}`}
        </p>

        {logs.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">貸出履歴がありません。</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="bg-navy-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">会員ID</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">状態</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">貸出日</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">返却予定日</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">返却日</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-3 py-2 text-navy-700">
                      <Link
                        href={`/members/${encodeURIComponent(log.memberId)}`}
                        className="font-medium hover:underline"
                      >
                        {log.memberId}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      {log.returnedAt ? (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                          返却済み
                        </span>
                      ) : isOverdue(log.dueDate) ? (
                        <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-600">
                          貸出中(延滞)
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gold-400 px-2.5 py-0.5 text-xs font-semibold text-navy-900">
                          貸出中
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-600">{formatDateOnly(log.rentedAt)}</td>
                    <td className="px-3 py-2 text-gray-600">
                      {formatDateOnly(log.dueDate)}
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {log.returnedAt ? formatDateOnly(log.returnedAt) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
