import { PublishStatus } from "@/lib/types";

const STYLES: Record<PublishStatus, string> = {
  販売中: "bg-emerald-100 text-emerald-700",
  予約受付中: "bg-sky-100 text-sky-700",
  取扱終了: "bg-gray-100 text-gray-500",
};

const DOT: Record<PublishStatus, string> = {
  販売中: "bg-emerald-500",
  予約受付中: "bg-sky-500",
  取扱終了: "bg-gray-400",
};

export default function PublishStatusBadge({ status }: { status: PublishStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STYLES[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]}`} />
      {status}
    </span>
  );
}
