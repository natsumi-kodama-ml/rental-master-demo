import { DealType, PublishStatus, isRentalDealType } from "@/lib/types";

const STYLES: Record<PublishStatus, string> = {
  予約受付中: "bg-sky-100 text-sky-700",
  発売前入荷: "bg-amber-100 text-amber-700",
  販売中: "bg-emerald-100 text-emerald-700",
  取扱終了: "bg-gray-100 text-gray-500",
};

const DOT: Record<PublishStatus, string> = {
  予約受付中: "bg-sky-500",
  発売前入荷: "bg-amber-500",
  販売中: "bg-emerald-500",
  取扱終了: "bg-gray-400",
};

// 値そのものは新品/中古/レンタル共通の"販売中"のままだが、レンタル品では
// 「販売」ではないため表示上だけ「レンタル中」に出し分ける。
function displayLabel(status: PublishStatus, dealType?: DealType): string {
  if (status === "販売中" && dealType && isRentalDealType(dealType)) {
    return "レンタル中";
  }
  return status;
}

export default function PublishStatusBadge({
  status,
  dealType,
}: {
  status: PublishStatus;
  dealType?: DealType;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STYLES[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]}`} />
      {displayLabel(status, dealType)}
    </span>
  );
}
